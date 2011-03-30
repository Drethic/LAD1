<?php

/**
 * Basic concept: Interface to the Servers MySQL table
 *
 * Uses:
 *
 */

require_once( 'MySqlObject.php' );

class Users extends MySQLObject
{
    function getColumns( )
    {
        return array( "ID", "OWNER_ID", "IP", "CPU", "RAM", "HDD",
                      "BANDWIDTH" );
    }

    function getIndex( )
    {
        return 0;
    }

    function getTableName( )
    {
        return "SERVERS";
    }

    function addServer( $ownerid )
    {
        $takenIPs = $this->getOnlyColumn( 'IP' );

        $randomIP = rand( 1, 4294967296 ); // 256 ^ 4

        while( in_array( $randomIP, $takenIPs ) )
        {
            $randomIP = rand( 1, 4294967296 );
        }
        return $this->insert( array( "NULL", $ownerid, $randomIP, DEFAULT_CPU,
                                     DEFAULT_RAM, DEFAULT_HDD, DEFAULT_BW ) );
    }
}

?>