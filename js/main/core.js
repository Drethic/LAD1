function lEv()
{
    var lEv = loginError;
    return lEv;
}

function restoreForm(frm)
{
    $("#" + frm + " input,#" + frm + " button").button( "enable" )
      .button( "refresh" ).attr( "disabled", false )
      .attr( "readonly", false );
}

function prepareThis()
{
    if( this.prototype == undefined )
    {
        this.prototype = {
            popupdata: new Array(),
            cacheValues: new Array()
        }
    }
}

function doAjax( actionPara, outData, popup )
{
    prepareThis();
    if( popup != undefined )
    {
        var request = "window-" + popup + "-request";
        var paras = "window-" + popup + "parameters";
        if( actionPara == undefined && outData == undefined )
        {
            actionPara = this.prototype.popupdata[ request ];
            outData = this.prototype.popupdata[ paras ];
        }
        else
        {
            this.prototype.popupdata[ request ] = actionPara;
            this.prototype.popupdata[ paras ] = outData;
        }
    }
    if( outData == undefined || outData == "" )
    {
        outData = {action: actionPara};
    }
    else
    {
        outData[ "action" ] = actionPara;
    }
    $.ajax({
       url: "ajaxhandler.php",
       data: outData,
       dataType: "script"
    });
}

function intToIP( val )
{
    val = toNumber( val );
    var ret = "";
    var median = val & 255;
    ret += median.toString();
    val -= median;
    val /= 256;
    median = val & 255;
    ret += "." + median.toString();
    val -= median;
    val /= 256;
    median = val & 255;
    ret += "." + median.toString();
    val -= median;
    val /= 256;
    ret += "." + median.toString();
    return ret;
}

function intToProcessOperation( val )
{
    var nval = toNumber( val );
    switch( nval )
    {
        case 1:
            return "Transfer";
        case 2:
            return "Research";
        case 3:
            return "Encrypt";
        case 4:
            return "Decrypt";
        case 5:
            return "Delete";
        case 6:
            return "Copy";
        case 7:
            return "Install";
        case 8:
            return "Uninstall";
    }
    alert( "Invalid process operation {" + val + "} with type " + typeof val );
    return "";
}

function intToProgramType( val )
{
    var nval = toNumber( val );
    switch( nval )
    {
        case 1:
            return "Firewall";
        case 2:
            return "Firewall Bypasser";
        case 3:
            return "Password";
        case 4:
            return "Password Breaker";
        case 5:
            return "Encryptor";
        case 6:
            return "Decryptor";
        case 7:
            return "Malware";
    }
    alert( "Invalid program type {" + val + "} with type " + typeof val );
    return "";
}

function getProgramSize( type, version )
{
    switch( toNumber( type ) )
    {
        case 1:
            return version * 5;
        case 2:
            return version * 10;
        case 3:
            return version * 2;
        case 4:
            return version * 4;
        case 5:
            return version * 40;
        case 6:
            return version * 40;
        case 7:
            return version * 25;
    }
}

function getTempCacheListLength( ind )
{
    var indstring = getTempCache( ind ).toString();
    if( indstring == "" || indstring == undefined )
    {
        return 0;
    }
    var elems = indstring.split( "," );
    return elems.length;
}

function addTempCacheList( ind, val )
{
    var curr = getTempCache( ind );
    if( curr == "" )
    {
        tempCache( ind, val );
        return;
    }
    var currList = curr.toString().split( "," );
    currList.push( val );
    var joined = currList.join( "," );
    tempCache( ind, joined );
}

function removeTempCacheList( ind, val )
{
    var curr = getTempCache( ind );
    if( curr == "" )
    {
        return;
    }
    var currList = curr.toString().split( "," );
    for( var i = 0; i < currList.length; i++ )
    {
        if( currList[ i ] == val )
        {
            currList.splice( i, 1 );
            tempCache( ind, currList.join( "," ) );
        }
    }
}

function getTempCache( ind )
{
    var ret = tempCache( ind, 0 );
    tempCache( ind, ret );
    if( ret == undefined )
    {
        return "";
    }
    return ret;
}

function tempCache( ind, val, updateScreen )
{
    prepareThis();
    if( ind == undefined )
    {
        alert( "Undefined index for temp cache." );
        return 0;
    }
    ind = ind.toString();
    if( val != undefined )
    {
        val = val.toString();
    }
    var old = this.prototype.cacheValues[ ind ];
    this.prototype.cacheValues[ ind ] = val;
    if( updateScreen )
    {
        var obj = $("#" + ind);
        if( obj.length )
        {
            if( typeof updateScreen === "function" )
            {
                updateScreen( obj, val, old );
            }
            else
            {
                obj.html( val );
            }
        }
    }
    return old;
}

/**
 * @param object   Name of the object that has the remaining milliseconds or
 *                 a function to calculate it
 * @param id       Used for calculating when to delete the updater
 * @param callback Function to call when completely done
 * @param recalc   Set to true to recalculate all objects that use functions
 */
