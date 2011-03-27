<?php
/**
 * Basic concept: Handle ajax calls to and from the server
 *
 * File Name: ajaxhandler.php
 * Uses: It handles stuff...
 */

require_once( 'private/defs.php' );
require_once( 'private/users.php' );

$action = $_REQUEST['action'];
if ($action == 'login') {
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
    $user = new Users();
    $result = $user->checkCombo( $nick, $pass );
    if( $result == false )
    {
        echo "invalidLoginCombo();";
    }
    else
    {
        $_SESSION['id'] = $result;
        echo "validLogin($result);";
    }
}
elseif ($action == 'newuser1')
{
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
    $user = new Users();
    $result = $user->checkUsernameExists( $nick );
    if ($result !=0)
    {
        echo "usernameTaken()";
    }
    else
    {
        $_SESSION['username'] = $nick;
        $_SESSION['password'] = $pass;
        echo "usernameAvailable()";
    }
}
elseif ($action == 'newuser2')
{
    $nick = $_SESSION['username'];
    $pass = $_SESSION['password'];
    $email = $_REQUEST['email'];
    $user = new Users();
    $result = $user->checkEmailExists( $email );
    if ($result != 0)
    {
        echo "emailTaken()";
    }
    else
    {
        $user->addUser($nick, $pass, $email);
        $val = $user->get( array( 'NICK' => "'" . $nick . "'" ) );
        $id = $val[0][0];
        $_SESSION['id'] = $id;
        echo "accountCreated(" . $id .  ")";
    }
}
else
{
    echo "alert('Nothing')";
}

?>