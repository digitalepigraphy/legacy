function StructureSensorZIP(canvas)
	{
		this.canvas=canvas;
		this.gl=canvas.gl;
		this.camera=canvas.camera;
		this.shaderProgram=null;
		this.obj=new Array();
		this.img=null;
		this.loaded=false;
		this.center=[0,0,0];
		this.mean=[0,0,0];
		this.min=[0,0,0];
		this.max=[0,0,0];
		this.mvMatrix= mat4.create();
		this.filename='';
	}
	
	StructureSensorZIP.prototype.load=function(filename)
	{
	this.filename=filename;
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	var self=this;
	xmlhttp.onreadystatechange=function()
  	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
		//c.println("File loaded ("+xmlhttp.response.length+" bytes)");
		 var zip = new JSZip(xmlhttp.response);
		
          var f=zip.file("Model.obj").asText().split(/\s+/);
          //c.println(f.length);
          var v_counter=0;
          var f_counter=0;
          var vt_counter=0;
          for(var i=0;i<f.length;i++)
          {
          	if(f[i]=='v') 
          	{
          		v_counter+=1;
          		if(f[i+8]=='vt')
          		{
          			vt_counter+=1;
          			i+=10;
          		}
          		else 
          		{
          			i+=7;
          		}
          	}
          	else if(f[i]=='f')
          	{
          		f_counter+=1;
          		i+=3;
          	}
          }
          if(vt_counter>0) c.println(v_counter+' vertices, '+f_counter+' polygons, textured');
          else c.println(v_counter+' vertices, '+f_counter+' polygons, no texture');
          
          var xyz=new Float32Array(v_counter*3);
		var nrm=new Float32Array(v_counter*3);
		var uv=null;
		if(vt_counter>0) uv=new Float32Array(v_counter*2);
		var tri=null;

		if(v_counter>256*256)
		{
			tri=new Uint32Array(f_counter*3);
		}
		else tri=new Uint16Array(f_counter*3);
		
		
		v_counter=0;
          f_counter=0;
          var n_counter=0;
          var uv_counter=0;
          var avg=[0,0,0];
          var mn=[0,0,0];
          var mx=[0,0,0];
          var stat_c=0;
          for(var i=0;i<f.length;i++)
          {
          	if(f[i]=='v') 
          	{
          		i+=1;
          		xyz[v_counter]=parseFloat(f[i]);
          		if(xyz[v_counter]<mn[0])mn[0]=xyz[v_counter]; else if(xyz[v_counter]>mx[0])mx[0]=xyz[v_counter];
          		avg[0]+=xyz[v_counter];
          		v_counter+=1;i+=1;
          		xyz[v_counter]=-parseFloat(f[i]);
          		if(xyz[v_counter]<mn[1])mn[1]=xyz[v_counter]; else if(xyz[v_counter]>mx[1])mx[1]=xyz[v_counter];
          		avg[1]+=xyz[v_counter];
          		v_counter+=1;i+=1;
          		xyz[v_counter]=-parseFloat(f[i]);
          		if(xyz[v_counter]<mn[2])mn[2]=xyz[v_counter]; else if(xyz[v_counter]>mx[2])mx[2]=xyz[v_counter];
          		avg[2]+=xyz[v_counter];
          		v_counter+=1;
          		if(stat_c==0)
          		{
          			mn[0]=avg[0];
          			mn[1]=avg[1];
          			mn[2]=avg[2];
          			mx[0]=avg[0];
          			mx[1]=avg[1];
          			mx[2]=avg[2];
          		}
          		stat_c+=1;
          	}
          	else if(f[i]=='vn')
          	{
          		i+=1;
          		nrm[n_counter]=parseFloat(f[i]);
          		n_counter+=1;i+=1;
          		nrm[n_counter]=-parseFloat(f[i]);
          		n_counter+=1;i+=1;
          		nrm[n_counter]=-parseFloat(f[i]);
          		n_counter+=1;
          	}
          	else if(f[i]=='vt')
          	{
          		i+=1;
          		uv[uv_counter]=parseFloat(f[i]);
          		uv_counter+=1;i+=1;
          		uv[uv_counter]=parseFloat(f[i]);
          		uv_counter+=1;
          	}
          	else if(f[i]=='f')
          	{
          		i+=1;
          		tri[f_counter]=parseInt(f[i])-1;
          		f_counter+=1;i+=1;
  			tri[f_counter]=parseInt(f[i])-1;
          		f_counter+=1;i+=1;
          		tri[f_counter]=parseInt(f[i])-1;
          		f_counter+=1;
          	}
          }
          avg[0]/=stat_c;
          avg[1]/=stat_c;
          avg[2]/=stat_c;
          self.mean=avg;
          
          var ctr=[(mx[0]+mn[0])/2,(mx[1]+mn[1])/2,(mx[2]+mn[1])/2];
          for(var i=0;i<xyz.length;i++)
          {
          		xyz[i]-=ctr[0];
          		i+=1;
          		xyz[i]-=ctr[1];
          		i+=1;
          		xyz[i]-=ctr[2];
          }
          mn[0]-=ctr[0];
          mn[1]-=ctr[1];
          mn[2]-=ctr[2];
          mx[0]-=ctr[0];
          mx[1]-=ctr[1];
          mx[2]-=ctr[2];	
          
          self.center=ctr;
          self.min=mn;
          self.max=mx;
          
          
          if(stat_c>256*256) //needs restructuring
          {
          	var goes_to=new Uint32Array(stat_c);
          	var used_in_batch=new Uint8Array(stat_c);
          	var num_of_faces=tri.length/3;
          	var fc=0;
          	var batch_now=1;
          	var max16bit=256*256;
          	var v_next=0;
          	var from_face=0;
          	var _xyz=new Float32Array(max16bit*3);
          	var _nrm=new Float32Array(max16bit*3);
          	var _c1=0;
          	var _c2=0;
          	for(var f=0; f<num_of_faces;f++)
          	{
          		if(v_next>max16bit-3)
          		{
          			var obj=new WebGLShape(self.canvas);
          			var _v=_xyz.subarray(0,v_next*3);
				obj.setXYZ(_v);
				obj.setNormals(_nrm.subarray(0,v_next*3));
				//obj.setUV(uv);
				obj.setTRI(tri.subarray(from_face*3,f*3));
				self.obj.push(obj);
				
				from_face=f;
          			v_next=0;
          			batch_now+=1;
          		}
          		
          		for(var fci=0;fci<3;fci++)
          		{
          			if(used_in_batch[tri[fc]]!=batch_now)
          			{
          				used_in_batch[tri[fc]]=batch_now;
          				goes_to[tri[fc]]=v_next;
          				//copy xyz and normal of the new vector.
          				_c1=v_next*3;
          				_c2=tri[fc]*3;
          				_xyz[_c1]=xyz[_c2];
          				_nrm[_c1]=nrm[_c2];
          				_c1+=1;_c2+=1;
          				_xyz[_c1]=xyz[_c2];
          				_nrm[_c1]=nrm[_c2];
          				_c1+=1;_c2+=1;
          				_xyz[_c1]=xyz[_c2];
          				_nrm[_c1]=nrm[_c2];
          
          				tri[fc]=goes_to[tri[fc]];
          				v_next+=1;
          			}
          			else
          			{
          				tri[fc]=goes_to[tri[fc]];
          			}
          			fc+=1;
          		}
          	}
          	
          	if(v_next>0)
          	{
          		var obj=new WebGLShape(self.canvas);
			var _v=_xyz.subarray(0,v_next*3);
			obj.setXYZ(_v);
			obj.setNormals(_nrm.subarray(0,v_next*3));
			//obj.setUV(uv);
			var _f=tri.subarray(from_face*3,num_of_faces*3);
			obj.setTRI(_f);
			self.obj.push(obj);
          	}
          }
          else
          {
		var obj=new WebGLShape(self.canvas);
		obj.setXYZ(xyz);
		
		if(vt_counter>0) obj.setUV(uv);
		else obj.setNormals(nrm);
		
		obj.setTRI(tri);
		//c.println(avg[0]+' '+avg[1]+' '+avg[2]);
		
		self.obj.push(obj);
	}
	
		if(vt_counter>0)
		{
			var blob = new Blob( [ zip.file("Model.jpg").asUint8Array() ], { type: "image/jpeg" } );
          		self.img=new WebGLTexture(self.canvas,URL.createObjectURL(blob));
  		       //c.println('Image rendered.');
		}
		self.initShaders();
		
		
		self.loaded=true;
		self.canvas.renderFrame();
		
           }
          
	};
	xmlhttp.overrideMimeType("text/plain; charset=x-user-defined");
	c.println("Start loading file...");
	xmlhttp.open("GET",filename,true);
	xmlhttp.send();
	

	};
	
	StructureSensorZIP.prototype.draw=function()
{
	if(!this.loaded) return;
	var gl=this.gl;
	gl.useProgram(this.shaderProgram);

	this.camera.updateProjection(this.shaderProgram);
	
	
	//if(this.camera.view_changed)
	{
		mat4.set(this.camera.mvMatrix,this.mvMatrix);
		mat4.scale(this.mvMatrix,[this.scale,this.scale,this.scale]);
    	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
		
		var normalMatrix = mat3.create();
		mat4.toInverseMat3(this.mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	}
	
	if(this.camera.light_changed)
	{
		
	}
	
	if(this.img!=null) this.img.use();
	for(var i=0;i<this.obj.length;i++)
		this.obj[i].draw(this.shaderProgram);
		
};


	StructureSensorZIP.prototype.initShaders=function()
	{
			if(this.shaderProgram==null)
			{
				if(this.img==null) this.shaderProgram=this.canvas.createShader_VN();
				else this.shaderProgram=this.canvas.createShader_VT();
			}
	
		  if((this.max[1]-this.min[1])/(this.max[0]-this.min[0])>this.gl.viewportHeight/this.gl.viewportWidth)
          this.scale=1.2/(this.max[1]-this.min[1]);
          else this.scale=(1.2*this.gl.viewportWidth/this.gl.viewportHeight)/(this.max[0]-this.min[0]);
		   
this.mvMatrix= mat4.create();
    mat4.set(this.camera.mvMatrix,this.mvMatrix);
    mat4.scale(this.mvMatrix,[this.scale,this.scale,this.scale]);
    	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	
	};