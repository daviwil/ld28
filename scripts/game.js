
// The game object, assigned in initializeGame();
var game;

// Screen resolution variables
var screenWidth = 1024;
var screenHeight = 720;

// Game state variables
var STATE_NONE = 0, 
    STATE_DROP = 1, 
    STATE_DROPPING = 2, 
    STATE_DONE = 3;
var currentState = STATE_NONE;

// Game result types
var RESULT_MISSED = 0,
    RESULT_SLAYMAIDEN = 1,
    RESULT_SLAYDRAGON = 2;

// Weapon variables
var weapon;
var weaponBody;
var weaponDefinition;
var weaponDropMinX = 100;
var weaponDropMaxX = screenWidth - 200;
var weaponDropStartY = screenHeight / 3;

// Player variables
var knight;

// Enemy variables
var enemyGroup;
var dragon;
 
// World variables 
var world;
var worldScale = 30.0;
var worldWidth = screenWidth;
var worldHeight = 30000;         // Test height
//var worldHeight = 5000;         // Test height
var enemyGenerationMultiplier = 3;
var groundOffset = 0;

// Background variables
var bgSprite;
var bgScrollFactor;
var bgScrollOffset;

// Score variables
var scoreData =
    { currentScore: 0,
      scoreText: "0",
      waitingScore: 0,
      highScore: 0,
      currentTween: undefined,
      tweenCompleteCallback: undefined }

// Text variables
var fontName = "New Rocker";
var scoreText;
var highScoreText;
var instructionText;
var instruction2Text;
var saveMaidenText;
var gameResultText;

var winTextColor = "#f6ed59";
var loseTextColor = "#f47a4f";

var missedDragonText = "You missed!\nThe dragon has eaten the maiden!";
var slayedDragonText = "You have slain the dragon!";
var slayedMaidenText = "You killed the maiden!";

// Input variables
var cursorKeys;

// Configuration variables
var physicsBodies;

var weaponDefinitions =
    {
        "sword":
            { sprite: "assets/sword_test.png",
                parts: [
                    { name: "sword_blade",
                      isBlade: true,
                      density: 30,
                      bounce: 0.1 },
                    { name: "sword_hilt",
                      isBlade: false,
                      density: 5,
                      bounce: 0.4 }
                ],
              mass: 35.0,
              inertia: 50.0 } 
    };

var enemyDefinitions =
    [
        { spriteName: "bat",
          worldRange: [0, 0.6],
          factor: 7,
          minSpeed: 1,
          maxSpeed: 4,
          scoreAmount: 1000,
          giblets: ["hawkman_piece4"] },

        { spriteName: "hawkman",
          worldRange: [ 0.2, 0.8 ],
          factor: 7,
          minSpeed: 2,
          maxSpeed: 6,
          scoreAmount: 5000,
          giblets: ['hawkman_piece1', 'hawkman_piece2', 'hawkman_piece3', 'hawkman_piece4', 'hawkman_piece5', 'hawkman_piece6'] },

        { spriteName: "wyvern",
          worldRange: [ 0.7, 1.0 ],
          factor: 1,
          minSpeed: 1,
          maxSpeed: 3,
          scoreAmount: 10000,
          giblets: ["wyvern_piece1", "wyvern_piece2"] }
    ];

var GameStates

// Type definition helpers
var b2Vec2 = Box2D.Common.Math.b2Vec2,  
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MassData = Box2D.Collision.Shapes.b2MassData;

// ---------- INITIALIZATION FUNCTIONS ----------

function initializeGame()
{
    // Base game definition
    game = 
        new Phaser.Game(
            screenWidth, screenHeight, Phaser.AUTO, 'gameContainer');
            //screenWidth, screenHeight, Phaser.CANVAS, 'gameContainer', 
            //{ preload: preload, create: create, update: update, render: render });

    game.state.add("Preload", { preload: preload, create: preload_create, update: preload_update });
    game.state.add("Game", { preload: preload, create: create, update: update, render: render });
    game.state.start("Preload");
}

