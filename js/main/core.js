/**
 * Prepares the prototype that many of the other functions interface to.  Many
 * functions use this.prototype to store data.  This function ensures that
 * object is properly created.
 */
function prepareThis()
{
    if( this.prototype === undefined )
    {
        this.prototype = {
            popupdata: [],
            cacheValues: {},
            clearRegions: {},
            windowClearRegions: [],
            cbs: []
        };
    }
}

/**
 * Performs an AJAX request to the server.  The action is the first parameter
 * and all other parameters should be in an object in the second parameter.
 * 
 * @param actionPara Action parameter to send to the server
 * @param outData Additional parameters to send to the server (optional)
 * @param popup Popup that may reperform this request when refreshed
 */
function doAjax( actionPara, outData, popup )
{
    prepareThis();
    // If a popup is able to reperform this query then serialize it in a way
    // we will be able to understand later.
    if( popup !== undefined )
    {
        var request = "window-" + popup + "-request",
            paras = "window-" + popup + "parameters";
        if( actionPara === undefined && outData === undefined )
        {
            // If both the parameters are undefined then the popup is refreshing
            // and we should set the parameters based on the stored values
            actionPara = this.prototype.popupdata[ request ];
            outData = this.prototype.popupdata[ paras ];
        }
        else
        {
            this.prototype.popupdata[ request ] = actionPara;
            this.prototype.popupdata[ paras ] = outData;
        }
    }
    // Put all the data into one object
    if( outData === undefined || outData === "" )
    {
        outData = {action: actionPara};
    }
    else
    {
        outData[ "action" ] = actionPara;
    }
    // Perform the AJAX query
    $.ajax({
        url: "ajaxhandler.php",
        data: outData,
        success: function( response ){
            // Create the script element
            try
            {
                eval( response );
            }
            catch( error )
            {
                throw new SyntaxError( error.message + "\n" + response );
            }
       }
    });
}

/**
 * Converts an integer to an IP address (string).  Integer is little-endian.
 * 0-2^8 bits are 255.xxx.xxx.xxx 2^9-2^16 bits are xxx.256.xxx.xxx, etc.
 * 
 * @param val Value to convert to an IP address
 * @return IP address (string)
 */
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

/**
 * Utility function to convert an int value to a process operation (string)
 * 
 * @param val Value to convert to a process operation
 * @return String representing the given int's process operation
 */
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

/**
 * Utility function to convert an int value to a program type (string)
 * 
 * @param val Value to convert to a program type
 * @return String representing the given int's program type
 */
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

/**
 * Utility function to get a program's size
 * 
 * @param type Type of program to lookup
 * @param version Version of the program
 * @return Total size of the program
 */
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

/**
 * Updates the cache and clears out any old values from a given window.  Temp
 * cache values are only stored in a given state (clear region).  Once the
 * window leaves that clear region (or is closed) all of the temp cache values
 * associated with that region are also cleared out.
 * 
 * @param win Window that has changed its clear region (or closed)
 * @param cache New cache region the window has gone to
 */
function updateCache( win, cache )
{
    prepareThis();
    var old = this.prototype.windowClearRegions[ win ];
    // If the region hasn't actually changed, don't do anything
    if( old == cache )
    {
        return;
    }
    
    // Set the new clear region
    this.prototype.windowClearRegions[ win ] = cache;
    var arr = new Array();
    var i;
    // Iterate over all the temp cache entries and find which ones had the old
    // clear region
    for( i in this.prototype.clearRegions )
    {
        if( this.prototype.clearRegions[ i ] == old )
        {
            arr.push( i );
        }
    }
    // Iterate over the new list and set the new value to undefined (delete it)
    for( i in arr )
    {
        tempCache( arr[ i ] );
    }
    
    // This is the only place that we are guaranteed to be called
    resetqtip();
}

/**
 * Gets the length of a temp cache list.
 * 
 * @param ind Index of the temp cache entry to get the length of
 * @return Number of entries in the temp cache list
 */
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

/**
 * Adds an item to the temp cache list.  Every time this function is called the
 * temp cache entry with the given index gets appended with the given value.
 * @see removeTempCacheList
 * 
 * @param ind Index in the temp cache
 * @param val Value to add to the temp cache entry
 * @param clearRegion Region that will cause this list to be cleared out
 */
function addTempCacheList( ind, val, clearRegion )
{
    var curr = getTempCache( ind );
    if( curr == "" )
    {
        tempCache( ind, val, clearRegion );
        return;
    }
    var currList = curr.toString().split( "," );
    currList.push( val );
    var joined = currList.join( "," );
    tempCache( ind, joined, clearRegion );
}

