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
        return array( 'ID', 'SERVER_ID', 'TYPE', 'SIZE', 'VERSION' );
    }

    function getIndex( )
    {
        return 0;
    }

    function getTableName( )
    {
        return 'PROGRAMS';
    }

    function addProgram( $serverid, $type, $size, $version )
    {
        return $this->insert( array( 'NULL', $serverid, $type, $size,
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

    function upgradeProgram( $id, $type )
    {
        $sizeIncrease = getProgramSize( $type );
        return $this->update( array('SIZE' => "SIZE+$sizeIncrease",
                                    'VERSION' => 'VERSION+1'),
                              array('ID' => $id ));
    }
    function deleteProgram( $id )
    {
        return $this->delete( array( 'ID' => $id ) );
    }

    function getProgramByID( $programid )
    {
        return $this->getSingle( $programid );
    }

    // Returns program owner
    function getProgramOwnerByID( $programid )
    {
        $temp = $this->getProgramOwnerAndServerByID( $programid );
        return $temp[ 'USER_ID' ];
    }

    function getServerUsage( $serverid )
    {
        $ret = $this->get( array( 'SERVER_ID' => $serverid ), NULL, 0,
                           array( 'SUM(SIZE) AS TOTAL_SIZE' ) );
        return $ret[ 0 ][ 'TOTAL_SIZE' ];
    }

    // Returns 2D array [ userID, serverID, programInfo... ]
    function getProgramOwnerAndServerByID( $programid )
    {
        $programid = intval( $programid );
        return $this->getCustom( 'SELECT U.ID AS USER_ID, S.ID AS SERVER_ID,' .
                                 'P.* FROM PROGRAMS AS P INNER JOIN SERVERS ' .
                                 'AS S ON ' .
                                 'P.SERVER_ID=S.ID INNER JOIN USERS AS U ON ' .
                                 "U.ID=S.OWNER_ID WHERE P.ID=$programid" );
    }
}

?>