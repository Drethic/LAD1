/**
 * @file gui.js
 * 
 * @todo On window resize, ensure popup height is less than max
 * @todo Sort start menu buttons as added
 */

function indexSetup()
{
    // Setup the basic layout
    $("body").empty()
      .css( "padding", "0px" )
      .append(
          $("<div id='layout-container'>")
            .append("<div id='news' class='ui-layout-east'></div>")
            .append("<div id='header' class='ui-layout-north'></div>")
            .append("<div id='main' class='ui-layout-center'></div>")
      );
    
    // Make the layout into a useable one
    $("#layout-container").layout({
        north: {
           closable: false
        ,  resizable: false
        ,  spacing_open: 0
        }
        ,   east: {
            closable: false
        ,   resizable: false
        ,   spacing_open: 0
        }
        }).sizePane("north", 79);

    $("#main")
    .append("<div id='main-center'>Welcome to LAD.</div>");
    doLogin();
    
    $("#header")
    .append( "<div class='logoLetter'><div class='bigLogoLetter'>L</div>" +
             "ife and <div class='bigLogoLetter'>D</div>eath</div>" );
    
    $("<div>")
      .append("<br>News RSS<br><br>The News will go here and we can do some" +
      "swoopy stuff to it once we start updating the site to normal users.  " +
      "To include a full blown function just to pull it from the DB.")
      .appendTo("#loginform");
      
    resetqtip();
}

/**
 * Call to reset all qtip's using default settings
 */
function resetqtip()
{
    $( "[title]" ).qtip();
}

/**
 * Called upon successful login.  Sets up everything about the GUI and prepares
 * the client for user input.  Creates the layout, adds the taskbar to the
 * layout.  Also adds a center section for performing the main views.  Creates
 * several windows that are used for distinct views.  Finally sets up the start
 * menu so that each button is associated with a specific event.
 * 
 * @param id Unused really...
 */
function validLogin( id )
{
    // Setup the basic layout
    $("body").html("")
      .css( "padding", "0px" )
      .append(
          $("<div id='layout-container'>")
            .append("<div id='taskbar' class='ui-layout-south'></div>")
            .append("<div id='east' class='ui-layout-east'>Chat(closeable)</div>")
            .append("<div id='center' class='ui-layout-center'></div>")
      );
    
    // Make the layout into a useable one
    $("#layout-container").layout({
        south: {
           closable: false
        ,  resizable: false
        ,  spacing_open: 0
        }
        ,   east: {
            initClosed: true
        ,   resizable: false
        }}).sizePane("south", 44);
    
    // Add the start menu
    $("#taskbar")
        .addClass("slide")
        .append("<div id='menu' class='inner ui-corner-tr'>LAD Task Menu</div>")
        .append("<div id='start' class='start-menu-button'></div>");

    // Set up the taskbar to identify with the popup class
    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    // Start the start menu hidden
    $("#menu").css({"display" : "none"});

    // Open the start menu on click
    $('#start').live("click",function(){
        if($(this).hasClass('active'))
        {
            $(this).removeClass('active');
            $("#menu").slideToggle('slow',function(){
                $("#layout-container").layout().resetOverflow('south');
            });
        }
        else
        {
            $(this).addClass('active');
            $("#layout-container").layout().allowOverflow('south');
            $("#menu").slideToggle('slow',function(){
                $(this).css('height', $("#menu").height() + "px");
            });
        }
    });
    
    // Add the logout button to the start menu
    addMenuButton( "Logout", "ui-icon-power", function(){
        window.location = '';
        doLogin();
    });
    
    // Ensure that each popup is sized properly whenever the window resizes
    $(window).resize(function() {
        $('div.popup')
            .css( "max-height", $("#center").height() )
            .css( "max-width", $("#center").width() );
        $('div.popup_body')
            .css( "max-height", $("#center").height() - 22 )
            .css( "max-width", $("#center").width() );
    });
    
    // Setup the start menu to hide if something other than it is clicked and
    // it is open
    $('#center, #east, #taskbar :not(#start,#menu)').click(function(){
        var start = $('#start');
        if( start.hasClass( 'active' ) )
        {
            start.removeClass('active');
            $("#menu").slideToggle('slow',function(){
                $("#layout-container").layout().resetOverflow('south');
            });
        }
    });
    
    // Initialize the options window
    initOptions();
}