function preload() {
    // Backgrounds
    game.load.image('bg', 'assets/sky_scribbleB.jpg');
    game.load.image('tower_base', 'assets/tower_base_bg.png');
    game.load.image('bridge', 'assets/top_bridge2.png');

    // Player
    game.load.image('knight', 'assets/knight_drop1.png');

    // Maiden
    game.load.image('maiden', 'assets/maiden.png');

    // Weapons
    game.load.image('sword', 'assets/sword_test.png');

    // Enemies
    game.load.image('bat', 'assets/enemy1.png');
    game.load.image('hawkman', 'assets/enemy2.png');
    game.load.image('wyvern', 'assets/enemy3.png');
    game.load.image('dragon', 'assets/dragonsketch.png');

    // Particles
    game.load.image('hawkman_piece1', 'assets/enemy2_piece1.png');
    game.load.image('hawkman_piece2', 'assets/enemy2_piece2.png');
    game.load.image('hawkman_piece3', 'assets/enemy2_piece3.png');
    game.load.image('hawkman_piece4', 'assets/enemy2_piece4.png');
    game.load.image('hawkman_piece5', 'assets/enemy2_piece5.png');
    game.load.image('hawkman_piece6', 'assets/enemy2_piece6.png');

    game.load.image('wyvern_piece1', 'assets/enemy3_piece1.png');
    game.load.image('wyvern_piece2', 'assets/enemy3_piece2.png');

    // Music
    game.load.audio('theme', ['assets/theme_loop.mp3']);

    // Data files
    game.load.text('physicsBodies', 'assets/PhysicsBodies.json');
}

var loadingText, loadingGraphics, progressWidth = 500;

function preload_create()
{
    game.stage.backgroundColor = '#182f3f';
    loadingText =
        game.add.text(
            screenWidth / 2, screenHeight / 2, 
            "Loading, please wait...", 
            { font: "45px " + fontName, fill: "#ffffff", align: "center" });
    
    loadingText.anchor.setTo(0.5, 0.5);
    loadingGraphics = game.add.graphics(0, 0);

    // Preload the music so that it's decoded by the time the game starts
    //var music = game.add.audio('theme');
}

function preload_update() 
{
    loadingGraphics.lineStyle(0, 0xFFFFFF);
    loadingGraphics.beginFill(0xFFFFFF);
    loadingGraphics.drawRect((screenWidth / 2) - 300, (screenHeight / 2) + 50, (game.load.progress / 100) * 600, 25);
    loadingGraphics.endFill();
    loadingGraphics.lineStyle(2, 0xFFFFFF);
    loadingGraphics.drawRect((screenWidth / 2) - 305, (screenHeight / 2) + 45, 610, 35);

    if (game.load.progress === 100 && game.cache.isSoundDecoded('theme'))
    {
        game.state.start("Game");
    }
}

