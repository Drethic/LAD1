createWindow( "Tower D", {minWidth: 550} );
addMenuButton( "Tower D", "ui-icon-image", function(){runTowerD();} );

var td = {
    baddyhpstep: 5,
    baddybasespawncount: 5,
    baddybasespawndistance: 300,
    baddybasespeed: 5,
    baddyspeedstep: 1,
    towerbaseatk: 5,
    towerbaserange: 250,
    towerrangestepcost: 5,
    towerrangestep: 10,
    towerbasemaxhp: 100,
    towerhpstep: 10,
    towerhpstepcost: 50,
    expansioncost: 100,
    expansionhp: 25,
    baddytypes: [
        {
            hp: 75,
            name: "Bunny",
            speed: 0,
            complexity: 1
        },
        {
            hp: 100,
            name: "Chihuahua",
            speed: 0,
            complexity: 2
        }
    ],
    maxbaddycomplexity: 2
};

function disableModuleTOWERD()
{
    deleteAllElementsById( "Tower D" );
}

function getTowerInitial( key, def )
{
    if( def == undefined )
    {
        def = 0;
    }
    var initial = getPermCache( key );
    if( initial == "" )
    {
        initial = def;
    }
    initial = toNumber( initial );
    if( isNaN( initial ) )
    {
        initial = def;
    }
    return initial;
}

function createAlterableButton( txt, spanid, buttonid )
{
    return txt + ": <span id='" + spanid + "'></span><button id='" +
           buttonid + "'></button><div class='clear'></div>";
}

