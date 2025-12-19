class PlayerInput extends Phaser.GameObjects.GameObject
{
    constructor(scene, player)
    {
        super(scene);
        scene.add.existing(this);

        this._cameraPos = { x: 0, y: 0};
        this._cursorPos = { x: 0, y: 0};
        this._player = player;

    }

    getCameraPos()
    {
        return this._cameraPos;
    }

    getCursorPos()
    {
        return this._cursorPos;
    }

    preUpdate(time, delta)
    {
        
        // Basic controls, BIG thrust is the engine that player directly controls
            if (this.scene.keys.D.isDown) { this._player.right(); }
            if (this.scene.keys.A.isDown) { this._player.left(); }

            if (this.scene.keys.W.isDown) { this._player.forward(); }
            if (this.scene.keys.S.isDown) { this._player.back(); }

            if (game.input.mousePointer.buttons == 1) { this._player.shoot(); }

            this._cursorPos.x = game.input.mousePointer.x;
            this._cursorPos.y = game.input.mousePointer.y;




            /// Make the player face the mouse pointer.
            /// Chat gpt helped me with this, 
            // Get the mouse position and convert it to worldCoordinates
            let pointer = this.scene.input.activePointer;
            let worldCursor = pointer.positionToCamera(this.scene.cameras.main);

            let targetAngle = Phaser.Math.Angle.Between(this._player.x, this._player.y, worldCursor.x, worldCursor.y);

            // Turn to face the targetAngle
            let turnSpeed = 0.02;
            this._player.rotation = Phaser.Math.Angle.RotateTo(this._player.rotation, targetAngle, turnSpeed);

            // The camera target is where the camera should be, taking into account the cursor
            let cameraTarget = {};
            cameraTarget.x = this._player.x - (this.scene.scale.width  ) + this._cursorPos.x;
            cameraTarget.y = this._player.y - (this.scene.scale.height ) + this._cursorPos.y;

            // move the actual camera focus to the target vector, very smoothly 
            this._cameraPos.x -= (this._cameraPos.x - cameraTarget.x) / 20;
            this._cameraPos.y -= (this._cameraPos.y - cameraTarget.y) / 20;


            
    }
}