<?php

/*
 * @TODO: Finish run program
 * @TODO: Custom program names
 * @TODO: Create NPC servers
 * @TODO: Add virus table, type, GUI
 * @TODO: Run virus
 */

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

foreach( $GLOBALS['JQUERY_FILES'] as $jqueryjs )
{
    writeJS( $jqueryjs );
}
writeJS('plugins');
writeJS('main');
//writeJS('ui');

?></head><body><script type='text/javascript'>$(document).ready(function(){
    //doLogin();
    indexSetup();
});</script></body></html>