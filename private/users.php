<?php

/**
 * Basic concept: Interface to the User MySQL table
 *
 */

class Users extends MySQLObject
{
   function getColumns( )
   {
      return array( "ID", "NICK", "PASSWORD", "EMAIL" );
   }

   function getIndex( )
   {
      return 0;
   }

   function getTableName( )
   {
      return "USERS";
   }

   function getTableCreator( )
   {
      return "CREATE TABLE `USERS` (\n" .
             "`id` int unsigned NOT NULL AUTO_INCREMENT,\n" .
             "`NICK` varchar(20) NOT NULL,\n" .
             "`PASSWORD` varchar(40) NOT NULL,\n" .
             "`EMAIL` varchar(40) NOT NULL\n" .
             "PRIMARY KEY (ID)\n" .
             ") ENGINE = MyISAM DEFAULT CHARSET=latin1";
   }

   function addUser( $nick, $pass, $email )
   {
      return insert( array( "NULL", $nick, $pass, $email ) );
   }
}

?>
