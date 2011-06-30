<?php

require_once( 'MySQLObject.php' );

class UserDisabledModules extends MySQLObject
{
    /**
     * Gets the list of columns this MySQL table contains
     * 
     * @return array Array of [USER_ID,MODULE_NAME,DISABLE_TIME]
     */
    protected function getColumns()
    {
        return array( 'USER_ID', 'MODULE_NAME', 'DISABLE_TIME' );
    }
    
    /**
     * Gets the name of the table
     * 
     * @return string Name of the table (USER_DISABLED_MODULES)
     */
    protected function getTableName()
    {
        return 'USER_DISABLED_MODULES';
    }
    
    /**
     * Gets all of the disabled modules for a user
     * 
     * @param int $userid User ID that is being queried for
     * @return array 2D array of [MODULE_NAME,DISABLE_TIME]
     */
    public function getDisabledModules( $userid )
    {
        return $this->get( array( 'USER_ID' => $userid ), NULL, 0,
                           array( 'MODULE_NAME', 'DISABLE_TIME' ) );
    }
    
    /**
     * Disables a list of modules for a specified user
     * 
     * @param int $userid User ID that wants to disable the modules
     * @param array $modules Array of modules to disable
     * @return int Number of modules disabled
     */
    public function disableModules( $userid, $modules )
    {
        // Insert each value as upper case
        $values = array();
        foreach( $modules as $module )
        {
            array_push( $values, array( $userid, '"' . strtoupper( $module ) .
                        '"', time()));
        }
        $this->insert( $values, array( 'DISABLE_TIME' => time() ) );
        return count( $modules );
    }
    
    /**
     * Enables a list of modules for a specified user
     * 
     * @param int $userid User ID that wants to enable the modules
     * @param array $modules Array of modules to enable
     * @return int Number of modules enabled
     */
    public function enableModules( $userid, $modules )
    {
        // Convert every value to upper case
        foreach( $modules as $key => &$value )
        {
            $value = '"' . strtoupper( $value ) . '"';
        }
        // Then delete the values
        return $this->delete( array( 'USER_ID' => $userid,
                                     'MODULE_NAME' => $modules ) );
    }
}
?>