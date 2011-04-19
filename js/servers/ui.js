function validLogin( id )
{
    $("head").css('pane', 'display:none;}');
    $("body").html("");
    $("body").append(
      $("<div id='layout-container'>")
        .append("<div id='taskbar' class='ui-layout-south'></div>")
        .append("<div id='east' class='ui-layout-east'>Chat(closeable)</div>")
        .append("<div id='center' class='ui-layout-center'></div>")
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

    $("#center")
        .append("<div class='popup' id='servers'></div>");

    $("#servers")
        .append("<div class='popup_header' title='Servers'>" +
        "<div class='popup_title'><span><span class='ui-icon ui-icon-image" +
        " popup_image' style='float:left'></span>Servers</span></div>" +
        "<div class='refresh_popup' title='Refresh'><span class='ui-icon" +
        " ui-icon-arrowrefresh-1-s'></span></div>" +
        "<div class='min_popup' title='Minimize'><span class='ui-icon" +
        " ui-icon-minus'></span></div>" +
        "<div class='max_popup' title='Maximize'><span>□</span></div>" +
        "<div class='close_popup' title='Close'><span class='ui-icon" +
        " ui-icon-close'></span></div></div>")
        .append("<div id='serverpu' class='popup_body'></div>")
        .toggle(function() {
		$(this).removeClass('popup');
	})
        .css('display', 'none');

    $('div.popup').draggable({'opacity': '0.7', 'cancel': '.popup_body', 'cursor': 'move', 'containment': '#center'});

    $('div.popup_body').css( "max-height", $("#center").css( "height" ) - 22 );

    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>Start Menu INW</div>");
    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    $('#jTaskBar').css('float', 'left');

    $('#jTaskBar').find('div#servers').remove();

    $('.close_popup').click( function() {
	$(this).parents('.popup').fadeOut('fast', function() {
		$(this).removeClass('popup');
	});
        window.location.hash = '';
    });

    $('.max_popup').click( function() {
        var div = $(this).parents('.popup');
        if(!div.hasClass('popup_max')) {
            div.addClass('popup_max');
            div.find('.popup_body')
            .addClass('popup_body_max');
            div.find('.max_popup').attr('title', 'Restore')
            .addClass('restore_popup')
            .removeClass('max_popup')
            .empty()
            .append("<span class='ui-icon ui-icon-newwin'></span>");
            popupHeight( div );
        }
        else {
            div.removeClass('popup_max');
            div.find('.popup_body')
            .removeClass('popup_body_max')
            .removeAttr('style');
            div.find('.restore_popup').attr('title', 'Maximize')
            .addClass('max_popup')
            .removeClass('restore_popup')
            .empty()
            .append("<span>□</span>");
        }
    });

    $('.min_popup').click( function() {
        $(this).parents('.popup').fadeOut('fast');
    });

    $('.refresh_popup').click( function() {
        refreshCurrent();
    });

    $("#menu").css({"display" : "none"});

    $('#start').live("click",function(){
        if($(this).hasClass('active'))
        {
            $(this).removeClass('active');
            $("#menu").slideToggle();
            $("#layout-container").layout().resetOverflow('south');
        }
        else
        {
            $(this).addClass('active');
            $("#layout-container").layout().allowOverflow('south');
            $("#menu").slideToggle();
        }
    });

    $("#menu").append("<button id='logout'>Logout</button>")
      .append( "<br><button id='servers'>Servers</button>" );

    $("#logout").click(function( evt ){
        window.location = '';
        doLogin();
    });
    $("#servers").click(function( evt ){
        var _id = $(this).attr('id');
	if ($('div#'+_id).css('display') == 'none') {
            $('div#'+_id).fadeIn();
            $("#serverpu").empty();
            requestServers();
	}
	if (!$('div#'+_id).hasClass('popup')) {
            $('div#'+_id).addClass('popup');
	}
        if ($('#jTaskBar').find('div#'+_id).hasClass('jTask-hidden')){
            $('#jTaskBar').find('div#'+_id).removeClass('jTask-hidden');
            $('div#'+_id).fadeIn();
        }
        $('#start').click();
    });
    $(document).mousemove(function() {
        var div = $('#center');
        var divpb = div.find('.popup_body');
        var divp = div.find('.popup');
        var centerh = div.height();
        var divpbh = divpb.height();
        var divph = divp.height();
        if(divpbh != centerh-22 || divph != centerh)
        {
            if(divpb.hasClass('popup_body_max')){
                divpb.removeAttr('style');
                divp.removeAttr('style');
                popupHeight( div );
            }
        }
        if(divpbh > centerh-22 || divph > centerh)
        {
            if(!divpb.hasClass('popup_body_max'))
            {
                divpb.removeAttr('style');
                divp.removeAttr('style');
                divp.css('height', centerh);
                divpb.css('height', centerh-22);
            }
        }
        else if(divpbh < centerh-22 || divph < centerh)
        {
            if(!divpb.hasClass('popup_body_max'))
            {
                divp.css('height', '');
                divpb.css('height', '');
            }
        }
    });
}

function popupHeight( div )
{
    var wheight = $('#center').height();
    div.find('.popup').css('height',wheight);
    div.find('.popup_body').css('height',wheight-22);
}

function noOwnedServers()
{
    $('#serverpu').html( "You don't have any servers!" )
      .append( "<button id='requestfree'>Request a Free One</button>");

    $('#requestfree').click(function( evt ){
        doAjax( "requestfreeserver" );
    });
}

function ownedServers( list )
{
    $('#serverpu').html( "<table id='servertable'><thead><td>IP</td><td>CPU</td>" +
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
    $('#serverpu').html( "Server #" + id );
    $('#serverpu').append( "<p>IP: " + intToIP( ip ) + "</p>" )
      .append( "<p>CPU: " + cpu + "</p>" )
      .append( "<p>RAM: " + ram + "</p>" )
      .append( "<p>HDD: " + hdd + "</p>" )
      .append( "<p>BW: " + bw + "</p>" );

    $('#serverpu').append( "<div id='programdiv'></div>" )
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
            SERVER_ID: getTempCache('currentserver')
        });
    });
}

