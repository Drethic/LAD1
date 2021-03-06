<?php

/**
 * Basic concept: Check all MySQL databases
 *
 * 1. Rebuild system table if needed
 * 2. Upgrade tables based on what level the system version is
 * 3. Update the system table
 */

/*********************************** STEP 1 ***********************************/
require_once 'defs.php';
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
$version[ 20 ] = "ALTER TABLE SERVERS MODIFY COLUMN `LAST_UPDATE_TIME` " .
                 "bigint unsigned NOT NULL";
$version[ 21 ] = "ALTER TABLE SERVERS ADD COLUMN `CUSTOM_NAME` varchar(15) " .
                 "NOT NULL AFTER `IP`";
$version[ 22 ] = "DROP TABLE IF EXISTS ERRORS";
$version[ 23 ] = "CREATE TABLE `ERRORS` (\n" .
                 "`ERROR_TIME` bigint unsigned NOT NULL,\n" .
                 "`DESCRIPTION` text NOT NULL,\n" .
                 "`POST_DATA` text NOT NULL,\n" .
                 "`SESSION_DATA` text NOT NULL,\n" .
                 "`IP` varchar(20) NOT NULL\n" .
                 ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 24 ] = "CREATE TABLE `SOLVED_MATH` (\n" .
                 "`USER_ID` int(10) unsigned NOT NULL,\n" .
                 "`DIFFICULTY` int(10) unsigned NOT NULL,\n" .
                 "`DATE_ACCOMPLISHED` int(10) unsigned NOT NULL,\n" .
                 "`HOUR_ACCOMPLISHED` int(10) unsigned NOT NULL,\n" .
                 "`COUNT` int(10) unsigned NOT NULL,\n" .
                 "PRIMARY KEY(USER_ID, DIFFICULTY, DATE_ACCOMPLISHED," .
                 "HOUR_ACCOMPLISHED)) ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 25 ] = "ALTER TABLE `SOLVED_MATH` ADD UNIQUE INDEX (USER_ID," .
                 "DIFFICULTY,DATE_ACCOMPLISHED,HOUR_ACCOMPLISHED)";
$version[ 26 ] = "ALTER TABLE PROGRAMS ADD COLUMN `CUSTOM_NAME` varchar(15) " .
                 "NOT NULL AFTER `SERVER_ID`";
$version[ 27 ] = "CREATE TABLE `USER_DISABLED_MODULES` (\n" .
                 "`USER_ID` int(10) unsigned NOT NULL,\n" .
                 "`MODULE_NAME` varchar(20) NOT NULL,\n" .
                 "`DISABLE_TIME` bigint unsigned NOT NULL\n," .
                 "UNIQUE KEY(USER_ID,MODULE_NAME)" .
                 ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 28 ] = "ALTER TABLE `USERS` ADD COLUMN `GATHERING_POINTS` bigint " .
                 "unsigned NOT NULL AFTER `EMAIL`";
$version[ 29 ] = "CREATE TABLE `ITEM_TYPES` (\n" .
                 "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                 "`NAME` varchar(20) NOT NULL,\n" .
                 "`DESCRIPTION` TEXT NOT NULL,\n" .
                 "`MIN_PROB` int(10) unsigned NOT NULL,\n" .
                 "`MAX_PROB` int(10) unsigned NOT NULL,\n" .
                 "PRIMARY KEY(`ID`)\n" .
                 ") ENGINE = MyISAM DEFAULT CHARSET=latin1";

// Perform actual query to find out what tables MySQL has
$allTablesResult = mysql_query( 'SHOW TABLES FROM ' . DB_NAME );

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