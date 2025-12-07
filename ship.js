class Ship
{
    static BIG_THRUST = 2600;
    static LITTLE_THRUST = 5.0; 
    static MAX_SPEED = 600;
    static playerShip;

  static explosionSound;
 

 

constructor(engine,spriteName,x,y,isEnemy)
{

    // The bullet sprites (Note that I intialise this before the ship 
    // so that the bullets spawn obscured by the ship sprite)
    this.bullet = [];
    for(let i = 0; i< 10;i++)
    {
    this.bullet[i] = engine.physics.add.sprite(x,y, "pew").setCircle(256/2,0,256/2 - 256/2);
    if(isEnemy) {this.bullet[i].tint = 0xFF6666;}
    this.bullet[i].setScale(0.25);
    this.bullet[i].x = -400;
    this.bullet[i].y = -400;

    
      
    }
    this.nextBullet = 0;

    this.clock = 0;
    this.lastTick = -500;


    // The actual ship's sprite 
    this.sprite = engine.physics.add.sprite(x,y, spriteName);

    // -- Get the measurements of the ship spread and create a hit circle 
    let w = this.sprite.displayWidth;
    let h = this.sprite.displayHeight;

    this.sprite.setCircle(w /2,0,h/2 - w/2);
    
    // -- Enemies don't collide with the sides, that way they can 'spawn' from the north
    if(!isEnemy) {this.sprite.body.setCollideWorldBounds(true);}
    this.sprite.body.setBounce(10,10); // Ships should bounce enough off each other to prevent "rubbing"
    
    this.sprite.setScale(0.5);


    this.isEnemy = isEnemy;
    if(isEnemy) {

        // Go right, then go left. Like space invaders :)
        this.spaceInvaderRight = true;

        // The Y position I "should" be in.
        this.targetY = y;
    }
    else{
        this.score = 0;
    }

    this.tX = 0.0;
    this.tY = 0.0;

   
   if(isEnemy) { 
    this.shootSound = engine.sound.add('shoot2', {loop: false});
    /// Workaround, tie the hitsound to the sprite so it can be called in the collision detection code
    this.sprite.hitSound = engine.sound.add('hitEnemySound', {loop: false}); 
    this.sprite.hitSound.volume = 0.5;
}
   else
   {
    this.shootSound = engine.sound.add('shoot1', {loop: false});
    /// Workaround, tie the hitsound to the sprite so it can be called in the collision detection code
    this.sprite.hitSound = engine.sound.add('hitPlayerSound', {loop: false});
   }

   
   this.shootSound.volume = 0.3;

   // set hp
   this.sprite.hp = 100;
   this.hpBarBack = engine.add.rectangle(0, 0, this.sprite.displayWidth, 10, 0x000000, 1);
   this.hpBarFront = engine.add.rectangle(0, 0, this.sprite.displayWidth, 5, 0x336633, 1);
   
   // Setup explosion effect
   this.explosion = engine.add.sprite(-400,-400, 'boom14');
   this.explosion.setScale(0.25);

   
   this.sprite.tintTick = 255;
}
shoot()
{

    
    if(this.clock > this.lastTick + 100)
    {
        this.shootSound.play();

        
        this.bullet[this.nextBullet].x = this.sprite.x;
        this.bullet[this.nextBullet].y = this.sprite.y;

        let speed = -2000;
       // if(this.enemy) {speed = -200;} // Gimp the enemies, to make them easier to dodge


        let v = new Phaser.Math.Vector2(0,speed);
        v.rotate(Phaser.Math.DegToRad(this.sprite.angle));

        this.bullet[this.nextBullet].setVelocity(v.x,v.y);
        this.bullet[this.nextBullet].angle = this.sprite.angle;

        if(this.nextBullet < this.bullet.length - 1) {this.nextBullet++;} else {this.nextBullet = 0;}

        this.lastTick = this.clock;

    }

}
left()
{
    this.tX = -Ship.BIG_THRUST;
}
right()
{
    this.tX = Ship.BIG_THRUST;
}
forward()
{
    this.tY = -Ship.BIG_THRUST;
}
back()
{
    this.tY = Ship.BIG_THRUST;
}
update()
{
    this.sprite.tintTick += 5;

    if(this.sprite.tintTick > 255)
    {
        this.sprite.tintTick = 255;
    }
    
    this.sprite.tint = '0xFF' + this.sprite.tintTick.toString(16) + 'FF';
    
    

    if(this.isEnemy) {this.doAI();}

    // line up the hp bar
    this.hpBarBack.x = this.sprite.x ;
    this.hpBarFront.x = this.sprite.x +((this.sprite.hp/100) * this.sprite.displayWidth/2) - this.sprite.displayWidth/2;
    this.hpBarBack.y = this.hpBarFront.y  = this.sprite.y - 50;
    this.hpBarFront.displayWidth = (this.sprite.hp/100) * this.sprite.displayWidth;
    
      // Check hp
    if(this.sprite.hp <= 0)
    {
          this.explosion.x = this.sprite.x;
          this.explosion.y = this.sprite.y;
          this.explosion.play('explode');

          if(this.isEnemy)
          {
            this.sprite.x = 300;
            this.sprite.y = -3000;
            Ship.playerShip.score += 100;

           
          }

           // Play explosion sound effect.
           var r = Math.floor(Math.random() * 9);
           console.log(r);
           Ship.explosionSound[r].play(); 

          this.sprite.hp = 100;
    }

    // If we aren't dead, regen HP slowly
    if(this.sprite.hp < 100) {this.sprite.hp += 0.1;}

    // If we aren't using the big thruster, activate the little thruster to slow us down and prevent drift.... if our X velocity is really small, just 
    // "apply the handbrake", setting velocity to zero
    if(this.tX == 0)
    {
        if(Math.abs(this.sprite.body.velocity.x) > 1)
        {
            this.tX = this.sprite.body.velocity.x * -Ship.LITTLE_THRUST; 
            
        }
        else
        {
            this.sprite.setVelocityX(0);
            
        }
        
    }
    // Same as above, but for Y axis, not sure if I should make this into a function.
    if(this.tY == 0)
    {
        if(Math.abs(this.sprite.body.velocity.y) > 1)
        {
            this.tY = this.sprite.body.velocity.y * -Ship.LITTLE_THRUST; 
        }
        else
        {
            this.sprite.setVelocityY(0);
        }
    
    }
     

/// Speed cap
   if(this.sprite.body.velocity.x > Ship.MAX_SPEED) {this.sprite.setVelocityX(Ship.MAX_SPEED);this.tX = 0;}
   if(this.sprite.body.velocity.x < -Ship.MAX_SPEED) {this.sprite.setVelocityX(-Ship.MAX_SPEED);this.tX = 0;}
   if(this.sprite.body.velocity.y > Ship.MAX_SPEED) {this.sprite.setVelocityY(Ship.MAX_SPEED);this.tY = 0;}
   if(this.sprite.body.velocity.y < -Ship.MAX_SPEED) {this.sprite.setVelocityY(-Ship.MAX_SPEED);this.tY = 0;}
    // Activate big thruster!
    this.sprite.setAcceleration(this.tX,this.tY);

    // Tick the clock (useful for limiting bullet firing)
    this.clock++;


    this.tX = 0;
    this.tY = 0;

  
    
}
doAI() 
{

    if(this.sprite.x > 750) {this.spaceInvaderRight = false; }
    if(this.sprite.x < 150) {this.spaceInvaderRight = true; }
    if(this.sprite.y < this.targetY -30) {this.back();}
    if(this.sprite.y > this.targetY+30) {this.forward();}


    if(Math.floor(Math.random() * 40) == 1 && this.sprite.y > 0)  {this.shoot();}
    

    if(this.spaceInvaderRight) {this.right();} else {this.left();}


    this.sprite.angle = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, Ship.playerShip.sprite.x, Ship.playerShip.sprite.y)
       ) + 90; // The +90 is to ensure it points forward rather than to the right.

    

}

}