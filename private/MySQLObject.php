<?php

/**
 * Basic concept: Provides a low-level class for all MySQL objects
 *
 * Uses:
 *                  get() : Gets values(2-D array) from DB based on parameters
 *               insert() : Adds values to DB
 *               delete() : Delete values in DB
 *               update() : Update values in DB
 *            getSingle() : Gets a single entry (1-D array) from DB by index
 *  getMinimizedCreator() : Gets the creator in a minimized format
 *      minimizeCreator() : Minimizes the input parameter to compress it
 *       escapifyString() : Escapes a string for use in the DB
 *        getOnlyColumn() : Gets signle column(1-D array) based on parameters
 *       getTypedResult() : Extracts rows from a result with proper types set
 *
 * Abstracts:
 *       getColumns() : Return an array with column names in the values
 *     getTableName() : Return the table name
 *
 * Todo:
 *  Expand get to allow OR in the WHERE
 */
abstract class MySQLObject
{

    /**
     * Overload to provide low level with all of the columns
     * @return array Names for each column
     */
    abstract protected function getColumns();

    /**
     * Overload to provide low level with the name of the table
     * @return string Table name
     */
    abstract protected function getTableName();

    /**
     * Determines if SQL statements should die on failure
     */
    public static $dieOnFailure = True;

    /**
     * Simplifies performing a SELECT statement
     * 
     * @param array $filters key/value for column name/value
     * @param array $orders key for each column, value is ASC or DESC
     * @param int $limit Integer to limit the number of results
     * @param array $onlyColumns Set for only specific column, NULL means *
     * @param int $offset Integer to offset the results by
     * @param array $groupby Array of values to group on
     * @return array @see getTypedResult
     */
    public function get( $filters = NULL, $orders = NULL, $limit = 0,
                         $onlyColumns = NULL, $offset = 0, $groupby = NULL )
    {
        $sql = 'SELECT ';
        // Only specific columns to pull
        if( !is_array( $onlyColumns ) )
        {
            $sql .= '* ';
        }
        else
        {
            $sql .= implode( ', ', $onlyColumns ) . ' ';
        }

        // Table name
        $sql .= 'FROM `' . $this->getTableName() . '` ';

        // Filters
        $sql .= $this->arrayToFilterString( $filters );

        // Grouping
        if( is_array( $groupby ) )
        {
            $sql .= 'GROUP BY ' . implode( ', ', $groupby ) . ' ';
        }
        
        // Ordering
        if( is_array( $orders ) && count( $orders ) > 0 )
        {
            $sql .= 'ORDER BY ';
            $orderNames = array_keys( $orders );
            for( $i = 0; $i < count( $orders ); $i++ )
            {
                $orderName = $orderNames[$i];
                $sql .= "$orderName {$orders[$orderName]} ";
                if( $i < count( $orders ) - 1 )
                {
                    $sql .= ', ';
                }
            }
        }

        // Offset/Limit
        if( $limit || $offset )
        {
            $sql .= "LIMIT $offset";
            if( $limit > 0 )
            {
                $sql .= ", $limit";
            }
        }

        // SQL statement is done, run it!
        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array( );
        }

