/**
 * Updates the CPU server consumption.  The CPU line is displayed
 * significantly differently from the other three lines and thus has its own
 * handler.  This function performs all of the calculations and pipes the
 * values into @see applyModificationToServerStat so that it may be updated.
 * The temp cache "servercpuconsumption" is taken as an input for the used
 * amount whereas the temp cache "servercpu" is the total.  The temp cache
 * "servercpuratio" is written to provide for access later.
 */
function updateServerConsumptionCPU( )
{
    /**
     * New CPU consumption
     */
    var cpuSum = getServerDetailSum( "cpu" );
    /**
     * New CPU total available
     */
    var total = toNumber( getTempCache( "servercpu" ) );
    
    /**
     * The ratio is 1:1 so let's have 2 decimal places
     */ 
    var ratio = Math.round( total / cpuSum * 100 ) / 100;
    
    /**
     * Calculate the old sum
     */
    var oldSum = toNumber( getTempCache( "servercpuconsumption" ) );
    
    /**
     * For CPU it is good to have less consumed, true/false
     */ 
    var isGood = cpuSum < oldSum;
    
    // Make sure we're not in an awkward rendering situation
    if( total == oldSum && $('#servercpuconsumption').html() != "" )
    {
        return;
    }
    
    // In case there aren't any processes running, set the ratio to 0
    if( ratio == Number.POSITIVE_INFINITY )
    {
        ratio = 0;
    }
    
    // Apply the modification
    applyModificationToServerStat(
        "servercpuconsumption",
        cpuSum,
        isGood,
        cpuSum - oldSum,
        function(elem,value){
            $(elem).html(getProcessCount() + " @ " + ratio);
        }
    );
        
    // Update the cache
    tempCache( "servercpuratio", ratio, "Server-View" );
    runTimeUpdater( undefined, undefined, undefined, undefined, true );
}

/**
 * Updates a server consumption detail row.  Uses first parameter to determine
 * what type of consumption is being updated.  Second parameter is used when
 * a change to the total available occurs.  Because CPU is handled specially,
 * it is passed to @see updateServerConsumptionCPU.
 * 
 * @param type One of "cpu", "ram", "hdd", "bw"
 * @param newtotal New total value for the consumption row
 */
