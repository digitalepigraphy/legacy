<?php
	require("../function_post_headers.php");
	post_headers();  
?>

<?php
	require("../dea_mysql_config.php");
	require("../function_create_cookieid.php");
	
	function getRealIpAddr()
	{
    		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
	      		$ip=$_SERVER['HTTP_CLIENT_IP'];
    		}elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {  //to check ip is pass from proxy
      			$ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
    		}else {
      			$ip=$_SERVER['REMOTE_ADDR'];
    		}
    		return $ip;
	}
	
    $deaUserID='';
	if(isset($_COOKIE['deaUserID'])) $deaUserID=$_COOKIE['deaUserID'];
	else
	{
		// Connect to mySQL
		/*$link = mysqli_connect(mysql_myhost(), mysql_myusername(), mysql_mypassword(), mysql_mydb()) or die('Could not connect: ' . mysqli_error($link));
		$ip=getRealIpAddr();
		$deaUserID=create_cookieid($link,$ip);
		$Month = 2592000*120 + time();
		setcookie('deaUserID', $deaUserID, $Month);
		// Closing connection
		mysqli_close($link);*/
	}
?>

<html><head><meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<link rel="stylesheet" type="text/css" href="results.css" />
<script type="text/javascript" src="../js/dea-db-2.5.js"></script>
<script type="text/javascript">
var records=[];
var keywords=[];
var collection="";
var header_text="";
var header_text_dummy="";
<?php

$kwrd="";

if(isset($_POST['keyword'])) {$kwrd=$_POST['keyword'];$keywords=explode(' ',$kwrd);}
else if(isset($_GET['keyword'])) {$kwrd=$_GET['keyword'];$keywords=explode(' ',$kwrd);}
else $keywords[0]="";

if(isset($_POST['collection'])) $collection=$_POST['collection'];
else if(isset($_GET['collection'])) $collection=$_GET['collection'];
else $collection="";
if($collection=="null" || $collection==null) $collection="";

echo 'collection="'.$collection.'";'."\n";

if(count($keywords)>0 && strlen($keywords[0])>0)
{
	$DATE=date('Y/m/d H:i:s');
	$ip=$_SERVER[REMOTE_ADDR];
	$hostname=gethostbyaddr($ip);
	
	$handler=fopen("search_stats.txt","a");
	fwrite($handler,''.$DATE."\t".$ip."\t".$hostname."\t".$deaUserID."\t".$kwrd."\t".$_SERVER['HTTP_USER_AGENT']."\n");
	fclose($handler);

// Connect to mySQL
$link = mysqli_connect(mysql_myhost(), mysql_myusername(), mysql_mypassword(), mysql_mydb()) or die('Could not connect: ' . mysqli_error($link));

if(strlen($collection)==0)//DEA
	$query="select count(dea_keyword_index.record_id), dea_keyword_index.record_id from dea_keyword_index,dea_keywords where (";
else $query="select count(dea_keyword_index.record_id), dea_keyword_index.record_id from dea_keyword_index,dea_keywords,dea_collections,dea_collection_index where dea_collection_index.record_id=dea_keyword_index.record_id and dea_collections.id=dea_collection_index.collection_id and dea_collections.folder='".$collection."' and (";

$boolean_operator="or";
if(isset($_COOKIE['deaSettingSearchKeywords'])){if($_COOKIE['deaSettingSearchKeywords']=='and')$boolean_operator="and";} 

$num_of_keywords=count($keywords);
for($i=0;$i<$num_of_keywords;$i++)
{
	$query.="dea_keywords.keyword like '%".$keywords[$i]."%' ";
	if($i<$num_of_keywords-1) $query.="or ";
	if(strlen($keywords[$i])>0)echo 'keywords['.$i.']="'.$keywords[$i].'";'."\n";
}
$query.=") and dea_keyword_index.keyword_id=dea_keywords.id group by dea_keyword_index.record_id order by count(dea_keyword_index.record_id) desc";

$result=$link->query($query);
while($row=$result->fetch_array(MYSQLI_NUM))
{ 
	if($boolean_operator=="or" || intval($row[0])>=$num_of_keywords)
	{
	$prefix=substr($row[1], 0,3);
	if($prefix=='obj')
		echo 'records[records.length]=new DEArecord("objects","'.substr($row[1], 3).'");'."\n";
	if($prefix=='hmp')
		echo 'records[records.length]=new DEArecord("heightmaps","'.substr($row[1], 3).'");'."\n";
	}
}
mysqli_free_result($result);

// Closing connection
mysqli_close($link);
}
else	//show featured
{}
?>

