class GameScene extends Phaser.Scene {

    #player = null;
    constructor() {
        super('GameScene');

    }



    preload() {
        this.load.image('player', 'ships/player-2.png');
        this.load.image('enemy1', 'ships/empire-d.png');
        this.load.image('enemy2', 'ships/empire-d.png');
        this.load.image('enemy3', 'ships/empire-d.png');
        this.load.image('enemy4', 'ships/empire-d.png');

        this.load.image('back', 'backgrounds/Blue Nebula/Blue Nebula 1 - 1024x1024.png');
        this.load.image('menuBack', 'backgrounds/Green Nebula/Green Nebula 7 - 1024x1024.png');
        this.load.image('logo', 'Ratspace Logo.png');
        this.load.image('asteroid', 'asteroids/Asteroid.png');


        this.load.image('flare', 'particles/flare.png');

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

    resumeGame() {
        this.gameState = state.Gameplay; this.game.scene.scenes[0].physics.resume(); this.game.sound.pauseAll(); this.battleMusic.resume();
        this.menuBack.visible = false; this.pauseText.visible = false; this.pauseShade.visible = false; this.gameLogo.visible = false; this.helpText.visible = true;
    }

    pauseGame() {
        this.gameState = state.Menu; this.game.scene.scenes[0].physics.pause(); this.game.sound.pauseAll(); this.pauseText.visible = true; this.pauseShade.visible = true;
    }

    create() {

        


        // Disable mouse click context menu
        this.game.canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
        });



        this.backgrounds = [];
        // Create the "parallax" backgrounds, tile them together in 3x3 grid to make them look seamless.
        for (var i = 0; i < 9; i++) {
            var x = i % 3;
            var y = Math.floor(i / 3);

            this.backgrounds[i] = this.add.tileSprite(x * 1024, y * 1024, 1024, 1024, 'back');

            // Don't forget to add scroll factor back to make it parallax
            this.backgrounds[i].setScrollFactor(0.5);

        }


        // Create an asteroid to help player orient themselves
        this.asteroid = this.physics.add.sprite(1000, 1500, 'asteroid');
        let r = 150;
        this.asteroid.setCircle(r, 110, 100);



        // Create music objects
        this.menuMusic = this.sound.add('menu', { loop: true });

        this.battleMusic = this.sound.add('battle', { loop: true });
        this.battleMusic.volume = 0.1;

        this.sneakMusic = this.sound.add('sneak', { loop: true });
        this.sneakMusic.volume = 0.3;

        this.bossMusic = this.sound.add('boss', { loop: true });
        this.bossMusic.volume = 0.1;

        var f = [];
        for (var i = 0; i < 15; i++) {
            f[i] = { key: 'boom' + i };
        }
        this.anims.create({ key: 'explode', frames: f, frameRate: 30, repeat: 0 });




        this.#player = new Ship(this, 'player', 1000, 1200, false);
        this.playerInput = new PlayerInput(this,this.#player);

        Ship.playerShip = this.#player;







        // Prepare the explosion sounds.
        Ship.explosionSound = [];
        for (let i = 0; i < 9; i++) {
            Ship.explosionSound[i] = this.sound.add('boom' + (i + 1));
            Ship.explosionSound[i].volume = 0.5;

        }

        // collide with asteroid
        this.physics.add.collider(this.#player, this.asteroid, function (pShip, eShip, body1, body2) {
            console.log("Player hit asteroid ");
        });


        this.enemies = [];
        for (let i = 0; i < 4; i++) {

            this.enemies[i] = new Ship(this, 'enemy' + (i + 1), 1000 + (i * 200), 1000, true);

        }