function addMenuButton( name, icon, fn )
{
    var id = name.replace( /\s/, '_' );
    var buttonlist = $("#menu button");
    var button = $( "<button id='" + id + "'>" + name + "</button>" );
    if( buttonlist.length == 0 || name == "Logout" )
    {
        $("#menu").append( button );
    }
    else
    {
        $("#menu button").each(function(){
            var tobj = $(this);
            var text = tobj.text();
            if( text.localeCompare( name ) > 0 || text == "Logout" )
            {
                button.insertBefore( tobj );
                return false;
            }
            return true;
        });
    }

    var menuobj = $("button#" + id);
    if( icon != undefined )
    {
        menuobj.button({icons: {primary: icon}});
    }
    var enclosedfn = fn === undefined ? function(){
        alert( name + " INW" );
    } : function( id ){
        var obj = $('div#' + id);
        // Call function if there is no window
        if( obj.length == 0 )
        {
            fn();
            return;
        }
        // Show the window
        // Load offsets
        var x = getPermCache( "win-" + id + "-x" );
        var y = getPermCache( "win-" + id + "-y" );
        var w = getPermCache( "win-" + id + "-width" );
        var h = getPermCache( "win-" + id + "-height" );
        obj.dialog( "widget" ).css({
            'left': x,
            'top': y,
            'width': w,
            'height': h
        });
        obj.dialog( "open" ).empty();
        fn();
        // Fade in the taskbar entry
        if( $('#jTaskBar').find('div#'+id).hasClass('jTask-hidden') )
        {
            $('#jTaskBar').find('div#'+id).removeClass('jTask-hidden');
            obj.fadeIn().queue(function(){
                $(this).updatejTaskBar();
                $(this).dequeue();
            });
        }
    };
    menuobj.click(function(){
        $('#start').click();
        enclosedfn( id );
    });
}

function createWindow( name )
{
    var id = name.replace( /\s/, '_' ),
        widthstr = "win-" + id + "-width",
        heightstr = "win-" + id + "-height";
    return $("<div id='" + id + "'></div>" ).dialog({
        title: name,
        autoOpen: false,
        beforeClose: function(event, ui){
            var div = $(this);
            if( div.dialog( "isOpen" ) != "" )
            {
                permCache( widthstr, div.dialog( "option", "width" ) );
                permCache( heightstr, div.dialog( "option", "height" ) );
            }
            window.location.hash = '';
        },
        width: getPermCache( widthstr, 100 ),
        height: getPermCache( heightstr, 100 )
    }).addClass( 'popup' );
}

function getPopupContext( name )
{
    name = name.toString().replace( " ", "_" );
    return $('div#' + name);
}

function refreshCurrent( name )
{
    doAjax( undefined, undefined, name );
}

function restoreForm(frm)
{
    $("#" + frm + " input,#" + frm + " button").button( "enable" )
      .button( "refresh" ).attr( "disabled", false )
      .attr( "readonly", false );
}

/**
 * The keys of the headers are what are output, if the value === "true" then
 * it is able to be sorted on.
 *
 * @param headers 1-D array of headers
 * @param values 2-D array of values
 * @param cacheprefix Prefix for cache entries, must be unique
 * @param postsortfunc Function(jQuery_table) to call after being sorted
 * @param clearRegion Region for clearing temp cache entries
 */
