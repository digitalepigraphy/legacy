function DEATerminal(user_id) {
	this.user_id=null;
	if(typeof user_id !== 'undefined')
		this.user_id=user_id;
	this.ws=null;
	this.jobs=new Array();
	this.addJobEnabled = false;
	this.port=0;
	this.receivingJob=null;
	this.receivingFileElementId=-2; // -2 for uninitialized, -1 for job-wide process
	this.currentProcess=null;
	this.fileIdRequestQueue=new Array();
	this.uploadingJobElementId=-1;
	this.allowDragAndDrop=false;
	this.jobsToLoad=null; // Queue containing existing jobs for a loaded user
	
	this.updateUser();
}

DEATerminal.prototype.updateUser = function() {
	if (this.user_id != null) {
		var path_user = this.PATH_IMP+'/'+this.user_id+'/';
		this.PATH_RAW = path_user + 'raw/';
		this.PATH_IMAGES = path_user + 'images/';
		this.PATH_THUMBNAILS = path_user + 'thumbnails/';
		this.PATH_HEIGHTMAPS = path_user + 'heightmaps/';
		
		// Display user ID
		var userIdDiv = document.getElementById('user-id');
		userIdDiv.innerHTML = 'User: ' + this.user_id;
		userIdDiv.innerHTML += ' <div class="logout" onclick="logout();">Logout</div>';
	}
};

DEATerminal.prototype.updateUIEnables = function() {
	this.setAddJobEnabled();
	this.setJobProcessEnabled();
	this.setJobDeleteEnabled();
};

// Enabled the "Add job" button if there are no empty jobs displayed
DEATerminal.prototype.setAddJobEnabled = function() {
	// Check if there are any empty jobs
	var jobs_container = document.getElementById('jobs_container');
	var drop_zone_container_array = new Array();
	var k = 0;
	for (var i = 0; i < jobs_container.childNodes.length; i++) {
		var child = jobs_container.childNodes[i];
		if (child.className.indexOf('drop_zone_container') >= 0) {
			drop_zone_container_array[k] = child;
			k++;
		}
	}
	// Assume all drop zone containers have no full drop zones. Then decrement
	// from this value all drop zone containers that have full drop zones.
	var empty_drop_zone_containers = drop_zone_container_array.length;
	for (var i = 0; i < drop_zone_container_array.length; i++) {
		var drop_zone_container = drop_zone_container_array[i];
container_loop: for (var j = 0; j < drop_zone_container.childNodes.length; j++) {
			var drop_zone_pair = drop_zone_container.childNodes[j];
			for (var k = 0; k < drop_zone_pair.childNodes.length; k++) {
				var drop_zone = drop_zone_pair.childNodes[k];
				if (drop_zone.className.indexOf('raw_drop_zone') >= 0 || drop_zone.className.indexOf('processed_drop_zone') >= 0) {
					empty_drop_zone_containers--;
					break container_loop;
				}
			}
		}
	}
	var enabled = drop_zone_container_array.length == 0 || !(empty_drop_zone_containers > 0);
	this.addJobEnabled = enabled;
	var button = document.getElementById('add_job_button');
	if (enabled) {
		button.removeAttribute('disabled');
	} else {
		button.setAttribute('disabled', '');
	}
};

DEATerminal.prototype.getImageURL=function(job_idx, file_idx, extension)
{
	var job = this.findJobByElementId(job_idx);
	if (job != null) {		
		var image_selector = file_idx+1;
		var image_selector_string = ''+image_selector;
		if (image_selector < 10) {
			image_selector_string = '0'+image_selector_string;
		}
		return this.PATH_IMAGES + job.id + '_' + image_selector_string + '.' + extension;
	}
};

DEATerminal.prototype.setJobProcessEnabled=function() {
	for (var job_idx = 0; job_idx < this.jobs.length; job_idx++) {
		var job = this.findJobByElementId(job_idx);
		if (job != null) {
			var process_button = document.getElementById('job_process_button_'+job_idx);
			if (job.fileCount() < 1) {
				process_button.style.display = 'none';
			} else {
				process_button.style.display = 'inherit';
			}
		}
	}
};

DEATerminal.prototype.setJobDeleteEnabled=function() {
	for (var job_idx = 0; job_idx < this.jobs.length; job_idx++) {
		var job = this.findJobByElementId(job_idx);
		if (job != null) {
			var delete_button = document.getElementById('job_delete_button_'+job_idx);
			if (job.fileCount() < 1) {
				delete_button.style.display = 'none';
			} else {
				delete_button.style.display = 'inherit';
			}
		}
	}
};

DEATerminal.prototype.startUI=function() {
	document.getElementById('main').style.display = 'block';
	var serverOffline = document.getElementById('server_offline');
	serverOffline.parentNode.removeChild(serverOffline);
};

DEATerminal.prototype.showFileDeleted=function(job_idx, file_idx) {
	var drop_zone_pair = document.getElementById('drop_zone_pair_'+job_idx+'_'+file_idx);
	if (drop_zone_pair != null) {
		drop_zone_pair.parentNode.removeChild(drop_zone_pair);
	}
	this.updateFileCount(job_idx);
};

// Functions for handling server commands

DEATerminal.prototype.onSetUser=function(user_id) {
	this.user_id=user_id;
	// Check existing user cookie
	var savedUserId = getCookie(COOKIE_USER_ID_KEY);
	if (user_id != savedUserId && require_cookies) {
		reloadWithNewUser(user_id);
	} else {
		// Save user cookie
		setCookie(COOKIE_USER_ID_KEY, this.user_id, DEFAULT_COOKIE_LENGTH);
		this.updateUser();
		this.send("LOAD:USER:"+user_id);
	}
};

DEATerminal.prototype.onNewJob=function(job_element_id, job_id) {
	var job=this.findJobByElementId(job_element_id);
	job.setId(job_id);
	job.uploadNextFile();
};

DEATerminal.prototype.onNewUpload=function(job_id, file_element_id) {
	var job=this.findJobById(job_id);
	this.send("SENDING:"+job_id+":"+file_element_id);
	this.uploadingJobElementId = job.element_id;
	job.uploadingFileElementId = file_element_id;
};

DEATerminal.prototype.onCompleteUpload=function(job_id, file_element_id, thumbnail_filename) {
	var job=this.findJobById(job_id);
	if (job != null) {
		// See if any files left in job.
		var file = job.dea_files[file_element_id];
		if (file != null) {
			file.url = this.PATH_THUMBNAILS + thumbnail_filename;
		}
		this.addDropZone(job.element_id, parseInt(file_element_id)+1, true, false);
		this.updateUIEnables();
		if (job.dea_files.length > parseInt(file_element_id)+1) {
			//Upload the next file.
			job.uploadNextFile();
		} else {
			this.hideUploadingOverlay();
		}
		job.uploadingFileElementId = -1;
	}
	this.uploadingJobElementId = -1;
};

DEATerminal.prototype.onFailedUpload=function(job_id, file_element_id) {
	var job=this.findJobById(job_id);
	// See if any files left in job.
	var fileElementId = parseInt(file_element_id) + 1;
	this.addDropZone(job.element_id, fileElementId, false, false);
	this.updateUIEnables();
	if (job.dea_files.length > fileElementId) {
		//Upload the next file.
		job.uploadNextFile();
	} else {
		this.hideUploadingOverlay();
	}
};

DEATerminal.prototype.onDeletedFile=function(job_id, file_element_id) {
	var job = this.findJobById(job_id);
	job.dea_files[file_element_id] = null;
	this.showFileDeleted(job.element_id, file_element_id);
	this.updateUIEnables();
};

DEATerminal.prototype.onSendFile=function(job_id, file_element_id) {
	var job = this.findJobById(job_id);
	if (job != null) {
		var file_idx = parseInt(file_element_id);
		var file = job.dea_files[file_idx];
		if (file != null) {
			this.showUploadStart();
			file.initializeUploading();
			file.uploadNext();
		}
	}
};

DEATerminal.prototype.onContinueUpload=function(job_id, file_element_id) {
	var job = this.findJobById(job_id);
	if (job != null) {
		var file = job.dea_files[file_element_id];
		if (file != null) {
			file.uploadNext();
		}
	}
};

