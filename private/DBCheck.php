<?php

/**
 * Basic concept: Check all MySQL databases
 *
 * 1. Establish connection
 * 2. Rebuild system table if needed
 * 3. Upgrade tables based on what level the system version is
 * 4. Update the system table
 */

// Initialize some variables
$dbName = 'lad';
$dbUsername = 'lad';

/*********************************** STEP 1 ***********************************/
require_once 'users.php';

$version = array();

$version[ 0 ] = "DROP TABLE IF EXISTS SYSTEM";
$version[ 1 ] = "CREATE TABLE `SYSTEM` ( \n" .
                "`DUMMY_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`VERSION` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`DUMMY_ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 2 ] = "DROP TABLE IF EXISTS USERS, SERVERS";
$version[ 3 ] = "CREATE TABLE `USERS` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`NICK` varchar(20) NOT NULL,\n" .
                "`PASSWORD` varchar(40) NOT NULL,\n" .
                "`EMAIL` varchar(40) NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 4 ] = "CREATE TABLE `SERVERS` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`OWNER_ID` int(10) unsigned NOT NULL,\n" .
                "`IP` int(10) unsigned NOT NULL,\n" .
                "`CPU` int(10) unsigned NOT NULL,\n" .
                "`RAM` int(10) unsigned NOT NULL,\n" .
                "`HDD` int(10) unsigned NOT NULL,\n" .
                "`BANDWIDTH` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 5 ] = "DROP TABLE IF EXISTS PROGRAMS, PROCESSES";
$version[ 6 ] = "CREATE TABLE `PROGRAMS` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`SERVER_ID` int(10) unsigned NOT NULL,\n" .
                "`TYPE` int(10) unsigned NOT NULL,\n" .
                "`SIZE` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 7 ] = "CREATE TABLE `PROCESSES` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`TARGET_PROGRAM` int(10) unsigned NOT NULL,\n" .
                "`OWNING_SERVER` int(10) unsigned NOT NULL,\n" .
                "`CPU_USAGE` int(10) unsigned NOT NULL,\n" .
                "`RAM_USAGE` int(10) unsigned NOT NULL,\n" .
                "`BW_USAGE` int(10) unsigned NOT NULL,\n" .
                "`OPERATION` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 8 ] = "ALTER TABLE PROGRAMS ADD COLUMN `VERSION` int(10) unsigned " .
                "NOT NULL AFTER SIZE";
$version[ 9 ] = "ALTER TABLE PROCESSES ADD COLUMN `COMPLETION_TIME` " .
                "datetime NOT NULL AFTER `OPERATION`";
$version[ 10 ] = "ALTER TABLE PROCESSES ADD COLUMN `LINKED_ID` int(10) " .
                 "unsigned NOT NULL AFTER `COMPLETION_TIME`";
$version[ 11 ] = "ALTER TABLE PROCESSES MODIFY COLUMN `COMPLETION_TIME` " .
                 "bigint unsigned NOT NULL";
$version[ 12 ] = "ALTER TABLE USERS ADD COLUMN `FLAGS` bigint unsigned " .
                 "NOT NULL DEFAULT 0 AFTER `EMAIL`";
$version[ 13 ] = "ALTER TABLE USERS MODIFY COLUMN `PASSWORD` char(41) NOT NULL";
$version[ 14 ] = "UPDATE USERS SET `PASSWORD` = PASSWORD(`PASSWORD`)";
$version[ 15 ] = "ALTER TABLE SERVERS ADD COLUMN `LAST_UPDATE_TIME` datetime " .
                 "NOT NULL AFTER `BANDWIDTH`";
$version[ 16 ] = "ALTER TABLE SERVERS ADD COLUMN `OPERATING_RATIO` " .
                 "decimal(8,4) NOT NULL AFTER `LAST_UPDATE_TIME`";
$version[ 17 ] = "ALTER TABLE PROCESSES DROP COLUMN `COMPLETION_TIME`";
$version[ 18 ] = "ALTER TABLE PROCESSES ADD COLUMN `CYCLES_COMPLETED` " .
                 "bigint unsigned NOT NULL AFTER `LINKED_ID`";
$version[ 19 ] = "ALTER TABLE PROCESSES ADD COLUMN `CYCLES_REMAINING` " .
                 "bigint unsigned NOT NULL AFTER `CYCLES_COMPLETED`";

// Connect to MySQL
$sqlConnection = mysql_pconnect('localhost', $dbUsername);

if( !$sqlConnection )
{
    die( 'Failed to connect to MySQL.' . mysql_error() );
}

// Select Database
$dbSelection = mysql_select_db( $dbName );

if( !$dbSelection )
{
    die( 'Failed to select DB in MySQL.' . mysql_error() );
}

// Perform actual query to find out what tables MySQL has
$allTablesResult = mysql_query( "SHOW TABLES FROM $dbName" );

if( !$allTablesResult )
{
    die( 'Failed to show tables.' . mysql_error() );
}

// Actually pull out each row which only has the name of the table
// We set the value to 1 for fun, and the index to the name of the table
// See below for the key intersection
$foundSystem = false;
$allTables = array();
while( $row = mysql_fetch_row( $allTablesResult ) )
{
    $allTables[] = $row[ 0 ];
    if( strcasecmp( $row[ 0 ], 'system' ) == 0 )
    {
        $foundSystem = true;
        break;
    }
}

/*********************************** STEP 2 ***********************************/
if( !$foundSystem )
{
    $startVersion = 0;
}
else
{
    $versionResult = mysql_query( 'SELECT VERSION FROM SYSTEM' );

    if( !$versionResult )
    {
        die( 'Failed to get version with system table available.' );
    }

    $row = mysql_fetch_row( $versionResult );
    if( !is_array( $row ) )
    {
        $startVersion = 0;
        echo "Couldn't find a valid version, setting version to 0. ";
    }
    else
    {
        $startVersion = $row[ 0 ];
    }
}

/*********************************** STEP 3 ***********************************/
$rowCount = count( $version );
$actualVersion = $startVersion;

if( $rowCount == $actualVersion )
{
    die( "No update needed. Already at version $actualVersion." );
}

for( $i = $startVersion; $i < $rowCount; $i++, $actualVersion++ )
{
    $query = $version[ $i ];
    $result = mysql_query( $query );

    if( !$result )
    {
        echo "Failed to perform query: $query\n";
        echo mysql_error();
        break;
    }
}

/*********************************** STEP 4 ***********************************/
if( $actualVersion != $startVersion )
{
    $result = mysql_query( "INSERT INTO SYSTEM VALUES( 1, $actualVersion ) " .
                           "ON DUPLICATE KEY UPDATE VERSION=$actualVersion" );
}

if( !$result )
{
    die( 'Failed to update system at end.' );
}

echo( "UPDATE SUCCESSFUL!!! Updated from $startVersion to $actualVersion." );

?>