        this.collisionManager = new CollisionMananger(this, this.#player, this.enemies);



        


        // The pause menu
        this.menuBack = this.add.tileSprite(500, 500, 1024, 1024, 'menuBack');
        this.pauseShade = this.add.rectangle(0, 0, 2000, 2000, 0x336633, .25);
        this.pauseShade.visible = false;

        this.gameLogo = this.add.sprite(450, 350, 'logo');


        this.keys = this.input.keyboard.addKeys('W,S,A,D,F,E,Q,F,G,H,UP,DOWN,SPACE,F1');
        this.infoText = this.add.text(10, 30, ""); this.infoText.setScrollFactor(0);
        this.helpText = this.add.text(10, 10, "Press F1 to cycle through help menus"); this.helpText.setScrollFactor(0);
        this.helpText.visible = false; // Don't show the help text in the menu.


        this.pauseText = this.add.text(400, 400, "Paused - Press escape to unpause"); this.pauseText.setScrollFactor(0);

        this.scoreText = this.add.text(750, 10, ""); this.scoreText.setScrollFactor(0);




       

        // Toggle the help for controls and debug. Also control music
        this.input.keyboard.on('keyup-F1', function (event) {
            if (this.scene.infoMode < 3) {
                this.scene.infoMode++;
            }
            else {
                this.scene.infoMode = 1;
            }
                
        })

        this.input.keyboard.on('keyup-ONE', function (event) { if (!this.scene.menuMusic.isPlaying) { this.game.sound.stopAll(); this.scene.menuMusic.play(); } })
        this.input.keyboard.on('keyup-TWO', function (event) { if (!this.scene.battleMusic.isPlaying) { this.game.sound.stopAll(); this.scene.battleMusic.play(); } })
        this.input.keyboard.on('keyup-THREE', function (event) { if (!this.scene.sneakMusic.isPlaying) { this.game.sound.stopAll(); this.scene.sneakMusic.play(); } })
        this.input.keyboard.on('keyup-FOUR', function (event) { if (!this.scene.bossMusic.isPlaying) { this.game.sound.stopAll(); this.scene.bossMusic.play(); } })
        this.input.keyboard.on('keyup-ESC', function (event) {

            if (this.gameState == state.Gameplay) {
                this.pauseGame(); return;
            }


            if (this.gameState == state.Menu) {

                this.resumeGame(); return;
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



        // Start game
        this.gameState = state.Menu;

        // Start in game
        this.resumeGame();



        Ship.playerShip.score = 0;

     
        this.cameraX = 0;
        this.cameraY = 0;

        this.infoMode = 1;


        console.log('Objects created');

        
    }



    update() {
        
        // Cheesy scrolling background
        this.menuBack.tilePositionY -= 1;





        this.scoreText.text = "Score: " + Ship.playerShip.score;


        if (this.gameState == state.Gameplay) {
            // Center the camera on the player, let PlayerInput deal with smoothness
            this.cameras.main.setScroll(this.playerInput.cameraPos.x, this.playerInput.cameraPos.y);



            // Present the various types of info in text box 
            switch (this.infoMode) {
                case 1:

                    this.infoText.setText("-----------Controls-----------\n"
                        + "W,S,A,D for movement\n"
                        + " Left click for shoot\n"
                        + "1 for menu music \n2 for battle music \n3 for stealth music \n4 for boss music");

                    break;
                case 2:
                    this.infoText.setText("-------------DEBUG-------------\n"
                        + "(LEFT / RIGHT) Big thrust is " + Ship.BIG_THRUST + "\n"
                        + "(UP / DOWN) Max Speed is " + Ship.MAX_SPEED + "\n"
                        + "VelX = " + this.#player.body.velocity.x + "\nVelY = " + this.#player.body.velocity.y +
                        "\ntX: " + this.#player.tX + "\ntY: " + this.#player.tY +
                        "\nCursorX: " + this.playerInput.cursorPos.x + "\nCursorY: " + this.playerInput.cursorPos.y +
                        "\ntargetAngle: " + this.playerInput.targetAngle + "\nPlayer Angle: " + this.#player.rotation +
                        "\nMousebuttons: " + game.input.mousePointer.buttons + "\n" +
                        "Player X: " + this.#player.x + "\n" +
                        "Player Y: " + this.#player.y + "\n");
                    break;

                case 3:
                    this.infoText.setText("-----------PARTICLES-----------");
                    break;


            }







            //update the asteroids
            this.asteroid.angle += 0.2;

            this.#player.update();



            for (let i = 0; i < this.enemies.length; i++) {

                this.enemies[i].update();

            }

        }

    }
}
