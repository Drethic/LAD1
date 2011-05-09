function startExchangeProgram( id )
{
    var context = getPopupContext( 'Servers' );
    var points = toNumber( getTempCache( "program-" + id + "-version" ) ) - 1;
    var currcpu = toNumber( getTempCache( "servercpu" ) );
    var currram = toNumber( getTempCache( "serverram" ) );
    var currhdd = toNumber( getTempCache( "serverhdd" ) );
    var currbw = toNumber( getTempCache( "serverbw" ) );
    var cpustep = toNumber( getDefault( "STEP_CPU" ) );
    var ramstep = toNumber( getDefault( "STEP_RAM" ) );
    var hddstep = toNumber( getDefault( "STEP_HDD" ) );
    var bwstep = toNumber( getDefault( "STEP_BW" ) );
    context.empty().append(
        $("<span class='center'></span>")
            .append("Exchange Value:")
            .append("<span id='exchangeremain'>" + points + "</span>")
            .append("/")
            .append("<span id='exchangetotal'>" + points + "</span>")
    ).append(
        $("<table><tr><th title='Area of the server to upgrade'>Region</th>" +
          "<th title='Current value of the region'>Current</th>" +
          "<th>Upgrade Slider</th><th title='New value of the region'>" +
          "Result</th></tr></table>")
            .append( createRow( "CPU", currcpu, cpustep, points ) )
            .append( createRow( "RAM", currram, ramstep, points ) )
            .append( createRow( "HDD", currhdd, hddstep, points ) )
            .append( createRow( "BW", currbw, bwstep, points ) )
    ).append(
        $("<div></div>").append(
            $("<div style='float:right' id='commitexchange'>" +
              "Exchange</submit>").click(function(){
                doAjax( "exchangeprograms", {
                    PROGRAM_ID: id,
                    CPU_UP: calculateRegionPointsUsed( "CPU" ),
                    RAM_UP: calculateRegionPointsUsed( "RAM" ),
                    HDD_UP: calculateRegionPointsUsed( "HDD" ),
                    BW_UP: calculateRegionPointsUsed( "BW" )
                });
            }).button({disabled: true})
        ).append(
            $("<div style='float:right'>Go Back</button>").click(function(){
                refreshCurrent( "Servers" );
            }).button()
        )
    );
}

function calculateRegionPointsUsed( region )
{
    var obj = $("#" + region + "Slider");
    var value = toNumber( obj.slider( "value" ) );
    var min = toNumber( obj.slider( "option", "min" ) );
    var step = toNumber( obj.slider( "option", "step" ) );
    return ( value - min ) / step;
}

function calculateRemainingPoints()
{
    return toNumber( $("#exchangetotal").html() ) -
           calculateRegionPointsUsed( "CPU" ) -
           calculateRegionPointsUsed( "RAM" ) -
           calculateRegionPointsUsed( "HDD" ) -
           calculateRegionPointsUsed( "BW" );
}

function refreshExchangeSliders()
{
    var pointsremaining = calculateRemainingPoints();
    $("#exchangeremain").html( pointsremaining );
    
    $("#CPUSlider, #RAMSlider, #HDDSlider, #BWSlider").each(function(index, domEl){
        var obj = $(domEl);
        var min = toNumber( obj.slider( "option", "min" ) );
        var value = toNumber( obj.slider( "value" ) );
        var step = toNumber( obj.slider( "option", "step" ) );
        var pointsused = ( value - min ) / step;
        var totalavailpoints = pointsused + pointsremaining;
        var max = min + ( totalavailpoints * step );
        obj.slider( "option", "max", max );
        obj.slider( "value", value );
    });
    
    if( pointsremaining == 0 )
    {
        $("#commitexchange").button( "enable" );
    }
    else
    {
        $("#commitexchange").button( "disable" );
    }
}

function createRow( name, minpoints, steppoints, availpoints )
{
    var res = $("<tr id='" + name + "row'></tr>");
    res.append( "<td>" + name + "</td>" );
    res.append( "<td>" + minpoints + "</td>" );
    var slidertd = $("<td></td>").appendTo( res );
    res.append( "<td id='" + name + "Result' style='text-align:right'>" +
                minpoints + "</td>" );
    var slider = $("<div></div>").appendTo( slidertd );
    slider.slider({
        min: minpoints,
        max: minpoints + ( availpoints * steppoints ),
        step: steppoints,
        value: minpoints,
        change: function(event, ui){
            if( event.originalEvent == undefined )
            {
                return;
            }
            refreshExchangeSliders();
            $("#" + name + "Result").html(ui.value);
        }
    });
    slider.attr( "id", name + "Slider" );
    return res;
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
        serverPrograms( programarray );
    }
    else
    {
        noServerPrograms();
    }
    if( processesvalid )
    {
        serverProcesses( processarray );
    }
    else
    {
        noServerProcesses();
    }

    endServerView();
    removeServerProgram( programid );
    applyExchangeAnimation( "servercpu", cpu, cpuUp );
    applyExchangeAnimation( "serverram", ram, ramUp );
    applyExchangeAnimation( "serverhdd", hdd, hddUp );
    applyExchangeAnimation( "serverbw", bw, bwUp );
}

function applyExchangeAnimation( objectname, orig, up )
{
    if( up )
    {
        var prefix = "<span class='positivemodifier'>&nbsp;&nbsp;&nbsp;&nbsp;+";
        var postfix = "</span>";
        $(prefix + up + postfix)
            .appendTo( $('#' + objectname) )
            .delay( 1000 )
            .fadeOut( 100 )
            .fadeIn( 100 )
            .fadeOut( 100 )
            .fadeIn( 100 )
            .delay( 1000 )
            .fadeOut( 300 )
            .queue(function() {
                tempCache( objectname, orig + up, true );
            });
    }
    
}