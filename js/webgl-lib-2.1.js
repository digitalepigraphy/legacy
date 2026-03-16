/* V2.1
 * Copyright 2013, Digital Worlds Institute, University of Florida
 * Angelos Barmpoutis.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain this copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce this
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * When this program is used for academic purposes, the following
 * article must be cited: A. Barmpoutis, 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */ 
 
function WebGLCanvas(div)
{

 this.canvas=document.createElement('canvas');
 this.canvas.style.border='none';
 this.canvas.style.touchAction='none';
 this.canvas.style.position='absolute';
 this.canvas.style.left='0px';
 this.canvas.style.right='0px';
 
 if(typeof div=='string')
 	document.getElementById(div).appendChild(this.canvas);
 else div.appendChild(this.canvas);
 
  this.gl=null;
  
  if(!this.init()) return;
  
  this.rendering_mode=0;
  this.render_now=true;
  this.render_now_requested_in_draw=false;
  this.in_draw=false;
  
  this.camera=new WebGLCamera(this);
  this.camera.setStandardPointerInteraction();
  
  this.progress_bar=new WebGLProgressBar(this,5);
  
  this.start=function(){
  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  this.onSetup();
  
  this.canvas.addEventListener("keydown", this.handleKeyDown, false);
  this.canvas.addEventListener("keyup", this.handleKeyUp, false);
  this.canvas.addEventListener("mousedown", this.handleMouseDown, false);
  this.canvas.addEventListener("mouseup", this.handleMouseUp, false);
  this.canvas.addEventListener("mousemove", this.handleMouseMove, false);
  this.canvas.addEventListener("touchstart", this.handleTouchStart, false);
  this.canvas.addEventListener("touchend", this.handleTouchEnd, false);
  this.canvas.addEventListener("touchcancel", this.handleTouchCancel, false);
  this.canvas.addEventListener("touchleave", this.handleTouchLeave, false);
  this.canvas.addEventListener("touchmove", this.handleTouchMove, false);
  window.addEventListener("devicemotion", this.handleDeviceMotion, false);
  if(!window.navigator.pointerEnabled)this.canvas.onmouseout = this.handleMouseOut;


  this.tick();};
} 



WebGLCanvas.prototype.start=function(){};
WebGLCanvas.prototype.onSetup=function(){};
WebGLCanvas.prototype.onDraw=function(){};
WebGLCanvas.prototype.handleKeys=function(){};
WebGLCanvas.prototype.handleKeyDown=function(event){};
WebGLCanvas.prototype.handleKeyUp=function(event){};
WebGLCanvas.prototype.handleMouseDown=function(event){};
WebGLCanvas.prototype.handleMouseUp=function(event){};
WebGLCanvas.prototype.handleMouseMove=function(event){};
WebGLCanvas.prototype.handleMouseOut=function(event){};
WebGLCanvas.prototype.handleTouchStart=function(event){};
WebGLCanvas.prototype.handleTouchEnd=function(event){};
WebGLCanvas.prototype.handleTouchMove=function(event){};
WebGLCanvas.prototype.handleTouchLeave=function(event){};
WebGLCanvas.prototype.handleTouchCancel=function(event){};
WebGLCanvas.prototype.handleDeviceMotion=function(event){};

WebGLCanvas.prototype.renderAllFrames=function(){this.rendering_mode=0;};
WebGLCanvas.prototype.renderWhenNecessary=function(){this.rendering_mode=1;};
WebGLCanvas.prototype.renderFrame=function(){this.render_now=true;if(this.in_draw)this.render_now_requested_in_draw=true;};

WebGLCanvas.prototype.tick=function()
{
	var self=this;
	requestAnimFrame(function(){self.tick();});
    this.handleKeys();
    this.camera.beginDraw();
    if(this.rendering_mode==0 || (this.rendering_mode==1 && (this.camera._view_changed || this.render_now || this.camera._projection_changed)))
    {
      this.gl.viewport(0,0, this.gl.viewportWidth, this.gl.viewportHeight);
      this.in_draw=true;
      this.onDraw();
      this.in_draw=false;
	  this.progress_bar.draw();
  	this.camera.endDraw();
	if(!this.render_now_requested_in_draw)
  		this.render_now=false;
  	else this.render_now_requested_in_draw=false;
    }
};

WebGLCanvas.prototype.init=function()
{
        try {
            this.gl = this.canvas.getContext("experimental-webgl",{antialias:true});
            this.gl.viewportWidth = this.canvas.width;
            this.gl.viewportHeight = this.canvas.height;
			//log(this.gl.getParameter(this.gl.SAMPLES));
        } catch (e) {
        }
        if (!this.gl) {
		if (this.canvas.getContext) {
		
		this.canvas.style.width=this.canvas.parentElement.clientWidth+'px';
		this.canvas.style.height=this.canvas.parentElement.clientHeight+'px';
		
		this.canvas.width=this.canvas.clientWidth;
		this.canvas.height=this.canvas.clientHeight;
		
              var ctx=this.canvas.getContext("2d");
		var imageObj = new Image();
		imageObj.crossOrigin = '';
		var cnvs=this.canvas;
	      imageObj.onload = function() {
	        ctx.drawImage(imageObj, 0, 0, cnvs.width, cnvs.height);
		    cnvs.addEventListener('click', function() { window.open("http://www.digitalepigraphy.org/toolbox/info.html");}, false);
      		};
      		imageObj.src = 'http://www.digitalepigraphy.org/js/webgl_error.png';
			}
			else
			{
				var e=document.getElementById('error-message');
				e.innerHTML='<a href="http://www.digitalepigraphy.org/toolbox/info.html" target="_blank"><img src="http://www.digitalepigraphy.org/js/webgl_error.png" width="'+cnvs.width+'" height="'+cnvs.height+'"/></a>';
			}
			return false;
        }
		else return true;
};

WebGLCanvas.prototype.setProgress=function(value)
{
	this.progress_bar.setProgress(value);
};

WebGLCanvas.prototype.setMaximumProgress=function(value)
{
this.progress_bar.setMaximumProgess(value);
};

