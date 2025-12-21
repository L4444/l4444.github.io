class KeyboardAndMouseController 
{
    


    constructor(scene)
    {
        this.scene = scene;

        

        this.cameraPos =  { x: 0, y: 0};
        this.cursorPos = { x: 0, y: 0};
    
        this.targetAngle = 0;
    }

  

    update(myShip)
    {
        
            
            if (this.scene.keys.SPACE.isDown) { myShip.boost(); }

          
            // Basic controls
            if (this.scene.keys.D.isDown) { myShip.right(); }
            if (this.scene.keys.A.isDown) { myShip.left(); }

            if (this.scene.keys.W.isDown) { myShip.forward(); }
            if (this.scene.keys.S.isDown) { myShip.back(); }

            
               

            if (this.scene.game.input.mousePointer.buttons == 1) { myShip.shoot(); }

            this.cursorPos.x = this.scene.game.input.mousePointer.x;
            this.cursorPos.y = this.scene.game.input.mousePointer.y;



            /// Make the ship face the mouse pointer.
            /// Chat gpt helped me with this, 
            // Get the mouse position and convert it to worldCoordinates
            let pointer = this.scene.input.activePointer;
            let worldCursor = pointer.positionToCamera(this.scene.cameras.main);

            this.targetAngle = Phaser.Math.Angle.Between(myShip.x, myShip.y, worldCursor.x, worldCursor.y);
            

            // Tell the ship what angle they should face
            myShip.rotateTo(this.targetAngle);
            
            

            // The camera target is where the camera should be, taking into account the cursor
            let cameraTarget = {};
            cameraTarget.x = myShip.x - (this.scene.scale.width  ) + this.cursorPos.x;
            cameraTarget.y = myShip.y - (this.scene.scale.height ) + this.cursorPos.y;

            // move the actual camera focus to the target vector, very smoothly 
            this.cameraPos.x -= (this.cameraPos.x - cameraTarget.x) / 20;
            this.cameraPos.y -= (this.cameraPos.y - cameraTarget.y) / 20;


            
    }
}