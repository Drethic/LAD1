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

function ownedServers( id, list )
{
    $('#center').html( "<table id='servertable'><thead><td>IP</td><td>CPU</td>" +
                       "<td>RAM</td><td>HDD</td><td>BW</td></thead></table>" );
    for( var i = 0; i < list.length; i++ )
    {
        var tempOut = "<tr>";
        tempOut += "<td>" + intToIP( list[ i ][ 2 ] ) + "</td>";
        for( var j = 3; j < list[ i ].length; j++ )
        {
            tempOut += "<td>" + list[ i ][ j ] + "</td>";
        }
        tempOut += "</tr>";
        $('#servertable').append( tempOut );
    }
}

function requestServers()
{
    doAjax( "requestservers" );
}
