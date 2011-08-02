<?php

class Crafting
{
    private $cellX = 0;
    private $cellY = 0;
    private $cellUser = 0;
    private $cellItemCount = 0;
    private $cellHitChance = 0;
    private $maxItemProbability = 0;
    
    private function getItemCountOnMap( $bit )
    {
        return getHighestBit( $bit, 1 );
    }
    private function seedOnCellMap( )
    {
        srand( $this->cellX + ( $this->cellY * 256 * 256 ) +
               pow( $this->cellUser, 3 ) );
    }
    private function calculateHitChance( $bit )
    {
        $value = $bit >> 4 % 256;
        $value = intval( $value / 2 );
        return min( 100, MINIMUM_CRAFT_FIND + $value );
    }
    private function getMaxItemProbabilityValue()
    {
        $ret = MySQLObject::getCustom( 'SELECT MAX(MAX_PROB) AS PROB FROM ' .
                                       'ITEM_TYPES' );
        return $ret[ 'PROB' ];
    }
    public function getTableName( )
    {
        return 'ITEM_TYPES';
    }
    public function getColumns()
    {
        return array( 'ID', 'NAME', 'DESCRIPTION', 'MIN_PROB', 'MAX_PROB' );
    }
    public function getItemsOnMap( $x, $y, $userid )
    {
        $this->cellX = $x;
        $this->cellY = $y;
        $this->cellUser = $userid;
        $this->seedOnCellMap( );
        $bit = rand( 1, 256 * 256 );
        $this->cellItemCount = $this->getItemCountOnMap( $bit );
        $this->cellHitChance = $this->calculateHitChance( $bit );
        $this->maxItemProbability = $this->getMaxItemProbabilityValue();
        
        $sql = '';
        for( $i = 0; $i < $this->cellItemCount; $i++ )
        {
            $itemid = rand( 1, $this->maxItemProbability );
            if( $sql != '' )
            {
                $sql .= ' OR';
            }
            $sql .= " (MIN_PROB > $itemid AND MAX_PROB < $itemid)";
        }
        $sql = "SELECT * FROM ITEM_TYPES WHERE $sql ORDER BY MIN_PROB";
        $result = MySQLObject::getCustom( $sql );
        return $result;
    }
    public function getItemTypeCount()
    {
        $ret = MySQLObject::getCustom( 'SELECT COUNT(ID) AS COUNT FROM ' .
                                       'ITEM_TYPES' );
        return $ret[ 'COUNT' ];
    }
}
?>