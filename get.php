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
 */

// Setup admin only files
$adminOnlyFiles = array();

/*********************************** STEP 1 ***********************************/
// Make sure we have each request var
if( !isset( $_REQUEST[ 't' ] ) || !isset( $_REQUEST[ 'f' ] ) ||
   !isset( $_REQUEST[ 'm' ] ) )
{
   die( 'GO AWAY' );
}

// Make sure there are no special characters so that people don't access files
// they shouldn't
preg_match( '/^[[:alnum:]]*$/i', $_REQUEST[ 'f' ] ) == 1 or
    die( 'GO AWAY' );

/*********************************** STEP 2 ***********************************/
// Make sure the type of file requested is valid
in_array( $_REQUEST[ 't' ], array( 'J', 'C', 'P', 'E', 'N', 'S', 'G' ) ) or
    die( 'GO AWAY' );

$applicationType = "";

switch( $_REQUEST[ 't' ] )
{
   case 'J':
       $actualFileName = "js/{$_REQUEST['f']}.js";
       $applicationType = 'text/javascript';
       break;
   case 'C':
       $actualFileName = "css/{$_REQUEST['f']}.css";
       $applicationType = 'text/css';
       break;
   case 'P':
       $actualFileName = "img/${_REQUEST['f']}.jpg";
       $applicationType = 'image/jpeg';
       break;
   case 'E':
       $actualFileName = "img/${_REQUEST['f']}.jpeg";
       $applicationType = 'image/jpeg';
       break;
   case 'N':
       $actualFileName = "img/${_REQUEST['f']}.png";
       $applicationType = 'image/png';
       break;
   case 'S':
       $actualFileName = "img/${_REQUEST['f']}.svg";
       $applicationType = 'image/svg+xml';
       break;
   case 'G':
       $actualFileName = "img/${_REQUEST['f']}.gif";
       $applicationType = 'image/gif';
}

/*********************************** STEP 3 ***********************************/
if( ( !isset( $_SESSION[ 'isAdmin' ] ) || !$_SESSION[ 'isAdmin' ] ) &&
    !in_array( $actualFileName, $adminOnlyFiles ) )
{
    die( 'GO AWAY' );
}

/*********************************** STEP 4 ***********************************/
// File does not exist
if( !is_readable( $actualFileName ) )
{
   die( 'GO AWAY' );
}

/*********************************** STEP 5 ***********************************/
if( mtime( $actualFileName ) != $_SESSION[ 'm' ] )
{
   // TODO: Improve this so that it will force a client refresh rather than
   // TODO: simply dying
   die( 'GO AWAY' );
}

/*********************************** STEP 6 ***********************************/
// Output some headers
header( "PRAGMA: public" );
header( "Content-type: $applicationType" );
header( "Last-Modified: " . date( DateTime::COOKIE, $_SESSION[ 'm' ] ) );
header( "Expires: " . date( DateTime::COOKIE, time() + (60 * 24 * 60 * 60) ) );
header( "Content-Length: " . filesize( $actualFileName ) );

// Read file and write it to the user
readfile( $actualFileName );

?>