function create() 
{
    var contents = game.cache.getText('physicsBodies');
    physicsBodies = JSON.parse(contents);

    // Set up background elements
    game.stage.backgroundColor = '#182f3f';
    game.world.setBounds(0, 0, worldWidth, worldHeight);
    bgSprite = game.add.sprite(0, 0, 'bg');
    bgSprite.body = null;
    bgScrollOffset = worldHeight - bgSprite.height;
    bgScrollFactor = bgSprite.height / worldHeight;
    
    var towerBase = game.add.sprite(0, 0, 'tower_base');
    towerBase.y = worldHeight - towerBase.height;

    // Set up physics
    initializePhysics();

    // Load the dragon
    dragon = game.add.sprite(0, 0, 'dragon');
    dragon.body = null;
    //dragon.scale.x = game.rnd.pick([1, -1]);
    //dragon.x = dragon.scale.x === -1 ? Math.abs(dragon.width): 0;
    dragon.x = game.rnd.frac() * (screenWidth - dragon.width);
    dragon.y = worldHeight - dragon.height;
    createDragonBody(dragon);

    // Load the maiden
    var maiden = game.add.sprite(0, 0, 'maiden');
    maiden.x = dragon.x + 345; //screenWidth / 3;
    maiden.y = (worldHeight - dragon.height) + 265;

    // Load the knight
    knight = game.add.sprite(screenWidth / 2, weaponDropStartY, 'knight');
    knight.anchor.setTo(0.1, 0.48);

    // Load the bridge
    var bridge = game.add.sprite(0, 230, 'bridge');
    var bridgeScale = screenWidth / bridge.width;
    bridge.scale.x = bridgeScale;
    bridge.scale.y = bridgeScale;

    // Load the initial weapon
    weapon = loadWeapon('sword', 325, 50);

    // Fetch the high score
    //lscache.set("highScore", 0);    // TODO: Don't leave this in!
    var highScore = lscache.get("highScore");
    if (highScore != undefined) { scoreData.highScore = highScore; }

    // A group with a null parent will lock to camera position
    var cameraTextGroup = game.add.group(null);

    scoreText = 
        game.add.text(
            15, 15, 
            "Score: 0", 
            { font: "25px " + fontName, fill: loseTextColor, align: "left" });

    scoreText.alpha = 0;
    cameraTextGroup.add(scoreText);

    highScoreText = 
        game.add.text(
            screenWidth - 15, 15,
            "High Score: " + scoreData.highScore,
            { font: "25px " + fontName, fill: winTextColor, align: "right" });

    highScoreText.alpha = 0;
    highScoreText.anchor.setTo(1, 0);
    cameraTextGroup.add(highScoreText);

    instructionText = 
        game.add.text(
            screenWidth / 2, 45, 
            "Use arrow keys to move, space bar to drop!", 
            { font: "45px " + fontName, fill: "#ffffff", align: "center" });

    instructionText.anchor.setTo(0.5, 0);

    instruction2Text = 
        game.add.text(
            screenWidth / 2, screenHeight - 100, 
            "Use arrow keys to influence weapon direction", 
            { font: "45px " + fontName, fill: "#ffffff", align: "center" });

    instruction2Text.alpha = 0;
    instruction2Text.anchor.setTo(0.5, 0);
    cameraTextGroup.add(instruction2Text);

    saveMaidenText = 
        game.add.text(
            screenWidth / 2, worldHeight - 200, 
            "To save the maiden,\nBehead the dragon!", 
            { 'font': "55px " + fontName, fill: "#ffffff", align: "center" });

    saveMaidenText.anchor.setTo(0.5, 0);

    // Do initial screen pan
    game.camera.y = worldHeight - screenHeight;
    game.add.tween(game.camera)
        .delay(1500)
        .to({ y: 0 }, 3000, Phaser.Easing.Cubic.InOut)
        .onCompleteCallback(function() { currentState = STATE_DROP; })
        .start();
    
    enemyGroup = game.add.group();
    for(var d = 0; d < enemyDefinitions.length; d++)
    {
        var enemyDefinition = enemyDefinitions[d];
        var enemyAmount = enemyDefinition.factor * enemyGenerationMultiplier;
        for(var e = 0; e < enemyAmount; e++)
        {
            createEnemy(enemyDefinition);
        }
    }
    
    // Start the game music
    //music.play('', 0, 0.65, true);

	//game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);
    cursorKeys = game.input.keyboard.createCursorKeys();
}

function initializePhysics()
{
    // Set up physics
    world = new b2World(new b2Vec2(0, 20), true);

    var fixDef = new b2FixtureDef;
    fixDef.density = 2.0;
    fixDef.friction = 0.9;
    fixDef.restitution = 0.4;
    
    // Ground is nothing but just a static rectangular body with its center at worldWidth/2 and worldHeight
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = worldWidth/2/worldScale;
    bodyDef.position.y = (worldHeight - groundOffset)/worldScale;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(worldWidth/worldScale, 30/worldScale);

    // And finally add our ground object to our world
    var groundBody = world.CreateBody(bodyDef);
    groundBody.CreateFixture(fixDef);
    groundBody.isGround = true;

    // Left Edge - Similar to ground, we define the left edge of our simulation... your application may or may not need this
    // The edge is positioned at the left most i.e. x = 0 and y = worldHeight/2 as the center. width is 1 and height = worldHeight
    bodyDef.position.x = 0;
    bodyDef.position.y = worldHeight/2/worldScale;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1/worldScale, worldHeight/worldScale);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    // Right Edge - same as left edge, positioned on the rightmost end of our canvas.
    bodyDef.position.x = worldWidth/worldScale;
    bodyDef.position.y = worldHeight/2/worldScale;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1/worldScale, worldHeight/worldScale);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    // Configure debug drawing
    //var debugDraw = new b2DebugDraw();
    //debugDraw.SetSprite(game.canvas.getContext("2d"));
    //debugDraw.SetDrawScale(worldScale);
    //debugDraw.SetFillAlpha(0.3);
    //debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //world.SetDebugDraw(debugDraw);
}

