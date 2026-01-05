class PlasmaCannon extends ShipSystem {
  constructor(scene, parent) {
    super(scene, parent, "PlasmaCannon", 0.1, 10);

    this.pm = scene.getProjectileManager();
  }

  onActivate() {
    let projData = {
      spriteName: "PlasmaCannon",
      speed: 600,
      range: 300,

      damageValue: 10,
      energyCost: 33,
    };

    this.pm.shoot(this.parent, projData);
  }
}
