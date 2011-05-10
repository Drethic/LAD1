function updateServerConsumptionCPU( )
{
    var cpuSum = getServerDetailSum( "cpu" );
    var total = toNumber( getTempCache( "servercpu" ) );
    var ratio = Math.round( total / cpuSum * 100 ) / 100;
    var oldSum = toNumber( getTempCache( "servercpuconsumption" ) );
    var isGood = cpuSum < oldSum;
    if( total == oldSum && $('#servercpuconsumption').html() != "" )
    {
        return;
    }
    if( ratio == Number.POSITIVE_INFINITY )
    {
        ratio = 0;
    }
    applyModificationToServerStat(
        "servercpuconsumption",
        cpuSum,
        isGood,
        cpuSum - oldSum,
        function(elem,value){
            $(elem).html(getProcessCount() + " @ " + ratio);
        }
    );
}

function updateServerConsumption( type, newtotal )
{
    if( type == "cpu" )
    {
        updateServerConsumptionCPU();
        return;
    }
    var sum = getServerDetailSum( type );
    var total = newtotal == undefined ? 
        toNumber( getTempCache( "server" + type ) ) : newtotal;
    var ratio = Math.round( sum / total * 10000 ) / 100;
    var oldsum = toNumber( getTempCache( "server" + type + "consumption" ) );
    var isGood = sum < oldsum;
    if( sum == oldsum && $('#server' + type + 'consumption').html() != "" )
    {
        return;
    }
    if( ratio == Number.POSITIVE_INFINITY )
    {
        ratio = 0;
    }
    applyModificationToServerStat(
        "server" + type + "consumption",
        sum,
        isGood,
        sum - oldsum,
        function(elem,value){
            $(elem).html(sum + " (" + ratio + "%)");
        }
    );
}

function updateAllServerConsumptions( )
{
    updateProcessConsumptions();
    updateServerConsumption( "hdd" );
}

function updateProcessConsumptions( )
{
    updateServerConsumptionCPU();
    updateServerConsumption( "ram" );
    updateServerConsumption( "bw" );
}

function updateServerDetail( type, value, oldvalue )
{
    if( oldvalue == undefined )
    {
        $("#server" + type).html( value );
    }
    else
    {
        applyModificationToServerStat(
            "server" + type,
            value,
            value > oldvalue,
            value - oldvalue
        );
    }
    updateServerConsumption( type, value );
}

function generateServerDetailRow( type )
{
    type = type.toString();
    var caps = type.toUpperCase();
    var delimiter = type == "cpu" ? "=" : "/";
    return "<tr><td style='text-align:center'>" + caps + ":</td>" +
           "<td style='text-align:center'><span id='server" + type + 
           "consumption'></span></td><td>" +delimiter + "</td>" +
           "<td style='text-align:center'><span id='server" + type + 
           "'></span></td></tr>";
}

function beginServerView( id, owner, ip, cpu, ram, hdd, bw )
{
    var context = getPopupContext( "Servers" );
    context.html( "" );
    context.append( $("<table style='width:100%'></table>")
        .append( "<tr><th colspan=4>Server #" + id + "&nbsp;&nbsp;&nbsp;" +
                 "IP: <span id='serverip'></span></th></tr>")
        .append( "<tr><th>Region</th><th>Current</th><th></th><th>Total</th></tr>" )
        .append( generateServerDetailRow( "cpu" ) )
        .append( generateServerDetailRow( "ram" ) )
        .append( generateServerDetailRow( "hdd" ) )
        .append( generateServerDetailRow( "bw" ) )
    );
    context.append("<div id='programdiv'></div>");
    context.append("<div id='processdiv'></div>");

    tempCache( "currentserver", id );
    tempCache( "serverowner", owner );
    tempCache( "serverip", ip, function(elem, val) {
        $(elem).html( intToIP( val ) );
    });
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
    updateProgramOperations();
    updateServerDetail( "cpu", getTempCache( "servercpu" ) );
    updateServerDetail( "ram", getTempCache( "serverram" ) );
    updateServerDetail( "hdd", getTempCache( "serverhdd" ) );
    updateServerDetail( "bw", getTempCache( "serverbw" ) );
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

function removeServerProgram( id, callback, postcallback )
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
        
        if( postcallback != undefined )
        {
            postcallback( id );
        }

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
    updateServerConsumption( "hdd" );
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