function loadWeapon(weaponName, initialX, initialY)
{
    var weaponDef = weaponDefinitions[weaponName];
    if(weaponDef != undefined)
    {
        var weaponSprite = game.add.sprite(initialX, initialY, weaponName);
        weaponSprite.anchor.setTo(0.5, 0.5);
        weaponSprite.x = screenWidth / 2;
        weaponSprite.y = weaponDropStartY;
        weaponDefinition = weaponDef;

        return weaponSprite;
    }
}

function createWeaponBody(weaponSprite, weaponDef)
{
    var offsetX = weaponSprite.width / 2,
        offsetY = weaponSprite.height / 2;

    // Create the weapon body
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = weaponSprite.x / worldScale;
    bodyDef.position.y = weaponSprite.y / worldScale;

    var weaponBody = world.CreateBody(bodyDef);
    weaponBody.SetBullet(true);
    weaponBody.SetUserData(weaponSprite);

    // Create the weapon fixtures
    var fixDef = new b2FixtureDef;
    for(var p = 0; p < weaponDef.parts.length; p++)
    {
        var part = weaponDef.parts[p];
        var fixtureName = part.name;
        var fixturePolys = physicsBodies[fixtureName];
        for(var i = 0; i < fixturePolys.length; i++)
        {
            var vectorArray = [];
            var polyPoints = fixturePolys[i].shape;
            for(var j = 0; j < polyPoints.length; j += 2)
            {
                vectorArray.push(
                    new b2Vec2(
                        (polyPoints[j] - offsetX) / worldScale,
                        (polyPoints[j + 1] - offsetY) / worldScale));
            }

            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsVector(vectorArray, vectorArray.length);
            fixDef.restitution = part.restitution;
            fixDef.density = part.density;

            var fixture = weaponBody.CreateFixture(fixDef);
            fixture.isBlade = part.isBlade;
        }
    }

    var massData1 = new b2MassData();
    massData1.mass = weaponDef.mass;
    massData1.I = weaponDef.inertia;
    weaponBody.SetMassData(massData1);

    return weaponBody;
}

function createEnemy(enemyDefinition)
{
    var spriteName = enemyDefinition.spriteName;
    var x = game.rnd.integerInRange(0, worldWidth), 
        y = 
            (game.rnd.realInRange( 
                enemyDefinition.worldRange[0],
                enemyDefinition.worldRange[1]) * (worldHeight - 1600)) + 400;

    var enemy = enemyGroup.create(x, y, spriteName);
    enemy.definition = enemyDefinition;

    enemy.anchor.setTo(0.5, 0.5);
    enemy.isDead = false;

    var fixDef = new b2FixtureDef;
    //fixDef.shape = new b2CircleShape((Math.min(enemy.width, enemy.height) / 2) / worldScale);
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox((enemy.width / 2) / worldScale, (enemy.height / 2) / worldScale);
    fixDef.density = 8.0;

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_kinematicBody;
    bodyDef.position.x = enemy.x / worldScale;
    bodyDef.position.y = enemy.y / worldScale;

    var enemyBody = world.CreateBody(bodyDef);
    enemyBody.CreateFixture(fixDef);

    var minSpeed = enemyDefinition.minSpeed;
    var maxSpeed = enemyDefinition.maxSpeed;
    var moveSpeed = game.rnd.realInRange(minSpeed, maxSpeed) * game.rnd.pick([1, -1]);
    enemy.scale.x = moveSpeed < 0 ? -1 : 1;
    enemyBody.SetLinearVelocity(new b2Vec2(moveSpeed, 0));

    enemy.body = null;
    enemy.boxBody = enemyBody;
    enemyBody.SetUserData(enemy);

    game.add.tween(enemy)
        .to({y: enemy.y - 20 }, 1200, Phaser.Easing.Quadratic.InOut)
        .to({y: enemy.y + 20 }, 1200, Phaser.Easing.Quadratic.InOut)
        .loop()
        .start();
}

