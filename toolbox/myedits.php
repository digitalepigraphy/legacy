<?php
	require("../function_post_headers.php");
	post_headers();  
?>
<html><head><meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<link rel="stylesheet" type="text/css" href="results.css" />
<script type="text/javascript" src="../dea-db-2.5.js"></script>
<script type="text/javascript">
var records=[];
var keywords=[];
var header_text="";
var header_text_dummy="";
<?php
require("../dea_mysql_config.php");
	
	if(isset($_COOKIE['deaUserID'])) 
	{
		$deaUserID=$_COOKIE['deaUserID'];
		$folders[0]='neobjects';
		$folders[1]='heightmaps';
		$folders[2]='objects';
		$recs[0]='';
		$num_of_recs=0;
		$num_of_folders=3;
		for($f=0;$f<$num_of_folders;$f++)
		{
			if ($handle = opendir('../sandbox/'.$deaUserID.'/'.$folders[$f])) 
			{
				while (false !== ($entry = readdir($handle))) 
				{  
					if ($entry!='.' && $entry!='..' && substr($entry,-4)=='.xml') 
					{
						if($f==0)
						{
							$xml_main=simplexml_load_file('../sandbox/'.$deaUserID.'/'.$folders[$f].'/'.$entry);
							$num_of_record_links=count($xml_main->record_link);
							for($r=0;$r<$num_of_record_links;$r++)
							{
								if(isset($xml_main->record_link[$r]->object_id))
								{
									echo 'records[records.length]=new DEArecord("objects","'.$xml_main->record_link[$r]->object_id.'");'."\n";
									$recs[$num_of_recs]=$xml_main->record_link[$r]->object_id;
									$num_of_recs+=1;
								}
								else if(isset($xml_main->record_link[$r]->heightmap_id))
								{
									echo 'records[records.length]=new DEArecord("heightmaps","'.$xml_main->record_link[$r]->heightmap_id.'");'."\n";
									$recs[$num_of_recs]=$xml_main->record_link[$r]->heightmap_id;
									$num_of_recs+=1;
								}
							}
						}
						else
						{
							$rid=substr($entry,0,strlen($entry)-4);
							$found=false;
							for($i=0;$i<$num_of_recs && $found==false;$i++)
								if($recs[$i]==$rid) $found=true;
							
							if($found==false)
							{
								if($f==1) 	echo 'records[records.length]=new DEArecord("heightmaps","'.$rid.'");'."\n";			
								else if($f==2) 	echo 'records[records.length]=new DEArecord("objects","'.$rid.'");'."\n";
							}
						}
					}
				}
				closedir($handle);
			}
		}
	}

?>

function startDownloading(i)
{
	records[i].onRecordLoaded=function()
	{
		this.loadNEOlinks(false);
		var tc=document.getElementById("thmb_"+this.aux);
		tc.src="http://research.dwi.ufl.edu/www.digitalepigraphy.org/db/"+this.path+"/"+this.id+".thmb.png";
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
	records[i].aux=i;
	records[i].load(false,false);
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
if(records.length==0)
{
	header_text+='<font class="nrml"><i>You have no recent contributions.</i></font>';
	header_text_dummy=header_text;
}
else
{
	header_text+='<font class="nrml">Your recent contributions:</font>';
	header_text_dummy=header_text;
	
	header_text+='<div style="float:right;"><font class="nrml"><a href="#" onclick="return onShowFilter();"><font color="#000000">[Refine list]</font></a></font></div><div style="width:100%;height:1px;float:right;"></div>';
	header_text_dummy+='<div style="float:right;"><font class="nrml">[Refine list]</font></div><div style="width:100%;height:1px;float:right;"></div>';
	
}

document.write('<div class="result_keywords" id="header_div">'+header_text+'</div><div class="result_keywords_dummy" id="header_div_dummy">'+header_text_dummy+'</div>');

for(var i=0;i<records.length;i++)
{
	document.write("<div class=\"result_block\" id=\"result_"+i+"\"><table style=\"border-spacing:0px;\"><tr><td width=\"100px\" style=\"padding:0px;\"><img class=\"result_image\" id=\"thmb_"+i+"\" src=\"thmb.png\" onclick=\"window.parent.postMessage('both:"+records[i].path.slice(0,-1)+"="+records[i].id+"', '*');\" onMouseover=\"this.style.cursor='pointer';\"></td><td width=\"100%\" style=\"padding:0px;\" valign=\"top\"><div class=\"result_text_container\"><div class=\"result_text_block\" style=\"background-color:rgba(0,0,0,0.5);\"><font class=\"nrml\" id=\"title_"+i+"\" style=\"color:#FFFFFF\">"+records[i].getTitle()+"</font></div><div class=\"result_text_block\"><font class=\"nrml\" id=\"plain_"+i+"\"></font></div></div></td></tr></table></div>" );
}

</script>
</div>
</body></html>