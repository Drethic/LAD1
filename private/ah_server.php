<?php

/**
 * @file ah_server.php
 *
 * Basic concept: Handle server related ajax commands
 *
 * Handled $action values:
 *    requestservers = User is requesting their list of servers
 * requestfreeserver = User wants their first server for free
 *        viewserver = User wants to see all information about a server
 *      freeprograms = User is requesting their free programs
 *     startresearch = User wants to start researching a program
 *     finishprocess = User wants to finish a research that is running
 *       startdelete = User wants to delete a file
 *
 * Session vars:
 *  ID          = Sets the ID into session to help control authorization
 *  username    = Sets the Username into session to send to newuser2 during
 *                creation of account.
 *  password    = Sets the Password into session to send to newuser2 during
 *                creation of account.
 *  SERVER_ID   = The ID of the server to take action on
 *  PROGRAM_ID  = The ID of the program to take action on
 *
 * 1. If action was to request servers then we need to simply return the
 *     servers that belongs to the user
 * 2. User want to request their free server, make sure they don't have one
 *     already then give them a free one
 * 3. User wants to view a server
 * 3a. For now we'll just make sure it's theirs and if it is they can view
 * 3b. After this then we'll report back the server information followed
 *      by all programs and processes
 * 4. User wants their free programs
 * 4a. Ensure the user actually owns the server
 * 4b. Ensure they don't have all of the free programs
 * 5. User wants to research their program
 * 5a. Check to make sure the program belongs to them
 * 5b. Do a quick check if there's enough space after that research
 * 5c. Also check to make sure there is enough space after all researches are
 *      done to hold this one as well
 * 5d. Make sure it isn't being deleted
 * 6. User wants to finish a process
 * 6a. Make sure process belongs to server user owns
 * 6b. Check if it is a research process
 * 6b1. Make sure no circumstances have happened to cause the server to not be
 *      able to hold the research
 * 6b2. Finish up the research and grant the version
 * 7. User wants to cancel a process
 * 7a. Make sure process belongs to server user owns
 * 7b. Cancel the process
 * 8. User wants to delete a file
 * 8a. Make sure file belongs to user
 * 8b. Make sure no other operations are being performed
 * 8c. Start process
 */

require_once( 'private/users.php' );
require_once( 'private/servers.php' );
require_once( 'private/programs.php' );
require_once( 'private/processes.php' );

/*********************************** STEP 1 ***********************************/
if( $action == 'requestservers' )
{
    // Setup some local variables
    $id = $_SESSION[ 'ID' ];
    $servers = new Servers();

    // Now we simply need to get the 2D array from servers
    $result = $servers->getServersByOwner( $id );

    // Echo out the array
    echo2DArray( 'ownedServers', 'noOwnedServers', $result );
}
/*********************************** STEP 2 ***********************************/
elseif( $action == 'requestfreeserver' )
{
    // User wants their free server, check if they have one already
    $id = $_SESSION[ 'ID' ];
    $servers = new Servers();

    $ownerServers = $servers->getServersByOwner( $id );

    // If they have a server then this will be an array...and not false
    if( $ownerServers != false )
    {
        die( 'You already have servers.' );
    }
    // They don't have a server, great, give them one
    $servers->addServer( $id );

    // Now we simply need to get the 2D array from servers
    $result = $servers->getServersByOwner( $id );

    // If the user still doesn't have a server, this will return false
    echo2DArray( 'ownedServers', 'noOwnedServers', $result );
}
/*********************************** STEP 3 ***********************************/
elseif( $action == 'viewserver' )
{
    $id = $_REQUEST[ 'SERVER_ID' ];
    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $id );

/*********************************** STEP 3a **********************************/
    if( $serverInfo[ 'OWNER_ID' ] != $_SESSION[ 'ID' ] )
    {
        ahdie( 'You don\'t own this server nutmeg.' );
    }

    // General Server Information plus layout the screen for programs/processes
    echo 'beginServerView(' . implode( ',', $serverInfo ) . ');';

    $programs = new Programs();
    $allPrograms = $programs->getProgramsByServer( $id );