function addServerProgram( id, serverid, type, size, version )
{
    var tempOut = "<tr id='program-" + id + "-row'>";
    tempOut += "<td id='program-" + id + "-type' name='type'>" +
               intToProgramType( type ) + "</td>";
    tempOut += "<td id='program-" + id + "-size' name='size'>" + size + "</td>";
    tempOut += "<td id='program-" + id + "-version' " +
               "name='version'>" + version + "</td>";
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

    var tempOut = "<tr id='process-" + id + "-row'>";
    tempOut += "<td id='process-" + id + "-target'>" + targetprog + "</td>";
    tempOut += "<td id='process-" + id + "-cpu'>" + cpu + "</td>";
    tempOut += "<td id='process-" + id + "-ram'>" + ram + "</td>";
    tempOut += "<td id='process-" + id + "-bw'>" + bw + "</td>";
    tempOut += "<td>" + intToProcessOperation( operation ) + "</td>";
    tempOut += "<td id='process-" + id + "-completetime'></td>";
    tempOut += "</tr>";
    processtable.append( tempOut );

    tempCache( "process-" + id + "-target", targetprog );
    tempCache( "process-" + id + "-server", owningserver );
    tempCache( "process-" + id + "-cpu", cpu );
    tempCache( "process-" + id + "-ram", ram );
    tempCache( "process-" + id + "-bw", bw );
    tempCache( "process-" + id + "-operation", operation );
    tempCache( "process-" + id + "-completetime", completiontime );

    runTimeUpdater( "process-" + id + "-completetime", id, function(id,domEl) {
        domEl.html( "<a href='#'>Complete</a>" );
        $("#process-" + id + "-completetime a").click(function(evt){
            doAjax( "finishresearch", {
                PROCESS_ID: id
            });
        });
    });
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
    var programstring = getTempCache( "programs" ).toString();
    var programs = programstring.split( "," );

    var processstring = getTempCache( "processes" ).toString();
    var processes = processstring.split( "," );

    var i;
    var cantResearch = new Array();
    // If a process is being deleted, it can't be researched
    for( i = 0; i < processes.length; i++ )
    {
        var processid = processes[ i ];
        var operation = getTempCache( "process-" + processid + "-operation" );
        var opstring = intToProcessOperation( operation );
        if( opstring == "Delete" )
        {
            cantResearch[ cantResearch.length ] = processid;
        }
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
    addServerProcess( processid, programid, getTempCache("currentserver"),
                      getDefault( "RESEARCH_CPU" ),
                      getDefault( "RESEARCH_RAM" ), 0, 2, completiontime );
    updateProgramOperations();

    addTempCacheList( "processes", processid );
}

function removeProcess( id, callback )
{
    var row = $( "#process-" + id + "-row" );
    row.hide(1000, function(){
        if( callback != undefined )
        {
            callback( id );
        }

        $(this).remove();
        
        tempCache( "process-" + id + "-target" );
        tempCache( "process-" + id + "-server" );
        tempCache( "process-" + id + "-cpu" );
        tempCache( "process-" + id + "-ram" );
        tempCache( "process-" + id + "-bw" );
        tempCache( "process-" + id + "-operation" );
        tempCache( "process-" + id + "-completetime" );

        removeTempCacheList( "processes", id );
    });

}

function finishedResearch( processid )
{
    removeProcess( processid, function(id){
        var progid = getTempCache( "process-" + id + "-target" );
        var programversion = getTempCache( "program-" + progid + "-version" );
        var programsize = getTempCache( "program-" + progid + "-size" );
        var programtype = getTempCache( "program-" + progid + "-type" );

        var newversion = new Number( programversion ) + 1;
        var newsize = new Number( programsize ) + getProgramSize( programtype, 1 );

        $("#program-" + progid + "-version").html( newversion );
        $("#program-" + progid + "-size").html( newsize );

        tempCache( "program-" + progid + "-version", programversion );
        tempCache( "program-" + progid + "-size", programsize );
    });
}