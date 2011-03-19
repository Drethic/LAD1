<?php

require_once( 'private/defs.php' );

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title></title><?php

function writeJS($filebase)
{
    echo "<script type='text/javascript' src='" .
         clientfile_buildRequest( 'J', $filebase ) .
         "'></script>\n";
}

writeJS(JQUERY_JS);
writeJS(JQUERY_UI_JS);
writeJS('main');

echo "<link rel='stylesheet' type='text/css' href='" .
     clientfile_buildRequest( 'C', JQUERY_UI_CSS ) .
     "'>";
echo "<script type='text/javascript'>\n";
echo "$(document).ready(function(){";
echo "doLogin();});\n";
echo "</script>";

?></head><body></body></html>