/*********************************** STEP 3b **********************************/
    echo2DArray( 'serverPrograms', 'noServerPrograms', $allPrograms );

    $processes = new Processes();
    $allProcesses = $processes->getProcessesByServer( $id );

    echo2DArray( 'serverProcesses', 'noServerProcesses', $allProcesses );

    echo( 'endServerView();' );
}
/*********************************** STEP 4 ***********************************/
elseif( $action == 'freeprograms' )
{
    $serverid = $_REQUEST[ 'SERVER_ID' ];
    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $serverid );

    $programs = new Programs();

/*********************************** STEP 4a **********************************/
    if( $serverInfo[ 'OWNER_ID' ] != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Getting free programs for somebody else?' );
    }

    $serverPrograms = $programs->getProgramsByServer( $serverid );

/*********************************** STEP 4b **********************************/
    $hasFWD = false;
    $hasFWB = false;
    $hasPWD = false;
    $hasPWB = false;
    foreach( $serverPrograms as $serverProgram )
    {
        switch( $serverProgram[ 'TYPE' ] )
        {
            case PROGRAM_TYPE_FIREWALL:
                $hasFWD = true;
                break;
            case PROGRAM_TYPE_FIREWALLBREAKER:
                $hasFWB = true;
                break;
            case PROGRAM_TYPE_PASSWORD:
                $hasPWD = true;
                break;
            case PROGRAM_TYPE_PASSWORDBREAKER:
                $hasPWB = true;
                break;
            default:
        }
    }
    if( $hasFWD && $hasFWB && $hasPWD && $hasPWB )
    {
        ahdie( 'Stupid people trying to get what they already have!' );
    }

    // Alright, the person is eligible!
    if( $hasFWD )
    {
        $id1 = 0;
    }
    else
    {
        $id1 = $programs->addProgram( $serverid, PROGRAM_TYPE_FIREWALL,
                                      FIREWALL_SIZE, 1 );
    }
    if( $hasFWB )
    {
        $id2 = 0;
    }
    else
    {
        $id2 = $programs->addProgram( $serverid, PROGRAM_TYPE_FIREWALLBREAKER,
                                      FIREWALLBREAKER_SIZE, 1 );
    }
    if( $hasPWD )
    {
        $id3 = 0;
    }
    else
    {
        $id3 = $programs->addProgram( $serverid, PROGRAM_TYPE_PASSWORD,
                                      PASSWORD_SIZE, 1 );
    }
    if( $hasPWB )
    {
        $id4 = 0;
    }
    else
    {
        $id4 = $programs->addProgram( $serverid, PROGRAM_TYPE_PASSWORDBREAKER,
                                      PASSWORDBREAKER_SIZE, 1 );
    }

    // And now we tell the user
    echo "grantedFreePrograms($id1,$id2,$id3,$id4);";
}
/*********************************** STEP 5 ***********************************/
elseif( $action == 'startresearch' )
{
    $programid = $_REQUEST[ 'PROGRAM_ID' ];

    $programs = new Programs();
    $servers = new Servers();
    $processes = new Processes();
    $programInfo = $programs->getProgramOwnerAndServerByID( $programid );
    $userid = $programInfo[ 'USER_ID' ];
    $serverid = $programInfo[ 'SERVER_ID' ];
    $programtype = $programInfo[ 'TYPE' ];

/*********************************** STEP 5a **********************************/
    if( $userid != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Researching for other people are we?' );
    }

    $serverInfo = $servers->getServerByID( $serverid );
    $serverConsumption = $processes->getConsumptionByServer( $serverid );

    $maxHDD = $serverInfo[ 'HDD' ];
    $maxRAM = $serverInfo[ 'RAM' ];

    $usedHDD = $programs->getServerUsage( $serverid );
    $usedRAM = $serverConsumption[ 'USED_RAM' ];
    $fileSize = getProgramSize( $programtype );

/*********************************** STEP 5b **********************************/
    if( $fileSize + $usedHDD > $maxHDD )
    {
        echo( 'notEnoughFileSpace();' );
    }
    elseif( DEFAULT_RESEARCH_RAM + $usedRAM > $maxRAM )
    {
        echo( 'notEnoughRAM();' );
    }
    else
    {
        // Get all the processes that will increase the HDD usage on the server
        $consumers = force2DArray(
                 $processes->getHDDConsumersByServer( $serverid ) );
        foreach( $consumers as $consumer )
        {
            switch( $consumer[ 'OPERATION' ] )
            {
                case PROCESS_OP_COPY:
                case PROCESS_OP_TRANSFER:
                    $usedHDD += $consumer[ 'SIZE' ];
                    break;
                case PROCESS_OP_RESEARCH:
                    $usedHDD += getProgramSize( $consumer[ 'TYPE' ] );
                    break;
            }
        }

/*********************************** STEP 5c **********************************/
        if( $usedHDD > $maxHDD )
        {
            echo( 'notEnoughFileSpace();' );
        }
        else
        {
            $programProcesses = $processes->getProcessesByProgram( $programid );
            foreach( $programProcesses as $pp )
            {
                if( $pp[ 'OPERATION' ] == PROCESS_OP_DELETE )
                {
                    ahdie( 'No researching a deleting program, duh!' );
                }
            }
            // Alright, the user can research it
            $researchid = $processes->addProcess( $programid, $serverid,
                    DEFAULT_RESEARCH_CPU, DEFAULT_RESEARCH_RAM, 0,
                    PROCESS_OP_RESEARCH, DEFAULT_RESEARCH_TIME );
            $result = $processes->getProcessByID( $researchid );
            $remainingCycles = $result[ 'CYCLES_REMAINING' ];
            echo( "startedResearch($programid,$researchid,$remainingCycles);" );
        }
    }
}
/*********************************** STEP 6 ***********************************/
elseif( $action == 'finishprocess' )
{
    // Get information about the process
    $processid = $_REQUEST[ 'PROCESS_ID' ];
    $processes = new Processes();
    $processInfo = $processes->getProcessByID( $processid );

    // Get information about the server owning the process
    $serverid = $processInfo[ 'OWNING_SERVER' ];
    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $serverid );

