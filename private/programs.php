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

    function getProgramByID( $programid )
    {
        return $this->getSingle( $programid );
    }

    function getProgramOwnerByID( $programid )
    {
        $programid = intval( $programid );
        return $this->getCustom( "SELECT U.ID FROM USERS AS U, SERVERS AS S," +
                                 "PROGRAMS AS P WHERE U.ID=S.OWNER_ID AND " +
                                 "S.ID=P.SERVER_ID AND P.ID=$programid" );
    }

    function getServerUsage( $serverid )
    {
        return $this->get( array( 'SERVER_ID' => $serverid ), NULL, 0,
                           "SUM(SIZE)")
    }
}

?>