function validLogin( id )
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
        $('#start').next().slideToggle();
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

    tempCache( "currentserver", id );
}

function noServerPrograms()
{
    $('#programdiv').html( "This server has no programs!" );
    enableFreePrograms();
}

function serverPrograms( list )
{
    $('#programdiv').html( "<table id='programtable'><thead><td>Program Type" +
                           "</td><td>Size (MB)</td><td>Version</td><td>" +
                           "Operations</td></thead></table>" );

    // If any of these are not true at the end of the program listing,
    // then the user can opt to instantly get a L1 of each for free
    var hasFWD = false;
    var hasFWB = false;
    var hasPWD = false;
    var hasPWB = false;
    var programids = new Array();
    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        // Check if this type is accounted for
        switch( pro[ 2 ] )
        {
            case 1:
                hasFWD = true;
                break;
            case 2:
                hasFWB = true;
                break;
            case 3:
                hasPWD = true;
                break;
            case 4:
                hasPWB = true;
        }
        addServerProgram( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ] );

        programids[ i ] = pro[ 0 ];
    }

    // Check if the user is missing one of the basics
    if( !hasFWD || !hasFWB || !hasPWD || !hasPWB )
    {
        enableFreePrograms();
    }

    tempCache( "programs", programids.join(",") );
}

function enableFreePrograms()
{
    $('#programdiv').prepend( "<div id='freeprogramdiv'>You are missing " +
       "critical programs that may be loaded from CD.  <a href='#' " +
       "id='loadfreeprogram'>Load Now</a></div>" );
    $('#loadfreeprogram').click(function( evt ){
        doAjax( "freeprograms", {
            SERVER_ID: $('#currentserver').html()
        });
    });
}

function addServerProgram( id, serverid, type, size, version )
{
    var tempOut = "<tr>";
    tempOut += "<td name='type'>" + intToProgramType( type ) + "</td>";
    tempOut += "<td name='size'>" + size + "</td>";
    tempOut += "<td name='version'>" + version + "</td>";
    tempOut += "<td><span id='research-" + id + "'><a href='#research-" +
               id + "'>Research</a></span></td>";
    tempOut += "</tr>";
    $('#programtable').append( tempOut );

    $('#research-' + id).click(function( evt ){
        doAjax( "startresearch", {
            PROGRAM_ID: id
        });
    });

    tempCache( "program-" + id + "-server", serverid );
    tempCache( "program-" + id + "-type", type );
    tempCache( "program-" + id + "-size", size );
    tempCache( "program-" + id + "-version", version );
}

function noServerProcesses()
{
    $('#processdiv').html( "This server has no processes!" );
    updateProgramOperations();
}

function serverProcesses( list )
{
    var processes = new Array();
    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        addServerProcess( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ],
                          pro[ 5 ], pro[ 6 ], pro[ 7 ] );

        processes[ i ] = pro[ 0 ];
    }

    tempCache( "processes", processes.join(",") );
    updateProgramOperations();
}

function addServerProcess( id, targetprog, owningserver, cpu, ram, bw,
                           operation, completiontime )
{
    var processtable = $('#processtable');
    if( processtable.length == 0 )
    {
        $('#processdiv').html( "<table id='processtable'><thead><td>Target ID" +
                               "</td><td>CPU</td><td>RAM</td><td>BW</td>" +
                               "<td>Operation</td><td title='Estimated Time " +
                               "of Completion'>ETC</td></thead></table>" );
        processtable = $('#processtable');
    }

    var tempOut = "<tr>";
    tempOut += "<td>" + targetprog + "</td>";
    tempOut += "<td>" + cpu + "</td>";
    tempOut += "<td>" + ram + "</td>";
    tempOut += "<td>" + bw + "</td>";
    tempOut += "<td>" + intToProcessOperation( operation ) + "</td>";
    tempOut += "<td>" + completiontime + "</td>";
    tempOut += "</tr>";
    processtable.append( tempOut );

    tempCache( "process-" + id + "-target", targetprog );
    tempCache( "process-" + id + "-server", owningserver );
    tempCache( "process-" + id + "-cpu", cpu );
    tempCache( "process-" + id + "-ram", ram );
    tempCache( "process-" + id + "-bw", bw );
    tempCache( "process-" + id + "-operation", operation );
    tempCache( "process-" + id + "-completetime", completiontime );
}

function grantedFreePrograms( fwdid, fwbid, pwdid, pwbid )
{
    $('#freeprogramdiv').replaceWith( "" );
    var programtable = $('#programtable');
    if( programtable.length == 0 )
    {
        $('#programdiv').html( "<table id='programtable'></table>" );
        programtable = $('#programtable');
    }

    var serverid = $('#currentserver').html();

    addServerProgram( fwdid, serverid, 1, getProgramSize( 1, 1 ), 1 );
    addServerProgram( fwbid, serverid, 2, getProgramSize( 2, 1 ), 1 );
    addServerProgram( pwdid, serverid, 3, getProgramSize( 3, 1 ), 1 );
    addServerProgram( pwbid, serverid, 4, getProgramSize( 4, 1 ), 1 );
}

function updateProgramOperations( )
{
    var programstring = getTempCache( "programs" );
    var programs = programstring.split( "," );

    var processstring = getTempCache( "processes" );
    var processes = processstring.split( "," );

    var i;
    var cantResearch = new Array();
    // Handle various stuff that I don't want to think about now'
    for( i = 0; i < processes.length; i++ )
    {

    }

    for( i = 0; i < programs.length; i++ )
    {
        var programid = programs[ i ];
        if( cantResearch.indexOf( programid ) != -1 )
        {
            $('#research-' + programid).addClass( 'disabledOperation' );
            $('#research-' + programid).removeClass( 'doableOperation' );
        }
        else
        {
            $('#research-' + programid).addClass( 'doableOperation' );
            $('#research-' + programid).removeClass( 'disabledOperation' );
        }
    }
}

function notEnoughFileSpace()
{
    alert( 'Not enough file space!' );
}

function startedResearch( programid, processid, completiontime )
{
    addServerProcess( processid, programid, getTempCache("currentserver"), 100,
                      10, 0, 2, completiontime );
    updateProgramOperations();
}