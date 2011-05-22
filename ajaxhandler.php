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
 *       startdelete = User wants to delete a file
 *  exchangeprograms = User wants to exchange programs for hardware upgrade
 *  changeservername = User wants to change the name of their server
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
    //TODO Handle ajax handler deaths
    die( 'forceRefresh();' );
}

/*********************************** STEP 1 ***********************************/
define( 'NO_LOGIN', 1 );

$actionRequirements =
  array( 'login' => array( NO_LOGIN, 'ah_login',
                    array( 'username', 'password' ) ),
         'newuser1' => array( NO_LOGIN, 'ah_login',
                       array( 'username', 'password' ) ),
         'newuser2' => array( NO_LOGIN, 'ah_login',
                       array( 'email', 'cpassword' ) ),
         'requestservers' => array( 0, 'ah_server', array() ),
         'requestfreeserver' => array( 0, 'ah_server', array() ),
         'viewserver' => array( 0, 'ah_server', array( 'SERVER_ID' ) ),
         'freeprograms' => array( 0, 'ah_server', array( 'SERVER_ID' ) ),
         'startresearch' => array( 0, 'ah_server', array( 'PROGRAM_ID' ) ),
         'finishprocess' => array( 0, 'ah_server', array( 'PROCESS_ID' ) ),
         'cancelprocess' => array( 0, 'ah_server', array( 'PROCESS_ID' ) ),
         'startdelete' => array( 0, 'ah_server', array( 'PROGRAM_ID' ) ),
         'exchangeprograms' => array( 0, 'ah_server', array( 'PROGRAM_ID',
                                      'CPU_UP', 'RAM_UP', 'HDD_UP', 'BW_UP' )),
         'changeservername' => array( 0, 'ah_server', array('SERVER_ID',
                                      'NAME' )));

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
        // If the user needs to be logged in they won't have the NO_LOGIN bit
        // in the requirements and they *should* have the session ID set
        if( !( $requirements & NO_LOGIN ) && !isset( $_SESSION[ 'ID' ] ) )
        {
            ahdie( 'Action requires login.' );
        }

        // Now we check if there are bad parameters. The third column of the
        // requirements is an array of required parameters.  Check make sure
        // each exists
        foreach( $currReq[ 2 ] as $parameter )
        {
            if( !isset( $_REQUEST[ $parameter ] ) )
            {
                ahdie( "Missing request parameter $parameter." );
            }
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