/* V1.0
 * Copyright 2015, www.visineat.com
 * Angelos Barmpoutis
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

/* DOCUMENTATION
*******WindowManager*********
The class WindowManager has the following constructor:

WindowManager(String div_id);

the following public properties that define the look and feel:

default_title_backgroundColor;
default_title_selectedColor;
default_title_fontColor;
default_title_fontFamily;
default_title_fontWeight;
default_title_fontSize;
default_title_textShadow;
default_close_icon;
default_minimize_icon;
default_expand_icon;
default_border_color;
default_button_backgroundColor;
default_button_pressedColor;
default_button_fontColor;
default_title_fontFamily;
default_title_fontWeight;

the following public methods:

int getWidth();
int getHeight();
int[] getSize();
void updateSize();
VNWindow createWindow(int x, int y, int width, int height);
VNWindow infoWindow(int x, int y, String title); 
VNButton createDesktopButton(int x, int y, int width, int height);
VNButton createWindowToggleButton(int x, int y, int width, int height, VNWindow win);
void setSelectedWindow(VNWindow w);
VNWindow getSelectedWindow();
void setDraggingWindow(VNWindow w);
VNWindow getDraggingWindow();
void setResizingWindow(VNWindow w);
VNWindow getResizingWindow();
void blockWindow(VNWindow w, boolean closeonclick);
void unblock();

and the following callback that you can define: 

void blockclick();


*********VNWindow**********
The class VNWindow has the following public methods:

Element getContentDiv();
void setOnTop();
void setSelected(boolean flag);
boolean isSelected();
void setTitle(String title);
String getTitle();
void setPosition(int x,int y);
int[] getPosition();
void setSize(int width, int height);
int[] getSize();
boolean canMove();
void setCanMove(boolean flag);
boolean canResize();
void setCanResize(boolean flag);
boolean canClose();
void setCanClose(boolean flag);
void close();
void destroy();
boolean canMinimize();
void setCanMinimize(boolean flag);
void minimize();
void expand();
void center();
boolean isMinimized();
void setScrollerX(boolean flag);
void setScrollerY(boolean flag);


and the following callbacks that you can define:

void onminimize(VNWindow);
void onexpand(VNWindow);
boolean onclose(VNWindow);
void onfocus(VNWindow);
void onresize(VNWindow);

*********VNButton**********
The class VNButton has the following public methods:
void setIsToggleButton(boolean flag);
boolean isToggleButton();
void setToggleState(boolean flag);
boolean isPressed();//for toggle buttons
void square();
void round();
void setImage(String backgroundImage);
void setLabel(String label);
void setPosition(int x,int y);
int[] getPosition();
void setSize(int width, int height);
int[] getSize();
void click();

and the following callback that you can define:

void onclick(VNButton);

*/

function WindowManager(div_container_id)
{
	this.div_container=document.getElementById(div_container_id);
	this.div_container.style.touchAction='none';
	this.div_container.style.overflow='hidden';
	this.selected_window=null;
	this.dragging_window=null;
	this.resizing_window=null;
	this.zIndex=0;
	this.windows=new Array();
	this.buttons=new Array();
	
	//block_div
	this.block_div=document.createElement('div');
	this.div_container.appendChild(this.block_div);
	this.block_div.style.position='absolute';
	this.block_div.style.width=this.getWidth()+'px';
	this.block_div.style.height=this.getHeight()+'px';
	this.block_div.style.left='0px';
	this.block_div.style.top='0px';
	this.block_div.style.touchAction='none';
	this.block_div.style.overflow='hidden';
	this.block_div.style.backgroundColor='rgba(0,0,0,0.5)';
	this.block_div.style.display='none';
	
	this.touch_operated=false;
	
	var self=this;
	this.div_container.addEventListener('mousemove',function(event){if(self.dragging_window==null && self.resizing_window==null) return;event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleMouseMove(x,y);},false);
	this.div_container.addEventListener('mouseup',function(event){self.handleMouseUp();},false);
	this.div_container.addEventListener('touchend',function(event){self.handleMouseUp();},false);
	this.div_container.addEventListener('touchmove',function(event){if(this.dragging_window==null && self.resizing_window==null) return;event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleMouseMove(x,y);},false);
	
	this.block_div.addEventListener('mousedown',function(event){if(this.touch_operated)return;event.preventDefault();self.blockclick();},false);
	this.block_div.addEventListener('touchstart',function(event){this.touch_operated=true;event.preventDefault();self.blockclick();},false);
	
	this.default_title_backgroundColor='rgba(160,0,0,0.5)';
	this.default_title_selectedColor='rgba(160,0,0,0.8)';
	this.default_title_fontColor='rgb(255,255,255)';
	this.default_title_fontFamily='"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif';
	this.default_title_fontWeight='700';
	this.default_title_fontSize='14px';
	this.default_title_textShadow='1px 1px rgb(0,0,0)';
	this.default_close_icon='url("http://www.digitalepigraphy.org/js/close_window.png")';
	this.default_minimize_icon='url("http://www.digitalepigraphy.org/js/minimize_window.png")';
	this.default_expand_icon='url("http://www.digitalepigraphy.org/js/expand_window.png")';
	this.default_border_color='rgba(128,128,128,0.5)';
	
	this.default_button_backgroundColor='rgb(255,255,255)';
	this.default_button_pressedColor='rgba(160,0,0,0.5)';
	this.default_button_fontColor='rgb(128,128,128)';
	this.default_title_fontFamily='"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif';
	this.default_title_fontWeight='700';
};

