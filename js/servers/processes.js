function noServerProcesses()
{
    $('#processdiv').html( "This server has no processes!" );
    //resizeHeight($('#serverpu'));
}

function serverProcesses( list )
{
    for( var i = 0; i < list.length; i++ )
    {
        var pro = list[ i ];
        addServerProcess( pro[ 0 ], pro[ 1 ], pro[ 2 ], pro[ 3 ], pro[ 4 ],
                          pro[ 5 ], pro[ 6 ], pro[ 7 ], pro[ 8 ], pro[ 9 ] );
    }
}

function addServerProcess( id, targetprog, owningserver, cpu, ram, bw,
                           operation, linkid, cyclescomplete, cyclesremain )
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
    
    var etic = calculateETIC( cyclesremain );
    tempCache( "process-" + id + "-cyclescomplete", cyclescomplete );
    tempCache( "process-" + id + "-cyclesremain", cyclesremain );
    tempCache( "process-" + id + "-completetime", etic );

    addTempCacheList( "processes", id );

    runTimeUpdater( "process-" + id + "-completetime", function(){
            return calculateETIC( cpu, getTempCache( "process-" + id + 
                                                     "-cyclesremain" ) );
        }, id, function(id,domEl) {
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
}

function startedResearch( programid, processid, remainingcycles )
{
    addServerProcess( processid, programid, getTempCache("currentserver"),
                      getDefault( "RESEARCH_CPU" ),
                      getDefault( "RESEARCH_RAM" ), 0,
                      getDefault( "OP_RESEARCH" ), 0, 0, remainingcycles );
    updateProgramOperations();
    updateAllServerConsumptions();
}

function removeProcess( id, callback, postcallback )
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
        
        if( postcallback != undefined )
        {
            postcallback( id );
        }

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
    removeProcess( processid, undefined, updateAllServerConsumptions );
}

function startedDeletion( programid, processid, remainingcycles )
{
    addServerProcess( processid, programid, getTempCache("currentserver"),
                      getDefault( "DELETE_CPU" ),
                      getDefault( "DELETE_RAM" ), 0,
                      getDefault( "OP_DELETE" ), 0, 0, remainingcycles );
    updateProgramOperations();
}

function finishedDeletion( processid )
{
    $("#process-" + processid + "-row").addClass( "doableOperation" );

    var progid = getTempCache( "process-" + processid + "-target" );
    removeServerProgram( progid );
    removeProcess( processid, undefined, updateAllServerConsumptions );
}

function updateProcessProgress( procid, completed, remaining )
{
    tempCache( "process-" + procid + "-cyclescomplete", completed );
    tempCache( "process-" + procid + "-cyclesremain", remaining );
}