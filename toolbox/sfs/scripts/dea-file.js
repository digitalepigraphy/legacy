function DEAFile(terminal,job,file_id)
{
	this.terminal=terminal;
	this.job=job;
	this.file=null;
	this.url=null;
	this.format=null;
	this.element_id=-1;
	
	// From File object
	this.lastModified = null;
	this.name = null;
	this.size = 0;
	this.type = null;
	
	this.status=1;//1:just created for upload and waiting, 2:request uploading and waiting,
	
	this.read = 0;
	this.sizeStr = null;
	this.uploadBar = null
	this.uploadText = null;
	this.reader = null;
}

DEAFile.prototype.BLOB_SIZE = 8000;

DEAFile.prototype.setElementId=function(file_element_id,job_index)
{
	this.element_id=file_element_id;
	this.terminal.send("SENDING:"+this.job.id+":"+file_element_id);
};

DEAFile.prototype.updateUploadText=function()
{
	var percent_uploaded = (this.read*100/this.size);
	if (percent_uploaded > 100) {
		percent_uploaded = 100;
	}
	var upload_msg = 'Uploading "' + this.name + '" (' + this.sizeStr + '): ' + (percent_uploaded<10 ? ' ' : '') + (percent_uploaded<100 ? ' ' : '') + percent_uploaded.toFixed(1) + '%';
	this.uploadText.innerHTML = upload_msg;
	
	this.uploadBar.style.background = 'linear-gradient(90deg, #44ff44 ' + percent_uploaded + '%, white '+(percent_uploaded+5)+'%';
};

DEAFile.prototype.performUploading=function()
{
	var BLOB_SIZE = 8000;
	var reader = new FileReader();
	var self=this;
	var uploadBar = document.getElementById('uploading-message');
	var uploadText = document.getElementById('upload-text');
	
	this.updateUploadText(uploadText, uploadBar, sizeStr, read);
	
	var blob = this.file.slice(0, BLOB_SIZE);
	read += BLOB_SIZE;
    reader.readAsArrayBuffer(blob);
	
	reader.onload = function(e) {
		self.terminal.send(e.target.result);
		if (read < self.size)
		{
			var blob = self.slice(read, read+BLOB_SIZE);
			read+=BLOB_SIZE;
			reader.readAsArrayBuffer(blob);
			self.updateUploadText();
		}
		else {
			// File done uploading. Send message to server to indicate this.
			self.updateUploadText();
			self.terminal.send("COMPLETE:UPLOAD:"+self.job.id+":"+self.element_id);
log('Done uploading "'+self.name+'".');
		}
	};
};

DEAFile.prototype.initializeUploading=function()
{
	var self = this;
	this.read = 0;
	this.sizeStr = this.sizeString();
	this.uploadBar = document.getElementById('uploading-message');
	this.uploadText = document.getElementById('upload-text');
	this.reader = new FileReader();
	
	this.reader.onload = function(e) {
		self.terminal.send(e.target.result);
	}
}

DEAFile.prototype.uploadNext=function()
{
	if (this.read < this.size)
	{
		var blob = this.file.slice(this.read, this.read+this.BLOB_SIZE);
		this.read+=this.BLOB_SIZE;
		this.reader.readAsArrayBuffer(blob);
		this.updateUploadText();
	}
	else {
		// File done uploading. Send message to server to indicate this.
		this.updateUploadText();
		this.terminal.send("COMPLETE:UPLOAD:"+this.job.id+":"+this.element_id);
log('Done uploading "'+this.name+'".');
		
		// Prevent default drag-and-drop behavior for all the other drop zones in this job.
		for (var f=0; this.job != null && f < this.job.dea_files.length; f++) {
			var drop_zone = document.getElementById('drop_zone_'+this.job.id+'_'+f);
			if (drop_zone != null) {
				drop_zone.addEventListener('dragover', dragoverEffectNone ,false);
						
				drop_zone.addEventListener('drop', dropEffectNone, false);
			}
		}
	}
}

DEAFile.prototype.upload=function(file)
{
	this.file=file;
	this.lastModified = file.lastModified;
	this.name = file.name;
	this.size = file.size;
	this.type = file.type;
	this.status = 1;
};

DEAFile.prototype.init=function(lastModified, name, size, type)
{
	this.lastModified = lastModified;
	this.name = name;
	this.size = size;
	this.type = type;
	
	switch(type) {
		case 'image/jpeg':
			this.format = 'JPEG';
			break;
		case 'image/tiff':
			this.format = 'TIFF';
			break;
		case 'image/gif':
			this.format = 'GIF';
			break;
		case 'image/png':
			this.format = 'PNG';
			break;
		default:
			this.format = 'OTHER';
			break;
	}
}

DEAFile.prototype.getLastModifiedDate=function()
{
	// yyyy/MM/dd HH:mm:ss
	var date = this.lastModifiedDate;
	if (date != null) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if (month < 10) month = '0' + month;
		var day = date.getDate();
		if (day < 10) day = '0' + day;
		var hour = date.getHours();
		if (hour < 10) hour = '0' + hour;
		var min = date.getMinutes();
		if (min < 10) min = '0' + min;
		var sec = date.getSeconds();
		if (sec < 10) sec = '0' + sec;
		
		return year+'/'+month+'/'+day+' '+hour+':'+min+':'+sec;
	}
};

DEAFile.prototype.sizeString=function()
{
	var size = this.size;
	if (size != null) {
		var sizeUnit;
		if (size < 1024) {
			sizeUnit = 'B';
		}
		else if (size < 1024*1024) {
			size /= 1024;
			sizeUnit = 'kiB';
		}
		else if (size < 1024*1024*1024) {
			size /= 1024*1024;
			sizeUnit = 'MiB';
		}
		else {
			size /= 1024*1024*1024;
			sizeUnit = 'GiB';
		}
		size = Math.round(size);
		var sizeStr = size + ' ' + sizeUnit;				
		return sizeStr;
	}
	return null;
};

DEAFile.prototype.getExtension=function()
{
	switch (this.format.toUpperCase()) {
	case "JPEG":
		return "jpg";
		break;
	case "TIFF":
		return "tif";
		break;
	case "GIF":
		return "gif";
		break;
	case "PNG":
		return "png";
		break;
	default:
		return 'null';
		break;
	}
};