WindowManager.prototype.updateSize=function()
{
	this.block_div.style.width=this.getWidth()+'px';
	this.block_div.style.height=this.getHeight()+'px';
	
	for(var i=0;i<this.windows.length;i++)
	{
		this.windows[i].setPosition(this.windows[i].left,this.windows[i].top);
	}
};

WindowManager.prototype.deleteWindow=function(w)
{
	var found=-1;
	for(var i=0;i<this.windows.length && found==-1;i++)
	{
		if(this.windows[i]==w)found=i;
	}
	if(found!=-1)
		this.windows.splice(found,1);
};

WindowManager.prototype.getWidth=function()
{
	return parseInt(this.div_container.clientWidth);
};

WindowManager.prototype.getHeight=function()
{
	return parseInt(this.div_container.clientHeight);
};

WindowManager.prototype.getSize=function()
{
	return [this.getWidth(), this.getHeight()];
};

WindowManager.prototype.blockWindow=function(w,closeonclick)
{
	this.zIndex+=1;
	this.block_div.style.zIndex=this.zIndex;
	this.block_div.style.display='block';
	this.setSelectedWindow(w);
	var self=this;
	if(closeonclick)
	{
		w.onclose=function(win){self.unblock();return true;};
		this.blockclick=function(){w.close();self.unblock();};
	}
	else 
	{
		this.blockclick=function(){};
	}
};

WindowManager.prototype.unblock=function()
{
	this.block_div.style.display='none';
}

WindowManager.prototype.blockclick=function(){}

WindowManager.prototype.createWindow=function(x,y,w,h)
{
	var w_=new VNWindow(this,x,y,w,h);
	w_.setOnTop();
	this.windows[this.windows.length]=w_;
	return w_;
};

WindowManager.prototype.infoWindow=function(w,h,title)
{
	 var w_=this.createWindow(0,0,w,h);
	 w_.setCanClose(true);
	 w_.setTitle(title);
	 this.blockWindow(w_,true);
     w_.center();
	 return w_;
};

WindowManager.prototype.createConsole=function(x,y,w,h)
{
	var w_=this.createWindow(x,y,w,h);
	w_.setScrollerY(true);
	c=new VNConsoleWindow(w_.getContentDiv(),w_);
	return c;
};

WindowManager.prototype.createDesktopButton=function(x,y,w,h)
{
	var b_=new VNButton(this,x,y,w,h);
	this.buttons[this.buttons.length]=b_;
	return b_;
};

WindowManager.prototype.createWindowToggleButton=function(x,y,w,h,win)
{
 var b=this.createDesktopButton(x,y,w,h);
 b.setIsToggleButton(true);
 b.w=win;
 win.hide();
 win.onclose=function(win){b.setToggleState(false);win.hide();return false;};
 b.onclick=function(bt)
 {
	if(bt.isPressed())
	{
		bt.w.show();
	}
	else bt.w.hide();
 };
 return b;
};

WindowManager.prototype.getSelectedWindow=function(){return this.selected_window;};

WindowManager.prototype.setSelectedWindow=function(w)
{
	if(this.selected_window==w) return;
	
	if(this.selected_window!=null)
	{
		this.selected_window.setSelected(false);
		this.selected_window=null;
	}
	
	if(w!=null)
	{
		if(!w.isSelected()) w.setSelected(true);
		this.selected_window=w;
		this.selected_window.setOnTop();
	}
};

WindowManager.prototype.getDraggingWindow=function(){return this.dragging_window;};

WindowManager.prototype.setDraggingWindow=function(w)
{
	this.dragging_window=w;
};

WindowManager.prototype.getResizingWindow=function(){return this.resizing_window;};

WindowManager.prototype.setResizingWindow=function(w)
{
	this.resizing_window=w;
};

WindowManager.prototype.handleMouseUp=function()
{
	this.dragging_window=null;
	this.resizing_window=null;
};

WindowManager.prototype.handleMouseMove=function(x,y)
{
	if(this.dragging_window!=null)
		this.dragging_window.handleTitleMouseMove(x,y);
	if(this.resizing_window!=null)
		this.resizing_window.handleBorderMouseMove(x,y);
};

