<?php
$a = 10;
$b = 25;
$c = 15;

if ($a >= $b && $a >= $c) {
    echo "Largest number is=" . $a;
} elseif ($b >= $a && $b >= $c) {
    echo "Largest number is=" . $b;
} else {
    echo "Largest number is=" . $c;
}
?>
