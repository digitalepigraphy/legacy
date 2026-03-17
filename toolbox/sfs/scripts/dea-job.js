function DEAJob(terminal,job_id)
{
	this.terminal=terminal;
	this.id=null;
	if(typeof job_id !== 'undefined')
		this.id=job_id;
	this.element_id=null;
	this.dea_files=new Array();
	this.out_file=null;
	this.dropped_on={};
	this.fileUploadCount=0;
	this.uploadingFileElementId=-1;
	this.max_existing_file_element_id=-1;
}

DEAJob.prototype.setId=function(job_id)
{
	this.id=job_id;
};

DEAJob.prototype.countRawFiles=function()
{
	var count = 0;
	for (var i = 0; i < this.dea_files.length; i++)
	{
		if (this.dea_files[i] != null)
		{
			count++;
		}
	}
	return count;
};

DEAJob.prototype.countProcessedFiles=function()
{
	var count = 0;
	for (var i = 0; i < this.dea_files.length; i++)
	{
		if (this.dea_files[i] != null && this.dea_files[i].is_processed)
		{
			count++;
		}
	}
	return count;
};

DEAJob.prototype.uploadNextFile=function()
{
	for(var i=0;i<this.dea_files.length;i++)
	{
		if(this.dea_files[i] != null && this.dea_files[i].status==1)
		{
			this.dea_files[i].status=2;
			// NEW:UPLOAD:[format]:[job_id]:[file_element_id]:[file_size]:[original_filename]:[date]
			this.fileUploadCount++;
			document.getElementById('upload-index').innerHTML = this.fileUploadCount;
			var format = this.dea_files[i].format;
			var job_id = this.id;
			var file_element_id = i;
			var file_size = this.dea_files[i].size;
			var original_filename = this.dea_files[i].name;
			//var date = this.dea_files[i].getLastModifiedDate();
			var date = this.dea_files[i].lastModified;
			this.terminal.send('NEW:UPLOAD:'+format+':'+job_id+':'+file_element_id+':'+file_size+':'+original_filename+':'+date);
			//this.terminal.send("NEW:UPLOAD:"+this.dea_files[i].format+":"+this.id+":"+i+":"+this.dea_files[i].file.size);
log('New upload: "'+this.dea_files[i].name+'"');
			break;
		}
	}
};

// Add newly uploaded files
DEAJob.prototype.addFiles=function(files)
{
log('Adding ' + files.length + ' file' + (files.length == 1 ? '' : 's') + ' to Job ' + this.element_id + ' (' + (this.id == null ? 'new job' : this.id) + ')');
	for(var i=0;i<files.length;i++)
	{
		var file=new DEAFile(this.terminal,this);
		file.upload(files[i]);
		// Set file format
		switch (file.type)
		{
			case "image/jpeg":
				file.format = "JPEG";
				break;
			case "image/gif":
				file.format = "GIF";
				break;
			case "image/png":
				file.format = "PNG";
				break;
			case "image/bmp":
				file.format = "BMP";
				break;
			case "image/tiff":
				file.format = "TIFF";
				break;
			default:
				file.format = "OTHER";
				break;
		}
		file.element_id = i;
		this.dea_files[i]=file;
	}
};

// Add files that are reconstructed from the server
DEAJob.prototype.addExistingFile=function(name, url, lastModified, size, type)
{
	if (name == null) {
		this.dea_files[this.dea_files.length] = null;
	} else {
		var file = new DEAFile(this.terminal, this);
		file.init(lastModified, name, size, type);
		file.url = url;
		file.status = 2;
		var element_id = this.dea_files.length;
		file.element_id = element_id;
		
		this.dea_files[element_id]=file;
	}
};

// Tell whether or not a drop zone has been used yet.
DEAJob.prototype.alreadyDroppedOn=function(dz_idx)
{
	var dropped = this.dropped_on[''+dz_idx];
	if (dropped == null) return false;
	return dropped;
};

// Store that a certain drop zone has been dropped on already.
DEAJob.prototype.setDroppedOn=function(dz_idx)
{
	this.dropped_on[''+dz_idx] = true;
};

// Get a count of non-null files in this job.
DEAJob.prototype.fileCount=function()
{
	var count = 0;
	for (var i=0; i<this.dea_files.length;i++)
	{
		if (this.dea_files[i] != null)
		{
			count++;
		}
	}
	return count;
};
