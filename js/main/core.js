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

function doAjax( actionPara, outData )
{
    if( outData == undefined )
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
    val = new Number( val );
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
    switch( val )
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
    return "";
}

function intToProgramType( val )
{
    switch( val )
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
    return "";
}

function getProgramSize( type, version )
{
    switch( type )
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

function addTempCacheList( ind, val )
{
    var curr = tempCache( ind );
    curr = curr + "," + val;
    tempCache( ind, val );
}

function removeTempCacheList( ind, val )
{
    var curr = getTempCache( ind );
    if( curr == undefined || curr != curr.toString() )
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
    if( this.values == undefined )
    {
        this.values = new Array();
    }
    var old = this.values[ ind ];
    this.values[ ind ] = val;

    if( updateScreen )
    {
        var obj = $("#" + ind);
        if( obj.length )
        {
            if( typeof updateScreen === "function" )
            {
                updateScreen( obj, val );
            }
            else
            {
                obj.html( val );
            }
        }
        else
        {
            alert( this.values.toString() );
        }
    }
    return old;
}

function runTimeUpdater( object, id, callback )
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

    this.deletions = new Array();
    var i;
    if( object != undefined )
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

        this.values[ this.values.length ] = object;
        this.ids[ this.ids.length ] = id;
        this.callbacks[ this.callbacks.length ] = callback;

        var etic = getTempCache( object ).toString();
        var timestamp = Date.now() / 1000;
        var eticObject = new Date();
        eticObject.setFullYear( etic.substring( 0, 4 ),
                                Number( etic.substring( 4, 6 ) ) - 1,
                                etic.substring( 6, 8 ) );
        eticObject.setHours( etic.substring( 8, 10 ), etic.substring( 10, 12 ),
                             etic.substring( 12, 14 ) );
        var etics = eticObject.getTime() / 1000;
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