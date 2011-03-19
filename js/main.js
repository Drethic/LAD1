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
      .appendTo("body").filterKeys();

    $("<div>")
      .append("<button id='loginbutton'>Login</button>")
      .append("<button id='newuserbutton'>New User</button>")
      .appendTo("#loginform");

    $("#loginbutton, #newuserbutton").button().css( "font-size", "0.6em" )
      .button( "disable" );
    $("#loginbutton").click(function(){
       $("#loginform input, #loginform button").button( "disable" )
         .button( "refresh" ).attr( "readonly", true );
   });

   $("#usernameerror, #passworderror").css( "font-weight", "bold" );

   var errorStrings = [
       "Username must be at least 4 characters.",
       "Username cannot start with a number.",
       "Password must be at least 4 characters."
   ];
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
        warnObject.css( "display", "");
        warnObject.html( reason );
    }
}