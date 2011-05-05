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

    createWindow( "Servers" );

    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>Start Menu INW</div>");

    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    $('#jTaskBar').find('div#Servers').remove();

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

    $("#menu").append("<button id='logout'>Logout</button>")
      .append( "<br><button id='Servers'>Servers</button>" );

    $("#logout").click(function( evt ){
        window.location = '';
        doLogin();
    });
    $("button#Servers").click(function( evt ){
        var _id = $(this).attr('id');
	if ($('div#'+_id).css('display') == 'none') {
            $('div#'+_id).fadeIn();
            $("div#"+_id+"pu").empty();
            requestServers();
	}
	if (!$('div#'+_id).hasClass('popup')) {
            $('div#'+_id).addClass('popup');
	}
        if ($('#jTaskBar').find('div#'+_id).hasClass('jTask-hidden')){
            $('#jTaskBar').find('div#'+_id).removeClass('jTask-hidden');
            $('div#'+_id).fadeIn();
        }
        $('#start').click();
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
                    refreshCurrent();
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
                    if( !div.hasClass('popup_max') )
                    {
                        div.addClass('popup_max')
                            .removeAttr('style')
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
                        div.removeClass('popup_max')
                            .removeAttr('style')
                            .css( "max-height", $("#center").height() )
                            .css( "max-width", $("#center").width() );
                        div.find('.popup_body')
                            .removeClass('popup_body_max')
                            .removeAttr('style')
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
                //.resizable()
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
            'alsoResize': "#" + name + "pu",
            'containment': '#center'
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
        $('div.ui-resizable-se').css('left', '20px');
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