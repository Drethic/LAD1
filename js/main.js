function doLogin()
{
    $("body").html("");
    
    $("<form id='loginform'>Login<br></form>")
      .append("Username:<input type='text' name='username' id='username'>")
      .append("<span id='usernameerror'></span><br>")
      .append("Password:<input type='text' name='password' id='password'>")
      .append("<span id='usernameerror'></span><br>")
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

   var errorStrings = [
       "Username must be at least 4 characters."
   ];
   $("#username, #password").keyup(function(){
       if( $("#username").val().length < 4 )
       {
           $("#usernameerror").html( errorStrings[ 0 ] );
       }
       else
       {
           $("#usernameerror").html( "" );
       }
   }).keyup();
}