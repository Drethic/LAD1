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

    function getTableCreator( )
    {
        return "CREATE TABLE `SERVERS` (\n" .
               "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
               "`OWNER_ID` int(10) unsigned NOT NULL,\n" .
               "`IP` int(10) unsigned NOT NULL,\n" .
               "`CPU` int(10) unsigned NOT NULL,\n" .
               "`RAM` int(10) unsigned NOT NULL,\n" .
               "`HDD` int(10) unsigned NOT NULL,\n" .
               "`BANDWIDTH` int(10) unsigned NOT NULL,\n" .
               "PRIMARY KEY (`ID`)\n" .
               ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
    }

    function getDependents( )
    {
        return array( 'USERS' );
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