<?php

/**
 * @file ah_login.php
 *
 * Basic concept: Handle login related ajax commands
 *
 * Handled $action values:
 *  newuser1
 *  newuser2
 *  login
 *
 * Session vars:
 *  ID          = Sets the ID into session to help control authorization
 *  username    = Sets the Username into session to send to newuser2 during
 *                creation of account.
 *  password    = Sets the Password into session to send to newuser2 during
 *                creation of account.
 *
 * 1. If Login was selected checks if user/pass combo is valid. Does a sanity
 *    check on the user/pass for length else die.
 * 1a. If Login was invalid echo back to main.js invalidLoginCombo().
 * 1b. If Login was valid sets session for ID and NICK. Then echo back to
 *     main.js validLogin() with ID of the user.
 * 2. If New User was selected it requests username/password from main.js login
 *    form. Does a sanity check on the user/pass for length else die.
 * 2a. Checks to see if Username is already taken.  If unavailable echo back to
 *     main.js usernameTaken().
 * 2b. If Username is available puts username/password into session vars and
 *     echo back to main.js usernameAvailable().
 * 3. Once user inputs the retyped password and email newuser2 checks if the
 *    password matches and if the email is already in use.  It pulls in the
 *    session vars from step 1b2 and checks if they are valid else die.
 * 3a. If the Email is already in the database echo back to main.js emailTaken()
 * 3b. If the Email isn't used places username, password, and email into the
 *     database.  Gets the ID for the new user, and places that into session
 *     var and echo back to main.js acountCreated() with their new ID.
 */
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

function loadApplicableModules( $user, $result )
{
    require_once( 'userdisabledmodules.php' );
    // Set up session vars
    $_SESSION[ 'ID' ] = $result[ 'ID' ];
    $_SESSION[ 'username' ] = $result[ 'NICK' ];
    $_SESSION[ 'GATHERING_POINTS' ] = $result[ 'GATHERING_POINTS' ];

    $id = $result[ 'ID' ];
    $gpoints = $result[ 'GATHERING_POINTS' ];
    // Check admin
    $isAdmin = $_SESSION['isAdmin'] = $user->isUserDataAdmin( $result );
    echo "validLogin($id,$gpoints);";
    // Add admin script/stylesheet if admin
    if( $isAdmin )
    {
        echo 'addScriptElement("' .
                clientfile_buildRequest( 'J', 'admin' ) . '");';
        echo 'addStylesheet("' .
                clientfile_buildRequest( 'C', 'admin' ) . '");';
    }

    // Walk over modules and add script elements for enabled ones
    $validModules = opt_getValidModules();
    $userdisabledmodules = new UserDisabledModules();
    $disabledModules = $userdisabledmodules->getDisabledModules( $id );

    function moduleWalker( $value, $key, $modules )
    {
        // Check if the user has disabled this specific module
        $varupper = strtoupper( $key );
        foreach( $modules as $module )
        {
            if( $varupper == $module[ 'MODULE_NAME' ] )
            {
                return;
            }
        }
        // Check if this module has been disabled by the system
        if( strpos( ADMIN_DISABLED_MODULES, $varupper ) !== false )
        {
            return;
        }
        $request = clientfile_buildRequest( 'J', strtolower( $key ) );
        echo "addScriptElement('$request');";
        if( !empty( $value ) )
        {
            foreach( $value as $csssheet )
            {
                $cssrequest = clientfile_buildRequest( 'C', $csssheet );
                echo "addStylesheet('$cssrequest');";
            }
        }
    }
    array_walk( $validModules, "moduleWalker", $disabledModules );
}

/*********************************** STEP 1 ***********************************/
if( $action == 'login' )
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( strlen($rnick) < 4 || strlen($rnick) > 20 || !ctype_alnum($rnick) ||
        preg_match('/^\d/', $rnick) === 1 )
    {
        ahdie('Stupid Muppet!  Username is the wrong!');
    }
    if( strlen($rpass) < 4 || strlen($rpass) > 40 )
    {
        ahdie('Stupid Muppet!  Password is the wrong length!');
    }
    $user = new Users();
    $result = $user->checkCombo( $rnick, $rpass );
/*********************************** STEP 1a **********************************/
    if( $result == false )
    {
        echo "invalidLoginCombo();";
    }
/*********************************** STEP 1b **********************************/
    else
    {
        loadApplicableModules( $user, $result );
    }
}
/*********************************** STEP 2 ***********************************/
elseif( $action == 'newuser1' )
{
    $rnick = $_REQUEST['username'];
    $rpass = $_REQUEST['password'];
    if( !( strlen($rnick) > 3 && strlen($rnick) < 21 || !ctype_alnum($rnick) ||
        preg_match('/^\d/', $rnick) === 1 ) )
    {
        ahdie('Stupid Muppet!  Username is the wrong!');
    }
    else
    {
        $nick = $rnick;
    }
    if( !( strlen($rpass) > 3 && strlen($rpass) < 41 ) )
    {
        ahdie('Stupid Muppet!  Password is the wrong length!');
    }
    else
    {
        $pass = $rpass;
    }
    $user = new Users();
    $result = $user->checkUsernameExists( $nick );
/*********************************** STEP 2a **********************************/
    if( $result != 0 )
    {
        echo "usernameTaken()";
    }
/*********************************** STEP 2b **********************************/
    else
    {
        $_SESSION['username'] = $nick;
        $_SESSION['password'] = $pass;
        echo "usernameAvailable()";
    }
}
/*********************************** STEP 3 ***********************************/
elseif( $action == 'newuser2' )
{
    if(!isset($_SESSION[ 'username' ]) || !isset($_SESSION[ 'password' ]) ||
       !isset($_REQUEST[ 'email' ]))
    {
        ahdie('Stupid Muppet! Invalid Username/Passord!');
    }
    $nick = $_SESSION[ 'username' ];
    $pass = $_SESSION['password'];
    $email = $_REQUEST['email'];
    if( !isValidEmail( $email ) )
    {
        ahdie('Stupid muppet!  Your email isn\'t formatted right!');
    }
    $cpass = $_REQUEST['cpassword'];
    if( $pass != $cpass )
    {
        echo "cpasswordInvalid()";
    }
    else
    {
        $user = new Users();
        $result = $user->checkEmailExists( $email );
/*********************************** STEP 3a **********************************/
        if( $result != 0 )
        {
            echo "emailTaken()";
        }
/*********************************** STEP 3b **********************************/
        else
        {
            $id = $user->addUser( $nick, $pass, $email );
            $result = $user->checkCombo( $nick, $pass );
            loadApplicableModules( $user, $result );
        }
    }
}
/*********************************** STEP 4 ***********************************/
if( $action == 'passreset' )
{
    if(!isset($_REQUEST[ 'username' ]) || !isset($_REQUEST[ 'email' ]))
    {
        ahdie('Stupid Muppet! Invalid Username!');
    }
    $nick = $_REQUEST[ 'username' ];
    $email = $_REQUEST['email'];
    if( !isValidEmail( $email ) )
    {
        ahdie('Stupid muppet!  Your email isn\'t formatted right!');
    }
    $user = new Users();
    $result = $user->checkEmailMatches( $nick, $email );
/*********************************** STEP 4a **********************************/
        if( $result == false )
        {
            echo "emailWrong()";
        }
/*********************************** STEP 4b **********************************/
        else
        {
            $id = $result[ 'ID' ];
            $nick = $result[ 'USER' ];
            $user->changePass($id, $nick, $email);
        }
}
?>