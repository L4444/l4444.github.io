class ShipSystem extends Phaser.GameObjects.GameObject {
  constructor(scene, parent, cooldownDuration, reuseDelay) {
    super(scene);

    // Manually add this to scene and physics (contructor doesn't do this for us)
    scene.add.existing(this);

    this.cooldownDuration = cooldownDuration;
    this.cooldownRemaining = 0;

    this.parent = parent;
  }

  // This function will be called outside the class
  use() {
    if (this.cooldownRemaining == 0) {
      this.cooldownRemaining = this.cooldownDuration;
      this.onActivate();
    } else {
      console.log("On cooldown " + this.cooldownRemaining + " ticks remaining");
    }
  }

  // This function will
  onActivate() {
    throw new Error(
      "You need to implement your own onActivate() function when you extend this class"
    );
  }

  preUpdate(time, delta) {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining--;
    }
  }
}
