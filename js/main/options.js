/**
 * Sets up the window and start menu button for options.  When the start menu
 * button is clicked, @see requestOptions is called.
 */
function initOptions()
{
    // Create the options window/menu button
    createWindow( "Options" );
    addMenuButton( "Options", "ui-icon-gear", requestOptions );
}

/**
 * Queries the server to request the options for the current user.
 * @see opt_modules
 */
function requestOptions()
{
    doAjax( "opt_request" );
}

/**
 * Called to populate the modules that are enabled/disabled.  The list of
 * enabled modules are avaiable as an array of strings in the first parameter.
 * Each disabled module is an array containing the name of the module along with
 * the time (int) the module was disabled.
 * 
 * @see requestOptions
 * @param enabled Array of modules that are enabled (strings)
 * @param disabled Array of modules that are disabled (array(name,time))
 */
function opt_modules( enabled, disabled )
{
    var w = getPopupContext( "Options" );
    var module, obj, i, timedisabled;
    w.html( "" ).append( "<h1>Modules</h1>" );
    for( i in enabled )
    {
        module = enabled[ i ];
        obj = createModuleRow( module, true );
        w.append( obj );
        w.append( "<br />" );
    }
    for( i in disabled )
    {
        module = disabled[ i ][ 0 ];
        timedisabled = disabled[ i ][ 1 ];
        obj = createModuleRow( module, false, timedisabled );
        w.append( obj );
        w.append( "<br />" );
    }
    w.append(
      $("<button>Submit Changes</button>").css({
          "float": "right"
      }).click(function(){
            var radios = getCheckedModules();
            var nenabled = new Array();
            var ndisabled = new Array();
            radios.each(function(){
                var nstatus = $(this).attr( "value" );
                var name = $(this).attr( "name" );
                if( getTempCache( name + "-enabled" ) != nstatus )
                {
                    tempCache( name + "-enabled", nstatus, "Modules" );
                    var module = name.slice( name.indexOf( '-' ) + 1 );
                    if( nstatus == "enabled" )
                    {
                        $(this).siblings('input').removeAttr( "title" );
                        nenabled.push( module );
                    }
                    else
                    {
                        $(this).attr( "title", "Disabled now." );
                        eval( "disableModule" + module + "();" );
                        ndisabled.push( module );
                    }
                }
            });
            if( nenabled.length )
            {
                doAjax( "opt_enablemodules", {
                    MODULES: nenabled.join( "," )
                });
            }
            if( ndisabled.length )
            {
                doAjax( "opt_disablemodules", {
                    MODULES: ndisabled.join( "," )
                });
            }
        }).attr( "id", "opt-module-submit" ).button()
    ).append(
        "<div id='opt-modulesenabled-status'></div>" +
        "<div id='opt-modulesdisabled-status'></div>"
    );
    $("#opt-modulesdisabled-status, #opt-modulesenabled-status").css({
        "visibility": "hidden",
        "display": "inline"
    }).addClass( "ui-state-highlight ui-corner-all" );
    checkModuleSubmitChanges();
}

/**
 * Creates a DOM element based on whether a module is enabled.  Also sets a
 * temp cache entry based on whether the module is enabled.  The returned
 * DOM element will consist of a left aligned element that contains the name of
 * the module.  It will also have two radio buttons for choosing enabled or
 * disabled that are right aligned.
 * 
 * @param name Name of the module
 * @param enabled Whether the module is enabled
 * @param timedisabled If the module is disabled, the time it was disabled
 * @return DOM element for dis/enabling the module
 */
function createModuleRow( name, enabled, timedisabled )
{
    tempCache( "opt-" + name + "-enabled", enabled ? "enabled" : "disabled",
               "Modules" );
    return $("<div></div>").append(
      $("<div></div>").append( name.toCamelCase() ).css( "float", "left" )
    ).append(
      $( "<input type='radio' />" ).css( "float", "right" )
        .attr({
            "id": "opt-" + name + "-enabled",
            "name": "opt-" + name,
            "checked": enabled ? "checked" : undefined,
            "value": "enabled"
        }).change(function(){checkModuleSubmitChanges();})
    ).append(
      $( "<label>Enabled</label>").attr( "for", "opt-" + name + "-enabled" )
        .css( "float", "right" )
    ).append(
      $( "<input type='radio' />" ).css( "float", "right" )
        .attr({
            "id": "opt-" + name + "-disabled",
            "name": "opt-" + name,
            "checked": enabled ? undefined : "checked",
            "title": enabled ? undefined : "Disabled " +
                intToTimeString( ( Date.now() / 1000 ) - timedisabled ) +
                " ago.",
            "value": "disabled"
        }).change(function(){checkModuleSubmitChanges();})
    ).append(
      $( "<label>Disabled</label>").attr( "for", "opt-" + name + "-disabled")
        .css( "float", "right" )
    );
}

/**
 * Gets a jQuery object with all of the radio options that are chacked
 * 
 * @return jQuery object of checked radio options
 */
function getCheckedModules()
{
    return $("#Options input[type='radio']" ).filter( ":checked" );
}

/**
 * Checks if the module "Submit Changes" button should be enabled/disabled. Each
 * of the modules has a temp cache associated with it that defines whether it is
 * enabled or not.  If any of the temp cache values do not match
 */
function checkModuleSubmitChanges()
{
    var radios = getCheckedModules();
    var changed = false;
    radios.each(function(){
        if( getTempCache( $(this).attr( "name" ) + "-enabled" ) !=
            $(this).attr( "value" ) )
        {
            changed = true;
            return false;
        }
        return true;
    });
    if( changed )
    {
        $("#opt-module-submit").button( "enable" );
    }
    else
    {
        $("#opt-module-submit").button( "disable" );
    }
}

/**
 * Called when the server has reported that certain modules have been enabled.
 * 
 * @param count The number of modules enabled
 */
function enabledModules( count )
{
    $("#opt-modulesenabled-status").html( count + " modules enabled.<br />" )
      .css( "visibility", "visible" ).fadeIn( ).delay( 2000 ).fadeOut( "slow" )
      .queue(function(){
          $(this).css( "visibility", "hidden" );
          $(this).dequeue();
      });
    checkModuleSubmitChanges();
}

/**
 * Called when the server has reported that certain modules have been disabled.
 * 
 * @param count The number of modules disabled
 */
function disabledModules( count )
{
    $("#opt-modulesdisabled-status").html( count + " modules disabled.<br />" )
      .css( "visibility", "visible" ).fadeIn( ).delay( 2000 ).fadeOut( "slow" )
      .queue(function(){
          $(this).css( "visibility", "hidden" );
          $(this).dequeue();
      });
    checkModuleSubmitChanges();
}