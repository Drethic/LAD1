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

    // Create each of our windows
    createWindow( "Explorer" );
    createWindow( "Servers" );
    createWindow( "Options" );
    
    // Set up the taskbar to identify with the popup class
    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    // Add the start menu
    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>LAD Task Menu</div>");

    // Start the start menu hidden
    $("#menu").css({"display" : "none"});

    // Open the start menu on click
    $('#start').live("click",function(){
        if($(this).hasClass('active'))
        {
            $(this).removeClass('active');
            $("#menu").slideToggle(function(){
                $("#layout-container").layout().resetOverflow('south');
            });
        }
        else
        {
            $(this).addClass('active');
            $("#layout-container").layout().allowOverflow('south');
            $("#menu").slideToggle();
        }
    });
    
    // Add several buttons to the start menu
    addMenuButton( "Servers", "ui-icon-image", requestServers);
    addMenuButton( "Explorer", "ui-icon-locked", function(){} );
    addMenuButton( "Options", "ui-icon-gear" );
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
        resizeHeight($('div.popup_body'));
        resizeWidth($('div.popup_body'));
    });
    
    // Setup the start menu to hide if something other than it is clicked and
    // it is open
    $('#center, #east, #taskbar :not(#start,#menu)').click(function(){
        var start = $('#start');
        if( start.hasClass( 'active' ) )
        {
            start.removeClass('active');
            $("#menu").slideToggle(function(){
                $("#layout-container").layout().resetOverflow('south');
            });
        }
    })
}

function addMenuButton( name, icon, fn )
{
    $("#menu").append( "<button id='" + name + "'>" + name + "</button>" );

    var menuobj = $("button#" + name);
    if( icon != undefined )
    {
        menuobj.button({icons: {primary: icon}});
    }
    var enclosedfn;
    if( fn == undefined )
    {
        enclosedfn = function(){
            alert( name + "INW" );
        };
    }
    else
    {
        enclosedfn = function( id ){
            var obj = $('div#' + id);
            // Call function if there is no window
            if( obj.length == 0 )
            {
                fn();
                return;
            }
            // Make sure it's a popup
            if( !obj.hasClass( "popup" ) )
            {
                obj.addClass('popup');
            }
            // Show the window
            if( obj.css('display') == 'none' )
            {
                obj.fadeIn().queue(function(){
                    $(this).updatejTaskBar();
                    obj.trigger( 'mousedown' );
                    $(this).dequeue();
                });
                getPopupContext( id ).empty();
                fn();
            }
            // Fade in the taskbar entry
            if( $('#jTaskBar').find('div#'+id).hasClass('jTask-hidden') )
            {
                $('#jTaskBar').find('div#'+id).removeClass('jTask-hidden');
                obj.fadeIn().queue(function(){
                    $(this).updatejTaskBar();
                    $(this).dequeue();
                });
            }
        }
    }
    menuobj.click(function(){
        $('#start').click();
        enclosedfn( name );
    });
}

