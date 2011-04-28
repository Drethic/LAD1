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
        "<div class='max_popup' title='Maximize'><span>\u25a1</span></div>" +
        "<div class='close_popup' title='Close'><span class='ui-icon" +
        " ui-icon-close'></span></div></div>")
        .append("<div id='serverpu' class='popup_body'></div>")
        .toggle(function() {
		$(this).removeClass('popup');
	})
        .css('display', 'none')
        .resizable({alsoResize: "#serverpu"});

    $('#serverpu').resizable();

    $('div.popup')
        .css( "max-height", $("#center").height() )
        .css( "max-width", $("#center").width() )
        .draggable({'opacity': '0.7', 'cancel': '.popup_body',
        'cursor': 'move', 'containment': '#center'})
        .resize( function() {
            moveResizeVert($('div.popup_body'));
            moveResizeHor($('div.popup_body'));
        });
    $('div.popup_body')
        .css( "max-height", $("#center").height() - 20 )
        .css( "max-width", $("#center").width() );

    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>Start Menu INW</div>");

    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

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
            div.addClass('popup_max')
            .removeAttr('style')
            .css( "height", $("#center").height() )
            .css( "width", $("#center").width() );
            div.find('.popup_body')
            .addClass('popup_body_max')
            .removeAttr('style')
            .css( "height", $("#center").height() - 20 )
            .css( "width", $("#center").width() - 2 );
            div.find('.max_popup').attr('title', 'Restore')
            .addClass('restore_popup')
            .removeClass('max_popup')
            .empty()
            .append("<span class='ui-icon ui-icon-newwin'></span>");
        }
        else {
            div.removeClass('popup_max')
            .removeAttr('style')
            .css( "max-height", $("#center").height() )
            .css( "max-width", $("#center").width() );
            div.find('.popup_body')
            .removeClass('popup_body_max')
            .removeAttr('style')
            .css( "max-height", $("#center").height() - 20 )
            .css( "max-width", $("#center").width() );
            div.find('.restore_popup').attr('title', 'Maximize')
            .addClass('max_popup')
            .removeClass('restore_popup')
            .empty()
            .append("<span>\u25a1</span>");
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
            $("div#"+_id+"pu").empty();
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
    $(window).resize(function() {
        $('div.popup')
            .css( "max-height", $("#center").height() )
            .css( "max-width", $("#center").width() );
        $('div.popup_body')
            .css( "max-height", $("#center").height() - 22 )
            .css( "max-width", $("#center").width() );
        resizeHeight($('div.popup_body'));
        resizeWidth($('div.popup_body'));
    });
}

function hasVertScrollBar( element ) {
        return element.get(0).scrollHeight > element.height();
}

function hasHorScrollBar( element ) {
        return element.get(0).scrollWidth > element.width();
}

function moveResizeVert( element ) {
    if(hasVertScrollBar(element) == true) {
        $('div.ui-resizable-se').css('right', '20px');
    } else {
        $('div.ui-resizable-se').css('right', '1px');
    }
}

function moveResizeHor( element ) {
    if(hasHorScrollBar(element) == true) {
        $('div.ui-resizable-se').css('bottom', '20px');
    } else {
        $('div.ui-resizable-se').css('bottom', '1px');
    }
}

function resizeHeight( element ) {
    var elemsh = element.get(0).scrollHeight;
    var elemh = element.height();
    var centerh = $('#center').height();
    var newHeight = '0';
    if(element.hasClass('popup_body_max')) {
        newHeight = centerh;
    } else {
        if(elemsh > centerh) {
            newHeight = centerh;
        } else if(elemsh > elemh) {
            newHeight = elemsh;
        }
    }
    if(newHeight > elemh) {
        element.parents('.popup').css('height', newHeight + 22);
        element.css('height', newHeight);
    }
    moveResizeVert( element );
    moveResizeHor( element );
}

