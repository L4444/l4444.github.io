class Ship extends Phaser.Physics.Arcade.Sprite {
  static explosionSound;

  constructor(scene, spec, x, y, controller, isEnemy) {
    super(scene, x, y, spec.spriteName);
    this.setDepth(SpriteLayer.SHIP);
    this.name = spec.spriteName;

    this.spec = spec;

    this.controller = controller;

    // Particle thrust effect, put it here so it's z order puts it behind the actual ship sprite
    this.particleContainer = scene.add.container(0, 0);
    this.flame = scene.add.particles("flare");

    this.clock = 0;
    this.lastTick = -500;

    this.thruster = this.flame.createEmitter({
      x: 0,
      y: 0,

      color: [0xff0000],
      colorEase: "quad.out",
      lifespan: 500,

      angle: 180,
      scale: { start: 0.2, end: 0.1, ease: "sine.out" },
      alpha: { start: 1, end: 0 },

      speed: 400,
      advance: 2000,
      blendMode: "ADD",
    });
    this.particleContainer.add(this.flame);

    this.isEnemy = isEnemy;
    if (isEnemy) {
      // Disable enemy AI when testing
      this.isActive = false;
    } else {
      this.score = 0;
    }

    this.tX = 0.0;
    this.tY = 0.0;

    // TODO: tie the sounds to the weapons not the ship, then give enemies different weapons
    if (isEnemy) {
      //this.shootSound = scene.sound.add("shoot2", { loop: false });
      this.hitSound = scene.sound.add("hitEnemySound", { loop: false });
      this.hitSound.volume = 0.2;
    } else {
      //this.shootSound = scene.sound.add("shoot1", { loop: false });
      this.hitSound = scene.sound.add("hitPlayerSound", { loop: false });
    }

    // Manually add ship to scene and physics (contructor doesn't do this for us
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // -- Get the measurements of the ship spread and create a hit circle
    this.body.setCircle(this.displayWidth / 2, 0, 0);
    this.body.setBounce(2, 2); // Ships should bounce enough off each other to prevent "rubbing"

    // set hp
    this.hp = 100;
    this.hpBar = new ValueBar(scene, this, 0, 0x336633);

    this.energy = 100;
    this.energyBar = new ValueBar(scene, this, 10, 0x333366);

    // Setup explosion effect
    this.explosion = scene.add.sprite(-9999, -9999, "boom14");
    this.explosion.setScale(0.5);

    // Setup shield, it should start invisible (alpha 0)
    this.shield = scene.add.sprite(0, 0, "shield");
    this.shield.displayWidth = this.displayWidth;
    this.shield.displayHeight = this.displayHeight;
    this.shield.setDepth(SpriteLayer.HP);
    this.shield.alpha = 0;

    this.weapons = [];

    this.weapons.push(new PlasmaCannon(scene, this));
    this.weapons.push(new ShipPusher(scene, this));

    // Post update, the preUpdate() function calls BEFORE physics update so if I sync
    // the other elements (e.g. shield/thruster) they will lag slightly behind.
    scene.events.on("postupdate", this.postUpdate, this);
  }
  shoot(weaponNumber) {
    this.weapons[weaponNumber].use();
  }
  left() {
    this.tX += -1;
  }
  right() {
    this.tX += 1;
  }
  forward() {
    this.tY -= 1;
  }
  back() {
    this.tY += 1;
  }

  boost() {
    this.isBoost = true;
  }

  brake() {
    this.isBrake = true;
  }

  dealDamage(damageValue) {
    // Flicker the shield
    this.shield.alpha = 1;

    if (damageValue > 0) {
      // Take the damage
      this.hp -= damageValue;
      this.hitSound.play();
    }
  }

  preUpdate(time, delta) {
    if (this.shield.alpha > 0) {
      this.shield.alpha -= 0.01;
    }

    this.tX = 0;
    this.tY = 0;
    this.isBoost = false;
    this.isBrake = false;
    this.controller.update(this);

    // If we aren't dead, regen HP slowly
    if (this.hp > 0) {
      if (this.hp < 100) {
        this.hp += 0.001;
      } else {
        this.hp = 100;
      }

      if (this.energy < 100) {
        this.energy += 0.5;
      } else {
        this.energy = 100;
      }
    }

    // Brake code
    if (this.isBrake) {
      this.body.setDrag(1000, 1000);
      this.setAcceleration(0, 0); // Switch off the thruster.
      this.rotation = Phaser.Math.Angle.RotateTo(
        this.rotation,
        this.targetAngle,
        this.spec.TURN_SPEED_FACTOR / 1000
      );
    } else {
      // If we are not braking, don't drag.
      this.body.setDrag(0, 0);

      let thrustBoost = 1;
      let maxSpeedBoost = 1;
      if (this.isBoost) {
        this.tX = 0;
        this.tY = -1;
        thrustBoost = 10;
        maxSpeedBoost = 4;
        this.thruster.start();
        this.thruster.visible = true;
      } else {
        this.thruster.stop();
        this.thruster.visible = false;
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          this.targetAngle,
          this.spec.TURN_SPEED_FACTOR / 1000
        );
      }

      // Convert the key presses into an actual angle we can use to move the ship.
      let v = new Phaser.Math.Vector2(this.tX, this.tY);
      v.normalize();
      v.rotate(Phaser.Math.DegToRad(this.angle));
      v.scale(this.spec.THRUST_SPEED * thrustBoost);
      this.body.setMaxSpeed(this.spec.MAX_SPEED * maxSpeedBoost);
      this.setAcceleration(v.x, v.y); // Then Activate the thrusters!
    }

    // update hp bar
    this.hpBar.update(this.hp);
    this.energyBar.update(this.energy);
  }

  postUpdate() {
    this.shield.x = this.x;
    this.shield.y = this.y;

    // move thruster with ship
    let thr = new Phaser.Math.Vector2(0, 70);
    thr.rotate(this.rotation);

    this.particleContainer.x = this.x + thr.x;
    this.particleContainer.y = this.y + thr.y;
    this.particleContainer.angle = this.angle - 90;

    // Check hp
    if (this.hp <= 0) {
      this.explosion.x = this.x;
      this.explosion.y = this.y;
      this.explosion.play("explode");

      if (this.isEnemy) {
        this.x = 0;
        this.y = 0;
        this.scene.getPlayer().score += 100;
      }

      // Play explosion sound effect.
      var r = Math.floor(Math.random() * 9);

      Ship.explosionSound[r].play();

      this.hp = 100;
    }
  }
  rotateTo(targetAngle) {
    this.targetAngle = targetAngle;
  }

  getSpec() {
    return this.spec;
  }
}
