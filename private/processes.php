<?php

/**
 * Basic concept: Interface to the Processes MySQL table
 *
 * Uses:
 *
 */

require_once( 'MySqlObject.php' );

class Processes extends MySQLObject
{
    function getColumns( )
    {
        return array( "ID", "TARGET_PROGRAM", "OWNING_SERVER", "CPU_USAGE",
                      "RAM_USAGE", "BW_USAGE", "OPERATION", "COMPLETION_TIME",
                      "LINKED_ID" );
    }

    function getIndex( )
    {
        return 0;
    }

    function getTableName( )
    {
        return "PROCESSES";
    }

    function addProcess( $target, $owner, $cpu, $ram, $bw, $operation,
                         $completion )
    {
        return $this->insert( array( "NULL", $target, $owner, $cpu,
                                     $ram, $bw, $operation, $completion, 0 ) );
    }

    function addRemoteProcess( $target, $ownerServer, $targetServer, $ownerCPU,
                               $targetCPU, $ownerRAM, $targetRAM, $bw,
                               $operation, $completion )
    {
        $id1 = $this->insert( array( "NULL", $target, $ownerServer, $ownerCPU,
                                    $ownerRAM, $bw, $operation, $completion,
                                    0 ) );
        $id2 = $this->insert( array( "NULL", $target, $targetServer, $targetCPU,
                                     $targetRAM, $bw, $operation, $completion,
                                     $id1 ) );
        $this->update( array( 'LINKED_ID' => $id2), array( 'ID' => $id1 ) );
        return array( $id1, $id2 );
    }

    function getProcessesByServer( $serverid )
    {
        return $this->get( array( 'OWNING_SERVER' => $serverid ),
                           array( 'ID' => 'ASC' ) );
    }

    function getAllProcesses( )
    {
        return $this->get( NULL, array( 'ID' => 'ASC' ) );
    }

    function deleteProcess( $id )
    {
        return $this->delete( array( 'ID' => $id ) );
    }
}

?>