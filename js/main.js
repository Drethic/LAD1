function doLogin()
{
    $("body").html("");
    
    $("<form id='loginform'>Login<br></form>")
      .append("Username:<input type='text' name='username' " +
              "maxlength=20 id='username' class='filterkeys' " +
              "data-filterkeys='[a-zA-Z0-9]'>")
      .append("<span id='usernameerror'></span><br>")
      .append("Password:<input type='password' name='password' " +
              "maxlength=40 id='password'>")
      .append("<span id='passworderror'></span><br>")
      .append("<span id='emailspan'>E-mail:<input type='text' name='email' " +
              "maxlength=40 id='email'><span id='emailerror'></span></span>")
      .appendTo("body").filterKeys();

    $("<div>")
      .append("<button id='loginbutton'>Login</button>")
      .append("<button id='newuserbutton'>New User</button>")
      .appendTo("#loginform");

    $("#emailspan").css( "display", "none" );
    $("#loginbutton, #newuserbutton").button().css( "font-size", "0.6em" )
      .button( "disable" ).click(function( evt ){
        $("#loginform input, #loginform button").button( "disable" )
          .button( "refresh" ).attr( "disabled", "disabled" )
          .attr( "readonly", true );
        evt.preventDefault();
    });
    $("#newuserbutton").click(function( evt ){
        if( $( "#emailspan").css( "display" ) == "" )
        {
            doAjax( "newuser2", {
                email: $("#email").val()
            });
        }
        else if( $( "#usernameerror" ).val().length == 0 &&
            $( "#passworderror" ).val().length == 0 )
        {
            doAjax( "newuser1", {
                username: $("#username").val(),
                password: $("#password").val()
            });
        }
        evt.preventDefault();
    });
    $("#loginbutton").click(function( evt ){
        doAjax( "login", {
            username: $("#username").val(),
            password: $("#password").val()
        });
        evt.preventDefault();
    });

    $("#usernameerror, #passworderror").css( "font-weight", "bold" );

    var errorStrings = [
        "Username must be at least 4 characters.",
        "Username cannot start with a number.",
        "Password must be at least 4 characters."
    ];
    $("#email").keyup(function(){
        $("#emailerror").html( "" );
    })
    $("#username, #password").keyup(function(){
        var passed = true;
        if( $("#username").val().substring( 0, 1 ).search( "[0-9]" ) > -1 )
        {
            loginError( true, errorStrings[ 1 ] );
            passed = false;
        }
        else if( $("#username").val().length < 4 )
        {
            loginError( true, errorStrings[ 0 ] );
            passed = false;
        }
        else
        {
            loginError( true, "" );
        }
        if( $("#password").val().length < 4 )
        {
            loginError( false, errorStrings[ 2 ] );
            passed = false;
        }
        else
        {
            loginError( false, "" );
        }

        if( passed )
        {
            $("#loginform button").button( "enable" );
        }
        else
        {
            $("#loginform button").button( "disable" );
        }
    }).keyup();
}

function loginError( isUser, reason )
{
    var inputObject = $(isUser ? "#username" : "#password");
    var warnObject = $(isUser ? "#usernameerror" : "#passworderror");
    if( reason.length == 0 )
    {
        inputObject.css({"background-color" : "",
                         "border-color" : ""});
        warnObject.css( "display", "none" );
    }
    else
    {
        inputObject.css({"background-color" : "#FFAAAA",
                         "border-color" : "#DD4444"});
        warnObject.css( "display", "" );
        warnObject.html( reason );
    }
}

function usernameTaken()
{
    loginError( true, "Username is already taken." );
    restoreLoginForm();
}

function usernameAvailable()
{
    $( "#emailspan" ).css( "display", "" );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
}

function emailTaken()
{
    $( "#emailerror" ).html( "Email is already associated with an account." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
}

function accountCreated( id )
{
    validLogin( id );
    restoreLoginForm();
}

function validLogin( id )
{
    //do nothing for now
    //$("body").html( "YAY LOGGED IN WITH " + id + "!" );
    $( "body" ).html( "" );
    $( "<div id='tabs'></div>" )
      .append( $("<ul></ul>")
        .append( "<li><a href='#tabs-1'>Programs</a></li>" )
        .append( "<li><a href='#tabs-2'>Servers</a></li>" )
        .append( "<li><a href='#tabs-3'>Users</a></li>" )
      ).append( $("<div id='tabs-1'></div>" )
        .append( "Program Stuff<br />More Program Stuff" )
      ).append( $("<div id='tabs-2'></div>" )
        .append( "Server Stuff" )
      ).append( $("<div id='tabs-3'></div>" )
        .append( "Users Stuff<br /><br />Interesting Stuff" )
      ).appendTo( "body" ).tabs({
          select: function( evt, ui )
          {
              $( ui.panel ).append( "HI" );
          },
          fx: { opacity: 'toggle' }
      }).css( "font-size", "0.6em" );
}

function invalidLoginCombo()
{
    var str = "Invalid login information.";
    loginError( true, str );
    loginError( false, str );
    restoreLoginForm();
}

function restoreLoginForm( )
{
    restoreForm( "loginform" );
}

function restoreForm(frm)
{
    $("#" + frm + " input,#" + frm + " button").button( "enable" )
      .button( "refresh" ).attr( "disabled", false )
      .attr( "readonly", false );
}

function doAjax( action, outData )
{
    outData[ "action" ] = action;
    $.ajax({
       url: "ajaxhandler.php",
       data: outData,
       dataType: "script"
    });
}
