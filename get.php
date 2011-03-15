<?php

/**
 * Basic concept: Retrieves a client-side file (JS, CSS, IMG)
 *
 * Parameters:
 *   t: Type – J = JS, C = CSS, I = IMG
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

// Utility function to test if a string ends with another string
function endsWith( $haystack, $needle )
{
   $length = strlen( $needle );
   return substr( $haystack, -$length, $length) === $needle;
}

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
if( preg_replace( '/[[:alnum:]]*/i', '', $_REQUEST[ 'f' ] ) !== '' )
{
   die( 'GO AWAY' );
}

/*********************************** STEP 2 ***********************************/
in_array( $_REQUEST[ 't' ], array( 'J', 'C', 'I' ) ) or die( 'GO AWAY' );

$possibleFileNames = array();
$applicationType = "";

switch( $_REQUEST[ 't' ] )
{
   case 'J':
       $possibleFileNames[] = "js/{$_REQUEST['f']}.js";
       $applicationType = "text/javascript";
       break;
   case 'C':
       $possibleFileNames[] = "css/{$_REQUEST['f']}.css";
       $applicationType = "text/css";
       break;
   case 'I':
       // Application type can't be determined yet, determine later
       $possibleFileNames[] = "imgs/${_REQUEST['f']}.jpg";
       $possibleFileNames[] = "imgs/${_REQUEST['f']}.jpeg";
       $possibleFileNames[] = "imgs/${_REQUEST['f']}.png";
       $possibleFileNames[] = "imgs/${_REQUEST['f']}.svg";
       $possibleFileNames[] = "imgs/${_REQUEST['f']}.gif";
}

/*********************************** STEP 3 ***********************************/
if( !isset( $_SESSION[ 'isAdmin' ] ) || !$_SESSION[ 'isAdmin' ] )
{
   foreach( $possibleFileNames as $adminTest )
   {
       !in_array( $adminTest, $adminOnlyFiles ) or die( 'GO AWAY' );
   }
}

// Dummy value initially
$actualFileName = 0;

/*********************************** STEP 4 ***********************************/
// Since images can have +1 possible extension, we'll loop until we find a
// good one, setting it when we can
foreach( $possibleFileNames as $fileName )
{
   if( is_readable( $fileName ) )
   {
       $actualFileName = $fileName;
       if( endsWith( $fileName, ".jpg" ) || endsWith( $fileName, ".jpeg" ) )
       {
           $applicationType = "image/jpeg";
       }
       else if( endsWith( $fileName, ".png" ) )
       {
           $applicationType = "image/png";
       }
       else if( endsWith( $fileName, ".svg" ) )
       {
           $applicationType = "image/svg+xml";
       }
       else
       {
           $applicationType = "image/gif";
       }
       break;
   }
}

// File does not exist
if( !$actualFileName )
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