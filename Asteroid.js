class Asteroid extends Phaser.Physics.Arcade.Sprite {



    constructor(scene, spriteName, x, y, tint) {

        super(scene, x,y,spriteName);

        // Manually add ship to scene and physics (contrustor doesn't do this for us)
        scene.add.existing(this);
        scene.physics.add.existing(this); 

        let r = 150;
        this.setCircle(r, 110, 100);

        this.tint = this.tint = '0xFF' + tint.toString(16) + tint.toString(16);
    }

    preUpdate(time,delta)
    {
         //update the asteroids
            this.angle += 0.2;

    }

}
