function getProcessCount()
{
    return getTempCacheListLength( "processes" );
}

function getProgramCount()
{
    return getTempCacheListLength( "programs" );
}

/**
 * @return An array of the programs (may be empty)
 */
function getProgramArray()
{
    var programstring = getTempCache( "programs" ).toString();
    if( programstring == "" )
    {
        return new Array();
    }
    return programstring.split( "," );
}

/**
 * @return An array of the processes (may be empty)
 */
function getProcessArray()
{
    var processstring = getTempCache( "processes" ).toString();
    if( processstring == "" )
    {
        return new Array();
    }
    return processstring.split( "," );
}

function getServerDetailSum( type )
{
    var elems;
    var prefix;
    var suffix;
    if( type == "hdd" )
    {
        elems = getProgramArray();
        prefix = "program";
        suffix = "size";
    }
    else
    {
        elems = getProcessArray();
        prefix = "process";
        suffix = type;
    }
    var sum = 0;
    for( var i = 0; i < elems.length; i++ )
    {
        sum += toNumber( getTempCache( prefix + "-" + 
                                       elems[ i ] + "-" + suffix ) );
    }
    return sum;
}

function getServerDetailAvailable( type )
{
    var total = toNumber( getTempCache( "server" + type ) );
    var used = getServerDetailSum( type );

    var free = total - used;
    if( free < 0 )
    {
        free = 0;
    }
    return free;
}

/**
 * Calculates the remaining time for a process to complete based on the
 * remaining cycles and its 1.0 operating frequency
 * 
 * @param cpu             The 1.0 operating frequency of the program
 * @param remainingCycles The number of cycles that are remaining
 * @return Remaining time for the process
 */
function calculateETIC( cpu, remainingCycles )
{
    /**
     * The rate at which the process is running with server OR multiplied
     */ 
    var rate = cpu * toNumber( getTempCache( "servercpuratio" ) );
    /**
     * The last time the server was updated
     */
    var lastupdate = toNumber( getTempCache( "lastServerUpdateTime") );
    /**
     * The object for now
     */
    var nowDate = new Date();
    /**
     * The seconds for now
     */
    var nowsecs = Math.round( nowDate.getTime() / 1000 );
    /**
     * Time since the last update (now - lastupdate) in seconds
     */
    var sinceupdate = nowsecs - lastupdate;
    /**
     * Remaining time for the process ( cycles / rate ) - lastupdate
     */
    var remainingtime = Math.round( remainingCycles / rate ) - sinceupdate;
    return remainingtime;
}