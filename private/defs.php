<?php

session_start();

define('JQUERY_VERSION', 'jquery-1.5.1.min');
define('JQUERY_UI_VERSION', 'jquery-ui-1.8.10.custom.min');
define('JQUERY_UI_CSS', 'jquery-ui-1.8.10.custom');

function clientfile_getName( $type, $base )
{
    switch( $type )
    {
        case 'J':
            return "js/$base.js";
        case 'C':
            return "css/$base.css";
        case 'P':
            return "img/$base.jpg";
        case 'E':
            return "img/$base.jpeg";
        case 'N':
            return "img/$base.png";
        case 'S':
            return "img/$base.svg";
        case 'G':
            return "img/$base.gif";
    }
}

function clientfile_getApplicationType( $type )
{
    switch( $type )
    {
        case 'J':
            return 'text/javascript';
        case 'C':
            return 'text/css';
        case 'P':
        case 'E':
            return 'image/jpeg';
        case 'N':
            return 'image/png';
        case 'S':
            return 'image/svg+xml';
        case 'G':
            return 'image/gif';
    }
}

function clientfile_buildRequest( $type, $base )
{
    return "get.php?t=$type&f=$base&m=" .
           filemtime( clientfile_getName( $type, $base ) );
}

?>