function updateServerConsumption( type, newtotal )
{
    if( type == "cpu" )
    {
        updateServerConsumptionCPU();
        return;
    }
    /**
     * Calculated sum (new)
     */
    var sum = getServerDetailSum( type );
    /**
     * Calculated total (either from the parameter or from the temp cache
     */
    var total = newtotal == undefined ? 
        toNumber( getTempCache( "server" + type ) ) : newtotal;
    /**
     * Ratio of sum:total * 100 rounded to 2 decimal places (percentage)
     */
    var ratio = Math.round( sum / total * 10000 ) / 100;
    /**
     * Old sum (from temp cache)
     */
    var oldsum = toNumber( getTempCache( "server" + type + "consumption" ) );
    /**
     * Good means the new sum is less than the old sum
     */
    var isGood = sum < oldsum;
    // Abort if there are no changes
    // Also abort if the element is already populated
    if( sum == oldsum && $('#server' + type + 'consumption').html() != "" )
    {
        return;
    }
    // Set the ratio to 0 if it is infinity
    if( ratio == Number.POSITIVE_INFINITY )
    {
        ratio = 0;
    }
    // And apply the modification pretty like
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

/**
 * Updates server consumptions for "hdd", "ram", "bw" and "cpu"
 */
function updateAllServerConsumptions( )
{
    updateProcessConsumptions();
    updateServerConsumption( "hdd" );
}

/**
 * Updates server consumptions for "cpu", "ram" and "bw"
 */
function updateProcessConsumptions( )
{
    updateServerConsumptionCPU();
    updateServerConsumption( "ram" );
    updateServerConsumption( "bw" );
}

/**
 * Called when a server detail has been updated/created.  If oldvalue is not
 * defined then the detail is simply written, otherwise a modification animation
 * is performed.
 * 
 * @param type One of "hdd", "ram", "bw" and "cpu"
 * @param value New value for the server detail
 * @param oldvalue Old value for the server detail
 */
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

/**
 * Sets the last time the server was updated in the temp cache and forces the
 * CPU detail to recompute.
 * 
 * @param lastTime Last time the server was updated (in seconds)
 */
function lastServerUpdateTime( lastTime )
{
    tempCache( "lastServerUpdateTime", lastTime, "Server-View" );
    updateServerConsumptionCPU();
}

/**
 * Generates the DOM object for a server detail row
 * 
 * @param type Type of detail that is being generated (used in IDs)
 * @param title Title for the entire row
 * 
 * @return Resulting DOM object
 */
function generateServerDetailRow( type, title )
{
    type = type.toString();
    /**
     * Delimiter between sum and the total
     */
    var delimiter = type == "cpu" ? "=" : "/";
    /**
     * Row that will hold all of the cells
     */
    var row = $('<tr></tr>').attr('title', title);
    
    // First cell (Type/Horizontal Header)
    row.append( $('<td></td>').css('text-transform', 'uppercase').html( type ));
    
    // Second Cell (Consumption)
    row.append( $('<td></td>').append(
      $('<span></span>').attr('id', 'server' + type + 'consumption')
    ));
        
    // Third cell (delimiter/spacer)
    row.append( $('<td></td>').html( delimiter ) );
    
    // Fourth/last cell (value)
    row.append( $('<td></td>').append(
      $('<span></span>').attr('id', 'server' + type)
    ));
    
    // Center align all the cells
    row.children("td").css( "text-align", "center" );
        
    return row;
}

/**
 * Update the temp cache for a server's name
 * 
 * @param id ID of the server
 * @param name The new name of the server
 */
function changedServerName( id, name )
{
    if( name == '' )
    {
        name = "Server #" + id;
    }
    tempCache( "server-" + id + "-customname", name, "Server-View", true );
}

/**
 * Update the temp cache for a program's name
 * 
 * @param id ID of the program
 * @param name The new name of the program
 */
function changedProgramName( id, name )
{
    if( name == '' )
    {
        name = intToProgramType( getTempCache( "program-" + id + "-type" ) ) +
               " #" + id;
    }
    tempCache( "program-" + id + "-customname", name, "Server-View", true );
}

/**
 * Starts a server view.  @see endServerView must also be called when all
 * programs and processes have been added.  Programs are added through @see
 * serverPrograms or @see noServerPrograms.  Processes are added through @see
 * serverProcesses or @see noServerProcesses.  This function will create the
 * needed layout for everything to work together.  It will create the detail
 * table along with setting all of the temp cache values for the server.  It
 * will also create a customizable name field that is the same as the one on the
 * server overview form.
 * 
 * @param id Unique ID of the server
 * @param owner ID of the owner (typically the current user)
 * @param ip IP of the server (int format)
 * @param customname Custom name of the server
 * @param cpu Total CPU the server has
 * @param ram Total RAM the server has
 * @param hdd Total HDD the server has
 * @param bw Total bandwidth the server has
 * @param lastUpdate Last time the server was updated (in secs)
 */
function beginServerView( id, owner, ip, customname, cpu, ram, hdd, bw,
                          lastUpdate )
{
    /**
     * Cache region for the temp cache
     */
    var cache = "Server-View";
    
    // If the custom name is not set, set it.
    customname = verifyServerName( id, customname );
    
    // Set up the server view table
    var context = getPopupContext( "Servers" );
    context.html( "" );
    context.append( $("<table style='width:100%'></table>")
        .append( $( "<tr></tr>" )
           .append( $( "<th colspan=3></th>" )
             .append( createUpdateableInput( "server-" + id + "-customname",
                        customname, "changeservername", "SERVER_ID", id ) ) )
           .append( $( "<th></th>" )
              .append( "&nbsp;&nbsp;&nbsp;IP: <span id='serverip'></span>" ) ) )
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
    // Add the two divs for programs and processes
    context.append("<div id='programdiv'></div>");
    context.append("<div id='processdiv'></div>");
    
    // Set all the temp cache values
    tempCache( "currentserver", id, cache );
    tempCache( "serverowner", owner, cache );
    tempCache( "serverip", ip, cache, function(elem, val) {
        $(elem).html( intToIP( val ) );
    });
    tempCache( "server-" + id + "-customname", customname, cache );
    tempCache( "servercpu", cpu, cache );
    tempCache( "serverram", ram, cache );
    tempCache( "serverhdd", hdd, cache );
    tempCache( "serverbw", bw, cache );
    tempCache( "processes" );
    tempCache( "programs" );
    tempCache( "lastServerUpdateTime", lastUpdate, cache );
}

/**
 * Finishes a server view.  Ensures the popup is properly visible, updates all
 * of the server detail rows and clears all other cache regions for Servers.
 */
function endServerView()
{
    resizePopup( "Servers" );
    updateProgramOperations();
    updateServerDetail( "ram", getTempCache( "serverram" ) );
    updateServerDetail( "hdd", getTempCache( "serverhdd" ) );
    updateServerDetail( "bw", getTempCache( "serverbw" ) );
    updateServerDetail( "cpu", getTempCache( "servercpu" ) );
    updateCache( "Servers", "Server-View" );
}

/**
 * No server programs are on the server, calls @see enableFreePrograms.
 */
function noServerPrograms()
{
    $('#programdiv').html( "This server has no programs!" );
    enableFreePrograms();
}

/**
 * Creates a table for the programs to reside in.  Each program is added to the
 * table via @see addServerProgram
 */
function serverPrograms( list )
{
    $('#programdiv').html( "<table id='programtable' style='width:100%'>" +
                           "<thead><td>Program Type" +
                           "</td><td>Size (MB)</td><td>Version</td><td>" +
                           "Operation</td></thead></table>" );

    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        addServerProgram( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ],
                          pro[ 5 ] );
    }
    resizePopup( "Servers" );
}