/*********************************** STEP 6a **********************************/
    if( $serverInfo[ 'OWNER_ID' ] != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Finishing a process for someone else = bad.' );
    }

    // Look up the current HDD usage
    $programid = $processInfo[ 'TARGET_PROGRAM' ];
    $programs = new Programs();
    $programInfo = $programs->getProgramByID( $programid );
    $usedHDD = $programs->getServerUsage( $serverid );
    $maxHDD = $serverInfo[ 'HDD' ];

/*********************************** STEP 6b **********************************/
    if( $processInfo[ 'OPERATION' ] == PROCESS_OP_RESEARCH )
    {
        $programtype = $programInfo[ 'TYPE' ];
        $fileSize = getProgramSize( $programtype );

/*********************************** STEP 6b1 *********************************/
        if( $fileSize + $usedHDD > $maxHDD )
        {
            echo( 'notEnoughFileSpace();' );
        }
        else
        {
/*********************************** STEP 6b2 *********************************/
            $processes->deleteProcess( $processid, $serverid );
            $programs->upgradeProgram( $programid, $programtype );

            echo "finishedResearch($processid);";
        }
    }
    elseif( $processInfo[ 'OPERATION' ] == PROCESS_OP_DELETE )
    {
        $processes->deleteProcess( $processid, $serverid );
        $programs->deleteProgram( $programid );
        echo "finishedDeletion($processid);";
    }
    else
    {
        ahdie( 'Unhandled operation...wtf...' );
    }
}
/*********************************** STEP 7 ***********************************/
elseif( $action == 'cancelprocess' )
{
    // Get information about the process
    $processid = $_REQUEST[ 'PROCESS_ID' ];
    $processes = new Processes();
    $processInfo = $processes->getProcessByID( $processid );

    // Get information about the server owning the process
    $serverid = $processInfo[ 'OWNING_SERVER' ];
    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $serverid );