function createDragonBody(dragon)
{
    var absWidth = Math.abs(dragon.width)

    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = dragon.x / worldScale;
    bodyDef.position.y = dragon.y / worldScale;

    var dragonBody = world.CreateBody(bodyDef);
    dragonBody.isDragon = true;
    var spriteFlipped = dragon.scale.x === -1;

    // Set up the head fixture
    var headPolys = physicsBodies["dragon_head"];
    for(var i = 0; i < headPolys.length; i++)
    {
        var vectorArray = [];
        var polyPoints = headPolys[i].shape;
        for(var j = 0; j < polyPoints.length; j += 2)
        {
            var pointX =
                spriteFlipped === true ?
                    absWidth + polyPoints[j] :
                    //polyPoints[j] :
                    polyPoints[j];
                
            vectorArray.push(
                new b2Vec2(
                    pointX / worldScale,
                    polyPoints[j + 1] / worldScale));
        }

        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsVector(vectorArray, vectorArray.length);

        var fixture = dragonBody.CreateFixture(fixDef);
        fixture.SetUserData({ isDragonHead: true });
    }

    // Set up the hand fixture
    var handPolys = physicsBodies["dragon_hand"];
    for(var i = 0; i < handPolys.length; i++)
    {
        var vectorArray = [];
        var polyPoints = handPolys[i].shape;
        for(var j = 0; j < polyPoints.length; j += 2)
        {
            var pointX =
                spriteFlipped === true ?
                    absWidth + polyPoints[j] :
                    //polyPoints[j] :
                    polyPoints[j];

            vectorArray.push(
                new b2Vec2(
                    pointX / worldScale,
                    polyPoints[j + 1] / worldScale));
        }

        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsVector(vectorArray, vectorArray.length);

        var fixture = dragonBody.CreateFixture(fixDef);
        fixture.SetUserData({ isDragonHand: true });
    }
}


// ---------- UPDATE FUNCTIONS ----------

function startDrop()
{
    // Create a physics body for the weapon
    weaponBody = createWeaponBody(weapon, weaponDefinition);
    weaponBody.SetActive(true);
    weaponBody.SetAngularVelocity(Phaser.Math.degToRad((50 * game.rnd.frac()) - 25));
    weaponBody.isWeapon = true;

    // Clear Phaser's physics body and use our own
    weapon.body = null;
    weapon.boxBody = weaponBody;

    // Follow the weapon as it falls
    game.camera.follow(weapon, Phaser.Camera.FOLLOW_TOPDOWN);

    // Change text visibility
    saveMaidenText.visible = false;
    game.add.tween(instructionText)
        .to({ alpha: 0 }, 500)
        .start();

    // Show new instruction text
    game.add.tween(instruction2Text)
        .delay(750)
        .to({ alpha: 1 }, 750)
        .to({ alpha: 1 }, 2000) // Fake tween for delay
        .to({ alpha: 0 }, 750)
        .start();

    // Show score text
    game.add.tween(scoreText)
        .delay(750)
        .to({ alpha: 1 }, 750)
        .start();
    game.add.tween(highScoreText)
        .delay(750)
        .to({ alpha: 1 }, 750)
        .start();

    // It's droppin' time
    currentState = STATE_DROPPING;
}

function killSprite(sprite)
{
    function removeSprite(sprite)
    {
        sprite.boxBody.SetActive(false);
        sprite.kill();
    }

    // TODO: Add sound
    sprite.isDead = true;
    game.add.tween(sprite)
        .to({alpha: 0, angle: -15 }, 75, Phaser.Easing.Linear.None)
        .onCompleteCallback(function() { removeSprite(sprite); })
        .start();

    var particleLifeTime = 500;
    var emitter = game.add.emitter(sprite.x, sprite.y, 6);
    emitter.width = sprite.width;
    emitter.height = sprite.height;
    emitter.gravity = 8;
    emitter.minParticleSpeed = new Phaser.Point(-200, -200);
    emitter.maxParticleSpeed = new Phaser.Point(200, 200);
    emitter.makeParticles(sprite.definition.giblets);
    emitter.start(true, particleLifeTime, 0, 6);

    // Fade out the particles
    var alphaObj = { alpha: 1 }
    var fadeTween = 
        game.add.tween(alphaObj)
                .delay(particleLifeTime / 2)
                .to({ alpha: 0 }, particleLifeTime / 2)
                .onUpdateCallback(
                    function() { 
                        emitter.forEachAlive(function(p) {
                            p.alpha = alphaObj.alpha;
                        })
                    })
                .start()
}

function updateSpritePosition(spriteBody)
{
    if(spriteBody != undefined)
    {
        var pos = spriteBody.GetPosition();
        var sprite = spriteBody.GetUserData();
        sprite.x = pos.x * worldScale;
        sprite.y = pos.y * worldScale
        sprite.angle = Phaser.Math.radToDeg(spriteBody.GetAngle());
    }
}