WebGLCanvas.prototype.createFragmentShader_VNC=function()
    {
		var gl=this.gl;
		var source="";
    	 source+="	precision mediump float;		";
	 source+="	varying vec3 vLightWeighting;	";

    	 source+="	void main(void) {			";
        source+="	gl_FragColor = vec4(vec3(1,1,1) * vLightWeighting, 1);	";
    	 source+="	}";
	
	 var shader = gl.createShader(gl.FRAGMENT_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
WebGLCanvas.prototype.createVertexShader_VNC=function()
    {
		var gl=this.gl;
        var source="";
    	 source+="	attribute vec3 aVertexPosition;		";
    	 source+="	attribute vec3 aVertexNormal;		";
	 	 source+="	attribute vec3 aVertexColor;		";
	 source+="	uniform mat4 uMVMatrix;			";
   	 source+="	uniform mat4 uPMatrix;			";
    	 source+="	uniform mat3 uNMatrix;			";
    	 source+="	uniform vec3 uAmbientColor;			";
	 source+="	uniform vec3 uLightingDirection;		";
    	 source+="	uniform vec3 uDirectionalColor;		";
	 source+="	uniform bool uUseLighting;			";
	 source+="	uniform bool uUseColors;			";
	 source+="	varying vec3 vLightWeighting;		";

    	 source+="	void main(void) {	";
        source+="	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);	";
		source+="	if (!uUseLighting) {	";
        source+="	vLightWeighting = vec3(1.0, 1.0, 1.0);	";
        source+="	} else {	";
        source+="	vec3 transformedNormal = normalize(uNMatrix * aVertexNormal);	";
        source+="	float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);	";
        source+="	vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;	";
        source+="	}";
		source+="	if (uUseColors) {	";
		source+="	vLightWeighting *= aVertexColor;	";
        source+="	}";
		source+="	}";
	
	 var shader = gl.createShader(gl.VERTEX_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
 WebGLCanvas.prototype.createShader_VNC=function() {
		var gl=this.gl;
        var fragmentShader = this.createFragmentShader_VNC();
        var vertexShader = this.createVertexShader_VNC();

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
		
		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
		
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.useColorsUniform = gl.getUniformLocation(shaderProgram, "uUseColors");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");

		shaderProgram.pMatrixStamp=0;
		this.camera.updateProjection(shaderProgram);
	
	var normalMatrix = mat3.create();
	mat3.identity(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
	
	var mv = mat4.create();
	mat4.identity(mv);	
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mv);
	
	gl.uniform1i(shaderProgram.useLightingUniform, true);
	gl.uniform1i(shaderProgram.useColorsUniform, true);
	gl.uniform3fv(shaderProgram.lightingDirectionUniform, [-0.24390335148307188, 0.5646424733950354, 0.7884732286981352]);
	gl.uniform3f(shaderProgram.directionalColorUniform,0.9,0.9,0.9);
	gl.uniform3f(shaderProgram.ambientColorUniform,0.1,0.1,0.1);

	 return shaderProgram;
    };

WebGLCanvas.prototype.createFragmentShader_VC=function()
    {
		var gl=this.gl;
		var source="";
    	 source+="	precision mediump float;		";
	 source+="	varying vec3 vLightWeighting;	";

    	 source+="	void main(void) {			";
        source+="	gl_FragColor = vec4(vec3(1,1,1) * vLightWeighting, 1);	";
    	 source+="	}";
	
	 var shader = gl.createShader(gl.FRAGMENT_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
WebGLCanvas.prototype.createVertexShader_VC=function()
    {
		var gl=this.gl;
        var source="";
    	 source+="	attribute vec3 aVertexPosition;		";
	 	 source+="	attribute vec3 aVertexColor;		";
	 source+="	uniform mat4 uMVMatrix;			";
   	 source+="	uniform mat4 uPMatrix;			";
	 source+="	varying vec3 vLightWeighting;		";

    	 source+="	void main(void) {	";
        source+="	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);	";
		source+="	vLightWeighting = aVertexColor;	";
		source+="	}";
	
	 var shader = gl.createShader(gl.VERTEX_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
 WebGLCanvas.prototype.createShader_VC=function() {
		var gl=this.gl;
        var fragmentShader = this.createFragmentShader_VC();
        var vertexShader = this.createVertexShader_VC();

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
		
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

		shaderProgram.pMatrixStamp=0;
		this.camera.updateProjection(shaderProgram);
	
	var mv = mat4.create();
	mat4.identity(mv);	
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mv);
	
	 return shaderProgram;
    };

	
WebGLCanvas.prototype.createFragmentShader_V=function()
    {
		var gl=this.gl;
		var source="";
    	 source+="	precision mediump float;		";
	   source+="	varying vec4 vColor;		";

    	 source+="	void main(void) {			";
        source+="	gl_FragColor = vColor;	";
    	 source+="	}";
	
	 var shader = gl.createShader(gl.FRAGMENT_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
WebGLCanvas.prototype.createVertexShader_V=function()
    {
		var gl=this.gl;
        var source="";
    	 source+="	attribute vec3 aVertexPosition;		";
	 source+="	uniform mat4 uMVMatrix;			";
   	 source+="	uniform mat4 uPMatrix;			";
	 source+="	uniform vec4 uColor;		";
	  source+="	varying vec4 vColor;		";
	  source+="	uniform bool uFadeWithDistance;			";

    	 source+="	void main(void) {	";
        source+="	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);	";
		source+="	vColor=uColor;	";
		source+="	if(uFadeWithDistance) {	";
		source+="	vColor*=vec4(1.0,1.0,1.0,1.0/(1.0+2.0*length(gl_Position)));	";
		source+="	}	";
		source+="	}";
	
	 var shader = gl.createShader(gl.VERTEX_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
 WebGLCanvas.prototype.createShader_V=function() {
		var gl=this.gl;
        var fragmentShader = this.createFragmentShader_V();
        var vertexShader = this.createVertexShader_V();

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
			
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
		shaderProgram.fadeWithDistance = gl.getUniformLocation(shaderProgram, "uFadeWithDistance");
		
		shaderProgram.pMatrixStamp=0;
		this.camera.updateProjection(shaderProgram);
	
		var mv = mat4.create();
		mat4.identity(mv);	
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mv);
		
		gl.uniform4f(shaderProgram.colorUniform,1,1,1,1);
		gl.uniform1i(shaderProgram.fadeWithDistance, false);
		
		return shaderProgram;
    };
	
WebGLCanvas.prototype.createFragmentShader_VN=function()
    {
		var gl=this.gl;
		var source="";
    	 source+="	precision mediump float;		";
	 source+="	varying vec3 vLightWeighting;	";

    	 source+="	void main(void) {			";
        source+="	gl_FragColor = vec4(vec3(1,1,1) * vLightWeighting, 1);	";
    	 source+="	}";
	
	 var shader = gl.createShader(gl.FRAGMENT_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
WebGLCanvas.prototype.createVertexShader_VN=function()
    {
		var gl=this.gl;
        var source="";
    	 source+="	attribute vec3 aVertexPosition;		";
    	 source+="	attribute vec3 aVertexNormal;		";
	 source+="	uniform mat4 uMVMatrix;			";
   	 source+="	uniform mat4 uPMatrix;			";
    	 source+="	uniform mat3 uNMatrix;			";
    	 source+="	uniform vec3 uAmbientColor;			";
	 source+="	uniform vec3 uLightingDirection;		";
    	 source+="	uniform vec3 uDirectionalColor;		";
	 source+="	varying vec3 vLightWeighting;		";

    	 source+="	void main(void) {	";
        source+="	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);	";
        source+="	vec3 transformedNormal = normalize(uNMatrix * aVertexNormal);	";
        source+="	float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);	";
        source+="	vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;	";
		source+="	}";
	
	 var shader = gl.createShader(gl.VERTEX_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
 
 WebGLCanvas.prototype.createShader_VN=function() {
		var gl=this.gl;
        var fragmentShader = this.createFragmentShader_VN();
        var vertexShader = this.createVertexShader_VN();

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
		
		
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");

		shaderProgram.pMatrixStamp=0;
		this.camera.updateProjection(shaderProgram);
	
	var normalMatrix = mat3.create();
	mat3.identity(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
	
	var mv = mat4.create();
	mat4.identity(mv);	
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mv);
	
	gl.uniform3fv(shaderProgram.lightingDirectionUniform, [-0.24390335148307188, 0.5646424733950354, 0.7884732286981352]);
	gl.uniform3f(shaderProgram.directionalColorUniform,0.815,0.78,0.745);
	gl.uniform3f(shaderProgram.ambientColorUniform,0.1,0.1,0.1);

	 return shaderProgram;
    };

	
WebGLCanvas.prototype.createVertexShader_VT=function()
 {
        var source="";
    	 source+="	attribute vec3 aVertexPosition;		";
    	 source+="	attribute vec2 aTextureCoord;		";
	 source+="	uniform mat4 uMVMatrix;			";
   	 source+="	uniform mat4 uPMatrix;			";
	 source+="	varying vec2 vTextureCoord;			";

    	 source+="	void main(void) {	";
        source+="	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);	";
        source+="	vTextureCoord = aTextureCoord;	";
        source+="	}";
	var gl=this.gl;
	
	 var shader = gl.createShader(gl.VERTEX_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
	
WebGLCanvas.prototype.createFragmentShader_VT=function()
    {
        var source="";
    	 source+="	precision mediump float;		";
    	 source+="	varying vec2 vTextureCoord;		";
	 source+="    uniform sampler2D uSampler;		";
	 source+="	uniform vec4 uColorMask;		";
	 source+="	uniform vec4 uBrightness;		";

    	 source+="	void main(void) {			";
	 source+="	vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));	";
        source+="	gl_FragColor = uBrightness*uColorMask*textureColor;	";
    	 source+="	}";
	var gl=this.gl;
	
	 var shader = gl.createShader(gl.FRAGMENT_SHADER);
	 gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
	
WebGLCanvas.prototype.createShader_VT=function() {
        var fragmentShader = this.createFragmentShader_VT();
        var vertexShader = this.createVertexShader_VT();
		
	  var gl=this.gl;
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
		
		
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.uColorMask = gl.getUniformLocation(shaderProgram, "uColorMask");
 
		shaderProgram.uBrightness = gl.getUniformLocation(shaderProgram, "uBrightness"); 	
 	 
		shaderProgram.pMatrixStamp=0;
		this.camera.updateProjection(shaderProgram);
	 
	 var mv = mat4.create();
	mat4.identity(mv);	
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mv);
	gl.uniform4f(shaderProgram.uColorMask,1,1,1,1);
	gl.uniform4f(shaderProgram.uBrightness,1,1,1,1);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	 return shaderProgram;
    }
 
function WebGLShape(gl_canvas) //Constructor
{
	this.gl=gl_canvas.gl;
	this.canvas=gl_canvas;
    this.vertexPositionBuffer=null;
    this.vertexNormalBuffer=null;
	this.vertexColorBuffer=null;
	this.vertexColor2Buffer=null;
	this.vertexColor3Buffer=null;
	this.vertexColor4Buffer=null;
    this.vertexTextureCoordBuffer=null;
    this.vertexIndexBuffer=null;
	this.TRI_vertexIndexBuffer=null;
	this.LIN_vertexIndexBuffer=null;
	this.POI_vertexIndexBuffer=null;
    this.fid=0;
    this.filename="";
	this.corners=null;
	this.projectedCorners=null;
	this.num_of_corners=0;
}

WebGLShape.prototype.setCorners=function(corners)
{
	this.corners=corners;
	this.num_of_corners=this.corners.length/3;
	this.projectedCorners=new Float32Array(this.num_of_corners*2);
}

WebGLShape.prototype.projectCorners=function(modelViewPerspMatrix,width,height)
 {
   if(this.num_of_corners==0) return;
   var newPos = [0, 0, 0, 0];
   var cameraPos = [0, 0, 0, 1];
   var idx=0;
   var idx2=0;
   for(var i=0;i<this.num_of_corners;i++)
   {
		cameraPos = [this.corners[idx], this.corners[idx+1], this.corners[idx+2], 1];
		mat4.multiplyVec4(modelViewPerspMatrix, cameraPos, newPos);
		this.projectedCorners[idx2]=width*(1+newPos[0]/newPos[3])/2;
		this.projectedCorners[idx2+1]=height*(1-newPos[1]/newPos[3])/2;
		idx+=3;
		idx2+=2;
   }
 }
 
 WebGLShape.prototype.insideConvex=function(x,y)
 {
   if(this.num_of_corners==0) return false;
   var p1=0;
   var p2=0;
   var out=false;
   var v=0;
   
   for(var i=0;i<this.num_of_corners && !out;i++)
   {
		p1=i;
		p2=i+1;
		if(p2==this.num_of_corners)p2=0;
		v = (this.projectedCorners[p2*2+1] - this.projectedCorners[p1*2+1]) * x + (this.projectedCorners[p1*2+0] - this.projectedCorners[p2*2+0]) *y + (this.projectedCorners[p2*2+0] * this.projectedCorners[p1*2+1]) - (this.projectedCorners[p1*2+0] * this.projectedCorners[p2*2+1]);
		if(v<0) out=true;
   }
   
   return !out;
 }

 //assumes that three corners are given, the one that corresponds to the following points on a plane: (0,0), (1,0), (0,1)
 WebGLShape.prototype.onPlane=function(x,y)
 {
   var a=this.projectedCorners[2]-this.projectedCorners[0];
   var b=this.projectedCorners[3]-this.projectedCorners[1];
   var c=this.projectedCorners[4]-this.projectedCorners[0];
   var d=this.projectedCorners[5]-this.projectedCorners[1];
   var det=a*d-b*c;
   var inv_a=d/det;
   var inv_b=-b/det;
   var inv_c=-c/det;
   var inv_d=a/det;
   x=x-this.projectedCorners[0];
   y=y-this.projectedCorners[1];
   return [inv_a*x+inv_c*y, inv_b*x+inv_d*y];
   
 }
 
WebGLShape.prototype.setXYZ=function(vertices)
{
	var gl=this.gl;
	if(this.vertexPositionBuffer==null) this.vertexPositionBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
       this.vertexPositionBuffer.itemSize = 3;
       this.vertexPositionBuffer.numItems = vertices.length/3;
}

WebGLShape.prototype.setNormals=function(vertices)
{
	var gl=this.gl;
	if(this.vertexNormalBuffer==null) this.vertexNormalBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
       this.vertexNormalBuffer.itemSize = 3;
       this.vertexNormalBuffer.numItems = vertices.length/3;
}

WebGLShape.prototype.setColors=function(colors)
{
	var gl=this.gl;
	if(this.vertexColorBuffer==null) this.vertexColorBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
       this.vertexColorBuffer.itemSize = 3;
       this.vertexColorBuffer.numItems = colors.length/3;
}

WebGLShape.prototype.setColors2=function(colors)
{
	var gl=this.gl;
	this.vertexColor2Buffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor2Buffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
       this.vertexColor2Buffer.itemSize = 3;
       this.vertexColor2Buffer.numItems = colors.length/3;
}

WebGLShape.prototype.setColors3=function(colors)
{
	var gl=this.gl;
	this.vertexColor3Buffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor3Buffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
       this.vertexColor3Buffer.itemSize = 3;
       this.vertexColor3Buffer.numItems = colors.length/3;
}

WebGLShape.prototype.setColors4=function(colors)
{
	var gl=this.gl;
	this.vertexColor4Buffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor4Buffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
       this.vertexColor4Buffer.itemSize = 3;
       this.vertexColor4Buffer.numItems = colors.length/3;
}

WebGLShape.prototype.setUV=function(vertices)
{
	var gl=this.gl;
	if(this.vertexTextureCoordBuffer==null) this.vertexTextureCoordBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);    
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
       this.vertexTextureCoordBuffer.itemSize = 2;
       this.vertexTextureCoordBuffer.numItems = vertices.length/2;
}

WebGLShape.prototype.setTRI=function(vertices)
{
	var gl=this.gl;
	if(this.TRI_vertexIndexBuffer==null) this.TRI_vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.TRI_vertexIndexBuffer);
 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gl.STATIC_DRAW);
    	
    	
    this.TRI_vertexIndexBuffer.itemSize = 1;
    this.TRI_vertexIndexBuffer.numItems = vertices.length;
	
	this.vertexIndexBuffer=this.TRI_vertexIndexBuffer;
	this.shape=gl.TRIANGLES;
}

WebGLShape.prototype.setPOI=function(vertices)
{
	var gl=this.gl;
	if(this.POI_vertexIndexBuffer==null) this.POI_vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.POI_vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gl.STATIC_DRAW);
    this.POI_vertexIndexBuffer.itemSize = 1;
    this.POI_vertexIndexBuffer.numItems = vertices.length;
	
	this.vertexIndexBuffer=this.POI_vertexIndexBuffer;
	this.shape=gl.POINTS;
}

WebGLShape.prototype.setLIN=function(vertices)
{
	var gl=this.gl;
	if(this.LIN_vertexIndexBuffer==null) this.LIN_vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.LIN_vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gl.STATIC_DRAW);
    this.LIN_vertexIndexBuffer.itemSize = 1;
    this.LIN_vertexIndexBuffer.numItems = vertices.length;
	
	this.vertexIndexBuffer=this.LIN_vertexIndexBuffer;
	this.shape=gl.LINES;
}

WebGLShape.prototype.setDrawModeLines=function()
{
	if(this.LIN_vertexIndexBuffer!=null)
	{
		this.vertexIndexBuffer=this.LIN_vertexIndexBuffer;
		this.shape=this.gl.LINES;
	}
}

WebGLShape.prototype.setDrawModePoints=function()
{
	if(this.POI_vertexIndexBuffer!=null)
	{
		this.vertexIndexBuffer=this.POI_vertexIndexBuffer;
		this.shape=this.gl.POINTS;
	}
}

WebGLShape.prototype.setDrawModeTriangles=function()
{
	if(this.TRI_vertexIndexBuffer!=null)
	{
		this.vertexIndexBuffer=this.TRI_vertexIndexBuffer;
		this.shape=this.gl.TRIANGLES;
	}
}

WebGLShape.prototype.draw=function(shaderProgram)
{
	var gl=this.gl;

	if(this.vertexPositionBuffer!=null)
	{
	 gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
	
	if(this.vertexNormalBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	if(this.vertexColorBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
	
	if(this.vertexTextureCoordBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	if(this.vertexIndexBuffer!=null)
	{
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.drawElements(this.shape, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}

WebGLShape.prototype.drawHeightmap=function(shaderProgram)
{
	var gl=this.gl;
	if(this.vertexPositionBuffer!=null)
	{
	 gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
	
	if(this.vertexNormalBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	if(this.vertexColorBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor2Buffer);
		gl.vertexAttribPointer(shaderProgram.vertexColor2Attribute, this.vertexColor2Buffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor3Buffer);
		gl.vertexAttribPointer(shaderProgram.vertexColor3Attribute, this.vertexColor3Buffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor4Buffer);
		gl.vertexAttribPointer(shaderProgram.vertexColor4Attribute, this.vertexColor4Buffer.itemSize, gl.FLOAT, false, 0, 0);
	}
	
	if(this.vertexTextureCoordBuffer!=null)
	{
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	if(this.vertexIndexBuffer!=null)
	{
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	    gl.drawElements(this.shape, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}

WebGLShape.prototype.onload=function(){};

WebGLShape.prototype.handleLoadedObject=function(txt)
{ 
	var lines=txt.split("#");
	var xyz=new Float32Array(lines[0].split(","));
	var nrm=new Float32Array(lines[1].split(","));
	var tri=new Uint16Array(lines[2].split(","));
	this.setXYZ(xyz);
	this.setTRI(tri);
	this.setNormals(nrm);
	this.setColors(xyz);
	this.onload();
}

WebGLShape.prototype.downloadLowRes=function(fnm,id)
{
  this.filename=fnm;
  this.fid=id;
  var file_request;
  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  	file_request=new XMLHttpRequest();
  }
  else
  {// code for IE6, IE5
  	file_request=new ActiveXObject("Microsoft.XMLHTTP");
  }	
  var o=this;
  file_request.onreadystatechange=function()
  {
	if (file_request.readyState==4 && file_request.status==200)
	{
		o.handleLoadedObject(file_request.responseText);
		o.downloadHighRes();
	}
  }

  file_request.open("GET",this.filename+".low."+(this.fid+1),true);
  file_request.send();
}

WebGLShape.prototype.downloadHighRes=function()
{
  var file_request;
  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  	file_request=new XMLHttpRequest();
  }
  else
  {// code for IE6, IE5
  	file_request=new ActiveXObject("Microsoft.XMLHTTP");
  }	
  var o=this;
  file_request.onreadystatechange=function()
  {
	if (file_request.readyState==4 && file_request.status==200)
			o.handleLoadedObject(file_request.responseText);
  }

  file_request.open("GET",this.filename+"."+(this.fid+1),true);
  file_request.send();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function createRect(canvas,w,h,u,v)
{
	var _obj=new WebGLShape(canvas);
	var _xyz=new Float32Array(4*3);
	var _uv=new Float32Array(4*2);
	var _tri=new Uint16Array(2*3);
	
	_xyz[0]=w/2.0; _xyz[1]=h/2.0; _xyz[2]=0;
	_xyz[3]=-w/2.0; _xyz[4]=h/2.0; _xyz[5]=0;
	_xyz[6]=-w/2.0; _xyz[7]=-h/2.0; _xyz[8]=0;
	_xyz[9]=w/2.0; _xyz[10]=-h/2.0; _xyz[11]=0;
	
	_tri[0]=0;_tri[1]=1;_tri[2]=2;
	_tri[3]=0;_tri[4]=2;_tri[5]=3;

	_uv[0]=u;_uv[1]=v;
	_uv[2]=0;_uv[3]=v;
	_uv[4]=0;_uv[5]=0;
	_uv[6]=u;_uv[7]=0;
	
	_obj.setXYZ(_xyz);
	_obj.setTRI(_tri);
	_obj.setUV(_uv);
	return _obj;
}

function createSphere(canvas,radius_xz, radius_y, repetitions, from_phi,to_phi,resolution_phi,from_theta,to_theta,resolution_theta)
{
	var _obj=new WebGLShape(canvas);
	var _xyz=new Array();
	var _uv=new Array();
	var _tri=new Array();
	var theta;
	var v;
	var theta_next;
	var v_next;
	var sin_theta;
	var cos_theta;
	var sin_theta_next;
	var cos_theta_next;
	var phi;
	var u;
	var phi_next;
	var u_next;
	var sin_phi;
	var cos_phi;
    var sin_phi_next;
	var cos_phi_next;
	var offset_u=0;
	var quad=0;
	for(j=from_theta;j<to_theta-1;j++)
		{	
			theta=(j*3.1416)/(2*(resolution_theta-1));
			v=(j-from_theta)/(to_theta-from_theta-1);
			theta_next=((j+1)*3.1416)/(2*(resolution_theta-1));
			v_next=(j-from_theta+1)/(to_theta-from_theta-1);
			sin_theta=Math.sin(theta);
			cos_theta=Math.cos(theta);
			sin_theta_next=Math.sin(theta_next);
			cos_theta_next=Math.cos(theta_next);
			
			for(k=from_phi;k<to_phi-1;k++)
			{
				phi=-3.1416/2+(k*3.1416)/(resolution_phi-1);
				u=offset_u+repetitions*(k-from_phi)/(to_phi-from_phi-1);
				phi_next=-3.1416/2+((k+1)*3.1416)/(resolution_phi-1);
				u_next=offset_u+repetitions*(k-from_phi+1)/(to_phi-from_phi-1);
				sin_phi=Math.sin(phi);
				cos_phi=Math.cos(phi);
				sin_phi_next=Math.sin(phi_next);
				cos_phi_next=Math.cos(phi_next);
				
				_uv[_uv.length]=u;_uv[_uv.length]=v;
				_xyz[_xyz.length]=sin_phi*cos_theta*radius_xz;_xyz[_xyz.length]=sin_theta*radius_y;_xyz[_xyz.length]=-cos_phi*cos_theta*radius_xz;
				_uv[_uv.length]=u_next;_uv[_uv.length]=v;
				_xyz[_xyz.length]=sin_phi_next*cos_theta*radius_xz;_xyz[_xyz.length]=sin_theta*radius_y;_xyz[_xyz.length]=-cos_phi_next*cos_theta*radius_xz;
				_uv[_uv.length]=u_next;_uv[_uv.length]=v_next;
				_xyz[_xyz.length]=sin_phi_next*cos_theta_next*radius_xz;_xyz[_xyz.length]=sin_theta_next*radius_y;_xyz[_xyz.length]=-cos_phi_next*cos_theta_next*radius_xz;
				_uv[_uv.length]=u;_uv[_uv.length]=v_next;
				_xyz[_xyz.length]=sin_phi*cos_theta_next*radius_xz;_xyz[_xyz.length]=sin_theta_next*radius_y;_xyz[_xyz.length]=-cos_phi*cos_theta_next*radius_xz;
				_tri[_tri.length]=quad*4;
				_tri[_tri.length]=quad*4+1;
				_tri[_tri.length]=quad*4+2;
				_tri[_tri.length]=quad*4;
				_tri[_tri.length]=quad*4+2;
				_tri[_tri.length]=quad*4+3;
				quad+=1;
			}
		}	
	_obj.setXYZ(_xyz);
	_obj.setTRI(_tri);
	_obj.setUV(_uv);
	return _obj;
}

var convert_texture_canvas = document.createElement('canvas')
     convert_texture_canvas.width = 512;
     convert_texture_canvas.height = 512;
var convert_texture_ctx = convert_texture_canvas.getContext('2d');   

var default_texture_image=new Image();
default_texture_image.crossOrigin = '';
default_texture_image.src = "http://www.digitalepigraphy.org/js/default_texture.png";

function WebGLTexture(gl_canvas,filename,name)
{
	this.gl=gl_canvas.gl;
	this.canvas=gl_canvas;
	var gl=this.gl;
	this.texture = gl.createTexture();
    this.texture.image = new Image();
	this.texture.image.crossOrigin = '';
	if(typeof name !== 'undefined')
		this.name=name;
	else this.name="";
		
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, default_texture_image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
	if(typeof filename !== 'undefined')
	{
		var t=this;
		this.texture.image.onload = function () {
				t.handleLoadedTexture();
			}
		this.texture.image.src = filename;
	}
}

WebGLTexture.prototype.handleLoadedTexture=function() {
	var gl=this.gl;
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        this.canvas.renderFrame();
        //var self=this;
        //requestAnimFrame(function(){self.canvas.renderFrame();});
    }

WebGLTexture.prototype.update=function(video_source)
{
	if( video_source.readyState === video_source.HAVE_ENOUGH_DATA ){
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	convert_texture_ctx.drawImage(video_source,0,0, 512, 512);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, convert_texture_ctx.getImageData(0,0,512,512));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}
	
WebGLTexture.prototype.use=function()
{
	var gl=this.gl;
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
}

function WebGLInstruction(image_composition)
{
	this.id=0;
	this.image_composition=image_composition;
}

WebGLInstruction.prototype.translate=function(x,y,z)
{
	this.id=1;
	this.valf=[x,y,z];
}

WebGLInstruction.prototype.rotate=function(angle,x,y,z)
{
	this.id=2;
	this.valf=[degToRad(angle),x,y,z];
}
		
WebGLInstruction.prototype.pushMatrix=function()
{
	this.id=3;		
}
		
WebGLInstruction.prototype.popMatrix=function()
{
	this.id=4;
}
		
WebGLInstruction.prototype.begin=function(type)
{
	this.id=5;
	this.vali=[type];
}
		
WebGLInstruction.prototype.end=function(obj)
{
	this.id=6;
	this.obj=obj;
}
		
WebGLInstruction.prototype.enable=function(type)
{
	this.id=7;
	this.vali=[type];
}
		
WebGLInstruction.prototype.disable=function(type)
{
	this.id=8;
	this.vali=[type];
}
		
WebGLInstruction.prototype.vertex=function(x,y,z)
{
	this.id=9;
	this.valf=[x,y,z];
}
		
WebGLInstruction.prototype.texcoord=function(u,v)
{
	this.id=10;
	this.valf=[u,v];
}
		
WebGLInstruction.prototype.color=function(r,g,b)
{
	this.id=11;
	this.valf=[r,g,b];
}
		
WebGLInstruction.prototype.bindTexture=function(texture)
{
	this.id=12;
	this.texture=texture;
}
		
WebGLInstruction.prototype.rectange=function(w,h,u,v)
{
	this.id=13;
	this.valf=[w,h,u,v];
}
		
WebGLInstruction.prototype.clearColor=function(r,g,b)
{
	this.id=14;
	this.valf=[r,g,b];
}

WebGLInstruction.prototype.command=function()
{
	switch(this.id)
	{
	case 1:
		return "translate";
	case 2:
		return "rotate";
	case 3:
		return "pushMatrix";
	case 4:
		return "popMatrix";
	case 5:
		return "begin";
	case 6:
		return "end";
	case 7:
		return "enable";
	case 8:
		return "disable";
	case 9:
		return "vertex";
	case 10:
		return "texCoord";
	case 11:
		return "color";
	case 12:
		return "bindTexture";
	case 13:
		return "rectangle";
	case 14:
		return "clearColor";
	};
	return "";
}

WebGLInstruction.prototype.execute=function()
{
	var gl=this.image_composition.gl;
	switch(this.id)
	{
	case 1:
		mat4.translate(this.image_composition.mvMatrix,this.valf);
		break;
	case 2:
		mat4.rotate(this.image_composition.mvMatrix, this.valf[0],[this.valf[1],this.valf[2],this.valf[3]]);
		break;
	case 3:
		this.image_composition.mvPushMatrix();
		break;
	case 4:
		this.image_composition.mvPopMatrix();
		break;
	case 5:
		//gl.glBegin(this.vali[0]);
		break;
	case 6:
		//gl.glEnd();
		this.image_composition.gl.uniformMatrix4fv(this.image_composition.shaderProgram.mvMatrixUniform, false, this.image_composition.mvMatrix);
		this.obj.draw(this.image_composition.shaderProgram);
		break;
	case 7:
		this.image_composition.gl.enable(this.vali[0]);
		break;
	case 8:
		this.image_composition.gl.disable(this.vali[0]);
		break;
	case 9:
		//gl.glVertex3f(this.valf[0],this.valf[1],this.valf[2]);
		break;
	case 10:
		//gl.glTexCoord2f(this.valf[0],this.valf[1]);
		break;
	case 11:
		//gl.glColor3f(this.valf[0], this.valf[1], this.valf[2]);
		this.image_composition.gl.uniform4f(this.image_composition.shaderProgram.uColorMask,this.valf[0], this.valf[1], this.valf[2],1);
		break;
	case 12:
		if(this.texture!=null && this.texture.texture!=-1)this.image_composition.gl.bindTexture(this.image_composition.gl.TEXTURE_2D, this.texture.texture);
		break;
	case 13:
		if(typeof this.obj !== 'undefined')
		{
			this.image_composition.gl.uniformMatrix4fv(this.image_composition.shaderProgram.mvMatrixUniform, false, this.image_composition.mvMatrix);
			this.obj.draw(this.image_composition.shaderProgram);
		}
		else this.obj=createRect(this.image_composition.canvas,this.valf[0],this.valf[1],this.valf[2],this.valf[3]);
		break;
	case 14:
		this.image_composition.gl.clearColor(this.valf[0],this.valf[1],this.valf[2],1.0);
		break;
	};
}
 

function WebGLImageComposition(canvas)
{
	this.canvas=canvas;
	this.gl=canvas.gl;
	this.loaded=false;
	this.mvMatrixStack = [];
	this.mvMatrix=null;
	this.shaderProgram=canvas.createShader_VT();
	this.brightness=1;
}
	
WebGLImageComposition.prototype.load=function(fnm)
{
	this.filename=fnm;
	this.instructions=new Array();
	this.textures=new Array();
	var file_request;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		file_request=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		file_request=new ActiveXObject("Microsoft.XMLHTTP");
	}	
	var self=this;
	file_request.onreadystatechange=function()
	{
		if (file_request.readyState==4 && file_request.status==200)
		{
			self.handleLoadedFile(file_request.responseText);
		}
	}

	file_request.open("GET",this.filename+"/cgi",true);
	file_request.send();
}

WebGLImageComposition.prototype.setBrightness=function(v)
{
	this.brightness=v;
	this.gl.useProgram(this.shaderProgram);
	this.gl.uniform4f(this.shaderProgram.uBrightness,this.brightness,this.brightness,this.brightness,1);
}

WebGLImageComposition.prototype.decreaseBrightness=function(v)
{
	this.brightness-=v;
	if(this.brightness<0)this.brightness=0;
	this.gl.uniform4f(this.shaderProgram.uBrightness,this.brightness,this.brightness,this.brightness,1);
}

WebGLImageComposition.prototype.increaseBrightness=function(v)
{
	this.brightness+=v;
	if(this.brightness>1)this.brightness=1;
	this.gl.uniform4f(this.shaderProgram.uBrightness,this.brightness,this.brightness,this.brightness,1);
}

WebGLImageComposition.prototype.mvPushMatrix=function() {
    var copy = mat4.create();
    mat4.set(this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
}

WebGLImageComposition.prototype.mvPopMatrix=function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
}

WebGLImageComposition.prototype.getKeywordID=function(s)
{
	if(s.toUpperCase()==="LINES") return this.gl.LINES;
	else if(s.toUpperCase()==="TRIANGLES") return this.gl.TRIANGLES;
	else if(s.toUpperCase()==="QUADS") return "QUADS";
	else if(s.toUpperCase()==="TEXTURES") return "TEXTURES";
	else if(s.toUpperCase()==="DEPTH_TEST") return this.gl.DEPTH_TEST;
	else if(s.toUpperCase()==="BLEND") return this.gl.BLEND;
	else return 0;
}

WebGLImageComposition.prototype.getTextureByName=function(s)
{
	var found=-1;
	var ret;
	for(var i=0;i<this.textures.length && found==-1;i++)
	{
		if(this.textures[i].name.toUpperCase()===s.toUpperCase())
		{
			found=i;
			ret=this.textures[i];
		}
	}
	return ret;
}

WebGLImageComposition.prototype.handleLoadedFile=function(text)
{
	var gl=this.gl;
	var line=text.split("\n");
	for(l=0;l<line.length;l++)
	{
		var tokens=line[l].split(/\s+/);
		
		if(tokens.length>1 && tokens[0].length==0)
		{
			var tokens2=new Array();
			for(i=1;i<tokens.length;i++)
					tokens2[i-1]=tokens[i];
			tokens=tokens2;
		}

		if(tokens.length>=4 && tokens[0].toUpperCase()==="TRANSLATE")
		{
			var i=new WebGLInstruction(this);
			i.translate(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=5 && tokens[0].toUpperCase()==="ROTATE")
		{
			var i=new WebGLInstruction(this);
			i.rotate(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), parseFloat(tokens[4]));
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=1 && tokens[0].toUpperCase()==="PUSHMATRIX")
		{
			var i=new WebGLInstruction(this);
			i.pushMatrix();
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=1 && tokens[0].toUpperCase()==="POPMATRIX")
		{
			var i=new WebGLInstruction(this);
			i.popMatrix();
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=2 && tokens[0].toUpperCase()==="BEGIN")
		{
			var i=new WebGLInstruction(this);
			i.begin(this.getKeywordID(tokens[1]));
			this.instructions[this.instructions.length]=i;
			this.mem_begin=i.vali[0];
			this.mem_xyz=new Array();
			//this.mem_clr=new Array();
			this.mem_uv=new Array();
		}
		else if(tokens.length>=1 && tokens[0].toUpperCase()==="END")
		{
			var i=new WebGLInstruction(this);
			var obj=new WebGLShape(this.canvas);
			if(this.mem_begin==gl.TRIANGLES)
			{
				obj.setXYZ(this.mem_xyz);
				var s=this.mem_xyz.length/3;
				var mem_tri=new Uint16Array(s);
				for(j=0;j<s;j++)mem_tri[j]=j;
				obj.setTRI(mem_tri);
				obj.setUV(this.mem_uv);
			}
			else if(this.mem_begin==="QUADS")
			{
				obj.setXYZ(this.mem_xyz);
				var s=this.mem_xyz.length/12;
				var mem_tri=new Uint16Array(s*6);
				for(j=0;j<s;j++)
				{
					mem_tri[j*6]=j*4;
					mem_tri[j*6+1]=j*4+1;
					mem_tri[j*6+2]=j*4+2;
					mem_tri[j*6+3]=j*4;
					mem_tri[j*6+4]=j*4+2;
					mem_tri[j*6+5]=j*4+3;
				}
				obj.setTRI(mem_tri);
				obj.setUV(this.mem_uv);
			}
			i.end(obj);
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=2 && tokens[0].toUpperCase()==="ENABLE")
		{
			var i=new WebGLInstruction(this);
			i.enable(this.getKeywordID(tokens[1]));
			if(i.vali[0]=="TEXTURES")
			{}
			else
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=2 && tokens[0].toUpperCase()==="DISABLE")
		{
			var i=new WebGLInstruction(this);
			i.disable(this.getKeywordID(tokens[1]));
			if(i.vali[0]=="TEXTURES")
			{}
			else
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=4 && tokens[0].toUpperCase()==="VERTEX")
		{
			var i=new WebGLInstruction(this);
			i.vertex(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
			this.instructions[this.instructions.length]=i;
			this.mem_xyz[this.mem_xyz.length]=i.valf[0];
			this.mem_xyz[this.mem_xyz.length]=i.valf[1];
			this.mem_xyz[this.mem_xyz.length]=i.valf[2];
		}
		else if(tokens.length>=3 && tokens[0].toUpperCase()==="TEXCOORD")
		{
			var i=new WebGLInstruction(this);
			i.texcoord(parseFloat(tokens[1]), parseFloat(tokens[2]));
			this.instructions[this.instructions.length]=i;
			this.mem_uv[this.mem_uv.length]=i.valf[0];
			this.mem_uv[this.mem_uv.length]=i.valf[1];
		}
		else if(tokens.length>=4 && tokens[0].toUpperCase()==="COLOR")
		{
			var i=new WebGLInstruction(this);
			i.color(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
			this.instructions[this.instructions.length]=i;
			//this.mem_clr[this.mem_clr.length]=i.valf[0];
			//this.mem_clr[this.mem_clr.length]=i.valf[1];
			//this.mem_clr[this.mem_clr.length]=i.valf[2];
		}
		else if(tokens.length>=2 && tokens[0].toUpperCase()==="BINDTEXTURE")
		{
			var i=new WebGLInstruction(this);
			i.bindTexture(this.getTextureByName(tokens[1]));
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=3 && tokens[0].toUpperCase()==="TEXTURE")
		{
			var t=new WebGLTexture(this.canvas,this.filename+"/"+tokens[2],tokens[1]);
			this.textures[this.textures.length]=t;
		}
		else if(tokens.length>=3 && tokens[0].toUpperCase()==="ALPHATEXTURE")
		{
			var t=new WebGLTexture(this.canvas,this.filename+"/"+tokens[2],tokens[1]);
			this.textures[this.textures.length]=t;
		}
		else if(tokens.length>=5 && tokens[0].toUpperCase()==="RECTANGLE")
		{
			var i=new WebGLInstruction(this);
			i.rectange(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), parseFloat(tokens[4]));
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=3 && tokens[0].toUpperCase()==="RECTANGLE")
		{
			var i=new WebGLInstruction(this);
			i.rectange(parseFloat(tokens[1]), parseFloat(tokens[2]), 1,1);
			this.instructions[this.instructions.length]=i;
		}
		else if(tokens.length>=4 && tokens[0].toUpperCase()==="CLEARCOLOR")
		{
			var i=new WebGLInstruction(this);
			i.clearColor(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
			this.instructions[this.instructions.length]=i;
		}
	}
	this.loaded=true;
}

WebGLImageComposition.prototype.draw=function()
{
	if(this.loaded==false)return;
	this.mvMatrix= mat4.create();
    mat4.set(this.canvas.camera.mvMatrix,this.mvMatrix);
	this.gl.useProgram(this.shaderProgram);
	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.canvas.camera.pMatrix);
	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	
	for(i=0;i<this.instructions.length;i++)
		this.instructions[i].execute();
}

function WebGLProgressBar(gl_canvas,width)
 {
	this.max_value=100;
	this.value=0;
	this.gl=gl_canvas.gl;
	this.canvas=gl_canvas;
	
	this.mvMatrix = mat4.create();
	mat4.identity(this.mvMatrix);
	this.pMatrix = mat4.create();
	this.width=width*this.canvas.camera.realToCSSPixels;
	
	var fovX=45*Math.PI/180;
	var d = (this.gl.viewportWidth * 0.5) / Math.tan(fovX * 0.5);
	var fovY = 2 * 180/Math.PI * Math.atan((this.width * 0.5) / d);
	mat4.perspective(fovY, this.gl.viewportWidth/this.width, 0.1, 100.0, this.pMatrix);
				
	this.obj=new WebGLShape(this.canvas);
	this.obj.setXYZ([1.0, -1.0,  -2.42, 1.0, 1.0,  -2.42, -1.0,  1.0,  -2.42, -1.0,  -1.0,  -2.42]);
	this.obj.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);
	this.obj.setColors([0,0,1,0,0,1,1,1,1,1,1,1]);
	this.obj.setTRI([0, 1, 2, 0, 2, 3]);
	
	this.shaderProgram=this.canvas.createShader_VNC();
	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	
 }
 
 
 WebGLProgressBar.prototype.setProgress=function(value)
 {
 	var v=value;
 	if(v>this.max_value) v=this.max_value;
 	else if(v<0)c=0;
 	if(v!=this.value)
 	{
 		this.value=v;
 		this.canvas.renderFrame();
 	}
 };
 
 WebGLProgressBar.prototype.setMaximumProgress=function(value)
 {
 	var v=value;
 	if(v<=0) return;
 	if(v!=this.max_value)
 	{
 		if(this.value>v) this.value=v;
 		this.max_value=v;
 		this.canvas.renderFrame();
 	}
 };
 WebGLProgressBar.prototype.draw=function()
 {
	if(this.value==0)return;
 
	var gl=this.gl;
	
	
	gl.viewport(0, gl.viewportHeight-this.width, gl.viewportWidth, this.width);
	
	gl.useProgram(this.shaderProgram);		
	
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [-2+2*this.value/this.max_value, 0.0, 0.0]);
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	gl.disable(gl.DEPTH_TEST);
	this.obj.draw(this.shaderProgram);
	gl.enable(gl.DEPTH_TEST);
 };

function WebGLCamera(gl_canvas)
{
	this.gl=gl_canvas.gl;
	this.canvas=gl_canvas;
	this.canvasElement=gl_canvas.canvas;
	this.div_container=this.canvasElement.parentElement;
	this.container_width=0;
	this.container_height=0;
	
	this.realToCSSPixels = window.devicePixelRatio || 1;
	
	this.animation_frames=0;
	this.anim_zoom0=0.0;
	this.anim_rotx0=0.0;
	this.anim_roty0=0.0;
	this.anim_zoom1=0.0;
	this.anim_rotx1=0.0;
	this.anim_roty1=0.0;
	this.anim_zoom2=0.0;
	this.anim_rotx2=0.0;
	this.anim_roty2=0.0;
	this.total_animation_frames=800;
	
	this.width=1;
	this.height=1;
	
	this.zoom=1;
	this.zoom_mem=1;
	this.working_zoom=1;
	this.working_zRot=0;
	this.xRot=0;
	this.yRot=0;
	this.zRot=0;
	this.enable_rotateZ=false;
	this.scale=1;
	this.xTra=0;
	this.yTra=0;
	
	this.xLig = 0.6;
    this.yLig = -0.3;
    
    this.speed_yRot=0;
	this.speed_xRot=0;//UNITS PER SECOND
	this.speed_zRot=0;//UNITS PER SECOND
	this.speed_xTra=0;//UNITS PER SECOND
	this.speed_yTra=0;//UNITS PER SECOND
	
	this.mvMatrixStack=[];
	
	this.mvMatrix = mat4.create();
	mat4.identity(this.mvMatrix);

	this.ixMatrix = mat4.create();
	mat4.identity(this.ixMatrix);
	
	this.ixMatrix_mem = mat4.create();
	mat4.identity(this.ixMatrix_mem);

	this.pMatrix = mat4.create();
	mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
	this._projection_changed=true;
	this._view_changed=true;
	
	this.projection_changed_stamp=0;
	this.view_changed_stamp=0;
	
	this.light_changed=true;
	this.size_changed=true;
	
	
	this.screen_x=0;
	this.screen_y=0;
	this.screen_z=-0.1;
	this.screen_height2 = 0.1 * Math.tan((3.1415/180)*45/2);
	this.screen_width2 = 4*this.screen_height2/3;
	this.screen_far=1000;
	this.viewer_projection_x=0;
	this.viewer_projection_y=0;
	this.viewer_projection_z=0.1;
	this.viewer_position_x=0;
	this.viewer_position_y=0;
	this.viewer_position_z=0;
	
	this.mouseX=0;
	this.mouseY=0;
	this.finger_distance=0;

	this.original_mouseX=0;
	this.original_mouseY=0;
	this.original_finger_distance=0;
	
	this.next_object_rotation=0;
	this.next_object_animation=0;
	
	this.mouse_moved=false;
	
	this.lastTimeDraw=0;
	this.inverseFPS=0;
}

WebGLCamera.prototype.updateProjection=function(shaderProgram)
{
	if(shaderProgram.pMatrixStamp!=this.projection_changed_stamp)
	{
	  shaderProgram.pMatrixStamp=this.projection_changed_stamp;
	  this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
	}
};

WebGLCamera.prototype.getFPS=function()
{
	return 1/this.inverseFPS;
};

WebGLCamera.prototype.pushMatrix=function() {
    var copy = mat4.create();
    mat4.set(this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
};

WebGLCamera.prototype.popMatrix=function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
};

WebGLCamera.prototype.beginDraw=function()
{
	var timeNow = new Date().getTime();
	if (this.lastTimeDraw != 0) 
        this.inverseFPS = (timeNow - this.lastTimeDraw)/1000;
	this.lastTimeDraw=timeNow;
	
	//If the container div has been resized
	if(this.div_container.clientWidth!=this.container_width || this.div_container.clientHeight!=this.container_height)
	{	
		this.container_width=this.div_container.clientWidth;
		this.container_height=this.div_container.clientHeight;
		
		//make the size of the canvas to match the size of the div (in CSS pixels, not in actual device pixels)
		this.canvasElement.style.width=this.div_container.clientWidth+'px';
		this.canvasElement.style.height=this.div_container.clientHeight+'px';
		
		//calculate the rendering size of the corresponding pixels in the device
		this.width = Math.floor(this.canvasElement.clientWidth  * this.realToCSSPixels);
		this.height = Math.floor(this.canvasElement.clientHeight * this.realToCSSPixels);
		
		//set the size of the image/canvas to be as many as the pixels of the device
		this.canvasElement.width = this.width;
		this.canvasElement.height = this.height;
		this.gl.viewportWidth = this.width;
		this.gl.viewportHeight = this.height;
		this.gl.viewport(0, 0, this.width,this.height);
			
		//mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);	
		this.screen_width2 = (this.gl.viewportWidth / this.gl.viewportHeight)*this.screen_height2;
		mat4.frustum(-this.viewer_projection_x-this.screen_width2,-this.viewer_projection_x+this.screen_width2,-this.viewer_projection_y-this.screen_height2,-this.viewer_projection_y+this.screen_height2, this.viewer_projection_z, this.screen_far,this.pMatrix);
		
		this.size_changed=true;
		this._projection_changed=true;
		this.projection_changed_stamp=timeNow;
	}

	if(!this._view_changed && this.mouse_pressed)
	{
		this.speed_xRot=0;
		this.speed_yRot=0;
		this.speed_zRot=0;
		this.speed_xTra=0;
		this.speed_yTra=0;
	}

	if(!this.mouse_pressed)
	{
		if(this.speed_yRot!=0 || this.speed_xRot!=0)
			this.rotateAnimation();
		if(this.speed_zRot!=0)
			this.rotateZAnimation();
		if(this.speed_xTra!=0 || this.speed_yTra!=0)
			this.translateAnimation();
		
		//this.rotateToNextObjectAnimation(Math.PI/2);
	}

	if(this._view_changed)
	{
		//console.log('view changed');
		mat4.identity(this.mvMatrix);
		mat4.rotate(this.mvMatrix,this.next_object_rotation,[0,1,0]);
		mat4.translate(this.mvMatrix,[-this.viewer_position_x+this.screen_x, -this.viewer_position_y+this.screen_y, -this.viewer_position_z+this.screen_z]);
		mat4.translate(this.mvMatrix, [0.0, 0.0, -1.9]);
		//mat4.scale(this.mvMatrix, [this.zoom, this.zoom, this.zoom]);
		//mat4.rotate(this.mvMatrix, this.yRot* Math.PI / 180, [0, 1, 0]);
		//mat4.rotate(this.mvMatrix, this.xRot* Math.PI / 180, [1, 0, 0]);
		//mat4.translate(this.mvMatrix, [this.xTra, this.yTra, 0.0]);
    
		//THE FOLLOWING CODE IS TREATING THE DETERMINANT OF THE INTERACTION-MATRIX WITHOUT CHANGING THE RENDERING OF THE MODEL-VIEW MATRIX 
		//BY REPLACING Z TRANSLATION BY SCALE, 0.25 UNITS AT A TIME, SO THAT Z TRANSLATION IS AS CLOSE TO ZERO AS POSSIBLE.
		if( this.ixMatrix[14]<-0.25)// <-1 //8 && <-2
		{
			var n= mat4.create();
			mat4.identity(n);
			var cp = mat4.create();
			mat4.set(this.ixMatrix, cp);
			mat4.scale(n,[0.917,0.917,0.917]); //sqrt(sqrt(0.5))//sqrt(0.5)//0.5
			mat4.translate(n,[0,0,0.25]);//0.5//1//2
			mat4.multiply(n,cp,this.ixMatrix);
		}
		//UP TO HERE
    
		var m=this.ixMatrix;
		var det=m[0]*(m[5]*m[10]-m[9]*m[6])-m[4]*(m[1]*m[10]-m[9]*m[2])+m[8]*(m[1]*m[6]-m[5]*m[2]);
		this.zoom=Math.pow(det,1/3);
    
		//Update mvMatrix 
		var copy = mat4.create();
		mat4.set(this.mvMatrix, copy);
		mat4.multiply(copy,this.ixMatrix,this.mvMatrix);
	}
	
	this.pushMatrix();
	
};

WebGLCamera.prototype.setPseudoViewerPosition=function(x,y)
{
	this.viewer_position_x=x*0.01/0.05;
	this.viewer_position_y=y*0.01/0.05;
	this.viewer_projection_x=x*0.01;
	this.viewer_projection_y=y*0.01;
	mat4.frustum(-this.viewer_projection_x-this.screen_width2,-this.viewer_projection_x+this.screen_width2,-this.viewer_projection_y-this.screen_height2,-this.viewer_projection_y+this.screen_height2, this.viewer_projection_z, this.screen_far,this.pMatrix);
	
	this._projection_changed=true;
	this.projection_changed_stamp=new Date().getTime();
	
	//this._view_changed=true;
};

WebGLCamera.prototype.endDraw=function()
{
	this._projection_changed=false;
	this._view_changed=false;
	this.size_changed=false;
	this.popMatrix();
};

WebGLCamera.prototype.orthographicProjection=function()
{
	mat4.ortho(-0.82*this.gl.viewportWidth / this.gl.viewportHeight, 0.82*this.gl.viewportWidth / this.gl.viewportHeight, -0.82,0.82,0.1,100.0, this.pMatrix);
	this._projection_changed=true;
	this.projection_changed_stamp=new Date().getTime();
};
 
WebGLCamera.prototype.perspectiveProjection=function()
{
	mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
	this._projection_changed=true;
	this.projection_changed_stamp=new Date().getTime();
};

WebGLCamera.prototype.STR_update=function()
{
	var tmp = mat4.create();
	mat4.identity(tmp);
	mat4.scale(tmp,[this.working_zoom,this.working_zoom,this.working_zoom]);
	mat4.translate(tmp,[this.xTra,this.yTra,0]);
	mat4.rotate(tmp,this.working_zRot,[0,0,1]);
	mat4.multiply(tmp,this.ixMatrix_mem,this.ixMatrix);
	
	this._view_changed=true;
};

WebGLCamera.prototype.R_update=function()
{
	var tmp = mat4.create();
	mat4.identity(tmp);
	var mag=Math.sqrt(this.xRot*this.xRot+this.yRot*this.yRot);
	if(mag>0)mat4.rotate(tmp,mag*4/this.zoom,[this.xRot/mag, this.yRot/mag,0]);
    mat4.multiply(tmp,this.ixMatrix_mem,this.ixMatrix);
	
	this._view_changed=true;
};

WebGLCamera.prototype.translate=function(dx,dy)
 {
	this.xTra+=dx;
	this.yTra-=dy;
	
	this.speed_xTra=dx/this.inverseFPS;
	this.speed_yTra=dy/this.inverseFPS;
	
    this.STR_update();
 };

 WebGLCamera.prototype.translateAnimation=function()
 {
	this.xTra+=this.speed_xTra*this.inverseFPS;
	this.yTra-=this.speed_yTra*this.inverseFPS;
	
	//it will lose 15% of the power every 1/35 second 0.15*35=5.25. After 1 second it will be at the (1-0.15)^35=0.003 of the original speed.
	this.speed_xTra-=this.speed_xTra*5.25*this.inverseFPS; if(Math.abs(this.speed_xTra)<0.03) this.speed_xTra=0;
	this.speed_yTra-=this.speed_yTra*5.25*this.inverseFPS; if(Math.abs(this.speed_yTra)<0.03) this.speed_yTra=0;
	
    this.STR_update();
 };

WebGLCamera.prototype.rotateToNextObject=function(x)
{
	this.next_object_rotation=4/3*Math.PI*(this.original_mouseX[0]-x[0])/this.width;
	if(this.next_object_animation==1)
	{
		if(this.next_object_rotation>Math.PI*2/3) this.next_object_rotation=Math.PI*2/3;
		else if(this.next_object_rotation<0)this.next_object_rotation=0;
	}
	else if(this.next_object_animation==-1)
	{
		if(this.next_object_rotation<-Math.PI*2/3) this.next_object_rotation=-Math.PI*2/3;
		else if(this.next_object_rotation>0) this.next_object_rotation=0;
	}
	this._view_changed=true;
};
 
WebGLCamera.prototype.rotateToNextObjectAnimation=function(dx)
{
	this.next_object_rotation+=dx*this.inverseFPS;
	this._view_changed=true;
};
 
WebGLCamera.prototype.rotate=function(dx,dy)
 {
	this.yRot+=dx;
	this.xRot+=dy;
	
	this.speed_yRot=dx/this.inverseFPS;
	this.speed_xRot=dy/this.inverseFPS;
	
    this.R_update();
 };
 
 WebGLCamera.prototype.rotateAnimation=function()
 {
	this.xRot+=this.speed_xRot*this.inverseFPS;
	this.yRot+=this.speed_yRot*this.inverseFPS;
	
	//it will lose 15% of the power every 1/35 second 0.15*35=5.25. After 1 second it will be at the (1-0.15)^35=0.003 of the original speed.
	this.speed_yRot-=this.speed_yRot*5.25*this.inverseFPS;if(Math.abs(this.speed_yRot)<0.03) this.speed_yRot=0;
	this.speed_xRot-=this.speed_xRot*5.25*this.inverseFPS;if(Math.abs(this.speed_xRot)<0.03) this.speed_xRot=0;
	
    this.R_update();
 };
 
WebGLCamera.prototype.rotateZ=function(dx)
 {
 	this.working_zRot+=dx;
 	
 	this.speed_zRot=dx/this.inverseFPS;
 	
	this.STR_update();
 };

 WebGLCamera.prototype.rotateZAnimation=function()
 {
 	this.working_zRot+=this.speed_zRot*this.inverseFPS;
 	
	//it will lose 15% of the power every 1/35 second 0.15*35=5.25. After 1 second it will be at the (1-0.15)^35=0.003 of the original speed.
 	this.speed_zRot-=this.speed_zRot*5.25*this.inverseFPS;if(Math.abs(this.speed_zRot)<0.03) this.speed_zRot=0;
 	
	this.STR_update();
 };
 
WebGLCamera.prototype.setRotation=function(dx,dy)
 {
	this.yRot=dx;
	this.xRot=dy;
	this._view_changed=true;
 };
 
WebGLCamera.prototype.zooming=function(dz)
 {
 	if(dz<1 && this.zoom<0.5) return;
 	else if(dz>1 && this.zoom>4) return;
 	
	this.working_zoom=dz;
	
	this.STR_update();
 };
 
WebGLCamera.prototype.relight=function(dx,dy)
 {
	this.yLig+=3.14*dx;
	this.xLig-=3.14*dy;
	if(this.xLig<-1.57) this.xLig=-1.57;
	else if(this.xLig>1.57) this.xLig=1.57;
	if(this.yLig<-1.57) this.yLig=-1.57;
	else if(this.yLig>1.57) this.yLig=1.57;
	this.light_changed=true;
};

WebGLCamera.prototype.setLight=function(dx,dy)
 {
	this.yLig=dx;
	this.xLig=dy;
	this.light_changed=true;
};


WebGLCamera.prototype.getLightingDirection=function()
{
	return [Math.sin(this.yLig)*Math.cos(this.xLig), Math.sin(this.xLig), Math.cos(this.yLig)*Math.cos(this.xLig) ];
};

WebGLCamera.prototype.setStandardPointerInteraction=function()
{
	var self=this;
	this.canvas.handleMouseMove=function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=self.realToCSSPixels*event.clientX; y[0]=self.realToCSSPixels*event.clientY; self.handlePointerMove(x,y);};
	this.canvas.handleMouseUp=function(event){self.handlePointerUp();};
	this.canvas.handleMouseDown=function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=self.realToCSSPixels*event.clientX; y[0]=self.realToCSSPixels*event.clientY;self.handlePointerDown(x,y);};
	this.canvas.handleMouseOut=function(event){var x=new Array();var y=new Array();x[0]=self.realToCSSPixels*event.clientX; y[0]=self.realToCSSPixels*event.clientY;self.handleMouseOut(x,y);};
	this.canvas.handleTouchStart=function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=self.realToCSSPixels*event.targetTouches[i].clientX;y[i]=self.realToCSSPixels*event.targetTouches[i].clientY;} self.handlePointerMove(x,y);self.handlePointerDown(x,y);};
	this.canvas.handleTouchEnd=function(event){self.handlePointerUp();};
	this.canvas.handleTouchMove=function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=self.realToCSSPixels*event.targetTouches[i].clientX;y[i]=self.realToCSSPixels*event.targetTouches[i].clientY;}self.handlePointerMove(x,y);};
};

WebGLCamera.prototype.handlePointerMove=function(x,y)
	{
		//this.draw_now=true;
		this.mouse_moved=true;
		
		if(this.mouse_pressed==true)
		{
		
			var dx=new Array(x.length);
			var dy=new Array(y.length);
			for(var i=0;i<dx.length;i++)
			{
				dx[i]=(x[i]-this.mouseX[i])/(this.height);
				dy[i]=(y[i]-this.mouseY[i])/(this.height);
			}
				if(this.next_object_animation==0)
				{
					if(dx.length==1)
						this.rotate(dx[0],dy[0]);
					else if(dx.length==2)
					{
						//var before=Math.sqrt((this.mouseX[0]-this.mouseX[1])*(this.mouseX[0]-this.mouseX[1])+(this.mouseY[0]-this.mouseY[1])*(this.mouseY[0]-this.mouseY[1]));
						var current_distance=Math.sqrt((x[0]-x[1])*(x[0]-x[1])+(y[0]-y[1])*(y[0]-y[1]));
						if(this.original_finger_distance>0)
						{
							this.zooming(current_distance/this.original_finger_distance,0);
							this.translate(((x[0]+x[1])-(this.mouseX[0]+this.mouseX[1]))/(2*this.gl.viewportHeight),((y[0]+y[1])-(this.mouseY[0]+this.mouseY[1]))/(2*this.gl.viewportHeight));
							if(current_distance>0)
							{
								var zrot=Math.atan2(((this.mouseY[0]-this.mouseY[1])/this.finger_distance),((this.mouseX[0]-this.mouseX[1])/this.finger_distance))-Math.atan2(((y[0]-y[1])/current_distance),((x[0]-x[1])/current_distance));
								this.zRot+=zrot;
								
								if(Math.abs(this.zRot)>Math.PI/15) this.enable_rotateZ=true;
								if(this.enable_rotateZ) this.rotateZ(zrot);
								
								this.finger_distance=current_distance;
							}
					
						}
						
					
					}
					//this.relight(dx,dy);
				}
				else
				{
					this.rotateToNextObject(x);
				}
		}
		
		this.mouseX = x;
       	this.mouseY = y;
	}
	
WebGLCamera.prototype.handlePointerUp=function()
	{
		if(!this.mouse_moved)
			this.onTap(this.mouseX,this.mouseY);
		else this.onInteractionEnd();
		
		this.mouse_pressed=false;
		this.canvas.renderFrame();
	}
	
WebGLCamera.prototype.onTap=function(x,y){};
WebGLCamera.prototype.onInteractionEnd=function(){};	
	
WebGLCamera.prototype.handlePointerDown=function(x,y)
	{
		this.mouse_moved=false;
		this.mouse_pressed=true;
		this.mouseX = x;
		this.mouseY = y;
		this.original_mouseX=x;
		this.original_mouseY=y;
		this.xRot=0;
		this.yRot=0;
		this.zRot=0;
		this.xTra=0;
		this.yTra=0;
		
		this.speed_xRot=0;
		this.speed_yRot=0;
		this.speed_zRot=0;
		this.speed_xTra=0;
		this.speed_yTra=0;
		
		this.enable_rotateZ=false;
		if(x.length==2)
		{
			this.original_finger_distance=Math.sqrt((x[0]-x[1])*(x[0]-x[1])+(y[0]-y[1])*(y[0]-y[1]));
			this.finger_distance=this.original_finger_distance;
		}
		else
		{
			this.original_finger_distance=0;
			this.finger_distance=0;
		}
		
		if(x[0]>this.width*0.85)
			this.next_object_animation=1;
		else if(x[0]<this.width*0.15)
			this.next_object_animation=-1;
		else this.next_object_animation=0;
		
		mat4.set(this.ixMatrix,this.ixMatrix_mem);
		this.zoom_mem=this.zoom;
		this.working_zoom=1;
		this.working_zRot=0;
		return false;
	};
	
WebGLCamera.prototype.handleMouseOut=function(x,y)
{	
		if(this.mouse_pressed)this.onInteractionEnd();
		this.mouse_pressed=false;
		this.canvas.renderFrame();
};

WebGLCamera.prototype.animate=function()
{
	if(this.animation_frames==0)
	{
		this.anim_zoom0=this.anim_zoom1;
		this.anim_rotx0=this.anim_rotx1;
		this.anim_roty0=this.anim_roty1;
		this.anim_zoom1=this.anim_zoom2;
		this.anim_rotx1=this.anim_rotx2;
		this.anim_roty1=this.anim_roty2;
		
		this.anim_zoom2=Math.random()*23+2;
		this.anim_rotx2=-Math.random()*70;
		this.anim_roty2=-Math.random()*180+90;
		
		
		if(this.anim_zoom2>-Math.sin(this.anim_rotx2/90)*85*0.7+14) this.anim_zoom2=-Math.sin(this.anim_rotx2/90)*85*0.7+14;
		if(this.anim_zoom2>25)this.anim_zoom2=25;
		if(this.anim_zoom2<2)this.anim_zoom2=2;
		
		this.animation_frames=this.total_animation_frames;
	}
	else if(this.animation_frames>0)
	{
		var w=this.animation_frames/this.total_animation_frames;
		this.animation_frames-=1;
		
		this.zoom+=(w*(this.anim_zoom1-this.anim_zoom0)+(1-w)*(this.anim_zoom2-this.anim_zoom1))/this.total_animation_frames;
		this.rot_x+=(w*(this.anim_rotx1-this.anim_rotx0)+(1-w)*(this.anim_rotx2-this.anim_rotx1))/this.total_animation_frames;
		this.rot_y+=(w*(this.anim_roty1-this.anim_roty0)+(1-w)*(this.anim_roty2-this.anim_roty1))/this.total_animation_frames;
		
		if(this.rot_x>0)this.rot_x=0;
		else if(this.rot_x<-25)this.rot_x=-25;
		
		if(this.rot_y>45)this.rot_y=45;
		else if(this.rot_y<-45)this.rot_y=-45;
		
		if(this.zoom>-Math.sin(this.rot_x/90)*85*0.7+14) this.zoom=-Math.sin(this.rot_x/90)*85*0.7+14;
		if(this.zoom>12)this.zoom=12;
		if(this.zoom<8)this.zoom=8;		
	}
	
	
    mat4.identity(mvMatrix);
	mat4.rotate(mvMatrix, 3.1416, [0, 1, 0]);
	mat4.translate(mvMatrix, [0.0, 0.0, this.zoom]);
	mat4.scale(mvMatrix, [this.scale, this.scale, this.scale]);
	mat4.rotate(mvMatrix, degToRad(this.rot_x), [1, 0, 0]);
	mat4.rotate(mvMatrix, degToRad(this.rot_y), [0, 1, 0]);
	mat4.translate(mvMatrix, [this.tra_x, this.tra_y, 0.0]);
	mat4.rotate(mvMatrix, -3.1416, [0, 1, 0]);
};

function WebGLKeyFrame(type,val1,val2,speed,repetitions)
{
	if(typeof type!=='string') return;
	
	if(type=='interpolate')
	{
		this.animation_cycle=0;
	
		this.repetitions=1;	
		if(typeof repetitions!=='undefined')this.repetitions=repetitions;

		this.speed=1;
		if(typeof speed!=='undefined')this.speed=speed;
		
		this.current_value=new Array(val1.length);
		this.current_goal=new Array(val1.length);
		this.min_goal=new Array(val1.length);
		this.max_goal=new Array(val1.length);
		this.delta=new Array(val1.length);
		for(var i=0;i<val1.length;i++)
		{
			this.current_value[i]=0;
			this.min_goal[i]=val1[i];
			this.max_goal[i]=val2[i];
			this.current_goal[i]=this.max_goal[i];
			this.delta[i]=Math.abs(this.max_goal[i]-this.min_goal[i]);
		}
	
		var self=this;
		this.animate=function(invfps)
		{
			for(var i=0;i<this.current_value.length;i++)
			{
				if(this.current_goal[i]>this.current_value[i])
				{
					this.current_value[i]+=this.delta[i]*invfps*this.speed;
					if(this.current_value[i]>=this.current_goal[i])
					{
						this.current_value[i]=this.current_goal[i];
						this.current_goal[i]=this.min_goal[i];
						if(i==0){this.animation_cycle+=1;}//console.log(this.animation_cycle+' '+this.delta[i]+' '+this.current_value[i]);}
					}
				}
				else
				{
					this.current_value[i]-=this.delta[i]*invfps*this.speed;
					if(this.current_value[i]<=this.current_goal[i])
					{
						this.current_value[i]=this.current_goal[i];
						this.current_goal[i]=this.max_goal[i];
						if(i==0){this.animation_cycle+=1;}//console.log(this.animation_cycle+' '+this.delta[i]+' '+this.current_value[i]);}
					}
				}
			}
			self.onValueChange();
		};
		
		this.isFinished=function()
		{
			if(this.animation_cycle>=this.repetitions*2) return true; else return false;
		};
		
		this.start=function()
		{
			for(var i=0;i<this.current_value.length;i++)
			{
				this.current_value[i]=0;
				this.current_goal[i]=this.max_goal[i];
			}
			
			this.onStart();
			for(var i=0;i<this.current_value.length;i++)
			{
				if(this.max_goal[i]==this.min_goal[i])
					this.delta[i]=Math.abs(this.current_value[i]-this.current_goal[i]);
			}
			this.animation_cycle=0;
		};
	}
}
WebGLKeyFrame.prototype.getPhase=function(){if(this.animation_cycle%2==0)return 0; else return 1;};
WebGLKeyFrame.prototype.setValue=function(id,value){this.current_value[id]=value;};
WebGLKeyFrame.prototype.getValue=function(id){return this.current_value[id];};
WebGLKeyFrame.prototype.onValueChange=function(){};
WebGLKeyFrame.prototype.onStart=function(){};
WebGLKeyFrame.prototype.start=function(){this.onStart();};
WebGLKeyFrame.prototype.animate=function(){};
WebGLKeyFrame.prototype.isFinished=function(){return true;};

function WebGLAnimation(canvas)
{
	this.canvas=canvas;
	this.gl=canvas.gl;
	this.camera=canvas.camera;
	this.keyframe_now=-1;	
	this.loop=false;
	this.keyframes=new Array();
	this.pause_during_user_interaction=false;
}

WebGLAnimation.prototype.pauseDuringUserInteraction=function(){this.pause_during_user_interaction=true;};

WebGLAnimation.prototype.load=function(){this.onSetup();};

WebGLAnimation.prototype.addKeyFrame=function(keyframe){this.keyframes.push(keyframe);};

WebGLAnimation.prototype.setLoop=function(flag){this.loop=flag;};

WebGLAnimation.prototype.start=function()
{
	if(this.keyframes.length==0) return;

	if(this.isPlaying()) return;
	
	this.onStart();
	//-----
	this.keyframe_now=0;
	this.keyframes[this.keyframe_now].start();
	this.canvas.renderFrame();
};

WebGLAnimation.prototype.isPlaying=function()
{
	if(this.keyframe_now>-1) return true; else return false;
};

WebGLAnimation.prototype.stop=function()
{
	this.keyframe_now=-1;
	this.canvas.renderFrame();
};

WebGLAnimation.prototype.animate=function()
{
	if(this.keyframe_now==-1) return;
	
	if(this.keyframes[this.keyframe_now].isFinished())
	{
		this.keyframe_now+=1;
		if(this.keyframe_now==this.keyframes.length)
		{
			if(this.loop)
				this.keyframe_now=0;
			else
			{
				this.stop();
				return;
			}
		}
		this.keyframes[this.keyframe_now].start();
	}
	this.keyframes[this.keyframe_now].animate(this.camera.inverseFPS);
	this.canvas.renderFrame();
};

WebGLAnimation.prototype.draw=function()
{
	if(this.keyframe_now==-1) return;
	if(this.pause_during_user_interaction && this.camera.mouse_pressed) return;
	this.onDraw();
	this.animate();
}

WebGLAnimation.prototype.onSetup=function(){};
WebGLAnimation.prototype.onStart=function(){};
WebGLAnimation.prototype.onDraw=function(){};

