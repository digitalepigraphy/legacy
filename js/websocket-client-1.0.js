// Client Object
//--------------------------------------------------------------------------------------
function WebSocketClient(server_config) {
	this.ws = null;
	this.div_console=null;
	this.status=0;
	this.server_configuration=server_config;
}
//--------------------------------------------------------------------------------------

WebSocketClient.prototype.setConsole=function(div){
	this.div_console=div;
};

WebSocketClient.prototype._consoleMessage=function(msg){
	if(this.div_console==null) return;
	var div=document.createElement('div');
	div.style.borderRadius='1px';
	div.style.backgroundColor='rgb(0,0,0)';
	div.style.color='rgb(255,255,255)';
	div.style.float='top';
	div.style.verticalAlign='middle';
	div.style.lineHeight=this.default_height+'px';
	div.style.fontFamily='"Courier New", Courier, monospace';
	div.style.fontSize='14px';
	div.innerHTML=msg;
	this.div_console.appendChild(div);
};

WebSocketClient.prototype.connect=function(){
	this._getServerConfiguration();
};

WebSocketClient.prototype._getServerConfiguration = function() {
	var xmlhttp;
	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else { // code for IE6, IE5
  		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET",this.server_configuration, true);
	
	var self=this;
	xmlhttp.onreadystatechange=function()
  	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		self._onXMLload(xmlhttp.responseXML);
	};
	xmlhttp.send();
};

WebSocketClient.prototype._onXMLload=function(data)
{
	//data.getElementsByTagName("running")[0].childNodes[0].nodeValue;
	this.status=10;
	this.websocket_port=80;//data.getElementsByTagName("websocket_port")[0].childNodes[0].nodeValue;
	this.websocket_address=data.getElementsByTagName("websocket_address")[0].childNodes[0].nodeValue;
	this._connect();
};


// Main Methods
//--------------------------------------------------------------------------------------
WebSocketClient.prototype._connect = function() {
	if(!("WebSocket" in window)) {
		alert("WebSocket is not supported by your browser");
		return;
	}
	
	if(this.status!=10) {
		console.log("Web socket is not running");
		return;
	}
	
	this.ws = new WebSocket("ws://"+this.websocket_address+":" + this.websocket_port);
	
	var self = this;
	
	this.ws.onopen = function() {
		self._onopen();
	};
    this.ws.onmessage = function(message) {
		self._onmessage(message);
	};
    this.ws.onclose = function() { 
		self._onclose();
		self.ws = null;
	};
	this.ws.onerror = function(error) {
		self._onerror(error);
	};
};

WebSocketClient.prototype._waitForSocketConnection = function(callback) {
	var self = this;
	setTimeout(
	        function() {
	            if(self.ws.readyState === 1) {
	                // connection is open
	                if(callback != null) {
	                    callback();
	                }
	                return;
	            } 
				else if(self.ws.readyState === 3) {
					// connection is closed
					return;
				}
				else {
	                // wait for connection
	                self._waitForSocketConnection(callback);
	            }

	        }, 5); // wait 5 milliseconds for the connection
};

WebSocketClient.prototype.send = function(request) {
	var self = this;
	if(self.ws != null) {
		this._waitForSocketConnection(function() {
			if(	!(Object.prototype.toString.call(request) === "[object Int8Array]") &&
			!(Object.prototype.toString.call(request) === "[object ArrayBuffer]")) {
				self._consoleMessage("Message sent: " + request);
			}
			self.ws.send(request);
		});
	}
	else {
		console.log("WebSocket connection has not been established");
	}
};

WebSocketClient.prototype.disconnect = function() {
	var self = this;
	if(self.ws != null) {
		this.server._waitForSocketConnection(function() {
			self.ws.close();
			self.ws = null;
			self.status=10;
		});
	}
	else {
		console.log("WebSocket connection was never established");
	}
};
//--------------------------------------------------------------------------------------



// WebSocket Event Handling Methods
//--------------------------------------------------------------------------------------
WebSocketClient.prototype._onopen = function() {
	this._consoleMessage("Connection established");
	this.status=20;
	this.onopen();
};

WebSocketClient.prototype._onmessage = function(message) {
	if(message.data instanceof Blob) {
		if(message.data.size == 0) {
			//console.log("Error: Blob of size 0 received");
		}
		else { 
			this.onbinarymessage(message);
		}
	}
	else { //if(typeof message.data === "string")
		this._consoleMessage("Message received: " + message.data);
		//var tokens = message.data.split(":");
		//var commandName = tokens[0];
		
		this.onmessage(message);
	}
};

WebSocketClient.prototype._onerror = function(error) {
	this._consoleMessage("Error: " + error);
	this.onerror(error);
};

WebSocketClient.prototype._onclose = function() {
	this._consoleMessage("Connection closed");
	this.onclose();
};
//--------------------------------------------------------------------------------------
WebSocketClient.prototype.onopen=function(){};
WebSocketClient.prototype.onclose=function(){};
WebSocketClient.prototype.onerror=function(){};
WebSocketClient.prototype.onmessage=function(){};
WebSocketClient.prototype.onbinarymessage=function(){};

