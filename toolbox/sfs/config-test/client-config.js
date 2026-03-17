var require_cookies = false;

function start_terminal() {
	connect_terminal(8889);
	
	document.getElementById("sendForm").onsubmit=function() {
		var textField = document.getElementById("textField");
		dea_terminal.send(textField.value);
		textField.value = "";
		textField.focus();
		return false;
	};

	dea_terminal.addDropZoneContainer();
}