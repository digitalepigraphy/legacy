<?php
readfile("../header1.html");
echo '<title>Important artifacts from The National Archives [UK] now digitized in 3D</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',980,6);
echo '</div>';
readfile("../footer.html");
?>