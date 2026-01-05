class PlasmaCannon extends ShipSystem {
  constructor(scene, parent) {
    super(scene, parent, 100, 5);

    this.pm = scene.getProjectileManager();
  }

  onActivate() {
    console.log("Plasma Cannon Fired!");

    let projData = {
      spriteName: "pew",
      speed: 1200,
      range: 300,
      refireDelay: 2,
      shootSound: this.mg,
      damageValue: 2,
      energyCost: 3,
    };
    this.pm.shoot(this.parent, projData);
  }
}
