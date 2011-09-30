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
    baddytypes: [
        {
            hp: 75
        }
    ]
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
    // Cosmetics
    $("#center #Tower_D");
    
    // Unpack baddies
    var baddies, baddiesstr = getPermCache( "Baddies" );
    eval( "baddies=[" + baddiesstr + "]" );
    document.baddies = new Array();
    for( var i = 0; i < baddies.length; i++ )
    {
        var currbaddy = baddies[ i ];
        var hp = currbaddy[ 0 ], multiplier = 0, speed = td.baddybasespeed,
            distance = td.baddybasespawndistance;
        
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
        document.baddies.push( createBaddy( hp, multiplier, speed, distance ) );
    }
    
    // Unpack gold
    document.gold = getTowerInitial( "Gold" );
    
    // Unpack Tower Upgrades
    document.baseatkupgrades = getTowerInitial( "BaseAttackUpgrades" );
    document.baserangeupgrades = getTowerInitial( "BaseRangeUpgrades" );
    document.basemaxhpupgrades = getTowerInitial( "BaseHPUpgrades" );
    document.basehp = getTowerInitial( "BaseHP", td.towerbasemaxhp );
    
    // Unpack Baddy Upgrades
    document.baddyhpup = getTowerInitial( "BaddyHPUp" );
    document.baddyspeedup = getTowerInitial( "BaddySpeedUp" );
    
    
    // Setup window
    var w = getPopupContext( "Tower D" );
    w.html( "<table border=0 style='width:100%' id='tdHdrTbl'><tr><td>Gold: <span id='Gold'></span></td>" +
            "<td>Baddies: <span id='BaddyCount'></span></td>" +
            "<td>HP: <span id='BaseHP'></span>/<span id='BaseMaxHP'></span></td></tr></table>" );
    w.append("<div id='TowerTabs'>" +
               "<ul>" +
                 "<li><a href='#TabTower'>Tower</a></li>" +
                 "<li><a href='#TabBaddies'>Mobs</a></li>" +
               "</ul>" +
               "<div id='TabTower'></div>" +
               "<div id='TabBaddies'></div>" +
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
      .append( "Initial Spawn Distance: " + td.baddybasespawndistance );
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
    
    updateIncreaseBaseAtkButton();
    updateIncreaseBaseRangeButton();
    updateIncreaseBaseHPButton();
    updateIncreaseBaddyHPButton();
    updateIncreaseBaddySpeedButton();
    permCache( "Gold", document.gold, true );
    permCache( "BaddyCount", document.baddies.length, true );
    
    // Start game loop
    document.towerdinterval = setInterval( "towerDLoop();", 500 );
}

function adjustGold( amt )
{
    document.gold += amt;
    var rounded = Math.round( document.gold * 100 );
    document.gold = rounded / 100;
    permCache( "Gold", document.gold );
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
            formatted = formatted + "0";
        }
    }
    $("#Gold").html( formatted );
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

function getBaddySpeed()
{
    return td.baddybasespeed + ( td.baddyspeedstep * document.baddyspeedup );
}

function updateIncreaseBaddySpeedButton()
{
    var initialspeed = getBaddySpeed();
    var step = td.baddyspeedstep;
    $("#InitialBaddySpeed").html( initialspeed + ",+" + document.baddyspeedup * 2 + "% gold" );
    $("#tdIncreaseBaddySpeed").button( "option", "label", "Increase Baddy Speed(+" + step + " Speed,+2% gold)" );
}

// Baddy Spawning
function createBaddy( i_hp, i_multiplier, i_speed, i_distance )
{
    return {
        hp: i_hp,
        multiplier: i_multiplier,
        speed: i_speed,
        distance: i_distance,
        toString: function(){
            return "[" + this.hp + "," + this.multiplier + "," + this.speed +
                   "," + this.distance + "]";
        }
    };
}

function getBaddySpawnCount()
{
    return td.baddybasespawncount;
}

function spawnBaddyWave()
{
    for( var i = 0; i < getBaddySpawnCount(); i++ )
    {
        var multiplier = ( document.baddyhpup + document.baddyspeedup ) * 2;
        document.baddies.push( createBaddy( getBaddyHP( 0 ), multiplier,
                               getBaddySpeed(), td.baddybasespawndistance ) );
    }
    permCache( "Baddies", document.baddies );
    permCache( "BaddyCount", document.baddies.length, true );
}

// Baddy Damage
function damageBaddies( damage, indexes )
{
    // Apply damage
    // Put all dead baddies into an array
    var deadIndexes = [], i, index, j = 0;
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
        index = deadIndexes.shift() - j;
        adjustGold( 1 + ( 0.01 * document.baddies[ index ].multiplier ) );
        document.baddies.splice( index, 1 );
        j++;
    }
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
    
    permCache( "Baddies", document.baddies );
}