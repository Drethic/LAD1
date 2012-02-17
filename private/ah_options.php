<?php

require_once( 'private/userdisabledmodules.php' );

if( $action == 'opt_request' )
{
    // User wants to know their options!  Life and death.
    $userid = $_SESSION[ 'ID' ];
    $allModules = opt_getValidModules();
    $userDisabledModules = new UserDisabledModules();
    
    // Get the disabled modules
    $disabledModules = $userDisabledModules->getDisabledModules( $userid );
    
    if( !isset( $disabledModules[ 0 ] ) && count( $disabledModules ) )
    {
        $disabledModules = array( $disabledModules );
    }
    
    $disabledModuleNames = array();
    $disabledModuleString = '';
    foreach( $disabledModules as $disabledModule )
    {
        $disabledModuleNames[] = $disabledModule[ 'MODULE_NAME' ];
        $disabledString = cleanupRowForJS( $disabledModule );
        $disabledModuleString .= "[$disabledString],";
    }
    $disabledModuleString = rtrim( $disabledModuleString, ',' );
    
    // Diff the disabled from all to get the enabled modules
    $enabledModules = array_diff( $allModules, $disabledModuleNames );
    
    echo 'opt_modules([' . cleanupRowForJS( $enabledModules ) . '],[' .
         $disabledModuleString . ']);';
}
elseif( $action == 'opt_disablemodules' )
{
    // User wants to disable some modules
    // Variables from the request variables
    $userid = $_SESSION[ 'ID' ];
    $moduleString = $_REQUEST[ 'MODULES' ];
    $moduleArray = explode( ',', $moduleString );
    
    // Die if the module array is empty
    if( empty( $moduleArray ) )
    {
        ahdie( 'Empty array for disabling modules.' );
    }
    
    $invalidModules = array_diff( $moduleArray, opt_getValidModules() );
    if( count( $invalidModules ) )
    {
        ahdie( "Invalid Modules:" . implode( ',', $invalidModules ) );
    }
    
    // Disable the modules
    $userDisabledModules = new UserDisabledModules();
    $disabled = $userDisabledModules->disableModules( $userid, $moduleArray );
    
    // Inform the user how many modules were disabled
    echo( "disabledModules($disabled);" );
}
elseif( $action == 'opt_enablemodules' )
{
    // User wants to enable some modules
    // Variables from the request variables
    $userid = $_SESSION[ 'ID' ];
    $moduleString = $_REQUEST[ 'MODULES' ];
    $moduleArray = explode( ',', $moduleString );
    
    // Die if the module array is empty
    if( empty( $moduleArray ) )
    {
        ahdie( 'Empty array for disabling modules.' );
    }
    
    // Enable the modules
    $userDisabledModules = new UserDisabledModules();
    $enabled = $userDisabledModules->enableModules( $userid, $moduleArray );
    
    // Get the list of valid modules
    $validModules = opt_getValidModules();
    
    // Inform the user how many modules were enabled
    echo( "enabledModules($enabled);" );
    foreach( $moduleArray as $module )
    {
        $base = strtolower( $module );
        $cssarray = $validModules[ $module ];
        if( !empty( $cssarray ) )
        {
            foreach( $cssarray as $csssheet )
            {
                echo( "addStylesheet('" .
                      clientfile_buildRequest( 'C', $csssheet ) . "');" );
            }
        }
        echo( "addScriptElement('" . clientfile_buildRequest( 'J', $base) .
              "');" );
    }
}

?>