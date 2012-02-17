createWindow( "Tower D", {minWidth: 550} );
addMenuButton( "Tower D", "ui-icon-image", function(){runTowerD();} );

Array.prototype.toString = function()
{
    var ret = "[";
    for( var i = 0; i < this.length; i++ )
    {
        ret += this[ i ];
        if( i != this.length - 1 )
        {
            ret += ",";
        }
    }
    return ret + "]";
};

var td = {
    baddyhpstep: 5,
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
    archerbaserange: 150,
    archerrangestep: 5,
    archerbasedamage: 1,
    archerdamagestep: 1,
    baddytypes: [
        {
            hp: 75,
            name: "Bunny",
            speed: 0,
            multiplier: 0,
            image: "icon-bunny"
        },
        {
            hp: 100,
            name: "Chihuahua",
            speed: 0,
            multiplier: 0.04,
            image: "icon-chihuahua"
        },
        {
            hp: 80,
            name: "Rat",
            speed: 3,
            multiplier: 0.1
        },
        {
            hp: 100,
            name: "Flying Pig",
            speed: 0,
            multiplier: 0.1
        },
        {
            hp: 200,
            name: "Snake",
            speed: 1,
            multiplier: 0.15
        }
    ],
    complexities: [
        [ 0, 0, 0, 0, 0 ],
        [ 1, 0, 0, 0, 0 ]
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
    // Quick var instantiation
    var i;
    
    // Cosmetics
    $("#center #Tower_D");
    
    // Unpack baddies
    var baddies = [], baddiesstr = getPermCache( "Baddies" );
    if( baddiesstr != "" )
    {
        eval( "baddies=" + baddiesstr );
    }
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

    // Unpack expansions
    var expansions = [], expansionstr = getPermCache( "Expansions" );
    if( expansionstr != "" )
    {
        eval( "expansions=" + expansionstr );
    }
    document.expansions = new Array();
    
    // Unpack totals
    document.gold = getTowerInitial( "Gold" );
    document.totalgold = getTowerInitial( "TotalGold" );
    document.totalbaddykills = getTowerInitial( "TotalBaddyKills" );
    
    // Unpack Tower Upgrades
    document.baseatkupgrades = getTowerInitial( "BaseAttackUpgrades" );
    document.baserangeupgrades = getTowerInitial( "BaseRangeUpgrades" );
    document.basemaxhpupgrades = getTowerInitial( "BaseHPUpgrades" );
    document.basehp = getTowerInitial( "BaseHP", td.towerbasemaxhp );
    
    // Unpack Baddy Upgrades
    document.baddyhpup = getTowerInitial( "BaddyHPUp" );
    document.baddyspeedup = getTowerInitial( "BaddySpeedUp" );
    
    // Unpack Baddy Level
    document.baddycomplexity = getTowerInitial( "BaddyComplexity", 1 );
    document.seenbaddies = [];
    
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
      .append( "<button id='tdIncreaseExpansion'></button><div class='clear'></div>" )
      .append( "<div id='ExpansionTabs'>No expansions purchased.</div>" );
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
        var cost = getIncreaseExpansionCost();
        if( document.gold < cost )
        {
            return;
        }
        adjustGold( -cost );
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
    for( i = 0; i < document.baddycomplexity; i++ )
    {
        var wave = td.complexities[ i ];
        for( var j = 0; j < wave.length; j++ )
        {
            var baddy = wave[ j ];
            if( document.seenbaddies.indexOf( baddy ) == -1 )
            {
                addBeastiary( baddy );
                document.seenbaddies.push( baddy );
            }
        }
    }
    
    // Setup expansions
    for( i = 0; i < expansions.length; i++ )
    {
        increaseExpansion();
        var currdata = expansions[ i ];
        var type = currdata.shift();
        switch( type )
        {
            case 1:
                buildArcheryRange( currdata );
                break;
            case 2:
                buildBarracks( currdata );
                break;
            case 3:
                buildBlacksmith( currdata );
                break;
        }
    }
    updateIncreaseExpansionButton();
    
    // Expansions force focus back to them, sooo...reset focus back to first
    $("#TowerTabs").tabs( "select", 0 );
    
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
    document.expansions.push( [0] );
    permCache( "Expansions", document.expansions );
    var exp = document.expansions.length;
    if( $("#ExpansionTabs").children( "ul" ).size() == 0 )
    {
        $("#ExpansionTabs").html( "" ).append("<ul></ul>");
    }
    $("#ExpansionTabs ul").append( "<li><a href='#TabExpansion" + exp + "'>Expansion " + exp + "</a></li>" );
    $("#ExpansionTabs").append( "<div id='TabExpansion" + exp + "'></div>" );
    var tab = $("#TabExpansion" + exp );
    tab.append( "<div style='display:none' class='id'>" + exp + "</div>" );

    // Create/add buttons to build the expansions
    var archeryRange = $("<button>Build Archery Range</button>")
      .appendTo( tab ).button().click(function(){
          buildArcheryRange();
      });
    tab.append( "<div class='clear'></div>" );
    var barracks = $("<button>Build Barracks</button>")
      .appendTo( tab ).button().click(function(){
          buildBarracks();
      });
    tab.append( "<div class='clear'></div>" );
    var blacksmith = $("<button>Build Blacksmith</button>")
      .appendTo( tab ).button().click(function(){
          buildBlacksmith();
      });
    tab.append( "<div class='clear'></div>" );

    // Only allow one of each the unique buildings
    for( var i = 0; i < document.expansions.length; i++ )
    {
        switch( document.expansions[ i ][ 0 ] )
        {
            case 1:
                disableExpansionButton( archeryRange, "archery range" );
                break;
            case 2:
                disableExpansionButton( barracks, "barracks" );
                break;
            case 3:
                disableExpansionButton( blacksmith, "blacksmith" );
                break;
        }
    }
    
    // Refresh the tabs
    $("#ExpansionTabs").tabs( "destroy" ).tabs({idPrefix: 'Tab'});
    $("#TowerTabs").tabs( "destroy" ).tabs({idPrefix: 'Tab'}).tabs( "select", 2 );
    updateIncreaseExpansionButton();
}

function disableExpansionButton( button, type )
{
    button.button( "disable" ).button( "option", "label", "Only one " + type + " is allowed." );
}

// Archery range param details:
// Count, Range, Damage, Type
function buildArcheryRange( params )
{
    var data = getExpansionData( [ 1, 0, 0, 0 ], params, 1 );
    data.o.append( "<h2>Archery Range</h2>" )
      .append( "Number:<span id='tdExpArcherCount'>1</span>" )
      .append( $("<button class='tdExpArcherCount'></button>").button().click(function(){
          var tab = $(this).siblings(".id").text();
          var currCount = document.expansions[ tab - 1 ][ 1 ];
          var cost = getExpArcherIncreaseCost( currCount );
          if( document.gold < cost )
          {
              return;
          }
          currCount++;
          document.expansions[ tab - 1 ][ 1 ] = currCount;
          permCache( "Expansions", document.expansions );
          updateExpArcherCount( tab, currCount );
      })).append( "<div class='clear'></div>" )
      .append( "Range:<span id='tdExpArcherRange'>" + td.archerbaserange + "</span>" )
      .append( $("<button class='tdExpArcherRange'></button>").button().click(function(){
          var tab = $(this).siblings(".id").text();
          var currRangeUpgrade = document.expansions[ tab - 1 ][ 2 ];
          var cost = getExpArcherRangeIncreaseCost( currRangeUpgrade );
          if( document.gold < cost )
          {
              return;
          }
          currRangeUpgrade++;
          document.expansions[ tab - 1 ][ 2 ] = currRangeUpgrade;
          permCache( "Expansions", document.expansions );
          updateExpArcherRange( tab, currRangeUpgrade );
      })).append( "<div class='clear'></div>" )
      .append( "Damage:<span id='tdExpArcherDamage'>" + td.archerbasedamage + "</span>" )
      .append( $("<button class='tdExpArcherDamage'></button").button().click(function(){
          var tab = $(this).siblings(".id").text();
          var currDamageUpgrade = document.expansions[ tab - 1 ][ 3 ];
          var cost = getExpArcherDamageIncreaseCost( currRangeUpgrade );
          if( document.gold < cost )
          {
              return;
          }
          currDamageUpgrade++;
          document.expansions[ tab - 1 ][ 3 ] = currDamageUpgrade;
          permCache( "Expansions", document.expansions );
          updateExpArcherDamage( tab, currDamageUpgrade );
      })).append( "<div class='clear'></div>" );
      updateExpArcherCount( data.t, data.p[ 1 ] );
      updateExpArcherRange( data.t, data.p[ 2 ] );
      updateExpArcherDamage( data.t, data.p[ 3 ] );
}

function getExpArcherIncreaseCost( currCount )
{
    return 1000 + ( ( currCount - 1 ) * 250 );
}

function updateExpArcherCount( tab, currCount )
{
    var cost = getExpArcherIncreaseCost( currCount );
    $("#tdExpArcherCount").html( currCount );
    $(".tdExpArcherCount").button( "option", "label", "+1 Archer, " + cost + " gold" );
}

function getExpArcherTab( )
{
    for( var i = 0; i < document.expansions.length; i++ )
    {
        if( document.expansions[ i ][ 0 ] == 1 )
        {
            return i;
        }
    }
    return -1;
}

function getExpArcherRangeIncreaseCost( currRange )
{
    return 500 + ( ( currRange - 1 ) * 500 );
}

function getExpArcherActualRange( )
{
    var tab = getExpArcherTab();
    return td.archerbaserange + ( td.archerrangestep * document.expansions[ tab - 1 ][ 2 ] );
}

function updateExpArcherRange( tab, currRange )
{
    var cost = getExpArcherRangeIncreaseCost( currRange );
    var actualRange = getExpArcherActualRange();
    $("#tdExpArcherRange").html( actualRange );
    $(".tdExpArcherRange").button( "option", "label", "+" + td.archerrangestep + 
                                   " range, " + cost + " gold" );
}

function getExpArcherDamageIncreaseCost( currDamage )
{
    return 2000 + ( ( currDamage - 1 ) * 1000 );
}

function getExpArcherActualDamage( )
{
    var tab = getExpArcherTab();
    return td.archerbasedamage + ( td.archerdamagestep * document.expansions[ tab - 1 ][ 3 ] );
}

function updateExpArcherDamage( tab, currDamage )
{
    var cost = getExpArcherDamageIncreaseCost( currDamage );
    var actualDamage = getExpArcherActualDamage();
    $("#tdExpArcherDamage").html( actualDamage );
    $(".tdExpArcherDamage").button( "option", "label", "+" + td.archerdamagestep +
                                    " damage, " + cost + " gold" );
}

// Barracks param details:
// Count, Health, Damage, Type
function buildBarracks( params )
{
    var data = getExpansionData( [ 1, 0, 0, 0 ], params, 2 );
    data.o.append( "<h2>Barracks</h2>" );
}

// Blacksmith param details:
// Armor, Ranged Weapons, Melee Weapons
function buildBlacksmith( params )
{
    var data = getExpansionData( [ 0, 0, 0 ], params, 3 );
    data.o.append( "<h2>Blacksmith</h2>" );
}

// Returns object with:
// p: parameter data
// t: tab number
// o: Object for putting data in
function getExpansionData( def, input, type )
{
    var params, tab;
    if( input == undefined )
    {
        params = def;
        tab = $(this).siblings(".id").text();
    }
    else
    {
        while( input.length < def.length )
        {
            input.push( 0 );
        }
        tab = document.expansions.length;
        params = input;
    }
    var object = $("#ExpansionTabs div#TabExpansion" + tab);
    object.children().not("[class='id']").remove();
    var paramscopy = params;
    paramscopy.unshift( type );
    document.expansions[ tab - 1 ] = paramscopy;
    permCache( "Expansions", document.expansions );
    return {
        p: params,
        t: tab,
        o: object
    };
}

function getIncreaseExpansionCost()
{
    var expansions = getExpansion();
    var power = 1 + ( 0.05 * expansions );
    return Math.round( Math.pow( 1000, power ) );
}

function updateIncreaseExpansionButton()
{
    var cost = getIncreaseExpansionCost();
    var expansion = getExpansion();
    $("#tdIncreaseExpansion").button( "option", "label", "Add Expansion(+1 layer, " + cost + " gold)" );
}

function getExpansion()
{
    return document.expansions.length;
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
    // Quick list
    var currlist = getComplexityWave();
    // Check if we need to add a baddy to the beastiary
    for( var i = 0; i < currlist.length; i++ )
    {
        var currlevel = currlist[ i ];
        var found = false;
        for( var j = 0; j < document.seenbaddies.length; j++ )
        {
            if( currlevel == document.seenbaddies[ j ] )
            {
                found = true;
                break;
            }
        }
        if( !found )
        {
            addBeastiary( currlevel );
        }
    }
}

function getBaddyComplexity()
{
    return document.baddycomplexity;
}

function getComplexityWave()
{
    return td.complexities[ getBaddyComplexity() - 1 ];
}

function updateIncreaseBaddyComplexity()
{
    var complexity = getBaddyComplexity();
    $("#BaddyComplexity").html( complexity );
    if( td.complexities.length == complexity )
    {
        $("#tdIncreaseBaddyComplexity").button( "option", "disabled", true )
          .button( "option", "label", "Max Complexity" );
    }
    else
    {
        $("#tdIncreaseBaddyComplexity").button( "option", "label", "Increase Baddy Complexity" );
    }
}

function addBeastiary( level )
{
    document.seenbaddies.push( level );
    var baddyinfo = td.baddytypes[ level ];
    $("#BeastiaryAccordion")
      .append( "<h3><a href='#'>" + baddyinfo.name + "</a></h3>" )
      .append( $("<div></div>")
         // TODO: Insert image here...bunnies!
         .append( "<div id='" + baddyinfo.image + "' style='width:128px;height:128px;display:inline;float:left;'></div>" )
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
    var wave = getComplexityWave();
    return wave.length;
}

function spawnBaddyWave()
{
    var count = getBaddySpawnCount();
    var complexity = getBaddyComplexity();
    var wave = getComplexityWave();
    for( var i = 0; i < count; i++ )
    {
        var baddylevel = wave[ i ];
        var multiplier = ( document.baddyhpup + document.baddyspeedup ) * 2;
        multiplier += td.baddytypes[ baddylevel ].multiplier;
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
    for( i = 0; i < indexes.length; i++ )
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