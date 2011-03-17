function doLogin()
{
   $("<form id='loginform'>Login<br></form>")
     .append("Username:<input type='text' name='username'><br>")
     .append("Password:<input type='text' name='password'><br>")
     .appendTo("body");

   $("<div>")
     .append("<button id='logindiv'>Login</button>")
     .append("<button id='newuserdiv'>New User</button>")
     .appendTo("#loginform");

   $("#logindiv, #newuserdiv").button().css( "font-size", "0.6em" );
   $("#logindiv").click(function(){
       $("#loginform input, #loginform button").button( "disable" )
         .button( "refresh" ).attr( "readonly", true );
   });
}