<?php

$num = array(10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
$find=71;
$flag=false;

for($i=0; $i<count($num); $i++) 
{
    if ($num[$i] == $find)
    {
        $flag=true;
        break;
    }
}

if ($flag)
{
    echo "Element $find is found.";
}
else
{
    echo "Element $find is not found.";
}

?>
