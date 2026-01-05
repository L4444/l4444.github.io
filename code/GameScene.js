class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  getPlayer() {
    return this.ships[0];
  }

  getProjectileManager() {
    return this.projectileManager;
  }

  preload() {
    let shipNames = [];

    shipNames.push("ships/Human-Fighter.png");
    shipNames.push("ships/Alien-Scout.png");

    console.log(shipNames);

    for (var i = 0; i < shipNames.length; i++) {
      this.load.image(shipNames[i], shipNames[i]);
    }

    this.load.image(
      "back",
      "backgrounds/Blue Nebula/Blue Nebula 1 - 1024x1024.png"
    );
    this.load.image(
      "menuBack",
      "backgrounds/Green Nebula/Green Nebula 7 - 1024x1024.png"
    );
    this.load.image("logo", "Ratspace Logo.png");
    this.load.image("asteroid", "asteroids/Asteroid.png");

    this.load.image("flare", "particles/flare.png");

    this.load.image("pew", "projectiles/pew-yellow.png");
    this.load.image("bigPew", "projectiles/pew-big-green.png");
    this.load.image("red", "red.png");

    this.load.image("earth", "planets/Terran1.png");

    this.load.image("shield", "00.png");

    var u;
    for (var i = 0; i < 15; i++) {
      u = (i + 1).toString().padStart(4, "0");

      this.load.image("boom" + i, "effects/explosion4/k2_" + u + ".png");
    }

    // load music
    this.load.audio("menu", "music/Menu.wav");
    this.load.audio("battle", "music/n-Dimensions (Main Theme).mp3");
    this.load.audio("sneak", "music/through space.ogg");
    this.load.audio("boss", "music/Power Trip 3.mp3");

    // load shooting sounds
    this.load.audio("shoot1", "sounds/alienshoot1.wav");
    this.load.audio("shoot2", "sounds/alienshoot2.wav");
    this.load.audio("mg", "sounds/Futuristic SMG Single Shot.wav");

    // load all the explosion sounds
    for (let i = 0; i < 9; i++) {
      this.load.audio(
        "boom" + (i + 1),
        "explosions/explosion0" + (i + 1) + ".wav"
      );
    }

    // load hit sounds
    this.load.audio("hitPlayerSound", "sounds/hitPlayerSound.wav");
    this.load.audio(
      "hitEnemySound",
      "sounds/clip-hitmarker-sound-effect-sound.wav"
    );

    // Load data
    this.load.json("playerData", "data/ships/playerShip.json");
    this.load.json("enemyData", "data/ships/enemyShip.json");

    console.log("Preloading done");
  }

  resumeGame() {
    this.gameState = state.Gameplay;
    this.game.scene.scenes[0].physics.resume();
    this.game.sound.pauseAll();
    this.battleMusic.resume();
    this.menuBack.visible = false;
    this.pauseText.visible = false;
    this.pauseShade.visible = false;
    this.gameLogo.visible = false;
    this.helpText.visible = true;
  }

  pauseGame() {
    this.gameState = state.Menu;
    this.game.scene.scenes[0].physics.pause();
    this.game.sound.pauseAll();
    this.pauseText.visible = true;
    this.pauseShade.visible = true;
  }

  create() {
    // Disable mouse click context menu
    this.game.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    this.gameBackground = new GameBackground(
      this,
      "back",
      1000,
      1000,
      1024 * 3,
      1024 * 3
    );

    this.earth = this.add.sprite(1000, 1000, "earth");
    this.earth.tint = 0x333333;

    this.earth.setScrollFactor(0.5);

    this.statics = [];
    for (var i = 0; i < 16; i++) {
      var x = i % 4;
      var y = Math.floor(i / 4);

      // Create an asteroid to help player orient themselves
      this.statics.push(
        new Asteroid(this, "asteroid", x * 800, y * 800, i * 20)
      );
    }

    let boundSize = 2000;
    let wallThickness = 200;
    // Create the "walls", for out of bounds
    this.statics.push(
      new Wall(
        this,
        "red",
        1000,
        1000 - boundSize,
        boundSize * 2,
        wallThickness
      )
    ); ///Top
    this.statics.push(
      new Wall(
        this,
        "red",
        1000 + boundSize,
        1000,
        wallThickness,
        boundSize * 2
      )
    ); // Right
    this.statics.push(
      new Wall(
        this,
        "red",
        1000,
        1000 + boundSize,
        boundSize * 2,
        wallThickness
      )
    ); // Bottom
    this.statics.push(
      new Wall(
        this,
        "red",
        1000 - boundSize,
        1000,
        wallThickness,
        boundSize * 2
      )
    ); // Left

    // Ship specifications

    var humanFighter = this.cache.json.get("playerData");
    var alienDestroyer = this.cache.json.get("enemyData");

    this.ships = [];

    // Create the player ship
    this.ships.push(
      new Ship(
        this,
        humanFighter,
        1000,
        1000,
        new KeyboardAndMouseController(this),
        false
      )
    );

    // Create music objects
    this.menuMusic = this.sound.add("menu", { loop: true });

    this.battleMusic = this.sound.add("battle", { loop: true });
    this.battleMusic.volume = 0.1;

    this.sneakMusic = this.sound.add("sneak", { loop: true });
    this.sneakMusic.volume = 0.3;

    this.bossMusic = this.sound.add("boss", { loop: true });
    this.bossMusic.volume = 0.1;

    var f = [];
    for (var i = 0; i < 15; i++) {
      f[i] = { key: "boom" + i };
    }
    this.anims.create({ key: "explode", frames: f, frameRate: 30, repeat: 0 });

    // Prepare the explosion sounds.
    Ship.explosionSound = [];
    for (let i = 0; i < 9; i++) {
      Ship.explosionSound[i] = this.sound.add("boom" + (i + 1));
      Ship.explosionSound[i].volume = 0.5;
    }

    // Make the enemy ships
    for (let i = 0; i < 1; i++) {
      this.ships.push(
        new Ship(
          this,
          alienDestroyer,
          1000 + i * 400,
          600,
          new AIController(this),
          true
        )
      );
    }

    // The pause menu
    this.menuBack = this.add.tileSprite(500, 500, 1024, 1024, "menuBack");
    this.pauseShade = this.add.rectangle(0, 0, 2000, 2000, 0x336633, 0.25);
    this.pauseShade.visible = false;

    this.gameLogo = this.add.sprite(450, 350, "logo");

    this.debugText = new DebugText(this, 10, 30);
    this.helpText = this.add.text(
      10,
      10,
      "Press F1 to cycle through help menus"
    );
    this.helpText.setScrollFactor(0);
    this.helpText.visible = false; // Don't show the help text in the "Main Menu"
    this.helpText.setDepth(SpriteLayer.UI);

    this.pauseText = this.add.text(
      400,
      400,
      "Paused - Press escape to unpause"
    );
    this.pauseText.setScrollFactor(0);
    this.pauseText.setDepth(SpriteLayer.UI);

    this.scoreText = this.add.text(600, 10, "");
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(SpriteLayer.UI);

    // Toggle the help text that shows how to control and has some debug info
    this.input.keyboard.on("keyup-F1", function (event) {
      this.scene.debugText.switchInfoType();
    });

    this.input.keyboard.on("keyup-ONE", function (event) {
      if (!this.scene.menuMusic.isPlaying) {
        this.game.sound.stopAll();
        this.scene.menuMusic.play();
      }
    });
    this.input.keyboard.on("keyup-TWO", function (event) {
      if (!this.scene.battleMusic.isPlaying) {
        this.game.sound.stopAll();
        this.scene.battleMusic.play();
      }
    });
    this.input.keyboard.on("keyup-THREE", function (event) {
      if (!this.scene.sneakMusic.isPlaying) {
        this.game.sound.stopAll();
        this.scene.sneakMusic.play();
      }
    });
    this.input.keyboard.on("keyup-FOUR", function (event) {
      if (!this.scene.bossMusic.isPlaying) {
        this.game.sound.stopAll();
        this.scene.bossMusic.play();
      }
    });
    this.input.keyboard.on("keyup-ESC", function (event) {
      if (this.gameState == state.Gameplay) {
        this.pauseGame();
        return;
      }

      if (this.gameState == state.Menu) {
        this.resumeGame();
        return;
      }
    });

    this.input.keyboard.on("keyup-F", function (event) {
      for (let i = 0; i < this.scene.ships.length; i++) {
        this.scene.ships[i].isActive = !this.scene.ships[i].isActive;
      }
    });
    this.input.keyboard.on("keyup-G", function (event) {
      this.scene.physics.world.drawDebug = !this.scene.physics.world.drawDebug;
      this.scene.physics.world.debugGraphic.clear();
    });

    this.projectileManager = new ProjectileManager(this);

    this.collisionManager = new CollisionManager(
      this,
      this.ships,
      this.projectileManager,
      this.statics
    );

    // Start game
    this.gameState = state.Menu;

    // Start in game
    this.resumeGame();

    this.getPlayer().score = 0;

    this.cameraX = 0;
    this.cameraY = 0;

    // Turn off physics wireframes, due to the way phaser works...
    //  I have to enable it on config and disable it here if I want to "toggle" it at runtime
    this.physics.world.drawDebug = false;

    console.log("Objects created");
  }

  update() {
    // Cheesy scrolling background
    this.menuBack.tilePositionY -= 1;

    this.scoreText.text = "Score: " + this.getPlayer().score;

    if (this.gameState == state.Gameplay) {
      // Center the camera on the player, let PlayerInput deal with smoothness
      this.cameras.main.setScroll(
        this.getPlayer().controller.cameraPos.x,
        this.getPlayer().controller.cameraPos.y
      );
    }
  }
}