function loadList(pathname)
{
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET",dea_host+pathname,false);
	xmlhttp.send();
	var data=xmlhttp.responseXML;
	var num_of_items=data.getElementsByTagName("record_link").length;
	for(var i=0;i<num_of_items;i++)
	{
		if(data.getElementsByTagName("record_link")[i].getElementsByTagName("object_id")[0])
		{  
			if(data.getElementsByTagName("record_link")[i].getElementsByTagName("object_id")[0].childNodes[0])	
				records[records.length]=new DEArecord("objects",data.getElementsByTagName("record_link")[i].getElementsByTagName("object_id")[0].childNodes[0].nodeValue);
		}
		else if(data.getElementsByTagName("record_link")[i].getElementsByTagName("neobject_id")[0])
		{  
			if(data.getElementsByTagName("record_link")[i].getElementsByTagName("neobject_id")[0].childNodes[0])	
				records[records.length]=new DEArecord("neobjects",data.getElementsByTagName("record_link")[i].getElementsByTagName("neobject_id")[0].childNodes[0].nodeValue);
		}
		else if(data.getElementsByTagName("record_link")[i].getElementsByTagName("heightmap_id")[0])
		{  
			if(data.getElementsByTagName("record_link")[i].getElementsByTagName("heightmap_id")[0].childNodes[0])	
				records[records.length]=new DEArecord("heightmaps",data.getElementsByTagName("record_link")[i].getElementsByTagName("heightmap_id")[0].childNodes[0].nodeValue);
		}
		else if(data.getElementsByTagName("record_link")[i].getElementsByTagName("image_id")[0])
		{  
			if(data.getElementsByTagName("record_link")[i].getElementsByTagName("image_id")[0].childNodes[0])	
				records[records.length]=new DEArecord("images",data.getElementsByTagName("record_link")[i].getElementsByTagName("image_id")[0].childNodes[0].nodeValue);
		}
	}
}

function startDownloading(i)
{
	//log('startDownloading'+i);
	records[i].setAux(i);
	records[i].onRecordLoaded=function()
	{
		this.loadNEOlinks(true);
		var tc=document.getElementById("thmb_"+this.aux);
		tc.src="//www.digitalepigraphy.org/legacy/db/"+this.path+"/"+this.id+".thmb.png";
		var tc=document.getElementById("title_"+this.aux);
		tc.innerHTML=this.getMasterTitle();
		var tc=document.getElementById("plain_"+this.aux);
		tc.innerHTML=this.sprintKeywords(keywords,false)+this.sprintKeywords(keywords,true);
		var next_i=this.aux+2;
		if(records.length>next_i)
		{
			startDownloading(next_i);
		}
	}
	//log('before load');
	records[i].load(true,true);
}

function onBodyLoad()
{
    window.parent.postMessage('resh:'+document.body.scrollHeight, '*');
	loadDEAfields();
	//there are 2 parallel threads
	for(var i=0;i<records.length && i<2;i++)
	{
		startDownloading(i);
	}
}

function onFilter()
{
	var fkeys=document.getElementsByName('filter_keyword')[0].value.split(/[ ,]+/);
	var show_all=true;
	for(var j=0;j<fkeys.length;j++)
	{
		fkeys[j]=fkeys[j].toLowerCase();
		if(fkeys[j].length>1) show_all=false;
	}
	var e;
	var found;
	var bool_op=getCookie('deaSettingRefineKeywords'); 
	bool_op= bool_op != null ? bool_op : 'and';
	if(bool_op!='or') bool_op='and';
	for(var i=0;i<records.length;i++)
	{
		e=document.getElementById("result_"+i);
		if(!show_all)
		{
			var r=records[i].sprintPlain().toLowerCase();
			if(bool_op=='and')
			{
				found=true;
				for(var j=0;j<fkeys.length && found;j++)
					if(fkeys[j].length>1 && r.indexOf(fkeys[j])==-1)
						found=false;
			}
			else
			{
				found=false;
				for(var j=0;j<fkeys.length && !found;j++)
					if(fkeys[j].length>1 && r.indexOf(fkeys[j])!=-1)
						found=true;
			}
		}
		else found=true;
				
		if(found) e.style.display='block';
		else e.style.display='none';
	}
	return false;
}

