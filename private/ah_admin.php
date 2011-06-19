<?php

/**
 * @file ah_server.php
 *
 * Basic concept: Handle admin related ajax commands
 *
 * 
 */

if( $action == 'a_gettables' )
{
    echo 'admin_addTables([' .
         cleanupRowForJS( array( 'errors', 'processes', 'programs', 'servers', 
                                 'users' ) ) .
         ']);';
}
elseif( $action == 'a_gettable' )
{
    $table = $_REQUEST[ 'TABLE' ];
    
    require_once( 'MySQLObject.php' );
    
    $ret = MySqlObject::getAll( $table );
    if( !empty( $ret ) )
    {
        if( !isset( $ret[ 0 ] ) )
        {
            $ret = array( $ret );
        }
    
        $columns = array_keys( $ret[ 0 ] );
        array_unshift( $ret, $columns );
    }
    
    echo2DArray('admin_tableView', 'admin_noTableView', $ret );
}
elseif( $action == 'a_runsqlselect')
{
    require_once( 'MySQLObject.php' );
    $sql = $_REQUEST[ 'SQL' ];
    
    $ret = MySqlObject::getCustom( $sql );
    
    $err = mysql_real_escape_string( mysql_error() );
    
    $columns = array();
    
    if( !empty( $ret ) )
    {
        if( !isset( $ret[ 0 ] ) )
        {
            $ret = array( $ret );
        }
    
        $columns = array_keys( $ret[ 0 ] );
    }
    
    if( $err == '' )
    {
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
    require_once( 'MySQLObject.php' );
    $sql = $_REQUEST[ 'SQL' ];
    
    $ret = mysql_query( $sql );
    
    $err = mysql_real_escape_string( mysql_error() );
    $rows = mysql_affected_rows();
    
    if( $err == '' )
    {
        echo( "admin_otherSQLResult($rows);" );
    }
    else
    {
        echo( "admin_otherSQLResult(undefined,\"$err\");" );
    }
}
?>