function runTowerD()
{
    // Quick var instantiation
    var i;
    
    // Cosmetics
    $("#center #Tower_D");
    
    // Unpack baddies
    var baddies, baddiesstr = getPermCache( "Baddies" );
    eval( "baddies=[" + baddiesstr + "]" );
    document.baddies = new Array();
    for( i = 0; i < baddies.length; i++ )
    {
        var currbaddy = baddies[ i ];
        var hp = currbaddy[ 0 ], multiplier = 0, speed = td.baddybasespeed,
            distance = td.baddybasespawndistance, name = td.baddytypes[ 0 ].name;
        
        if( currbaddy.length >= 2 )
        {
            multiplier = currbaddy[ 1 ];
        }
        if( currbaddy.length >= 3 )
        {
            speed = currbaddy[ 2 ];
        }
        if( currbaddy.length >= 4 )
        {
            distance = currbaddy[ 3 ];
        }
        if( currbaddy.length >= 5 )
        {
            name = currbaddy[ 4 ];
        }
        document.baddies.push( createBaddy( hp, multiplier, speed, distance, name ) );
    }
    
    // Unpack totals
    document.gold = getTowerInitial( "Gold" );
    document.totalgold = getTowerInitial( "TotalGold" );
    document.totalbaddykills = getTowerInitial( "TotalBaddyKills" );
    
    // Unpack Tower Upgrades
    document.baseatkupgrades = getTowerInitial( "BaseAttackUpgrades" );
    document.baserangeupgrades = getTowerInitial( "BaseRangeUpgrades" );
    document.basemaxhpupgrades = getTowerInitial( "BaseHPUpgrades" );
    document.basehp = getTowerInitial( "BaseHP", td.towerbasemaxhp );
    
    // Unpack Expansions
    document.expansioncount = getTowerInitial( "ExpansionCount" );
    
    // Unpack Baddy Upgrades
    document.baddyhpup = getTowerInitial( "BaddyHPUp" );
    document.baddyspeedup = getTowerInitial( "BaddySpeedUp" );
    
    // Unpack Baddy Level
    document.baddycomplexity = getTowerInitial( "BaddyComplexity", 1 );
    
    // Setup window
    var w = getPopupContext( "Tower D" );
    w.html( "<table border=0 style='width:100%' id='tdHdrTbl'><tr><td>Gold: <span id='Gold'></span></td>" +
            "<td>Baddies: <span id='BaddyCount'></span></td>" +
            "<td>HP: <span id='BaseHP'></span>/<span id='BaseMaxHP'></span></td></tr></table>" );
    w.append("<div id='TowerTabs'>" +
               "<ul>" +
                 "<li><a href='#TabTower'>Tower</a></li>" +
                 "<li><a href='#TabBaddies'>Mobs</a></li>" +
                 "<li><a href='#TabExpansions'>Expansions</a></li>" +
                 "<li><a href='#TabTStats'>Stats</a></li>" +
                 "<li><a href='#TabBeastiary'>Beastiary</a></li>" +
                 "<li><a href='#TabTowerView'>View Tower</a></li>" +
               "</ul>" +
               "<div id='TabTower'></div>" +
               "<div id='TabBaddies'></div>" +
               "<div id='TabExpansions'></div>" +
               "<div id='TabTStats'></div>" +
               "<div id='TabBeastiary'></div>" +
               "<div id='TabTowerView'></div>" +
             "</div>" );
         
    $("#TowerTabs li a").css( "padding", "0.2em" );
    $("#TowerTabs").tabs({idPrefix: 'Tab'});
    $("#TabTower")
      .append( createAlterableButton( "Base Attack", "BaseAttack", "tdIncreaseBaseAtk" ) )
      .append( createAlterableButton( "Base Range", "BaseRange", "tdIncreaseBaseRange" ) )
      .append( createAlterableButton( "Base Max HP", "BaseMaxHPCopy", "tdIncreaseBaseHP" ) )
      .append( "Base HP: <span id='BaseHPCopy'></span><button id='tdRestoreBaseHP'>Restore 1 HP</button>")
        .append("<button id='tdRestoreBaseHPAll'></button><div class='clear'></div>");
    // Baddies Tab
    $("#TabBaddies")
      .append( createAlterableButton( "Initial HP", "InitialBaddyHP", "tdIncreaseBaddyHP" ) )
      .append( createAlterableButton( "Initial Speed", "InitialBaddySpeed", "tdIncreaseBaddySpeed" ) )
      .append( createAlterableButton( "Complexity", "BaddyComplexity", "tdIncreaseBaddyComplexity" ) )
      .append( "Initial Spawn Distance: " + td.baddybasespawndistance );
    $("#TabExpansions")
      .append( createAlterableButton( "Expansions", "ExpansionCount", "tdIncreaseExpansion" ) )
      .append( "<div id='ExpansionTabs'></div>" );
    $("#TabTStats")
      .append( "Total Kills: <span id='TotalBaddyKills'>" + document.totalbaddykills + "</span><div class='clear'></div>")
      .append( "Total Gold: <span id='TotalGold'>" + document.totalgold + "</span><div class='clear'></div>" );
    $("#TabBeastiary")
      .append( "<div id='BeastiaryAccordion'></div>" );

    $("#tdIncreaseBaseAtk").button().click(function(){
        var cost = getIncreaseBaseAtkCost();
        if( document.gold < cost )
        {
            return;
        }
        adjustGold( -cost );
        increaseBaseAttack();
    });
    $("#tdIncreaseBaseRange").button().click(function(){
        var cost = getIncreaseBaseRangeCost();
        if( document.gold < cost )
        {
            return;
        }
        adjustGold( -cost );
        increaseBaseRange();
    });
    $("#tdIncreaseBaseHP").button().click(function(){
        var cost = getIncreaseBaseHPCost();
        if( document.gold < cost )
        {
            return;
        }
        adjustGold( -cost );
        increaseBaseHP();
    });
    $("#tdRestoreBaseHP").button().click(function(){
        if( document.gold < 1 || document.basehp == getMaxHP() )
        {
            return;
        }
        adjustGold( -1 );
        document.basehp++;
        updateHP();
    });
    $("#tdRestoreBaseHPAll").button().click(function(){
        var cost = getMaxHP() - document.basehp;
        if( document.gold < cost || cost == 0 )
        {
            return;
        }
        adjustGold( -cost );
        document.basehp += cost;
        updateHP();
    });
    $("#tdIncreaseBaddyHP").button().click(function(){
        increaseBaddyHP();
    });
    $("#tdIncreaseBaddySpeed").button().click(function(){
        increaseBaddySpeed();
    });
    $("#tdIncreaseExpansion").button().click(function(){
        increaseExpansion();
    });
    $("#tdIncreaseBaddyComplexity").button().click(function(){
        increaseBaddyComplexity();
    });
    
    updateIncreaseBaseAtkButton();
    updateIncreaseBaseRangeButton();
    updateIncreaseBaseHPButton();
    updateIncreaseBaddyHPButton();
    updateIncreaseBaddySpeedButton();
    updateIncreaseBaddyComplexity();
    updateIncreaseExpansionButton();
    permCache( "Gold", document.gold, true );
    permCache( "BaddyCount", document.baddies.length, true );
    permCache( "TotalGold", document.totalgold, true );
    permCache( "TotalBaddyKills", document.totalbaddykills, true );

    // Check the beastiary
    for( i = 0; i < td.baddytypes.length; i++ )
    {
        if( td.baddytypes[ i ].complexity <= document.baddycomplexity )
        {
            addBeastiary( i );
        }
    }
    
    // Start game loop
    document.towerdinterval = setInterval( "towerDLoop();", 500 );
}

