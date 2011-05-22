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
        "<table id='servertable'><thead><td>IP</td><td>Name</td><td>" +
        "CPU</td><td>RAM</td><td>HDD</td><td>BW</td><td " +
        "title='Operating Ratio'>OR</td></thead></table>" );

    var serverids = new Array();
    for( var i = 0; i < list.length; i++ )
    {
        var obj = list[ i ];
        var id = obj[ 0 ];
        var tempOut = "<tr>";
        tempOut += "<td><button href='#server-" + id + "' " +
                   "title='View Server' id='server-" + id + "-link'>" +
                   intToIP( obj[ 2 ] ) + "</button></td>";
        tempOut += "<td><input type='text' id='server-" + id + "-customname' " +
                   "class='semihidden' title='Click to Edit' />" +
                   "</td>";
        for( var j = 4; j < 8; j++ )
        {
            tempOut += "<td>" + obj[ j ] + "</td>";
        }
        tempOut += "<td>" + obj[ 8 ] + "</td>";
        tempOut += "</tr>";
        serverids[ i ] = id;
        $('#servertable').append( tempOut );
        $('#server-' + id + '-customname').val( obj[ 3 ] )
            .hover(function(){
                $(this).addClass("semihiddenhover");
            }, function(){
                $(this).removeClass("semihiddenhover");
            }).focus(function(){
                $(this).addClass("semihiddenactive");
            }).blur(function(){
                $(this).removeClass("semihiddenactive");
                var oldVal = getTempCache( "servercustomname" );
                var newVal = $(this).val();
                if( oldVal != newVal )
                {
                    doAjax( "changeservername", {
                        SERVER_ID: id,
                        NAME: newVal
                    });
                }
            });
        tempCache( "server-" + id + "-ip", obj[ 2 ] );
        tempCache( "server-" + id + "-customname", obj[ 3 ] );
        tempCache( "server-" + id + "-cpu", obj[ 4 ] );
        tempCache( "server-" + id + "-ram", obj[ 5 ] );
        tempCache( "server-" + id + "-hdd", obj[ 6 ] );
        tempCache( "server-" + id + "-bw", obj[ 7 ] );
        tempCache( "server-" + id + "-lastupdate", obj[ 8 ] );
        tempCache( "server-" + id + "-operatingratio", obj[ 9 ] );
        $('#server-' + id + "-link").click(function(){
            doAjax( "viewserver", {
                SERVER_ID: id
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
            tempCache( objname, newvalue, cb );
        });
}