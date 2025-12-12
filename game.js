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
var background = [];
var asteroid;

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


var cameraX = 0;
var cameraY = 0;


const state = {
    Menu: 'Menu',
    Gameplay: 'Gameplay'
}

var gameState;

var infoMode = 1;


var flame;
var particleContainer;
var thruster;

function preload() {
    this.load.image('player', 'ships/player-2.png');
    this.load.image('enemy1', 'ships/empire-d.png');
    this.load.image('enemy2', 'ships/empire-d.png');
    this.load.image('enemy3', 'ships/empire-d.png');
    this.load.image('enemy4', 'ships/empire-d.png');

    this.load.image('back', 'backgrounds/Blue Nebula/Blue Nebula 1 - 1024x1024.png');
    this.load.image('menuBack', 'backgrounds/Green Nebula/Green Nebula 7 - 1024x1024.png');
    this.load.image('logo', 'Ratspace Logo.png');
    this.load.image('asteroid', 'asteroids/Asteroid.png');


    this.load.image('flare','particles/flare.png');

    this.load.image('pew', 'pew.png');

    var u;
    for (var i = 0; i < 15; i++) {
        u = (i + 1).toString().padStart(4, '0');

        this.load.image('boom' + i, 'effects/explosion4/k2_' + u + '.png');
    }

    // load music
    this.load.audio('menu', 'music/Menu.wav');
    this.load.audio('battle', 'music/n-Dimensions (Main Theme).mp3');
    this.load.audio('sneak', 'music/through space.ogg');
    this.load.audio('boss', 'music/Power Trip 3.mp3');

    // load shooting sounds
    this.load.audio('shoot1', 'sounds/alienshoot1.wav');
    this.load.audio('shoot2', 'sounds/alienshoot2.wav');

    // load all the explosion sounds
    for (let i = 0; i < 9; i++) {
        this.load.audio('boom' + (i + 1), 'explosions/explosion0' + (i + 1) + '.wav');
    }

    // load hit sounds
    this.load.audio('hitPlayerSound', 'sounds/hitPlayerSound.wav');
    this.load.audio('hitEnemySound', 'sounds/Laser_01.wav');


    

    console.log("Preloading done");

}

function resumeGame() {
    gameState = state.Gameplay; this.game.scene.scenes[0].physics.resume(); this.game.sound.pauseAll(); battleMusic.resume();
    menuBack.visible = false; pauseText.visible = false; pauseShade.visible = false; gameLogo.visible = false; helpText.visible = true;
}

function pauseGame() {
    gameState = state.Menu; this.game.scene.scenes[0].physics.pause(); this.game.sound.pauseAll(); pauseText.visible = true; pauseShade.visible = true;
}

