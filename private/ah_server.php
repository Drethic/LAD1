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
 *    finishresearch = User wants to finish a research that is running
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
 * 6. User wants to finish a research
 * 6a. Make sure research belong to server user owns
 * 6b. Make sure it is actually a research process
 * 6c. Make sure no circumstances have happened to cause the server to not be
 *     able to hold the research
 * 6d. Finish up the research and grant the version
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
    if( !isset( $_REQUEST[ 'SERVER_ID' ] ) )
    {
        ahdie( 'No server ID to view...makes sense.' );
    }

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
}
/*********************************** STEP 4 ***********************************/
elseif( $action == 'freeprograms' )
{
    if( !isset( $_REQUEST[ 'SERVER_ID' ] ) )
    {
        ahdie( 'No server to get free programs for.' );
    }

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
    // Cool trick here, since there's 4 critical programs we can handle both
    // no programs and less than 4 at same time
    if( count( $serverPrograms ) > 4 )
    {
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
    }

    // Alright, the person is eligible!
    $id1 = $programs->addProgram( $serverid, PROGRAM_TYPE_FIREWALL,
                                  FIREWALL_SIZE, 1 );
    $id2 = $programs->addProgram( $serverid, PROGRAM_TYPE_FIREWALLBREAKER,
                                  FIREWALLBREAKER_SIZE, 1 );
    $id3 = $programs->addProgram( $serverid, PROGRAM_TYPE_PASSWORD,
                                  PASSWORD_SIZE, 1 );
    $id4 = $programs->addProgram( $serverid, PROGRAM_TYPE_PASSWORDBREAKER,
                                  PASSWORDBREAKER_SIZE, 1 );

    // And now we tell the user
    echo "grantedFreePrograms($id1,$id2,$id3,$id4);";
}
/*********************************** STEP 5 ***********************************/
elseif( $action == 'startresearch' )
{
    if( !isset( $_REQUEST[ 'PROGRAM_ID' ] ) )
    {
        ahdie( 'Research with no program ID?' );
    }

    $programid = $_REQUEST[ 'PROGRAM_ID' ];

    $programs = new Programs();
    $servers = new Servers();
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

    $maxHDD = $serverInfo[ 'HDD' ];

    $usedHDD = $programs->getServerUsage( $serverid );

    $fileSize = getProgramSize( $programtype );

/*********************************** STEP 5b **********************************/
    if( $fileSize + $usedHDD > $maxHDD )
    {
        echo( 'notEnoughFileSpace();' );
    }
    else
    {
        // Get all the processes that will increase the HDD usage on the server
        $processes = new Processes();
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
            // Alright, the user can research it
            $t = DEFAULT_RESEARCH_TIME;
            $researchid = $processes->addProcess( $programid, $serverid,
                    DEFAULT_RESEARCH_CPU, DEFAULT_RESEARCH_RAM, 0,
                    PROCESS_OP_RESEARCH, "NOW()+$t" );
            $result = $processes->getProcessByID( $researchid );
            $etic = $result[ 'COMPLETION_TIME' ];
            echo( "startedResearch($programid,$researchid,$etic);" );
        }
    }
}
/*********************************** STEP 6 ***********************************/
elseif( $action == 'finishresearch' )
{
    if( !isset( $_REQUEST[ 'PROCESS_ID' ] ) )
    {
        ahdie( 'Finishing...nothing...what...' );
    }

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
        ahdie( 'Finishing research for someone else = bad.' );
    }

    // Look up the current HDD usage
    $programid = $processInfo[ 'TARGET_PROGRAM' ];
    $programs = new Programs();
    $programInfo = $programs->getProgramByID( $programid );
    $usedHDD = $programs->getServerUsage( $serverid );
    $maxHDD = $serverInfo[ 'HDD' ];

/*********************************** STEP 6b **********************************/
    if( $processInfo[ 'OPERATION' ] != PROCESS_OP_RESEARCH )
    {
        ahdie( 'Trying to research a non-research operation.' );
    }
    $programtype = $programInfo[ 'TYPE' ];
    $fileSize = getProgramSize( $programtype );

/*********************************** STEP 6c **********************************/
    if( $fileSize + $usedHDD > $maxHDD )
    {
        echo( 'notEnoughFileSpace();' );
    }
    else
    {
/*********************************** STEP 6d **********************************/
        $processes->deleteProcess( $processid );
        $programs->upgradeProgram( $programid, $programtype );

        echo "finishedResearch($processid);";
    }
}
?>