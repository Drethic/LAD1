function validLogin( id )
{
    $("head").css('pane', 'display:none;}');
    $("body").html("");
    $("body").append(
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

    $("#center")
        .append("<div class='popup' id='servers'></div>");

    $("#servers")
        .append("<div class='popup_header' title='Servers'>" +
        "<div class='popup_title'><span><span class='ui-icon ui-icon-image" +
        " popup_image' style='float:left'></span>Servers</span></div>" +
        "<div class='refresh_popup' title='Refresh'><span class='ui-icon" +
        " ui-icon-arrowrefresh-1-s'></span></div>" +
        "<div class='min_popup' title='Minimize'><span class='ui-icon" +
        " ui-icon-minus'></span></div>" +
        "<div class='max_popup' title='Maximize'><span>\u25a1</span></div>" +
        "<div class='close_popup' title='Close'><span class='ui-icon" +
        " ui-icon-close'></span></div></div>")
        .append("<div id='serverpu' class='popup_body'></div>")
        .toggle(function() {
		$(this).removeClass('popup');
	})
        .css('display', 'none')
        .resizable({alsoResize: "#serverpu"});

    $('#serverpu').resizable();

    $('div.popup')
        .css( "max-height", $("#center").height() )
        .css( "max-width", $("#center").width() )
        .draggable({'opacity': '0.7', 'cancel': '.popup_body',
        'cursor': 'move', 'containment': '#center'})
        .resize( function() {
            moveResizeVert($('div.popup_body'));
            moveResizeHor($('div.popup_body'));
        });
    $('div.popup_body')
        .css( "max-height", $("#center").height() - 20 )
        .css( "max-width", $("#center").width() );

    $("#taskbar")
        .addClass("slide")
        .append("<div id='start' class='start-menu-button'></div>")
        .append("<div id='menu' class='inner'>Start Menu INW</div>");

    $("#taskbar")
        .jTaskBar({'winClass': '.popup', 'attach': 'bottom'});

    $('#jTaskBar').find('div#servers').remove();

    $('.close_popup').click( function() {
	$(this).parents('.popup').fadeOut('fast', function() {
		$(this).removeClass('popup');
	});
        window.location.hash = '';
    });

    $('.max_popup').click( function() {
        var div = $(this).parents('.popup');
        if(!div.hasClass('popup_max')) {
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
            .empty()
            .append("<span class='ui-icon ui-icon-newwin'></span>");
        }
        else {
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
            .empty()
            .append("<span>\u25a1</span>");
        }
    });

    $('.min_popup').click( function() {
        $(this).parents('.popup').fadeOut('fast');
    });

    $('.refresh_popup').click( function() {
        refreshCurrent();
    });

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
      .append( "<br><button id='servers'>Servers</button>" );

    $("#logout").click(function( evt ){
        window.location = '';
        doLogin();
    });
    $("#servers").click(function( evt ){
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

function hasVertScrollBar( element ) {
        return element.get(0).scrollHeight > element.height();
}

function hasHorScrollBar( element ) {
        return element.get(0).scrollWidth > element.width();
}

function moveResizeVert( element ) {
    if(hasVertScrollBar(element) == true) {
        $('div.ui-resizable-se').css('right', '20px');
    } else {
        $('div.ui-resizable-se').css('right', '1px');
    }
}

function moveResizeHor( element ) {
    if(hasHorScrollBar(element) == true) {
        $('div.ui-resizable-se').css('bottom', '20px');
    } else {
        $('div.ui-resizable-se').css('bottom', '1px');
    }
}

function resizeHeight( element ) {
    var elemsh = element.get(0).scrollHeight;
    var elemh = element.height();
    var centerh = $('#center').height();
    var newHeight = '0';
    if(element.hasClass('popup_body_max')) {
        newHeight = centerh;
    } else {
        if(elemsh > centerh) {
            newHeight = centerh;
        } else if(elemsh > elemh) {
            newHeight = elemsh;
        }
    }
    if(newHeight > elemh) {
        element.parents('.popup').css('height', newHeight + 22);
        element.css('height', newHeight);
    }
    moveResizeVert( element );
    moveResizeHor( element );
}

function resizeWidth( element ) {
    var elemsw = element.get(0).scrollWidth;
    var elemw = element.width();
    var centerw = $('#center').width();
    var newWidth = '0';
    if(element.hasClass('popup_body_max')) {
        newWidth = centerw;
    } else {
        if(elemsw > centerw) {
            newWidth = centerw;
        } else {
            newWidth = elemsw;
        }
    }
    if(newWidth > elemw) {
        element.parents('.popup').css('height', newWidth + 22);
        element.css('height', newWidth);
    }
    moveResizeVert( element );
    moveResizeHor( element );
}