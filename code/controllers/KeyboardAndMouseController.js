class KeyboardAndMouseController 
{
    


    constructor(scene)
    {
        this.scene = scene;

        

        this.cameraPos =  { x: 0, y: 0};
        this.cursorPos = { x: 0, y: 0};
    
        this.targetAngle = 0;

        // Yes, phaser does not allow me to simply addKeys('shift'), I have to add each one in a dictionary
        // If I don't "capture", the F1 key it triggers on the browser
        this.keys = scene.input.keyboard.addKeys({
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'S': Phaser.Input.Keyboard.KeyCodes.S,
            'A': Phaser.Input.Keyboard.KeyCodes.A,
            'D': Phaser.Input.Keyboard.KeyCodes.D,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'SHIFT': Phaser.Input.Keyboard.KeyCodes.SHIFT,
            'F1': Phaser.Input.Keyboard.KeyCodes.F1
        });
    

    }

  

    update(myShip)
    {
        
            
            if (this.keys.SPACE.isDown) { myShip.brake(); }
            if (this.keys.SHIFT.isDown) { myShip.boost(); }

          
            // Basic controls
            if (this.keys.D.isDown) { myShip.right(); }
            if (this.keys.A.isDown) { myShip.left(); }

            if (this.keys.W.isDown) { myShip.forward(); }
            if (this.keys.S.isDown) { myShip.back(); }

            
               

            let mb = this.scene.game.input.mousePointer.buttons;
            // Left click, fire weapon 1
            if (mb == 1 || mb == 3) { myShip.shoot(0); }

            // Right click, fire weapon 2
            if (mb == 2 || mb == 3) { myShip.shoot(1); }


            this.cursorPos.x = this.scene.game.input.mousePointer.x;
            this.cursorPos.y = this.scene.game.input.mousePointer.y;



            /// Make the ship face the mouse pointer.
            /// Chat gpt helped me with this, 
            // Get the mouse position and convert it to worldCoordinates
            let pointer = this.scene.input.activePointer;
            let worldCursor = pointer.positionToCamera(this.scene.cameras.main);

            this.targetAngle = Phaser.Math.Angle.Between(myShip.x, myShip.y, worldCursor.x, worldCursor.y);
            

            // Tell the ship what angle they should face
            myShip.rotateTo(this.targetAngle + Math.PI /2);
            
            

            // The camera target is where the camera should be, taking into account the cursor
            let cameraTarget = {};
            cameraTarget.x = myShip.x - (this.scene.scale.width  ) + this.cursorPos.x;
            cameraTarget.y = myShip.y - (this.scene.scale.height ) + this.cursorPos.y;

            // move the actual camera focus to the target vector, very smoothly 
            this.cameraPos.x -= (this.cameraPos.x - cameraTarget.x) / 20;
            this.cameraPos.y -= (this.cameraPos.y - cameraTarget.y) / 20;


            
    }
}