function runTimeUpdater( object, id, callback, recalc )
{
    this.updateItem = function( i ){
        var entry = this.values[ i ];
        var remain = this.remaining[ i ];
        var obj = $("#" + entry);

        if( obj.length == 0 )
        {
            this.deletions[ this.deletions.length ] = i;
            return;
        }

        if( remain > 0 )
        {
            remain--;
            this.remaining[ i ] = remain;
        }

        var seconds = Math.floor( remain % 60 );
        remain -= seconds;
        remain /= 60;
        var minutes = Math.floor( remain % 60 );
        remain -= minutes;
        remain /= 60;
        var hours = Math.floor( remain % 24 );
        remain -= hours;
        remain /= 24;
        var days = Math.floor( remain );

        if( days == 0 && hours == 0 && minutes == 0 && seconds == 0 )
        {
            this.callbacks[ i ]( this.ids[ i ], obj );
            this.deletions[ this.deletions.length ] = i;
        }
        else
        {
            var output = "";
            if( days > 0 )
            {
                output = days.toString() + "d ";
            }
            if( hours > 0 || output != "" )
            {
                output += hours.toString() + "h ";
            }
            if( minutes > 0 || output != "" )
            {
                output += minutes.toString() + "m ";
            }
            output += seconds.toString() + "s ";

            obj.html( output );
        }
    };
    this.actualUpdater = function(){
        var i;
        this.deletions = new Array();
        for( i = 0; i < this.values.length; i++ )
        {
            this.updateItem( i );
        }
    };
    this.calculateRemaining = function(object){
        if( typeof object == 'function' )
        {
            return object();
        }
        else
        {
            var etic = getTempCache( object ).toString();
            var eticObject = new Date();
            eticObject.setTime( etic );
            return eticObject.getTime() / 1000;
        }
    }
    this.recalculateEtics = function(){
        var i;
        for( i = 0; i < this.values.length; i++ )
        {
            if( typeof this.objects[ i ] == 'function' )
            {
                this.values[ i ] = this.calculateRemaining( this.objects[ i ] );
            }
        }
    }

    this.deletions = new Array();
    var i;
    if( recalc == true )
    {
        this.recalculateEtics();
    }
    else if( object != undefined )
    {
        if( this.values == undefined )
        {
            this.values = new Array();
        }
        if( this.remaining == undefined )
        {
            this.remaining = new Array();
        }
        if( this.ids == undefined )
        {
            this.ids = new Array();
        }
        if( this.callbacks == undefined )
        {
            this.callbacks = new Array();
        }
        if( this.objects == undefined )
        {
            this.objects = new Array();
        }

        this.values[ this.values.length ] = object;
        this.ids[ this.ids.length ] = id;
        this.callbacks[ this.callbacks.length ] = callback;
        this.objects[ this.objects.length ] = object;

        var etics = this.calculateRemaining( object );
        var timestamp = Date.now() / 1000;
        var secsremaining = etics > timestamp ? etics - timestamp : 0;
        this.remaining[ this.remaining.length ] = secsremaining;

        if( this.timer == undefined || this.timer == -1 )
        {
            this.timer = setInterval( "runTimeUpdater();", 1000 );
        }

        this.updateItem( this.values.length - 1 );
    }
    else
    {
        this.actualUpdater();

        if( this.deletions.length )
        {
            if( this.deletions.length == this.values.length )
            {
                this.values = new Array();
                this.remaining = new Array();
                this.ids = new Array();
                this.callbacks = new Array();
                clearInterval( this.timer );
                this.timer = -1;
            }
            else
            {
                this.deleteItem = function( i ){
                    var len = this.values.length;
                    for( ; i < len - 1; i++ )
                    {
                        this.values[ i ] = this.values[ i + 1 ];
                        this.remaining[ i ] = this.remaining[ i + 1 ];
                        this.ids[ i ] = this.ids[ i ];
                        this.callbacks[ i ] = this.callbacks[ i + 1 ];
                    }
                };
                // Delete deletions from all arrays
                var offset = 0;
                for( i = 0; i < this.deletions.length; i++ )
                {
                    this.deleteItem( this.deletions[ i ] - offset );
                    offset++;
                    this.values.pop();
                    this.remaining.pop();
                    this.ids.pop();
                    this.callbacks.pop();
                }
            }
        }
    }
}

function forceRefresh()
{
    window.location.reload();
}

function toNumber( val )
{
    return new Number( val ).valueOf();
}

function getSimpleID( obj )
{
    var longid = obj.attr( "id" ).toString();
    var arr = longid.split( "-" );
    return arr[ 1 ];
}

function addScriptElement( url, callback )
{
    //var script = document.createElement( 'script' );
    //script.type = 'text/javascript';
    //script.src = url;
    var script = $("<script>");
    script.attr( 'type', 'text/javascript' );
    script.attr( 'src', url );
    script.load( function(){
        eval( callback );
    });
    $("head").append( script );
    //var head = document.getElementsByTagName( "head" )[ 0 ];
    //head.appendChild( script );
    //$("body").append( script );
}