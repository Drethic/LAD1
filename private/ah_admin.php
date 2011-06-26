<?php

/**
 * @file ah_server.php
 *
 * Basic concept: Handle admin related ajax commands
 *
 * Handled actions:
 *     a_gettables : Gets tables that are available
 *      a_gettable : Prints out a specific table
 *  a_runsqlselect : Executes a SQL select statement
 *   a_runsqlother : Executes a SQL insert/update/delete statement
 */

require_once( 'defs.php' );
require_once( 'MySQLObject.php' );

if( $action == 'a_gettables' )
{
    // Get the list of tables from the DB directly
    $allTables = MySQLObject::getCustom( 'SHOW TABLES' );
    
    // The result is a column that has to be changed to a row
    $count = count( $allTables );
    $row = array();
    $keys = array_keys( $allTables[ 0 ] );
    $key = $keys[ 0 ];
    
    for( $i = 0; $i < $count; $i++ )
    {
        $row[] = $allTables[ $i ][ $key ];
    }
    
    // Echo it out
    echo 'admin_addTables([' . cleanupRowForJS( $row ) . ']);';
}
elseif( $action == 'a_gettable' )
{
    $table = $_REQUEST[ 'TABLE' ];
    
    // Get all the entries
    $ret = MySqlObject::getAll( $table );
    
    // If there aren't any entries, skip adding headers
    if( !empty( $ret ) )
    {
        if( !isset( $ret[ 0 ] ) )
        {
            $ret = array( $ret );
        }
    
        // There are entries, add the headers
        $columns = array_keys( $ret[ 0 ] );
        array_unshift( $ret, $columns );
    }
    
    // Echo it out
    echo2DArray('admin_tableView', 'admin_noTableView', $ret );
}
elseif( $action == 'a_runsqlselect')
{
    // First thing first, run the SQL the admin wants
    MySQLObject::$dieOnFailure = false;
    $sql = $_REQUEST[ 'SQL' ];
    
    $ret = MySqlObject::getCustom( $sql );
    
    $err = mysql_real_escape_string( mysql_error() );
    
    $columns = array();
    
    // ret will be empty if there are no entries
    if( !empty( $ret ) )
    {
        // Just in case it managed to get an array of empty arrays
        if( !isset( $ret[ 0 ] ) )
        {
            $ret = array( $ret );
        }
    
        $columns = array_keys( $ret[ 0 ] );
    }
    
    // Check if there was an error
    if( $err == '' )
    {
        // Format the table for output
        echo( "admin_selectSQLResult([" . cleanupRowForJS( $columns ) . '],[' );
        for( $i = 0; $i < count( $ret ); $i++ )
        {
            echo( '[' . cleanupRowForJS( $ret[ $i ] ) . ']' );
            if( $i < count( $ret ) - 1 )
            {
                echo( ',' );
            }
        }
        echo( ']);' );
    }
    else
    {
        echo( "admin_selectSQLResult(undefined,undefined,\"$err\");" );
    }
}
elseif( $action == 'a_runsqlother')
{
    // Other SQL is a lot easier, run it
    MySQLObject::$dieOnFailure = false;
    $sql = $_REQUEST[ 'SQL' ];
    
    $ret = mysql_query( $sql );
    
    $err = mysql_real_escape_string( mysql_error() );
    $rows = mysql_affected_rows();
    
    // If there was an error, spit it out, otherwise print affected rows
    if( $err == '' )
    {
        echo( "admin_otherSQLResult($rows);" );
    }
    else
    {
        echo( "admin_otherSQLResult(undefined,\"$err\");" );
    }
}
elseif( $action == 'a_runcssjsclear' )
{
    deleteAll( 'js/cache', true );
    deleteAll( 'css/cache', true );
}

function deleteAll( $directory, $empty = false )
{
    if( substr( $directory, -1 ) == '/' )
    {
        $directory = substr( $directory, 0, -1 );
    }

    if( !file_exists( $directory ) || !is_dir( $directory ) ||
        !is_readable( $directory ) )
    {
        return false;
    }
    
    $directoryHandle = opendir( $directory );

    while( $contents = readdir( $directoryHandle ) )
    {
        if( $contents != '.' && $contents != '..' )
        {
            $path = "$directory/$contents";

            if( is_dir( $path ) )
            {
                deleteAll( $path );
            }
            else
            {
                unlink( $path );
            } 
        } 
    } 

    closedir( $directoryHandle ); 

    if( $empty == false )
    { 
        if( !rmdir( $directory ) )
        { 
            return false;
        }
    }

    return true;
}

?>
