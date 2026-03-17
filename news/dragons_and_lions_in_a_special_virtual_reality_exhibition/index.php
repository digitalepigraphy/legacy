<?php
readfile("../header1.html");
echo '<title>"Touch the Exhibits": An on-line Virtual Reality exhibition of Dragons and Lions</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',980,11);
echo '</div>';
readfile("../footer.html");
?>