/*********************************** STEP 7a **********************************/
    if( $serverInfo[ 'OWNER_ID' ] != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Cancelling a process for someone else = bad...for now.' );
    }

    $processes->deleteProcess( $processid, $serverid );

    echo "cancelledProcess($processid);";
}
/*********************************** STEP 8 ***********************************/
elseif( $action == 'startdelete' )
{
    $programid = $_REQUEST[ 'PROGRAM_ID' ];
    $programs = new Programs();
    $programInfo = $programs->getProgramByID( $programid );
    $serverid = $programInfo[ 'SERVER_ID' ];

    $servers = new Servers();
    $serverInfo = $servers->getServerByID( $serverid );
    $serverOwner = $serverInfo[ 'OWNER_ID' ];
/*********************************** STEP 8a **********************************/
    if( $serverOwner != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Can\'t delete stuff for other people yet.' );
    }

    $processes = new Processes();
    $serverProcesses = $processes->getProcessesByProgram( $programid );
/*********************************** STEP 8b **********************************/
    if( !empty( $serverProcesses ) )
    {
        ahdie( 'Can\'t delete stuff that has processes running against it.' );
    }

/*********************************** STEP 8c **********************************/
    $completionTime = $programInfo[ 'SIZE' ];
    $processid = $processes->addProcess( $programid, $serverid,
            DEFAULT_DELETION_CPU, DEFAULT_DELETION_RAM, 0, PROCESS_OP_DELETE,
            "NOW()+$completionTime" );

    $result = $processes->getProcessByID( $processid );
    $remainingCycles = $result[ 'CYCLES_REMAINING' ];
    echo "startedDeletion($programid,$processid,$remainingCycles);";
}
elseif( $action == 'exchangeprograms' )
{
    $programid = $_REQUEST[ 'PROGRAM_ID' ];

    $programs = new Programs();
    $servers = new Servers();
    $programInfo = $programs->getProgramOwnerAndServerByID( $programid );
    $userid = $programInfo[ 'USER_ID' ];
    $serverid = $programInfo[ 'SERVER_ID' ];
    $version = $programInfo[ 'VERSION' ];

/*********************************** STEP 5a **********************************/
    if( $userid != $_SESSION[ 'ID' ] )
    {
        ahdie( 'Exchanging programs for other people are we?' );
    }

    $cpuUp = $_REQUEST[ 'CPU_UP' ];
    $ramUp = $_REQUEST[ 'RAM_UP' ];
    $hddUp = $_REQUEST[ 'HDD_UP' ];
    $bwUp = $_REQUEST[ 'BW_UP' ];

    if( $cpuUp + $ramUp + $hddUp + $bwUp != $version - 1 )
    {
        ahdie( 'Upgrading something other than that file.' );
    }

    $servers->adjustAllStats( $serverid, $cpuUp, $ramUp, $hddUp, $bwUp );
    $programs->deleteProgram( $programid, $serverid );

    echo( "exchangedProgram($programid,$cpuUp,$ramUp,$hddUp,$bwUp);" );
}

// Update the processes and the server accordingly
if( isset( $servers ) && isset( $processes ) )
{
    $modifiedServers = $processes->getModifiedServers();
    if( !empty( $modifiedServers ) )
    {
        $infos = $servers->getCPUInfoForServers( $modifiedServers );
        $onlyUpdate = array();
        foreach( $infos as $serverInfo )
        {
            $updateArray = $processes->calculateServerRatio( $serverInfo[ 'ID' ],
                                         $serverInfo[ 'CPU' ] );
            $servers->updateCPUInfo( $serverInfo[ 'ID' ], $updateArray );
            $lastUpdateTime = $processes->getLastUpdateTime();
            echo( "lastServerUpdateTime($lastUpdateTime);" );
        }
    }
}

?>