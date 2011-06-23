<?php

require_once( 'MySQLObject.php' );

/**
 * Class for managing the solved_math DB table.  Provides various functions for
 * selecting results based on various criteria along with inserting new
 * values based on a user ID, the difficulty and the number accomplished.
 */
class SolvedMath extends MySQLObject
{
    /**
     * Gets the columns for the solved_math table
     * @return array Column names
     */
    function getColumns()
    {
        return array( 'USER_ID', 'DIFFICULTY', 'DATE_ACCOMPLISHED',
                      'HOUR_ACCOMPLISHED', 'COUNT' );
    }
    
    /**
     * Gets the name of the table
     * @return string 'SOLVED_MATH'
     */
    function getTableName()
    {
        return 'SOLVED_MATH';
    }
    
    /**
     * Adds the number of solved problems performed by the user.
     * 
     * @param int $userid User ID that performed the problems
     * @param int $difficulty Difficulty of the problems
     * @param int $count   Number of problems completed
     * @return int Affected rows
     */
    function addSolved( $userid, $difficulty, $count )
    {
        // YYYYMMDD format - 20101231
        $day = intval( date( 'Ymd' ) );
        // Two digit hour format
        $hour = intval( date( 'H' ) );
        
        // Either insert a new entry or add to the current hour's entry
        $r = $this->insert( array( $userid, $difficulty, $day, $hour, $count ),
                            array( 'COUNT' => "COUNT+$count") );
        
        return $r;
    }
    
    /**
     * Gets the number of solved problems for a specific user.  Will return rows
     * grouped by either hour or day depending on parameter.
     * 
     * @param int $userid User ID that performed the problems
     * @param boolean $groupday Set to true to group by day rather than day/hour
     * @return array 2D array of all the problems categorized by hour
     */
    function getAllProblemsByUser( $userid, $groupday = false )
    {
        $columns = NULL;
        $groupby = NULL;
        if( $groupday )
        {
            $columns = array( 'USER_ID', 'DIFFICULTY', 'DATE_ACCOMPLISHED',
                              'SUM(COUNT) AS COUNT' );
            $groupby = array( 'DATE_ACCOMPLISHED', 'DIFFICULTY' );
        }
        return $this->get( array( 'USER_ID' => $userid ), NULL, 0,
                           $columns, 0, $groupby );
    }
    
    /**
     * Gets the sum of all the problems solved for each difficulty based on a
     * given user ID.
     * 
     * @param int $userid User ID that performed the problems
     * @return array 2D array of [DIFFICULTY,COUNT] grouped by DIFFICULTY
     */
    function getProblemsByUser( $userid )
    {
        return $this->get( array( 'USER_ID' => $userid ),
                           NULL,
                           0,
                           array( 'DIFFICULTY',
                                  'IFNULL(SUM(COUNT),0) AS COUNT' ),
                           0,
                           array( 'DIFFICULTY' ) );
    }
    
    /**
     * Gets the sum of all the problems solved for each difficulty.  If the
     * optional parameter is set then the return array has the USER_ID column
     * at the front.
     * 
     * @param boolean $groupByUser Set to true to also group by user ID
     * @return array 2D array of [DIFFICULTY,COUNT] grouped by DIFFICULTY
     */
    function getProblems( $groupByUser = false )
    {
        // Set up default group/return columns
        $columns = array( 'DIFFICULTY', 'IFNULL(SUM(COUNT),0) AS COUNT' );
        $groups = array( 'DIFFICULTY' );
        
        // Add user to group/return columns if the parameter is set
        if( $groupByUser )
        {
            array_unshift( $columns, 'USER_ID' );
            array_unshift( $groups, 'USER_ID' );
        }
        
        return $this->get( NULL, NULL, 0, $columns, 0, $groups ); 
    }
    
    /**
     * Groups all problems on difficulty, date and hour performed.  If the
     * optional parameter is set then the array is also grouped on userid,
     * which simply sorts the entire table.
     * 
     * @param boolean $groupByUser Set to true to group by user
     * @return array 2D array of [DATE,HOUR,DIFFICULTY,COUNT]
     */
    function getAllProblems( $groupByUser = false )
    {
        if( $groupByUser )
        {
            return $this->get( NULL, array( 'USER_ID' => 'ASC',
                                            'DATE_ACCOMPLISHED' => 'ASC',
                                            'HOUR_ACCOMPLISHED' => 'ASC' ) );
        }
        
        $groups = array( 'DATE_ACCOMPLISHED', 'HOUR_ACCOMPLISHED',
                         'DIFFICULTY' );
        $columns = array( 'DATE_ACCOMPLISHED AS DATE',
                          'HOUR_ACCOMPLISHED AS HOUR', 'DIFFICULTY',
                          'IFNULL(SUM(COUNT),0) AS COUNT' );
        
        return $this->get( NULL, NULL, 0, $columns, 0, $groups );
    }
    
    /**
     * Groups all problems on difficulty and optionally by user.  Filters based
     * on the given day.  Day is in internal format 'YYYYMMDD'.
     * 
     * @param string/int $day Day to filter on
     * @param boolean $groupByUser Results should be grouped by user.
     * @return array 2D array of [DIFFICULTY,COUNT]
     */
    function getProblemsByDay( $day, $groupByUser = false )
    {
        $filter = array( 'DATE_ACCOMPLISHED' => $day );
        $groups = array( 'DIFFICULTY' );
        $columns = array( 'DIFFICULTY', 'IFNULL(SUM(COUNT),0) AS COUNT');
        if( $groupByUser )
        {
            array_unshift( $groups, 'USER_ID' );
            array_unshift( $columns, 'USER_ID' );
        }
        
        return $this->get( $filter, NULL, 0, $columns, 0, $groups );
    }
}
?>
