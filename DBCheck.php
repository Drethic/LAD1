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
 * 3a. Pull each table's columns
 * 3b. Create columns as needed
 * 3c. Delete columns as needed
 * 3d. Update columns as needed
 */

// Initialize some variables
$dbName = 'lad';
$dbUsername = 'lad';

/*********************************** STEP 1 ***********************************/
// Special note on the expected table, each of the keys contains the name of the
// table, and the value contains how to create the table. Example:
// CREATE TABLE key( value );
// The value is also an array so we can carefully handle each column, tricky eh
$expectedTables = array( 'USERS' =>
        array( 'ID' => 'INT PRIMARY KEY AUTO_INCREMENT',
               'NICK' => 'CHAR(20)',
               'PASSWORD' => 'CHAR(40)',
               'EMAIL' => 'CHAR(40)'
             ));
$possiblyInvalidTables = $expectedTables;

/*********************************** STEP 2 ***********************************/
// Connect to MySQL
$sqlConnection = mysql_connect('localhost', $dbUsername);

if( !$sqlConnection )
{
    die( 'Failed to connect to MySQL.' );
}

// Select Database
$dbSelection = mysql_select_db( $dbName );

if( !$dbSelection )
{
    die( 'Failed to select DB in MySQL.' );
}

/*********************************** STEP 2a **********************************/
// Perform actual query to find out what tables MySQL has
$allTables = mysql_query( "SHOW TABLES FROM $dbName" );

if( !$allTables )
{
    die( 'Failed to show tables.' );
}

$foundTables = array('USER' => 'a');

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
echo "<html><head><title>DB Check</title></head><body>";

// Echo out each expected table
echo "<table border=1><tr><td><h1>Expected Tables</h1><br>";

foreach( $expectedTables as $expectedTable => $columns )
{
    echo "$expectedTable<br>";
}

// Then echo out each found table
echo "</td><td><h1>Found Tables</h1><br>";

foreach( $foundTables as $foundTable => $columns )
{
    echo "$foundTable<br>";
}

// Now start the modifications cell
echo "</td><td><h1>Modifications</h1><br>";

// First, check if we can simply skip iterating by comparing the counts of
// the expected with the intersection and the found with the intersection
if( count( $expectedTables == count( $intersectingTables ) ) &&
    count( $foundTables == count( $intersectingTables ) ) )
{
    echo "Tables match.  No modifications required.";
}
else
{
/*********************************** STEP 2c **********************************/
    // Check each table we were expecting for missing ones
    foreach( $expectedTables as $expectedTable => $columns )
    {
        if( !key_exists( $expectedTable, $foundTables ) )
        {
            // Found a missing one...create it
            if( !mysql_query( "CREATE TABLE $expectedTable(" .
                    implode( ', ', $columns ) .
                    ")" ) )
            {
                die( 'Couldn\'t create table.' );
            }

            // And tell the user we created it
            echo "Created table $expectedTable.<br>";

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
            if( !mysql_query( "DROP TABLE $foundTable" ) )
            {
                die( 'Couldn\'t drop table.' );
            }

            // And tell the user we dropped it
            echo "Dropped table $foundTable.<br>";
        }
    }
}

// Alright, now we know that we have every table that we want
// Now we have to check the integrity of each

// And clean up the table
echo "</td></tr></table>";
// Finally close the HTML up
echo "</body></html>";
?>
