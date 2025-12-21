class DebugText extends Phaser.GameObjects.Text {
 


    

    constructor(scene, x,y, testVars) {

        super(scene, x,y, 'This is debugtext');
        scene.add.existing(this);
        this.setScrollFactor(0);

        this.scene = scene;

 
        this.infoType = 1;
        this.testVars = [];

    }

    switchInfoType()
    {
        this.infoType++;

        if(this.infoType >= this.testVars.length)
        {
            this.infoType = 0;
        }
        

    }

     preUpdate(time,delta) {
                    

       this.testVars[0] = {
                        "-----------Controls-----------": "-",
                        "W,S,A,D for movement": "-",
                        "Left click for shoot" : "-",
                        "Spacebar for Boost" : "-",
                        "1 for menu music" : "-",
                        "2 for battle music" : "-",
                        "3 for stealth music": "-",
                        "4 for boss music": "-",
                        "(LEFT / RIGHT) THRUST SPEED": this.scene.player.THRUST_SPEED,
                        "(UP / DOWN) MAX SPEED" : this.scene.player.MAX_SPEED,
                        "(Q / E) TURN SPEED FACTOR" : this.scene.player.TURN_SPEED_FACTOR,
                    };
        
        this.testVars[1] = {
                        "-----------DEBUG-----------": "-",
                        "Player X" : this.scene.player.x,
                        "Player Y" : this.scene.player.y,
                        "Player Thruster X" : this.scene.player.tX,
                        "Player Thruster Y" : this.scene.player.tY,
                        "Target Angle" : this.scene.player.controller.targetAngle,
                        "Player Angle" : this.scene.player.rotation,
                        "Player Velocity X" : this.scene.player.body.velocity.x,
                        "Player Velocity Y" : this.scene.player.body.velocity.y,
                        "Mouse Buttons" : this.scene.game.input.mousePointer.buttons,
                        "Cursor X (Screen)" : this.scene.player.controller.cursorPos.x, 
                        "Cursor Y (Screen)" : this.scene.player.controller.cursorPos.y 

                    };

                            
        this.testVars[2] = {
                        "": "-"
                     
                        };

                    let debugs = "";

                    for(const [key, value] of  Object.entries(this.testVars[this.infoType]))
                    {
                        // "-" here stands for no "value"
                        if(value != "-")
                        {
                        debugs += key + ": " + value + "\n";
                        }
                        else
                        {
                            debugs += key + "\n";
                        }
                        
                    }

                    

                    this.setText( debugs);

     }

}