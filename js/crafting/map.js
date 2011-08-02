createWindow( "Gather Map" );
createWindow( "Crafting" );
addMenuButton( "Gather Map", "ui-icon-image", requestGatherMap );
addMenuButton( "Crafting", "ui-icon-shuffle", requestCrafting );

function disableModuleCRAFTING()
{
    deleteAllElementsById( "Gather Map" );
    deleteAllElementsById( "Crafting" );
}

function requestGatherMap()
{
    
}

function requestCrafting()
{
    
}