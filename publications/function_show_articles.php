

<?php

function show_articles($path,$scr_size)
{
$xml=simplexml_load_file($path.'index.xml');
$num_of_items=count($xml->article);


echo '<div class="content_block"><div class="text_block dark_bkg"><font class="ttl">Published articles</font></div>';

if($scr_size==0)
echo '<div style="width:650px;overflow-x:hidden;" id="news_container" >';
else
echo '<div style="width:650px;-webkit-overflow-scrolling:touch;overflow:scroll;overflow-x:hidden;height:'.$scr_size.'px;" id="news_container" >';


 for($i=$num_of_items-1; $i>=0; $i--)
 {
   echo '<div class="item_block"><table style="border-spacing:0px;"><tr><td width="100%" style="padding:0px;" valign="top"><div class="news_text_container">';
   
    if(strlen($xml->article[$i]->image)>0)	
 	echo '<img src="http://www.digitalworlds.ufl.edu/angelos/img/'.$xml->article[$i]->image.'" style="float: left; margin-top: 3px; margin-left: 3px; margin-right: 3px; width: 48px;height: 48px; border-radius:5px;">';
	
   echo '<div class="project_text_block"><font class="bld">'.$xml->article[$i]->title.'</font></div><div class="project_text_block">';
 

 	
 	echo '<font class="nrml">';
	echo     $xml->article[$i]->author;
          if(strlen($xml->article[$i]->urlvenue)>0) echo '<br><i><a href="'.$xml->article[$i]->urlvenue.'"><font color="#0000FF">'.$xml->article[$i]->journal.'</font></a></i>';
          else echo '<br><i>'.$xml->article[$i]->journal.'</i>';
	   echo '<br>'.$xml->article[$i]->month.' '.$xml->article[$i]->year;
           if(strlen($xml->article[$i]->volume)>0) echo ', Vol. '.$xml->article[$i]->volume;
	   if(strlen($xml->article[$i]->number)>0) echo '('.$xml->article[$i]->number.')';
	   if(strlen($xml->article[$i]->pages)>0)echo ', Page(s): '.$xml->article[$i]->pages;
	   
	   echo '
<br><a href="http://www.digitalworlds.ufl.edu/angelos/publications.php?full=1&abstract='.$xml->article[$i]->id.'"><font color="#0000FF">Abstract</font></a> 
| <a href="http://www.digitalworlds.ufl.edu/angelos/publications.php?full=1&bibtex='.$xml->article[$i]->id.'"><font color="#0000FF">BibTex</font></a> ';

  $urlpdf="".$xml->article[$i]->urlpdf;
  if((strlen($xml->article[$i]->urlpdf)>0)&&($urlpdf{0}=='h')&&($urlpdf{1}=='t')&&($urlpdf{2}=='t')&&($urlpdf{3}=='p')) 
  {
      
      echo '|  Full Text: <img src="http://www.digitalworlds.ufl.edu/angelos/img/pdf.gif" ><A href="'.$xml->article[$i]->urlpdf.'" ><font color="#0000FF">PDF</font></A>&nbsp;';
      
  }
  else if(strlen($xml->article[$i]->urlpdf)>0)
  {
    echo '|  Full Text: <img src="http://www.digitalworlds.ufl.edu/angelos/img/pdf.gif" ><A href="http://www.digitalworlds.ufl.edu/angelos/file.php?f='.$xml->article[$i]->urlpdf.'"><font color="#0000FF">PDF</font></A>&nbsp;';
  }

if(strlen($xml->article[$i]->demo)>0) echo '|  <A href="'.$xml->article[$i]->demo.'" ><font color="#0000FF">DEMO</font></A>&nbsp;';

	   
	echo '</font></div></div></td></tr></table></div>';
	
	
 
 }
 
 
 echo '</div></div>';
 
 }
?>


