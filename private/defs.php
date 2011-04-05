<?php

session_start();
srand();

define('JQUERY_VERSION', '1.5.1');
define('JQUERY_UI_VERSION', '1.8.10');
define('JQUERY_LAYOUT_VERSION', '1.3.0');

define('JQUERY_JS', 'jquery-' . JQUERY_VERSION . '.min');
define('JQUERY_UI_CSS', 'jquery-ui-' . JQUERY_UI_VERSION . '.custom');
define('JQUERY_UI_JS', 'jquery-ui-' . JQUERY_UI_VERSION . '.custom.min');
define('JQUERY_LAYOUT_JS', 'jquery-layout-' . JQUERY_LAYOUT_VERSION . '.min');
define('JQUERY_LAYOUT_CSS', 'jquery-layout-' . JQUERY_LAYOUT_VERSION);

$JQUERY_JS = array( JQUERY_JS, JQUERY_UI_JS, JQUERY_LAYOUT_JS );

define('DB_NAME', 'lad');
define('DB_USERNAME', 'lad');

// Some default hardware for a computer
define('DEFAULT_CPU', 350); // Expressed in MHz
define('DEFAULT_RAM', 32);  // Expressed in MB
define('DEFAULT_HDD', 250); // Expressed in MB
define('DEFAULT_BW', 3);    // Expressed in KB

// How much every research point will grant in each category
define('STEP_CPU', 50);
define('STEP_RAM', 4);
define('STEP_HDD', 10);
define('STEP_BW', 1);

// Basic operations that processes can perform
define('OP_TRANSFER', 1);
define('OP_RESEARCH', 2);
define('OP_ENCRYPT', 3);
define('OP_DECRYPT', 4);
define('OP_DELETE', 5);
define('OP_COPY', 6);
define('OP_INSTALL', 7);
define('OP_UNINSTALL', 8);

// Only works with CSS or JS files
function clientfile_getCacheName( $type, $base )
{
    if( $type == 'J' )
    {
        return "js/cache/$base.js";
    }
    return "css/cache/$base.css";
}

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

/*************** END OF FUNCTIONS - BEGIN INIT ********************************/
// Connect to MySQL
$sqlConnection = mysql_pconnect( 'localhost', DB_NAME );

if( !$sqlConnection )
{
   die( 'Failed to connect to MySQL.' . mysql_error() );
}

// Select Database
$dbSelection = mysql_select_db( DB_USERNAME );

if( !$dbSelection )
{
   die( 'Failed to select DB in MySQL.' . mysql_error() );
}

?>