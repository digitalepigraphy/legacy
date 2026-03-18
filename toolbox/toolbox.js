/*
 * Copyright 2013, Digital Epigraphy and Archaeology Group, University of 
 * Florida, Angelos Barmpoutis, Eleni Bozia, Robert Wagman.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * When this program is used for academic purposes, the following
 * article must be cited: A. Barmpoutis, E. Bozia, R. S. Wagman, "A novel 
 * framework for 3D reconstruction and analysis of ancient inscriptions", 
 * Journal of Machine Vision and Applications, 2010, Vol.21(6), p.989-998
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


var beta_host="research.dwi.ufl.edu/";
beta_host="";
var toolbox_root="https://"+"digitalepigraphy.github.io/legacy/toolbox/";
var collection_root="https://"+"digitalepigraphy.github.io/legacy/collection/";

var dea_toolbox;
var dea_collections=[];

function DEAcollection() //Constructor
{
	this.name='';
	this.folder='';
	this.description='';
	this.first_record='';
	this.hidden=false;
}

DEAcollection.prototype.setName=function(n){this.name=n;}
DEAcollection.prototype.setFolder=function(f){this.folder=f;}
DEAcollection.prototype.setDescription=function(d){this.description=d;}
DEAcollection.prototype.setFirstRecord=function(fr){this.first_record=fr;}
DEAcollection.prototype.setHidden=function(h){if(h==true || h=='true')this.hidden=true;else h=false;}

function findCollection(f)
{
	loadDEAcollections(true);
	var c;
	var found=false;
	for(var i=0;i<dea_collections.length && !found;i++)
		if(dea_collections[i].folder==f)
		{
			found=true;
			c=dea_collections[i];
		}
	return c;
}

function loadDEAcollections(find_flag)
{
	find_flag = typeof find_flag !== 'undefined' ? find_flag : false;	

	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	if(find_flag) xmlhttp.open("GET",collection_root+"index.xml",false);
	else xmlhttp.open("GET","../collection/index.xml",false);
	xmlhttp.send();
	var data=xmlhttp.responseXML;
	var num_of_collections=data.getElementsByTagName("collection").length;
	for(var i=0;i<num_of_collections;i++)
	{
		dea_collections[i]=new DEAcollection();
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("name")[0].childNodes[0])  
		dea_collections[i].setName(data.getElementsByTagName("collection")[i].getElementsByTagName("name")[0].childNodes[0].nodeValue);
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("folder")[0])
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("folder")[0].childNodes[0])  
		dea_collections[i].setFolder(data.getElementsByTagName("collection")[i].getElementsByTagName("folder")[0].childNodes[0].nodeValue);
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("description")[0].childNodes[0])  
		dea_collections[i].setDescription(data.getElementsByTagName("collection")[i].getElementsByTagName("description")[0].childNodes[0].nodeValue);
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("featured")[0].childNodes[0])  
		dea_collections[i].setFirstRecord(data.getElementsByTagName("collection")[i].getElementsByTagName("featured")[0].childNodes[0].nodeValue);
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("hidden")[0])
		if(data.getElementsByTagName("collection")[i].getElementsByTagName("hidden")[0].childNodes[0])  
		dea_collections[i].setHidden(data.getElementsByTagName("collection")[i].getElementsByTagName("hidden")[0].childNodes[0].nodeValue);
		
	}
}

function receiveMessage(evt)
{
  if (evt.origin === 'https://digitalepigraphy.github.io')
  {
    var s=evt.data.substring(0,4);
    if(s=="view" || s=="both")
	{
	    document.getElementById("viewframe").src="https://digitalepigraphy.github.io/legacy/view.html?"+evt.data.substring(5)+"&ref="+toolbox_root;
		document.body.scrollTop = document.documentElement.scrollTop = 0;
	}
    if(s=="read" || s=="both")
	    document.getElementById("readframe").src="https://digitalepigraphy.github.io/legacy/read.html?"+evt.data.substring(5);
	if(s=="resh")
	{
		document.getElementById("searchframe").height=evt.data.substring(5)+"px";
	}
	if(s=="redi")
		window.location = evt.data.substring(5);
	if(s=="clct")
	{
		window.location = collection_root+evt.data.substring(5);
	}
	if(s=="clcn")
	{
		window.location = toolbox_root+"index.html?collection="+evt.data.substring(5);
	}
	if(s=="srch")
	{
		window.location = toolbox_root+"index.html?keyword="+evt.data.substring(5);
	}
  }
}

function getURLValues() {
  var search = window.location.search.replace(/^\?/,'').replace(/\+/g,' ');
  var values = {};
  if (search.length) {
    var part, parts = search.split('&');
    for (var i=0, iLen=parts.length; i<iLen; i++ ) {
      part = parts[i].split('=');
      values[part[0]] = window.decodeURIComponent(part[1]);
    }
  }
  return values;
}

function DigitalEpigraphyToolbox() //Constructor
{
	this.collection=null;
}

DigitalEpigraphyToolbox.prototype.showDefaultSearchToolbar=function()
{
	var s="";
	if(this.collection==null) s="Search by collection";
	else s="Change collection";
	
	var e=document.getElementById('search_toolbar');
	e.innerHTML='<div style="display:block;position:relative;float:left;"><form action="#" name="form1" onsubmit="return onShowSearch();"><input type="image" src="'+toolbox_root+'search_icon.png" style="vertical-align: top" width="40px" title="Search by keyword"></form></div><div style="display:block;position:relative;float:left;"><form action="#" name="form1" onsubmit="return onShowCollections();"><input type="image" src="'+toolbox_root+'folder_icon.png" style="vertical-align: top" width="40px" title="'+s+'"></form></div><div style="display:block;position:relative;float:right;"><form action="#" name="form1" onsubmit="return onShowSettings();"><input type="image" src="'+toolbox_root+'settings_icon.png" style="vertical-align: top" width="40px" title="Search settings"></form></div><div style="display:block;position:relative;float:right;"><form action="#" name="form1" onsubmit="return onShowMyEdits();"><input type="image" src="'+toolbox_root+'user_icon.png" style="vertical-align: top" width="40px" title="My contributions"></form></div>';
}

DigitalEpigraphyToolbox.prototype.showHeader=function()
{
	document.write('<div id="myheader_container"><div id="myheader"><div id="mylogo"><img src="'+toolbox_root+'DEAicon_40.png" onclick="parent.location=\'https://digitalepigraphy.github.io\';" onMouseover="this.style.cursor=\'pointer\';" style="vertical-align:top;"><font class="dea_title_font">&nbsp;Digital Epigraphy Toolbox</font> <font class="nrml">(v2.5 beta)</font></div><div id="myheader_links_container"><div id="myheader_upper_links"><div class="myheader_upper_block"><font class="header_text"><a href="'+toolbox_root+'info.html"><font color="#FFFFFF">About</font></a></font></div><div class="myheader_upper_block"><font class="header_text"><a href="'+toolbox_root+'../people/" target="_blank"><font color="#FFFFFF" target="_blank">People</font></a></font></div><div class="myheader_upper_block"><font class="header_text"><a href="'+toolbox_root+'../news/embed_3d_inscriptions_into_your_website/" target="_blank"><font color="#FFFFFF">Embed</font></a></font></div><div class="myheader_upper_block"><font class="header_text"><a href="'+toolbox_root+'digitize.html" target="_blank"><font color="#FFFFFF">Digitize</font></a></font></div><div class="myheader_upper_block"><font class="header_text"><a href="'+toolbox_root+'"><font color="#FFFFFF">Home</font></a></font></div></div></div></div></div>');
}

DigitalEpigraphyToolbox.prototype.showMain=function(first_record)
{
    document.write('<div id="maincontainer"><div id="aside"><div id="myexhibit"><iframe id="viewframe" src="https://digitalepigraphy.github.io/legacy/view.html?'+first_record+'&ref='+toolbox_root+'" width="618px" height="400px" frameborder="0" scrolling="no"></iframe></div><div id="myhrzone2"></div><div id="textarea_container"><iframe id="readframe" src="https://digitalepigraphy.github.io/legacy/read.html?'+first_record+'" width="618px" height="664px" frameborder="0"></iframe></div></div><div id="search_container">');
	var h=1026;
	var f="";
	if(this.collection!=null)
	{
		document.write('<div style="display:block;position:relative;float:top;height:24px;width:100%;background-color:rgba(0,0,0,0.5);overflow:hidden;"> <font class="dea_title_font">&nbsp'+this.collection.name+'</font></div>');
		f=this.collection.folder;
		h-=24;
	}
	var k="";
	if(this.collection==null)
	{
		var v=getURLValues();
		if(typeof v['keyword'] !== 'undefined') 
		k='keyword='+v['keyword']+'&';
	}
	document.write('<div style="display:block;position:relative;float:top;min-height:40px;width:100%;" id="search_toolbar"></div><div style="-webkit-overflow-scrolling:touch;overflow:scroll;overflow-x:hidden;width:336px;height:'+h+'px;" id="searchframe_container"><iframe id="searchframe" src="https://digitalepigraphy.github.io/legacy/toolbox/search.html?'+k+'collection='+f+'" frameborder="0" width="336px" height="'+(h-5)+'px"></iframe></div></div></div>');
}

DigitalEpigraphyToolbox.prototype.showFooter=function()
{
	document.write('<div id="mycredits_container"><div style="float:left;"><font class="nrml">Awards and Grant support:</font><br><img src="'+toolbox_root+'leipzig_award.png" height="80px" title="e-Humanities Innovation Award, 2nd place, University of Leipzig, 2012" onClick="window.open(\'https://www.uni-leipzig.de/\');" onMouseover="this.style.cursor=\'pointer\';"><img src="'+toolbox_root+'neh_grant2011.png" height="80px" title="National Endowment for the Humanities, Office of Digital Humanities, Award: HD-51214-11, 2011-2012" onClick="window.open(\'https://www.neh.gov/\');" onMouseover="this.style.cursor=\'pointer\';"><img src="'+toolbox_root+'chps_grant2013.png" height="80px" title="Center for the Humanities and the Public Sphere, University of Florida, Rothman Fellowship in the Humanities, 2013" onClick="window.open(\'https://www.humanities.ufl.edu/\');" onMouseover="this.style.cursor=\'pointer\';"><img src="'+toolbox_root+'ciegl_bursary_award_2007.png" height="80px" title="Bursary Award, University of Oxford, 13th International Congress of Greek and Latin Epigraphy, 2007" onclick="parent.location=\'https://ciegl.classics.ox.ac.uk/\';" onmouseover="this.style.cursor=\'pointer\';" style="cursor: pointer;"><img src="'+toolbox_root+'BSN5_2014_logo2.png" height="80px" title="BSN5 Grant for E-STAMPAGES project, French Ministry of Higher Education in collaboration with the University of Lyon 2 and the French School of Athens, 2014" onclick="parent.location=\'https://www.enseignementsup-recherche.gouv.fr/cid24149/dgesip.html\';" onmouseover="this.style.cursor=\'pointer\';" style="cursor: pointer;"></div><div style="float:right"><font class="nrml">Join us:</font><br><img src="'+toolbox_root+'fb_logo.png" height="70px" title="Digital Epigraphy and Archaeology group in Facebook" onClick="window.open(\'https://www.facebook.com/groups/digitalepigraphy/\');" onMouseover="this.style.cursor=\'pointer\';"><img src="'+toolbox_root+'youtube_logo.png" height="70px" title="Digital Epigraphy and Archaeology channel in YouTube" onClick="window.open(\'https://www.youtube.com/watch?v=dt1CpBkZDNQ\');" onMouseover="this.style.cursor=\'pointer\';"></div><div style="float:right;width:20px;height:100px;"></div><div style="float:right"><font class="nrml">Archived by:</font><br><img src="'+toolbox_root+'bsb_logo.png" height="70px" title="Bayerische Staatsbibliothek - Bavarian State Library" onClick="window.open(\'https://www.bsb-muenchen.de/en/\');" onMouseover="this.style.cursor=\'pointer\';"></div><div style="float:right;width:20px;height:100px;"></div><div style="float:right"><font class="nrml">Powered by:</font><br><img src="'+toolbox_root+'dw_logo.png" height="70px" title="Digital Worlds Institute, University of Florida" onClick="window.open(\'https://www.digitalworlds.ufl.edu/\');" onMouseover="this.style.cursor=\'pointer\';"></div></div>');
}

DigitalEpigraphyToolbox.prototype.show=function(bkgclr,txtclr,collctn,first_record)
{
	collctn = typeof collctn !== 'undefined' ? collctn : "";	
	
	if(collctn.length>0)
	{
		this.collection=findCollection(collctn);
		if(this.collection.first_record!=null)
			first_record=this.collection.first_record;
	}
	
	first_record = typeof first_record !== 'undefined' ? first_record : "object=bywt672d7suhw63g";
	
	document.write('<div id="globalcontainer">');
    this.showHeader();
    document.write('<div id="myhrzone"></div>');
	this.showMain(first_record);
	this.showDefaultSearchToolbar();
	document.write('<div id="myfooter"><font class="footer_text"><font style="BACKGROUND-COLOR: '+bkgclr+'" color="'+txtclr+'">&nbsp;The Digital Epigraphy and Archaeology Group, University of Florida, P.O.Box 115810, 101 Norman Gym, Gainesville, FL 32611-5810 USA&nbsp;</font></font></div>');
	this.showFooter();
	document.write('</div>');
}


function onSearch()
{
	if(document.getElementsByName("keyword")[0].value.length>0)
	{
		document.getElementById("searchframe").height="0px";
		
		if(dea_toolbox.collection==null)
		document.getElementById("searchframe").src="search.php?keyword="+document.getElementsByName("keyword")[0].value;
		else
		document.getElementById("searchframe").src="search.php?keyword="+document.getElementsByName("keyword")[0].value+"&collection="+dea_toolbox.collection.folder;
		
		document.getElementById("searchframe_container").scrollTop=0;
	}
	dea_toolbox.showDefaultSearchToolbar();
	return false;
}

function onShowSearch()
{
	var e=document.getElementById('search_toolbar');
	e.innerHTML='<form action="#" name="form1" onsubmit="return onSearch();"><input type="text" style="width:280px;font-size:25px" name="keyword"><input type="image" src="'+toolbox_root+'search_icon.png" style="vertical-align: top" width="40px" title="Search by keyword"></form>';
	var e2=document.getElementsByName('keyword');
	e2[0].focus();
	return false;
}

function onShowCollections()
{
	document.getElementById("searchframe").height="0px";
	document.getElementById("searchframe").src="https://digitalepigraphy.github.io/legacy/toolbox/collections.html";
	document.getElementById("searchframe_container").scrollTop=0;
	return false;
}

function onShowMyEdits()
{
	document.getElementById("searchframe").height="0px";
	document.getElementById("searchframe").src="myedits.php";
	document.getElementById("searchframe_container").scrollTop=0;
	return false;
}

function onShowSettings()
{
	document.getElementById("searchframe").height="0px";
	document.getElementById("searchframe").src="settings.html";
	document.getElementById("searchframe_container").scrollTop=0;
	return false;
}

window.addEventListener('message', receiveMessage, false);
