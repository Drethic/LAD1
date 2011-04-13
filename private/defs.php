<?php

session_start();
srand();

define('JQUERY_VERSION', '1.5.1');
define('JQUERY_UI_VERSION', '1.8.10');
define('JQUERY_LAYOUT_VERSION', '1.3.0');
define('JTASKBAR_VERSION', '0.2');

define('JQUERY_JS', 'jquery-' . JQUERY_VERSION . '.min');
define('JQUERY_UI_CSS', 'jquery-ui-' . JQUERY_UI_VERSION . '.custom');
define('JQUERY_UI_JS', 'jquery-ui-' . JQUERY_UI_VERSION . '.custom.min');
define('JQUERY_LAYOUT_JS', 'jquery-layout-' . JQUERY_LAYOUT_VERSION . '.min');
define('JQUERY_LAYOUT_CSS', 'jquery-layout-' . JQUERY_LAYOUT_VERSION);
define('JQUERY_JTASKBAR', 'jquery-jtaskbar-' . JTASKBAR_VERSION);

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

// Some research related stuff
define('DEFAULT_RESEARCH_CPU', 100);
define('DEFAULT_RESEARCH_RAM', 10);
define('DEFAULT_RESEARCH_TIME', 300);

// Basic operations that processes can perform
define('PROCESS_OP_TRANSFER', 1);
define('PROCESS_OP_RESEARCH', 2);
define('PROCESS_OP_ENCRYPT', 3);
define('PROCESS_OP_DECRYPT', 4);
define('PROCESS_OP_DELETE', 5);
define('PROCESS_OP_COPY', 6);
define('PROCESS_OP_INSTALL', 7);
define('PROCESS_OP_UNINSTALL', 8);

// Basic program types
define('PROGRAM_TYPE_FIREWALL', 1);
define('PROGRAM_TYPE_FIREWALLBREAKER', 2);
define('PROGRAM_TYPE_PASSWORD', 3);
define('PROGRAM_TYPE_PASSWORDBREAKER', 4);
define('PROGRAM_TYPE_ENCRYPTER', 5);
define('PROGRAM_TYPE_DECRYPTER', 6);
define('PROGRAM_TYPE_MALWARE', 7);

// Some sizes for level 1 programs
define('FIREWALL_SIZE', 5);
define('FIREWALLBREAKER_SIZE', 10);
define('PASSWORD_SIZE', 2);
define('PASSWORDBREAKER_SIZE', 4);
define('ENCRYPTOR_SIZE', 40);
define('DECRYPTOR_SIZE', 40);
define('MALWARE_SIZE', 25);

// Forces an array to be 2D
function force2DArray( $val )
{
    if( !is_array( $val ) )
    {
        return array( array( $val ) );
    }
    if( isset( $val[ 0 ] ) && !is_array(  $val[ 0 ] ) )
    {
        return array( $val );
    }
    return $val;
}
// Gets all the operations that increase the capacity of a server
function getHDDConsumingOperations( )
{
    return array( PROCESS_OP_COPY, PROCESS_OP_RESEARCH, PROCESS_OP_TRANSFER );
}

// Gets the size of a program based on its type
function getProgramSize( $type )
{
    switch( $type )
    {
        case PROGRAM_TYPE_FIREWALL:
            return FIREWALL_SIZE;
        case PROGRAM_TYPE_FIREWALLBREAKER:
            return FIREWALLBREAKER_SIZE;
        case PROGRAM_TYPE_PASSWORD:
            return PASSWORD_SIZE;
        case PROGRAM_TYPE_PASSWORDBREAKER:
            return PASSWORDBREAKER_SIZE;
        case PROGRAM_TYPE_ENCRYPTER:
            return ENCRYPTOR_SIZE;
        case PROGRAM_TYPE_DECRYPTER:
            return DECRYPTOR_SIZE;
        case PROGRAM_TYPE_MALWARE:
            return MALWARE_SIZE;
    }
}

// Tells JS to handle a 2D array based on its existence
function echo2DArray( $validfunc, $invalidfunc, $arr )
{
    $arrayCount = count( $arr );
    if( $arrayCount == 0 )
    {
        echo "$invalidfunc();";
    }
    else
    {
        $arrayCountM1 = $arrayCount - 1;
        echo "$validfunc(new Array(";
        for( $i = 0; $i < $arrayCount; $i++ )
        {
            echo 'new Array(' . implode( ',', $arr[ $i ] ) . ')';
            if( $i < $arrayCountM1 )
            {
                echo ',';
            }
        }
        echo '));';
    }
}

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