function create() {



    // Create the parallax backgrounds, tile them together in 3x3 grid to make them look seamless.
    for( var i = 0; i < 9; i++) {
        var x =  i % 3;
        var y = Math.floor(i / 3);

        background[i] = this.add.tileSprite(x * 1024, y * 1024, 1024, 1024, 'back');

        // Don't forget to add scroll factor back to make it paralax
        background[i].setScrollFactor(0.5);

    }
    

    // Create an asteroid to help player orient themselves
    asteroid = this.physics.add.sprite(1000, 1500, 'asteroid');
    let  r= 150;
    asteroid.setCircle(r,110,100);
    
    

    // Create music objects
    menuMusic = this.sound.add('menu', { loop: true });

    battleMusic = this.sound.add('battle', { loop: true });
    battleMusic.volume = 0.1;

    sneakMusic = this.sound.add('sneak', { loop: true });
    sneakMusic.volume = 0.3;

    bossMusic = this.sound.add('boss', { loop: true });
    bossMusic.volume = 0.1;

    var f = [];
    for (var i = 0; i < 15; i++) {
        f[i] = { key: 'boom' + i };
    }
    this.anims.create({ key: 'explode', frames: f, frameRate: 30, repeat: 0 });


    

    player = new Ship(this, 'player', 1000, 1200, false);

    Ship.playerShip = player;


    




    // Prepare the explosion sounds.
    Ship.explosionSound = [];
    for (let i = 0; i < 9; i++) {
        Ship.explosionSound[i] = this.sound.add('boom' + (i + 1));
        Ship.explosionSound[i].volume = 0.5;

    }

    // collide with asteroid
    this.physics.add.collider(player.sprite, asteroid, function (pShip, eShip, body1, body2) {
            console.log("Player hit asteroid ");
        });



    for (let i = 0; i < 4; i++) {

        enemy[i] = new Ship(this, 'enemy' + (i + 1), 1000 + (i * 200), 1000, true);



        // Collide with the player
        this.physics.add.collider(player.sprite, enemy[i].sprite, function (pShip, eShip, body1, body2) {
            pShip.hp -= 10; eShip.hp -= 10;
            if (pShip.hp > 0) { pShip.hitSound.play(); }
        });

    }

    // Collide with other enemies
    for (let i = 0; i < enemy.length; i++) {
        for (let j = i; j < enemy.length; j++) {
            this.physics.add.collider(enemy[i].sprite, enemy[j].sprite, function (aShip, bShip, body1, body2) {
                //aShip.hp -= 5; bShip.hp -= 5; 
                console.log('one bounce');

            });
        }
    }

    // Add collision detection for Enemy bullets vs player
    for (let i = 0; i < enemy.length; i++) {

        for (let j = 0; j < enemy[i].bullet.length; j++) {
            this.physics.add.overlap(player.sprite, enemy[i].bullet[j], function (hitShip, hitBullet, body1, body2) {
                console.log('Player hit');
                hitShip.tintTick = 0;
                hitShip.hp -= 20;
                //if(hitShip.hp > 0) {hitShip.hitSound.play();} /// This is a horrible sound
                hitBullet.x = -9999; hitBullet.y = -9999;
                hitShip.setVelocity(hitBullet.body.velocity.x, hitBullet.body.velocity.y);
                hitBullet.setVelocity(0, 0);
            });
        }

    }

    // Finally, add collision detection for Player bullets vs enemies
    for (let i = 0; i < enemy.length; i++) {

        for (let j = 0; j < player.bullet.length; j++) {
            this.physics.add.overlap(enemy[i].sprite, player.bullet[j], function (hitShip, hitBullet, body1, body2) {
                console.log('Enemy hit');
                hitShip.tintTick = 0;
                hitShip.hp -= 50;
                if (hitShip.hp > 0) { hitShip.hitSound.play(); }
                hitBullet.x = -9999; hitBullet.y = -9999;
                hitShip.setVelocity(hitBullet.body.velocity.x / 10, hitBullet.body.velocity.y / 10);
                hitBullet.setVelocity(0, 0);
            });
        }
    }


    // The pause menu
    menuBack = this.add.tileSprite(500, 500, 1024, 1024, 'menuBack');
    pauseShade = this.add.rectangle(0, 0, 2000, 2000, 0x336633, .25);
    pauseShade.visible = false;

    gameLogo = this.add.sprite(450, 350, 'logo');


    keys = this.input.keyboard.addKeys('W,S,A,D,F,E,Q,F,G,H,UP,DOWN,SPACE,F1');
    infoText = this.add.text(10, 30, ""); infoText.setScrollFactor(0);
    helpText = this.add.text(10, 10, "Press F1 to cycle through help menus"); helpText.setScrollFactor(0);
    helpText.visible = false; // Don't show the help text in the menu.


    pauseText = this.add.text(400, 400, "Paused - Press escape to unpause"); pauseText.setScrollFactor(0);

    scoreText = this.add.text(750, 10, ""); scoreText.setScrollFactor(0);


    



    // Toggle the help for controls and debug. Also control music
    this.input.keyboard.on('keyup-F1', function (event) { 

      if(infoMode < 3)
      {
        infoMode++;
      }
      else
      {
        infoMode = 1;
      }
    })
    
    this.input.keyboard.on('keyup-ONE', function (event) { if (!menuMusic.isPlaying) { this.game.sound.stopAll(); menuMusic.play(); } })
    this.input.keyboard.on('keyup-TWO', function (event) { if (!battleMusic.isPlaying) { this.game.sound.stopAll(); battleMusic.play(); } })
    this.input.keyboard.on('keyup-THREE', function (event) { if (!sneakMusic.isPlaying) { this.game.sound.stopAll(); sneakMusic.play(); } })
    this.input.keyboard.on('keyup-FOUR', function (event) { if (!bossMusic.isPlaying) { this.game.sound.stopAll(); bossMusic.play(); } })
    this.input.keyboard.on('keyup-ESC', function (event) {

        if (gameState == state.Gameplay) {
            pauseGame(); return;
        }


        if (gameState == state.Menu) {

            resumeGame(); return;
        }

    });
    this.input.keyboard.on('keyup-LEFT', function (event) {

        Ship.BIG_THRUST -= 20;

    });

     this.input.keyboard.on('keyup-RIGHT', function (event) {

        Ship.BIG_THRUST += 20; 

    });
     this.input.keyboard.on('keyup-UP', function (event) {
        Ship.MAX_SPEED += 20;



    });
     this.input.keyboard.on('keyup-DOWN', function (event) {
        Ship.MAX_SPEED -= 20;


    });
     this.input.keyboard.on('keyup-F', function (event) {
        


    });
        this.input.keyboard.on('keyup-G', function (event) {
        


    });

      // Game design controls.
        if (keys.E.isDown) { Ship.LITTLE_THRUST += 0.1;; }
        if (keys.Q.isDown) { Ship.LITTLE_THRUST -= 0.1; }



    // Start game
    gameState = state.Menu;

    // Start in game
    resumeGame();
    


    Ship.playerShip.score = 0;

    console.log('Objects created');

}



