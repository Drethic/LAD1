// Initialize the window
createWindow( "LAD" );

// Setup button
addMenuButton( "LAD", "ui-icon-home", function(){
    doAjax( "java_run", {
        login: ""
    });
});