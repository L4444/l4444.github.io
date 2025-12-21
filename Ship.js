class Ship extends Phaser.Physics.Arcade.Sprite {
    static BIG_THRUST = 200;
    static TURN_SPEED_FACTOR = 20;
    static MAX_SPEED = 200;
    static playerShip;

    static explosionSound;




    constructor(scene, spriteName, x, y, isEnemy) {

        super(scene, x,y,spriteName);

        // Particle thrust effect, put it here so it's z order puts it behind the actual ship sprite
        this.particleContainer = scene.add.container(0, 0);

        this.flame = scene.add.particles('flare');

    

        // The bullet sprites (Note that I intialise this before the ship 
        // so that the bullets spawn obscured by the ship sprite)
        this.bullet = [];
        for (let i = 0; i < 10; i++) {
            this.bullet[i] = scene.physics.add.sprite(x, y, "pew").setCircle(39 / 4, 39 /4,39 /4);
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
            scale: { start: 0.30, end: 0.10, ease: 'sine.out' },
            alpha: { start: 1, end: 0},
            
            speed: 300,
            advance: 2000,
            blendMode: 'ADD'
        });
        this.particleContainer.add(this.flame);

        // -- Get the measurements of the ship spread and create a hit circle 
        let w = this.displayWidth;
        let h = this.displayHeight;

        

     



        this.isEnemy = isEnemy;
        if (isEnemy) {

            // Go right, then go left. Like space invaders :)
            this.spaceInvaderRight = true;

            // The Y position I "should" be in.
            this.targetY = y;
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
        this.body.setCircle(w / 4, w / 4, h / 4);
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


        if (this.clock > this.lastTick + 100) {
            this.shootSound.play();


            this.bullet[this.nextBullet].x = this.x;
            this.bullet[this.nextBullet].y = this.y;

            let speed = -800;
             if(this.isEnemy) {speed = -200;} // Gimp the enemies, to make them easier to dodge

            // Use vectors to set the path of the bullet, use the X axis to align with the player ship.
            let v = new Phaser.Math.Vector2(-speed, 0);
            v.rotate(this.rotation);

            this.bullet[this.nextBullet].setVelocity(v.x, v.y);
            this.bullet[this.nextBullet].rotation = this.rotation;

            if (this.nextBullet < this.bullet.length - 1) { this.nextBullet++; } else { this.nextBullet = 0; }

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

    boost()
    {
        this.tX = 2;
    }
    preUpdate(time,delta) {
        this.tintTick += 5;

        if (this.tintTick > 255) {
            this.tintTick = 255;
        }

        this.tint = '0xFF' + this.tintTick.toString(16) + 'FF';

      

       
        

        


        if (this.isEnemy) { this.doAI(); }

         // Check hp 
        if (this.hp <= 0) {
            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.play('explode');

            if (this.isEnemy) {
                this.x = 0;
                this.y = 0;
                Ship.playerShip.score += 100;


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


        // Convert the key presses into an actual angle we can use to move the ship.
        let v = new Phaser.Math.Vector2(this.tX, this.tY);
         v.normalize();
        v.rotate(Phaser.Math.DegToRad(this.angle));

        // Activate the particle effect if the ship "Boosts"
        if (this.tX > 1) {
            this.thruster.start(); 
            v.scale(Ship.BIG_THRUST * 2);   
            this.body.setMaxSpeed(Ship.MAX_SPEED * 10);
        }
        else {
            this.thruster.stop(); 
             v.scale(Ship.BIG_THRUST);
             this.body.setMaxSpeed(Ship.MAX_SPEED);
             
        }

        this.setAcceleration(v.x, v.y); // Then Activate the thrusters!

        // Tick the clock (useful for limiting bullet firing)
        this.clock++;

         // move thruster with ship
        let thr = new Phaser.Math.Vector2(-62,0);
        thr.rotate(this.rotation);

        /// move the container that the emitter and particles are in with the ship
        // "thr" here allows the emitter's position to rotate with the ship
        // finally, you need to give the container (and by extension the emitter) 1 "tick" of 
        // the ship's velocity in order to prevent a VERY strange issue where the emitter
        // misaligns with the ship slightly
        this.particleContainer.x = this.x + thr.x + this.body.velocity.x /60;
        this.particleContainer.y = this.y + thr.y + this.body.velocity.y /60;
        this.particleContainer.angle = this.angle - 90;

        this.tX = 0;
        this.tY = 0;

        



    }
    doAI() {

        
        if (this.x > 750) { this.spaceInvaderRight = false; }
        if (this.x < 150) { this.spaceInvaderRight = true; }



        //this.shoot();

        this.angle = Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(this.x, this.y, Ship.playerShip.x, Ship.playerShip.y)
        ); // The +90 is to ensure it points forward rather than to the right.



    }

}