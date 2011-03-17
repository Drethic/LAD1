<?php

/**
 * Basic concept: Provides a low-level class for all MySQL objects
 *
 * Uses:
 *        get() : Gets values(2-D array) from DB based on parameters
 *     insert() : Adds values to DB
 *     delete() : Delete values in DB
 *     update() : Update values in DB
 *  getSingle() : Gets a single entry (1-D array) from DB by index
 *
 * Abstracts:
 *    getColumns() : Return an array with column names in the values
 *      getIndex() : Return an int with the column that is the index
 *  getTableName() : Return the table name
 *
 * Todo:
 *  Expand get to allow OR in the WHERE
 *  Expand get to allow arrays in the WHERE
 */

abstract class MySQLObject
{
   abstract protected function getColumns();
   abstract protected function getIndex();
   abstract protected function getTableName();

   // Filters = key/value for columnName/columnValue
   // Orders = key for each columnName, value is ASC/DESC
   // Limit = integer
   // excludeColumns = value for each columnName
   // All except limit expect an array
   // Offset = integer
   public function get( $filters = NULL, $orders = NULL, $limit = 0,
                        $excludeColumns = NULL, $offset = 0 )
   {
       $sql = 'SELECT ';
       // Only specific columns to pull
       if( !is_array( $excludeColumns ) )
       {
           $sql .= '* ';
       }
       else
       {
            $columns = array_diff( getColumns(), $excludeColumns );
            $sql .= implode( ', ', $columns ) . ' ';
       }

       // Table name
       $sql .= 'FROM `' . getTableName() . '` ';

       // Filters
       if( is_array( $filters ) )
       {
           $sql .= 'WHERE ';
           $filterKeys = array_keys( $filters );
           for( $i = 0; $i < count( $filters ); $i++ )
           {
               $filterKey = $filterKeys[ $i ];
               $sql .= "$filterKey={$filters[ $filterKey ]} ";
               if( $i < count( $filters ) - 1 )
               {
                   $sql .= 'AND ';
               }
           }
       }

       // Ordering
       if( is_array( $orders ) )
       {
           $sql .= 'ORDER BY ';
           $orderNames = array_keys( $orders );
           for( $i = 0; $i < count( $orders ); $i++ )
           {
               $orderName = $orderNames[ $i ];
               $sql .= "$orderName {$orders[ $orderName ]} ";
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
           die( 'MySQL Query Error: ' . mysql_error() );
       }

       $ret = array();
       while( $row = mysql_fetch_row( $result ) )
       {
           $ret[] = $row;
       }
       return $ret;
   }

   public function insert( $values )
   {
   }

   public function delete( $filters )
   {
   }

   public function update( $keys, $values )
   {
   }

   public function getSingle( $value )
   {
       $ret = get( array( getIndex() => $value ), NULL, 1 );
       return $ret[ 0 ];
   }
}

?>