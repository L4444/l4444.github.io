class PlayerInput extends Phaser.GameObjects.GameObject
{
    #cameraPos =  { x: 0, y: 0};
    #cursorPos = { x: 0, y: 0};
    #player = null;
    #targetAngle = 0;


    constructor(scene, player)
    {
        super(scene);
        scene.add.existing(this);

        
        
        this.#player = player;


    }

    get cameraPos()
    {
        return this.#cameraPos;
    }

    get cursorPos()
    {
        return this.#cursorPos;
    }

    get targetAngle()
    {
        return this.#targetAngle;
    }

    preUpdate(time, delta)
    {
        
        // Basic controls, BIG thrust is the engine that player directly controls
            if (this.scene.keys.D.isDown) { this.#player.right(); }
            if (this.scene.keys.A.isDown) { this.#player.left(); }

            if (this.scene.keys.W.isDown) { this.#player.forward(); }
            if (this.scene.keys.S.isDown) { this.#player.back(); }

            if (game.input.mousePointer.buttons == 1) { this.#player.shoot(); }

            this.cursorPos.x = game.input.mousePointer.x;
            this.cursorPos.y = game.input.mousePointer.y;




            /// Make the player face the mouse pointer.
            /// Chat gpt helped me with this, 
            // Get the mouse position and convert it to worldCoordinates
            let pointer = this.scene.input.activePointer;
            let worldCursor = pointer.positionToCamera(this.scene.cameras.main);

            this.#targetAngle = Phaser.Math.Angle.Between(this.#player.x, this.#player.y, worldCursor.x, worldCursor.y);

            // Turn to face the targetAngle
            let turnSpeed = 0.02;
            this.#player.rotation = Phaser.Math.Angle.RotateTo(this.#player.rotation, this.#targetAngle, turnSpeed);

            // The camera target is where the camera should be, taking into account the cursor
            let cameraTarget = {};
            cameraTarget.x = this.#player.x - (this.scene.scale.width  ) + this.#cursorPos.x;
            cameraTarget.y = this.#player.y - (this.scene.scale.height ) + this.#cursorPos.y;

            // move the actual camera focus to the target vector, very smoothly 
            this.#cameraPos.x -= (this.#cameraPos.x - cameraTarget.x) / 20;
            this.#cameraPos.y -= (this.#cameraPos.y - cameraTarget.y) / 20;


            
    }
}