function VNWindow(manager,x,y,w,h)
{
	this.manager=manager;
	this.div_container=this.manager.div_container;
	
	this.width=w;
	if(this.width<(this.border_size+this.title_size)*2)this.width=(this.border_size+this.title_size)*2;
	if(this.width>parseInt(this.div_container.clientWidth))this.width=parseInt(this.div_container.clientWidth);
		
	this.height=h;
	if(this.height<this.border_size+this.title_size+this.border_size-this.visible_border_size)this.height=this.border_size+this.title_size+this.border_size-this.visible_border_size;
	if(this.height>parseInt(this.div_container.clientHeight))this.height=parseInt(this.div_container.clientHeight);
	
	this.left=x;
	if(this.left+this.width>parseInt(this.div_container.clientWidth))this.left=Math.max(parseInt(this.div_container.clientWidth)-this.width,0);
	
	this.top=y;
	if(this.top+this.height>parseInt(this.div_container.clientHeight))this.top=Math.max(parseInt(this.div_container.clientHeight)-this.height,0);
	
	this.border_size=15;
	this.visible_border_size=5;
	this.title_size=25;
	this.title='';
	this.is_selected=false;
	this.is_movable=true;
	this.is_resizable=true;
	this.is_closable=true;
	this.is_minimizable=false;
	this.is_minimized=false;
	
	//window_div
	this.window_div=document.createElement('div');
	this.div_container.appendChild(this.window_div);
	this.window_div.style.position='absolute';
	this.window_div.style.width=this.width+'px';
	this.window_div.style.height=this.height+'px';
	this.window_div.style.left=this.left+'px';
	this.window_div.style.top=this.top+'px';
	this.window_div.style.borderRadius='5px 5px 0px 0px';
	this.window_div.style.touchAction='none';
	this.window_div.style.overflow='hidden';
	
	//border_top_div
	this.border_top_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_div);
	this.border_top_div.style.position='absolute';
	this.border_top_div.style.width=(this.width-this.border_size*4)+'px';
	this.border_top_div.style.height=(this.border_size-this.visible_border_size)+'px';
	this.border_top_div.style.left=(this.border_size*2)+'px';
	this.border_top_div.style.top='0px';
	this.border_top_div.style.touchAction='none';
	this.border_top_div.style.cursor='ns-resize';
	
	//border_top_left_div
	this.border_top_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_left_div);
	this.border_top_left_div.style.position='absolute';
	this.border_top_left_div.style.width=(this.border_size*2)+'px';
	this.border_top_left_div.style.height=(this.border_size*2)+'px';
	this.border_top_left_div.style.left='0px';
	this.border_top_left_div.style.top='0px';
	this.border_top_left_div.style.touchAction='none';
	this.border_top_left_div.style.cursor='nw-resize';
	
	//border_top_right_div
	this.border_top_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_right_div);
	this.border_top_right_div.style.position='absolute';
	this.border_top_right_div.style.width=(this.border_size*2)+'px';
	this.border_top_right_div.style.height=(this.border_size*2)+'px';
	this.border_top_right_div.style.left=(this.width-this.border_size*2)+'px';
	this.border_top_right_div.style.top='0px';
	this.border_top_right_div.style.touchAction='none';
	this.border_top_right_div.style.cursor='ne-resize';
	
	//title_div
	this.title_div=document.createElement('div');
	this.window_div.appendChild(this.title_div);
	this.title_div.style.position='absolute';
	this.title_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.title_div.style.height=this.title_size+'px';
	this.title_div.style.left=(this.border_size-this.visible_border_size)+'px';
	this.title_div.style.top=(this.border_size-this.visible_border_size)+'px';
	this.title_div.style.backgroundColor=this.manager.default_title_backgroundColor;
	this.title_div.style.borderRadius='5px 5px 0px 0px';
	this.title_div.style.touchAction='none';
	
	//title_text_div
	this.title_text_div=document.createElement('div');
	this.title_div.appendChild(this.title_text_div);
	this.title_text_div.style.position='absolute';
	this.title_text_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.title_text_div.style.height=this.title_size+'px';
	this.title_text_div.style.left='0px';
	this.title_text_div.style.top='0px';
	this.title_text_div.style.borderRadius='5px 5px 0px 0px';
	this.title_text_div.style.touchAction='none';
	this.title_text_div.style.textAlign='center';
	this.title_text_div.style.lineHeight=this.title_size+'px';
	this.title_text_div.style.verticalAlign='middle';
	this.title_text_div.style.fontFamily='"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif';
	this.title_text_div.style.color=this.manager.default_title_fontColor;
	this.title_text_div.style.textShadow=this.manager.default_title_textShadow;
	this.title_text_div.style.fontWeight='700';
	this.title_text_div.style.fontSize='14px';
	this.title_text_div.style.overflow='hidden';
	
	//title_cover_div
	this.title_cover_div=document.createElement('div');
	this.title_div.appendChild(this.title_cover_div);
	this.title_cover_div.style.position='absolute';
	this.title_cover_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.title_cover_div.style.height=this.title_size+'px';
	this.title_cover_div.style.left='0px';
	this.title_cover_div.style.top='0px';
	this.title_cover_div.style.borderRadius='5px 5px 0px 0px';
	this.title_cover_div.style.touchAction='none';
	
	var close_rad=Math.floor((this.title_size-this.visible_border_size)/2);
	
	//close_div
	this.close_div=document.createElement('div');
	this.title_cover_div.appendChild(this.close_div);
	this.close_div.style.position='absolute';
	this.close_div.style.width=(close_rad*2)-4+'px';
	this.close_div.style.height=(close_rad*2)-4+'px';
	this.close_div.style.left=(this.width-2*(this.border_size-this.visible_border_size)-this.title_size)+'px';
	this.close_div.style.top=Math.floor(this.visible_border_size/2)+'px';
	this.close_div.style.backgroundImage=this.manager.default_close_icon;
	this.close_div.style.borderRadius=close_rad+'px';
	this.close_div.style.borderWidth='2px';
	this.close_div.style.borderStyle='solid';
	this.close_div.style.borderColor='rgb(255,255,255)';
	this.close_div.style.touchAction='none';
	this.close_div.style.cursor='pointer';
	
	//minimize_div
	this.minimize_div=document.createElement('div');
	this.title_cover_div.appendChild(this.minimize_div);
	this.minimize_div.style.position='absolute';
	this.minimize_div.style.width=(close_rad*2)-4+'px';
	this.minimize_div.style.height=(close_rad*2)-4+'px';
	this.minimize_div.style.left=(this.visible_border_size)+'px';
	this.minimize_div.style.top=Math.floor(this.visible_border_size/2)+'px';
	this.minimize_div.style.backgroundImage=this.manager.default_minimize_icon;
	this.minimize_div.style.borderRadius=close_rad+'px';
	this.minimize_div.style.borderWidth='2px';
	this.minimize_div.style.borderStyle='solid';
	this.minimize_div.style.borderColor='rgb(255,255,255)';
	this.minimize_div.style.touchAction='none';
	this.minimize_div.style.display='none';
	this.minimize_div.style.cursor='pointer';
	
	
	//visible_border_left_div
	this.visible_border_left_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_left_div);
	this.visible_border_left_div.style.position='absolute';
	this.visible_border_left_div.style.width=this.visible_border_size+'px';
	this.visible_border_left_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_left_div.style.left=(this.border_size-this.visible_border_size)+'px';
	this.visible_border_left_div.style.top=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.visible_border_left_div.style.backgroundColor=this.manager.default_border_color;
	this.visible_border_left_div.style.touchAction='none';
	
	//border_left_div
	this.border_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_left_div);
	this.border_left_div.style.position='absolute';
	this.border_left_div.style.width=this.border_size+'px';
	this.border_left_div.style.height=(this.height-this.title_size-this.border_size*2-(this.border_size-this.visible_border_size))+'px';
	this.border_left_div.style.left='0px';
	this.border_left_div.style.top=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.border_left_div.style.touchAction='none';
	this.border_left_div.style.cursor='ew-resize';
	
	//visible_border_right_div
	this.visible_border_right_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_right_div);
	this.visible_border_right_div.style.position='absolute';
	this.visible_border_right_div.style.width=this.visible_border_size+'px';
	this.visible_border_right_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_right_div.style.left=(this.width-this.border_size)+'px';
	this.visible_border_right_div.style.top=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.visible_border_right_div.style.backgroundColor=this.manager.default_border_color;
	this.visible_border_right_div.style.touchAction='none';
	
	//border_right_div
	this.border_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_right_div);
	this.border_right_div.style.position='absolute';
	this.border_right_div.style.width=this.border_size+'px';
	this.border_right_div.style.height=(this.height-this.title_size-this.border_size*2-(this.border_size-this.visible_border_size))+'px';
	this.border_right_div.style.left=(this.width-this.border_size)+'px';
	this.border_right_div.style.top=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.border_right_div.style.touchAction='none';
	this.border_right_div.style.cursor='ew-resize';
	
	//visible_border_bottom_div
	this.visible_border_bottom_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_bottom_div);
	this.visible_border_bottom_div.style.position='absolute';
	this.visible_border_bottom_div.style.width=(this.width-(this.border_size-this.visible_border_size)*2)+'px';
	this.visible_border_bottom_div.style.height=this.visible_border_size+'px';
	this.visible_border_bottom_div.style.left=(this.border_size-this.visible_border_size)+'px';
	this.visible_border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.visible_border_bottom_div.style.backgroundColor=this.manager.default_border_color;
	this.visible_border_bottom_div.style.touchAction='none';
	
	//border_bottom_div
	this.border_bottom_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_div);
	this.border_bottom_div.style.position='absolute';
	this.border_bottom_div.style.width=(this.width-this.border_size*4)+'px';
	this.border_bottom_div.style.height=this.border_size+'px';
	this.border_bottom_div.style.left=(this.border_size*2)+'px';
	this.border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.border_bottom_div.style.touchAction='none';
	this.border_bottom_div.style.cursor='ns-resize';
	
	//border_bottom_left_div
	this.border_bottom_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_left_div);
	this.border_bottom_left_div.style.position='absolute';
	this.border_bottom_left_div.style.width=(this.border_size*2)+'px';
	this.border_bottom_left_div.style.height=(this.border_size*2)+'px';
	this.border_bottom_left_div.style.left='0px';
	this.border_bottom_left_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_left_div.style.touchAction='none';
	this.border_bottom_left_div.style.cursor='sw-resize';
	
	//border_bottom_right_div
	this.border_bottom_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_right_div);
	this.border_bottom_right_div.style.position='absolute';
	this.border_bottom_right_div.style.width=(this.border_size*2)+'px';
	this.border_bottom_right_div.style.height=(this.border_size*2)+'px';
	this.border_bottom_right_div.style.left=(this.width-this.border_size*2)+'px';
	this.border_bottom_right_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_right_div.style.touchAction='none';
	this.border_bottom_right_div.style.cursor='se-resize';
	
	//content_div
	this.content_div=document.createElement('div');
	this.window_div.appendChild(this.content_div);
	this.content_div.style.position='absolute';
	this.content_div.style.width=(this.width-this.border_size*2)+'px';
	this.content_div.style.height=(this.height-this.border_size-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.content_div.style.left=this.border_size+'px';
	this.content_div.style.top=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.content_div.style.backgroundColor='rgb(255,255,255)';
	this.content_div.style.overflowX='hidden';
	this.content_div.style.overflowY='hidden';
	
	this.offset_x=0;
	this.offset_y=0;
	this.memory_x=0;
	this.memory_y=0;
	this.memory_width=0;
	this.memory_height=0;
	this.is_moving=false;
	this.is_resizing=false;
	this.resizing_border_id=0;
	this.touch_operated=false;
 
	var self=this;	
	
	//title_div events:
	this.title_div.addEventListener('mousemove',function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleTitleMouseMove(x,y);},false);
	this.title_div.addEventListener('mouseup',function(event){self.handleTitleMouseUp();},false);
	this.title_div.addEventListener('mousedown',function(event){if(this.touch_operated)return;if(event.target==self.close_div){self.close();return;}else if(event.target==self.minimize_div){self.minmax();return;}event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY;self.handleTitleMouseDown(x,y);},false);
	this.title_div.addEventListener('touchstart',function(event){this.touch_operated=true;if(event.target==self.close_div){self.close();return;}else if(event.target==self.minimize_div){self.minmax();return;}event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;} self.handleTitleMouseMove(x,y);self.handleTitleMouseDown(x,y);},false);
	this.title_div.addEventListener('touchend',function(event){self.handleTitleMouseUp();},false);
	this.title_div.addEventListener('touchmove',function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleTitleMouseMove(x,y);},false);
	
	//border divs events:
	this.window_div.addEventListener('mousemove',function(event){if(!self.isBorder(event.target))return;event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleBorderMouseMove(x,y);},false);
	this.window_div.addEventListener('mouseup',function(event){self.handleBorderMouseUp();},false);
	this.window_div.addEventListener('mousedown',function(event){self.setSelected(true);if(!self.isBorder(event.target))return;if(self.touch_operated)return;self.resizing_border_id=self.getBorderId(event.target);event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY;self.handleBorderMouseDown(x,y);},false);
	this.window_div.addEventListener('touchstart',function(event){self.setSelected(true);if(!self.isBorder(event.target))return;self.touch_operated=true;self.resizing_border_id=self.getBorderId(event.target);event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;} self.handleBorderMouseMove(x,y);self.handleBorderMouseDown(x,y);},false);
	this.window_div.addEventListener('touchend',function(event){self.handleBorderMouseUp();},false);
	this.window_div.addEventListener('touchmove',function(event){if(!self.isBorder(event.target))return;event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleBorderMouseMove(x,y);},false);
	
};

