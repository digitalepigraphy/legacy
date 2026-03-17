

<?php

function show_news($path,$scr_size,$my_id)
{

if(!isset($my_id))$my_id=-1;

$xml=simplexml_load_file($path.'index.xml');
$num_of_items=count($xml->news_item);
for($i=0;$i<$num_of_items;$i++)
	$shown[$i]=false;

echo '<div class="content_block"><div class="text_block dark_bkg"><font class="ttl">News</font><div style="float:right;"><a href="//www.digitalepigraphy.org/news/feed/"><img src="//www.digitalepigraphy.org/news/rss.png" height="14px"></a></div></div>';

if($scr_size==0)
echo '<div style="width:305px;overflow-x:hidden;" id="news_container" >';
else
echo '<div style="width:305px;-webkit-overflow-scrolling:touch;overflow:scroll;overflow-x:hidden;height:'.$scr_size.'px;" id="news_container" >';


for($pass=0;$pass<3;$pass++)
 for($i=0; $i< $num_of_items; $i++)
 {
   if($my_id!=$xml->news_item[$i]->id && $shown[$i]==false && 
   ( ($pass==0 && $i<2) ||
     ($pass==1 && $xml->news_item[$i]->id < $my_id) ||
     ($pass==2) ))
   {
      $shown[$i]=true;
 	echo '<div class="item_block" style="max-height:110px;" onmouseover="this.style.cursor='."'".'pointer'."'".';" onclick="parent.location='."'".'//www.digitalepigraphy.org/news/'.$xml->news_item[$i]->folder.'/'."'".';"><table style="border-spacing:0px;"><tr><td width="100%" style="padding:0px;" valign="top"><div class="news_text_container"><div class="project_text_block black_bkg"><font class="nrml" style="color:#FFFFFF">'.$xml->news_item[$i]->title.'</font></div><div class="project_text_block">';
 
 if(strlen($xml->news_item[$i]->icon)>0)	
 	echo '<img src="//www.digitalepigraphy.org/news/'.$xml->news_item[$i]->folder.'/'.$xml->news_item[$i]->icon.'" align="right">';
 	
 	echo '<font class="nrml">'.$xml->news_item[$i]->outline.'</font></div></div></td></tr></table></div>';
 }
 }
 
 
 echo '</div></div>';
 
 }
?>


