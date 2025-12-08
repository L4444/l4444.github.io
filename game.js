var config = {
    type: Phaser.WEBGL,
    width: 900,
    height: 900,
    physics: {
            default: 'arcade',
            arcade: {
                x: 0,
                y: 0,
                width: 900,
                height: 900,
                debug: true // Show the wireframes and velocity 
            }
        },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var player;
var enemy = [];
var background;

var keys;


var menuMusic;
var battleMusic;
var sneakMusic;
var bossMusic;

var shootSound;



var infoText;
var helpText;
var pauseText;
var pauseShade;
var gameLogo;
var scoreText;


var boom;

const state = {
 Menu: 'Menu',
 Gameplay: 'Gameplay'
}

var gameState;

function preload ()
{
    this.load.image('player','ships/player-2.png');
    this.load.image('enemy1','ships/empire-d.png');
    this.load.image('enemy2','ships/empire-d.png');
    this.load.image('enemy3','ships/empire-d.png');
    this.load.image('enemy4','ships/empire-d.png');

    this.load.image('back','Backgrounds/Blue Nebula/Blue Nebula 1 - 1024x1024.png');
    this.load.image('menuBack','Backgrounds/Green Nebula/Green Nebula 7 - 1024x1024.png');
    this.load.image('logo','Ratspace Logo.png');


    this.load.image('pew','pew.png');

    var u;
    for(var i = 0; i <15; i++)
    {
        u = (i + 1).toString().padStart(4,'0');
        
    this.load.image('boom' + i, 'effects/explosion4/k2_' + u + '.png');
    }

    // load music
    this.load.audio('menu','music/Menu.wav');
    this.load.audio('battle','music/n-Dimensions (Main Theme).mp3');
    this.load.audio('sneak', 'music/through space.ogg');
    this.load.audio('boss','music/Power Trip 3.mp3');

    // load shooting sounds
    this.load.audio('shoot1','sounds/alienshoot1.wav');
    this.load.audio('shoot2','sounds/alienshoot2.wav');

    // load all the explosion sounds
    for(let i = 0; i < 9;i++ )
    {
    this.load.audio('boom' + (i+1),'explosions/explosion0' + (i+1) + '.wav');
    }

    // load hit sounds
    this.load.audio('hitPlayerSound','sounds/hitPlayerSound.wav');
    this.load.audio('hitEnemySound','sounds/Laser_01.wav');

    

}

function resumeGame()
{
    gameState = state.Gameplay; this.game.scene.scenes[0].physics.resume();this.game.sound.pauseAll(); battleMusic.resume();
     menuBack.visible = false; pauseText.visible = false; pauseShade.visible = false; gameLogo.visible = false; helpText.visible = true;
}

function pauseGame()
{
    gameState = state.Menu;this.game.scene.scenes[0].physics.pause(); this.game.sound.pauseAll();  pauseText.visible = true; pauseShade.visible = true;
}

function create ()
{

    


    background = this.add.tileSprite(500,500,1024,1024,'back');
    background.setScrollFactor(0.1);
    background.setScale(2);


   
    


 
    // Create music objects
    menuMusic = this.sound.add('menu', {loop: true});

    battleMusic = this.sound.add('battle', {loop: true});
    battleMusic.volume = 0.1;

    sneakMusic = this.sound.add('sneak', {loop: true});
    sneakMusic.volume = 0.2;

    bossMusic = this.sound.add('boss', {loop: true});
    bossMusic.volume = 0.1;

    var f = [];
    for( var i = 0; i < 15; i++)
    {
        f[i] = {key: 'boom' + i};
    }
    this.anims.create({key: 'explode', frames:f, frameRate: 30, repeat: 0});

   

   
    player = new Ship(this,'player',460,840, false);
    
    Ship.playerShip = player;

    // Prepare the explosion sounds.
    Ship.explosionSound = [];
    for(let i = 0; i < 9;i++)
    {
        Ship.explosionSound[i] = this.sound.add('boom' + (i+1));
        Ship.explosionSound[i].volume = 0.5;

    }

  

    for(let i = 0;i <4;i++)
    {

        enemy[i] = new Ship(this,'enemy' + (i+1),300, i*130+80,true);

        

       // Collide with the player
       this.physics.add.collider(player.sprite, enemy[i].sprite, function(pShip, eShip, body1, body2) { pShip.hp -= 10; eShip.hp -= 10;  
        if(pShip.hp > 0) {pShip.hitSound.play();}
    });
        
    }

    // Collide with other enemies
    for(let i = 0;i < enemy.length;i++)
    {
        for(let j = i;j < enemy.length;j++)
        {
            this.physics.add.collider(enemy[i].sprite, enemy[j].sprite, function(aShip, bShip, body1, body2) {
                 //aShip.hp -= 5; bShip.hp -= 5; 
                 console.log('one bounce');
               
                });
        }
    }

    // Add collision detection for Enemy bullets vs player
    for(let i = 0;i < enemy.length;i++)
    {

        for(let j = 0;j < enemy[i].bullet.length;j++)
        {
        this.physics.add.overlap(player.sprite, enemy[i].bullet[j], function(hitShip, hitBullet, body1, body2) { 
        console.log('Player hit'); 
        hitShip.tintTick = 0;
        hitShip.hp -= 20;
        //if(hitShip.hp > 0) {hitShip.hitSound.play();} /// This is a horrible sound
        hitBullet.x = -400; hitBullet.y = -400; 
        hitShip.setVelocity(hitBullet.body.velocity.x*10,hitBullet.body.velocity.y*10); 
        hitBullet.setVelocity(0,0);}); 
        }

    }

    // Finally, add collision detection for Player bullets vs enemies
    for(let i = 0;i < enemy.length;i++)
    {

        for(let j = 0;j < player.bullet.length;j++)
        {
            this.physics.add.overlap(enemy[i].sprite, player.bullet[j], function(hitShip, hitBullet, body1, body2) { 
                console.log('Enemy hit'); 
                hitShip.tintTick = 0;
                hitShip.hp -= 50;
                if(hitShip.hp > 0) {hitShip.hitSound.play();}
                hitBullet.x = -400; hitBullet.y = -400; 
                hitShip.setVelocity(hitBullet.body.velocity.x*400,hitBullet.body.velocity.y*400); 
                hitBullet.setVelocity(0,0);}); 
        }
    }


    // The pause menu
    menuBack = this.add.tileSprite(500,500,1024,1024,'menuBack'); 
    pauseShade = this.add.rectangle(0, 0, 2000, 2000, 0x336633, .25); 
    pauseShade.visible = false;

    gameLogo = this.add.sprite(500,350,'logo'); 
    gameLogo.setScale(0.5);

    keys = this.input.keyboard.addKeys('W,S,A,D,F,E,Q,F,G,H,UP,DOWN,SPACE,F1');
    infoText = this.add.text(10,30,"");  infoText.setScrollFactor(0);
    helpText = this.add.text(10,10,"Press F1 to toggle help"); helpText.setScrollFactor(0);
    helpText.visible = false; // Don't show the help text in the menu.
    pauseText = this.add.text(400,400, "Paused - Press escape to unpause");  pauseText.setScrollFactor(0);

    scoreText = this.add.text(750,10,""); scoreText.setScrollFactor(0);
    


   

    // Toggle the help for controls and debug. Also control music
    this.input.keyboard.on('keyup-F1',function(event) {infoText.visible = !infoText.visible;})
    this.input.keyboard.on('keyup-ONE',function(event) { if(!menuMusic.isPlaying) { this.game.sound.stopAll(); menuMusic.play();}})
    this.input.keyboard.on('keyup-TWO',function(event) { if(!battleMusic.isPlaying) { this.game.sound.stopAll(); battleMusic.play();}})
    this.input.keyboard.on('keyup-THREE',function(event) { if(!sneakMusic.isPlaying) { this.game.sound.stopAll(); sneakMusic.play();}})
    this.input.keyboard.on('keyup-FOUR',function(event) { if(!bossMusic.isPlaying) { this.game.sound.stopAll(); bossMusic.play();}})
    this.input.keyboard.on('keyup-ESC',function(event) { 
        
        if(gameState == state.Gameplay)
        {
         pauseGame(); return;
        }


        if(gameState == state.Menu)
        {

         resumeGame(); return;
        }
    
    });
    this.input.keyboard.on('keyup-SPACE', function(event) { 

       
        
        });
   
    
    // Start game
    gameState = state.Menu;


    Ship.playerShip.score = 0;

    console.log('VSCode git integration successful');

    // follow the player around and zoom out
    this.cameras.main.startFollow(Ship.playerShip.sprite);
    
 

    

    

   
}



function update ()
{
   // Cheesy scrolling background
   menuBack.tilePositionY -= 1;

   
    

   
   scoreText.text = "Score: " + Ship.playerShip.score;
 

    if(gameState == state.Gameplay)
    {
   
        // Basic controls, BIG thrust is the engine that player directly controls, LITTLE thrust is for indirectly controlled to prevent drift.
        if(keys.D.isDown) {player.right();}
        if(keys.A.isDown) {player.left();}

        if(keys.W.isDown) {player.forward();}
        if(keys.S.isDown) {player.back();}
        
        if(game.input.mousePointer.buttons == 1) { player.shoot();}

        // Zoom controls
        if(keys.F.isDown)
        {
               this.cameras.main.setZoom(0.5);
        }
         if(keys.G.isDown)
        {
               this.cameras.main.setZoom(1);
        }
          if(keys.H.isDown)
        {
               this.cameras.main.setZoom(2);
        }
        

            // Game design controls.
            if(keys.UP.isDown) {Ship.BIG_THRUST += 100;}
            if(keys.DOWN.isDown) {Ship.BIG_THRUST -= 100;}
            if(keys.E.isDown) { Ship.LITTLE_THRUST += 0.1;;}
            if(keys.Q.isDown) { Ship.LITTLE_THRUST -= 0.1;}
                
        

        // Angle the ship to "look at" the cursor, Cursor aiming
        let targetAngle = Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(450,450, game.input.mousePointer.x,game.input.mousePointer.y)
        ) + 90; // The +90 is to ensure it points forward rather than to the right.
        

        

        // TEST: Just set it
        player.sprite.angle = targetAngle;

        // Present debug info
        infoText.setText("Big thrust is " + Ship.BIG_THRUST + "\nand Little thrust is " + Ship.LITTLE_THRUST 
        + "\nVelX = " + player.sprite.body.velocity.x + "\nVelY = " + player.sprite.body.velocity.y + 
        "\ntX: " + player.tX + "\ntY: " + player.tY +
        "\nCursorX: " + game.input.mousePointer.x + "\nCursorY: " + game.input.mousePointer.y + 
        "\ntargetAngle: " + targetAngle + "\nPlayer Angle: " + player.sprite.angle + 
        "\nMousebuttons: " + game.input.mousePointer.buttons + "\n------------Controls---------- \nW,S,A,D for movement" 
        + "\nleft click for shoot \n1 for menu music \n2 for battle music \n3 for stealth music \n4 for boss music \nUP, DOWN, E and Q to play with physics");
        

        
        player.update();

        

        for(let i = 0;i < enemy.length;i++)
        {
        
            enemy[i].update();
            
        }


        // Cheesy scrolling background
        //background.tilePositionY -= 2;
    }

}