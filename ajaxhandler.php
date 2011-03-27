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
 * 1.  Requests the action from main.js
 * 1a. If Login was selected checks if user/pass combo is valid.
 * 1a1. If Login was invalid echo back to main.js invalidLoginCombo().
 * 1a2. If Login was valid sets session for ID and NICK. Then echo back to
 *      main.js validLogin() with ID of the user.
 * 1b. If New User was selected it requests username/password from main.js login
 *     form.
 * 1b1. Checks to see if Username is already taken.  If unavailable echo back to
 *      main.js usernameTaken().
 * 1b2. If Username is available puts username/password into session vars and
 *      echo back to main.js usernameAvailable().
 * 1c. Once user inputs the retyped password and email newuser2 checks if the
 *     password matches and if the email is already in use.  It pulls in the
 *     session vars from step 1b2.
 * 1c1. If the Email is already in the database echo back to main.js
 *      emailTaken()
 * 1c2. If the Email isn't used places username, password, and email into the
 *      database.  Gets the ID for the new user, and places that into session
 *      var and echo back to main.js acountCreated() with their new ID.
 * 1d. If there is nothing to handle echo alert('Nothing to handle.')
 */

require_once( 'private/defs.php' );
require_once( 'private/users.php' );

/*********************************** STEP 1 ***********************************/
$action = $_REQUEST['action'];
/*********************************** STEP 1a **********************************/
if ($action == 'login') {
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
    $user = new Users();
    $result = $user->checkCombo( $nick, $pass );
/*********************************** STEP 1a1 *********************************/
    if( $result == false )
    {
        echo "invalidLoginCombo();";
    }
/*********************************** STEP 1a2 *********************************/
    else
    {
        $id = $result[0][0];
        $nick = $result[0][1];
        $_SESSION['id'] = $id;
        $_SESSION['username'] = $nick;
        echo "validLogin($result);";
    }
}
/*********************************** STEP 1b **********************************/
elseif ($action == 'newuser1')
{
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
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
    if (!isset($_SESSON['username']))
    {
        die('Stupid Muppet! Invalid Username!');
    }
    else
    {
        $nick = $_SESSION['username'];
    }
    if (!isset($_SESSON['password']))
    {
        die('Stupid Muppet! Invalid Password!');
    }
    else
    {
        $nick = $_SESSION['password'];
    }
    $email = $_REQUEST['email'];
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
            $user->addUser($nick, $pass, $email);
            $val = $user->get( array( 'NICK' => "'" . $nick . "'" ) );
            $id = $val[0][0];
            $_SESSION['id'] = $id;
            echo "accountCreated(" . $id .  ")";
        }
    }
}
/*********************************** STEP 1d **********************************/
else
{
    echo "alert('Nothing to handle.')";
}

?>