function adjustGold( amt )
{
    document.gold += amt;
    var rounded = Math.round( document.gold * 100 );
    document.gold = rounded / 100;
    permCache( "Gold", document.gold );
    if( amt > 0 )
    {
        document.totalgold += amt;
        rounded = Math.round( document.totalgold * 100 );
        document.totalgold = rounded / 100;
        permCache( "TotalGold", document.totalgold, true );
    }
    var formatted = document.gold;
    if( formatted == Math.round( formatted ) )
    {
        formatted = formatted + ".00";
    }
    else
    {
        var gt10 = formatted * 10;
        if( gt10 == Math.round( gt10 ) )
        {
            formatted = formatted.toString() + "0";
        }
    }
    $("#Gold").html( formatted );
}

// Expansions
function increaseExpansion()
{
    //wait
}

function getIncreaseExpansionCost()
{
    var expansions = getExpansion();
    var ignore = ( expansions + 1 ) * ( expansions + 1 );
    var future = ( expansions + 3 ) * ( expansions + 3 );
    var diff = future - ignore;
    return diff * td.expansioncost;
}

function updateIncreaseExpansionButton()
{
    var cost = getIncreaseExpansionCost();
    var expansion = getExpansion();
    $("#ExpansionCount").html( expansion );
    $("#tdIncreaseExpansion").button( "option", "label", "Add Expansion(+1 layer, " + cost + " gold)" );
}

function getExpansion()
{
    return document.expansioncount;
}

function getExpansionIndexMin( layer )
{
    return ( ( layer * 2 ) - 1 ) * ( ( layer * 2 ) - 1 );
}

function getExpansionIndexMax( layer )
{
    var cols = ( layer * 2 ) + 1;
    return ( cols * cols ) - 1;
}

// Base Attack
function increaseBaseAttack()
{
    document.baseatkupgrades++;
    permCache( "BaseAttackUpgrades", document.baseatkupgrades );
    updateIncreaseBaseAtkButton();
}

function getIncreaseBaseAtkCost()
{
    var timesUpgraded = document.baseatkupgrades;
    return 5 + ( timesUpgraded * 5 );
}

function updateIncreaseBaseAtkButton()
{
    var cost = getIncreaseBaseAtkCost();
    $("#BaseAttack").html( getAttack() );
    $("#tdIncreaseBaseAtk").button( "option", "label", "Increase Base Atk(+5 dmg, " + cost + " gold)" );
}

function getAttack()
{
    return td.towerbaseatk + ( document.baseatkupgrades * 5 );
}

// Base Range
function increaseBaseRange()
{
    document.baserangeupgrades++;
    permCache( "BaseRangeUpgrades", document.baserangeupgrades );
    updateIncreaseBaseRangeButton();
}

function getIncreaseBaseRangeCost()
{
    var timesUpgraded = document.baserangeupgrades;
    var increment = td.towerrangestepcost;
    return increment + ( timesUpgraded * increment );
}

function updateIncreaseBaseRangeButton()
{
    var cost = getIncreaseBaseRangeCost();
    var rangestep = td.towerrangestep;
    $("#BaseRange").html( getRange() );
    $("#tdIncreaseBaseRange").button( "option", "label", "Increase Base Range(+" + rangestep + " range, " + cost + " gold)" );
}

function getRange()
{
    return td.towerbaserange + ( document.baserangeupgrades * td.towerrangestep );
}

// HP
function increaseBaseHP()
{
    document.basehp += td.towerhpstep;
    document.basemaxhpupgrades++;
    permCache( "BaseHPUpgrades", document.basemaxhpupgrades );
    updateIncreaseBaseHPButton();
}

function getIncreaseBaseHPCost()
{
    var increment = td.towerhpstepcost;
    return increment;
}

function updateIncreaseBaseHPButton()
{
    var cost = getIncreaseBaseHPCost();
    var hpstep = td.towerhpstep;
    $("#BaseMaxHP,#BaseMaxHPCopy").html( getMaxHP() );
    $("#tdIncreaseBaseHP").button( "option", "label", "Increase Base Max HP(+" + hpstep + ", " + cost + " gold)" );
    updateHP();
}

