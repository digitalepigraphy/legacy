// Constants
var COOKIE_USER_ID_KEY = 'impUserID';
var QUERY_STRING_USER_ID_KEY = 'user';
var DEFAULT_COOKIE_LENGTH = 14;	// 14 days
var RESERVED_USERNAMES = ['data'];

var dea_terminal;

// Wrapper functions called by user actions
function addJob() {
	dea_terminal.addDropZoneContainer();
}
function deleteFile(job_idx, file_idx) {
	dea_terminal.deleteFile(job_idx, file_idx);
}
function deleteJob(job_idx) {
	dea_terminal.deleteJob(job_idx);
}
function fileInfo(job_idx, file_idx) {
	dea_terminal.fileInfo(job_idx, file_idx);
}
function imageProcess(job_idx, file_idx) {
	dea_terminal.imageProcess(job_idx, file_idx);
}
function jobProcess(job_idx) {
	dea_terminal.jobProcess(job_idx);
}
function openFile(job_idx, file_idx, is_heightmap, to_open) {
	if (to_open) {
		dea_terminal.openFile(job_idx, file_idx, is_heightmap, to_open);
	} else {
		return dea_terminal.openFile(job_idx, file_idx, is_heightmap, to_open);
	}
}
function cancelProcess() {
	dea_terminal.cancelProcess();
}
function cancelUpload() {
	dea_terminal.cancelUpload();
}

function on_load() {
	// Prevent drag-and-drop into body unless explicitly allowed
	document.body.addEventListener('dragover', dragoverEffectNone, false);
	document.body.addEventListener('drop', dropEffectNone, false);
	
	function log(text) {
		document.getElementById("log").innerHTML = text + document.getElementById("log").innerHTML;
	}

	if (!window.WebSocket) {
		alert("FATAL: WebSocket not natively supported. This demo will not work!");
	}

	start_terminal();
}

function connect_terminal(port) {
	// Get User ID, following this priority:
	// 1 - Check if a user ID is specified in the URL's query string. If so, store it as a cookie.
	// 2 - Use any stored cookie we already have. If these is none, the DEATerminal constructor will create and store one.
	
	var queryUserId = getQueryStringParameter('user');
	var cookieUserId = getCookie(COOKIE_USER_ID_KEY);
	
	var userId = null;
	
	if (queryUserId == null || queryUserId == '' || RESERVED_USERNAMES.indexOf(queryUserId) != -1) {
		if (cookieUserId == null || cookieUserId == '' || RESERVED_USERNAMES.indexOf(queryUserId) != -1) {
			console.log('Generating new user ID');
		} else {
			userId = cookieUserId;
			console.log('Logged in using cookie: ' + cookieUserId);
			putQueryStringParameter(QUERY_STRING_USER_ID_KEY, cookieUserId);
		}
	} else {
		console.log('Logged in using query string: ' + queryUserId);
		userId = queryUserId;
		setCookie(COOKIE_USER_ID_KEY, queryUserId, DEFAULT_COOKIE_LENGTH);
	}
	
	dea_terminal=new DEATerminal(userId);
	dea_terminal.port = port;
	dea_terminal.connect();
}

function reloadWithNewUser(userId) {
	putQueryStringParameter('user', userId);
}

function getQueryStringParameter(key) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (pair[0] == key) {
			return pair[1];
		}
	}
	return null;
}

function putQueryStringParameter(key, value) {
	var newQuery = deleteQueryStringParameter(key, false);
	if (newQuery == null) {
		newQuery = '';
	}
	
	var conjunction;
	if (newQuery == '') {
		conjunction = '?';
	} else {
		conjunction = '&';
	}
	window.location.search=newQuery+conjunction+encodeURIComponent(key)+'='+encodeURIComponent(value);
}

function deleteQueryStringParameter(key, is_hard_call) {
	var newQuery = '';
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		if (vars[i] == '') {
			continue;
		}
		var pair = vars[i].split('=');
		if (pair[0] == key) {
			// Skip the pair containing the key
		} else {
			if (newQuery == '') {
				newQuery = '?';
			} else {
				newQuery += '&';
			}
			newQuery += vars[i];
		}
	}
	
	if (is_hard_call) {
		window.location.search = newQuery;
	} else {
		return newQuery;
	}
}

