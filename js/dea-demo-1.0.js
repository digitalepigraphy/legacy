function loadDEAdemo(canvas)
{
	var demo=new WebGLAnimation(canvas);
	
	demo.onSetup=function()
	{
		var self=demo;
		self.pauseDuringUserInteraction();
		
		self.shaderProgram=self.canvas.createShader_VT();
		
		self.obj=new Array();
		//Main hand
		var hand=new WebGLShape(self.canvas);
		hand.setXYZ([0.7617,1,-3,0.1757,0.2734,-3,0,0,-3,0.7617,0,-3,0.2695,0.3984,-3,0.2695,0.6679,-3,0,0.6679,-3,0.3242,0.5546,-3,0.4492,0.5878,-3,0.5234,1,-3,0.3984,1,-3]);
		hand.setUV([0.7617,1,0.1757,0.2734,0,0,0.7617,0,0.2695,0.3984,0.2695,0.6679,0,0.6679,0.3242,0.5546,0.4492,0.5878,0.5234,1,0.3984,1]);
		hand.setTRI([1,2,3,4,1,3,3,7,4,3,8,7,9,8,3,9,3,0]);
		self.obj.push(hand);
		//Thumb finger
		var thumb=new WebGLShape(self.canvas);
		thumb.vertexPositionBuffer=hand.vertexPositionBuffer;
		thumb.vertexTextureCoordBuffer=hand.vertexTextureCoordBuffer;
		thumb.setTRI([1,4,6,4,5,6]);
		self.obj.push(thumb);
		//Index finger
		var index=new WebGLShape(self.canvas);
		index.vertexPositionBuffer=hand.vertexPositionBuffer;
		index.vertexTextureCoordBuffer=hand.vertexTextureCoordBuffer;
		index.setTRI([9,10,8,10,7,8]);
		self.obj.push(index);
		
		var circle=new WebGLShape(self.canvas);
		circle.setXYZ([0.1523,0.9726,-3,0.0273,0.9726,-3,0.0273,0.8476,-3,0.1523,0.8476,-3]);
		circle.setUV([0.1523,0.9726,0.0273,0.9726,0.0273,0.8476,0.1523,0.8476]);
		circle.setTRI([0,1,2,0,2,3]);
		self.obj.push(circle);
		
		self.img=new WebGLTexture(self.canvas,'http://www.digitalepigraphy.org/js/DEMOhand.png');
		self.thumb_angle=0;
		self.index_angle=0;
		self.wrist_angle=0;
		self.wrist_translation=0;
		
		self.thumb_goal=0;
		self.index_goal=0;
		//this.wrist_goal=0;
		//this.translation_goal=0;
				
		var k1=new WebGLKeyFrame('interpolate',[-0.2],[0.2],0.5,2);
		k1.onStart=function(){self.thumbUp();self.indexDown();};
		k1.onValueChange=function(){self.wrist_translation=k1.getValue(0);if(k1.getPhase()==0)self.camera.rotate(0.001,0);else self.camera.rotate(-0.001,0);};
		self.addKeyFrame(k1);
		
		var k2=new WebGLKeyFrame('interpolate',[0],[0],1,1);
		k2.onStart=function(){self.thumbUp();self.indexUp();k2.setValue(0,self.wrist_translation);};
		k2.onValueChange=function(){self.wrist_translation=k2.getValue(0);self.camera.rotate(0.001,0);};
		self.addKeyFrame(k2);
		
		var k3=new WebGLKeyFrame('interpolate',[-0.5],[0.2],0.5,2);
		k3.onStart=function(){self.thumbDown();self.indexDown();};
		k3.onValueChange=function(){self.wrist_angle=k3.getValue(0);if(k3.getPhase()==0){self.camera.rotateZ(0.003);self.camera.translate(-0.0015,-0.001);}else {self.camera.rotateZ(-0.003);self.camera.translate(0.0015,0.001);}};
		self.addKeyFrame(k3);
			
		var k4=new WebGLKeyFrame('interpolate',[0],[0],1,1);
		k4.onStart=function(){self.thumbUp();self.indexUp();k4.setValue(0,self.wrist_angle);};
		k4.onValueChange=function(){self.wrist_angle=k4.getValue(0);self.camera.rotateZ(0.004);self.camera.translate(-0.0030,-0.0014);};
		self.addKeyFrame(k4);
		
		var k5=new WebGLKeyFrame('interpolate',[-0.2],[0.2],0.5,2);
		k5.onStart=function(){self.thumbDown();self.indexDown();};
		k5.onValueChange=function(){self.wrist_translation=k5.getValue(0);if(k5.getPhase()==0)self.camera.translate(0.0015,0);else self.camera.translate(-0.0015,0);};
		self.addKeyFrame(k5);
		
		var k6=new WebGLKeyFrame('interpolate',[0],[0],1,1);
		k6.onStart=function(){self.thumbUp();self.indexUp();k6.setValue(0,self.wrist_translation);};
		k6.onValueChange=function(){self.wrist_translation=k6.getValue(0);self.camera.translate(0.0014,0);};
		self.addKeyFrame(k6);
		
		var k7=new WebGLKeyFrame('interpolate',[-0.5],[0.2],0.5,2);
		k7.onStart=function(){self.thumbDown();self.indexDown();};
		k7.onValueChange=function(){self.wrist_angle=k7.getValue(0);if(k7.getPhase()==0){self.camera.rotateZ(0.003);self.camera.translate(-0.0015,-0.001);}else {self.camera.rotateZ(-0.003);self.camera.translate(0.0015,0.001);}};
		self.addKeyFrame(k7);
			
		var k8=new WebGLKeyFrame('interpolate',[0],[0],1,1);
		k8.onStart=function(){self.thumbUp();self.indexUp();k8.setValue(0,self.wrist_angle);};
		k8.onValueChange=function(){self.wrist_angle=k8.getValue(0);self.camera.rotateZ(0.0037);self.camera.translate(-0.0011,-0.0013);};
		self.addKeyFrame(k8);		
	};
	
	demo.onStart=function()
	{
		var self=demo;
		self.wrist_angle=0;
		self.wrist_translation=0;
		self.thumbUp();
		self.indexUp();
	};
	
	demo.onDraw=function()
	{
		var self=demo;
		var gl=self.gl;
		gl.useProgram(self.shaderProgram);
		self.camera.updateProjection(self.shaderProgram);

		self.img.use();
		gl.disable(gl.DEPTH_TEST);
		
		var mv = mat4.create();
		var mv2 = mat4.create();
		mat4.identity(mv);
		mat4.translate(mv,[-0.5,-0.5-0.2,1.5]);
		mat4.translate(mv,[self.wrist_translation,0,0]);
		mat4.translate(mv,[0.25,0,0]);
		mat4.rotate(mv,self.wrist_angle,[0,0,1]);
		mat4.translate(mv,[-0.25,0,0]);
		self.gl.uniformMatrix4fv(self.shaderProgram.mvMatrixUniform, false, mv);
		self.obj[0].draw(self.shaderProgram);
		
		if(self.thumb_angle==0.5)
		{
			mat4.set(mv,mv2);
			mat4.translate(mv2,[0.025,-0.32,-0.2]);
			self.gl.uniformMatrix4fv(self.shaderProgram.mvMatrixUniform, false, mv2);
			gl.uniform4f(self.shaderProgram.uColorMask,1,1,1,0.4);
			self.obj[3].draw(self.shaderProgram);
		}
		
		if(self.index_angle==0.5)
		{
			mat4.set(mv,mv2);
			mat4.translate(mv2,[0.39,-0.01,-0.21]);
			self.gl.uniformMatrix4fv(self.shaderProgram.mvMatrixUniform, false, mv2);
			gl.uniform4f(self.shaderProgram.uColorMask,1,1,1,0.4);
			self.obj[3].draw(self.shaderProgram);
		}
		
		if(self.thumb_goal!=self.thumb_angle)
		{
			if(self.thumb_goal>self.thumb_angle)
			{
				self.thumb_angle+=self.camera.inverseFPS;
				if(self.thumb_angle>self.thumb_goal)self.thumb_angle=self.thumb_goal;
			}
			else
			{
				self.thumb_angle-=self.camera.inverseFPS;
				if(self.thumb_angle<self.thumb_goal)self.thumb_angle=self.thumb_goal;
			}
		}
		
		mat4.set(mv,mv2);
		mat4.translate(mv2,[0.22255,0.3359,-3]);
		mat4.rotate(mv2,-self.thumb_angle,[0.6,0.8,0]);
		mat4.translate(mv2,[-0.22255,-0.3359,3]);
		gl.uniformMatrix4fv(self.shaderProgram.mvMatrixUniform, false, mv2);
		if(self.thumb_angle>0) gl.uniform4f(self.shaderProgram.uColorMask,1,0.5,0.5,1);
		else gl.uniform4f(self.shaderProgram.uColorMask,1,1,1,1);
		self.obj[1].draw(self.shaderProgram);
		
		
		if(self.index_goal!=self.index_angle)
		{
			if(self.index_goal>self.index_angle)
			{
				self.index_angle+=self.camera.inverseFPS;
				if(self.index_angle>self.index_goal)self.index_angle=self.index_goal;
			}
			else
			{
				self.index_angle-=self.camera.inverseFPS;
				if(self.index_angle<self.index_goal)self.index_angle=self.index_goal;
			}
		}
		
		mat4.set(mv,mv2);
		mat4.translate(mv2,[0.3867,0.5712,-3]);
		mat4.rotate(mv2,-self.index_angle,[0.9666, 0.2567,0]);
		mat4.translate(mv2,[-0.3867,-0.5712,3]);
		gl.uniformMatrix4fv(self.shaderProgram.mvMatrixUniform, false, mv2);
		if(self.index_angle>0) gl.uniform4f(self.shaderProgram.uColorMask,1,0.5,0.5,1);
		else gl.uniform4f(self.shaderProgram.uColorMask,1,1,1,1);
		self.obj[2].draw(self.shaderProgram);
		
		gl.enable(gl.DEPTH_TEST);
		gl.uniform4f(self.shaderProgram.uColorMask,1,1,1,1);
	
	};
	
	demo.thumbDown=function(){demo.thumb_goal=0.5;};
	demo.thumbUp=function(){demo.thumb_goal=0;};
	demo.indexDown=function(){demo.index_goal=0.5;};
	demo.indexUp=function(){demo.index_goal=0;};
	demo.load();
	
	return demo;
}