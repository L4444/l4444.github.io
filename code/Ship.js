class Ship extends Phaser.Physics.Arcade.Sprite {


    

    static explosionSound;




    constructor(scene, spriteName, x, y, controller, isEnemy) {

        super(scene, x, y, spriteName);
        this.name = spriteName;

        this.THRUST_SPEED = 700;
        this.TURN_SPEED_FACTOR = 80;
        this.MAX_SPEED = 500;

        this.controller = controller;

        // Particle thrust effect, put it here so it's z order puts it behind the actual ship sprite
        this.particleContainer = scene.add.container(0, 0);

        this.flame = scene.add.particles('flare');



        // The bullet sprites (Note that I intialise this before the ship 
        // so that the bullets spawn obscured by the ship sprite)
        this.bullet = [];
        for (let i = 0; i < 10; i++) {
            this.bullet[i] = scene.physics.add.sprite(x, y, "pew").setCircle(39 / 4, 39 / 4, 39 / 4);
            if (isEnemy) { this.bullet[i].tint = 0xFF6666; }

            this.bullet[i].x = -9999;
            this.bullet[i].y = -9999;



        }
        this.nextBullet = 0;

        this.clock = 0;
        this.lastTick = -500;




        this.thruster = this.flame.createEmitter({
            x: 0,
            y: 0,

            color: [0xff0000],
            colorEase: 'quad.out',
            lifespan: 200,

            angle: -90,
            scale: { start: 0.20, end: 0.10, ease: 'sine.out' },
            alpha: { start: 1, end: 0 },

            speed: 300,
            advance: 2000,
            blendMode: 'ADD'
        });
        this.particleContainer.add(this.flame);








        this.isEnemy = isEnemy;
        if (isEnemy) {
            this.TURN_SPEED_FACTOR = 20;
            this.MAX_SPEED = 200;
            this.THRUST_SPEED = 200;

            // Disable enemy AI when testing
            this.isActive = false;

        }
        else {
            this.score = 0;
        }

        this.tX = 0.0;
        this.tY = 0.0;


        if (isEnemy) {
            this.shootSound = scene.sound.add('shoot2', { loop: false });
            /// Workaround, tie the hitsound to the sprite so it can be called in the collision detection code
            this.hitSound = scene.sound.add('hitEnemySound', { loop: false });
            this.hitSound.volume = 0.1;
        }
        else {
            this.shootSound = scene.sound.add('shoot1', { loop: false });
            /// Workaround, tie the hitsound to the sprite so it can be called in the collision detection code
            this.hitSound = scene.sound.add('hitPlayerSound', { loop: false });
        }


        this.shootSound.volume = 0.3;

        // Manually add ship to scene and physics (contructor doesn't do this for us)
        // Put it all the way down here so the ship renders over the bullets
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // TODO: Adjust this to account for different image sizes
        // -- Get the measurements of the ship spread and create a hit circle 
        let w = this.displayWidth;
        let h = this.displayHeight;
        this.body.setCircle(w / 2, 0, 0);
        this.body.setBounce(1, 1); // Ships should bounce enough off each other to prevent "rubbing"

        // set hp
        this.hp = 100;
        this.hpBarBack = scene.add.rectangle(0, 0, this.displayWidth, 10, 0x000000, 1);
        this.hpBarFront = scene.add.rectangle(0, 0, this.displayWidth, 5, 0x336633, 1);
        // Setup explosion effect
        this.explosion = scene.add.sprite(-9999, -9999, 'boom14');
        this.explosion.setScale(0.5);


        this.tintTick = 255;

      


    }
    shoot() {


        if (this.clock > this.lastTick + 20) {
            this.shootSound.play();


           this.scene.getBulletManager().shoot(this);
            this.lastTick = this.clock;

        }

    }
    left() {


        this.tY += -1;


    }
    right() {


        this.tY += 1;


    }
    forward() {



        this.tX += 1;
    }
    back() {



        this.tX += -1;
    }

    boost() {
        this.isBoost = true;
    }

    brake() {

        this.isBrake = true;

    }
    preUpdate(time, delta) {
        this.tintTick += 5;

        if (this.tintTick > 255) {
            this.tintTick = 255;
        }

        this.tint = '0xFF' + this.tintTick.toString(16) + 'FF';

        this.tX = 0;
        this.tY = 0;
        this.isBoost = false;
        this.isBrake = false;
        this.controller.update(this);



        // Check hp 
        if (this.hp <= 0) {
            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.play('explode');

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

        // line up the hp bar, Do this AFTER checking hp so that when we move the hp bar doesn't look glitchy
        this.hpBarBack.x = this.x;
        this.hpBarFront.x = this.x + ((this.hp / 100) * this.displayWidth / 2) - this.displayWidth / 2;
        this.hpBarBack.y = this.hpBarFront.y = this.y - 50;
        this.hpBarFront.displayWidth = (this.hp / 100) * this.displayWidth;



        // If we aren't dead, regen HP slowly
        if (this.hp < 100) { this.hp += 0.1; }


        if (this.isBrake) {
            this.body.setDrag(1000, 1000);
            this.setAcceleration(0, 0); // Then Activate the thrusters!
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, this.targetAngle, this.TURN_SPEED_FACTOR / 1000);
        }
        else {
            this.body.setDrag(0, 0);

            let boostMultiplier = 1;
            if (this.isBoost) {
                this.tX = 1;
                this.tY = 0;
                boostMultiplier = 4;
                this.thruster.start();
                this.thruster.visible = true;
            }
            else {
                this.thruster.stop();
                this.thruster.visible = false;
                this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, this.targetAngle, this.TURN_SPEED_FACTOR / 1000);

            }


            // Convert the key presses into an actual angle we can use to move the ship.
            let v = new Phaser.Math.Vector2(this.tX, this.tY);
            v.normalize();
            v.rotate(Phaser.Math.DegToRad(this.angle));
            v.scale(this.THRUST_SPEED * boostMultiplier);
            this.body.setMaxSpeed(this.MAX_SPEED * boostMultiplier);
            this.setAcceleration(v.x, v.y); // Then Activate the thrusters!



        }




        // Tick the clock (useful for limiting bullet firing)
        this.clock++;

        // move thruster with ship
        let thr = new Phaser.Math.Vector2(-31, 0);
        thr.rotate(this.rotation);

        /// move the container that the emitter and particles are in with the ship
        // "thr" here allows the emitter's position to rotate with the ship
        // finally, you need to give the container (and by extension the emitter) 1 "tick" of 
        // the ship's velocity in order to prevent a VERY strange issue where the emitter
        // misaligns with the ship slightly
        this.particleContainer.x = this.x + thr.x + this.body.velocity.x / 60;
        this.particleContainer.y = this.y + thr.y + this.body.velocity.y / 60;
        this.particleContainer.angle = this.angle - 90;







    }
    rotateTo(targetAngle) {
        this.targetAngle = targetAngle;
    }


}