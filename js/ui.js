function validLogint( id )
{
    $("head").css('pane', 'display:none;}');
    $("body").html("");
    $("body").append(
      $("<div id='layout-container' style='width:100%;height:100%'>")
        .append("<div id='south' class='ui-layout-south'></div>")
        .append("<div id='east' class='ui-layout-east'>Chat(closeable)</div>")
        .append("<div id='center' class='ui-layout-center'>Desktop</div>")
    );
    $("#layout-container").layout({
        south: {
           closable: false
        ,  resizable: false
        ,  spacing_open: 0
        }
        ,   east: {
            initClosed: true
        ,   resizable: false
        }}).sizePane("south", 44);

    $("#south")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>Slide from bottom</div>")
        .css({"background" : "url(images/taskbar-bg.png)"});

    $("#menu").css({"display" : "none"});

    $('#start').live("mouseover mouseout",function(event){
        if(event.type=='mouseover')
        {
            $(this).addClass('hover');
        }
        else
        {
            $(this).removeClass('hover');
        }
    });

    $('#start').live("click",function(){
        if($(this).hasClass('active'))
        {
            $(this).removeClass('active');
        }
        else
        {
            $(this).addClass('active');
        }
    });

    $("#menu").append("<button id='logout'>Logout</button>")
      .append( "<button id='server'>Servers</button>" );

    $("#logout").click(function( evt ){
        doLogin();
    });
    $("#server").click(function( evt ){
        requestServers();
    });
    $('#start').click(function() {
        $("#layout-container").layout().allowOverflow('south');
        $(this).next().slideToggle();
    });
}

function noOwnedServers()
{
    $('#center').html( "You don't have any servers!" )
      .append( "<button id='requestfree'>Request a Free One</button>");

    $('#requestfree').click(function( evt ){
        doAjax( "requestfreeserver" );
    });
}

function ownedServers( list )
{
    $('#center').html( "<table id='servertable'><thead><td>IP</td><td>CPU</td>" +
                       "<td>RAM</td><td>HDD</td><td>BW</td></thead></table>" );
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
        $('#servertable').append( tempOut );
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
}

function requestServers()
{
    doAjax( "requestservers" );
}

function beginServerView( id, owner, ip, cpu, ram, hdd, bw )
{
    $('#center').html( "Server #" + id );
    $('#center').append( "<p>IP: " + intToIP( ip ) + "</p>" )
      .append( "<p>CPU: " + cpu + "</p>" )
      .append( "<p>RAM: " + ram + "</p>" )
      .append( "<p>HDD: " + hdd + "</p>" )
      .append( "<p>BW: " + bw + "</p>" );

    $('#center').append( "<div id='programdiv'></div>" )
      .append( "<div id='processdiv'></div>" );
}

function noServerPrograms()
{
    $('#programdiv').html( "This server has no programs!" );
}

function serverPrograms( list )
{
    $('#programdiv').html( "<table id='programtable'></table>" );
    for( var i = 0; i < list.length; i++ )
    {
        var tempOut = "<tr>";
        // Type
        tempOut += "<td>" + intToProgramType( list[ i ][ 2 ] ) + "</td>";
        // Size Version
        for( var j = 3; j < list[ i ].length; j++ )
        {
            tempOut += "<td>" + list[ i ][ j ] + "</td>";
        }
        tempOut += "</tr>";
        $('#programtable').append( tempOut );
    }
}

function noServerProcesses()
{
    $('#processdiv').html( "This server has no processes!" );
}

function serverProcesses( list )
{
    $('#processdiv').html( "<table id='processtable'></table>" );
    for( var i = 0; i < list.length; i++ )
    {
        var tempOut = "<tr>";
        // Target Program
        tempOut += "<td>" + list[ i ][ 1 ];
        for( var j = 3; j < 7; j++ )
        {
            tempOut += "<td>" + list[ i ][ j ] + "</td>";
        }
        tempOut += "</tr>";
        $('#processtable').append( tempOut );
    }
}