function update() {
    // Cheesy scrolling background
    menuBack.tilePositionY -= 1;





    scoreText.text = "Score: " + Ship.playerShip.score;


    if (gameState == state.Gameplay) {

        // Basic controls, BIG thrust is the engine that player directly controls
        if (keys.D.isDown) { player.right(); }
        if (keys.A.isDown) { player.left(); }

        if (keys.W.isDown) { player.forward(); }
        if (keys.S.isDown) { player.back(); }

        if (game.input.mousePointer.buttons == 1) { player.shoot(); }

    let cursorX = game.input.mousePointer.x;
        let cursorY = game.input.mousePointer.y;
      

       /* 

        // 1. Convert vector to target angle
        let targetAngle = Phaser.Math.Angle.Between(450 , 450 , cursorX, cursorY);


*/

        /// 1. chat gpt
        let pointer = this.input.activePointer;
        let worldCursor = pointer.positionToCamera(this.cameras.main);
       
        let targetAngle = Phaser.Math.Angle.Between(player.sprite.x , player.sprite.y , worldCursor.x, worldCursor.y);

        // Turn to face the targetAngle
        let turnSpeed = 0.02;
        player.sprite.rotation = Phaser.Math.Angle.RotateTo(player.sprite.rotation, targetAngle, turnSpeed);





        // Present debug info
        switch(infoMode)
        {
            case 1: 

                infoText.setText("-----------Controls-----------\n" 
                    + "W,S,A,D for movement\n"
                + " Left click for shoot\n" 
                + "1 for menu music \n2 for battle music \n3 for stealth music \n4 for boss music");
                  
                break;
            case 2:
                infoText.setText("-------------DEBUG-------------\n" 
                    + "(LEFT / RIGHT) Big thrust is " + Ship.BIG_THRUST + "\n"
                    + "(UP / DOWN) Max Speed is " + Ship.MAX_SPEED + "\n"
                + "VelX = " + player.sprite.body.velocity.x + "\nVelY = " + player.sprite.body.velocity.y +
                "\ntX: " + player.tX + "\ntY: " + player.tY +
                "\nCursorX: " + cursorX + "\nCursorY: " + cursorY +
                "\ntargetAngle: " + targetAngle + "\nPlayer Angle: " + player.sprite.rotation +
                "\nMousebuttons: " + game.input.mousePointer.buttons + "\n" + 
                "Player X: " + player.sprite.x + "\n" +
                "Player Y: " + player.sprite.y + "\n");
                break;

            case 3:
                infoText.setText("-----------PARTICLES-----------");
                break;


        }

        
       




            //update the asteroids
        asteroid.angle += 0.2;

        player.update();



        for (let i = 0; i < enemy.length; i++) {

            enemy[i].update();

        }

        // The camera target is where the camera should be, taking into account the cursor
        let cameraTarget = {};
        cameraTarget.x = player.sprite.x - 900 + cursorX;
        cameraTarget.y = player.sprite.y - 900 + cursorY;

        // move the actual camera focus to the target vector, very smoothly 
        cameraX -= (cameraX - cameraTarget.x) / 20;
        cameraY -= (cameraY - cameraTarget.y) / 20;

        this.cameras.main.setScroll(cameraX, cameraY);





    }

}