function createWindow( name )
{
    $($("<div class='popup' id='" + name + "'></div>"))
        .append($("<div class='popup_header' title='" + name + "'>")
            .append("<div class='popup_title'>" +
                    "<span class='ui-icon ui-icon-image popup_image' " +
                    "style='float:left'></span>" + name + "</div>"
            )
            .append($("<div class='refresh_popup' title='Refresh'>" +
                      "<span class='ui-icon ui-icon-arrowrefresh-1-s'>" +
                      "</span></div>")
                .click( function() {
                    refreshCurrent( name );
                })
            )
            .append($("<div class='min_popup' title='Minimize'><span class='ui-icon " +
                      "ui-icon-minus'></span></div>")
                .click( function() {
                    var popup = $(this).parents('.popup');
                    popup.fadeOut('fast').queue(function(){
                            $(this).updatejTaskBar();
                            $(this).dequeue();
                    });
                })
            )
            .append($("<div class='max_popup' title='Maximize'><span>\u25a1</span></div>")
                .click( function() {
                    var div = $(this).parents('.popup');
                    var offset = div.offset();
                    if( !div.hasClass('popup_max') )
                    {
                        div.draggable( "destroy" );
                        div.resizable( "destroy" );
                        div.find('.popup_header').css( "cursor", "default" );
                        tempCache ( "putop" + div.attr("id"), offset.top );
                        tempCache ( "puleft" + div.attr("id"), offset.left );
                        tempCache ( "puheight" + div.attr("id"), div.height() );
                        tempCache ( "pubheight" +
                            div.find('.popup_body').attr("id"),
                            div.find('.popup_body').height() );
                        tempCache ( "puwidth" + div.attr("id"), div.width() );
                        tempCache ( "pubwidth" + 
                            div.find('.popup_body').attr("id"),
                            div.find('.popup_body').width() );
                        div.addClass('popup_max')
                            .removeAttr('style')
                            .css("z-index", "10010")
                            .css( "height", $("#center").height() )
                            .css( "width", $("#center").width() );
                        div.find('.popup_body')
                            .addClass('popup_body_max')
                            .removeAttr('style')
                            .css( "height", $("#center").height() - 20 )
                            .css( "width", $("#center").width() - 2 );
                        div.find('.max_popup').attr('title', 'Restore')
                            .addClass('restore_popup')
                            .removeClass('max_popup')
                            .html("<span class='ui-icon ui-icon-newwin'></span>");
                    }
                    else
                    {
                        div.draggable({
                            'opacity': '0.7',
                            'cancel': '.popup_body',
                            'cursor': 'move',
                            'containment': '#center'
                        });
                        div.resizable({
                            'alsoResize': "#" + name + "pu",
                            'containment': '#center'
                        });
                        div.find('.popup_header').css( "cursor", "move" );
                        div.removeClass('popup_max')
                            .removeAttr('style')
                            .css("z-index", "10009")
                            .css( "height", getTempCache( "puheight" +
                            div.attr("id")) )
                            .css( "width", getTempCache( "puwidth" +
                            div.attr("id")) )
                            .css( "top", getTempCache ( "putop" +
                            div.attr("id")) - 1 )
                            .css( "left", getTempCache ( "puleft" +
                            div.attr("id")) - 1 )
                            .css( "max-height", $("#center").height() )
                            .css( "max-width", $("#center").width() );
                        div.find('.popup_body')
                            .removeClass('popup_body_max')
                            .removeAttr('style')
                            .css( "height", getTempCache( "pubheight" +
                            div.find('.popup_body').attr("id")) )
                            .css( "width", getTempCache( "pubwidth" +
                            div.find('.popup_body').attr("id")) )
                            .css( "max-height", $("#center").height() - 20 )
                            .css( "max-width", $("#center").width() );
                        div.find('.restore_popup').attr('title', 'Maximize')
                            .addClass('max_popup')
                            .removeClass('restore_popup')
                            .html("<span>\u25a1</span>");
                    }
                })
            )
            .append($("<div class='close_popup' title='Close'>" +
                      "<span class='ui-icon ui-icon-close'></span></div></div>")
                .click( function() {
                    $(this).parents('.popup').fadeOut('fast').queue(function(){
                        $(this).removeClass('popup');
                        $(this).updatejTaskBar();
                        updateCache( name );
                        var cb = window.prototype.cbs[ "windowclose" ];
                        if( cb != undefined )
                        {
                            cb( name );
                        }
                        $(this).dequeue();
                    });
                    window.location.hash = '';
                })
            )
            .css( "cursor", "move" )
        )
        .append(
            $("<div id='" + name + "pu' class='popup_body'></div>")
                .css( {
                    "max-height": $("#center").height() - 20,
                    "max-width": $("#center").width()
                })
        )
        .toggle(function() {
            $(this).removeClass('popup');
	})
        .css({
            'display': 'none',
            'position': 'absolute',
            'max-height': $("#center").height(),
            'max-width': $("#center").width()
        })
        .resizable({
            'containment': '#center',
            'alsoResize': "#" + name + "pu",
            'handles': "n, e, s, w, ne, nw, se, sw"
        })
        .draggable({
            'opacity': '0.7',
            'cancel': '.popup_body',
            'cursor': 'move',
            'containment': '#center',
            'stack': '.popup',
            start: function(event,ui){
                $('#jTaskBar').find('.jTask').removeClass('jTask-current');
                $('#jTaskBar').find('.jTask#' + name).addClass('jTask-current');
            }
        })
        .mousedown(function(){
            $('#jTaskBar').find('.jTask').removeClass('jTask-current');
            $('#jTaskBar').find('.jTask#' + name).addClass('jTask-current');
            $('.popup').css( 'z-index', 1000 );
            $(this).css( 'z-index', 1001 );
            $(this).trigger( 'dragstart' ).trigger( 'drag' ).trigger( 'dragstop' );
        })
        .appendTo($('#center'));
}

function resizePopup( name )
{
    var elem = getPopupContext( name );
    resizeHeight( elem );
    resizeWidth( elem );
}

function resizeHeight( element ) {
    var elemsh = element.get(0).scrollHeight;
    var elemh = element.height();
    var elemtop = element.offset().top;
    var centerh = $('#center').height();
    var centertop = $('#center').offset().top;
    var newHeight;
    if( element.hasClass('popup_body_max') || elemsh > centerh )
    {
        newHeight = centerh - 22;
    }
    else
    {
        newHeight = elemsh;
    }
    if(newHeight > elemh)
    {
        element.parent().css('height', newHeight + 22);
        element.css('height', newHeight);
    }

    if( elemtop + newHeight > centerh + centertop )
    {
        element.parent().css('top', centerh + centertop - newHeight - 22);
    }
}

