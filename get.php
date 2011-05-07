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

$type = $_REQUEST[ 't' ];
$file = $_REQUEST[ 'f' ];
$applicationType = clientfile_getApplicationType( $type );
$cacheFileName = clientfile_getCacheName( $type, $file );
$actualFileName = clientfile_getName( $type, $file );

/*********************************** STEP 3 ***********************************/
if( ( !isset( $_SESSION[ 'isAdmin' ] ) || !$_SESSION[ 'isAdmin' ] ) &&
    in_array( $file, $adminOnlyFiles ) )
{
    die( 'GO AWAY4' );
}

/*********************************** STEP 4 ***********************************/
// File/Folder does not exist
if( !is_readable( $cacheFileName ) )
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

$outBuffer = file_get_contents( $cacheFileName );
// OMG actually write it out...
header( "Content-Length: " . strlen( $outBuffer ) );
echo $outBuffer;

?>