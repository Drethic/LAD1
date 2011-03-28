function doLogin()
{
    $("body").html("");
    
    $("<form id='loginform'>Login<br></form>")
      .append("Username:<input type='text' name='username' " +
              "maxlength=20 id='username' class='filterkeys' " +
              "data-filterkeys='[a-zA-Z0-9]' autocomplete='off'>")
      .append("<span id='usernameerror'></span><br>")
      .append("Password:<input type='password' name='password' " +
              "maxlength=40 id='password'>")
      .append("<span id='passworderror'></span>")
      .append("<span id='cpasswordspan'><br>Retype Password:<input type='password'"+
              " name='cpassword' maxlength=40 id='cpassword'>")
      .append("<span id='cpassworderror'></span></span><br>")
      .append("<span id='emailspan'>E-mail:<input type='text' name='email' " +
              "maxlength=40 id='email' autocomplete='off'>" +
              "<span id='emailerror'></span></span>")
      .appendTo("body").filterKeys();

    $("<div>")
      .append("<button id='loginbutton'>Login</button>")
      .append("<button id='newuserbutton'>New User</button>")
      .appendTo("#loginform");

    $("#cpasswordspan, #emailspan").css( "display", "none" );
    $("#loginbutton, #newuserbutton").button().css( "font-size", "0.6em" )
      .button( "disable" ).click(function( evt ){
        $("#loginform input, #loginform button").button( "disable" )
          .button( "refresh" ).attr( "disabled", "disabled" )
          .attr( "readonly", true );
        evt.preventDefault();
    });
    $("#newuserbutton").click(function( evt ){
        if( $( "#emailspan").css( "display" ) != "none" )
        {
            doAjax( "newuser2", {
                cpassword: $("#cpassword").val(),
                email: $("#email").val()
            });
        }
        else
        {
            doAjax( "newuser1", {
                username: $("#username").val(),
                password: $("#password").val()
            });
        }
        evt.preventDefault();
    });
    $("#loginbutton").click(function( evt ){
        if( $( "#emailspan").css( "display" ) != "none" )
        {
            doLogin();
        }
        else
        {
            doAjax( "login", {
                username: $("#username").val(),
                password: $("#password").val()
            });
        }
        evt.preventDefault();
    });

    $("#usernameerror, #passworderror", "#cpassworderror", "#emailerror")
        .css( "font-weight", "bold" );

    var errorStrings = [
        "Username must be at least 4 characters.",
        "Username cannot start with a number.",
        "Password must be at least 4 characters.",
        "Type in a Username to Login or Register",
        "Type in a Password to Login or Register"
    ];
    $("#username, #password").bind('keyup', function(){
        var passed = true;
        if( $("#username").val().substring( 0, 1 ).search( "[0-9]" ) > -1 )
        {
            loginError( "#user", errorStrings[ 1 ] );
            passed = false;
        }
        else if( $("#username").val().length == 0 )
        {
            loginError( "#user", errorStrings[ 3 ] );
            passed = false;
        }
        else if( $("#username").val().length < 4 )
        {
            loginError( "#user", errorStrings[ 0 ] );
            passed = false;
        }
        else
        {
            loginError( "#user", "" );
        }
        if( $("#password").val().length == 0 )
        {
            loginError( "#pass", errorStrings[ 4 ] );
            passed = false;
        }
        else if( $("#password").val().length < 4 )
        {
            loginError( "#pass", errorStrings[ 2 ] );
            passed = false;
        }
        else
        {
            loginError( "#pass", "" );
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

function loginError( field, reason )
{
    if (field == "#user")
    {
        var inputObject = $("#username");
        var warnObject = $("#usernameerror");
    }
    else if (field == "#pass")
    {
        inputObject = $("#password");
        warnObject = $("#passworderror");
    }
    else if (field == "#cpass")
    {
        inputObject = $("#cpassword");
        warnObject = $("#cpassworderror");
    }
    else if (field == "#email")
    {
        inputObject = $("#email");
        warnObject = $("#emailerror");
    }
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
    loginError( "#user", "Username is already taken." );
    loginError( "#pass", "" );
    restoreLoginForm();
}

function usernameAvailable()
{
    $( "#cpasswordspan, #emailspan" ).css( "display", "" );
    restoreLoginForm();
        $( "#username, #password" ).attr( "disabled", "disabled" )
        .attr( "readonly", true );
    $( "#loginbutton" ).button( "option", "label", "Reset Form", "enable" );
    $( "#newuserbutton" ).button( "option", "label", "Create Account" );

    var errorStrings = [
        "Password must be at least 4 characters.",
        "Your Passwords do not match",
        "Email address required",
        "Email must be in the following format user@host.domain"
    ];

    $("#cpassword, #email").bind('keyup', function(){
        var passed = true;
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var emailval = $("#email").val();
        if( $("#cpassword").val().length < 4 )
        {
            loginError( "#cpass", errorStrings[ 0 ] );
            passed = false;
        }
        else if( $("#password").val() != $("#cpassword").val() )
        {
            loginError( "#pass", errorStrings[ 1 ] );
            loginError( "#cpass", errorStrings[ 1 ] );
            passed = false;
        }
        else
        {
            loginError( "#cpass", "" );
        }
        if( emailval.length < 1 )
        {
            loginError( "#email", errorStrings[ 2 ] );
            passed = false;
        }
        else if (!emailReg.test(emailval))
        {
            loginError( "#email", errorStrings[ 3 ] );
            passed = false;
        }
        else
        {
            loginError( "#email", "" );
        }

        if( passed )
        {
            $("#loginform button").button( "enable" );
        }
        else
        {
            $("#loginform button").button( "disable" );
            $( "#loginbutton" ).button( "enable" );
        }
    }).keyup();
}

function cpasswordInvalid()
{
    loginError( "#cpass", "Passwords did not match." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
    $( "#loginbutton" ).button( "disable" );
}
function emailTaken()
{
    loginError( "#email", "Email is already associated with an account." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
    $( "#loginbutton" ).button( "enable" );
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
          fx: {opacity: 'toggle'}
      }).css( "font-size", "0.6em" );
}

function invalidLoginCombo()
{
    var str = "Invalid login information.";
    loginError( "#user", str );
    loginError( "#pass", str );
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
