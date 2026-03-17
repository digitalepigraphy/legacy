<?php

function press_item2($uimg, $uname, $ulink, $uid,$date,$media, $link, $text,$img){
	echo "[socialmedia_post uimg='".$uimg."' uname='".$uname."' ulink='".$ulink."' uid='".$uid."' date='".$date."' media='".$media."' link='".$link."' text='".$text."' img='".$img."']<br><br>";
}

function press_item($uimg, $uname, $ulink, $uid,$date,$media, $link, $text,$img)
{
      echo '<li class="js-stream-item stream-item stream-item expanding-stream-item cards-forward" data-item-type="tweet"><ol role="presentation" class="expanded-conversation expansion-container js-expansion-container js-navigable-stream"><li role="presentation" class="original-tweet-container"><div class="tweet original-tweet js-stream-tweet js-actionable-tweet js-profile-popup-actionable js-original-tweet has-cards has-native-media with-media-forward media-forward"><div class="context"></div><div class="content"><div class="stream-item-header">
	  
	 <a href="'.$link.'"><img style="float: right; margin-top: 3px; margin-left: 58px; width: 32px;height: 32px;" src="'.$media.'.png"></a>
    	
          <a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" href="'.$ulink.'">
    <img class="avatar js-action-profile-avatar" src="'.$uimg.'">
    
	<strong class="fullname js-action-profile-name show-popup-with-id" data-aria-label-part="">'.$uname.'</strong>
    <span class="username js-action-profile-name" data-aria-label-part=""><s>@</s><b>'.$uid.'</b></span>
  </a>
        <small class="time">
  <span class="_timestamp js-short-timestamp ">'.$date.'</span>
</small>
      </div>      
        <p class="js-tweet-text tweet-text" lang="en" data-aria-label-part="0">'.$text.'</p>

         <div class="cards-media-container js-media-container"><div data-card-type="photo" class="cards-base cards-multimedia" data-element-context="platform_photo_card"><a class="media media-thumbnail twitter-timeline-link media-forward is-preview " href="'.$link.'"><div class=" is-preview">';  
    if(strlen($img)>0) echo '<img src="'.$img.'" width="100%" alt="Embedded image permalink" style="margin-top: -30px;"></div>';
 echo '</a></div></div></div></div></li></ol></li>';

}
?>