function addScore(scoreAmount)
{
    var updateScoreText = function() 
    {
        scoreText.content = "Score: " + Math.round(scoreData.currentScore);
    };

    var tweenComplete = function() 
    {
        scoreData.currentTween = undefined;
        if (scoreData.waitingScore > 0)
        {
            var waitingScore = scoreData.waitingScore; 
            scoreData.waitingScore = 0;
            addScore(waitingScore);
        }
        else if(scoreData.tweenCompleteCallback)
        {
            scoreData.tweenCompleteCallback();
        }
    };

    if (scoreData.currentTween != undefined)
    {
        scoreData.waitingScore += scoreAmount;
    }
    else
    {
        // Create a new tween for updating score
        scoreData.currentTween =
            game.add.tween(scoreData)
                .to({ currentScore: scoreData.currentScore + scoreAmount }, 500)
                .onUpdateCallback(updateScoreText)
                .onCompleteCallback(tweenComplete)
                .start();
    }
}

function update() 
{
    // Update background position relative to camera
    var screenRate = (worldHeight - screenHeight) / screenHeight;
    var screenPercent = game.camera.y / (worldHeight - screenHeight);
    bgSprite.y = bgScrollOffset * screenPercent;

    // Update positions of all enemy bodies
    enemyGroup.forEachAlive(function(sprite) {
        var spriteBody = sprite.boxBody;
        var pos = spriteBody.GetPosition();
        sprite.x = pos.x * worldScale;

        // Wrap the sprite back into the screen if they left
        if ((sprite.x < 0 && sprite.scale.x < 0) || 
            (sprite.x > screenWidth && sprite.scale.x > 0))
        {
            sprite.scale.x *= -1;
            var vel = spriteBody.GetLinearVelocity();
            spriteBody.SetLinearVelocity(new b2Vec2(vel.x * -1, 0));
        }
    });

    if (currentState === STATE_DROP)
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            startDrop();
        }
        else if (cursorKeys.left.isDown)
        {
            weapon.x = Math.max(weapon.x - 6, weaponDropMinX);
            knight.x = weapon.x;
        }
        else if (cursorKeys.right.isDown)
        {
            weapon.x = Math.min(weapon.x + 6, weaponDropMaxX);
            knight.x = weapon.x;
        }
    }
    else if (currentState != STATE_NONE)
    {
        var slayResult = undefined;
        var bladeTouchedGround = false;

        // Influence movement direction and rotation of weapon
        var forceAmount = 50;
        if (currentState === STATE_DROPPING)
        {
            if (cursorKeys.left.isDown)
            {
                weaponBody.ApplyForce(new b2Vec2(-1 * forceAmount, 0), weaponBody.GetWorldCenter());
                weaponBody.ApplyTorque(Phaser.Math.degToRad(-20000));
            }
            else if (cursorKeys.right.isDown)
            {
                weaponBody.ApplyForce(new b2Vec2(forceAmount, 0), weaponBody.GetWorldCenter());
                weaponBody.ApplyTorque(Phaser.Math.degToRad(20000));
            }
        }

        for(var contactEdge = weaponBody.GetContactList();
            contactEdge; 
            contactEdge = contactEdge.next)
        {
            var bodyA = contactEdge.contact.GetFixtureA().GetBody();
            var bodyB = contactEdge.contact.GetFixtureB().GetBody();
            var weaponFixture, otherBody, otherFixture;        

            if(bodyA.isWeapon === true)
            {
                otherBody = bodyB;
                otherFixture = contactEdge.contact.GetFixtureB();
                weaponFixture = contactEdge.contact.GetFixtureA();
            }
            else if(bodyB.isWeapon === true)
            {
                otherBody = bodyA;
                otherFixture = contactEdge.contact.GetFixtureA();
                weaponFixture = contactEdge.contact.GetFixtureB();
            }
            else
            {
                console.log("Collision between 2 non-weapon bodies!");
            }

            var enemy = otherBody.GetUserData();
            var fixtureData = otherFixture.GetUserData();
            if(enemy != undefined)
            {
                if(enemy.isDead === false)
                {
                    killSprite(enemy);
                    addScore(enemy.definition.scoreAmount);
                }
            }
            else if (fixtureData != undefined && currentState != STATE_DONE)
            {
                if (weaponFixture.isBlade != true)
                {
                    // If blade and hilt both touched, allow bounce
                    slayResult = undefined;
                }
                else if (fixtureData.isDragonHead === true)
                {
                    //slayResult = { otherBody: otherBody, resultCode: RESULT_SLAYDRAGON };
                    otherBody.SetActive(false);
                    completeGame(RESULT_SLAYDRAGON);
                    break;
                }
                else if (fixtureData.isDragonHand === true)
                {
                    //slayResult = { otherBody: otherBody, resultCode: RESULT_SLAYMAIDEN };
                    otherBody.SetActive(false);
                    completeGame(RESULT_SLAYMAIDEN);
                    break;
                }
            }
            else if (otherBody.isGround === true)
            {
                // Weapon hit ground, stick it there if blade made contact
                if(weaponFixture.isBlade === true)
                {
                    // Note that the blade touched the ground so that we can
                    // Assume game
                    bladeTouchedGround = true;
                }
                else
                {
                    // If the hilt touched the ground, override the
                    // blade touch so that the sword lands convincingly
                    bladeTouchedGround = false;
                }
            }
        }

        // Did the blade touch the ground?
        if (bladeTouchedGround && weaponBody.IsActive() === true)
        {
            // Disable the physics body
            weaponBody.SetActive(false);

            if (currentState != STATE_DONE)
            {
                completeGame(RESULT_MISSED);
            }
        }
    }

    // Update the weapon position
    updateSpritePosition(weaponBody);

    // Update Box2D physics bodies
    world.Step(
        1 / 60,     //frame rate
   		10,         //velocity iterations
      	10);        //position iterations

   world.ClearForces();
}

