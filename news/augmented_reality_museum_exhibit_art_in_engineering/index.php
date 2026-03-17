<?php
readfile("../header1.html");
echo '<title>Augmented Reality Museum Exhibit - Exhibition: Art in Engineering</title>';
readfile("../header2.html");
readfile("article.html");

echo '</div></div></div>';
echo '<div class="last_column" style="width:305px;" >';
require('../function_shownews.php');
show_news('../',650,2);
echo '</div>';
readfile("../footer.html");
?>