function onShowFilter()
{
	var he=document.getElementById('header_div');
	var hde=document.getElementById('header_div_dummy');
	
	var fke=document.getElementsByName('filter_keyword');
	
	if(fke.length==1)
	{
		he.innerHTML=header_text;
		hde.innerHTML=header_text_dummy;
		
		var e;
		for(var i=0;i<records.length;i++)
		{
			e=document.getElementById("result_"+i);
			e.style.display='block';
		}
	}
	else
	{
		he.innerHTML=header_text+'<input type="text" style="width:100%;font-size:14px" name="filter_keyword" onchange="onFilter();" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();">';
		hde.innerHTML=header_text_dummy+'<input type="text" style="width:100%;font-size:14px" disabled>';
		var e=document.getElementsByName('filter_keyword');
		e[0].focus();
	}
	return false;
}

</script></head>
<body onload="onBodyLoad();" topmargin="0" leftmargin="0" bottommargin="0" rightmargin="0">
<div id="result_container">
<script type="text/javascript">
<?php
if(count($keywords)>0 && strlen($keywords[0])>0)
{}
else	//show featured
{
	$path='collection/';
	if(strlen($collection)==0)//DEA
		$path.='featured.xml';
	else
		$path.=$collection.'/featured.xml';
	echo 'loadList("'.$path.'");';
}
?>
if(records.length==0)
{
	header_text+='<font class="nrml"><i>No records found.</i></font>';
	header_text_dummy=header_text;
}
else
{
	if(keywords.length>0 && keywords[0].length>0)
	{
		header_text+='<font class="nrml">Results for keyword';
		if(keywords.length>1) header_text+='s';
		header_text+=': <font class="bld">';
		for(var i=0;i<keywords.length;i++)
			header_text+=keywords[i]+" ";
		header_text+='</font></font>';
		header_text_dummy=header_text;
		
		header_text+='<div style="float:right;"><font class="nrml"><a href="#" onclick="return onShowFilter();"><font color="#000000">[Refine list]</font></a></font></div><div style="width:100%;height:1px;float:right;"></div>';
		header_text_dummy+='<div style="float:right;"><font class="nrml">[Refine list]</font></div><div style="width:100%;height:1px;float:right;"></div>';
	}
	else
	{
		header_text+='<font class="nrml">Featured records:</font>';
		header_text_dummy=header_text;
	}
}

document.write('<div class="result_keywords" id="header_div">'+header_text+'</div><div class="result_keywords_dummy" id="header_div_dummy">'+header_text_dummy+'</div>');

for(var i=0;i<records.length;i++)
{
	document.write("<div class=\"result_block\" id=\"result_"+i+"\"><table style=\"border-spacing:0px;\"><tr><td width=\"100px\" style=\"padding:0px;\"><img class=\"result_image\" id=\"thmb_"+i+"\" src=\"thmb.png\" onclick=\"window.parent.postMessage('both:"+records[i].path.slice(0,-1)+"="+records[i].id+"', '*');\" onMouseover=\"this.style.cursor='pointer';\"></td><td width=\"100%\" style=\"padding:0px;\" valign=\"top\"><div class=\"result_text_container\"><div class=\"result_text_block dark_bkg\"><font class=\"nrml\" id=\"title_"+i+"\" style=\"color:#FFFFFF\">"+records[i].getTitle()+"</font></div><div class=\"result_text_block\"><font class=\"nrml\" id=\"plain_"+i+"\"></font></div></div></td></tr></table></div>" );
}

if(keywords.length>0 && keywords[0].length>0 && collection.length>0)
{
	var k="";
	for(var i=0;i<keywords.length;i++)
	{
		if(i==0) k=keywords[i];
		else k+=" "+keywords[i];
	}
	document.write("<div class=\"result_block\"><table style=\"border-spacing:0px;\"><tr><td width=\"100px\" style=\"padding:0px;\"><img class=\"result_image\" src=\"dea_collection_thmb2.png\" onclick=\"window.parent.postMessage('srch:"+k+"', '*');\" onMouseover=\"this.style.cursor='pointer';\"></td><td width=\"100%\" style=\"padding:0px;\" valign=\"top\"><div class=\"result_text_container\"><div class=\"result_text_block dark_bkg\"><font class=\"nrml\" style=\"color:#FFFFFF\">Search the DEA database</font></div><div class=\"result_text_block\"><font class=\"nrml\">Find more results by searching the entire database of the Digital Epigraphy and Archaeology project.</font></div></div></td></tr></table></div>" );
}
</script>
</div>
</body></html>
