var config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            x: 0,
            y: 0,
            width: 900,
            height: 900,
            debug: true // Show the wireframes and velocity 
        }
    },
    scene: GameScene
};

const state = {
    Menu: 'Menu',
    Gameplay: 'Gameplay'
}


var game = new Phaser.Game(config);

