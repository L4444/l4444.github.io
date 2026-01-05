class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.nextProjectile = 0;

    for (var i = 0; i < 100; i++) {
      this.projectiles[i] = new Projectile(this.scene);
    }
  }

  getProjectiles() {
    return this.projectiles;
  }

  shoot(parent, projectileData) {
    this.projectiles[this.nextProjectile].fire(parent, projectileData);

    if (this.nextProjectile < this.projectiles.length - 1) {
      this.nextProjectile++;
    } else {
      this.nextProjectile = 0;
    }
  }
}