/**
 * Checks if free programs should be enabled.  This will call @see
 * enableFreePrograms if the server is missing one of FW/PW Breaker/Bypasser.
 */
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

/**
 * Enables getting free programs
 */
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

/**
 * Adds a program to the current server.  Starts by adding the necessary HTML
 * to the program table.  Adds the correct callbacks for the drop down actions.
 * Set up the temp cache vars.  Finally, check if free programs can be updated.
 * 
 * @param id Unique ID of the program
 * @param serverid ID of the server the program belongs to
 * @param customname Custom name of the program (defaults to Type #ID)
 * @param type Type of programs, text from @see intToProgramType
 * @param size Size of the program, calculated from server defs
 * @param version Version of the program
 */
function addServerProgram( id, serverid, customname, type, size, version )
{
    // Set a good custom name if it is emtpy
    if( customname == '' )
    {
        customname = intToProgramType( type ) + " #" + id;
    }
    var cache = "Server-View";
    // DOM Object to add to the programs table
    $("<tr></tr>").attr( "id", "program-" + id + "-row" ).append(
      // Program name/type
      $("<td></td>").append(
        createUpdateableInput( "program-" + id + "-customname",
          customname, "changeprogramname", "PROGRAM_ID", id )
        .attr("name", "type"))
    ).append(
        $("<td></td>").attr({
            id: "program-" + id + "-size",
            name: "size"
        })
    ).append(
        $("<td></td>").attr({
            id: "program-" + id + "-version",
            name: "version"
        })
    ).append(
        $("<td></td>").append(
          $("<select></select>").attr( "id", "program-" + id + "-select")
            .append( "<option>Select one...</option>" +
                     "<option id='research-" + id + "'>Research</option>" +
                     "<option id='delete-" + id + "'>Delete</option>" +
                     "<option id='exchange-" + id + "'>Exchange</option>" +
                     "<option id='execute-" + id + "'>Execute</option>" )
            .change(function(evt){
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
                checker( "Execute", function(){
                    doAjax( "executeprogram", {
                        PROGRAM_ID: id
                    });
                });
                checker( "Halt", function(){
                    doAjax( "haltprogram", {
                        PROGRAM_ID: id
                    });
                });
                if( value != "Select one..." )
                {
                    $(this).val( "Select one..." );
                }
            })
        )
    ).appendTo( $( "#programtable" ) );
    tempCache( "program-" + id + "-server", serverid, cache );
    tempCache( "program-" + id + "-type", type, cache, function(elem,val){
        $(elem).html( intToProgramType( val ) );
    });
    tempCache( "program-" + id + "-customname", customname, cache );
    tempCache( "program-" + id + "-size", size, cache, true );
    tempCache( "program-" + id + "-version", version, cache, true );

    addTempCacheList( "programs", id, cache );
    checkFreePrograms();
}

