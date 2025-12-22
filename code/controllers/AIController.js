class AIController 
    {


    constructor(scene)
    {
        
        

    }

    update(p)
    {

        let targetAngle = Phaser.Math.Angle.Between(p.x, p.y, Ship.playerShip.x, Ship.playerShip.y);

        if(Phaser.Math.Distance.Between(p.x, p.y, Ship.playerShip.x, Ship.playerShip.y) > 300)
        {
             p.forward();
            

        }
        else
        {
            p.brake();
            
        }

        if(Phaser.Math.Distance.Between(p.x, p.y, Ship.playerShip.x, Ship.playerShip.y) < 500)
        {
            p.shoot();
        }
       
       
        p.rotateTo(targetAngle);



    }

}