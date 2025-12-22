class CollisionMananger extends Phaser.GameObjects.GameObject
{
    


    constructor(scene, player, enemies,statics)
    {
        super(scene);

          // collide with asteroid
          for( var i = 0; i < statics.length;i++)
          {
            scene.physics.add.collider(player, statics[i], function (pShip, eShip, body1, body2) {
                //console.log("Player hit asteroid ");
            });
        }



        // Setup Enemy collision detection
        for (let i = 0; i < enemies.length; i++) {

              // Collide with the player
            scene.physics.add.collider(player, enemies[i], function (pShip, eShip, body1, body2) {
                pShip.hp -= 10; eShip.hp -= 10;
                if (pShip.hp > 0) { pShip.hitSound.play(); }
            });


            // Collide with each other
            for (let j = i; j < enemies.length; j++) {
                scene.physics.add.collider(enemies[i], enemies[j], function (aShip, bShip, body1, body2) {
                    //aShip.hp -= 5; bShip.hp -= 5; 
                    //console.log('one bounce');

                });
            }

            // Collide with asteroids
            for( var j = 0; j < statics.length;j++)
            {
            scene.physics.add.collider(enemies[i], statics[j], function (pShip, eShip, body1, body2) {
                //console.log("Enemy hit asteroid ");
            });
            }
        }

        // Add collision detection for Enemy bullets vs player
        for (let i = 0; i < enemies.length; i++) {

            for (let j = 0; j < enemies[i].bullet.length; j++) {
                scene.physics.add.overlap(player, enemies[i].bullet[j], function (hitShip, hitBullet, body1, body2) {
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
        for (let i = 0; i < enemies.length; i++) {

            for (let j = 0; j < player.bullet.length; j++) {
                scene.physics.add.overlap(enemies[i], player.bullet[j], function (hitShip, hitBullet, body1, body2) {
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
    }
}