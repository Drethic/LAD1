<?php

require_once( 'MySQLObject.php' );

class Errors extends MySQLObject
{
    function getColumns()
    {
        return array( 'ERROR_TIME', 'DESCRIPTION', 'POST_DATA', 'SESSION_DATA',
                      'IP' );
    }
    
    function getTableName()
    {
        return 'ERRORS';
    }
    
    function getAllErrors()
    {
        return $this->get();
    }
    
    function addError( $description )
    {
        $post = cleanupRowForJS( $_POST );
        $session = cleanupRowForJS( $_SESSION );
        $description = mysql_real_escape_string( $description );
        return $this->insert( 
                   array( 'NOW()',
                   "\"$description\"",
                   "\"$post\"",
                   "\"$session\"",
                   "\"{$_SERVER['REMOTE_ADDR']}\"" ) );
    }
}
?>
