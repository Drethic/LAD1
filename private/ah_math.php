<?php

/**
 * @file ah_math.php
 *
 * Basic concept: Handle math related ajax commands
 *
 * Handled actions:
 *  nextmathquestion: Gets the next math question (optionally answers previous)
 */

require_once( 'solvedmath.php' );

/**
 * Gets a set number of random numbers between 0 and a maximum.  Ensures that at
 * least one of the values is equal to the maximum
 * 
 * @param int $max Maximum number to get from
 * @param int $remaining Remaining number of operands
 * @param boolean $highestFound Whether the highest number has been found
 * @return array All the operands to use
 */
function getRandomOperands( $max, $count )
{
    $ret = array();
    $foundMax = false;
    for( $i = 0; $i < $count; $i++ )
    {
        if( !$foundMax )
        {
            $remaining = $max - $i;
            $findMax = rand( 1, $remaining ) == $remaining;
            if( $findMax )
            {
                $foundMax = true;
                $ret[] = $max;
            }
            else
            {
                $ret[] = rand( 1, $max - 1 );
            }
        }
        else
        {
            $next = rand( 1, $max );
            if( $next == $max )
            {
                $foundMax = true;
            }
            $ret[] = $next;
        }
    }
    return $ret;
}

/**
 * Converts an integer to a string representation of a math operand
 * 
 * @param int $val Value to convert
 * @return int Resulting string
 */
function intToMathOperand( $val )
{
    switch( $val )
    {
        case MATH_DIFF_ADD:
            return '+';
        case MATH_DIFF_SUB:
            return '-';
        case MATH_DIFF_MULT:
            return '*';
        case MATH_DIFF_DIV:
            return '/';
    }
    return '';
}

if( $action == 'nextmathquestion' )
{
    // Session vars used:
    //  NEXT_ANSWER: The correct answer that should come in next
    //  NEXT_DIFF: The calculated difficulty for the next answer
    // If the user is answering the previous question, check if it is correct
    if( isset( $_SESSION[ 'NEXT_ANSWER' ] ) &&
        isset( $_REQUEST[ 'LAST_ANSWER' ] ) )
    {
        $nextAnswer = $_SESSION[ 'NEXT_ANSWER' ];
        $lastAnswer = $_REQUEST[ 'LAST_ANSWER' ];
        
        if( $nextAnswer == $lastAnswer )
        {
            echo( 'correctMathAnswer();' );
            // Also update the DB saying that the user got one
            
        }
        else
        {
            echo( "incorrectMathAnswer(\"$nextAnswer\");" );
        }
    }
    
    // Set up some variables
    $difficulty = $_REQUEST[ 'DIFFICULTY' ];
    $modifiers = $_REQUEST[ 'MODIFIERS' ];
    // Modifiers come from user in a comma delimited string
    $modifierArray = split( ',', $modifiers );
    
    // Each of the modifiers affects the difficulty, figure out which ones
    // the user wants to use
    $extraOperands = 0;
    $extraPrecision = 0;
    $useNegative = false;
    $useFractions = false;
    $useDecimals = false;
    foreach( $modifierArray as $modifier )
    {
        if( strpos( $modifier, 'negative' ) !== false )
        {
            // Allow negative values
            $useNegative = true;
        }
        elseif( strpos( $modifier, 'fraction' ) !== false )
        {
            // Allow fractions
            $useFractions = true;
        }
        elseif( strpos( $modifier, 'decimal' ) !== false )
        {
            // Allow decimals
            $useDecimals = true;
        }
        elseif( strpos( $modifier, 'extraprecision' ) !== false )
        {
            // Extra precision (for answers)
            $offset = strpos( '=', $modifier ) + 1;
            $extraPrecision = intval( substr( $modifier, $offset ) );
        }
        elseif( strpos( $modifier, 'extraoperand' ) !== false )
        {
            // Extra operands
            $offset = strpos( '=', $modifier ) + 1;
            $extraOperand = intval( substr( $modifier, $offset ) );
        }
    }
    
    // Now all of the data from what the user wants is available, time to turn
    // it into an actual usable string
    // Generate some random operands...ensuring we get at least one of the max
    $operandCount = 1 + $extraOperands;
    $operands = getRandomOperands( $difficulty, $operandCount );
    
    // Generate some random values
    $maxValue = pow( 10, 1 + $extraPrecision );
    $valueCount = $operandCount + 1;
    
    $values = array();
    for( $i = 0; $i < $valueCount; $i++ )
    {
        $values[] = rand( 1, $maxValue );
    }
    
    // Compile the values/strings into a string
    $output = '';
    for( $i = 0; $i < $operandCount; $i++ )
    {
        $output .= $values[ $i ] . ' ' . $operands[ $i ] . ' ';
    }
    $output .= $values[ $operandCount ];
    
    // Just eval it so we can get the answer
    eval( "\$nextAnswer=$output;" );
    $_SESSION[ 'NEXT_ANSWER' ] = $nextAnswer;
    
    // Now generate some random answers
    // We do this by starting off with the correct answer, then deviate by
    // 10-20% in either direction.  If the new value is the same as the previous
    // it is in/decremented.  Repeat 4 times and there's the random values.
    $bogusAnswers = array( $nextAnswer );
    $minAnswer = $maxAnswer = $nextAnswer;
    for( $i = 0; $i < 4; $i++ )
    {
        $deviation = rand( 10, 20 ) / 100;
        if( rand( 0, 1 ) )
        {
            $lastMin = $minAnswer;
            $minAnswer = round( $minAnswer + $deviation, $extraPrecision );
            if( $lastMin == $minAnswer )
            {
                $minAnswer--;
            }
            $bogusAnswers[] = $minAnswer;
        }
        else
        {
            $lastMax = $maxAnswer;
            $maxAnswer = round( $maxAnswer + $deviation, $extraPrecision );
            if( $lastMax == $maxAnswer )
            {
                $maxAnswer++;
            }
            $bogusAnswers[] = $maxAnswer;
        }
    }
    
    // Shuffle the answers a bit
    shuffle( $bogusAnswers );
    
    // Encode the otuput properly
    $output = mysql_real_escape_string( $output );
    
    // And echo!
    echo( "nextMathQuestion('$output',[" . join( ',', $bogusAnswers) . ']);' );
}
?>