function resizeWidth( element ) {
    var elemsw = element.get(0).scrollWidth;
    var elemw = element.width();
    var centerw = $('#center').width();
    var newWidth = '0';
    if(element.hasClass('popup_body_max')) {
        newWidth = centerw;
    } else {
        if(elemsw > centerw) {
            newWidth = centerw;
        } else {
            newWidth = elemsw;
        }
    }
    if(newWidth > elemw) {
        element.parents('.popup').css('height', newWidth + 22);
        element.css('height', newWidth);
    }
    moveResizeVert( element );
    moveResizeHor( element );
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
    $('#serverpu').html( "<table id='servertable'><thead><td>IP</td><td>" +
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
}

function requestServers()
{
    doAjax( "requestservers" );
}

function beginServerView( id, owner, ip, cpu, ram, hdd, bw )
{
    $('#serverpu').html( "Server #" + id );
    $('#serverpu').append( "<p id='serverip'>IP: " + intToIP( ip ) + "</p>" )
      .append( "<p id='servercpu'>CPU: " + cpu + "</p>" )
      .append( "<p id='serverram'>RAM: " + ram + "</p>" )
      .append( "<p id='serverhdd'>HDD: " + hdd + "</p>" )
      .append( "<p id='serverbw'>BW: " + bw + "</p>" );

    $('#serverpu').append( "<div id='programdiv'></div>" )
      .append( "<div id='processdiv'></div>" );
    resizeHeight($('#serverpu'));
    resizeWidth($('#serverpu'));
    moveResizeVert($('#serverpu'));
    moveResizeHor($('#serverpu'));
    tempCache( "currentserver", id );
    tempCache( "serverowner", owner );
    tempCache( "serverip", ip );
    tempCache( "servercpu", cpu );
    tempCache( "serverram", ram );
    tempCache( "serverhdd", hdd );
    tempCache( "serverbw", bw );
    tempCache( "processes" );
    tempCache( "programs" );
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

    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        addServerProgram( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ] );
    }
    resizeHeight($('#serverpu'));
    resizeWidth($('#serverpu'));
    moveResizeVert($('#serverpu'));
    moveResizeHor($('#serverpu'));
}

function checkFreePrograms()
{
    var programstring = getTempCache( "programs" ).toString();
    var programs = new Array();
    if( programstring != "" )
    {
        programs = programstring.split( "," );
    }
    else
    {
        enableFreePrograms();
        return;
    }

    // If any of these are not true at the end of the program listing,
    // then the user can opt to instantly get a L1 of each for free
    var hasFWD = false;
    var hasFWB = false;
    var hasPWD = false;
    var hasPWB = false;
    for( var i = 0; i < programs.length; i++ )
    {
        var progid = programs[ i ];
        var type = toNumber( getTempCache( "program-" + progid + "-type" ) );

        // Check if this type is accounted for
        switch( type )
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
    }

    // Check if the user is missing one of the basics
    if( hasFWD && hasFWB && hasPWD && hasPWB )
    {
        $('#freeprogramdiv').remove();
    }
    else
    {
        enableFreePrograms();
    }
}

function enableFreePrograms()
{
    $('#freeprogramdiv').remove();
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
    tempOut += "<td id='program-" + id + "-size' name='size'></td>";
    tempOut += "<td id='program-" + id + "-version' name='version'></td>";
    tempOut += "<td><span id='research-" + id + "'><a href='#research-" +
               id + "'>Research</a></span><span id='delete-" + id +
               "'><a href='#'>Delete</a></span><span id='exchange-" + id +
               "'><a href='#'>Exchange</a></span></td>";
    tempOut += "</tr>";
    $('#programtable').append( tempOut );

    $('#research-' + id).click(function( evt ){
        if( $(this).hasClass( "doableOperation" ) )
        {
            doAjax( "startresearch", {
                PROGRAM_ID: id
            });
        }
    });

    $('#delete-' + id).click(function( evt ){
        if( $(this).hasClass( "doableOperation" ) )
        {
            doAjax( "startdelete", {
                PROGRAM_ID: id
            });
        }
    });

    $('#exchange-' + id).click(function( evt ){
        if( $(this).hasClass( "doableOperation" ) )
        {
            // TODO: Fill in exchange client side stuff
        }
    })

    tempCache( "program-" + id + "-server", serverid );
    tempCache( "program-" + id + "-type", type, function(elem,val){
        $(elem).html( intToProgramType( val ) );
    });
    tempCache( "program-" + id + "-size", size, true );
    tempCache( "program-" + id + "-version", version, true );

    addTempCacheList( "programs", id );
    checkFreePrograms();
}

