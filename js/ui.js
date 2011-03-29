function validLogint( id )
{
    $("head").css('pane', 'display:none;}');
    $("body").html("");
    $("body").append("<div id='south' class='ui-layout-south'>Taskbar</div>")
    .append("<div id='east' class='ui-layout-east'>Chat(closeable)</div>")
    .append("<div id='center' class='ui-layout-center'>Desktop</div>")
    .layout({
        south: {
           closable: false
        ,  resizable: false
        ,  spacing_open: 0
        }
        ,   east: {
            initClosed: true
        ,   resizable: false
        }
    });

    $("#south")
      .append("<button id='logout'>Logout</button>")
      .css({"background-color" : "#808080"});

    $("#logout").click(function( evt ){
        var url = "index.php";
        $(location).attr('href',url);
    });
}