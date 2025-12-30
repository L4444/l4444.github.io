class AIController 
    {


    constructor(scene)
    {
        
        this.scene = scene;        

    }

    update(p)
    {
        // isActive disables AI (for testing)
        if(!p.isActive) { return; }

        let targetAngle = Phaser.Math.Angle.Between(p.x, p.y, this.scene.getPlayer().x, this.scene.getPlayer().y);

        if(Phaser.Math.Distance.Between(p.x, p.y, this.scene.getPlayer().x, this.scene.getPlayer().y) > 300)
        {
             p.forward();
            

        }
        else
        {
            p.brake();
            
        }

        if(Phaser.Math.Distance.Between(p.x, p.y, this.scene.getPlayer().x, this.scene.getPlayer().y) < 500)
        {
            p.shoot();
        }
       
       
        p.rotateTo(targetAngle);



    }

}