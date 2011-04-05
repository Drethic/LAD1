<?php

require_once( 'private/defs.php' );

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title></title><?php

function writeCSS( $filebase )
{
    echo "<link rel='stylesheet' type='text/css' href='" .
         clientfile_buildRequest( 'C', $filebase ) . "'>";
}

function writeJS( $filebase )
{
    echo "<script type='text/javascript' src='" .
         clientfile_buildRequest( 'J', $filebase ) .
         "'></script>";
}

writeCSS( JQUERY_UI_CSS );
writeCSS( JQUERY_LAYOUT_CSS );
writeCSS( 'main' );

writeJS(JQUERY_JS);
writeJS(JQUERY_UI_JS);
writeJS(JQUERY_LAYOUT_JS);
writeJS('plugins');
writeJS('main');
writeJS('ui');

?></head><body><script type='text/javascript'>$(document).ready(function(){
    doLogin();
});</script></body></html>