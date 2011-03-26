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
        echo "validLogin($result);";
    }
}
elseif ($action == 'newuser1')
{
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
    $user = new Users();
    $result = $user->checkUsernameExists( $nick );
    If ($result != 0)
    {
        echo "usernameTaken()";
    }
    else
    {
        echo "usernameAvailable()";
    }
}
elseif ($action == 'newuser2')
{
    echo "alert('newuser2')";
}
else
{
    echo "alert('Nothing')";
}

?>