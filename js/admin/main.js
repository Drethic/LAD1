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
            $(ui.panel).html( "" );
            switch( ui.index )
            {
                case 0:
                    doAjax( "a_gettables" );
                    break;
                case 2:
                    admin_viewTempCache();
            }
            return true;
        },
        create: function(event, ui){
            doAjax( "a_gettables" );
            return true;
        },
        idPrefix: "admintab-"
    });
});

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
    view.append( makeSortableTable( headers, values, "admin-table", function(){
        $("#admintableaccordion").accordion( "resize" );
    }));
    $("#admintableaccordion").accordion( "resize" );
    /*
    tempCache( "admin-tablevalues", stringify( values ) );
    var text = "<table style='font-size:10px'>";
    for( var i = 0; i < values.length; i++ )
    {
        var row = values[ i ];
        var cName = 'primaryRow';
        if( ( i - 1 ) % 2 == 0 )
        {
            cName = 'alternateRow';
        }
        text += "<tr class='" + cName + "'>";
        for( var j = 0; j < row.length; j++ )
        {
            var open = "<td>", close = "</td>";
            if( i == 0 )
            {
                open = "<th style='font-size:12px;cursor:pointer'>";
                close = "</th>";
            }
            text += open + row[ j ] + close;
        }
        text += "</tr>";
    }
    text += "</table>";
    view.html( text );
    view.find( "th" ).each(function(index,elem){
        $(this).click(function(){
            var valuestring = getTempCache( "admin-tablevalues" );
            eval( "values = " + valuestring );
            var header = values.shift();
            var lastSort = getTempCache( "admin-tablelastsort" );
            var newSort = index;
            if( lastSort != index )
            {
                values.sort(function(a,b)
                {
                    return a[ index ] - b[ index ];
                });
            }
            else
            {
                values.sort(function(a,b)
                {
                    return b[ index ] - a[ index ];
                });
                newSort = -1;
            }
            tempCache( "admin-tablelastsort", newSort );
            values.unshift( header );
            admin_tableView( values );
        });
    });
    */
}

function admin_noTableView()
{
    var view = $("#admin_tbl" + getTempCache( "currentAccordionView" ) );
    view.html( "No values." );
}

function admin_viewTempCache()
{
    var obj = $("#admintab-Temp_Cache");
    if( obj.length != 1 )
    {
        return;
    }
    var text = "<table style='font-size:10px'>";
    var arr = this.prototype.cacheValues;
    for( var ind in arr )
    {
        text += "<tr><td>" + ind + "</td><td>" + arr[ ind ] + "</td></tr>";
    }
    text += "</table>";
    $("#admintab-Temp_Cache").html( text );
    resizePopup( "Admin" );
}