function removeServerProgram( id, callback )
{
    var row = $( "#program-" + id + "-row" );
    row.hide(1000, function(){
        if( callback != undefined )
        {
            callback( id );
        }

        $(this).remove();

        tempCache( "program-" + id + "-server" );
        tempCache( "program-" + id + "-type" );
        tempCache( "program-" + id + "-size" );
        tempCache( "program-" + id + "-version" );

        removeTempCacheList( "programs", id );

        if( getTempCache( "programs" ) == "" )
        {
            noServerPrograms();
        }
        checkFreePrograms();
    });
}

function noServerProcesses()
{
    $('#processdiv').html( "This server has no processes!" );
    //resizeHeight($('#serverpu'));
    updateProgramOperations();
}

function serverProcesses( list )
{
    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        addServerProcess( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ],
                          pro[ 5 ], pro[ 6 ], pro[ 7 ] );
    }

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
    tempOut += "<td id='process-" + id + "-target'></td>";
    tempOut += "<td id='process-" + id + "-cpu'></td>";
    tempOut += "<td id='process-" + id + "-ram'></td>";
    tempOut += "<td id='process-" + id + "-bw'></td>";
    tempOut += "<td id='process-" + id + "-operation'></td>";
    tempOut += "<td><a href='#' id='cancelprocess-" + id + "'>Cancel</a>" +
               "&nbsp;<span id='process-" + id + "-completetime'></span></td>";
    tempOut += "</tr>";
    processtable.append( tempOut );

    tempCache( "process-" + id + "-target", targetprog, true );
    tempCache( "process-" + id + "-server", owningserver );
    tempCache( "process-" + id + "-cpu", cpu, true );
    tempCache( "process-" + id + "-ram", ram, true );
    tempCache( "process-" + id + "-bw", bw, true );
    tempCache( "process-" + id + "-operation", operation, function(elem, val){
        $(elem).html( intToProcessOperation( val ) );
    });
    tempCache( "process-" + id + "-completetime", completiontime );

    addTempCacheList( "processes", id );

    runTimeUpdater( "process-" + id + "-completetime", id, function(id,domEl) {
        domEl.html( "<a href='#'>Complete</a>" );
        domEl.children( "a" ).click(function(evt){
            doAjax( "finishprocess", {
                PROCESS_ID: getSimpleID( $(this).parent() )
            });
        });
    });
    $("#cancelprocess-" + id).click(function(){
        // Should add a confirmation here
        doAjax( "cancelprocess", {
            PROCESS_ID: getSimpleID( $(this) )
        });
    });
    resizeHeight($('#serverpu'));
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

    if( fwdid != 0 )
    {
        addServerProgram( fwdid, serverid, 1, getProgramSize( 1, 1 ), 1 );
    }
    if( fwbid != 0 )
    {
        addServerProgram( fwbid, serverid, 2, getProgramSize( 2, 1 ), 1 );
    }
    if( pwdid != 0 )
    {
        addServerProgram( pwdid, serverid, 3, getProgramSize( 3, 1 ), 1 );
    }
    if( pwbid != 0 )
    {
        addServerProgram( pwbid, serverid, 4, getProgramSize( 4, 1 ), 1 );
    }

    updateProgramOperations();
}

