<?php

/**
 * Basic concept: Interface to the Programs MySQL table
 *
 * Uses:
 *
 */

require_once( 'MySqlObject.php' );

class Programs extends MySQLObject
{
    function getColumns( )
    {
        return array( "ID", "SERVER_ID", "TYPE", "SIZE", "VERSION" );
    }

    function getIndex( )
    {
        return 0;
    }

    function getTableName( )
    {
        return "PROGRAMS";
    }

    function addProgram( $serverid, $type, $size, $version )
    {
        return $this->insert( array( "NULL", $serverid, $type, $size,
                                     $version ) );
    }

    function getProgramsByServer( $serverid )
    {
        return $this->get( array( 'SERVER_ID' => $serverid ),
                           array( 'ID' => 'ASC' ) );
    }

    function getAllPrograms( )
    {
        return $this->get( NULL, array( 'ID' => 'ASC' ) );
    }

    function deleteProgram( $id )
    {
        return $this->delete( array( 'ID' => $id ) );
    }
}

?>