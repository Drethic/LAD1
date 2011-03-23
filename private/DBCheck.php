<?php

/**
 * Basic concept: Check all MySQL databases
 *
 * 1. Setup how we want the tables to look
 * 2. Check each table individually
 * 2a. Pull the table names
 * 2b. Check just the names
 * 2c. Create tables that are needed
 * 2d. Drop tables that are not
 * 3. Check each table's validity
 * 3a. Pull each table's create definition
 * 3b. Recreate table if definition is invalid
 */

// Initialize some variables
$dbName = 'lad';
$dbUsername = 'lad';

/*********************************** STEP 1 ***********************************/
// Special note on the expected table, each of the keys contains the name of the
// table, and the value contains how to create the table. Example:
// CREATE TABLE key( value );
// The value is also an array so we can carefully handle each column, tricky eh
require_once 'users.php';

$expectedTables = array();

// Add users to the list
$users = new Users();
$expectedTables[ $users->getTableName() ] = $users->getTableCreator();

$possiblyInvalidTables = $expectedTables;

/*********************************** STEP 2 ***********************************/
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

/*********************************** STEP 2a **********************************/
// Perform actual query to find out what tables MySQL has
$allTables = mysql_query( "SHOW TABLES FROM $dbName" );

if( !$allTables )
{
   die( 'Failed to show tables.' . mysql_error() );
}

// Actually pull out each row which only has the name of the table
// We set the value to 1 for fun, and the index to the name of the table
// See below for the key intersection
while( $row = mysql_fetch_row( $allTables ) )
{
   $foundTables[ $row[0] ] = 1;
}

/*********************************** STEP 2b **********************************/
// Calculate the intersection so we know which keys match up with each other
$intersectingTables = array_intersect_key( $expectedTables, $foundTables );

// Echo out some headers
// We don't use HTML because this is typically a script and rarely run
echo "***DB Check***\n\n";

// Echo out each expected table
echo "Expected Tables\n";

foreach( $expectedTables as $expectedTable => $columns )
{
   echo "-$expectedTable\n";
}

// Then echo out each found table
echo "\nFound Tables\n";

foreach( $foundTables as $foundTable => $columns )
{
   echo "-$foundTable\n";
}

// Now start the modifications cell
echo "\nModifications\n";

// First, check if we can simply skip iterating by comparing the counts of
// the expected with the intersection and the found with the intersection
if( count( $expectedTables == count( $intersectingTables ) ) &&
   count( $foundTables == count( $intersectingTables ) ) )
{
   echo "Tables match.  No modifications required!\n";
}
else
{
/*********************************** STEP 2c **********************************/
   // Check each table we were expecting for missing ones
   foreach( $expectedTables as $expectedTable => $insertSQL )
   {
       if( !key_exists( $expectedTable, $foundTables ) )
       {
           // Found a missing one...create it
           mysql_query( $insertSQL ) or
               die( 'Couldn\'t create table.' . mysql_error() );

           // And tell the user we created it
           echo "Created table $expectedTable.\n";

           // Since we just created this table, we know it's valid
           unset( $possiblyInvalidTables[ $expectedTable ] );
       }
   }

/*********************************** STEP 2d **********************************/
   // Check each table we found for table we weren't expecting
   foreach( $foundTables as $foundTable )
   {
       if( !key_exists( $foundTable, $expectedTables ) )
       {
           // Found an extra one...just delete it
           mysql_query( "DROP TABLE $foundTable" ) or
               die( 'Couldn\'t drop table.' . mysql_error() );

           // And tell the user we dropped it
           echo "Dropped table $foundTable.\n";
       }
   }
}

/*********************************** STEP 3 ***********************************/

// Alright, now we know that we have every table that we want
// Now we have to check the integrity of each
// Iterate over each table, and pull the create table command
foreach( $possibleInvalidTables as $possiblyInvalidTable => $insertSQL )
{
/*********************************** STEP 3a **********************************/
   $result = mysql_query( "SHOW CREATE TABLE $possiblyInvalidTable" );

   if( !$result )
   {
       die( 'Couldn\'t pull table creation command.' . mysql_error() );
   }

   echo "\nChecking table $possiblyInvalidTable...";

   $row = mysql_fetch_row( $result );
   $createdSQL = $row[ 1 ];

   // createdSQL is now the DB create command and insertSQL is ours
   // Cleanup the whitespace of both then compare line by line
   $insertSplit = explode( "\n", $insertSQL );
   $createSplit = explode( "\n", $createdSQL );

   $valid = true;
   for( $i = 0; $i < count( $insertSplit ); $i++ )
   {
       if( trim( $insertSplit[ $i ] ) != trim( $createSplit[ $i ] ) )
       {
/*********************************** STEP 3b **********************************/
           // Discrepancies existed, drop then recreate the table
           echo "recreating due to discrepancies...";

           mysql_query( "DROP TABLE $possiblyInvalidTable" ) or
               die( 'Couldn\'t drop table.' . mysql_error() );

           mysql_query( $insertSQL ) or
               die( 'Couldn\'t recreate table.' . mysql_error() );

           $valid = false;
           break;
       }
   }
   if( $valid )
   {
       echo "OK!";
   }
}

// Finally close the HTML up
echo "\n***DB Check Complete!***\n";

?>