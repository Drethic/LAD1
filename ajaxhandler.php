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
 * Session vars:
 *  id          = Sets the ID into session to help control authorization
 *  username    = Sets the Username into session to send to newuser2 during
 *                creation of account.
 *  password    = Sets the Password into session to send to newuser2 during
 *                creation of account.
 *
 * 1.  Requests the action from main.js. Also forces a redirect back to
 *     index.php if not called via main.js.
 * 1a. If Login was selected checks if user/pass combo is valid. Does a sanity
 *     check on the user/pass for length else die.
 * 1a1. If Login was invalid echo back to main.js invalidLoginCombo().
 * 1a2. If Login was valid sets session for ID and NICK. Then echo back to
 *      main.js validLogin() with ID of the user.
 * 1b. If New User was selected it requests username/password from main.js login
 *     form. Does a sanity check on the user/pass for length else die.
 * 1b1. Checks to see if Username is already taken.  If unavailable echo back to
 *      main.js usernameTaken().
 * 1b2. If Username is available puts username/password into session vars and
 *      echo back to main.js usernameAvailable().
 * 1c. Once user inputs the retyped password and email newuser2 checks if the
 *     password matches and if the email is already in use.  It pulls in the
 *     session vars from step 1b2 and checks if they are valid else die.
 * 1c1. If the Email is already in the database echo back to main.js
 *      emailTaken()
 * 1c2. If the Email isn't used places username, password, and email into the
 *      database.  Gets the ID for the new user, and places that into session
 *      var and echo back to main.js acountCreated() with their new ID.
 * 1d. If there is nothing to handle echo alert('Nothing to handle.')
 */

require_once( 'private/defs.php' );
require_once( 'private/users.php' );

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
if (isset($_REQUEST['action']))
{
    $action = $_REQUEST['action'];
}
else
{
    $action = 'nothing';
}
/*********************************** STEP 1a **********************************/
if ($action == 'login')
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( !( strlen($rnick) > 3 && strlen($rnick) < 21 ) )
    {
        die('Stupid Muppet!  Username is the wrong length!');
    }
    if( !(strlen($rpass) > 3 && strlen($rpass) < 41 ) )
    {
        die('Stupid Muppet!  Password is the wrong length!');
    }
    $user = new Users();
    $result = $user->checkCombo( $rnick, $rpass );
/*********************************** STEP 1a1 *********************************/
    if( $result == false )
    {
        echo "invalidLoginCombo();";
    }
/*********************************** STEP 1a2 *********************************/
    else
    {
        $id = $result[0][0];
        $_SESSION['id'] = $id;
        $_SESSION['username'] = $rnick;
        echo "validLogin($id);";
    }
}
/*********************************** STEP 1b **********************************/
elseif ($action == 'newuser1')
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( !( strlen($rnick) > 3 && strlen($rnick) < 21 ) )
    {
        die('Stupid Muppet!  Username is the wrong length!');
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
/*********************************** STEP 1b1 *********************************/
    if ($result !=0)
    {
        echo "usernameTaken()";
    }
/*********************************** STEP 1b2 *********************************/
    else
    {
        $_SESSION['username'] = $nick;
        $_SESSION['password'] = $pass;
        echo "usernameAvailable()";
    }
}
/*********************************** STEP 1c **********************************/
elseif ($action == 'newuser2')
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
/*********************************** STEP 1c1 *********************************/
        if ($result != 0)
        {
            echo "emailTaken()";
        }
/*********************************** STEP 1c2 *********************************/
        else
        {
            $id = $user->addUser($nick, $pass, $email);
            $_SESSION['id'] = $id;
            echo "accountCreated(" . $id .  ")";
        }
    }
}
/*********************************** STEP 1d **********************************/
elseif ($action == 'nothing')
{
    echo 'Nothing to handle.  Now go back to the index ya muppet!';
    header("refresh: 2; index.php");
}

?>