/**
 * Removes an item from a temp cache list.  Temp cache lists are simply
 * serialized lists that are stored in the temp cache.  If a temp cache already
 * exists for the given index the new value is appended to the list.
 * @see addTempCacheList
 * 
 * @param ind Index to put into the temp cache
 * @param val Value to add to the list
 * @param clearRegion Region that will cause this list to be cleared out
 */
function removeTempCacheList( ind, val, clearRegion )
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
            tempCache( ind, currList.join( "," ), clearRegion );
        }
    }
}

/**
 * Gets a value from the temp cache
 * 
 * @param ind Index to retrieve from the temp cache.  If there is no entry
 *            then an empty string is returned.
 * @return Value in the temp cache for the given index
 */
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

/**
 * @param ind          Index to set
 * @param val          Value to set
 * @param clearRegions The regions that will cause the index to be unset
 * @param updateScreen calls Function(ind, val, old) or updates screen with \
 *                     the object that has ID of ind with value of val
 */
function tempCache( ind, val, clearRegions, updateScreen )
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
    if( val != undefined )
    {
        this.prototype.cacheValues[ ind ] = val;
    }
    else
    {
        delete this.prototype.cacheValues[ ind ];
        delete this.prototype.clearRegions[ ind ];
    }
    if( clearRegions != undefined )
    {
        this.prototype.clearRegions[ ind ] = clearRegions;
    }
    if( updateScreen )
    {
        var obj = $("#" + ind);
        if( obj.length )
        {
            if( typeof updateScreen === "function" )
            {
                updateScreen( obj, val, old );
            }
            else if( obj.is( "input" ) )
            {
                obj.val( val );
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
 * Gets a value from the perm cache
 * 
 * @param ind Index to retrieve from the perm cache.  If there is no entry
 *            then an empty string is returned.
 * @param def Default value if index isn't found
 * @return Value in the perm cache for the given index
 */
function getPermCache( ind, def )
{
    var ret = localStorage.getItem( ind );
    if( ret == undefined )
    {
        return def == undefined ? "" : def;
    }
    return ret;
}

/**
 * @param ind          Index to set
 * @param val          Value to set
 * @param updateScreen calls Function(ind, val, old) or updates screen with \
 *                     the object that has ID of ind with value of val
 */
function permCache( ind, val, updateScreen )
{
    prepareThis();
    if( ind == undefined )
    {
        alert( "Undefined index for perm cache." );
        return 0;
    }
    ind = ind.toString();
    if( val != undefined )
    {
        val = val.toString();
    }
    var old = localStorage.getItem( ind );
    if( val != undefined )
    {
        localStorage.setItem( ind, val );
    }
    else
    {
        localStorage.removeItem( ind );
    }
    if( updateScreen )
    {
        var obj = $("#" + ind);
        if( obj.length )
        {
            if( typeof updateScreen === "function" )
            {
                updateScreen( obj, val, old );
            }
            else if( obj.is( "input" ) )
            {
                obj.val( val );
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
 * Converts an int into a time string based on the length of the time. Negative
 * values are converted to 0.  All other values are converted to numbers.
 * 
 * @param val Value to convert to string
 * @return String formatted as ##d ##h ##m ##s
 */
function intToTimeString( val )
{
    var remain = toNumber( val );
    // Calculate seconds, minutes, hours, days?
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
    
    // Construct the string
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

    return output;
}

/**
 * Used in creating a countdown.  The first parameter specifies which DOM
 * element is being updated.  If the last parameter is set to true then every
 * second the target time is recalculated from the second parameter otherwise
 * it is simply stored.  It can be either a function or a value.  So long as
 * the target time is greater than now, then the countdown decreases.  The third
 * parameter specifies a unique ID for storing the updater entry.  After the
 * timer reaches 0 the fourth parameter (function) will be run if it is passed.
 * The function is passed the ID and the DOM element as parameters.  Fifth
 * parameter may be sent as true, if it is all other values are ignored, to
 * force all of the ETICs to be reclculated either by the function or the temp
 * cache value in parameter two.
 *
 * @param objectname Name of the object
 * @param object     Name of the temp cache that has the target time or a
                     function to calculate it
 * @param id         Used for calculating when to delete the updater
 * @param callback   Function to call when completely done
 * @param recalc     Set to true to recalculate all objects that use functions
 */
function runTimeUpdater( objectname, object, id, callback, recalc )
{
    // Performs the actual updates to the DOM element
    this.updateItem = function( i ){
        var entry = this.values[ i ];
        var remain = this.remaining[ i ];
        var obj = $("#" + entry);

        // If the DOM element has been lost then delete this entry and abort
        if( obj.length == 0 )
        {
            this.deletions[ this.deletions.length ] = i;
            return;
        }

        // Decrement
        if( remain > 0 )
        {
            remain--;
            this.remaining[ i ] = remain;
        }

        // If there is 0 seconds left delete this and run the callback
        if( remain == 0 )
        {
            this.callbacks[ i ]( this.ids[ i ], obj );
            this.deletions[ this.deletions.length ] = i;
        }
        else
        {
            // Echo out the remaining time to the DOM element
            obj.html( intToTimeString( remain ) );
        }
    };
    // Function that gets called every second and simply updates every item
    this.actualUpdater = function(){
        var i;
        this.deletions = new Array();
        for( i = 0; i < this.values.length; i++ )
        {
            this.updateItem( i );
        }
    };
    // Calculates the remaining amount for each object based on its ID
    // Guarantueed to return a positive value
    this.calculateRemaining = function(object, id){
        var targetTime;
        if( typeof object == 'function' )
        {
            targetTime = object( id );
        }
        else
        {
            var etic = getTempCache( object ).toString();
            var eticObject = new Date();
            eticObject.setTime( etic );
            targetTime = eticObject.getTime() / 1000;
            var timestamp = Date.now() / 1000;
            targetTime = ( eticObject.getTime() / 1000 ) - timestamp;
        }
        return targetTime > 0 ? targetTime : 0;
    };
    // Forces the ETICs to be recalculated
    this.recalculateEtics = function(){
        if( this.values == undefined )
        {
            return;
        }
        var i;
        // Iterate over each value and set the remaining to the new amount
        // Also update the item
        for( i = 0; i < this.values.length; i++ )
        {
            if( typeof this.objects[ i ] == 'function' )
            {
                this.remaining[ i ] =
                    this.calculateRemaining( this.objects[ i ], this.ids[ i ] );
                this.updateItem( i );
            }
        }
    };

    this.deletions = new Array();
    var i;
    // If recalc parameter is true, ignore all other parameters
    if( recalc == true )
    {
        this.recalculateEtics();
        return;
    }
    
    // If object was undefined then this function is being run from the
    // timeout.  But it wasn't...so add it to the list.
    if( object != undefined )
    {
        // Stores the name of the object
        if( this.values == undefined )
        {
            this.values = new Array();
        }
        // Number of seconds remainings
        if( this.remaining == undefined )
        {
            this.remaining = new Array();
        }
        // The ID of the object, sent to the callback
        // Useful for identifying which object it is in the callback
        if( this.ids == undefined )
        {
            this.ids = new Array();
        }
        // Function to be called when counter reaches 0
        if( this.callbacks == undefined )
        {
            this.callbacks = new Array();
        }
        // Either a function or the temp cache that calculates the remaining
        // seconds
        if( this.objects == undefined )
        {
            this.objects = new Array();
        }

        this.values[ this.values.length ] = objectname;
        this.ids[ this.ids.length ] = id;
        this.callbacks[ this.callbacks.length ] = callback;
        this.objects[ this.objects.length ] = object;

        var secsremaining = this.calculateRemaining( object, id );
        this.remaining[ this.remaining.length ] = secsremaining;

        if( this.timer == undefined || this.timer == -1 )
        {
            this.timer = setInterval( "runTimeUpdater();", 1000 );
        }

        this.updateItem( this.values.length - 1 );
        return;
    }
    
    // Alright...this function was called from the timeout...or somebody fucked
    // up. Perform the updates.
    this.actualUpdater();

    // If deletions has elements then we need to delete some stuff.
    if( this.deletions.length )
    {
        // Everything needs to be deleted...simply recreate them
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
            // Specific ones need to be deleted
            // This function will delete individual entries in this function
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

/**
 * Forces the window refresh causing the server to be reasked for the index
 * page.
 */
function forceRefresh()
{
    window.location.reload();
}

/**
 * Converts a value to a number (int not the Object).  The string/Object should
 * be in a workable state because it is simply passed to the Number constructor.
 * 
 * @param val Value to covnert to integer
 * @return int representing the value
 */
function toNumber( val )
{
    return new Number( val ).valueOf();
}

/**
 * Many elements end up getting a 3 part id.  Class-id-property (server-1-type)
 * This function will return the id portion of the element.
 * 
 * @param obj jQuery Object to extract the ID from
 * @return ID of the object
 */
function getSimpleID( obj )
{
    var longid = obj.attr( "id" ).toString();
    var arr = longid.split( "-" );
    return arr[ 1 ];
}

/**
 * Adds a script element to the HTML essentially causing it to be loaded.
 * The optional callback may be added to be called when the script has finished
 * loading.
 * 
 * @param url URL to load from
 * @param callback Optional callback to run after the script has been loaded
 */
function addScriptElement( url, callback )
{
    // Create the script element
    var script = $("<script></script>");
    script.attr( 'type', 'text/javascript' );
    script.attr( 'src', url );
    // If the callback is set, call it after it is loaded
    if( callback != undefined )
    {
        script.load( function(){
            eval( callback );
        });
    }
    // Add it to the head
    $("head").append( script );
}

/**
 * Adds a stylesheet to the HTML essentially causing it to be loaded. The
 * optional callback may be added to be called when the stylesheet has finished
 * loading.
 * 
 * @param url URL to load from
 * @param callback Optional callback to run after the stylesheet has been loaded
 */
function addStylesheet( url, callback )
{
    // Create the element
    var ss = $("<link />");
    ss.attr({
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': url
    });
    // If the callback is set, call it after it is loaded
    if( callback != undefined )
    {
        ss.load( function(){
            eval( callback );
        });
    }
    // Add it to the head
    $("head").append( ss );
}

/**
 * Extend string to convert to camel case.
 * 
 * @return Returns The Camel Case Version
 */
String.prototype.toCamelCase = function(){
    return this.replace(/(?:^|\s)\w/g, function(match){
        return match.toUpperCase();
    });
};

/**
 * Converts any object into a string.  Strings themselves are enclosed in
 * quotes.  If it is a number it is simply returned.  Objects are treated as
 * arrays with each of their properties being elements.  Arrays have each
 * element stringified and have commas insert in between each.
 * 
 * @param obj Object to convert to a string
 * @return String representation of the object
 */
function stringify(obj) {
    var t = typeof obj;
    if( t != "object" || obj === null )
    {
        if( t == "string" )
        {
            obj = '"' + obj + '"';
        }
        return String( obj );
    }
    else
    {
        var n, v, j = [], arr = ( obj && obj.constructor == Array );
        for( n in obj )
        {
            v = obj[ n ];
            t = typeof obj;
            if( t == "string" )
            {
                v = '"' + v + '"';
            }
            else if( t == "object" && v !== null )
            {
                v = stringify( v );
            }
            j.push( ( arr ? "" : '"' + n + '":' ) + String(v) );
        }
        return (arr ? "[" : "{") + String(j) + (arr ? "]" : "}");
    }
}

/**
 * Creates an updateable input.  Whenever the user has finished updating the
 * input it will automatically request the server to update it.  Sends an ajax
 * request with the action along with two parameters.  The first is NAME which
 * is the new value of the input.  The second puts together the values of the
 * two parameters.
 * 
 * @param id ID of the input
 * @param val Original value of the input
 * @param action Action to send in the ajax call
 * @param ajaxpara Name of the custom ajax parameter
 * @param ajaxval Name of the custom ajax value
 */
function createUpdateableInput( id, val, action, ajaxpara, ajaxval )
{
    return $("<input type='text'>").addClass( "semihidden" )
      .attr( "title", "Click to edit" ).attr( "id", id ).val( val )
    .hover(function(){
        $(this).addClass("semihiddenhover");
    }, function(){
        $(this).removeClass("semihiddenhover");
    }).focus(function(){
        $(this).addClass("semihiddenactive");
    }).blur(function(){
        $(this).removeClass("semihiddenactive");
        var oldVal = getTempCache( id );
        var newVal = $(this).val();
        if( oldVal != newVal )
        {
            var paras = {};
            paras[ "NAME" ] = newVal;
            if( ajaxpara != undefined && ajaxval != undefined )
            {
                paras[ ajaxpara ] = ajaxval;
            }
            doAjax( action, paras );
        }
    });
}

/**
 * Ensures that all DOM elements (and script elements) that contain the given ID
 * are deleted
 * 
 * @param name Name of elements to delete
 */
function deleteAllElementsById( name )
{
    var ID = name.replace( /\s/, '_' );
    var elem = $("#" + ID);
    while( elem.length )
    {
        elem.remove();
        elem = $("#" + ID);
    }
    $("script[href~='" + ID.toLowerCase() + "']").remove();
}

/**
 * Performs cleanup whenever the user leaves the website
 */
function leavingWebsite()
{
    $(".popup").dialog( "close" );
}

window.onunload = leavingWebsite;