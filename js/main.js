function doLogin()
{
    $("body").html("");
    
    $("<form id='loginform'>Login<br></form>")
      .append("Username:<input type='text' name='username' " +
              "maxlength=20 id='username'>")
      .append("<span id='usernameerror'></span><br>")
      .append("Password:<input type='text' name='password' " +
              "maxlength=40 id='password'>")
      .append("<span id='passworderror'></span><br>")
      .appendTo("body");

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
       "Username must be at least 4 characters."
   ];
   $("#username, #password").keyup(function(){
       if( $("#username").val().length < 4 )
       {
           loginError( true, errorStrings[ 0 ] );
       }
       else
       {
           loginError( true, "" );
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