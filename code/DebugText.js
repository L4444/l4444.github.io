class DebugText extends Phaser.GameObjects.Text {
 


    

    constructor(scene, x,y, testVars) {

        super(scene, x,y, 'This is debugtext');
        scene.add.existing(this);
        this.setScrollFactor(0);
        this.setDepth(SpriteLayer.UI);  

        this.scene = scene;

 
        this.infoType = 0;
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
                        "Left click to shoot machine gun" : "-",
                        "Right click to fire blaster" : "-",
                        "Shift for Boost" : "-",
                        "Spacebar for Brake" : "-",
                        "1 for menu music" : "-",
                        "2 for battle music" : "-",
                        "3 for stealth music": "-",
                        "4 for boss music": "-",
                        "(LEFT / RIGHT) THRUST SPEED": this.scene.getPlayer().THRUST_SPEED,
                        "(UP / DOWN) MAX SPEED" : this.scene.getPlayer().MAX_SPEED,
                        "(Q / E) TURN SPEED FACTOR" : this.scene.getPlayer().TURN_SPEED_FACTOR,
                        "G to show/hide physics bodies" : "-",
                        "F to enable/disable enemy AI" : "-"
                    };
        
        this.testVars[1] = {
                        "-----------DEBUG-----------": "-",
                        "Player X" : this.scene.getPlayer().x,
                        "Player Y" : this.scene.getPlayer().y,
                        "Player Thruster X" : this.scene.getPlayer().tX,
                        "Player Thruster Y" : this.scene.getPlayer().tY,
                        "Target Angle" : this.scene.getPlayer().controller.targetAngle,
                        "Player Angle" : this.scene.getPlayer().rotation,
                        "Player Velocity X" : this.scene.getPlayer().body.velocity.x,
                        "Player Velocity Y" : this.scene.getPlayer().body.velocity.y,
                        "Mouse Buttons" : this.scene.game.input.mousePointer.buttons,
                        "Cursor X (Screen)" : this.scene.getPlayer().controller.cursorPos.x, 
                        "Cursor Y (Screen)" : this.scene.getPlayer().controller.cursorPos.y,
                        "Player Boost" : this.scene.getPlayer().isBoost,
                        "Player Brake" : this.scene.getPlayer().isBrake,
                        "Enemy AI Active?" : this.scene.ships[1].isActive 
                    

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