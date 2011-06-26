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
        $post = cleanupRowForJS( $_REQUEST );
        $post = mysql_real_escape_string( $post );
        $len = count( $_SESSION );
        $sessKeys = array_keys( $_SESSION );
        $sess = '[';
        for( $i = 0; $i < $len; $i++ )
        {
            $sess .= '"' . $sessKeys[ $i ];
            $sess .= '" => "' . $_SESSION[ $sessKeys[ $i ] ];
            $sess .= '"    ';
        }
        $sess .= ']';
        $sess = mysql_real_escape_string( $sess );
        $description = mysql_real_escape_string( $description );
        return $this->insert( 
                   array( 'NOW()',
                   "\"$description\"",
                   "\"$post\"",
                   "\"$sess\"",
                   "\"{$_SERVER['REMOTE_ADDR']}\"" ) );
    }
}
?>
