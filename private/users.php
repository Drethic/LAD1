<?php

/**
 * Basic concept: Interface to the User MySQL table
 *
 * Uses:
 *              addUser: Adds a user to the DB
 *           checkCombo: Checks if specified combo exists, return ID on success
 *                       or False on failure
 *     checkEmailExists: Checks if email exists, return true/false
 *  checkUsernameExists: Checks if username exists, return true/false
 *    lookupUserDetails: Looks up a single user, return false/array of user
 */

require_once( 'MySqlObject.php' );

class Users extends MySQLObject
{
    const ADMIN_FLAG = 0x000000000000001;

    function getColumns( )
    {
        return array( 'ID', 'NICK', 'PASSWORD', 'EMAIL', 'FLAGS' );
    }

    function getTableName( )
    {
        return 'USERS';
    }

    function addUser( $nick, $pass, $email )
    {
        $nick = $this->escapifyString( $nick );
        $pass = $this->escapifyString( $pass );
        $email = $this->escapifyString( $email );
        return $this->insert( array( 'NULL', $nick, "PASSWORD($pass)",
                                     $email, 0, 0 ) );
    }

    function checkCombo( $nick, $pass )
    {
        $nick = $this->escapifyString( $nick );
        $pass = $this->escapifyString( $pass );
        $val = $this->get( array( 'NICK' => $nick,
                                  'PASSWORD' => "PASSWORD($pass)" ) );
        if( count( $val ) == 0 )
        {
            return false;
        }
        return $val[ 0 ];
    }

    function checkUsernameExists( $nick )
    {
        $nick = $this->escapifyString( $nick );
        $val = $this->get( array( 'LOWER(NICK)' =>  "LOWER($nick)" ) );
        return count( $val );
    }

    function checkEmailExists( $email )
    {
        $email = $this->escapifyString( $email );
        $val = $this->get( array( 'LOWER(EMAIL)' => "LOWER($email)" ) );
        return count( $val );
    }

    function lookupUserDetails( $id )
    {
        return $this->getSingle( $id );
    }

    function isUserAdmin( $id )
    {
        return $this->isUserDataAdmin( $this->lookupUserDetails( $id ) );
    }

    function isUserDataAdmin( $array )
    {
        if( !isset( $array[ 'FLAGS' ] ) )
        {
            die( 'Improper use of isUserDataAdmin. Fix your shit.' );
        }

        return $array[ 'FLAGS' ] & self::ADMIN_FLAG;
    }
}

?>