VNWindow.prototype.isBorder=function(div)
{
	if(div==this.border_left_div||div==this.border_right_div||div==this.border_bottom_div||div==this.border_bottom_left_div||div==this.border_bottom_right_div||div==this.border_top_div||div==this.border_top_left_div||div==this.border_top_right_div)
		return true;
	else
		return false;
};

VNWindow.prototype.getBorderId=function(div)
{
	if(div==this.border_left_div)
		return 1;
	else if(div==this.border_right_div)
		return 2;
	else if(div==this.border_bottom_div)
		return 3;	
	else if(div==this.border_bottom_left_div)
		return 4;
	else if(div==this.border_bottom_right_div)
		return 5;
	else if(div==this.border_top_div)
		return 6;	
	else if(div==this.border_top_left_div)
		return 7;
	else if(div==this.border_top_right_div)
		return 8;
	else
		return 0;
};

VNWindow.prototype.getContentDiv=function(){return this.content_div;};

VNWindow.prototype.setOnTop=function()
{
	this.manager.zIndex+=1;
	this.window_div.style.zIndex=this.manager.zIndex;
};

VNWindow.prototype.canMove=function(){return this.is_movable;};
VNWindow.prototype.setCanMove=function(flag){this.is_movable=flag;};

VNWindow.prototype.canResize=function(){return this.is_resizable;};
VNWindow.prototype.setCanResize=function(flag)
{
	this.is_resizable=flag;
	if(this.is_resizable)
	{
		this.border_left_div.style.cursor='ew-resize';
		this.border_right_div.style.cursor='ew-resize';
		this.border_bottom_div.style.cursor='ns-resize';
		this.border_bottom_left_div.style.cursor='sw-resize';
		this.border_bottom_right_div.style.cursor='se-resize';
		this.border_top_div.style.cursor='ns-resize';
		this.border_top_left_div.style.cursor='nw-resize';
		this.border_top_right_div.style.cursor='ne-resize';
	}
	else
	{
		this.border_left_div.style.cursor='auto';
		this.border_right_div.style.cursor='auto';
		this.border_bottom_div.style.cursor='auto';
		this.border_bottom_left_div.style.cursor='auto';
		this.border_bottom_right_div.style.cursor='auto';
		this.border_top_div.style.cursor='auto';
		this.border_top_left_div.style.cursor='auto';
		this.border_top_right_div.style.cursor='auto';
	}
};

