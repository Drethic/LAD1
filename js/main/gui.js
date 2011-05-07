function validLogin( id )
{
    $("body").html("")
      .css( "padding", "0px" )
      .append(
          $("<div id='layout-container'>")
            .append("<div id='taskbar' class='ui-layout-south'></div>")
            .append("<div id='east' class='ui-layout-east'>Chat(closeable)</div>")
            .append("<div id='center' class='ui-layout-center'></div>")
      );
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

    createWindow( "Explorer" );
    createWindow( "Servers" );
    createWindow( "Options" );
    // !ADMIN!
    createWindow( "Admin" );
    // !ADMIN!
    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    $('#jTaskBar').empty();

    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>LAD Task Menu</div>");

    $("#menu").css({"display" : "none"});

    $('#start').live("click",function(){
        if($(this).hasClass('active'))
        {
            $(this).removeClass('active');
            $("#menu").slideToggle();
            $("#layout-container").layout().resetOverflow('south');
        }
        else
        {
            $(this).addClass('active');
            $("#layout-container").layout().allowOverflow('south');
            $("#menu").slideToggle();
        }
    });
    
    addMenuButton( "Servers", "ui-icon-image", requestServers);
    addMenuButton( "Explorer", "ui-icon-locked", function(){} );
    addMenuButton( "Options", "ui-icon-gear" );
    // !ADMIN!
    addMenuButton( "Admin", "ui-icon-star" );
    // !ADMIN!
    addMenuButton( "Logout", "ui-icon-power", function(){
        window.location = '';
        doLogin();
    });
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
            // Show the window
            if( obj.css('display') == 'none' )
            {
                obj.fadeIn();
                getPopupContext( id ).empty();
                fn();
            }
            // Make sure it's a popup
            if( !obj.hasClass( "popup" ) )
            {
                obj.addClass('popup');
            }
            // Fade in the taskbar entry
            if( $('#jTaskBar').find('div#'+id).hasClass('jTask-hidden') )
            {
                $('#jTaskBar').find('div#'+id).removeClass('jTask-hidden');
                obj.fadeIn();
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
                      $(this).parents('.popup').fadeOut('fast');
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
                            div.attr("id")) )
                            .css( "left", getTempCache ( "puleft" +
                            div.attr("id")) )
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
                    $(this).parents('.popup').fadeOut('fast', function() {
                        $(this).removeClass('popup');
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
            'max-height': $("#center").height(),
            'max-width': $("#center").width()
        })
        .resize(function() {
            moveResizeElement($('#' + name + ' .popup_body'));
        })
        .resizable({
            'containment': '#center',
            'alsoResize': "#" + name + "pu"
        })
        .draggable({
            'opacity': '0.7',
            'cancel': '.popup_body',
            'cursor': 'move',
            'containment': '#center'
        })
        .appendTo($('#center'));
}

function hasVertScrollBar( element )
{
    return element.get(0).scrollHeight > element.height();
}

function hasHorScrollBar( element )
{
    return element.get(0).scrollWidth > element.width();
}

function moveResizeVert( element ) {
    if( hasVertScrollBar(element) == true )
    {
        $('div.ui-resizable-se').css('right', '20px');
    }
    else
    {
        $('div.ui-resizable-se').css('right', '1px');
    }
}

function moveResizeHor( element )
{
    if( hasHorScrollBar(element) == true )
    {
        $('div.ui-resizable-se').css('bottom', '20px');
    }
    else
    {
        $('div.ui-resizable-se').css('bottom', '1px');
    }
}

function moveResizeElement( element )
{
    moveResizeVert( element );
    moveResizeHor( element );
}

function resizePopup( name )
{
    var elem = $('#' + name + 'pu');
    resizeHeight( elem );
    resizeWidth( elem );
}

function resizeHeight( element ) {
    var elemsh = element.get(0).scrollHeight;
    var elemh = element.height();
    var elemtop = element.offset().top;
    var centerh = $('#center').height();
    var centertop = $('#center').offset().top;
    var newHeight = '0';
    if( element.hasClass('popup_body_max') || elemsh > centerh )
    {
        newHeight = centerh;
    }
    else
    {
        newHeight = elemsh;
    }
    if(newHeight > elemh)
    {
        element.parents('.popup').css('height', newHeight + 22);
        element.css('height', newHeight);
    }

    if( elemtop + elemh > centerh + centertop )
    {
        element.parents('.popup').css('top', centerh + centertop - elemh);
    }
    moveResizeVert( element );
    moveResizeHor( element );
}

function resizeWidth( element )
{
    var elemsw = element.get(0).scrollWidth;
    var elemw = element.width();
    var elemleft = element.offset().left;
    var centerw = $('#center').width();
    var centerleft = $('#center').offset().left;
    var newWidth = '0';
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
        element.parents('.popup').css('height', newWidth + 22);
        element.css('height', newWidth);
    }

    if( elemleft + elemw > centerw + centerleft )
    {
        element.parents('.popup').css('left', centerw + centerleft - elemw);
    }

    moveResizeVert( element );
    moveResizeHor( element );
}

function getPopupContext( name )
{
    return $('#' + name + 'pu');
}

function refreshCurrent( name )
{
    doAjax( undefined, undefined, name );
}