DEATerminal.prototype.onCompleteProcess=function(method, job_id, image_selector) {
	var job = this.findJobById(job_id);
	if (job != null) {
		var file_element_id = image_selector-1;
		this.receivingFileElementId = file_element_id;
		this.receivingJob = job;
		
		if (method == 'SFS' || method == 'FLATD') {
			this.send("SEND:HEIGHTMAP:"+job_id);
		} else if (this.fileIdRequestQueue.length > 0) {
			// We have multiple files to request - do them one at a time
			this.requestNextThumbnail();
		} else { // Only one file, or simple job process
			this.send("SEND:RESULT:"+job_id+":"+(file_element_id+1));	// Add 1 to match image selector on server
		}
	}
};

DEATerminal.prototype.onError=function(message) {
	this.hideProcessWaitingOverlay();
	window.alert('Error on the image processing server. We apologize.\n' + 'Message: "' + message + '"');
};

DEATerminal.prototype.onResult=function(url) {
	this.findResult(url, this.PATH_IMAGES);
};

DEATerminal.prototype.onHeightmap=function(url) {
	this.findResult(url, this.PATH_HEIGHTMAPS);
};

DEATerminal.prototype.onProgress=function(progress, max_progress) {
	var percent_done = 100.0 * progress / max_progress;
	this.setProgressBar(percent_done);
//console.log("Progress: "+progress+"/"+max_progress);
};

DEATerminal.prototype.onCanceledProcess=function(job_id) {
	// TODO more cleanup may be necessary
	this.hideProcessWaitingOverlay();
};

DEATerminal.prototype.onCanceledUpload=function() {
	// Delete all files from current job that haven't been fully uploaded
	var job_idx = this.uploadingJobElementId;
	if (job_idx >= 0) {
		var job = this.findJobByElementId(job_idx);
		if (job != null) {
			var file_idx = job.uploadingFileElementId;
			if (file_idx >= 0) {
				for (var i=job.dea_files.length-1; i>=file_idx; i--) {
					job.dea_files.splice(i);
				}
				
				// Clear last file browse button of files.
				var lastBrowseButton = $('#browse_'+job_idx+'_'+file_idx);
				lastBrowseButton.wrap('<form>').parent('form').trigger('reset');
				lastBrowseButton.unwrap();
				
				var last_drop_zone = this.getDropZone(job_idx, file_idx);
				if (last_drop_zone != null) {
					last_drop_zone.className = last_drop_zone.className.replace(/(?:^|\s)dragover_drop_zone(?!\S)/g , '');
				}
			}
		}
	}
	this.hideUploadingOverlay();
};

DEATerminal.prototype.onCountJobs=function(job_data) {
	// job_data = [job_count(, job_id_0, max_file_element_id_0, job_id_1, max_file_element_id_1, ...)]
	var job_count = job_data[0];
	
	this.jobsToLoad = new Array();
	
	for (var i = 0; i < job_count*2; i+= 2) {
		var job_id = job_data[i+1];
		var max_file_element_id = job_data[i+2];
		this.jobsToLoad.push(job_id);
		this.jobsToLoad.push(max_file_element_id);
	}
	
	this.loadNextJob();
};

// "LOAD:FILE:[job_id]:{OUT|HEIGHTMAP}:[filepath]:[process]
// "LOAD:FILE:[job_id]:[file_element_id]:[filepath]:[name]:[lastModified]:[size]:[type]"
DEATerminal.prototype.onLoadFile=function(tokens) {
	var job_id = tokens[2];
	var file_element_id = tokens[3];
	var filepath = tokens[4];
	if (file_element_id.toUpperCase() == "OUT" || file_element_id.toUpperCase() == "HEIGHTMAP") {
		var process = tokens[5];
	} else {
		var name = tokens[5];
		var lastModified = tokens[6];
		var size = tokens[7];
		var type = tokens[8];
	}
	var job = this.findJobById(job_id);
	if (job != null) {
		var job_idx = job.element_id;
		var self = this;
		if (file_element_id.toUpperCase() == 'OUT') {
			// Receiving out file
			if (filepath != null && filepath.toUpperCase() != 'NULL') {
				var drop_zone = this.getDropZone(job_idx, 'out');
				drop_zone.innerHTML = this.imageMenu(job.element_id, file_idx, true, false);
				var thumbnail_div = document.createElement('div');
				thumbnail_div.id = 'thumbnail_'+job_idx+'_out';
				var thumbnail_img = new Image();
				var path = this.PATH_IMAGES + filepath;
				thumbnail_img.src = path;
				thumbnail_img.onload = function() {
					thumbnail_img = self.resizeImage(thumbnail_img, 80);
					var thumbnail_a = document.createElement('a');
					thumbnail_a.appendChild(thumbnail_img);
					thumbnail_a.href = path;
					thumbnail_a.target = '_blank';
					thumbnail_a.appendChild(thumbnail_img);
					thumbnail_div.appendChild(thumbnail_a);
					drop_zone.appendChild(thumbnail_div);
					drop_zone.style.display = 'inline-block'; // Unhide drop zone
				};
				if (process.toUpperCase() != 'NULL') {
					document.getElementById('process_name_out_'+job.element_id).innerHTML = '[' + process + ']';
				}
			}
			this.loadNextJob();
		} else if (file_element_id.toUpperCase() == 'HEIGHTMAP') {
			// Receiving height map file
			if (filepath != null && filepath.toUpperCase() != 'NULL') {
				var drop_zone = this.getDropZone(job_idx, 'heightmap');
				drop_zone.innerHTML = this.imageMenu(job.element_id, file_idx, true, true);
				var thumbnail_div = document.createElement('div');
				thumbnail_div.id = 'thumbnail_'+job_idx+'_heightmap';
				var thumbnail_img = new Image();
				var path = this.PATH_HEIGHTMAPS + filepath;
				thumbnail_img.src = this.cacheBust(path);
				thumbnail_img.onload = function() {
					thumbnail_img = self.resizeImage(thumbnail_img, 80);
					var thumbnail_a = document.createElement('a');
					thumbnail_a.appendChild(thumbnail_img);
					thumbnail_a.href = path;
					thumbnail_a.target = '_blank';
					thumbnail_a.appendChild(thumbnail_img);
					thumbnail_div.appendChild(thumbnail_a);
					drop_zone.appendChild(thumbnail_div);
					drop_zone.style.display = 'inline-block'; // Unhide drop zone
				};
				if (process.toUpperCase() != 'NULL') {
					document.getElementById('process_name_heightmap_'+job.element_id).innerHTML = '[' + process + ']';
				}
			}
			// Request out file
			this.loadFile(job_id, 'OUT');
		} else 
		if (file_element_id <= job.max_existing_file_element_id) {
			if (filepath.toUpperCase() == 'NULL') {
				job.addExistingFile(null);
				
				// Increment file index of last drop zone
				var file_idx = parseInt(file_element_id);
				var lastDropZone = this.getDropZone(job.element_id, file_idx);
				lastDropZone.id = 'drop_zone_'+job.element_id+'_'+(file_idx+1);
				var lastDropZonePair = document.getElementById('drop_zone_pair_'+job.element_id+'_'+file_idx);
				lastDropZonePair.id = 'drop_zone_pair_'+job.element_id+'_'+(file_idx+1);
				var lastFileBrowse = document.getElementById('browse_'+job.element_id+'_'+file_idx);
				lastFileBrowse.id = 'browse_'+job.element_id+'_'+(file_idx+1);
			} else {
				var file_selector = parseInt(file_element_id)+1;
				if (file_element_id < 10) {
					file_selector = '0' + file_selector;
				}
				var url = this.PATH_THUMBNAILS + '/' + job_id + '_' + file_selector + '.thmb.png';
				job.addExistingFile(name, url, lastModified, size, type);
				this.addDropZone(job.element_id, parseInt(file_element_id)+1, true);
			}
			
			if (file_element_id < 0 || file_element_id >= job.max_existing_file_element_id) {
				// Request height map file
				this.loadFile(job_id, 'HEIGHTMAP');
			} else {
				// Load next file in job
				this.loadFile(job_id, parseInt(file_element_id)+1);
			}
		} else {
			this.loadNextJob();
		}
	} else {
		this.loadNextJob();
	}
	this.updateUIEnables();
};

