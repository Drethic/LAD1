<?php
/**
 * @file ajaxhandler.php
 *
 * Basic concept: Handle ajax calls to and from the server
 *
 * Valid $action values:
 *          newuser1 = Step 1 in user creation process
 *          newuser2 = Step 2 in user creation process
 *             login = User is logging in
 *    requestservers = User is requesting their list of servers
 * requestfreeserver = User wants their first server for free
 *        viewserver = User wants to see all information about a server
 *      freeprograms = User is requesting their free programs
 *     startresearch = User wants to start researching a program
 *     finishprocess = User wants to complete a process
 *     cancelprocess = User wants to cancel a process
 *
 * Session vars:
 *  ID          = Sets the ID into session to help control authorization
 *
 * 1.  Perform validation by only allowing specific actions when logged in
 *     Each action has it's own requirements plus the name of the file where it
 *     is run in an array.
 * 2.  Requests the action from main.js. Also forces a redirect back to
 *     index.php if not called via main.js.
 */

require_once( 'private/defs.php' );

function ahdie( $reason )
{
    die( 'forceRefresh();' );
}

/*********************************** STEP 1 ***********************************/
define( 'NEED_LOGIN', 1 );

$actionRequirements =
  array( 'login' => array( 0, 'ah_login' ),
         'newuser1' => array( 0, 'ah_login' ),
         'newuser2' => array( 0, 'ah_login' ),
         'requestservers' => array( NEED_LOGIN, 'ah_server' ),
         'requestfreeserver' => array( NEED_LOGIN, 'ah_server' ),
         'viewserver' => array( NEED_LOGIN, 'ah_server' ),
         'freeprograms' => array( NEED_LOGIN, 'ah_server' ),
         'startresearch' => array( NEED_LOGIN, 'ah_server' ),
         'finishprocess' => array( NEED_LOGIN, 'ah_server' ),
         'cancelprocess' => array( NEED_LOGIN, 'ah_server' ));

// First of all make sure the action is set
/*********************************** STEP 2 ***********************************/
if( isset( $_REQUEST['action'] ) )
{
    // Action is set, now make sure it's in our list of valid actions
    $action = $_REQUEST['action'];
    if( !isset( $actionRequirements[ $action ] ) )
    {
        // Not in the list, deny it
        ahdie( 'Invalid action.' );
    }
    else
    {
        $currReq = $actionRequirements[ $action ];
        // It's in the list, now we need to perform more checks
        $requirements = $currReq[ 0 ];
        // If the user needs to be logged in they'll have the NEED_LOGIN bit
        // in the requirements and they *should* have the session ID set
        if( $requirements & NEED_LOGIN && !isset( $_SESSION[ 'ID' ] ) )
        {
            ahdie( 'Action requires login.' );
        }

        // Include the sub-file
        require_once( 'private/' . $currReq[ 1 ] . '.php' );
    }
}
else
{
    ahdie( 'Invalid request.' );
}
/*********************************** STEP 2i **********************************/

?>