/**
 * Removes a server program.  Hides the table row, updates the cache values and
 * calls the optional callbacks.  The first callback is called immediately after
 * the row has hidden and before the temp cache values are updated.  The second
 * callback is called after the temp cache values are updated.
 * 
 * @param id ID of the program to remove
 * @param callback Pre-temp cache update callback to call (optional)
 * @param postcallback Post-temp cache update callback to call (optional)
 */
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

        removeTempCacheList( "programs", id, "Server-View" );
        
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

/**
 * Called when the server has been given the free program(s).  If any of the IDs
 * are set to 0 then the program was not added.
 * 
 * @param fwdid Firewall defender ID
 * @param fwbid Firewall breaker ID
 * @param pwdid Password defender ID
 * @param pwbid Password breaker ID
 */
function grantedFreePrograms( fwdid, fwbid, pwdid, pwbid )
{
    // Get rid of the free program DIV as it is no longer applicable.
    $('#freeprogramdiv').replaceWith( "" );
    /**
     * jQuery object of the program table
     */
    var programtable = $('#programtable');
    // Create the program table if it does not already exist.
    if( programtable.length == 0 )
    {
        $('#programdiv').html( "<table id='programtable'></table>" );
        programtable = $('#programtable');
    }

    var serverid = getTempCache('currentserver');

    // Add the Firewall Defender if it was added
    if( fwdid != 0 )
    {
        addServerProgram( fwdid, serverid, "", 1, getProgramSize( 1, 1 ), 1 );
    }
    // Add the Firewall Breaker if it was added
    if( fwbid != 0 )
    {
        addServerProgram( fwbid, serverid, "", 2, getProgramSize( 2, 1 ), 1 );
    }
    // Add the Password Defender if it was added
    if( pwdid != 0 )
    {
        addServerProgram( pwdid, serverid, "", 3, getProgramSize( 3, 1 ), 1 );
    }
    // Add the Password Breaker if it was added
    if( pwbid != 0 )
    {
        addServerProgram( pwbid, serverid, "", 4, getProgramSize( 4, 1 ), 1 );
    }

    // Update available program operations and all detail rows.
    updateProgramOperations();
    updateAllServerConsumptions();
}

/**
 * Updates which operations are able to be performed by each program.  Each
 * dropdown option will be enabled/disabled based on its criteria.  If the
 * option is disabled it will have a title set for why it is disabled.
 */
function updateProgramOperations( )
{
    // Get the current program listing as an array.  If there are no programs,
    // simply return
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

    // Get the current process listing as an array
    var processstring = getTempCache( "processes" ).toString();
    var processes = new Array();
    if( processstring != "" )
    {
        processes = processstring.split( "," );
    }
    
    // Set up some vars.
    var i, program;
    //  Set up some arrays that determine if a program can perform an operation
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

/**
 * Sets an operation to enabled/disabled.  Enabling will add the doableOperation
 * class and remove the disabled attribute.  Disabling will add the
 * disabledOperation class and add the disabled attribute.
 * 
 * @param obj jQuery object to change
 * @param enabled Whether to enable/disable
 */
function setOperationEnabled( obj, enabled )
{
    if( enabled != true )
    {
        obj.addClass( 'disabledOperation' )
           .removeClass( 'doableOperation' )
           .attr( "disabled", "disabled" );
    }
    else
    {
        obj.addClass( 'doableOperation' )
           .removeClass( 'disabledOperation' )
           .removeAttr( "disabled" );
    }
}