// Standard WebSocket functions

DEATerminal.prototype.onopen=function(e) {
	if(this.user_id!=null) this.send("USER:"+this.user_id);
	else this.send("NEW:USER");
	this.startUI();
};
DEATerminal.prototype.onmessage=function(e) {
	var self = this;
	if (e.data instanceof ArrayBuffer) {
		log_blue("Recv [ArrayBuffer]");
		if (this.receivingJob != null) {
			var job = this.receivingJob;
			var file_idx, file=null;
			if (this.receivingFileElementId == -1) {
				// Job-wide process
				file_idx = 'out';
				for (var i = 0; i < job.dea_files.length; i++) {
					if (job.dea_files[i] != null) {
						file = jQuery.extend({},job.dea_files[i]);	// Clone the first non-null file in the job
						job.out_file = file;
						break;
					}
				}
			} else {
				// Single-image process
				file_idx = this.receivingFileElementId;
				file = job.dea_files[file_idx];
			}
			
			if (file != null) {
				var binary_data = '';
				var bytes = new Uint8Array(e.data);
				var byte_length = bytes.byteLength;
				for (var i = 0; i < byte_length; i++) {
					binary_data += String.fromCharCode(bytes[i]);
				}
				var base64_data = window.btoa(binary_data);
				
				var mime_type = null;
				switch(file.format) {
					case "JPEG":
						mime_type = "image/jpeg";
						break;
					case "GIF":
						mime_type = "image/gif";
						break;
					case "BMP":
						mime_type = "image/bmp";
						break;
					case "PNG":
						mime_type = "image/png";
						break;
					case "TIFF":
						mime_type = "image/tiff";
						break;
				}
				if (mime_type != null) {
					var data_url = "data:"+mime_type+";base64,"+base64_data;
					var recv_img = new Image();
					recv_img.src = data_url;
					recv_img.onload=function(){
						var job_idx = job.element_id;
						var thumbnail_path;
						if (file_idx != 'out') {
							var file_idx_string = file_idx+1;
							if (file_idx_string < 10) file_idx_string = '0' + file_idx_string;
							thumbnail_path = self.PATH_THUMBNAILS+job.id+'_'+file_idx_string+'.thmb.png'
						} else {
							thumbnail_path = thumbnail_path = self.PATH_IMAGES+job.id+'_out.png'
						}
						var drop_zone = self.getDropZone(job_idx, file_idx);
						drop_zone.innerHTML = self.imageMenu(job.element_id, file_idx, true, false);
						var thumbnail_div = document.getElementById('thumbnail_'+job_idx+'_'+file_idx);
						var thumbnail_img = new Image();
						thumbnail_img.src = self.cacheBust(thumbnail_path);
						thumbnail_img = self.resizeImage(thumbnail_img, 80);
						//thumbnail_img.setAttribute('onclick', 'openFile('+job_idx+',\''+file_idx+'\',false,true)');
						var thumbnail_a = document.createElement('a');
						thumbnail_a.appendChild(thumbnail_img);
						thumbnail_a.href = self.cacheBust(thumbnail_path);
						thumbnail_a.target = '_blank';
						thumbnail_div.appendChild(thumbnail_a);
						
						drop_zone.className = drop_zone.className.replace(/(?:^|\s)empty_drop_zone(?!\S)/g , '');
						drop_zone.className = drop_zone.className.replace(/(?:^|\s)processed_drop_zone(?!\S)/g , '');
						if (self.currentProcess.name != 'raw') {
							drop_zone.className += ' processed_drop_zone';
						}
						drop_zone.style.removeProperty('background-color');
						
						if (file_idx == 'out') {
							drop_zone.style.display = 'block';
						}
						
						if (self.fileIdRequestQueue.length > 0) { // Still more files to request
							self.requestNextThumbnail();
						}
						else {
							self.hideProcessWaitingOverlay();
							self.updateFileCount(job_idx);
						}
					};
				}
			}
		}
	} else if (e.data instanceof Blob) {
		log_blue("WARNING Recv [Blob]"); // Should not ever happen since binary type is "arraybuffer"
	}
	else {
		log_blue("Recv: " + e.data);
		// A double colon should be interpreted as a literal colon
		var tokens = new Array();
		var nextToken = "";
		for (var i = 0; i < e.data.length; i++) {
			var c = e.data.charAt(i);
			if (c == ':') {
				if (i+1 < e.data.length && e.data.charAt(i+1) == ':') {
					i++;
					nextToken += c;
				}
				else {
					tokens[tokens.length] = nextToken;
					nextToken = "";
				}
			}
			else {
				nextToken += c;
				if (i+1 == e.data.length) {
					tokens[tokens.length] = nextToken;
					nextToken = "";
				}
			}
		}
		
		if(tokens[0]=="SET") {
			if(tokens[1]=="USER") {	// "SET:USER:[user_id]"
				this.onSetUser(tokens[2]);
			}
		} else if(tokens[0]=="NEW") {
			if(tokens[1]=="JOB") { // "NEW:JOB:[job_element_id]:[job_id]"
				this.onNewJob(tokens[2], tokens[3]);
			}
			else if(tokens[1]=="UPLOAD") { // "NEW:UPLOAD:[job_index]:[file_element_id]"
				this.onNewUpload(tokens[2], tokens[3]);
			}
		} else if(tokens[0]=="COMPLETE") {
			if(tokens[1]=="UPLOAD") { // "COMPLETE:UPLOAD:[job_id]:[file_element_id]:[thumbnail_filename]"
				this.onCompleteUpload(tokens[2], tokens[3], tokens[4]);
			}
			else if(tokens[1]=="PROCESS") { // "COMPLETE:PROCESS:[method]:[job_id]:[file_index]"
				this.onCompleteProcess(tokens[2], tokens[3], tokens[4]);
			}
		} else if(tokens[0]=="FAILED") {
			if(tokens[1]=="UPLOAD") { // "FAILED:UPLOAD:[job_id]:[file_element_id]"
				this.onFailedUpload(tokens[2], tokens[3]);
			}
		} else if(tokens[0]=="DELETED") {
			if(tokens[1]=="FILE") { // "DELETED:FILE:[job_id]:[file_element_id]"
				this.onDeletedFile(tokens[2], tokens[3]);
			}
		} else if(tokens[0]=="SEND") {
			if(tokens[1]=="FILE") { // "SEND:FILE:[job_id]:[file_element_id]"
				this.onSendFile(tokens[2], tokens[3]);
			}
		} else if(tokens[0]=="NOTFOUND") {
			if(tokens[1]=="JOB") { // "NOTFOUND:JOB:[job_id]"
				window.alert("ERROR: Job not found on server.");
			} else if(tokens[1]=="FILE") {	// "NOTFOUND:FILE:[job_id]:[file_id]"
				window.alert("ERROR: File not found on server.");
			}
		} else if(tokens[0]=="ERROR") { // "ERROR":[message]
			this.onError(tokens[1]);
		} else if(tokens[0]=="RESULT") { // "RESULT:[filename]"
			this.onResult(tokens[1]);
		} else if(tokens[0]=="HEIGHTMAP") { // "HEIGHTMAP:[filename]"
			this.onHeightmap(tokens[1]);
		} else if(tokens[0]=="PROGRESS") {	// "PROGRESS:[progress]:[max_progress]"
			this.onProgress(tokens[1], tokens[2]);
		} else if(tokens[0]=="CANCELED") {
			if(tokens[1]=="PROCESS") {	// "CANCELED:PROCESS:[job_id]"
				this.onCanceledProcess(tokens[2]);
			} else if(tokens[1]=="UPLOAD") { // "CANCELED:UPLOAD"
				this.onCanceledUpload();
			}
		} else if(tokens[0]=="CONTINUE") { // "CONTINUE:UPLOAD:[job_id]:[file_element_id]"
			this.onContinueUpload(tokens[2], tokens[3]);
		} else if(tokens[0]=="COUNT") {
			if(tokens[1]=="JOBS") {	// "COUNT:JOBS:[job_count]{(:[job_id]:[max_file_element_id])...}"
				this.onCountJobs(tokens.slice(2));
			}
		} else if(tokens[0]=="LOAD") {
			if(tokens[1]=="FILE") { // "LOAD:FILE:[job_id]:[file_element_id]:[filepath]:[name]:[lastModified]:[size]:[type]"
				this.onLoadFile(tokens);
			}
		}
	}
};
DEATerminal.prototype.onclose=function(){};
DEATerminal.prototype.onerror=function(){};

