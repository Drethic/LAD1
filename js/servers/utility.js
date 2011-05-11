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