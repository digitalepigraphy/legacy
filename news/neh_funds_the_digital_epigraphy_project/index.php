<?php
readfile("../header1.html");
echo '<title>The National Endowment for the Humanities funds the Digital Epigraphy project</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',650,1);
echo '</div>';
readfile("../footer.html");
?>