DEATerminal.prototype.connect=function() {
	var self=this;
	this.ws = new WebSocket(this.WS_ADDR);//+this.port);
	this.ws.binaryType = "arraybuffer";
	this.ws.onopen = function(e) {self.onopen(e);};
    this.ws.onmessage = function(e) {self.onmessage(e);};
    this.ws.onclose = function() { self.onclose(); self.ws = null;};
	this.ws.onerror = function() {self.onerror();};
};

DEATerminal.prototype.send=function(data) {
	if(this.ws!=null) {
		if (!(data instanceof ArrayBuffer)) {
			log_red("Send: " + data);
		}
		this.ws.send(data);
	}
};

DEATerminal.prototype.disconnect=function() {
	if(this.ws!=null) {
		this.ws.close();
		this.ws=null;
	}
};

// Job and File utility functions

DEATerminal.prototype.findJobByElementId=function(element_id) {
	var found=-1;
	for(var i=0;found==-1 && i<this.jobs.length;i++) {
		if(this.jobs[i] != null && this.jobs[i].element_id==element_id)
			found=i;
	}
	return this.jobs[found];
};

DEATerminal.prototype.findJobById=function(id) {
	var found=-1;;
	for(var i=0;found==-1 && i<this.jobs.length;i++) {
		if(this.jobs[i] != null && this.jobs[i].id==id)
			found=i;
	}
	return this.jobs[found];
};

DEATerminal.prototype.requestNewJob=function(element_id) {
	var job=new DEAJob(this);
	job.element_id=element_id;
	this.jobs[element_id]=job;
	this.send("NEW:JOB:"+element_id);
	return job;
};

DEATerminal.prototype.loadNextJob=function() {
	if (this.jobsToLoad.length > 1) {
		var job_id = this.jobsToLoad.shift();
		var num_files_in_job = parseInt(this.jobsToLoad.shift());
		
		var job;
		var job_idx = this.jobs.length;
		var file_idx;
		
		if (num_files_in_job > 0) {
			// Create an empty drop zone container, unless we already have one.
			// We will only have one already if this is the first job we load,
			// and it will always start out empty.
			if (this.getDropZoneContainer(job_idx) == null) {
				this.setAddJobEnabled();
				this.addDropZoneContainer();
			}
			
			job = new DEAJob(this);
			job.element_id = job_idx;
			job.id = job_id;
			job.max_existing_file_element_id = num_files_in_job - 1;
			file_idx = 0;
			this.jobs[job_idx] = job;
			this.receivingJob = job;
			this.loadFile(job_id, file_idx);
		} else {
			job = null;
			file_idx = -1;
			this.jobs[job_idx] = job;
			this.loadNextJob();
		}
	} 
};

// Request info to load an existing job
DEATerminal.prototype.loadFile=function(job_id, file_element_id) {
	this.send("LOAD:FILE:"+job_id+":"+file_element_id);
};

DEATerminal.prototype.pluralSuffix=function(num, suffix) {
	// Returns an 's' if num is not equal to 1, or a '' otherwise.
	return (num == 1 ? '' : suffix);
};

DEATerminal.prototype.updateFileCount=function(job_idx) {
	var job = this.findJobByElementId(job_idx);
	if (job != null) {
		var file_count = job.fileCount();
		var file_count_div = document.getElementById('file_count_'+job_idx);
		if (file_count == 0) {
			file_count_div.innerHTML = '';
		}
		else {
			file_count_div.innerHTML = file_count + ' file' + this.pluralSuffix(file_count, 's');
		}
	}
};

DEATerminal.prototype.shortenFilename=function(filename,length) {
	// Cut off file extension
	var lastDotIndex = filename.lastIndexOf('.');
	if (lastDotIndex != -1) {
		filename = filename.substring(0,lastDotIndex);
	}
	if (filename.length <= length) {
		return filename;
	}
	else {
		return filename.substring(0,length-3) + '...';
	}
};

DEATerminal.prototype.deleteFile=function(job_idx, file_idx) {
	var job = this.findJobByElementId(job_idx);
	var file = job.dea_files[file_idx];
	if (file != null) {
		// Confirm delete
		if (confirm('Delete file "'+file.name+'"?\nThis cannot be undone.')) {
			this.send('DELETE:FILE:'+job.id+':'+file.element_id);
			log('Job ' + job_idx + ', File ' + file_idx + ' deleted.');
		}
	}
};

DEATerminal.prototype.deleteJob=function(job_idx) {
	if (confirm('Delete Job '+job_idx+'?\nThis cannot be undone.')) {
		if (this.jobs[job_idx] != null) {
			var job = this.findJobByElementId(job_idx);
			this.send('DELETE:JOB:'+job.id);
		}
			
		var drop_zone_container = this.getDropZoneContainer(job_idx);
		if (drop_zone_container != null) {
			drop_zone_container.parentNode.removeChild(drop_zone_container);
		}
		this.jobs[job_idx] = null;
		
		log('Job ' + job_idx + ' deleted.');
		this.setAddJobEnabled();
	}
};

DEATerminal.prototype.imageProcess=function(job_idx, file_idx) {
	this.createImageProcessForm(job_idx, file_idx);
	$('#process-form-modal').trigger('openModal');
};

DEATerminal.prototype.jobProcess=function(job_idx) {
	this.createJobProcessForm(job_idx);
	$('#process-form-modal').trigger('openModal');
};

DEATerminal.prototype.openFile=function(job_idx, file_idx_str, heightmap, to_open) {
	var job = this.findJobByElementId(job_idx);
	if (job != null) {
		var file, extension;
		if (file_idx_str == 'out' || heightmap) {
			file = job.out_file;
			extension = 'png';
		} else {
			file = job.dea_files[parseInt(file_idx_str)];
			var file_idx = parseInt(file_idx_str)+1;
			file_idx_str = (file_idx < 10) ? '0'+file_idx : file_idx;
			extension = file.getExtension() + '.png';
		}
		if (file != null) {
			var url;
			if (heightmap) {
				url = this.cacheBust(this.PATH_HEIGHTMAPS+job.id+'.'+extension);
			} else {
				url = this.cacheBust(this.PATH_IMAGES+job.id+'_'+file_idx_str+'.'+extension);
			}
			if (to_open) {
				window.open(url);
			} else {
				return url;
			}
		}
	}
};

DEATerminal.prototype.cancelProcess=function() {
	var job = this.receivingJob;
	
	if (job != null) {
		this.send("CANCEL:PROCESS:"+job.id);
	} else {
		console.log("No job to cancel process.");
	}
};

DEATerminal.prototype.cancelUpload=function() {
	this.send("CANCEL:UPLOAD");
};

// Returns a new resized image, keeping the original aspect ratio, but making the
// larger dimension (height or width) equal to max_length.
DEATerminal.prototype.resizeImage=function(orig_img, max_length) {
	var new_img = new Image();
	new_img.src = orig_img.src;
	
	var nat_height = new_img.naturalHeight;
	var nat_width = new_img.naturalWidth;
	
	if (nat_height == 0) {
		nat_height = 80;
	}
	if (nat_width == 0) {
		nat_width = 80;
	}
	if (nat_height >= nat_width) {
		new_img.height = max_length;
		new_img.width = nat_width * max_length / nat_height;
	}
	else {
		new_img.width = max_length;
		new_img.height = nat_height * max_length / nat_width;
	}
	
	return new_img;
};

