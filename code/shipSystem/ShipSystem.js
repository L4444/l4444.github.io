class ShipSystem extends Phaser.GameObjects.GameObject {
  constructor(scene, parent, soundName, soundVolume, cooldownDuration) {
    super(scene);

    // Manually add this to scene and physics (contructor doesn't do this for us)
    scene.add.existing(this);

    this.cooldownDuration = cooldownDuration;
    this.cooldownRemaining = 0;

    this.parent = parent;
    this.useSound = scene.sound.add(soundName, { loop: false });
    this.useSound.volume = soundVolume;
  }

  // This function will be called outside the class
  use() {
    if (this.cooldownRemaining == 0) {
      this.cooldownRemaining = this.cooldownDuration;

      this.useSound.play();
      this.onActivate();
    } else {
      if (this.cooldownDuration > 10) {
        console.log(
          "On cooldown " + this.cooldownRemaining + " ticks remaining"
        );
      }
    }
  }

  getCooldown() {
    return this.cooldownRemaining;
  }

  // This function should be overrided in the child class
  onActivate() {
    throw new Error(
      "You need to implement your own onActivate() function when you extend this class"
    );
  }

  // This function should be overrided in the child class
  onHit() {
    throw new Error(
      "You need to implement your own onHit() function when you extend this class"
    );
  }

  preUpdate(time, delta) {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining--;
    }
  }
}
