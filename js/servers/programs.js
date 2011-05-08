function beginServerView( id, owner, ip, cpu, ram, hdd, bw )
{
    getPopupContext( "Servers" ).html( "Server #" + id )
      .append( "<p id='serverip'>IP: " + intToIP( ip ) + "</p>" )
      .append( "<p id='servercpu'>CPU: " + cpu + "</p>" )
      .append( "<p id='serverram'>RAM: " + ram + "</p>" )
      .append( "<p id='serverhdd'>HDD: " + hdd + "</p>" )
      .append( "<p id='serverbw'>BW: " + bw + "</p>" )
      .append( "<div id='programdiv'></div>" )
      .append( "<div id='processdiv'></div>" );

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

function endServerView()
{
    resizePopup( "Servers" );
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
    resizePopup( "Servers" );
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
            startExchangeProgram( id );
        }
    });

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
        var exchangeobj = $('#exchange-' + programid);
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
        // Also applies to exchange button
        if( cantDelete.indexOf( programid ) != -1 )
        {
            deleteobj.addClass( 'disabledOperation' );
            deleteobj.removeClass( 'doableOperation' );
            deleteobj.attr( "title", "Can't delete because another operation " +
                                     "is already being performed." );
            exchangeobj.addClass( 'disabledOperation' );
            exchangeobj.removeClass( 'doableOperation' );
            exchangeobj.attr( "title", "Can't exchange because another " +
                                     "operation is already being performed." );
        }
        else
        {
            deleteobj.addClass( 'doableOperation' );
            deleteobj.removeClass( 'disabledOperation' );
            deleteobj.attr( "title", "" );
            exchangeobj.addClass( 'doableOperation' );
            exchangeobj.removeClass( 'disabledOperation' );
            exchangeobj.attr( "title", "" );
        }
    }
}

function notEnoughFileSpace()
{
    alert( 'Not enough file space!' );
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

    endServerView();
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

function startExchangeProgram( id )
{
    var context = getPopupContext( 'Servers' );
    context.empty().append(
        $("<a href='#'>Go Back</a>").click(function(){
            doAjax( "viewserver", {
                SERVER_ID: obj[ 0 ]
            }, "Servers" );
        })
    ).append(
        //zomg...
    );
}