// Creates a menu and thumbnail inside a drop zone
DEATerminal.prototype.imageMenu=function(job_idx, file_idx, last_upload_success, is_heightmap) {
	if (!last_upload_success) {
		return '';
	}
	var job = this.findJobByElementId(job_idx);
	if (job != null) {
		var file;
		var show_options;
		if (file_idx == 'out' || is_heightmap) {
			file = job.out_file;
			show_options = false;
		} else {
			file = job.dea_files[file_idx];
			show_options = true;
		}
		if (file != null) {
			if (file != null) {
				var menu = '';				
				menu += '<div tabindex="0" id="job_menu_'+job_idx+'" class="button action_menu">'
				 + '<span title="'+file.name+'">'+this.shortenFilename(file.name,11)+'</span>'
				 + '<ul class="action_menu_content">'
				 + (show_options ? this.toActionMenuButton('Process', 'imageProcess('+job_idx+','+file_idx+')') : '')
				 + this.toActionMenuButton('Download', 'openFile('+job_idx+',\''+file_idx+'\','+is_heightmap+',true)')
				 + (show_options ? this.toActionMenuButton('Info', 'fileInfo('+job_idx+','+file_idx+')') : '')
				 + (show_options ? this.toActionMenuButton('Delete', 'deleteFile('+job_idx+','+file_idx+')') : '')
				 + '</ul></div>';
				var whichDiv = (is_heightmap ? 'heightmap' : file_idx);
				menu += '<div id="thumbnail_'+job_idx+'_'+whichDiv+'" class="thumbnail"></div>';
				return menu;
			}
		}
	}
	log('Error: Null job or file.');
	return '';
};

// New drop zone is created for each file in a job.
DEATerminal.prototype.addDropZone=function(job_idx, file_idx, last_upload_success) {
	if (file_idx < 0) {
		return;
	}
	
	var self=this;
	var zone_container = this.getDropZoneContainer(job_idx);
	
	// Check if job has been created yet.
	var job = this.findJobByElementId(job_idx);
	var job_exists = job != null;

	if (job_exists) {
		// Change Drop zone just before this one to show that file is uploaded.
		var old_file_index = file_idx-1;
		var last_drop_zone = this.getDropZone(job_idx, old_file_index);
		
		last_drop_zone.innerHTML = this.imageMenu(job_idx, old_file_index, last_upload_success, false);
		
		if (last_upload_success) {
			last_drop_zone.className = last_drop_zone.className.replace(/(?:^|\s)empty_drop_zone(?!\S)/g , '');
			last_drop_zone.className = last_drop_zone.className.replace(/(?:^|\s)failed_drop_zone(?!\S)/g , '');
			last_drop_zone.className += ' raw_drop_zone';
			last_drop_zone.style.removeProperty('background-color');
		}
		else {
			last_drop_zone.className = last_drop_zone.className.replace(/(?:^|\s)raw_drop_zone(?!\S)/g , '');
			last_drop_zone.className = last_drop_zone.className.replace(/(?:^|\s)empty_drop_zone(?!\S)/g , '');
			last_drop_zone.className += ' failed_drop_zone';
			last_drop_zone.style.removeProperty('background-color');
			last_drop_zone.innerHTML += "Upload failed.";
		}
		
		var old_file = job.dea_files[old_file_index];
		if (old_file != null && old_file.type.substring(0,5) == 'image') {
			var img = new Image();
			img.src = this.cacheBust(old_file.url);
			img.onload = function() {
				var thumbnail_img = self.resizeImage(img, 80);
				//thumbnail_img.setAttribute('onclick', 'openFile('+job_idx+',\''+old_file_index+'\',false,true)');
				var thumbnail_a = document.createElement('a');
				thumbnail_a.appendChild(thumbnail_img);
				thumbnail_a.href = self.openFile(job_idx, old_file_index, false, false);
				thumbnail_a.target = '_blank';
				
				var thumbnail_div = document.getElementById('thumbnail_'+job_idx+'_'+old_file_index);
				if (thumbnail_div != null) {
					thumbnail_div.appendChild(thumbnail_a);
				}
			};
		}
	}
	
	var drop_zone_pair = document.getElementById('drop_zone_pair_'+job_idx+'_'+file_idx);
	if (drop_zone_pair == null) {
		var drop_zone_pair = document.createElement('div');
		drop_zone_pair.id = 'drop_zone_pair_'+job_idx+'_'+file_idx;
		drop_zone_pair.className += 'drop_zone_pair';
		zone_container.appendChild(drop_zone_pair);
	}
	drop_zone_pair.innerHTML+='<div id="drop_zone_'+job_idx+'_'+file_idx+'" class="drop_zone empty_drop_zone">'
							+ '<div class="drop_zone_description">Drop files here.</div>'
							+ '<br><input type="file" multiple="true" id="browse_'+job_idx+'_'+file_idx+'">'
							+ '</div>';
	
	// Support manually browsing for files
	var new_browse_btn = document.getElementById('browse_'+job_idx+'_'+file_idx);
	new_browse_btn.addEventListener('change', function(self,job_exists,job_idx,file_idx,new_browse_btn) {return function(evt) {fileBrowse(evt,self,job_exists,job_idx,file_idx,new_browse_btn); };} (self,job_exists,job_idx,file_idx,new_browse_btn), false);
	
	// Support file drag-and-drop
	var new_zone = this.getDropZone(job_idx, file_idx);
	new_zone.addEventListener('dragover', function(job_idx,file_idx) { return function(evt) {dragoverEffectCopy(evt,job_idx,file_idx); };} (job_idx,file_idx) , false);
	new_zone.addEventListener('dragleave', function(job_idx,file_idx) { return function(evt) {dragleaveEffectCopy(evt,job_idx,file_idx); };} (job_idx,file_idx) , false);
	new_zone.addEventListener('drop', function(self,job_exists,job_idx,file_idx) { return function(evt) {dropEffectCopy(evt,self,job_exists,job_idx,file_idx); };} (self,job_exists,job_idx,file_idx) , false);
	var is_last_file_in_drop = (job_exists) ? file_idx == job.dea_files.length : true;
	
	if (is_last_file_in_drop) {
		// Add event listeners to last drop zone in each other drop zone container.
		for (var j = 0; j < this.jobs.length; j++) {
			if (this.jobs[j] == null) {
				continue;
			}
			var f = this.jobs[j].dea_files.length;
			var last_zone = this.getDropZone(j, f);
			if (j != job_idx && last_zone != null) {
				// Don't repeat adding a listener for this job.
				job_exists = this.findJobByElementId(j) != null;
				last_zone.addEventListener('dragover', function(j,f) { return function(evt) {dragoverEffectCopy(evt,j,f); };} (j,f) , false);
				last_zone.addEventListener('dragleave', function(j,f) { return function(evt) {dragleaveEffectCopy(evt,j,f); };} (j,f) , false);
				last_zone.addEventListener('drop', function(self,job_exists,j,f) { return function(evt) {dropEffectCopy(evt,self,job_exists,j,f); };} (self,job_exists,j,f) , false);
				
				var last_zone_browse_btn = document.getElementById('browse_'+j+'_'+f);
				if (last_zone_browse_btn != null) {
					last_zone_browse_btn.addEventListener('change', function(self,job_exists,j,f,last_zone_browse_btn) {return function(evt) {fileBrowse(evt,self,job_exists,j,f,last_zone_browse_btn);};} (self,job_exists,j,f,last_zone_browse_btn) , false);
				}
			}
		}
	}
	
	this.updateFileCount(job_idx);
};

DEATerminal.prototype.toActionMenuButton=function(action_name, callback, id, classes) {
	var id_attr = "";
	if (id != null) {
		id_attr = 'id="'+id+'" ';
	}
	
	var classes_attr = 'class="action_menu_button';
	if (classes != null) {
		classes_attr += ' ' + classes;
	}
	classes_attr += '" ';
	
	return '<li><div '+classes_attr+id_attr+'onclick="'+callback+'">'+action_name+'</div></li>';
};