VNWindow.prototype.canClose=function(){return this.is_closable;};
VNWindow.prototype.setCanClose=function(flag)
{
	this.is_closable=flag;
	if(this.is_closable)
		this.close_div.style.display='block';
	else this.close_div.style.display='none';
};

VNWindow.prototype.minmax=function()
{
	this.setSelected(true);
	if(this.is_minimized)
		this.expand();
	else
		this.minimize();
};

VNWindow.prototype.minimize=function()
{
	this.is_minimized=true;
	this.minimize_div.style.backgroundImage=this.manager.default_expand_icon;
	this.window_div.style.height=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this.onminimize(this);
};

VNWindow.prototype.onminimize=function(w){};

VNWindow.prototype.canMinimize=function(){return this.is_minimizable;};

VNWindow.prototype.setCanMinimize=function(flag)
{
	this.is_minimizable=flag;
	if(this.is_minimizable)
		this.minimize_div.style.display='block';
	else
	{
		this.is_minimized=false;
		this.minimize_div.style.backgroundImage=this.manager.default_minimize_icon;
		this.window_div.style.height=this.height+'px';
		this.minimize_div.style.display='none';
	}
};

VNWindow.prototype.isMinimized=function(){return this.is_minimized;};

VNWindow.prototype.expand=function()
{
	this.is_minimized=false;
	this.minimize_div.style.backgroundImage=this.manager.default_minimize_icon;
	this.window_div.style.height=this.height+'px';
	this.onexpand(this);
};

