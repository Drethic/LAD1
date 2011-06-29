/**
 * Requests the next math question from the server.  If the optional parameter
 * is set then the current answer is sent in the request data
 */
function requestNextMathQuestion( sendAnswer )
{
    if( sendAnswer )
    {
        //wait
    }
}

/**
 * Disables the math module.
 */
function disableModuleMATH()
{
    deleteAllElementsById( "Math" );
}

// Onload startup
// Initialize the window
createWindow( "Math" );
// Add the menu button
addMenuButton( "Math", "ui-icon-check", function(){
    var w = getPopupContext( "Math" );
    requestNextMathQuestion();
});