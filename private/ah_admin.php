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
    
    require_once( "MySQLObject.php" );
    
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
?>