DEATerminal.prototype.addDropZoneContainer=function() {
	// Create a new drop container for each job.
	var self = this;
	var job_idx = this.jobs.length;
	var jobs_container = document.getElementById('jobs_container');
	
	// If the previous job has no files, don't allow the user to create a new job.
	if (job_idx == 0 || this.addJobEnabled) {
		
		var dropZoneContainer = document.createElement('div');
		dropZoneContainer.id = 'drop_zone_container_'+job_idx;
		dropZoneContainer.className = 'drop_zone_container';
		
		var dropZoneContainerHeader = document.createElement('div');
		dropZoneContainerHeader.id = 'drop_zone_container_header_'+job_idx;
		dropZoneContainerHeader.className = 'drop_zone_container_header';
		
		var jobMenu = document.createElement('div');
		jobMenu.id = 'job_menu_'+job_idx;
		jobMenu.className = 'button action_menu';
		jobMenu.setAttribute('tabindex', '0');
		jobMenu.innerHTML = 'Job '+job_idx
							+ '<ul class="action_menu_content">'
							+ self.toActionMenuButton('Process', 'jobProcess('+job_idx+')', 'job_process_button_'+job_idx, 'job_process_button')
							+ self.toActionMenuButton('Delete', "deleteJob('"+job_idx+"')", 'job_delete_button_'+job_idx, 'job_delete_button')
							+ '</ul>';
		dropZoneContainerHeader.appendChild(jobMenu);
		
		var fileCount = document.createElement('div');
		fileCount.id = 'file_count_'+job_idx;
		fileCount.className = 'file_count';
		dropZoneContainerHeader.appendChild(fileCount);
		
		dropZoneContainer.appendChild(dropZoneContainerHeader);
		
		var dropZoneProcessed = document.createElement('div');
		dropZoneProcessed.style.display = 'inline-block';
		
		var dropZoneOut = document.createElement('div');
		dropZoneOut.id = 'drop_zone_'+job_idx+'_out';
		dropZoneOut.className = 'drop_zone_out';
		
		var outThumbnail = document.createElement('div');
		outThumbnail.id = 'thumbnail_'+job_idx+'_out';
		outThumbnail.className = 'thumbnail';
		dropZoneOut.appendChild(outThumbnail);
		dropZoneProcessed.appendChild(dropZoneOut);
		
		var dropZoneHeightmap = document.createElement('div');
		dropZoneHeightmap.id = 'drop_zone_'+job_idx+'_heightmap';
		dropZoneHeightmap.className = 'drop_zone_heightmap';
		
		var heightmapThumbnail = document.createElement('div');
		heightmapThumbnail.id = 'heightmap_thumbnail_'+job_idx+'_heightmap';
		heightmapThumbnail.className = 'thumbnail';
		dropZoneHeightmap.appendChild(heightmapThumbnail);
		dropZoneProcessed.appendChild(dropZoneHeightmap);
		
		dropZoneContainer.appendChild(dropZoneProcessed);
		jobs_container.appendChild(dropZoneContainer);
		
		this.setAddJobEnabled();
	}
	// Add a drop zone in this container.
	this.addDropZone(job_idx, 0, true, false);
};

// List all drop zone containers in the client, empty or non-empty.
DEATerminal.prototype.listDropZoneContainers=function() {
	return document.getElementsByClassName('drop_zone_container');
};

// Returns a drop zone container, which corresponds to a job.
DEATerminal.prototype.getDropZoneContainer=function(job_idx) {
	return document.getElementById('drop_zone_container_'+job_idx);
};

// Returns a drop zone, which corresponds to a file.
DEATerminal.prototype.getDropZone=function(job_idx, file_idx) {
	return document.getElementById('drop_zone_'+job_idx+'_'+file_idx);
};

// Display information about the file to the user.
DEATerminal.prototype.fileInfo=function(job_idx, file_idx) {
	var info = 'File Information\n\n';
	
	var job = this.findJobByElementId(job_idx);
	if (job == null) {
		info += 'Error: Job not found.';
	}
	else {
		var dea_file = job.dea_files[file_idx];
		if (dea_file == null) {
			info += 'Error: File not found.';
		}
		else {
			var file = dea_file;
			
			info += 'Name: ' + file.name + '\n';
			
			var date = dea_file.getLastModifiedDate();
			if (date != null) info += 'Last modified: ' + date + '\n';
			
			var size = dea_file.sizeString();
			if (size != null) info += 'Size: ' + size + '\n';
			
			var type = file.type;
			if (type != null) {
				info += 'Type: ' + type;
			}
		}
	}
	
	window.alert(info);
};

DEATerminal.prototype.findResult=function(url, directory) {
	var self = this;
	if (this.receivingJob != null) {
		var job = this.receivingJob;
		var file_idx, file;
		if (this.receivingFileElementId == -1) {
			// Job-wide process
			file_idx = 'out';
			for (var i = 0; i < job.dea_files.length; i++) {
				if (job.dea_files[i] != null) {
					file = jQuery.extend({},job.dea_files[i]);	// Clone the first non-null file in the job
					job.out_file = file;
					break;
				}
			}
		} else {
			// Single-image process
			file_idx = this.receivingFileElementId;
			file = job.dea_files[file_idx];
		}
		
		var job_idx = job.element_id;
		var thumbnail_path;
		if (file_idx != 'out') {
			var file_idx_string = file_idx+1;
			if (file_idx_string < 10) file_idx_string = '0' + file_idx_string;
			thumbnail_path = this.PATH_THUMBNAILS+url;
		} else {
			thumbnail_path = directory+'/'+url;
		}
		var is_heightmap = (directory == this.PATH_HEIGHTMAPS);
		var whichDropZone;
		if (is_heightmap)
			whichDropZone = 'heightmap';
		else if (file_idx == 'out')
			whichDropZone = 'out';
		else
			whichDropZone = file_idx;
		var drop_zone = this.getDropZone(job_idx, whichDropZone);
		
		drop_zone.innerHTML = this.imageMenu(job.element_id, file_idx, true, is_heightmap);
		if (is_heightmap || file_idx == 'out') {
			drop_zone.innerHTML += '<div id="process_name_'+whichDropZone+'_'+job_idx+'" class="process_name">[' + this.currentProcess.displayName + ']</div>';
		}
		var thumbnail_div = document.getElementById('thumbnail_'+job_idx+'_'+whichDropZone);
		var thumbnail_img = new Image();
		thumbnail_img.src = this.cacheBust(thumbnail_path);
		thumbnail_img.onload = function() {
			thumbnail_img = self.resizeImage(thumbnail_img, 80);
			var thumbnail_a = document.createElement('a');
			thumbnail_a.appendChild(thumbnail_img);
			thumbnail_a.href = self.openFile(job_idx, file_idx, is_heightmap, false);
			thumbnail_a.target = '_blank';
			thumbnail_a.appendChild(thumbnail_img);
			thumbnail_div.appendChild(thumbnail_a);
			
			drop_zone.className = drop_zone.className.replace(/(?:^|\s)empty_drop_zone(?!\S)/g , '');
			drop_zone.className = drop_zone.className.replace(/(?:^|\s)processed_drop_zone(?!\S)/g , '');
			if (self.currentProcess.name != 'raw') {
				drop_zone.className += ' processed_drop_zone';
			}
			drop_zone.style.removeProperty('background-color');
			
			if (file_idx == 'out' || is_heightmap) {
				drop_zone.style.display = 'inline-block';
			}
			
			if (self.fileIdRequestQueue.length > 0) { // Still more files to request
				self.requestNextThumbnail();
			}
			else {
				self.hideProcessWaitingOverlay();
				self.updateFileCount(job_idx);
			}
		};
	}
};

DEATerminal.prototype.requestNextThumbnail=function() {
	var job = this.receivingJob;
	if (job != null) {
		var file_idx = this.fileIdRequestQueue.shift();
		var file = job.dea_files[file_idx];
		if (file != null) {
			this.receivingFileElementId = file_idx;
			this.send("SEND:RESULT:"+job.id+":"+(file_idx+1)); // Add 1 to match image selector on server
		}
	}
};

// Prevents the page from caching the image, guaranteeing that it will show
// the most updated version.
DEATerminal.prototype.cacheBust=function(url) {
	var c;
	
	// if we have a ?, append a &. Else, append a ?.
	if (url.indexOf('?') > -1) {
		c = '&';
	} else {
		c = '?';
	}
	return url + c + 'time=' + (new Date()).getTime();
};

DEATerminal.prototype.createImageProcessForm=function(job_idx, file_idx) {
	this.createProcessForm(false, job_idx, file_idx);
};

DEATerminal.prototype.createJobProcessForm=function(job_idx) {
	this.createProcessForm(true, job_idx);
};

