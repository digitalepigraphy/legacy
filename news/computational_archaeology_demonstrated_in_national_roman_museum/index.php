<?php
readfile("../header1.html");
echo '<title>Computational archaeology applied to Museo Nazionale Romano</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',970,9);
echo '</div>';
readfile("../footer.html");
?>