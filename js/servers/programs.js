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
    tempCache( "servercpuratio", ratio );
    runTimeUpdater( undefined, undefined, undefined, true );
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

function generateServerDetailRow( type, title )
{
    type = type.toString();
    var caps = type.toUpperCase();
    var delimiter = type == "cpu" ? "=" : "/";
    return "<tr title='" + title + "'><td style='text-align:center'>" + caps +
           ":</td><td style='text-align:center'><span id='server" + type + 
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
        .append( generateServerDetailRow( "cpu", "Distributed to each " +
                 "running program.  Determines the rate at which processes " +
                 "complete." ) )
        .append( generateServerDetailRow( "ram", "Required to run programs.  " +
                 "Cannot be exceeded." ) )
        .append( generateServerDetailRow( "hdd", "Required for programs to " +
                 "be stored/researched.  May not be exceeded." ) )
        .append( generateServerDetailRow( "bw", "Determines rate at which " +
                 "files are downloaded from external servers." ) )
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
                           "Operation</td></thead></table>" );

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
    tempOut += "<td><select id='program-" + id + "-select'>" +
               "<option>Select one...</option>" +
               "<option id='research-" + id + "'>Research</option>" +
               "<option id='delete-" + id + "'>Delete</option>" +
               "<option id='exchange-" + id + "'>Exchange</option>" +
               "</select></td>";
    tempOut += "</tr>";
    $('#programtable').append( tempOut );
    
    $('#program-' + id + '-select').change(function(evt){
        var value = $(this).val();
        var checker = function(name,callback) {
            name = name.toString();
            
            if( value == name && $("#" + name.toLowerCase() + "-" + id)
                .hasClass( "doableOperation" ) )
            {
                callback();
            }
        };
        checker( "Research", function(){
            doAjax( "startresearch", {
                PROGRAM_ID: id
            });
        });
        checker( "Delete", function(){
            doAjax( "startdelete", {
                PROGRAM_ID: id
            });
        });
        checker( "Exchange", function(){
            startExchangeProgram( id );
        });
        if( value != "Select one..." )
        {
            $(this).val( "Select one..." );
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
    var i, program;
    var cantResearch = new Array();
    var cantDelete = new Array();
    var cantExchange = new Array();
    // If a process is being deleted, it can't be researched
    for( i = 0; i < processes.length; i++ )
    {
        var processid = processes[ i ];
        var operation = getTempCache( "process-" + processid + "-operation" );
        var opstring = intToProcessOperation( operation );
        program = getTempCache( "process-" + processid + "-target" );
        if( opstring == "Delete" )
        {
            cantResearch.push( program );
        }
        // Can't delete if already doing something
        cantDelete.push( program );
        cantExchange.push( program );
    }

    var freehdd = getServerDetailAvailable( "hdd" );
    var freeram = getServerDetailAvailable( "ram" );

    for( i = 0; i < programs.length; i++ )
    {
        var programid = programs[ i ];
        var programtype = getTempCache( "program-" + programid + "-type" );
        var hddavail = getProgramSize( programtype, 1 ) < freehdd;
        var ramavail = getDefault( "RESEARCH_RAM" ) < freeram;
        var researchobj = $('#research-' + programid);
        var deleteobj = $('#delete-' + programid);
        var exchangeobj = $('#exchange-' + programid);
        var errorstring = "";
        // Update the research button accordingly
        if( cantResearch.indexOf( programid ) != -1 )
        {
            setOperationEnabled( researchobj );
            errorstring = "Can't research because program is already being " +
                          "deleted.  ";
        }
        else if( !hddavail )
        {
            setOperationEnabled( researchobj );
            errorstring = "Can't research because there is not enough HDD " +
                          "space available.  "
        }
        else if( !ramavail )
        {
            setOperationEnabled( researchobj );
            errorstring = "Can't research because there is not enough RAM " +
                          "to run a research process.  ";
        }
        else
        {
            setOperationEnabled( researchobj, true );
        }
        // And the delete one
        if( cantDelete.indexOf( programid ) != -1 )
        {
            setOperationEnabled( deleteobj );
            errorstring += "Can't delete because another operation is " +
                           "already being performed.  ";
        }
        else
        {
            setOperationEnabled( deleteobj, true );
        }
        // And also the exchange one
        if( cantExchange.indexOf( programid ) != -1 )
        {
            setOperationEnabled( exchangeobj );
            errorstring += "Can't exchange because another operation is " +
                           "already being performed.  ";
        }
        else if( getTempCache( "program-" + programid + "-version" ) == "1" )
        {
            setOperationEnabled( exchangeobj );
            errorstring += "Can't exchange because this program is only " +
                           "version 1.  ";
        }
        else
        {
            setOperationEnabled( exchangeobj, true );
        }
        
        $('#program-' + programid + '-select').attr( 'title', errorstring );
    }
}

function setOperationEnabled( obj, enabled )
{
    if( enabled != true )
    {
        obj.addClass( 'disabledOperation' )
           .removeClass( 'doableOperation' );
    }
    else
    {
        obj.addClass( 'doableOperation' )
           .removeClass( 'disabledOperation' );
    }
}