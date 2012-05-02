createWindow( "Servers" );
addMenuButton( "Servers", "ui-icon-folder-open", requestServers);

function disableModuleSERVERS()
{
    deleteAllElementsById( "Servers" );
    deleteAllElementsById( "Explorer" );
}

function noOwnedServers()
{
    getPopupContext( "Servers" ).html( "You don't have any servers!" )
      .append( "<button id='requestfree'>Request a Free One</button>");

    $('#requestfree').click(function( evt ){
        doAjax( "requestfreeserver" );
    });

    updateCache( "Servers", "Server-Overview" );
}

function ownedServers( list )
{
    getPopupContext( "Servers" ).html(
        "<table id='servertable'><thead><td>IP</td><td>Name</td><td>" +
        "CPU</td><td>RAM</td><td>HDD</td><td>BW</td><td " +
        "title='Operating Ratio'>OR</td></thead></table>" );

    var serverids = new Array();
    var cache = "Server-Overview";
    for( var i = 0; i < list.length; i++ )
    {
        var obj = list[ i ];
        var id = obj[ 0 ];
        var row = $("<tr></tr>");
        var customname = verifyServerName( id, obj[ 3 ] );
        row.append( "<td><button href='#server-" + id + "' " +
                    "title='View Server' id='server-" + id + "-link'>" +
                    intToIP( obj[ 2 ] ) + "</button></td>" );
        row.append( $("<td></td>").append(
          createUpdateableInput( "server-" + id + "-customname",
                     customname, "changeservername", "SERVER_ID", id )
        ));
        for( var j = 4; j < 8; j++ )
        {
            row.append( "<td>" + obj[ j ] + "</td>" );
        }
        row.append( "<td>" + obj[ 9 ] + "</td>" );

        serverids[ i ] = id;
        $('#servertable').append( row );
        tempCache( "server-" + id + "-ip", obj[ 2 ], cache );
        tempCache( "server-" + id + "-customname", obj[ 3 ], cache );
        tempCache( "server-" + id + "-cpu", obj[ 4 ], cache );
        tempCache( "server-" + id + "-ram", obj[ 5 ], cache );
        tempCache( "server-" + id + "-hdd", obj[ 6 ], cache );
        tempCache( "server-" + id + "-bw", obj[ 7 ], cache );
        tempCache( "server-" + id + "-lastupdate", obj[ 8 ], cache );
        tempCache( "server-" + id + "-operatingratio", obj[ 9 ], cache );
        $('#server-' + id + "-link").click(function(){
            doAjax( "viewserver", {
                SERVER_ID: id
            }, "Servers" );
        });
    }

    tempCache( "servers", serverids.join(","), cache );

    updateCache( "Servers", "Server-Overview" );
}

function requestServers()
{
    doAjax( "requestservers", undefined, "Servers" );
}

function notEnoughRAM()
{
    alert( "Not enough RAM" );
}

function notEnoughFileSpace()
{
    alert( 'Not enough file space!' );
}

function applyModificationToServerStat( objname, newvalue, good, modification,
                                        callback )
{
    if( callback == undefined )
    {
        callback = true;
    }
    if( $('#' + objname).html() == "" || newvalue == getTempCache( objname ) )
    {
        tempCache( objname, newvalue, "Server-View", callback );
        return;
    }
    var style = good ? "positivemodifier" : "negativemodifier";
    var obj;
    if( $("#" + objname + "-modification").length == 0 )
    {
        var prefix = "<span class='" + style + "' id='" + objname +
                     "-modification'>&nbsp;&nbsp;&nbsp;&nbsp;";
        if( modification > 0 )
        {
            prefix += "+";
        }
        var postfix = "</span>";
        obj = $(prefix + modification + postfix).appendTo( $('#' + objname) );
        animateServerStatModification( obj, objname, newvalue, callback );
    }
    else
    {
        obj = $("#" + objname + "-modification");
        animateServerStatModification( obj, objname, newvalue, callback );
    }
}

function animateServerStatModification( obj, objname, newvalue, cb )
{
    obj.queue([]);
    obj.stop();
    obj.animate( { opacity: 100 }, 1 );
    obj.delay( 1000 )
        .fadeOut( 100 )
        .fadeIn( 100 )
        .fadeOut( 100 )
        .fadeIn( 100 )
        .delay( 1000 )
        .fadeOut( 300 )
        .queue(function(){
            tempCache( objname, newvalue, "Server-View", cb );
        });
}

/**
 * Verifies that the server name is valid.  The name is not allowed to be blank
 * so replace it with a valid string if it is.
 * 
 * @param id ID of the server
 * @param name Custom name of the server
 * @return Custom name if it is not blank, Server #ID if it is
 */
function verifyServerName( id, name )
{
    if( name == "" )
    {
        return "Server #" + id;
    }
    return name;
}