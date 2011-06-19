// Initialize some stuffs
createWindow( "Admin" );
$("body").ajaxComplete( function(){admin_viewTempCache();} );
addMenuButton( "Admin", "ui-icon-star", function(){
    var w = getPopupContext( "Admin" );
    w.html( "<div id='admintabs'><ul>" +
              "<li><a href='#admintab-Tables'>Tables</a></li>" +
              "<li><a href='#admintab-Run_SQL'>Run SQL</a></li>" +
              "<li><a href='#admintab-Temp_Cache'>View Temp Cache</a></li>" +
            "</ul>" +
            "<div id='admintab-Tables'></div>" +
            "<div id='admintab-Run_SQL'></div>" +
            "<div id='admintab-Temp_Cache'></div>" +
            "</div>" );
    
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
});

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

function admin_addTables( tablenames )
{
    var txt = "<div id='admintableaccordion'>";
    for( var i = 0; i < tablenames.length; i++ )
    {
        var tablename = tablenames[ i ].toLowerCase();
        txt += "<h5><a href='#'>" + tablename.toCamelCase() +
               "</a></h5><div id='admin_tbl" + tablename + "'></div>";
    }
    txt += "</div>";
    $("#admintab-Tables").append( txt );
    $("#admintableaccordion").accordion({
        active: false,
        change: function(event,ui){
            var text = ui.newHeader.text().toLowerCase();
            doAjax( "a_gettable", {
                TABLE: text
            });
            tempCache( "currentAccordionView", text );
        },
        collapsible: true,
        clearStyle: true
    });
}

function admin_tableView( values )
{
    var headers = values.shift();
    var view = $("#admin_tbl" + getTempCache( "currentAccordionView" ) );
    view.html( "" );
    view.append( makeSortableTable( headers, values, "admin-table", function(){
        $("#admintableaccordion").accordion( "resize" );
    }));
    $("#admintableaccordion").accordion( "resize" );
}

function admin_noTableView()
{
    var view = $("#admin_tbl" + getTempCache( "currentAccordionView" ) );
    view.html( "No values." );
}

function admin_viewTempCache( force )
{
    var obj = $("#admintab-Temp_Cache");
    if( obj.length != 1 || obj.css( 'display' ) == 'none' && !force )
    {
        return;
    }
    tempCache( "admin-tempcache-values", "" );
    tempCache( "admin-tempcache-lastsort", "" );
    var cacheValues = [];
    for( var ind in this.prototype.cacheValues )
    {
        cacheValues.push( [ ind, this.prototype.cacheValues[ ind ] ] );
    }
    
    obj.children().remove();
    obj.append( makeSortableTable( ["Name", "Value"],
        cacheValues, "admin-tempcache", function(tbl){
            var children = tbl.find("td:contains('admin-tempcache')");
            var parent = children.parent();
            parent.remove();
    }));
    resizePopup( "Admin" );
}
