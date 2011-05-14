<?php

/**
 * Basic concept: Interface to the Servers MySQL table
 *
 * Uses:
 *
 */

require_once( 'MySqlObject.php' );

class Servers extends MySQLObject
{
    function getColumns( )
    {
        return array( 'ID', 'OWNER_ID', 'IP', 'CPU', 'RAM', 'HDD',
                      'BANDWIDTH', 'LAST_UPDATE_TIME', 'OPERATING_RATIO' );
    }

    function getTableName( )
    {
        return 'SERVERS';
    }

    static function getAvailableIP( )
    {
        // Get what IPs are already taken
        $takenIPs = $this->getOnlyColumn( 'IP' );

        // Generate a new random IP
        $randomIP = rand( 1, 4294967296 ); // 256 ^ 4

        // While the IP is already taken, generate a new one
        while( in_array( $randomIP, $takenIPs ) )
        {
            $randomIP = rand( 1, 4294967296 );
        }
        // Return the new/available one
        return $randomIP;
    }

    function addServer( $ownerid )
    {
        $randomIP = $this->getAvailableIP();
        return $this->insert( array( 'NULL', $ownerid, $randomIP, DEFAULT_CPU,
                                     DEFAULT_RAM, DEFAULT_HDD, DEFAULT_BW,
                                     'NOW()', '1.0' ) );
    }

    function getServersByOwner( $ownerid )
    {
        return $this->get( array( 'OWNER_ID' => $ownerid ),
                           array( 'ID' => 'ASC' ) );
    }

    function getAllServers( )
    {
        return $this->get( NULL, array( 'ID' => 'ASC' ) );
    }

    function getServerByIP( $ip )
    {
        return $this->get( array( 'IP' => $ip ), NULL, 1 );
    }

    function getServerByID( $id )
    {
        return $this->getSingle( $id );
    }

    function getServerIDByIP( $ip )
    {
        $row = $this->getServerByIP( $ip );
        if( is_array( $row ) )
        {
            return $row[ 'ID' ];
        }
        return false;
    }

    function adjustCPU( $server, $amount )
    {
        return $this->adjustSingleByID( $server, 'CPU', $amount );
    }

    function adjustRAM( $server, $amount )
    {
        return $this->adjustSingleByID( $server, 'RAM', $amount );
    }

    function adjustHDD( $server, $amount )
    {
        return $this->adjustSingleByID( $server, 'HDD', $amount );
    }

    function adjustBW( $server, $amount )
    {
        return $this->adjustSingleByID( $server, 'BANDWIDTH', $amount );
    }

    function randomizeServerIP( $server )
    {
        $randomIP = $this->getAvailableIP();
        return $this->adjustSingleByID( $server, 'IP', $randomIP );
    }

    function adjustAllStats( $server, $cpu, $ram, $hdd, $bw )
    {
        $changes = array();
        if( $cpu != 0 )
        {
            $changes[ 'CPU' ] = "CPU+$cpu";
        }
        if( $ram != 0 )
        {
            $changes[ 'RAM' ] = "RAM+$ram";
        }
        if( $hdd != 0 )
        {
            $changes[ 'HDD' ] = "HDD+$hdd";
        }
        if( $bw != 0 )
        {
            $changes[ 'BANDWIDTH' ] = "BANDWIDTH+$bw";
        }
        return $this->update( $changes, array( 'ID' => $server ) );
    }
}

?>