// Initialize the window
createWindow( "Admin" );
// Call our temp cache function whenever ajax is done
$("body").ajaxComplete( function(){admin_viewTempCache();} );
// Make sure window.prototype is setup properly
prepareThis();
// Set the window close callback to the temp cache function
this.prototype.cbs[ "windowclose" ] = function(){admin_viewTempCache();};

// Now add the glorified menu button for admin functions
addMenuButton( "Admin", "ui-icon-star", function(){
    // Basic tab layout for admin functions
    var w = getPopupContext( "Admin" );
    w.html( "<div id='admintabs'><ul>" +
              "<li><a href='#admintab-Tables'>Tables</a></li>" +
              "<li><a href='#admintab-Run_SQL'>Run SQL</a></li>" +
              "<li><a href='#admintab-Temp_Cache'>View Temp Cache</a></li>" +
              "<li><a href='#admintab-Mx'>Maintenance</a></li>" + 
            "</ul>" +
            "<div id='admintab-Tables'></div>" +
            "<div id='admintab-Run_SQL'></div>" +
            "<div id='admintab-Temp_Cache'></div>" +
            "<div id='admintab-Mx'></div>" +
            "</div>" );
    
    // Setup the actual tabs
    $('#admintabs').tabs({
        select: function(event, ui){
            var panel = $(ui.panel);
            switch( ui.index )
            {
                case 0:
                    panel.html( "" );
                    doAjax( "a_gettables" );
                    break;
                case 1:
                    break;
                case 2:
                    panel.html( "" );
                    admin_viewTempCache( true );
            }
            return true;
        },
        create: function(event, ui){
            doAjax( "a_gettables" );
            return true;
        },
        idPrefix: "admintab-"
    });
    
    // Stylize the tabs a little better
    $("#admintabs li a").css( "padding", "0.2em" );
    
    // The SQL tab only deals directly with user input and thus does not
    // need to be updated ever, set it up now
    var sqltab = $("#admintab-Run_SQL");
    sqltab.append( "Select:<br>" ).
      append("<input type='text' id='admin_selectsql' style='width:100%'>").
      append($("<div>Select</div>").
        click(function(){
            doAjax( "a_runsqlselect", {
                SQL: $("#admin_selectsql").val()
            });
        }).button()
      ).
      append("<br><br>").
      append("<input type='text' id='admin_othersql' style='width:100%'>").
      append($("<div>Insert/Update/Delete</div>").
        click(function(){
            doAjax( "a_runsqlother", {
                SQL: $("#admin_othersql").val()
            });
        }).button()
      )
      .append("<br><br>Result:<div id='admin_sqlresult'></div>");
      
    // This is the options for the Maintenance Tab
    var mxtab = $("#admintab-Mx");
    mxtab.append( "<div id='adminmx-status'>&nbsp;</div>" );
    mxtab.append( "CSS & JS Cache: " ).append(
      $("<div>Clear</div>").
        click(function(){
          // a workaround for a flaw in the demo system
          // (http://dev.jqueryui.com/ticket/4375), ignore!
          $( "#dialog:ui-dialog" ).dialog( "destroy" );

          $("body").append('<div id="dialog-confirm" ' +
            'title="Do you wish to clear the CSS and JS Cache?"><p>These ' +
            'items will be permanently deleted and cannot be recovered. ' +
            'Are you sure?</p></div>');

          $( "#dialog-confirm" ).dialog({
              resizable: false,
              height:165,
              width:360,
              modal: true,
              buttons: {
                "Delete all items": function() {
                    doAjax( "a_runcssjsclear" );
                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
          });
        }).button()
    );
    mxtab.append( "<br />Comma delimited list of modules to disable:" );
    mxtab.append( "<input type='text' id='a_disablemodules' size='20'>" );
    $("<button></button>").button({
        label: "Disable Modules"
    }).appendTo( mxtab ).click(function(){
        doAjax( "a_disablemodules", {
            MODULES: $("#a_disablemodules").val()
        });
    });
    mxtab.append( "<br />Possible values: " + getDefault( "ALL_MODULES" ) );

    resizePopup( "Admin" );  
});

/**
 * Sets up the admin view for an SQL SELECT statement.  Set error if an error
 * occurred otherwise both headers and table are assumed to be set.
 * 
 * @param headers Headers for the table
 * @param table Values for the table
 * @param error Set if an error occurred
 */
function admin_selectSQLResult( headers, table, error )
{
    var result = $("#admin_sqlresult");
    if( error != undefined )
    {
        result.html( error );
    }
    else
    {
        result.html( "" );
        result.append( makeSortableTable( headers, table, "admin-sql" ) );
    }
}

/**
 * Sets up the admin view for a SQL INSERT/UPDATE/DELETE statement.  Set error
 * if an error occurred otherwise modified is assumed to be set.
 * 
 * @param modified Number of rows that were affected
 * @param error String describing what went wrong (typically a MySQL error)
 */
function admin_otherSQLResult( modified, error )
{
    var result = $("#admin_sqlresult");
    if( error != undefined )
    {
        result.html( error );
    }
    else
    {
        result.html( modified + " rows were affected." );
    }
}

/**
 * Provides a generic accordion view for all of the tables in the database
 * @param tablenames An array with all of the table names
 */
function admin_addTables( tablenames )
{
    // Set up the container div
    var txt = "<div id='admintableaccordion'>";
    for( var i = 0; i < tablenames.length; i++ )
    {
        // Each table has to be inside a h5 element
        var tablename = tablenames[ i ].toLowerCase();
        txt += "<h5><a href='#'>" + tablename.toCamelCase() +
               "</a></h5><div id='admin_tbl" + tablename + "'></div>";
    }
    txt += "</div>";
    
    // Add the container div to the view
    $("#admintab-Tables").append( txt );
    
    // Prepare it as an accordion, update whenever a view is selected,
    // start off initially closed
    $("#admintableaccordion").accordion({
        active: false,
        change: function(event,ui){
            var text = ui.newHeader.text().toLowerCase();
            if( text == "" )
            {
                return;
            }
            doAjax( "a_gettable", {
                TABLE: text
            });
            tempCache( "currentAccordionView", text, "Admin-Tables" );
        },
        collapsible: true,
        clearStyle: true
    });
}

/**
 * View a specific table in the admin view.  The current view is set in the
 * currentAccordionView temp cache variable.  Pull from it to know where to
 * put the resulting table.
 * 
 * @param values Values to populate the table with
 */
function admin_tableView( values )
{
    // The headers are the first row, shift them off
    var headers = values.shift();
    
    // Get the view and reset it
    var view = $("#admin_tbl" + getTempCache( "currentAccordionView" ) );
    view.html( "" );
    
    // Simply add the sortable table to the accordion view and resize the view
    view.append( makeSortableTable( headers, values, "admin-table", function(){
        $("#admintableaccordion").accordion( "resize" );
    }));
    $("#admintableaccordion").accordion( "resize" );
}

/**
 * Call when there are no values in the table to view.
 */
function admin_noTableView()
{
    var view = $("#admin_tbl" + getTempCache( "currentAccordionView" ) );
    view.html( "No values." );
}

/**
 * Function that causes an update of the temp cache table.  Since the temp cache
 * is used frequently this function is called after every AJAX command has
 * finished and whenever a window closes.  If the view is visible then the table
 * will be updated.  The table consists of the key/value/clearRegion for all of
 * the temp cache variables excluding the ones required to setup the temp cache.
 * 
 * @param force Force the temp cache table to be regenerated
 */
function admin_viewTempCache( force )
{
    // Check if the tab is even visible, if it isn't and force is not set then
    // abort
    var obj = $("#admintab-Temp_Cache");
    if( obj.length != 1 || obj.css( 'display' ) == 'none' && !force )
    {
        return;
    }
    
    // Clear the previous values and sort for the table
    tempCache( "admin-tempcache-values", "", "Admin-TempCache" );
    tempCache( "admin-tempcache-lastsort", "", "Admin-TempCache" );
    
    // Create our own array of cache values that consists of the
    // key/value/clearRegion.
    var cacheValues = [];
    for( var ind in this.prototype.cacheValues )
    {
        // Ignore temp cache variables with admin-tempcache in them
        if( ind.indexOf( "admin-tempcache" ) == -1 )
        {
            cacheValues.push( [ ind, this.prototype.cacheValues[ ind ],
                                this.prototype.clearRegions[ ind ] ] );
        }
    }
    
    // Reset the view to a sortable table with the array that was just
    // generated.  Ensure the popup is visible appropriately.
    obj.children().remove();
    obj.append( makeSortableTable( ["Name", "Value", "Region"],
        cacheValues, "admin-tempcache" ));
    resizePopup( "Admin" );
}

function admin_setMaintenanceStatus( txt )
{
    $('#adminmx-status').html( txt ).addClass( "ui-state-highlight" )
      .addClass( "ui-corner-all" );
}