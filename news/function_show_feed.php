<?php

function show_feed($path)
{
$xml=simplexml_load_file($path.'index.xml');
$num_of_items=count($xml->news_item);
for($i=0;$i<$num_of_items;$i++)
	$shown[$i]=false;

header('Content-Type: text/xml');
	
echo '
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/" version="2.0">
<channel>
<title>DigitalEpigraphy.org</title>
<atom:link href="http://www.digitalepigraphy.org/news/feed/" rel="self" type="application/rss+xml"/>
<link>http://www.digitalepigraphy.org</link>
<description>Digital Epigraphy and Archaeology Project</description>
<lastBuildDate>'.date(DATE_RSS).'</lastBuildDate>
<language>en-US</language>
<sy:updatePeriod>hourly</sy:updatePeriod>
<sy:updateFrequency>1</sy:updateFrequency>';

if(!isset($my_id))$my_id=-1;

for($pass=0;$pass<3;$pass++)
 for($i=0; $i< $num_of_items; $i++)
 {
   if($my_id!=$xml->news_item[$i]->id && $shown[$i]==false && 
   ( ($pass==0 && $i<2) ||
     ($pass==1 && $xml->news_item[$i]->id < $my_id) ||
     ($pass==2) ))
   {
      $shown[$i]=true;
	  
	 echo '<item>
<title>'.$xml->news_item[$i]->title.'</title>
<link>http://www.digitalepigraphy.org/news/'.$xml->news_item[$i]->folder.'/</link>
<pubDate>'.$xml->news_item[$i]->pubDate.'</pubDate>
<dc:creator>
<![CDATA[ www.digitalepigraphy.org ]]>
</dc:creator>
<category>
<![CDATA[ Featured ]]>
</category>
<guid isPermaLink="false">http://www.digitalepigraphy.org/news/'.$xml->news_item[$i]->folder.'/</guid>';


echo '<description>
	  <![CDATA[
'.$xml->news_item[$i]->outline.'
]]>
</description>
<content:encoded>
<![CDATA[
<p>';
 if(strlen($xml->news_item[$i]->icon)>0)	
 	echo '<img src="http://www.digitalepigraphy.org/news/'.$xml->news_item[$i]->folder.'/'.$xml->news_item[$i]->icon.'" align="right">';

	echo $xml->news_item[$i]->outline.'</p>
]]>
</content:encoded>
</item>';


 	
	
 }
 }
 
 
 echo '</channel></rss>';
 
 }
?>