function logerr(msg) {
	setTimeout(function() {
		throw new Error(msg);
	}, 0);
}
function log(text) {
	document.getElementById("log").innerHTML = text + "<br>" + document.getElementById("log").innerHTML;
	console.log(text);
}
function log_red(text) {
	document.getElementById("log").innerHTML = "<span style='color:red;'>" + text + "</span><br>" + document.getElementById("log").innerHTML;
	console.log(text);
}
function log_blue(text) {
	document.getElementById("log").innerHTML = "<span style='color:blue;'>" + text + "</span><br>" + document.getElementById("log").innerHTML;
	console.log(text);
}
function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){c_start = c_value.indexOf(c_name + "=");}
	if (c_start == -1){c_value = null;}
	else {
	  c_start = c_value.indexOf("=", c_start) + 1;
	  var c_end = c_value.indexOf(";", c_start);
	  if (c_end == -1){c_end = c_value.length;}
	  c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}
function setCookie(c_key, c_value, exp_days) {
	var exp_date = new Date();
	exp_date.setTime(exp_date.getTime() + (exp_days*24*60*60*1000));
	var expires = 'expires='+exp_date.toUTCString();
	document.cookie = c_key + '=' + c_value + '; ' + expires;
}
function deleteCookie(c_name) {
	setCookie(c_name, '', DEFAULT_COOKIE_LENGTH);
}
function dragoverEffectNone(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'none'; // Explicitly show that a drop will have no effect.
}
function dropEffectNone(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}
function dragoverEffectCopy (evt, job_idx, file_idx) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	
	var drop_zone = document.getElementById('drop_zone_'+job_idx+'_'+file_idx);
	if (drop_zone != null) {
		drop_zone.className = drop_zone.className.replace(/(?:^|\s)dragover_drop_zone(?!\S)/g , '');
		drop_zone.className += ' dragover_drop_zone';
	}
}

function dragleaveEffectCopy (evt, job_idx, file_idx) {
	var drop_zone = document.getElementById('drop_zone_'+job_idx+'_'+file_idx);
	if (drop_zone != null) {
		drop_zone.className = drop_zone.className.replace(/(?:^|\s)dragover_drop_zone(?!\S)/g , '');
	}
}

// Set Y in the "(X of Y)" uploading message
function setUploadTotal (job, total) {
	if (job != null) {
		job.fileUploadCount = 0;
	}
	document.getElementById('upload-total').innerHTML = total;
}

function dropEffectCopy (evt, self, job_exists, job_idx, drop_zone_idx) {
	evt.stopPropagation();
	evt.preventDefault();
	
	var files = evt.dataTransfer.files;
	
	if (files.length == 0) {
		dragleaveEffectCopy(evt, job_idx, drop_zone_idx);
	}
	else if (job_exists) {
		var job = self.jobs[job_idx];
		// File upload will only start once per drop - if a box has already
		// been dropped on, triggering this function will have no effect.
		if (job != null && !job.alreadyDroppedOn(drop_zone_idx)) {
			setUploadTotal(job, files.length);
			job.setDroppedOn(drop_zone_idx);
			job.addFiles(files);
			job.uploadNextFile();
		}
	}
	else {
		setUploadTotal(job, files.length);
		var job = self.requestNewJob(job_idx);
		job.addFiles(files);
	}
}

function fileBrowse (evt, self, job_exists, job_idx, drop_zone_idx, button) {
	if (button.files.length > 0) {
		if (job_exists) {
			var job = self.jobs[job_idx];
			// File upload will only start once per drop - if a box has already
			// been dropped on, triggering this function will have no effect.
			if (job != null && !job.alreadyDroppedOn(drop_zone_idx))
			{
				setUploadTotal(job, button.files.length);
				job.setDroppedOn(drop_zone_idx);
				job.addFiles(button.files);
				job.uploadNextFile();
			}
		}
		else
		{
			var job = self.requestNewJob(job_idx);
			setUploadTotal(job, button.files.length);
			job.addFiles(button.files);
		}
	}
}

function logout() {
	deleteCookie(COOKIE_USER_ID_KEY);
	deleteQueryStringParameter(QUERY_STRING_USER_ID_KEY, true);
}

function makeRequest(method, url) {
	var req = new XMLHttpRequest();
	if ("withCredentials" in req){
		req.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined"){
		req = new XDomainRequest();
		req.open(method, url);
	} else {
		req = null;
	}
	return req;
}

function help() {
	dea_terminal.help();
}