function updateProgramOperations( )
{
    var programstring = getTempCache( "programs" ).toString();
    var programs = new Array();
    if( programstring != "" )
    {
        programs = programstring.split( "," );
    }
    else
    {
        return;
    }

    var processstring = getTempCache( "processes" ).toString();
    var processes = new Array();
    if( processstring != "" )
    {
        processes = processstring.split( "," );
    }
    var i;
    var cantResearch = new Array();
    var cantDelete = new Array();
    // If a process is being deleted, it can't be researched
    for( i = 0; i < processes.length; i++ )
    {
        var processid = processes[ i ];
        var operation = getTempCache( "process-" + processid + "-operation" );
        var program = getTempCache( "process-" + processid + "-target" );
        var opstring = intToProcessOperation( operation );
        if( opstring == "Delete" )
        {
            cantResearch.push( program );
        }
        // Can't delete if already doing something
        cantDelete.push( program );
    }

    var totalhdd = toNumber( getTempCache( "serverhdd" ) );
    var usedhdd = 0;

    for( i = 0; i < programs.length; i++ )
    {
        usedhdd += toNumber( getTempCache( "program-" + programs[ i ] +
                                           "-size" ) );
    }

    var freehdd = totalhdd - usedhdd;
    if( freehdd < 0 )
    {
        freehdd = 0;
    }

    for( i = 0; i < programs.length; i++ )
    {
        var programid = programs[ i ];
        var programtype = getTempCache( "program-" + programid + "-type" );
        var hddavail = getProgramSize( programtype, 1 ) < freehdd;
        var researchobj = $('#research-' + programid);
        var deleteobj = $('#delete-' + programid);
        // Update the research button accordingly
        if( cantResearch.indexOf( programid ) != -1 )
        {
            researchobj.addClass( 'disabledOperation' );
            researchobj.removeClass( 'doableOperation' );
            researchobj.attr( "title", "Can't research because program is " +
                                       "already being deleted." );
        }
        else if( !hddavail )
        {
            researchobj.addClass( 'disabledOperation' );
            researchobj.removeClass( 'doableOperation' );
            researchobj.attr( "title", "Can't research because there is not " +
                                       "enough HDD space available." );
        }
        else
        {
            researchobj.addClass( 'doableOperation' );
            researchobj.removeClass( 'disabledOperation' );
            researchobj.attr( "title", "" );
        }
        // Update the delete button accordingly
        if( cantDelete.indexOf( programid ) != -1 )
        {
            deleteobj.addClass( 'disabledOperation' );
            deleteobj.removeClass( 'doableOperation' );
            deleteobj.attr( "title", "Can't delete because another operation " +
                                     "is already being performed." );
        }
        else
        {
            deleteobj.addClass( 'doableOperation' );
            deleteobj.removeClass( 'disabledOperation' );
            deleteobj.attr( "title", "" );
        }
    }
    resizeHeight($('#serverpu'));
}

function notEnoughFileSpace()
{
    alert( 'Not enough file space!' );
}

function startedResearch( programid, processid, completiontime )
{
    addServerProcess( processid, programid, getTempCache("currentserver"),
                      getDefault( "RESEARCH_CPU" ),
                      getDefault( "RESEARCH_RAM" ), 0,
                      getDefault( "OP_RESEARCH" ), completiontime );
    updateProgramOperations();
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

        if( getTempCache( "processes" ) == "" )
        {
            noServerProcesses();
        }
        
        updateProgramOperations();
    });
}

function finishedResearch( processid )
{
    $("#process-" + processid + "-row").addClass( "doableOperation" );
    removeProcess( processid, function(id){
        var progid = getTempCache( "process-" + id + "-target" );
        var programversion = getTempCache( "program-" + progid + "-version" );
        var programsize = getTempCache( "program-" + progid + "-size" );
        var programtype = getTempCache( "program-" + progid + "-type" );

        var newversion = toNumber( programversion )+ 1;
        var newsize = toNumber( programsize ) + getProgramSize( programtype, 1 );

        tempCache( "program-" + progid + "-version", newversion, true );
        tempCache( "program-" + progid + "-size", newsize, true );
    });
}

function cancelledProcess( processid )
{
    $("#process-" + processid + "-row").addClass( "disabledOperation" );
    removeProcess( processid );
}

