<?php

require_once( 'jsmin.php' );

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

$GLOBALS['JQUERY_FILES'] = array( JQUERY_JS, JQUERY_UI_JS, JQUERY_LAYOUT_JS,
                                  JQUERY_JTASKBAR );

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

// Some deletion related stuff
define('DEFAULT_DELETION_CPU', 25);
define('DEFAULT_DELETION_RAM', 5);

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

// Gets all variables that are client side
function getClientSideDefines()
{
    return array(
        'RESEARCH_CPU' => DEFAULT_RESEARCH_CPU,
        'RESEARCH_RAM' => DEFAULT_RESEARCH_RAM,
        'RESEARCH_TIME' => DEFAULT_RESEARCH_TIME,
        'DELETE_CPU' => DEFAULT_DELETION_CPU,
        'DELETE_RAM' => DEFAULT_DELETION_RAM,
        'OP_TRANSFER' => PROCESS_OP_TRANSFER,
        'OP_RESEARCH' => PROCESS_OP_RESEARCH,
        'OP_ENCRYPT' => PROCESS_OP_ENCRYPT,
        'OP_DECRYPT' => PROCESS_OP_DECRYPT,
        'OP_DELETE' => PROCESS_OP_DELETE,
        'OP_COPY' => PROCESS_OP_COPY,
        'OP_INSTALL' => PROCESS_OP_INSTALL,
        'OP_UNINSTALL' => PROCESS_OP_UNINSTALL
    );
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
    $folder = clientfile_getFolder( $type );
    $extension = clientfile_getExtension( $type );
    if( $type == 'J' || $type == 'C' )
    {
        $folder = "$folder/cache";
    }
    return "$folder/$base.$extension";
}

function clientfile_getType( $extension )
{
    switch( $extension )
    {
        case 'js':
            return 'J';
        case 'css':
            return 'C';
        case 'jpg':
            return 'P';
        case 'jpeg':
            return 'E';
        case 'png':
            return 'N';
        case 'svg':
            return 'S';
        case 'gif':
            return 'G';
    }
}

function clientfile_getExtension( $type )
{
    switch( $type )
    {
        case 'J':
            return 'js';
        case 'C':
            return 'css';
        case 'P':
            return 'jpg';
        case 'E':
            return 'jpeg';
        case 'N':
            return 'png';
        case 'S':
            return 'svg';
        case 'G':
            return 'gif';
    }
}

function clientfile_getFolder( $type )
{
    if( $type == 'J' )
    {
        return 'js';
    }
    if( $type == 'C' )
    {
        return 'css';
    }
    return 'img';
}

function clientfile_getName( $type, $base )
{
    $extension = clientfile_getExtension( $type );
    switch( $type )
    {
        case 'J':
            if( is_dir( "js/$base" ) )
            {
                return "js/$base";
            }
            return "js/$base.$extension";
        case 'C':
            return "css/$base.$extension";
        case 'P':
        case 'E':
        case 'N':
        case 'S':
        case 'G':
            return "img/$base.$extension";
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
    $folder = clientfile_getFolder( $type );
    $extension = clientfile_getExtension( $type );
    $cacheName = clientfile_getCacheName( $type, $base );
    $actualFile = clientfile_getName( $type, $base );
    if( $type == 'C' || $type == 'J' )
    {
        if( !is_dir( $actualFile ) )
        {
            $mtime = filemtime( $actualFile );
        }
        else
        {
            $maxTime = 0;
            foreach( scandir( $actualFile ) as $subFile )
            {
                if( $subFile == '.' || $subFile == '..' )
                {
                    continue;
                }
                $subTime = filemtime( "$actualFile/$subFile" );
                if( $subTime > $maxTime )
                {
                    $maxTime = $subTime;
                }
            }
            touch( $actualFile, $maxTime );
            $mtime = $maxTime;
        }
        if( !is_file( $cacheName ) || $mtime > filemtime( $cacheName ) )
        {
            clientfile_cache( $type, $base );
        }
    }
    else
    {
        $mtime = filemtime( $actualFile );
    }
    return "get.php?t=$type&f=$base&m=$mtime";
}

function clientfile_cache( $type, $base )
{
    $cacheFileName = clientfile_getCacheName( $type, $base );
    $actualFileName = clientfile_getName( $type, $base );
    if( !file_exists( 'js/cache' ) )
    {
        mkdir( 'js/cache' );
    }
    if( !file_exists( 'css/cache' ) )
    {
        mkdir( 'css/cache' );
    }
    // Rebuild cache
    // Read each line one at a time
    if( is_file( $actualFileName ) )
    {
        $lineArray = file( $actualFileName );
    }
    else
    {
        // File is actually a folder that needs to be compiled
        $folder = "js/$base";
        $longString = '';
        foreach( scandir( $folder ) as $subFile )
        {
            $subFilePath = "$folder/$subFile";
            // Ignore . and ..
            if( $subFile == '.' || $subFile == '..' )
            {
                continue;
            }

            // Add each line to the long string
            $longString .= file_get_contents( $subFilePath );

        }

        $lineArray = preg_split( "[\\r\\n]", $longString );
    }
    $outBuffer = '';
    foreach( $lineArray as $line )
    {
        // URL's are not correct so...let's fix em
        // We need to extract the image name out of the url()
        // and then replace it with a string that we build
        $urlIndex = strpos( $line, 'url(' );
        if( $urlIndex === false )
        {
            // No URL, just echo out
            $outBuffer .= $line;
        }
        else
        {
            // Alright, there is a URL, so figure out exactly where it is
            $fileIndex = $urlIndex + 11;
            $otherparenIndex = strpos( $line, ')', $urlIndex );
            $fullFileName = substr( $line, $fileIndex,
                                    $otherparenIndex - $fileIndex );
            $dotIndex = strrpos( $fullFileName, '.' );

            $extension = substr( $fullFileName, $dotIndex + 1 );
            $fileName = substr( $fullFileName, 0, $dotIndex );
            $extensionType = clientfile_getType( $extension );
            $replacement = clientfile_buildRequest( $extensionType, $fileName );

            // Now just replace it and echo out
            $outBuffer .= substr_replace( $line, $replacement, $urlIndex + 4,
                                          strlen( $fullFileName ) + 7 ) . "\n";
        }
    }

    // Add defaults to main
    if( $type == 'J' && $base == 'main' )
    {
        $outBuffer .= "function getDefault(val){";

        $csd = getClientSideDefines();
        foreach( $csd as $index => $value )
        {
            if( is_string( $value ) )
            {
                $value = "\"$value\"";
            }
            $outBuffer .= "if(val==\"$index\"){return $value;}";
        }

        $outBuffer .= "return 0;}";
    }
    if( $type == 'J' && !in_array( $base, $GLOBALS['JQUERY_FILES'] ) )
    {
        $outBuffer = JSMin::minify( $outBuffer );
        $outBuffer = str_replace( "\n", '', $outBuffer );
    }
    file_put_contents( $cacheFileName, $outBuffer );
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