VNWindow.prototype.hide=function()
{
	this.window_div.style.display='none';
}

VNWindow.prototype.show=function()
{
	this.window_div.style.display='block';
}

VNWindow.prototype.onexpand=function(w){};

VNWindow.prototype.setScrollerX=function(flag)
{
	if(flag)
		this.content_div.style.overflowX='scroll';
	else
		this.content_div.style.overflowX='hidden';
};

VNWindow.prototype.setScrollerY=function(flag)
{
	if(flag)
		this.content_div.style.overflowY='scroll';
	else
		this.content_div.style.overflowY='hidden';
};

VNWindow.prototype.close=function()
{
	if(this.onclose(this))this.destroy();
};

VNWindow.prototype.onclose=function(w){return true;};

VNWindow.prototype.destroy=function()
{
	if(this.manager.getSelectedWindow()==this)
		this.manager.setSelectedWindow(null);
	
	this.manager.deleteWindow(this);
	
	this.div_container.removeChild(this.window_div);
};

VNWindow.prototype.onfocus=function(w){};

VNWindow.prototype.setSelected=function(flag)
{
	if(this.is_selected==flag) return;
	
	if(flag) this.onfocus(this);
	
	this.is_selected=flag;
	if(this.is_selected)
		this.title_div.style.backgroundColor=this.manager.default_title_selectedColor;
	else
		this.title_div.style.backgroundColor=this.manager.default_title_backgroundColor;
		
	if(this.is_selected && this.manager!=null)
		this.manager.setSelectedWindow(this);
};

VNWindow.prototype.isSelected=function(){return this.is_selected;};

VNWindow.prototype.setTitle=function(title)
{
	this.title=title;
	this.title_text_div.innerHTML=this.title;
};

VNWindow.prototype.getTitle=function(){return this.title;};

VNWindow.prototype.setPosition=function(x,y)
{
	this.left=x;
	if(this.left+this.width>parseInt(this.div_container.clientWidth))this.left=Math.max(parseInt(this.div_container.clientWidth)-this.width,0);
	
	this.top=y;
	if(this.top+this.height>parseInt(this.div_container.clientHeight))this.top=Math.max(parseInt(this.div_container.clientHeight)-this.height,0);
	
	
	this.window_div.style.left=this.left+'px';
	this.window_div.style.top=this.top+'px';
};

VNWindow.prototype.getPosition=function(){return [this.left,this.top];};

