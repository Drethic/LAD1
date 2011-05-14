function noOwnedServers()
{
    getPopupContext( "Servers" ).html( "You don't have any servers!" )
      .append( "<button id='requestfree'>Request a Free One</button>");

    $('#requestfree').click(function( evt ){
        doAjax( "requestfreeserver" );
    });

    resizePopup( "Servers" );
}

function ownedServers( list )
{
    getPopupContext( "Servers" ).html(
        "<table id='servertable'><thead><td>IP</td><td>" +
        "CPU</td><td>RAM</td><td>HDD</td><td>BW</td></thead></table>" );

    var serverids = new Array();
    for( var i = 0; i < list.length; i++ )
    {
        var obj = list[ i ];
        var tempOut = "<tr>";
        tempOut += "<td><button href='#server-" + obj[ 0 ] + "' " +
                   "title='View Server' id='server-" + obj[ 0 ] + "-link'>" +
                   intToIP( obj[ 2 ] ) + "</button></td>";
        for( var j = 3; j < obj.length; j++ )
        {
            tempOut += "<td>" + obj[ j ] + "</td>";
        }
        tempOut += "</tr>";
        serverids[ i ] = obj[ 0 ];
        $('#servertable').append( tempOut );
        tempCache( "server-" + obj[ 0 ] + "-ip", obj[ 2 ] );
        tempCache( "server-" + obj[ 0 ] + "-cpu", obj[ 3 ] );
        tempCache( "server-" + obj[ 0 ] + "-ram", obj[ 4 ] );
        tempCache( "server-" + obj[ 0 ] + "-hdd", obj[ 5 ] );
        tempCache( "server-" + obj[ 0 ] + "-bw", obj[ 6 ] );
        tempCache( "server-" + obj[ 0 ] + "-lastupdate", obj[ 7 ] );
        tempCache( "server-" + obj[ 0 ] + "-operatingratio", obj[ 8 ] );
        $('#server-' + obj[ 0 ] + "-link").click(function(){
            doAjax( "viewserver", {
                SERVER_ID: obj[ 0 ]
            }, "Servers" );
        });
    }

    tempCache( "servers", serverids.join(",") );

    resizePopup( "Servers" );
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
        tempCache( objname, newvalue, callback );
        return;
    }
    var style = good ? "positivemodifier" : "negativemodifier";
    var prefix = "<span class='" + style + "'>&nbsp;&nbsp;&nbsp;&nbsp;";
    if( modification > 0 )
    {
        prefix += "+";
    }
    var postfix = "</span>";
    $(prefix + modification + postfix)
        .appendTo( $('#' + objname) )
        .delay( 1000 )
        .fadeOut( 100 )
        .fadeIn( 100 )
        .fadeOut( 100 )
        .fadeIn( 100 )
        .delay( 1000 )
        .fadeOut( 300 )
        .queue(function() {
            tempCache( objname, newvalue, callback );
        });
}