<?php
/**
 * Basic concept: Handle ajax calls to and from the server
 *
 * File Name: ajaxhandler.php
 * Uses: It handles stuff...
 */

header('Content-Type: text/javascript; charset=UTF-8');
require_once( 'private/defs.php' );
require_once( 'private/users.php' );

$action = $_REQUEST['action'];
if ($action == 'login') {
    $nick = $_REQUEST['username'];
    $pass = $_REQUEST['password'];
    $user = new Users();
    if ($user->checkCombo( $nick, $pass ) == 'false'){
        echo "alert('Not in db')";
    }
} elseif ($action == 'newuser1') {
    echo "alert('newuser1')";
} else {
    echo "alert('Nothing')";
}

?>