VNWindow.prototype.setSize=function(w,h)
{
	this.width=w;
	if(this.width<(this.border_size+this.title_size)*2)this.width=(this.border_size+this.title_size)*2;
	if(this.width>parseInt(this.div_container.clientWidth))this.width=parseInt(this.div_container.clientWidth);
	
	this.height=h;
	if(this.height<this.border_size+this.title_size+this.border_size-this.visible_border_size)this.height=this.border_size+this.title_size+this.border_size-this.visible_border_size;
	if(this.height>parseInt(this.div_container.clientHeight))this.height=parseInt(this.div_container.clientHeight);
	
	this.window_div.style.width=this.width+'px';
	this.window_div.style.height=this.height+'px';
	
	this.border_top_div.style.width=(this.width-4*this.border_size)+'px';
	this.border_top_right_div.style.left=(this.width-this.border_size*2)+'px';
	this.title_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.title_cover_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.title_text_div.style.width=(this.width-2*(this.border_size-this.visible_border_size))+'px';
	this.close_div.style.left=(this.width-2*(this.border_size-this.visible_border_size)-this.title_size)+'px';
	this.content_div.style.width=(this.width-this.border_size*2)+'px';
	this.content_div.style.height=(this.height-this.border_size-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.border_left_div.style.height=(this.height-this.border_size*2-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_left_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.border_right_div.style.height=(this.height-this.border_size*2-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.border_right_div.style.left=(this.width-this.border_size)+'px';
	this.visible_border_right_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_right_div.style.left=(this.width-this.border_size)+'px';
	this.border_bottom_div.style.width=(this.width-4*this.border_size)+'px';
	this.border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.visible_border_bottom_div.style.width=(this.width-(this.border_size-this.visible_border_size)*2)+'px';
	this.visible_border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.border_bottom_left_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_right_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_right_div.style.left=(this.width-this.border_size*2)+'px';
	
	this.onresize(this);
};

VNWindow.prototype.onresize=function(w){};

VNWindow.prototype.getSize=function(){return [this.width,this.height];};

VNWindow.prototype.center=function()
{
	this.setPosition(Math.floor((this.manager.getWidth()-this.width)/2),Math.floor((this.manager.getHeight()-this.height)/2));
};

VNWindow.prototype.handleTitleMouseUp=function()
{
	this.is_moving=false;
	this.title_cover_div.style.cursor='auto';
};

VNWindow.prototype.handleTitleMouseDown=function(x,y)
{
	//this.setSelected(true);
	if(!this.is_movable)return;
	this.manager.setDraggingWindow(this);
	this.is_moving=true;
	this.title_cover_div.style.cursor='move';
	this.offset_x=x[0]-parseInt(this.window_div.style.left);
	this.offset_y=y[0]-parseInt(this.window_div.style.top);
};

VNWindow.prototype.handleTitleMouseMove=function(x,y)
{
	if(this.is_moving)
	{
		this.window_div.style.left=(x[0]-this.offset_x)+'px';
		this.window_div.style.top=(y[0]-this.offset_y)+'px';		
	}
};

VNWindow.prototype.handleBorderMouseUp=function()
{
	this.is_resizing=false;
	this.resizing_border_id=0;
};

VNWindow.prototype.handleBorderMouseDown=function(x,y)
{
	if(!this.is_resizable)return;
	this.manager.setResizingWindow(this);
	this.memory_x=x[0];
	this.memory_y=y[0];
	this.memory_width=this.width;
	this.memory_height=this.height;
	this.is_resizing=true;
	this.offset_x=x[0]-parseInt(this.window_div.style.left);
	this.offset_y=y[0]-parseInt(this.window_div.style.top);
};

VNWindow.prototype.handleBorderMouseMove=function(x,y)
{
	if(this.is_resizing)
	{
		if(this.resizing_border_id==1)
		{
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height);
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==2)
		{
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height);
		}
		else if(this.resizing_border_id==3)
		{
			this.setSize(this.memory_width,this.memory_height+y[0]-this.memory_y);
		}
		else if(this.resizing_border_id==4)
		{
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height+y[0]-this.memory_y);
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==5)
		{
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height+y[0]-this.memory_y);
		}
		else if(this.resizing_border_id==6)
		{
			var h=this.height;
			this.setSize(this.memory_width,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
		}
		else if(this.resizing_border_id==7)
		{
			var h=this.height;
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==8)
		{
			var h=this.height;
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
		}
	}
};


function VNConsoleWindow(div_container,wind)
{
	this.div_container=div_container;
	this.win=null;
	if (typeof wind !== "undefined") this.win=wind;
	this.div_container.style.backgroundColor='rgb(0,0,0)';
	this.console_lines=null;
	this.echo_in_console=false;
	this.max_num_of_lines=100;
	this.init();
}

VNConsoleWindow.prototype.getWindow=function(){return this.win;};

VNConsoleWindow.prototype.setEchoInConsole=function(flag){this.echo_in_console=flag;};

VNConsoleWindow.prototype.setMaxNumOfLines=function(num){this.max_num_of_lines=num;};

VNConsoleWindow.prototype.getWidth=function()
{
	return this.div_container.clientWidth;
};

VNConsoleWindow.prototype.getHeight=function()
{
	return this.div_container.clientHeight;
};

function VNConsoleWindowElement(txt,parent,clr)
{
	this.text=txt;
	this.color='rgb(255,255,255)';
	if(typeof clr!=='undefined')
		this.color=clr;
	this.parent=parent;
	this.div_container=null;
	this.init();
}

VNConsoleWindowElement.prototype.init=function()
{
	this.div_container=document.createElement('div');
	this.div_container.style.float='left';
	this.div_container.style.verticalAlign='middle';
	this.div_container.style.width='100%';
	this.div_container.style.fontFamily='"Courier New", Courier, monospace';
	this.div_container.style.fontSize='14px';
	this.div_container.style.color=this.color;
	this.div_container.innerHTML=this.text;
	if(this.parent.echo_in_console) console.log(this.text);
	this.parent.div_container.appendChild(this.div_container);
	if(this.parent.div_container.childNodes.length>this.parent.max_num_of_lines)
		this.parent.div_container.removeChild(this.parent.div_container.childNodes[0]);

	this.div_container.scrollIntoView();
};

VNConsoleWindow.prototype.println=function(txt)
{
	new VNConsoleWindowElement(txt,this);
};


VNConsoleWindow.prototype.error=function(txt)
{
	new VNConsoleWindowElement('ERROR> '+txt,this,'rgb(255,128,128)');
};

VNConsoleWindow.prototype.init=function()
{
	var self=this;
	window.addEventListener('error', function(e) { 
		  self.error(e.message+' '+e.filename.substring(e.filename.lastIndexOf('/')+1)+' '+e.lineno+' '+e.colno);
		  console.log(e);
		  return true;
		}, false);
	
	
	var d=''+new Date();
	var i=d.indexOf('GMT');
	if(i>-1) d=d.substring(0,i-1);
	this.println(d);
	this.println('---- Console started ----');
};
	

