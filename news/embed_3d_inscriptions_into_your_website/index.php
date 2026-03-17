<?php
readfile("../header1.html");
echo '<title>Embed 3D archaeological artifacts into your website or database</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',650,3);
echo '</div>';
readfile("../footer.html");
?>