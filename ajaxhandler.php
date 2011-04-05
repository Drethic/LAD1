<?php
/**
 * Basic concept: Handle ajax calls to and from the server
 *
 * File Name: ajaxhandler.php
 *
 * Parameters:
 *  $action = The action sent from main.js form.
 *  $nick   = Username sent from main.js form.
 *  $pass   = Password sent from main.js form.
 *  $user   = Sets users.php as object
 *  $email  = Email sent from main.js form.
 *  $id     = ID from existing user, or returned after new user has been
 *            created.
 *
 * Valid $action values:
 *          newuser1 = Step 1 in user creation process
 *          newuser2 = Step 2 in user creation process
 *             login = User is logging in
 *    requestservers = User is requesting their list of servers
 * requestfreeserver = User wants their first server for free
 *        viewserver = User wants to see all information about a server
 *
 * Session vars:
 *  id          = Sets the ID into session to help control authorization
 *  username    = Sets the Username into session to send to newuser2 during
 *                creation of account.
 *  password    = Sets the Password into session to send to newuser2 during
 *                creation of account.
 *
 * 1.  Perform validation by only allowing specific actions when logged in
 * 2.  Requests the action from main.js. Also forces a redirect back to
 *     index.php if not called via main.js.
 * 2a. If Login was selected checks if user/pass combo is valid. Does a sanity
 *     check on the user/pass for length else die.
 * 2a1. If Login was invalid echo back to main.js invalidLoginCombo().
 * 2a2. If Login was valid sets session for ID and NICK. Then echo back to
 *      main.js validLogin() with ID of the user.
 * 2b. If New User was selected it requests username/password from main.js login
 *     form. Does a sanity check on the user/pass for length else die.
 * 2b1. Checks to see if Username is already taken.  If unavailable echo back to
 *      main.js usernameTaken().
 * 2b2. If Username is available puts username/password into session vars and
 *      echo back to main.js usernameAvailable().
 * 2c. Once user inputs the retyped password and email newuser2 checks if the
 *     password matches and if the email is already in use.  It pulls in the
 *     session vars from step 1b2 and checks if they are valid else die.
 * 2c1. If the Email is already in the database echo back to main.js
 *      emailTaken()
 * 2c2. If the Email isn't used places username, password, and email into the
 *      database.  Gets the ID for the new user, and places that into session
 *      var and echo back to main.js acountCreated() with their new ID.
 * 2d. If action was to request servers then we need to simply return the
 *     servers that belongs to the user
 * 2e. User want to request their free server, make sure they don't have one
 *     already then give them a free one
 * 2f. User wants to view a server
 * 2f1. For now we'll just make sure it's theirs and if it is they can view
 * 2f2. After this then we'll report back the server information followed
 *      by all programs and processes
 * 2g. If there is nothing to handle echo alert('Nothing to handle.')
 */

require_once( 'private/defs.php' );
require_once( 'private/users.php' );
require_once( 'private/servers.php' );
require_once( 'private/programs.php' );
require_once( 'private/processes.php' );

function isValidEmail($email){
    $pattern = "/^[-_a-z0-9\'+*$^&%=~!?{}]++(?:\.[-_a-z0-9\'+*$^&%=~!?{}]+)*"
    . "+@(?:(?![-.])[-a-z0-9.]+(?<![-.])\.[a-z]{2,6}|\d{1,3}(?:\.\d{1,3}){3})"
    . "(?::\d++)?$/iD";
    if(!preg_match($pattern, $email)){
      return false;
    }
    return true;
}

/*********************************** STEP 1 ***********************************/
define( 'NEED_LOGIN', 1 );

$actionRequirements =
  array( 'login' => 0,
         'newuser1' => 0,
         'newuser2' => 0,
         'requestservers' => NEED_LOGIN,
         'requestfreeserver' => NEED_LOGIN,
         'viewserver' => NEED_LOGIN );

// First of all make sure the action is set
/*********************************** STEP 2 ***********************************/
if( isset( $_REQUEST['action'] ) )
{
    // Action is set, now make sure it's in our list of valid actions
    $action = $_REQUEST['action'];
    if( !isset( $actionRequirements[ $action ] ) )
    {
        // Not in the list, deny it
        $action = 'nothing';
    }
    else
    {
        // It's in the list, now we need to perform more checks
        $requirements = $actionRequirements[ $action ];
        // If the user needs to be logged in they'll have the NEED_LOGIN bit
        // in the requirements and they *should* have the session ID set
        if( $requirements & NEED_LOGIN && !isset( $_SESSION[ 'id' ] ) )
        {
            $action = 'nothing';
        }
    }
}
else
{
    $action = 'nothing';
}
/*********************************** STEP 2a **********************************/
if( $action == 'login' )
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( strlen($rnick) < 4 || strlen($rnick) > 20 || !ctype_alnum($rnick) ||
        preg_match('/^\d/', $rnick) === 1 )
    {
        die('Stupid Muppet!  Username is the wrong!');
    }
    if( strlen($rpass) < 4 || strlen($rpass) > 40 )
    {
        die('Stupid Muppet!  Password is the wrong length!');
    }
    $user = new Users();
    $result = $user->checkCombo( $rnick, $rpass );