DEATerminal.prototype.createProcessForm=function(is_job, job_idx, file_idx) {
	var self = this;
	
	var oldForm = document.getElementById('process-form-modal');
	if (oldForm != null) {
		oldForm.parentNode.removeChild(oldForm);
	}
	
	function Process(name, displayName, args, isMulti, hasCanvas) {
		this.name = name;
		this.displayName = displayName;
		if (args == null) {
			this.args = [];
		} else {
			this.args = args;
		}
		if (isMulti == null) {
			this.isMulti = false;
		} else {
			this.isMulti = isMulti;
		}
		if (hasCanvas == null) {
			this.hasCanvas = false;
		} else {
			this.hasCanvas = hasCanvas;
		}
	}
	
	var imgProcesses = new Array();
	imgProcesses.push(new Process("raw", "Raw", ['Scale']));
	imgProcesses.push(new Process("crop", "Crop", ['Crop Right', 'Crop Bottom'], false, true));
	// imgProcesses.push(new Process("cropbottom", "Crop bottom", ['Crop Amount']));
	// imgProcesses.push(new Process("cropleft", "Crop left", ['Crop Amount']));
	// imgProcesses.push(new Process("cropright", "Crop right", ['Crop Amount']));
	// imgProcesses.push(new Process("croptop", "Crop top", ['Crop Amount']));
	imgProcesses.push(new Process("findlightdir", "Find light direction"));
	imgProcesses.push(new Process("fliph", "Flip horizontally"));
	imgProcesses.push(new Process("flipv", "Flip vertically"));
	//imgProcesses.push(new Process("makethumb", "Make thumbnail"));
	imgProcesses.push(new Process("rotate180", "Rotate 180&deg;"));
	imgProcesses.push(new Process("rotate90ccw", "Rotate 90&deg; counter-clockwise"));
	imgProcesses.push(new Process("rotate90cw", "Rotate 90&deg; clockwise"));
	imgProcesses.push(new Process("same", "Same"));
	
	var jobProcesses = new Array();
	// For job-wide processes, set isMulti to true if we are going to request
	// each image one at a time, or false if we're going to get a single
	// image for the job.
	jobProcesses[0] = new Process("average", "Average", null, false);
	jobProcesses[1] = new Process("alignh", "Align Horizontally", null, true);
	jobProcesses[2] = new Process("alignv", "Align Vertically", null, true);
	jobProcesses[3] = new Process("flatd", "FlatD", null, true);
	jobProcesses[4] = new Process("sfs", "SFS", null, true);

	var processes = is_job ? jobProcesses : imgProcesses;

	var modal = document.createElement('div');
	modal.id = 'process-form-modal';
	
	var header = document.createElement('div');
	header.id='process-form-header';
	header.innerHTML = 'Processing Job ' + job_idx;
	if (file_idx != null) {
		header.innerHTML += ', File ' + file_idx;
	}
	modal.appendChild(header);
	
	var form = document.createElement('form');
	form.id = 'process-form';
	form.setAttribute('action', '');
	
	var processSelectDiv = document.createElement('div');
	processSelectDiv.id = 'process-select-div';
	processSelectDiv.innerHTML = '<label for="process">Process:</label>';
	var processSelect = document.createElement('select');
	processSelect.id = 'process-select';
	
	var argDiv = document.createElement('div');
	argDiv.id = 'arg-div';
	
	var canvasDiv = document.createElement('div');
	canvasDiv.id = 'canvas-div';
	
	var blankOption = document.createElement('option');
	blankOption.value = '';
	blankOption.innerHTML = '';
	processSelect.appendChild(blankOption);
	
	for (var i=0; i < processes.length; i++) {
		var processName = processes[i].displayName;
		var option = document.createElement('option');
		option.value = processName;
		option.innerHTML = processName;
		processSelect.appendChild(option);
	}
	processSelect.addEventListener('change', function(){
		argDiv.innerHTML = '';
		// Change form elements
		
		// Find process with this display name
		var process = new Process("null", "Null", 0);
		for (var i = 0; i < processes.length; i++) {
			if (processes[i].displayName == this.value) {
				process = processes[i];
			}
		}
		
		self.currentProcess = process;
		
		// Add args, if any
		for (var i = 0; i < process.args.length; i++) {
			var argInputDiv = document.createElement('div');
			argInputDiv.id = 'arg-input-'+i;
			argInputDiv.classes='arg-input-div';
			
			var argInputLabel = document.createElement('label');
			argInputLabel.innerHTML = process.args[i] + ': ';
			argInputDiv.appendChild(argInputLabel);
			
			var argInputText = document.createElement('input');
			argInputText.type = 'number';
			argInputText.id = 'process-argument-'+i;
			argInputDiv.appendChild(argInputText);
			
			var argInputUnitSelect = document.createElement('select');
			argInputUnitSelect.id = 'process-argument-unit-'+i;
			var optionPct = document.createElement('option');
			optionPct.text = '%';
			optionPct.value = '%';
			argInputUnitSelect.add(optionPct);
			var optionPx = document.createElement('option');
			optionPx.text = 'px';
			optionPx.value = 'px';
			argInputUnitSelect.add(optionPx);
			argInputDiv.appendChild(argInputUnitSelect);
			
			argDiv.appendChild(argInputDiv);
		}
		
		// Add canvas, is applicable
		if (process.hasCanvas) {
			canvasDiv.style.display = 'inherit';
			
			var C_WIDTH = 200, C_HEIGHT = 200;
			
			// Create draggable div
			var draggable = document.createElement('div');
			draggable.id = 'draggable';
			draggable.className = 'ui-widget-content';
			draggable.style.width = C_WIDTH+'px';
			draggable.style.height = C_HEIGHT+'px';
			
			// Draw canvases
			var fixedCanvas = document.createElement('canvas');
			fixedCanvas.id = 'fixed-canvas';
			
			canvasDiv.appendChild(fixedCanvas);
			
			var dragCanvas = document.createElement('canvas');
			dragCanvas.id = 'drag-canvas';
			
			draggable.appendChild(dragCanvas);
			
			canvasDiv.style.border = '1px dotted black';
			canvasDiv.appendChild(fixedCanvas);
			canvasDiv.appendChild(dragCanvas);
						
			var job = self.findJobByElementId(job_idx);
			if (job != null) {
				var file = job.dea_files[file_idx];
				var img = document.createElement('img');
				
				var display_height = 0;
				var display_width = 0;
				var img_width = 0;
				var img_height = 0;
				
				var HEIGHT_FIX = 0;
				
				img.src = self.cacheBust(self.getImageURL(job_idx, file_idx, file.getExtension()+ '.png'));
				img.onload = function() {
					img_width = img.naturalWidth;
					img_height = img.naturalHeight;
					
					if (img_width > img_height) {
						display_width = C_WIDTH;
						display_height = img_height / img_width * C_HEIGHT;
					} else {
						display_width = img_width / img_height * C_WIDTH;
						display_height = C_HEIGHT;
					}
					
					HEIGHT_FIX = (display_height+4);
					
					var w = display_width+'px';
					var h = display_height+'px';
					canvasDiv.style.width = w;
					canvasDiv.style.height = h;
					//fixedCanvas.width = w;
					//fixedCanvas.height = h;
					canvasDiv.style.marginTop = display_height+'px';
					canvasDiv.style.marginBottom = display_height+'px';
					
					fixedCanvas.width = display_width;
					fixedCanvas.height = display_height;
					var fixedContext = fixedCanvas.getContext('2d');
					fixedContext.globalAlpha = 0.5;
					fixedContext.drawImage(img, 0, 0, display_width, display_height);
					
					dragCanvas.width = display_width;
					dragCanvas.height = display_height;
					dragCanvas.style.top = -(display_height+4)+'px';
					dragCanvas.style.border = '1px dotted black';
					//dragCanvas.className = 'ui-widget-content';
					var dragContext = dragCanvas.getContext('2d');
					dragContext.globalAlpha = 0.75;
					dragContext.drawImage(img, 0, 0, display_width, display_height);
				};
				
				var argX = document.getElementById('process-argument-0');
				var unitX = document.getElementById('process-argument-unit-0');
				var argY = document.getElementById('process-argument-1');
				var unitY = document.getElementById('process-argument-unit-1');
				
				$('#drag-canvas').draggable();
				$('#drag-canvas').on('drag', function(event, ui) {
					var min_left = Math.ceil(-display_width+2);
					var max_left = Math.floor(display_width-2);
					var min_top = Math.ceil(-display_height-HEIGHT_FIX+2);
					var max_top = Math.floor(display_height-HEIGHT_FIX-2);
					
					// Keep it from going away from the box
					var left = ui.position.left;
					var top = ui.position.top;
					left = Math.max(min_left, left);
					left = Math.min(max_left, left);
					top = Math.max(min_top, top);
					top = Math.min(max_top, top);
					
					ui.position.left = left;
					ui.position.top = top;
					
					if (argX != null) {
						argX.min = Math.ceil(min_left * img_width / display_width);
						argX.max = Math.floor(max_left * img_width / display_width);
						if (left < 0) {
							argX.value = Math.ceil(left * img_width / display_width);
						} else {
							argX.value = Math.floor(left * img_width / display_width);
						}
						unitX.value = 'px';
					}
					if (argY != null) {
						argY.min = Math.ceil((HEIGHT_FIX + min_top) * img_height / display_height);
						argY.max = Math.floor((HEIGHT_FIX + max_top) * img_height / display_height);
						if (top < 0) {
							argY.value = Math.ceil((HEIGHT_FIX + top) * img_height / display_height);
						} else {
							argY.value = Math.floor((HEIGHT_FIX + top) * img_height / display_height);
						}
						unitY.value = 'px';
					}
				});
				
				// Add listeners to X and Y arguments that will move the draggable canvas
				
				if (argX != null && unitX != null) {
					argX.addEventListener('change', function() {
						var min_left, max_left, drag_left;
						
						var min_drag_left = Math.ceil(-img_width+2);
						var max_drag_left = Math.floor(img_width-2);
						
						var left = argX.value;
						if (unitX.value == '%') {
							min_left = -100;
							max_left = 100;
						} else {
							min_left = min_drag_left;
							max_left = max_drag_left;
						}
						left = Math.max(min_left, left);
						left = Math.min(max_left, left);
						argX.value = left;
						
						if (unitX.value == '%') {
							drag_left = img_width * 0.01 * left;
							if (drag_left < 0) {
								drag_left = Math.ceil(drag_left);
							} else {
								drag_left = Math.floor(drag_left);
							}
							drag_left = Math.max(min_drag_left, drag_left);
							drag_left = Math.min(max_drag_left, drag_left);
						} else {
							drag_left = left;
						}
						
						drag_left = drag_left * display_width / img_width;
						document.getElementById('drag-canvas').style.left = drag_left+'px';
					});
					
					unitX.addEventListener('change', function() {
						argX.value = '';
					});
				}
				if (argY != null && argY != null) {
					argY.addEventListener('change', function() {
						var min_top, max_top, drag_top;
						
						var min_drag_top = Math.ceil(-img_height+2);
						var max_drag_top = Math.floor(img_height-2);
						
						var top = argY.value;
						if (unitY.value == '%') {
							min_top = -100;
							max_top = 100;
						} else {
							drag_top = top;
							min_top = min_drag_top;
							max_top = max_drag_top;
						}
						top = Math.max(min_top, top);
						top = Math.min(max_top, top);
						argY.value = top;
						
						if (unitY.value == '%') {
							drag_top = img_height * 0.01 * top;
							if (drag_top < 0) {
								drag_top = Math.ceil(drag_top);
							} else {
								drag_top = Math.floor(drag_top);
							}
							drag_top = Math.max(min_drag_top, drag_top);
							drag_top = Math.min(max_drag_top, drag_top);
						} else {
							drag_top = top;
						}
						
						drag_top = drag_top * display_height / img_height - HEIGHT_FIX;
						document.getElementById('drag-canvas').style.top = drag_top+'px';
					});
					
					unitY.addEventListener('change', function() {
						argY.value = '';
					});
				}
			}
		} else {
			// Clear canvases
			canvasDiv.innerHTML = '';
			canvasDiv.style.display = 'none';
		}
		
		// if isMulti, add images to queue
		if (is_job && process.isMulti) {
			var job = self.jobs[job_idx];
			if (job != null) {
				for (var i = 0; i < job.dea_files.length; i++) {
					if (job.dea_files[i] != null) {
						self.fileIdRequestQueue.push(i);
					}
				}
			}
		}
		
		document.getElementById('process-submit-button').style.display = (this.value == '' ? 'none' : 'inline');
	}, false);
	processSelectDiv.appendChild(processSelect);
	form.appendChild(processSelectDiv);
	form.appendChild(argDiv);
	form.appendChild(canvasDiv);
	
	var submitArea = document.createElement('div');
	submitArea.id = 'submit-area';
	submitArea.innerHTML = '<a id="process-submit-button" class="button close" href="#">Process</a>';
	submitArea.innerHTML += '<a class="button close cancel" href="#">Cancel</a>';
	form.appendChild(submitArea);
	
	modal.appendChild(form);
	
	document.body.appendChild(modal);
	$('#process-form-modal').easyModal({
		top: 200,
		overlayOpacity: 0.6
	});
	$('#process-submit-button').click(function(e){
		var processDisplayName = document.getElementById('process-select').value;
		if (processDisplayName == '') {
			e.preventDefault();
		} else {
			var job = self.findJobByElementId(job_idx);
			if (job != null) {
				var img_selector = -1;
				if (is_job) {
					img_selector = 0;
				} else {
					var file = job.dea_files[file_idx];
					if (file != null) {
						img_selector = file.element_id + 1;
					}
					else {
						return;
					}
				}
				
				// Find process with this display name
				var process = new Process("null", "Null", 0);
				for (var i = 0; i < processes.length; i++) {
					if (processes[i].displayName == processDisplayName) {
						process = processes[i];
						break;
					}
				}
				if (process.name != 'null') {
					var command = 'PROCESS:'+job.id+':'+process.name.toUpperCase()+':'+img_selector;
					for (var i=0; i < process.args.length; i++) {
						var arg = document.getElementById('process-argument-'+i).value;
						if (arg != '') {
							var unit = document.getElementById('process-argument-unit-'+i).value;
							if (unit == '%') {
								arg += '%';
							}
						}
						if (arg == '') {
							arg = 0;
						}
						command += ':' + arg;
					}
					self.receivingJob = job;
					self.send(command);
				}
			}
		}
		self.clearProcessProgressBar();
		self.showProcessWaitingOverlay();
	});
	$('#process-form').submit(function(e){
		e.preventDefault();
		$('#process-submit-button').trigger('click');
	});
};

