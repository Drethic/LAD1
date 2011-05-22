<?php

/**
 * Basic concept: Interface to the Processes MySQL table
 *
 * Uses:
 *
 */

require_once( 'MySqlObject.php' );
require_once( 'servers.php' );

class Processes extends MySQLObject
{
    private $modifiedServers = array();
    private $lastUpdateTime = 0;
    
    function getLastUpdateTime()
    {
        return $this->lastUpdateTime;
    }
    
    function getModifiedServers()
    {
        return $this->modifiedServers;
    }
    
    function mergeModifiedServer( $serverid )
    {
        if( !in_array( $serverid, $this->modifiedServers ) )
        {
            $serverObj = new Servers();
            $serverInfo = $serverObj->getServerByID( $serverid );
            $this->redistributeCPU( $serverInfo );
            $this->modifiedServers[] = $serverid;
        }
    }
    
    function getColumns( )
    {
        return array( 'ID', 'TARGET_PROGRAM', 'OWNING_SERVER', 'CPU_USAGE',
                      'RAM_USAGE', 'BW_USAGE', 'OPERATION', 'LINKED_ID',
                      'CYCLES_COMPLETED', 'CYCLES_REMAINING' );
    }

    function getTableName( )
    {
        return 'PROCESSES';
    }

    function addProcess( $target, $owningServer, $cpu, $ram, $bw, $operation,
                         $remainingCycles )
    {
        $this->mergeModifiedServer( $owningServer );
        return $this->insert( array( 'NULL', $target, $owningServer, $cpu,
                                     $ram, $bw, $operation, 0, 0,
                                     $remainingCycles * 1000 ) );
    }

    function addRemoteProcess( $target, $ownerServer, $targetServer, $ownerCPU,
                               $targetCPU, $ownerRAM, $targetRAM, $bw,
                               $operation, $remainingCycles )
    {
        $this->mergeModifiedServer( $owningServer );
        $this->mergeModifiedServer( $targetServer );
        $id1 = $this->insert( array( 'NULL', $target, $ownerServer, $ownerCPU,
                                    $ownerRAM, $bw, $operation, 0, 0,
                                    $remainingCycles ) );
        $id2 = $this->insert( array( 'NULL', $target, $targetServer, $targetCPU,
                                     $targetRAM, $bw, $operation, $id1, 0,
                                     $remainingCycles * 1000 ) );
        $this->update( array( 'LINKED_ID' => $id2), array( 'ID' => $id1 ) );
        return array( $id1, $id2 );
    }

    function getProcessByID( $id )
    {
        return $this->getSingle( $id );
    }

    function getProcessesByServer( $serverid )
    {
        return $this->get( array( 'OWNING_SERVER' => $serverid ),
                           array( 'ID' => 'ASC' ) );
    }

    function getProcessesByProgram( $programid )
    {
        return $this->get( array( 'TARGET_PROGRAM' => $programid ),
                           array( 'ID' => 'ASC' ) );
    }
    
    function getConsumptionByServer( $serverid )
    {
        $ret = $this->get( array( 'OWNING_SERVER' => $serverid ), null, 1,
                           array( 'SUM(RAM_USAGE) AS USED_RAM',
                                  'SUM(CPU_USAGE) AS TOTAL_CPU' ) );
        return $ret[ 0 ];
    }

    function getAllProcesses( )
    {
        return $this->get( NULL, array( 'ID' => 'ASC' ) );
    }

    function getHDDConsumersByServer( $serverid )
    {
        return $this->getCustom( 'SELECT P.SIZE, P.TYPE, R.* FROM ' .
                                 'PROCESSES AS R INNER JOIN PROGRAMS AS P ON ' .
                                 'P.ID=R.TARGET_PROGRAM WHERE ' .
                                 "R.OWNING_SERVER=$serverid AND " .
                                 'P.TYPE IN(' .
                                 implode( ',', getHDDConsumingOperations() ) .
                                 ') ORDER BY R.ID' );
    }

    function deleteProcess( $id, $serverid )
    {
        $this->mergeModifiedServer( $serverid );
        return $this->delete( array( 'ID' => $id ) );
    }
    
    function calculateServerRatio( $serverid, $servercpu )
    {
        $procs = $this->getProcessesByServer( $serverid );
        if( count( $procs ) == 0 )
        {
            return array( 'LAST_UPDATE_TIME' => 0,
                          'OPERATING_RATIO' => 0 );
        }
        $cpuTotal = 0;
        foreach( $procs as $proc )
        {
            $cpuTotal += $proc[ 'CPU_USAGE' ];
        }
        
        $ratio = round( ( $servercpu / $cpuTotal ), 4 );
        return array( 'LAST_UPDATE_TIME' => $this->lastUpdateTime,
                      'OPERATING_RATIO' => $ratio );
    }
    
    function redistributeCPU( $serverInfo )
    {
        $serverid = $serverInfo[ 'ID' ];
        $servercpu = $serverInfo[ 'CPU' ];
        $serverratio = $serverInfo[ 'OPERATING_RATIO' ];
        $serverupdate = $serverInfo[ 'LAST_UPDATE_TIME' ];
        $procs = $this->getProcessesByServer( $serverid );
        
        // Update last update time
        if( $this->lastUpdateTime == 0 )
        {
            $this->lastUpdateTime = time();
        }
        
        // If there aren't any processes, no need to redistribute
        if( count( $procs ) == 0 )
        {
            return;
        }
        $cpuTotal = 0;
        foreach( $procs as $proc )
        {
            $cpuTotal += $proc[ 'CPU_USAGE' ];
        }
        
        $nowtime = $this->lastUpdateTime;
        
        if( $serverratio != 0 )
        {
            foreach( $procs as $proc )
            {
                $previousConsumed = $proc[ 'CYCLES_COMPLETED' ];
                $perSecondRatio = $proc[ 'CPU_USAGE' ] * $serverratio;
                $elapsedTime = $nowtime - $serverupdate;
                $completedCycles = $perSecondRatio * $elapsedTime;
                $newCompleted = $previousConsumed + $completedCycles;
                $newRemaining = $proc[ 'CYCLES_REMAINING' ] - $completedCycles;
                if( $newRemaining < 0 )
                {
                    $newRemaining = 0;
                }
                $this->update( array( 'CYCLES_COMPLETED' => $newCompleted,
                                      'CYCLES_REMAINING' => $newRemaining ),
                               array( 'ID' => $proc[ 'ID' ] ) );
                echo( "updateProcessProgress({$proc['ID']},$newCompleted," .
                      "$newRemaining);" );
            }
        }
    }
}

?>