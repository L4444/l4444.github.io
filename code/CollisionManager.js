class CollisionManager {
  constructor(scene, ships, projectileMananger, statics) {
    // 1) Check for ship to static (asteroid, wall etc.) collisions
    scene.physics.add.collider(
      ships,
      statics,
      function (pShip, asteroid, body1, body2) {
        pShip.dealDamage(0);
      }
    );

    // 2) Check for ship to ship collisions
    scene.physics.add.collider(
      ships,
      ships,
      function (pShip, eShip, body1, body2) {
        pShip.dealDamage(0);
        eShip.dealDamage(0);
      }
    );

    // 3) Check for ship to projectile collisions
    scene.physics.add.overlap(
      ships,
      projectileMananger.getProjectiles(),
      function (hitShip, hitProj, body1, body2) {
        if (hitShip != hitProj.owner) {
          hitShip.dealDamage(hitProj.damage);
          hitProj.disable();
        }
      }
    );

    // 4) Finally, check for projectile to static collisions.
    scene.physics.add.overlap(
      statics,
      projectileMananger.getProjectiles(),
      function (hitStatic, hitProj, body1, body2) {
        hitProj.disable();
      }
    );
  }
}
