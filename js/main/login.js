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
    //$("body").html("");
    $("#news").empty().append(

    $("<form id='loginform'>For new or returning users:<br></form>")
      .append( createLoginInput( "Username", "text", "username", 20,
               "class='filterkeys' data-filterkeys='[a-zA-Z0-9]'") )
      .append( createLoginInput( "Password", "password", "password", 40 ) )
      .append( createLoginInput( "Retype Password", "password", "cpassword",
                                 40 ) )
      .append( createLoginInput( "E-mail", "text", "email", 40 ) )
      .appendTo("body").filterKeys()//;
      );

    $("<div>")
      .append("<button id='loginbutton'>Login</button>")
      .append("<button id='newuserbutton'>New User</button>")
      .append("<button id='forgotpassbutton'>Forgot Password</button>")
      .appendTo("#loginform");

    $("#cpasswordspan, #emailspan").css( "display", "none" );
    $("#loginbutton, #newuserbutton, #forgotpassbutton").button()
        .button( "disable" )
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
    $("#forgotpassbutton").click(function( evt ){
        if( $( "#emailspan" ).css( "display" ) != "none")
        {
            passReset();
        }
        else
        {
            forgotPass();
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
        var lE = loginError;
        if( $("#username").val().substring( 0, 1 ).search( "[0-9]" ) > -1 )
        {
            lE( "#username", errorStrings[ 1 ] );
            $("#forgotpassbutton").button( "disable" );
            passed = false;
        }
        else if( $("#username").val().length == 0 )
        {
            lE( "#username", errorStrings[ 3 ] );
            $("#forgotpassbutton").button( "disable" );
            passed = false;
        }
        else if( $("#username").val().length < 4 )
        {
            lE( "#username", errorStrings[ 0 ] );
            $("#forgotpassbutton").button( "disable" );
            passed = false;
        }
        else
        {
            lE( "#username", "" );
            $("#forgotpassbutton").button( "enable" );
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
            $("#loginbutton, #newuserbutton").button( "enable" );
            $("#forgotpassbutton").button( "disable" );
        }
        else
        {
            $("#loginbutton, #newuserbutton").button( "disable" );
        }
    }).keyup();
    
    $("#username").focus();
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
        /*warnObject.html( "<span class='ui-icon ui-icon-alert' " +
                         "style='float:left'></span>" + reason );*/
        warnObject.html( "<span class='ui-icon ui-icon-alert' " +
                         "style='float:left' title='" + reason +
                         "'></span>" );
        warnObject.css( {"display" : "inline-block"} );
    }
}

function usernameTaken()
{
    var lE = loginError;
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
    $("#forgotpassbutton").css( "display", "none" );

    var errorStrings = [
        "Password must be at least 4 characters.",
        "Your Passwords do not match",
        "Email address required",
        "Email must be in the following format user@host.domain"
    ];

    $("#cpassword, #email").bind('keyup', function(){
        var passed = true;
        var lE = loginError;
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
            $("#forgotpassbutton").button( "disable" );
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
    var lE = loginError;
    lE( "#cpassword", "Passwords did not match." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
    $( "#loginbutton" ).button( "disable" );
}
function emailTaken()
{
    var lE = loginError;
    lE( "#email", "Email is already associated with an account." );
    restoreLoginForm();
    $( "#username, #password" ).attr( "disabled", "disabled" )
      .attr( "readonly", true );
    $( "#loginbutton" ).button( "enable" );
    $("#forgotpassbutton").button( "disable" );
}

function accountCreated( id )
{
    validLogin( id );
    restoreLoginForm();
}

function invalidLoginCombo()
{
    var str = "Invalid login information.";
    var lE = loginError;
    lE( "#username", str );
    lE( "#password", str );
    restoreLoginForm();
}

function restoreLoginForm( )
{
    restoreForm( "loginform" );
}

function forgotPass()
{
    var errorStrings = [
        "Please type in your email associated with this account.",
        "Email must be in the following format user@host.domain"
    ];
    
    var lE = loginError;
    $("#emailspan").css( "display" , "")/*.css({'right' : '0px', 'top' : '-30px', 'width' : '264px'})*/;
    restoreLoginForm();
    lE("#password", "");
    $("#passwordspan").css( "display", "none" );
    $( "#username, #password" ).attr( "disabled", "disabled" )
        .attr( "readonly", true );
    $( "#loginbutton" ).button( "option", "label", "Reset Form", "enable" )
        /*.css({'right' : '192px', 'width' : '70px'})*/;
    $( "#newuserbutton" ).css( "display", "none" );
    $( "#forgotpassbutton" ).button( "option", "label", "Submit" )
        /*.css({'right': '105px', 'width' : '85px'})*/;
    lE("#email", errorStrings[ 0 ]);
    
    $("#email").bind('keyup', function(){
        var passed = true;
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var emailval = $("#email").val();
        if( emailval.length < 1 )
        {
            lE( "#email", errorStrings[ 0 ] );
            passed = false;
        }
        else if (!emailReg.test(emailval))
        {
            lE( "#email", errorStrings[ 1 ] );
            passed = false;
        }
        else
        {
            lE( "#email", "" );
        }

        if( passed )
        {
            $("#forgotpassbutton").button( "enable" );
        }
        else
        {
            $("#loginform button").button( "disable" );
            $( "#loginbutton" ).button( "enable" );
        }
    }).keyup();
}

function emailWrong()
{
    var lE = loginError;
    lE("#email", "The email supplied does not match what is on file." + 
        "  Try again!");
    restoreLoginForm();
    $( "#username" ).attr( "disabled", "disabled" ).attr( "readonly", true );
}

function emailRight( user )
{
    doLogin();
    var lE = loginError;
    lE("#username", "Your password has been reset.  Check your email and " +
        "enter the new password.");
    lE("#password", "");
    $("#username").val( user );
}

function passReset()
{
    doAjax( "passreset", {
        username: $("#username").val(),
        email: $("#email").val()
    });
}

function testalert()
{
    alert("Made it to this point");
}