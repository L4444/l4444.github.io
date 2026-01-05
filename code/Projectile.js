class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    // pass in a "dummy sprite" when they are created, later on the texture gets set
    super(scene, 999, 999, "red");

    // Manually add this to scene and physics (contructor doesn't do this for us)
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // The projectiles should be under the ship but over the background layer.
    this.setDepth(SpriteLayer.PROJECTILES);

    // Start disabled, ready to fire
    this.disable();

    this.scene = scene;

    // Technically you don't need to intialise variables in JS, but I like to do that for sanity reasons.
    this.currentLifetime = 0;
    this.totalLifetime = 0;
  }
  preUpdate(time, delta) {
    this.currentLifetime--;

    // The fading code I pulled out of copilot.
    // These values "look the best". Don't touch for now.
    const fadeStart = 0.3; // fade during last 10% of life
    const t = this.currentLifetime / this.totalLifetime; // goes 1 → 0

    if (t > fadeStart) {
      // Not in fade window yet → stay fully visible
      this.alpha = 1;
    } else {
      // Normalize t inside the fade window (1 → 0)
      const x = t / fadeStart;

      // Exponential fade
      this.alpha = Math.exp((x - 1) * 2);
    }

    if (this.currentLifetime <= 0) {
      this.disable();
    }
  }

  disable() {
    // Move them "way off screen" before you disable them, otherwise when
    // wireframe physics (debug) is on, it will leave the pink/purple hitbox still on the screen.
    // it won't do anything it will just look ugly when debugging
    this.body.x = -9999;
    this.body.y = -9999;
    this.disableBody(true, true);
  }

  fire(parent, projectileData) {
    this.enableBody(true, parent.x, parent.y, true, true);
    this.setTexture(projectileData.spriteName);
    this.setCircle(this.width / 4, this.width / 4, this.width / 4);

    // The lifetime should be determined by the "range", faster projectiles have less lifetime
    // Multiply by 50 to get the rough distance
    this.totalLifetime = (projectileData.range / projectileData.speed) * 50;
    this.currentLifetime = this.totalLifetime;

    // Use vectors to set the path of the projectile, use the X axis to align with the player ship.
    let v = new Phaser.Math.Vector2(0, -projectileData.speed);
    v.rotate(parent.rotation);

    this.setVelocity(
      v.x + parent.body.velocity.x,
      v.y + parent.body.velocity.y
    );

    this.damage = projectileData.damageValue;

    this.rotation = parent.rotation;
    // Assign the projectile's "owner" so ships can't damage themselves
    this.owner = parent;
  }
}
