var require_cookies = true;

function start_terminal() {
	// Get port from status page (http://srv.digitalepigraphy.org/IMPServer/status/)
	var req = makeRequest("get", "http://srv.digitalepigraphy.org/IMPServer/status/");
	if (req) {
		req.onload = function() {
			var responseText = this.responseText;
			// Parse port from responseText
			if (window.DOMParser) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(responseText, "text/xml");

				var status = xmlDoc.getElementsByTagName('status')[0];
				var children = status.childNodes;
				var port = null;
				for (var i = 0; i < children.length; i++) {
					if (children[i].nodeName == 'websocket_port') {
						port = children[i].childNodes[0].nodeValue;
					}
				}
				if (port == null) {
					port = 0;
				}
				connect_terminal(port);
				
				document.getElementById("sendForm").onsubmit=function() {
					var textField = document.getElementById("textField");
					dea_terminal.send(textField.value);
					textField.value = "";
					textField.focus();
					return false;
				};

				dea_terminal.addDropZoneContainer();
			}
		};
		req.send();
	}
}
/*
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
*/