function updateHighScore()
{
    // Update high score?
    if (scoreData.currentScore > scoreData.highScore)
    {
        highScoreText.content = "High Score: " + scoreData.currentScore;
        lscache.set("highScore", scoreData.currentScore);

        // Bring attention to the high score
        game.add.tween(highScoreText.scale)
                .to({ x: 1.2, y: 1.2 }, 150, Phaser.Easing.Cubic.Out)
                .to({ x: 1, y: 1 }, 150, Phaser.Easing.Cubic.Out)
                .yoyo(true)
                .repeat(4)
                .start();
    }
}

function completeGame(gameResult)
{
    var resultText, resultColor
    var startRot = Phaser.Math.degToRad(-3),
        endRot = Phaser.Math.degToRad(3);

    // Game is done now
    currentState = STATE_DONE;

    // TODO: Result music?
    if (gameResult === RESULT_MISSED)
    {
        resultText = missedDragonText;
        resultColor = loseTextColor;
    }
    else if (gameResult === RESULT_SLAYMAIDEN)
    {
        resultText = slayedMaidenText;
        resultColor = loseTextColor;
    }
    else if (gameResult === RESULT_SLAYDRAGON)
    {
        resultText = slayedDragonText;
        resultColor = winTextColor;
        addScore(100000);
    }

    gameResultText = 
        game.add.text(
            screenWidth / 2, worldHeight - (screenHeight / 2), 
            resultText,
            { 'font': "65px " + fontName, fill: resultColor, align: "center" });

    gameResultText.anchor.setTo(0.5, 0.5);

    gameResultText.alpha = 0;
    gameResultText.alpha = 0;
    gameResultText.visible = true;
    gameResultText.rotation = 0;
    game.add.tween(gameResultText)
        .to({ alpha: 1 }, 500)
        .to({ rotation: endRot }, 2500)
        .to({ rotation: startRot }, 2500)
        .loop()
        .start();

    // Try to update the high score
    if (scoreData.currentTween === undefined) { updateHighScore(); }
    else { scoreData.tweenCompleteCallback = updateHighScore; }
}

function render() 
{
//    game.debug.renderSpriteInfo(weapon, 32, 32);
//    game.debug.renderSpriteCollision(weapon, 32, 400);
//    game.debug.renderSpriteBounds(weapon);
//    game.debug.renderSpriteCorners(weapon);
//    game.debug.renderRectangle(groundRect,'#00ff00');
    //game.debug.renderSpriteBounds(weapon);
    //game.debug.renderRectangle(weapon.bounds, '#ff0000');

    //world.DrawDebugData();
}


