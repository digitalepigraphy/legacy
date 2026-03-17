<?php
readfile("../header1.html");
echo '<title>Inscriptions revealed using SFS method</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',980,10);
echo '</div>';
readfile("../footer.html");
?>