function resizeWidth( element )
{
    var elemsw = element.get(0).scrollWidth;
    var elemw = element.width();
    var elemleft = element.offset().left;
    var centerw = $('#center').width();
    var centerleft = $('#center').offset().left;
    var newWidth;
    if(element.hasClass('popup_body_max') || elemsw > centerw)
    {
        newWidth = centerw;
    }
    else
    {
        newWidth = elemsw;
    }
    if(newWidth > elemw)
    {
        element.parent().css('width', newWidth);
        element.css('width', newWidth);
    }

    if( elemleft + elemw > centerw + centerleft )
    {
        element.parent().css('left', centerw + centerleft - newWidth);
    }
}

function getPopupContext( name )
{
    return $('#' + name + 'pu');
}

function refreshCurrent( name )
{
    doAjax( undefined, undefined, name );
}

/**
 * @param headers 1-D array of headers
 * @param values 2-D array of values
 * @param cacheprefix Prefix for cache entries, must be unique
 * @param postsortfunc Function(jQuery_table) to call after being sorted
 * @param clearRegion Region for clearing temp cache entries
 */
function makeSortableTable( headers, values, cacheprefix, postsortfunc,
                            clearRegion )
{
    var table = $("<table id='" + cacheprefix + "tbl'></table>");
    var headerrow = $("<tr class='primaryRow'></tr>");
    var i, j;
    
    var printCells = function(values, table){
        table.find( "tr:gt(0)" ).remove();
        for( var i = 0; i < values.length; i++ )
        {
            var row = $("<tr></tr>");
            if( ( i - 1 ) % 2 == 0 )
            {
                row.addClass( "alternateRow" );
            }
            else
            {
                row.addClass( "primaryRow" );
            }
            for( j = 0; j < headers.length; j++ )
            {
                row.append( "<td>" + values[ i ][ j ] + "</td>" );
            }
            table.append( row );
        }
        
        tempCache( cacheprefix + "-values", stringify( values ), clearRegion );
        if( postsortfunc != undefined )
        {
            postsortfunc( table );
        }
    };

    for( i = 0; i < headers.length; i++ )
    {
        var cell = $( "<th class='sorttblhead'>" + headers[ i ] + "</th>" );
        if( values.length > 1 )
        {
            cell.prepend($('<span></span>').addClass('ui-icon').
                addClass('ui-icon-arrowthick-2-n-s').
                css( 'float', 'left' ));
            cell.click(function(){
                var sibth = $(this).siblings("th");
                var sibicons = sibth.children(".ui-icon");
                var thisicon = $(this).children(".ui-icon");
                sibth.removeClass( "ui-state-hover" );
                $(this).addClass( "ui-state-hover" );
                sibicons.removeClass( 'ui-icon-arrowthick-1-s').
                      removeClass( 'ui-icon-arrowthick-1-n').
                      addClass( 'ui-icon-arrowthick-2-n-s');
                thisicon.
                      removeClass( 'ui-icon-arrowthick-2-n-s').
                      removeClass( 'ui-icon-arrowthick-1-s').
                      removeClass( 'ui-icon-arrowthick-1-n');
                var index = $(this).prevAll("th").length;
                var valuestring = getTempCache( cacheprefix + "-values" );
                eval( "values = " + valuestring );
                var lastSort = getTempCache( cacheprefix + "-lastsort" );
                var newSort = index;
                var customsort = function(a,b){
                    var ca = Number(a);
                    var cb = Number(b);
                    if( !isNaN( ca ) )
                    {
                        if( !isNaN( cb ) )
                        {
                            return ca - cb;
                        }
                        return -1;
                    }
                    else if( !isNaN( cb ) || a == undefined )
                    {
                        return 1;
                    }
                    return a.localeCompare(b);
                };
                if( lastSort != index )
                {
                    values.sort(function(a,b){
                        return customsort(a[index],b[index]);
                    });
                    thisicon.addClass( 'ui-icon-arrowthick-1-s');
                }
                else
                {
                    values.sort(function(a,b){
                        return customsort(b[index],a[index]);
                    });
                    thisicon.addClass( 'ui-icon-arrowthick-1-n');
                    newSort = -1;
                }
                tempCache( cacheprefix + "-lastsort", newSort, clearRegion );
                printCells( values, $("#" + cacheprefix + "tbl") );
            });
        }
        headerrow.append( cell );
    }
    
    table.append( headerrow );
    printCells( values, table );
    
    return table;
}