function VNButton(manager,x,y,w,h)
{
	this.manager=manager;
	this.div_container=this.manager.div_container;
	
	this.width=w;
	this.height=h;
	
	this.left=x;
	this.top=y;
	this.label='';
		
	this.is_toggle_button=false;
	this.toggle_state=false;
	
	//shadow_div
	this.shadow_div=document.createElement('div');
	this.div_container.appendChild(this.shadow_div);
	this.shadow_div.style.position='absolute';
	this.shadow_div.style.width=(this.width+1)+'px';
	this.shadow_div.style.height=(this.height+1)+'px';
	this.shadow_div.style.left=(this.left+2)+'px';
	this.shadow_div.style.top=(this.top+2)+'px';
	var rad=Math.min(Math.floor(this.width/2),Math.floor(this.height/2));
	this.shadow_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.shadow_div.style.touchAction='none';
	this.shadow_div.style.overflow='hidden';
	this.shadow_div.style.backgroundColor='rgba(128,128,128,0.5)';
	this.shadow_div.style.zIndex=0;
	
	//button_div
	this.button_div=document.createElement('div');
	this.div_container.appendChild(this.button_div);
	this.button_div.style.position='absolute';
	this.button_div.style.width=this.width+'px';
	this.button_div.style.height=this.height+'px';
	this.button_div.style.left=this.left+'px';
	this.button_div.style.top=this.top+'px';
	this.button_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.button_div.style.touchAction='none';
	this.button_div.style.overflow='hidden';
	this.button_div.style.backgroundColor=this.manager.default_button_backgroundColor;
	this.shadow_div.style.zIndex=0;
	
		//text_div
	this.text_div=document.createElement('div');
	this.button_div.appendChild(this.text_div);
	this.text_div.style.position='absolute';
	this.text_div.style.width=this.width+'px';
	this.text_div.style.height=this.height+'px';
	this.text_div.style.left='0px';
	this.text_div.style.top='0px';
	this.text_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.text_div.style.touchAction='none';
	this.text_div.style.textAlign='center';
	this.text_div.style.lineHeight=this.height+'px';
	this.text_div.style.verticalAlign='middle';
	this.text_div.style.fontFamily=this.manager.default_button_fontFamily;
	this.text_div.style.color=this.manager.default_button_fontColor;
	this.text_div.style.fontWeight=this.manager.default_button_fontWeight;
	this.text_div.style.fontSize=Math.floor(this.height/2)+'px';
	
	//cover_div
	this.cover_div=document.createElement('div');
	this.button_div.appendChild(this.cover_div);
	this.cover_div.style.position='absolute';
	this.cover_div.style.width=this.width+'px';
	this.cover_div.style.height=this.height+'px';
	this.cover_div.style.left='0px';
	this.cover_div.style.top='0px';
	this.cover_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.cover_div.style.touchAction='none';
	
	this.touch_operated=false;
	var self=this;	
	
	this.cover_div.addEventListener('mousedown',function(event){if(this.touch_operated)return;event.preventDefault();self.click();},false);
	this.cover_div.addEventListener('touchstart',function(event){this.touch_operated=true;event.preventDefault();self.click();},false);
};

VNButton.prototype.isToggleButton=function(){return this.is_toggle_button;};

VNButton.prototype.setPosition=function(x,y)
{
	this.left=x;
	this.top=y;
	this.button_div.style.left=this.left+'px';
	this.button_div.style.top=this.top+'px';
	this.shadow_div.style.left=(this.left+2)+'px';
	this.shadow_div.style.top=(this.top+2)+'px';
};

VNButton.prototype.setImage=function(value)
{
	this.button_div.style.backgroundImage=value;
	this.button_div.style.backgroundSize='cover';
};

VNButton.prototype.square=function()
{
	this.shadow_div.style.borderRadius='0px 0px 0px 0px';
	this.button_div.style.borderRadius='0px 0px 0px 0px';
	this.text_div.style.borderRadius='0px 0px 0px 0px';
	this.cover_div.style.borderRadius='0px 0px 0px 0px';
};

VNButton.prototype.round=function()
{
	var rad=Math.min(Math.floor(this.width/2),Math.floor(this.height/2));
	this.shadow_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.button_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.text_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.cover_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
};

VNButton.prototype.setIsToggleButton=function(flag)
{
	this.is_toggle_button=flag;
	this.toggle_state=false;
	this.cover_div.style.backgroundColor='';
};

VNButton.prototype.isPressed=function(){return this.toggle_state;};


VNButton.prototype.setToggleState=function(flag)
{
	if(this.is_toggle_button)
	{
		if(!flag)
		{
			this.toggle_state=false;
			this.cover_div.style.backgroundColor='';
		}
		else
		{
			this.toggle_state=true;
			this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
		}
	}
}

VNButton.prototype.click=function()
{
	if(this.is_toggle_button)
	{
		if(this.toggle_state)
		{
			this.toggle_state=false;
			this.cover_div.style.backgroundColor='';
		}
		else
		{
			this.toggle_state=true;
			this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
		}
	}
	else this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
	this.onclick(this);
	var self=this;
	if(!this.is_toggle_button) setTimeout(function(){self.cover_div.style.backgroundColor='';}, 200);
};

VNButton.prototype.onclick=function(b){};

VNButton.prototype.setLabel=function(label)
{
	this.label=label;
	this.text_div.innerHTML=this.label;
};

