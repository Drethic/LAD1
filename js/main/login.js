function createLoginInput( label, type, name, maxlen, optional )
{
    return $("<span id='" + name + "span' />")
      .append( "<label for='" + name + "'>" + label + ":</label>" )
      .append( "<input type='" + type + "' name='" + name + "' id='" + name +
               "' maxlength=" + maxlen + " " + optional + " " +
               "autocomplete='off'>")
      .append( "<span id='" + name + "error' class='ui-state-error " +
               "ui-corner-all' style='padding: 0.2em;font-size:smaller'>" +
               "</span><br>" );
}

function doLogin()
{
    $("body").html("");

    $("<form id='loginform'>Login<br></form>")
      .append( createLoginInput( "Username", "text", "username", 20,
               "class='filterkeys' data-filterkeys='[a-zA-Z0-9]'") )
      .append( createLoginInput( "Password", "password", "password", 40 ) )
      .append( createLoginInput( "Retype Password", "password", "cpassword",
                                 40 ) )
      .append( createLoginInput( "E-mail", "text", "email", 40 ) )
      .appendTo("body").filterKeys();

    $("<div>")
      .append("<button id='loginbutton'>Login</button>")
      .append("<button id='newuserbutton'>New User</button>")
      .appendTo("#loginform");

    $("#cpasswordspan, #emailspan").css( "display", "none" );
    $("#loginbutton, #newuserbutton").button().button( "disable" )
      .click(function( evt ){
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

    var errorStrings = [
        "Username must be at least 4 characters.",
        "Username cannot start with a number.",
        "Password must be at least 4 characters.",
        "Type in a Username to Login or Register",
        "Type in a Password to Login or Register"
    ];
    $("#username, #password").bind('keyup', function(){
        var passed = true;
        var lE = lEv();
        if( $("#username").val().substring( 0, 1 ).search( "[0-9]" ) > -1 )
        {
            lE( "#username", errorStrings[ 1 ] );
            passed = false;
        }
        else if( $("#username").val().length == 0 )
        {
            lE( "#username", errorStrings[ 3 ] );
            passed = false;
        }
        else if( $("#username").val().length < 4 )
        {
            lE( "#username", errorStrings[ 0 ] );
            passed = false;
        }
        else
        {
            lE( "#username", "" );
        }
        if( $("#password").val().length == 0 )
        {
            lE( "#password", errorStrings[ 4 ] );
            passed = false;
        }
        else if( $("#password").val().length < 4 )
        {
            lE( "#password", errorStrings[ 2 ] );
            passed = false;
        }
        else
        {
            lE( "#password", "" );
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
    var inputObject = $(field);
    var warnObject = $(field + 'error');

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
        warnObject.html( "<span class='ui-icon ui-icon-alert' " +
                         "style='float:left'></span>" + reason );
        warnObject.css( {"display" : "inline-block"} );
    }
}

function usernameTaken()
{
    var lE = lEv();
    lE( "#username", "Username is already taken." );
    lE( "#password", "" );
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
        var lE = lEv();
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var emailval = $("#email").val();
        if( $("#cpassword").val().length < 4 )
        {
            lE( "#cpassword", errorStrings[ 0 ] );
            passed = false;
        }
        else if( $("#password").val() != $("#cpassword").val() )
        {
            lE( "#password", errorStrings[ 1 ] );
            lE( "#cpassword", errorStrings[ 1 ] );
            passed = false;
        }
        else
        {
            lE( "#password", "" );
            lE( "#cpassword", "" );
        }
        if( emailval.length < 1 )
        {
            lE( "#email", errorStrings[ 2 ] );
            passed = false;
        }
        else if (!emailReg.test(emailval))
        {
            lE( "#email", errorStrings[ 3 ] );
            passed = false;
        }
        else
        {
            lE( "#email", "" );
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
    var lE = lEv();
    lE( "#cpassword", "Passwords did not match." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
    $( "#loginbutton" ).button( "disable" );
}
function emailTaken()
{
    var lE = lEv();
    lE( "#email", "Email is already associated with an account." );
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

function invalidLoginCombo()
{
    var str = "Invalid login information.";
    var lE = lEv();
    lE( "#username", str );
    lE( "#password", str );
    restoreLoginForm();
}

function restoreLoginForm( )
{
    restoreForm( "loginform" );
}