/*********************************** STEP 2a1 *********************************/
    if( $result == false )
    {
        echo "invalidLoginCombo();";
    }
/*********************************** STEP 2a2 *********************************/
    else
    {
        $id = $result[0][0];
        $_SESSION['id'] = $id;
        $_SESSION['username'] = $rnick;
        echo "validLogint($id);";
    }
}
/*********************************** STEP 21b **********************************/
elseif( $action == 'newuser1' )
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( !( strlen($rnick) > 3 && strlen($rnick) < 21 || !ctype_alnum($rnick) ||
        preg_match('/^\d/', $rnick) === 1 ) )
    {
        die('Stupid Muppet!  Username is the wrong!');
    }
    else
    {
        $nick = $rnick;
    }
    if( !( strlen($rpass) > 3 && strlen($rpass) < 41 ) )
    {
        die('Stupid Muppet!  Password is the wrong length!');
    }
    else
    {
        $pass = $rpass;
    }
    $user = new Users();
    $result = $user->checkUsernameExists( $nick );
/*********************************** STEP 2b1 *********************************/
    if ($result !=0)
    {
        echo "usernameTaken()";
    }
/*********************************** STEP 2b2 *********************************/
    else
    {
        $_SESSION['username'] = $nick;
        $_SESSION['password'] = $pass;
        echo "usernameAvailable()";
    }
}
/*********************************** STEP 2c **********************************/
elseif( $action == 'newuser2' )
{
    if(!isset($_SESSION[ 'username' ]) || !isset($_SESSION[ 'password' ]) ||
       !isset($_REQUEST[ 'email' ]))
    {
        die('Stupid Muppet! Invalid Username/Passord!');
    }
    $nick = $_SESSION[ 'username' ];
    $pass = $_SESSION['password'];
    $email = $_REQUEST['email'];
    if (!isValidEmail($email))
    {
        die('Stupid muppet!  Your email isn\'t formatted right!');
    }
    $cpass = $_REQUEST['cpassword'];
    if ($pass != $cpass)
    {
        echo "cpasswordInvalid()";
    }
    else
    {
        $user = new Users();
        $result = $user->checkEmailExists( $email );
/*********************************** STEP 2c1 *********************************/
        if ($result != 0)
        {
            echo "emailTaken()";
        }
/*********************************** STEP 2c2 *********************************/
        else
        {
            $id = $user->addUser($nick, $pass, $email);
            $_SESSION['id'] = $id;
            echo "accountCreated(" . $id .  ")";
        }
    }
}
/*********************************** STEP 2d **********************************/
elseif( $action == 'requestservers' )
{
    // Setup some local variables
    $id = $_SESSION[ 'id' ];
    $servers = new Servers();

    // Now we simply need to get the 2D array from servers
    $result = $servers->getServersByOwner( $id );

    // Echo out the array
    echo2DArray( 'ownedServers', 'noOwnedServers', $result );
}
/*********************************** STEP 2e **********************************/
elseif( $action == 'requestfreeserver' )
{
    // User wants their free server, check if they have one already
    $id = $_SESSION[ 'id' ];
    $servers = new Servers();

    $ownerServers = $servers->getServersByOwner( $id );

    // If they have a server then this will be an array...and not false
    if( $ownerServers != false )
    {
        die( 'You already have servers.' );
    }
    // They don't have a server, great, give them one
    $servers->addServer( $id );

    // Now we simply need to get the 2D array from servers
    $result = $servers->getServersByOwner( $id );

    // If the user still doesn't have a server, this will return false
    echo2DArray( 'ownedServers', 'noOwnedServers', $result );
}
/*********************************** STEP 2f **********************************/
elseif( $action == 'viewserver' )
{
    if( !isset( $_REQUEST[ 'SERVER_ID' ] ) )
    {
        die( 'Bad!' );
    }

    $id = $_REQUEST[ 'SERVER_ID' ];
    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $id );

/*********************************** STEP 2f1 *********************************/
    if( $serverInfo[ 1 ] != $_SESSION[ 'id' ] )
    {
        die( 'You don\'t own this server nutmeg.' );
    }

    // General Server Information plus layout the screen for programs/processes
    echo 'beginServerView(' . implode( ',', $serverInfo ) . ');';

    $programs = new Programs();
    $allPrograms = $programs->getProgramsByServer( $id );

/*********************************** STEP 2f1 *********************************/
    echo2DArray( 'serverPrograms', 'noServerPrograms', $allPrograms );

    $processes = new Processes();
    $allProcesses = $processes->getProcessesByServer( $id );

    echo2DArray( 'serverProcesses', 'noServerProcesses', $allProcesses );
}
/*********************************** STEP 2g **********************************/
elseif( $action == 'nothing' )
{
    echo 'Nothing to handle.  Now go back to the index ya muppet!';
    header("refresh: 2; index.php");
}

?>