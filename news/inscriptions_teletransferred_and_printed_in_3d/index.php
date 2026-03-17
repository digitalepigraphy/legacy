<?php
readfile("../header1.html");
echo '<title>Inscriptions tele-transferred between U.S. universities and printed in 3D</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',650,5);
echo '</div>';
readfile("../footer.html");
?>