function getMaxHP()
{
    return td.towerbasemaxhp + ( document.basemaxhpupgrades * td.towerhpstep );
}

function updateHP()
{
    var cost = getMaxHP() - document.basehp;
    permCache( "BaseHP", document.basehp );
    $("#BaseHP,#BaseHPCopy").html( document.basehp );
    $("#tdRestoreBaseHPAll").button( "option", "label", "Restore All HP(" + cost + " gold)" );
    $("#tdRestoreBaseHPAll,#tdRestoreBaseHP").button( "option", "disabled", cost == 0 );
}

// Baddy HP
function increaseBaddyHP()
{
    document.baddyhpup++;
    permCache( "BaddyHPUp", document.baddyhpup );
    updateIncreaseBaddyHPButton();
}

function getBaddyHP( type )
{
    return td.baddytypes[ type ].hp + getBaddyHPAddAll();
}

function getBaddyHPAddAll()
{
    var sum = 0;
    var currentadd = td.baddyhpstep;
    for( var i = 0; i < document.baddyhpup; i++ )
    {
        sum += currentadd;
        currentadd += td.baddyhpstep;
    }
    return sum;
}

function updateIncreaseBaddyHPButton()
{
    var initialhp = getBaddyHPAddAll();
    var step = ( document.baddyhpup + 1 ) * td.baddyhpstep;
    $("#InitialBaddyHP").html( "+" + initialhp + ",+" + document.baddyhpup * 2 + "% gold" );
    $("#tdIncreaseBaddyHP").button( "option", "label", "Increase Baddy HP(+" + step + " HP,+2% gold)" );
}

// Baddy Speed
function increaseBaddySpeed()
{
    document.baddyspeedup++;
    permCache( "BaddySpeedUp", document.baddyspeedup );
    updateIncreaseBaddySpeedButton();
}

function getBaddySpeed( type )
{
    return td.baddybasespeed + ( td.baddyspeedstep * document.baddyspeedup ) +
           td.baddytypes[ type ].speed;
}

function updateIncreaseBaddySpeedButton()
{
    var initialspeed = ( td.baddyspeedstep * document.baddyspeedup );
    var step = td.baddyspeedstep;
    $("#InitialBaddySpeed").html( initialspeed + ",+" + document.baddyspeedup * 2 + "% gold" );
    $("#tdIncreaseBaddySpeed").button( "option", "label", "Increase Baddy Speed(+" + step + " Speed,+2% gold)" );
}

// Baddy Complexity
function increaseBaddyComplexity()
{
    document.baddycomplexity++;
    permCache( "BaddyComplexity", document.baddycomplexity );
    updateIncreaseBaddyComplexity();
    // Check if we need to add a baddy to the beastiary
    for( var i = 0; i < td.baddytypes.length; i++ )
    {
        if( td.baddytypes[ i ].complexity == document.baddycomplexity )
        {
            addBeastiary( i );
        }
    }
}

function getBaddyComplexity()
{
    return document.baddycomplexity;
}

function updateIncreaseBaddyComplexity()
{
    var complexity = getBaddyComplexity();
    $("#BaddyComplexity").html( document.baddycomplexity );
    if( td.maxbaddycomplexity == complexity )
    {
        $("#tdIncreaseBaddyComplexity").button( "option", "disabled", true );
    }
    else
    {
        $("#tdIncreaseBaddyComplexity").button( "option", "label", "Increase Baddy Complexity" );
    }
}

function addBeastiary( level )
{
    var baddyinfo = td.baddytypes[ level ];
    $("#BeastiaryAccordion")
      .append( "<h3><a href='#'>" + baddyinfo.name + "</a></h3>" )
      .append( $("<div></div>")
         // TODO: Insert image here...bunnies!
         .append( "<div style='width:128px;height:128px;display:inline;float:left;background-color:#00ffff'></div>" )
         .append( "<table style='color:white'><tr><td>Name</td><td colspan=3 style='text-align:center'>" +
                  baddyinfo.name + "</td></tr><tr><td>Health</td><td>" +
                  baddyinfo.hp + "</td><td style='color:#FFFF00'>+" + getBaddyHPAddAll() + "</td><td>=" +
                  getBaddyHP( level ) + "</td></tr><tr><td>Speed</td><td>" +
                  ( td.baddybasespeed + baddyinfo.speed ) + "</td><td style='color:#FFFF00'>+" +
                  ( td.baddyspeedstep * document.baddyspeedup ) + "</td><td>=" +
                  getBaddySpeed( level ) + "</td></tr></table>" )
      ).accordion( "destroy" ).accordion({
        active: false,
        collapsible: true,
        clearStyle: true
    });
}

