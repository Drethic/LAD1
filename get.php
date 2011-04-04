<?php

/**
 * Basic concept: Retrieves a client-side file (JS, CSS, IMG)
 *
 * Parameters:
 *   t: Type – J = JS, C = CSS, P = JPG, E = JPEG, N = PNG, S = SVG, G = GIF
 *   f: File name
 *   m: mtime of the file
 *
 * Session vars:
 *   isAdmin: Used to check if the file is exclusive to admins
 *
 * 1. Validate the input variables
 * 2. Validate the type
 * 3. Validate the file can be accessed if not an admin
 * 4. Validate the file exists
 * 5. Validate the mtime of the file
 * 6. Return the file back with a 60-day expiration
 * 6a. Handle all JS/CSS files with images/get.php replacement
 * 6b. Handle JS files with minifying
 * 6c. Cache JS/CSS
 */

require_once( 'private/defs.php' );
require_once( 'private/jsmin.php' );

// Setup admin only files
$adminOnlyFiles = array();

/*********************************** STEP 1 ***********************************/
// Make sure we have each request var
if( !isset( $_REQUEST[ 't' ] ) || !isset( $_REQUEST[ 'f' ] ) ||
   !isset( $_REQUEST[ 'm' ] ) )
{
   die( 'GO AWAY1' );
}

// Make sure there are no special characters so that people don't access files
// they shouldn't
preg_match( '/^[[:alnum:]\.\-\_]*$/i', $_REQUEST[ 'f' ] ) == 1 or
    die( 'GO AWAY2' );

/*********************************** STEP 2 ***********************************/
// Make sure the type of file requested is valid
in_array( $_REQUEST[ 't' ], array( 'J', 'C', 'P', 'E', 'N', 'S', 'G' ) ) or
    die( 'GO AWAY3' );

$applicationType = clientfile_getApplicationType( $_REQUEST[ 't' ] );
$actualFileName = clientfile_getName( $_REQUEST[ 't' ], $_REQUEST[ 'f' ] );

/*********************************** STEP 3 ***********************************/
if( ( !isset( $_SESSION[ 'isAdmin' ] ) || !$_SESSION[ 'isAdmin' ] ) &&
    in_array( $actualFileName, $adminOnlyFiles ) )
{
    die( 'GO AWAY4' );
}

/*********************************** STEP 4 ***********************************/
// File does not exist
if( !is_readable( $actualFileName ) )
{
   die( 'GO AWAY5' );
}

/*********************************** STEP 5 ***********************************/
if( filemtime( $actualFileName ) != $_REQUEST[ 'm' ] )
{
   die( 'GO AWAY6' );
}

/*********************************** STEP 6 ***********************************/
// Output some headers
header( 'Pragma: public' );
header( 'Cache-Control: max-age=31536000' );
header( "Content-Type: $applicationType" );
header( "Last-Modified: " . date( DateTime::COOKIE, $_REQUEST[ 'm' ] ) );
header( "Expires: " . date( DateTime::COOKIE, time() + (365 * 24 * 60 * 60) ) );

$outbuffer = '';
// JS/CSS has special processing
/********************************** STEP 6a ***********************************/
if( $_REQUEST[ 't' ] == 'C' || $_REQUEST[ 't' ] == 'J' )
{
    $cacheFileName = clientfile_getCacheName( $_REQUEST[ 't' ],
                                              $_REQUEST[ 'f' ] );
    if( file_exists( $cacheFileName ) &&
        filemtime( $cacheFileName ) > filemtime( $actualFileName ) )
    {
        $outBuffer = file_get_contents( $cacheFileName );
    }
    else
    {
        if( !file_exists( 'js/cache' ) )
        {
            mkdir( 'js/cache' );
        }
        // Rebuild cache
        // Read each line one at a time
        $lineArray = file( $actualFileName );
        $outBuffer = '';
        foreach( $lineArray as $line )
        {
            // URL's are not correct so...let's fix em
            // We need to extract the image name out of the url()
            // and then replace it with a string that we build
            $urlIndex = strpos( $line, 'url(' );
            if( $urlIndex == false )
            {
                // No URL, just echo out
                $outBuffer .= $line;
            }
            else
            {
                // Alright, there is a URL, so figure out exactly where it is
                $fileIndex = $urlIndex + 11;
                $dotIndex = strpos( $line, '.png' );

                $fileName = substr( $line, $fileIndex, $dotIndex - $fileIndex );
                $replacement = clientfile_buildRequest( 'N', $fileName );

                // Now just replace it and echo out
                $outBuffer .= substr_replace( $line, $replacement, $urlIndex + 4,
                                              $dotIndex - $urlIndex ) . "\n";
            }
        }
/********************************** STEP 6b ***********************************/
        if( $_REQUEST[ 't' ] == 'J' &&
            !in_array( $_REQUEST[ 'f' ], $JQUERY_JS ) )
        {
            $outBuffer = JSMin::minify( $outBuffer );
        }
    }
/********************************** STEP 6c ***********************************/
    file_put_contents( $cacheFileName, $outBuffer );
}
else
{
    $outBuffer = file_get_contents( $actualFileName );
}

// OMG actually write it out...
header( "Content-Length: " . strlen( $outBuffer ) );
echo $outBuffer;

?>