DEATerminal.prototype.setProgressBar=function(percent_done) {
	document.getElementById('processing-message').style.background = 'linear-gradient(90deg, #4444ff ' + percent_done + '%, white '+(percent_done)+'%';
};

DEATerminal.prototype.clearProcessProgressBar=function() {
	this.setProgressBar(0);
};

DEATerminal.prototype.showProcessWaitingOverlay=function() {
	$('#processing-overlay').css('display', 'block');
};

DEATerminal.prototype.hideProcessWaitingOverlay=function() {
	$('#processing-overlay').css('display', 'none');
};

DEATerminal.prototype.showUploadStart=function() {
	$('#uploading-overlay').css('display', 'block');
};

DEATerminal.prototype.hideUploadingOverlay=function() {
	$('#uploading-overlay').css('display', 'none');
};

DEATerminal.prototype.help=function() {
	var helpText = "This is UF's TelePhyT image processing client. To start, upload an image into your first Job, by either Drag-and-Drop or clicking the File Browse button."
					+ "<br><br>"
					+ "Right now, only TIFF files are fully supported, with some support for PNGs.";

	var oldHelpModal = document.getElementById('help-modal');
	oldHelpModal.parentNode.removeChild(oldHelpModal);
	
	var helpModal = document.createElement('div');
	helpModal.id = 'help-modal';
	document.body.appendChild(helpModal);
	
	$('#help-modal').easyModal({
		top: 200,
		overlayOpacity: 0.6
	});
	$('#help-modal').trigger('openModal');
	
	var helpTextDiv = document.createElement('div');
	helpTextDiv.id = 'help-text';
	helpTextDiv.innerHTML = helpText;
	
	document.getElementById('help-modal').appendChild(helpTextDiv);
};