// Baddy Spawning
function createBaddy( i_hp, i_multiplier, i_speed, i_distance, i_name )
{
    return {
        hp: i_hp,
        multiplier: i_multiplier,
        speed: i_speed,
        distance: i_distance,
        name: i_name,
        toString: function(){
            return "[" + this.hp + "," + this.multiplier + "," + this.speed +
                   "," + this.distance + ",\"" + this.name + "\"]";
        }
    };
}

function getBaddySpawnCount()
{
    return td.baddybasespawncount;
}

function spawnBaddyWave()
{
    var count = getBaddySpawnCount();
    var complexity = getBaddyComplexity();
    for( var i = 0; i < count; i++ )
    {
        var baddylevel = 0;
        switch( complexity )
        {
            case 1:
                break;
            case 2:
                if( i == count - 1 )
                {
                    baddylevel = 1;
                }
        }
        var multiplier = ( document.baddyhpup + document.baddyspeedup ) * 2;
        document.baddies.push( createBaddy( getBaddyHP( baddylevel ), multiplier,
                               getBaddySpeed( baddylevel ), td.baddybasespawndistance,
                               td.baddytypes[ baddylevel ].name ) );
    }
    permCache( "Baddies", document.baddies );
    permCache( "BaddyCount", document.baddies.length, true );
}

// Baddy Damage
function damageBaddies( damage, indexes )
{
    // Apply damage
    // Put all dead baddies into an array
    var deadIndexes = [], i, index, j = 0, goldearned = 0;
    for( i in indexes )
    {
        index = indexes[ i ];
        document.baddies[ index ].hp -= damage;
        if( document.baddies[ index ].hp <= 0 )
        {
            deadIndexes.push( index );
        }
    }
    if( deadIndexes.length == 0 )
    {
        return;
    }
    // Sort the array of dead baddies
    function sortByNumber( a, b )
    {
        return a - b;
    }
    deadIndexes = deadIndexes.sort( sortByNumber );
    // Delete each one
    while( deadIndexes.length > 0 )
    {
        document.totalbaddykills++;
        index = deadIndexes.shift() - j;
        goldearned += 1 + ( 0.01 * document.baddies[ index ].multiplier );
        document.baddies.splice( index, 1 );
        j++;
    }
    adjustGold( goldearned );
    permCache( "TotalBaddyKills", document.totalbaddykills, true );
    permCache( "BaddyCount", document.baddies.length, true );
}

function towerDLoop()
{
    // Stop the loop if the window is hidden
    var w = $( "div#Tower_D" );
    if( !w.hasClass( "popup" ) )
    {
        clearInterval( document.towerdinterval );
        return;
    }
    
    // Spawn a wave if there are no baddies
    if( document.baddies.length == 0 )
    {
        spawnBaddyWave();
    }
    
    // Move each baddy closer and find the closest
    var closestbaddy = -1;
    var closestdistance = Number.MAX_VALUE;
    var damagedbase = false;
    for( var i = 0; i < document.baddies.length; i++ )
    {
        var speed = document.baddies[ i ].speed;
        document.baddies[ i ].distance -= speed;
        if( document.baddies[ i ].distance <= 0 )
        {
            document.baddies[ i ].distance = 0;
            document.basehp--;
            damagedbase = true;
        }
        if( document.baddies[ i ].distance < closestdistance )
        {
            closestbaddy = i;
            closestdistance = document.baddies[ i ].distance;
        }
    }
    
    // Update Base HP if damaged
    if( damagedbase )
    {
        updateHP();
    }
    
    // Only attack if in range
    var range = getRange();
    if( closestdistance <= range )
    {
        // -= HP
        damageBaddies( getAttack(), [closestbaddy] );
    }
    
    
    if( document.baddies.length == 0 )
    {
        spawnBaddyWave();
    }

    // Add graphical view stuff here
    // Use #TabTowerView as your container, though you'll probably want a sub
    // container so it doesn't mess up the layout
    // document.baddies:
    //   Array of all the baddies
    //     Includes: hp, name, multiplier, speed and distance
    //     Useful for you would be distance mostly, maybe the others
    //     Use document.baddies.length to find out how many
    //     From there use it like document.baddies[ 0 ].distance, etc.
    //     GL
    
    permCache( "Baddies", document.baddies );
}