function makeSortableTable( headers, values, cacheprefix, postsortfunc,
                            clearRegion )
{
    // Variables
    var table = $("<table id='" + cacheprefix + "tbl'></table>"),
        headerrow = $("<tr class='primaryRow'></tr>"),
        i, j, header, thead = $("<thead></thead>"),
        printCells = function(newValues, table){
            table.children( "tbody" ).find( "tr" ).remove();
            for( i = 0; i < newValues.length; i++ )
            {
                var row = $("<tr></tr>"), cell, j = 0;
                if( ( i - 1 ) % 2 === 0 )
                {
                    row.addClass( "alternateRow" );
                }
                else
                {
                    row.addClass( "primaryRow" );
                }
                for( j = 0; j < newValues[ 0 ].length; j++ )
                {
                    cell = newValues[ i ][ j ];
                    row.append( cell );
                }
                table.append( row );
            }

            if( postsortfunc !== undefined )
            {
                postsortfunc( table );
            }
        },customsort = function(a,b){
            var ca = Number(a.html()), cb = Number(b.html());
            if( !isNaN( ca ) )
            {
                if( !isNaN( cb ) )
                {
                    return ca - cb;
                }
                return -1;
            }
            else if( !isNaN( cb ) || a === undefined )
            {
                return 1;
            }
            return a.html().localeCompare( b.html() );
    };

    for( header in headers )
    {
        var cell = $( "<th class='sorttblhead'>" + header + "</th>" );
        if( headers[ header ] === "true" )
        {
            cell.prepend($('<span></span>').addClass('ui-icon').
                addClass('ui-icon-arrowthick-2-n-s').
                css( 'float', 'left' ));
            cell.click(function(){
                // Setup variables
                var sibth = $(this).siblings("th"),
                    sibicons = sibth.children(".ui-icon"),
                    thisicon = $(this).children(".ui-icon"),
                    index = $(this).prevAll("th").length,
                    values = [],
                    lastSort = getTempCache( cacheprefix + "-lastsort" ),
                    lastSortDir = getTempCache( cacheprefix + "-lastsortdir" ),
                    newSortDir, jTable = $("#" + cacheprefix + "tbl");
                // Populate values array
                jTable.children( "tbody" ).children( "tr" )
                  .each(function(index,dom){
                    values[ index ] = [];
                    $(dom).children( "td" ).each(function(index2,dom2){
                        values[ index ][ index2 ] = $(dom2);
                    });
                });
                // Remove icons to clean up
                sibth.removeClass( "ui-state-hover" );
                $(this).addClass( "ui-state-hover" );
                sibicons.removeClass( 'ui-icon-arrowthick-1-s').
                      removeClass( 'ui-icon-arrowthick-1-n').
                      addClass( 'ui-icon-arrowthick-2-n-s');
                thisicon.
                      removeClass( 'ui-icon-arrowthick-2-n-s').
                      removeClass( 'ui-icon-arrowthick-1-s').
                      removeClass( 'ui-icon-arrowthick-1-n' );
                if( lastSort !== String(index) ||
                    lastSortDir === "2" )
                {
                    // User clicked a different column
                    // Or clicked same column second time
                    values.sort(function(a,b){
                        return customsort(a[index],b[index]);
                    });
                    thisicon.addClass( 'ui-icon-arrowthick-1-s');
                    newSortDir = 1;
                }
                else
                {
                    // User clicked same column, update
                    values.sort(function(a,b){
                        return customsort(b[index],a[index]);
                    });
                    thisicon.addClass( 'ui-icon-arrowthick-1-n');
                    newSortDir = 2;
                }
                tempCache( cacheprefix + "-lastsort", index, clearRegion );
                tempCache( cacheprefix + "-lastsortdir", newSortDir, clearRegion );
                printCells( values, jTable );
            });
            
        }
        headerrow.append( cell );
    }

    if( values.length > 0 )
    {
        var valuesCopy = [];
        for( i = 0; i < values.length; i++ )
        {
            valuesCopy[ i ] = [];
            for( j = 0; j < values[ 0 ].length; j++ )
            {
                valuesCopy[ i ][ j ] =
                    $("<td></td>").append( values[ i ][ j ] );
            }
        }
        tempCache( cacheprefix + "-lastsort", -1, clearRegion );
        tempCache( cacheprefix + "-lastsortdir", -1, clearRegion );
        printCells( valuesCopy, table );

    }
    thead.append( headerrow );
    table.prepend( thead );
    
    return table;
}

/**
 * Shows a generic message with customizable buttons.
 *
 * The array of buttons should be a key/index array where the keys are the
 * text to show and the values are the corresponding functions to run when
 * the button has been clicked.
 *
 *  @param title Title of the dialog
 *  @param msg Message to show the user
 *  @param buttons Array of buttons to show
 */
 function genericDialog( title, msg, buttons )
 {
    $("body").append( '<div id="dialog-generic" ' + 'title="' + title +
                      '"><p>' + msg + '</p></div>');

    $( "#dialog-generic" ).dialog({
        resizable: false,
        height:165,
        width:360,
        modal: true,
        "buttons": buttons
    });
}

/**
 * Shows a generic error message with an okay dialog
 * @param title The title
 * @param msg The message to show
 * @param cb The function to call after okay is pressed
 */
function genericErrorDialog( title, msg, cb )
{
    genericDialog( title, msg, {
        "Okay": function(){
            if( cb )
            {
                cb();
            }
            $(this).dialog( "close" ).remove();
        }
    });
}
