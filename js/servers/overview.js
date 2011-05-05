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
        var tempOut = "<tr>";
        tempOut += "<td><a href='#server-" + list[ i ][ 0 ] + "' " +
                   "title='View Server'>" + intToIP( list[ i ][ 2 ] ) +
                   "</a></td>";
        for( var j = 3; j < list[ i ].length; j++ )
        {
            tempOut += "<td>" + list[ i ][ j ] + "</td>";
        }
        tempOut += "</tr>";
        serverids[ i ] = list[ i ][ 0 ];
        $('#servertable').append( tempOut );
        tempCache( "server-" + list[ i ][ 0 ] + "-ip", list[ i ][ 2 ] );
        tempCache( "server-" + list[ i ][ 0 ] + "-cpu", list[ i ][ 3 ] );
        tempCache( "server-" + list[ i ][ 0 ] + "-ram", list[ i ][ 4 ] );
        tempCache( "server-" + list[ i ][ 0 ] + "-hdd", list[ i ][ 5 ] );
        tempCache( "server-" + list[ i ][ 0 ] + "-bw", list[ i ][ 6 ] );
    }
    $('#servertable a').click(function( evt ){
       var t = $(this);
       var href = t.attr( 'href' );
       if( href.indexOf( 'server-' ) == 1 )
       {
           doAjax( "viewserver", {
               SERVER_ID: href.slice( 8 )
           });
       }
    });

    tempCache( "servers", serverids.join(",") );

    resizePopup( "Servers" );
}

function requestServers()
{
    doAjax( "requestservers" );
}