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

    function getColumns( )
    {
        return array( "ID", "NICK", "PASSWORD", "EMAIL" );
    }

    function getIndex( )
    {
        return 0;
    }

    function getTableName( )
    {
        return "USERS";
    }

    function addUser( $nick, $pass, $email )
    {
        $nick = $this->escapifyString( $nick );
        $pass = $this->escapifyString( $pass );
        $email = $this->escapifyString( $email );
        return $this->insert( array( "NULL", $nick, $pass, $email ) );
    }

    function checkCombo( $nick, $pass )
    {
        $nick = $this->escapifyString( $nick );
        $pass = $this->escapifyString( $pass );
        $val = $this->get( array( 'NICK' => $nick, 'PASSWORD' => $pass ) );
        if( count( $val ) == 0 )
        {
            return false;
        }
        return $val;
    }

    function checkUsernameExists( $nick )
    {
        $nick = $this->escapifyString( $nick );
        $val = $this->get( array( "LOWER(NICK)" =>  "LOWER(" . $nick . ")" ) );
        return count( $val );
    }

    function checkEmailExists( $email )
    {
        $email = $this->escapifyString( $email );
        $val = $this->get( array( "LOWER(EMAIL)" => "LOWER(" . $email . ")" ) );
        return count( $val );
    }

    function lookupUserDetails( $id )
    {
        return $this->getSingle( $id );
    }
}

?>