        return $this->getTypedResult( $result );
    }

    /**
     * Simplifies performing an INSERT statement.
     * Values are not checked for consistency, instead an error will be thrown
     * if the insert fails. An optional parameter exists that allows for a
     * 'ON DUPLICATE KEY UPDATE' clause to be appended to the INSERT clause.
     * If the parameter is set then the UPDATE clause is populated by the
     * key/value pairs from the parameter.
     * 
     * @param array $values The values to insert
     * @param array $duplicatepairs If set, will fill ON DUPLICATE KEY UPDATE
     * @return int The last insert ID
     */
    public function insert( $values, $duplicatepairs = NULL )
    {
        // Build the statement
        $sql = 'INSERT INTO ' . $this->getTableName() . ' VALUES(' .
                implode( ', ', $values ) . ')';
        
        // Check if UPDATE clause requested
        if( is_array( $duplicatepairs ) && count( $duplicatepairs ) )
        {
            $sql .= ' ON DUPLICATE KEY UPDATE ' .
                    $this->createPairString( $duplicatepairs, ',' );
        }

        // Execute the query
        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array();
        }

        return mysql_insert_id();
    }

    /**
     * Simplifies performing a DELETE statement
     * @param array $filters Uses @see arrayToFilterString, NULL is *bad*
     * @return int Number of rows deleted
     */
    public function delete( $filters )
    {
        $sql = 'DELETE FROM ' . $this->getTableName();

        $sql .= $this->arrayToFilterString( $filters );

        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array( );
        }

        return mysql_affected_rows();
    }

    /**
     * Simplifies performing an UPDATE statement
     * @param array $values The key/values to update (strings must be escaped)
     * @param array $conditions The filter (@see arrayToFilterString)
     * @return int Number of rows affected
     */
    public function update( $values, $conditions = NULL )
    {
        $sql = 'UPDATE ' . $this->getTableName() . ' SET ';
        $valueKeys = array_keys( $values );
        $conditionKeys = array_keys( $conditions );

        // Build the update sequence
        for( $i = 0; $i < count( $values ); $i++ )
        {
            $valueKey = $valueKeys[$i];
            $value = $values[$valueKey];
            $sql .= "$valueKey=$value ";
            if( $i < count( $values ) - 1 )
            {
                $sql .= ', ';
            }
        }

        // Add conditions
        $sql .= $this->arrayToFilterString( $conditions );

        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array( );
        }

        return mysql_affected_rows();
    }

    /**
     * Utilizes @see getColumns to get a row based on the first column.
     * 
     * @param int $value The ID in the first column to search for
     * @return array The row with the ID in the first column
     */
    public function getSingle( $value )
    {
        $columns = $this->getColumns();
        $columnStr = $columns[0];
        $ret = $this->get( array( $columnStr => $value ), NULL, 1 );
        if( count( $ret ) == 0 )
        {
            return false;
        }
        return $ret[0];
    }

    /**
     * Transforms a string into a MySQL friendly string
     * 
     * @param string $input String to escapify
     * @return string Escapified string (includes quotes 'input')
     */
    protected function escapifyString( $input )
    {
        return "'" . mysql_real_escape_string( $input ) . "'";
    }

    /**
     * Gets only a single column from the table
     * 
     * @param string $columnName Name of the column to retrieve from the table
     * @param string $order ASC or DESC
     * @param int $limit Limit the number of results, 0 for no limit
     * @param array $filters The key/values to filter on
     * @return array Single array with each column's value
     */
    public function getOnlyColumn( $columnName, $order = 'DESC', $limit = 0,
                                   $filters = NULL )
    {
        $sql = "SELECT `$columnName` from `" . $this->getTableName() . '` ';

        // Add filters
        $sql .= $this->arrayToFilterString( $filters );

        // Add ordering
        $sql .= " ORDER BY `$columnName` ";
        if( $order == 'ASC' )
        {
            $sql .= $order;
        }
        else
        {
            $sql .= 'DESC';
        }

        if( $limit > 0 )
        {
            $sql .= " LIMIT $limit";
        }

        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array();
        }

        $ret = array( );
        while( $row = mysql_fetch_assoc( $result ) )
        {
            $ret[] = $row[0];
        }

        return $ret;
    }

    /**
     * Performs a custom SQL statement
     * 
     * @param string $sql Query to perform
     * @return array Piped through @see getTypedResult
     */
    public static function getCustom( $sql )
    {
        $result = mysql_query( $sql );

        if( !$result )
        {
            if( MySQLObject::$dieOnFailure )
            {
                die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
            }
            return array();
        }

        $ret = MySQLObject::getTypedResult( $result );

        if( count( $ret ) == 1 )
        {
            $ret = $ret[0];
        }
        return $ret;
    }

    /**
     * Converts an array of filters into a string.  Takes a key/value array as
     * input and returns a WHERE key=value clause.  Accepts arrays as values
     * and appropriately converts clause to key IN (values...).
     * 
     * @param array $filters Key/values to filter on
     * @return string WHERE clause or empty string
     */
    private function arrayToFilterString( $filters )
    {
        // Filters
        if( is_array( $filters ) && count( $filters ) > 0 )
        {
            return ' WHERE ' . $this->createPairString( $filters, 'AND', true );
        }
        return '';
    }
    
    /** 
     * Converts an array of key/value pairs into a string.  Takes a key/value
     * arrary as input and returns a key=value clause.  If key IN(values...) is
     * required set the second parameter to non-NULL.
     * 
     * @param array $pairs Key/values to populate string with
     * @param string $delimiter Delimiter to go between each pair
     * @param boolean $parseIn Set to true to parse key IN(values...)
     * @return string Constructed clause
     */
    private function createPairString( $pairs, $delimiter, $parseIn = NULL )
    {
        $sql = '';
        // Make sure $pairs is a valid array or just return blank
        if( is_array( $pairs ) && count( $pairs ) > 0 )
        {
            // Extract the keys for easier use then iterate over the array
            $pairKeys = array_keys( $pairs );
            for( $i = 0; $i < count( $pairs ); $i++ )
            {
                // Get the key and the value
                $pairKey = $pairKeys[ $i ];
                $pair = $pairs[ $pairKey ];

                // If the sub key is an array and parseIn is set to true, then
                // add a IN() clause, otherwise skip it
                if( is_array( $pair ) )
                {
                    if( $parseIn )
                    {
                        $imploded = implode( ',', $pair );
                        $sql .= "$pairKey IN (" . join( ',', $pair ) . ') ';
                    }
                }
                else
                {
                    $sql .= "$pairKey=$pair ";
                }
                // Add a comma if this isn't the last element
                if( $i < count( $pairs ) - 1 )
                {
                    $sql .= "$delimiter ";
                }
            }
            return $sql;
        }
        return '';
    }

    /**
     * Adjusts a single values based on its rows' ID.
     * @param int $id The value to search for in the first column
     * @param string $field The field to update
     * @param int $amount The amount to increase the field's value by
     * @return array @see update
     */
    protected function adjustSingleByID( $id, $field, $amount )
    {
        $columns = $this->getColumns();
        $indexStr = $columns[0];
        return $this->update( array( $field => "$field+$amount" ),
                              array( $indexStr => $id ) );
    }

    /**
     * Gets all values from a table
     * 
     * @param string $tableName The name of the table to retrieve
     * @return array @see getCustom
     */
    public static function getAll( $tableName )
    {
        return MySQLObject::getCustom( "SELECT * FROM `$tableName`" );
    }

    /**
     * Utility function to return an array properly formatted as a JS string
     * 
     * @param string $tableName The name of the table to retreive
     * @return string [[values...],...]
     */
    public static function getAllAsJS( $tableName )
    {
        // Set up some basic variables
        $arr = MySQLObject::getAll( $tableName );
        $ret = '[';
        $rcount = count( $arr );
        // Iterate over every row in the array
        for( $r = 0; $r < $rcount; $r++ )
        {
            // The current row
            $row = $arr[$r];
            $ret .= '[';
            $ccount = count( $row );
            
            // The keys for the current row (this shouldn't change...)
            $keys = array_keys( $row );
            
            // Iterate over every column
            for( $c = 0; $c < $ccount; $c++ )
            {
                // If it's a string, enclose it in quotes otherwise append it
                $column = $row[$keys[$c]];
                if( is_string( $column ) )
                {
                    $ret .= "'$column'";
                }
                else
                {
                    $ret .= $column;
                }
                
                // Add a comma if its not the last column
                if( $c < $ccount - 1 )
                {
                    $ret .= ',';
                }
            }
            // Close the row and add a comma if its not the last row
            $ret .= ']';
            if( $r < $rcount - 1 )
            {
                $ret .= ',';
            }
        }
        // Close the array and return
        $ret .= ']';
        return $ret;
    }

    /**
     * Ensures that each result is the proper type before returning it.
     * Checks the table to make sure floats and ints are properly converted
     * to such rather than returning them as strings.
     * 
     * @param object $result The row of MySQL data to work with
     * @return array Array of properly typed results
     */
    public static function getTypedResult( $result )
    {
        $ret = array( );
        $columnInfo = array( );
        $columns = mysql_num_fields( $result );
        // Iterate over every column and determine if it's a string
        for( $i = 0; $i < $columns; $i++ )
        {
            $rowInfo = mysql_fetch_field( $result );
            if( !$rowInfo->blob )
            {
                $columnInfo[$rowInfo->name] = $rowInfo->type;
            }
        }
        // Iterate over the mysql result and fetch each row
        while( $row = mysql_fetch_assoc( $result ) )
        {
            foreach( $columnInfo as $colIndex => $colValue )
            {
                // If the row is an int or datetime convert it to an integer
                // Or if its a float convert it to a float
                if( $colValue == 'int' || $colValue == 'datetime' )
                {
                    $row[$colIndex] = intval( $row[$colIndex] );
                }
                else if( $colValue == 'real' )
                {
                    $row[$colIndex] = floatval( $row[$colIndex] );
                }
            }
            // Add the row to the resulting array
            $ret[] = $row;
        }
        return $ret;
    }

}

?>