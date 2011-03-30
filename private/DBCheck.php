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

$version[ 0 ] = "CREATE TABLE `SYSTEM` ( \n" .
                "`DUMMY_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`VERSION` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`DUMMY_ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 1 ] = "DROP TABLE IF EXISTS USERS, SERVERS";
$version[ 2 ] = "CREATE TABLE `USERS` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`NICK` varchar(20) NOT NULL,\n" .
                "`PASSWORD` varchar(40) NOT NULL,\n" .
                "`EMAIL` varchar(40) NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
$version[ 3 ] = "CREATE TABLE `SERVERS` (\n" .
                "`ID` int(10) unsigned NOT NULL AUTO_INCREMENT,\n" .
                "`OWNER_ID` int(10) unsigned NOT NULL,\n" .
                "`IP` int(10) unsigned NOT NULL,\n" .
                "`CPU` int(10) unsigned NOT NULL,\n" .
                "`RAM` int(10) unsigned NOT NULL,\n" .
                "`HDD` int(10) unsigned NOT NULL,\n" .
                "`BANDWIDTH` int(10) unsigned NOT NULL,\n" .
                "PRIMARY KEY (`ID`)\n" .
                ") ENGINE = MyISAM DEFAULT CHARSET=latin1";

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
    if( $row[ 0 ] == 'SYSTEM' )
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
        mysql_die( 'Failed to get version with system table available.' );
    }

    $row = mysql_fetch_row( $versionResult );
    if( !$row )
    {
        $startVersion = 0;
    }
    else
    {
        $startVersion = $row[ 0 ];
    }
}

/*********************************** STEP 3 ***********************************/
$rowCount = count( $version );
$actualVersion = $startVersion;

for( $i = $startVersion; $i < $rowCount; $i++, $actualVersion++ )
{
    $query = $version[ $i ];
    $result = mysql_query( $query );

    if( !$result )
    {
        echo "Failed to perform query: $query";
        break;
    }
}

/*********************************** STEP 4 ***********************************/
$result = mysql_query( "INSERT INTO SYSTEM VALUES( 1, $actualVersion ) " .
                       "ON DUPLICATE KEY UPDATE VERSION=$actualVersion" );

if( !$result )
{
    die( 'Failed to update system at end.' );
}

echo( "UPDATE SUCCESSFUL!!! Updated from $startVersion to $actualVersion." );

?>