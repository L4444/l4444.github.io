class CollisionManager {

    constructor(scene, ships, bulletManager, statics) {

        // 1) Check for ship to static (asteroid, wall etc.) collisions
        scene.physics.add.collider(ships, statics, function (pShip, asteroid, body1, body2) {
            pShip.dealDamage(0);
        });

        // 2) Check for ship to ship collisions
        scene.physics.add.collider(ships, ships, function (pShip, eShip, body1, body2) {
            pShip.dealDamage(0);
            eShip.dealDamage(0);
        });

        // 3) Check for ship to bullet collisions
        scene.physics.add.overlap(ships, bulletManager.getBullets(), function (hitShip, hitBullet, body1, body2) {

            if (hitShip != hitBullet.owner) {
                hitShip.dealDamage(hitBullet.damage);
                hitBullet.disable();
            }
        });

        // 4) Finally, check for bullet to static collisions.
        scene.physics.add.overlap(statics, bulletManager.getBullets(), function (hitStatic, hitBullet, body1, body2) {
            hitBullet.disable();
        });


    }

}