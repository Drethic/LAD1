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
 *
 * Abstracts:
 *       getColumns() : Return an array with column names in the values
 *         getIndex() : Return an int with the column that is the index
 *     getTableName() : Return the table name
 *
 * Todo:
 *  Expand get to allow OR in the WHERE
 */

abstract class MySQLObject
{
   abstract protected function getColumns();
   abstract protected function getIndex();
   abstract protected function getTableName();

   // Filters = key/value for columnName/columnValue
   // Orders = key for each columnName, value is ASC/DESC
   // Limit = integer
   // onlyColumns = value for each columnName
   // All except limit expect an array
   // Offset = integer
   public function get( $filters = NULL, $orders = NULL, $limit = 0,
                        $onlyColumns = NULL, $offset = 0 )
   {
       $sql = 'SELECT ';
       // Only specific columns to pull
       if( !is_array( $excludeColumns ) )
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

       // Ordering
       if( is_array( $orders ) && count( $orders ) > 0 )
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
           die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
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
      $sql = 'INSERT INTO ' . $this->getTableName() . ' VALUES(' .
             implode( ', ', $values ) . ')';

      $result = mysql_query( $sql );

      if( !$result )
      {
         die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
      }

      return mysql_insert_id();
   }

   public function delete( $filters )
   {
      $sql = 'DELETE FROM ' . $this->getTableName();

      $sql .= $this->arrayToFilterString( $filters );

      $result = mysql_query( $sql );

      if( !$result )
      {
         die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
      }

      return mysql_affected_rows();
   }

   public function update( $values, $conditions = NULL )
   {
      $sql = 'UPDATE ' . $this->getTableName() . ' SET ';
      $valueKeys = array_keys( $values );
      $conditionKeys = array_keys( $conditions );

      for( $i = 0; $i < count( $values ); $i++ )
      {
         $valueKey = $valueKeys[ $i ];
         $value = $values[ $valueKey ];
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
         die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
      }

      return mysql_affected_rows();
   }

   public function getSingle( $value )
   {
       $columns = $this->getColumns();
       $index = $this->getIndex();
       $columnStr = $columns[ $index ];
       $ret = $this->get( array( $columnStr => $value ), NULL, 1 );
       if( count( $ret ) == 0 )
       {
           return false;
       }
       return $ret[ 0 ];
   }

   protected function escapifyString( $input )
   {
       return "'" . mysql_real_escape_string( $input ) . "'";
   }

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
           die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
       }

       $ret = array();
       while( $row = mysql_fetch_row( $result ) )
       {
           $ret[] = $row[ 0 ];
       }

       return $ret;
   }

   protected function getCustom( $sql )
   {
       $result = mysql_query( $sql );

       if( !$result )
       {
           die( 'MySQL Query Error: ' . mysql_error() . "\n$sql" );
       }

       $ret = array();
       while( $row = mysql_fetch_row( $result ) )
       {
           if( count( $row ) == 1 )
           {
               $ret[] = $row[ 0 ];
           }
           else
           {
               $ret[] = $row;
           }
       }

       if( count( $ret ) == 1 )
       {
           $ret = $ret[ 0 ];
       }
       return $ret;
   }

   private function arrayToFilterString( $filters )
   {
       // Filters
       if( is_array( $filters ) && count( $filters ) > 0 )
       {
           $sql = ' WHERE ';
           $filterKeys = array_keys( $filters );
           for( $i = 0; $i < count( $filters ); $i++ )
           {
               $filterKey = $filterKeys[ $i ];
               $filter = $filters[ $filterKey ];

               if( is_array( $filter ) )
               {
                   $sql .= "$filterKey IN (" . implode( ',', $filter) . ") ";
               }
               else
               {
                   $sql .= "$filterKey=$filter ";
               }
               if( $i < count( $filters ) - 1 )
               {
                   $sql .= 'AND ';
               }
           }
           return $sql;
       }
       return '';
   }

   protected function adjustSingleByID( $id, $field, $amount )
   {
       $columns = $this->getColumns();
       $index = $this->getIndex();
       $indexStr = $columns[ $index ];
       return $this->update( array( $field => "$field+$amount" ),
                             array( $indexStr => $id ) );
   }
}

?>