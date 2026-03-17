<?php
readfile("../header1.html");
echo '<title>Thessaly inscriptions to be digitized in 3D with support from the French government</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',980,8);
echo '</div>';
readfile("../footer.html");
?>