function startedDeletion( programid, processid, completiontime )
{
    addServerProcess( processid, programid, getTempCache("currentserver"),
                      getDefault( "DELETE_CPU" ),
                      getDefault( "DELETE_RAM" ), 0,
                      getDefault( "OP_DELETE" ), completiontime );
    updateProgramOperations();
}

function finishedDeletion( processid )
{
    $("#process-" + processid + "-row").addClass( "doableOperation" );

    var progid = getTempCache( "process-" + processid + "-target" );
    removeServerProgram( progid );
    removeProcess( processid );
}

function exchangedProgram( programid, cpuUp, ramUp, hddUp, bwUp )
{
    // All our data is already cached, simply restore it
    // TODO: Functionize when this needs to be duplicated
    var id = toNumber( getTempCache( "currentserver" ) );
    var owner = toNumber( getTempCache( "serverowner" ) );
    var ip = toNumber( getTempCache( "serverip" ) );
    var cpu = toNumber( getTempCache( "servercpu" ) );
    var ram = toNumber( getTempCache( "serverram" ) );
    var hdd = toNumber( getTempCache( "serverhdd" ) );
    var bw = toNumber( getTempCache( "serverbw" ) );

    // Our two big lists
    var programs = getTempCache( "programs" );
    var processes = getTempCache( "processes" );

    var programsvalid = programs != "";
    var processesvalid = processes != "";
    var i;
    
    // Build the programs array
    if( programsvalid )
    {
        var programarray = new Array();
        var programlist = programs.toString().split( "," );
        for( i = 0; i < programlist.length; i++ )
        {
            var progid = programlist[ i ];
            programarray.push( new Array( progid, id,
                          getTempCache( "program-" + progid + "-type" ),
                          getTempCache( "program-" + progid + "-size" ),
                          getTempCache( "program-" + progid + "-version" )));
        }
    }

    // Build the processes array
    if( processesvalid )
    {
        var processarray = new Array();
        var processlist = processes.toString().split( "," );
        for( i = 0; i < processlist.length; i++ )
        {
            var procid = processlist[ i ];
            processarray.push( new Array( procid,
                      getTempCache( "process-" + procid + "-target" ),
                      getTempCache( "process-" + procid + "-server" ),
                      getTempCache( "process-" + procid + "-cpu" ),
                      getTempCache( "process-" + procid + "-ram" ),
                      getTempCache( "process-" + procid + "-bw" ),
                      getTempCache( "process-" + procid + "-operation" ),
                      getTempCache( "process-" + procid + "-completetime" )));
        }
    }
    beginServerView( id, owner, ip, cpu, ram, hdd, bw );
    if( programsvalid )
    {
        serverPrograms( programlist );
    }
    else
    {
        noServerPrograms();
    }
    if( processesvalid )
    {
        serverProcesses( processlist );
    }
    else
    {
        noServerProcesses();
    }

    removeServerProgram( programid );

    var prefix = "<div class='positivemodifier'>+";
    var postfix = "</div>";
    if( cpuUp )
    {
        $(prefix + cpuUp + postfix)
            .appendTo( $('#servercpu') )
            .delay( 1000 )
            .fadeOut( 500 )
            .queue(function() {
                tempCache( "servercpu", cpu + cpuUp, true );
            });
    }
    if( ramUp )
    {
        $(prefix + ramUp + postfix)
            .appendTo( $('#serverram') )
            .delay( 1000 )
            .fadeOut( 500 )
            .queue(function() {
                tempCache( "serverram", ram + ramUp, true );
            });
    }
    if( hddUp )
    {
        $(prefix + hddUp + postfix)
            .appendTo( $('#serverhdd') )
            .delay( 1000 )
            .fadeOut( 500 )
            .queue(function() {
                tempCache( "serverhdd", hdd + hddUp, true );
            });
    }
    if( bwUp )
    {
        $(prefix + bwUp + postfix)
            .appendTo( $('#serverbw') )
            .delay( 1000 )
            .fadeOut( 500 )
            .queue(function() {
                tempCache( "serverbw", bw + bwUp, true );
            });
    }

}