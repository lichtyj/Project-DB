class Weapon extends Entity {
    constructor(position) {
        super(position);
        this.lastFacing = new Vector();
        this.facing = new Vector();
        this.target = new Vector();
        this.barrel = new Vector(8, 0, 3);
        this.grip = new Vector(8, -2, 0);
        this.gun;
        this.damage = 0;
        this.spread = 0;

        this.state = "ready";
        this.stateTimer = 0;
        this.charge = 0;
        this.chargeMax = 0;
        this.chargeRate = 0;
        this.chargeP;
        this.action;
    }

    preset(gun) {
        this.sprite = assetMgr.getSprite(gun);
        this.gun = gun;
        switch(gun) {
            case "railgun":
                this.action = "reload";
                this.barrel = new Vector(8, 0, 3);
                this.grip = new Vector(8, -2, 0);
                this.damage = 100;
                this.spread = 3;
                this.chargeRate = 0;
                this.chargeMax = 0;
                break;
            case "laserPistol":
                this.action = "semi";
                this.barrel = new Vector(3, 0, 1);
                this.grip = new Vector(3, 0, 0);
                this.damage = 25;
                this.spread = 1;
                this.chargeRate = 0;
                this.chargeMax = 0;
                break;
            case "flamethrower":
                this.action = "auto";
                this.barrel = new Vector(8, 0, 5);
                this.grip = new Vector(8, -3, 0);
                this.damage = 1;
                this.spread = 1;
                this.chargeRate = 0;
                this.chargeMax = 0;
                break;
            case "plasmaPistol":
                this.action = "charged";
                this.barrel = new Vector(12, 0, 5);
                this.grip = new Vector(6, -3, 0);
                this.damage = 0;
                this.spread = 5;
                this.chargeRate = .5;
                this.chargeMax = 20;
                break;
        }
    }

    update(dt) {
        if (this.state != "ready") {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.updateState();
            }
            if (this.state == "charging") {
                this.charge += this.chargeRate;
                if (this.charge > this.chargeMax) this.charge = this.chargeMax;
                this.chargeP.rate = this.charge;
                this.chargeP.time += 10;
                this.chargeP.position.set(this.getBarrelPos());
            }
        }
    }

    updateState() {
        switch(this.state) {
            case "firing": {
                if (this.action == "auto" || this.action == "charged" || this.action == "reload") {
                    this.state = "ready";
                }
            }
        }
    }

    getBarrelPos() {
        var tempPos2 = this.position.clone();
        tempPos2.subtract(this.grip);
        tempPos2.x += 8; // TODO fix this
        return tempPos2.offset(this.facing, this.barrel).clone();
    }

    shoot() {
        var temp = this.facing.clone().limit(1);
        temp.mult(15);
        temp.x += Math.random()*this.spread-this.spread/2;
        temp.y += Math.random()*this.spread-this.spread/2;

        var shot = new Projectile(this.position.clone().offset(this.facing, this.barrel), new Vector(temp.x, temp.y, 0));
        shot.damage = this.damage + this.charge;
        var p = new Particles(this.getBarrelPos(), new Vector(temp.x, temp.y, 0));
        p.damage = this.damage/10;
        switch(this.gun) {
            case "railgun":
                this.stateTimer = 20;
                shot.velocity.mult(.5);
                shot.velocity.z *= 6;
                shot.color = "#03b3ff";
                shot.gravity = 0.125;
                shot.size = 4;
                shot.type = "energy";
                p.velocity.mult(.5);
                p.velocity.z *= 6;
                p.rate = 40;
                p.force = .25;
                p.count = 40;
                p.hue = 140;
                p.mode = "screen";
                p.timeP = 2;
                p.init();
                break;
            case "laserPistol":
                shot.color = "#F00";
                shot.size = 0;
                shot.type = "laser"
                p.rate = 2;
                p.force = .25;
                p.count = 0;
                p.hue = 0;
                p.mode = "normal";
                p.time = 10;
                p.timeP = 2;
                p.init();
                break;
            case "flamethrower":
                shot.color = "#FFF";
                shot.size = -1;
                shot.type = "fire";
                shot.gravity = .5;
                shot.impact = false;
                p.preset("fire");
                p.force = .25;
                p.forceT = 3;
                p.rate = 40;
                p.time = 4;
                p.gravity = -0.01;
                p.timeP = 2;
                var angV = this.facing.clone();
                angV.subtract(this.lastFacing);
                angV.div(3);
                p.velocity.mult(Math.random()*.25 + .75)
                p.acceleration.subtract(angV.mult(Math.random()));
                p.init();
                break;
            case "plasmaPistol": 
                shot.color = "#0F0";
                shot.size = -1;
                shot.type = "plasma";
                shot.velocity.div(3);
                shot.gravity = .04;
                this.chargeP.velocity = new Vector(temp.x/2, temp.y/2, 0);
                this.chargeP.elapsed = 0;
                this.chargeP.time = 20;
                this.chargeP.timeP = 5;
                this.chargeP.rate *= 6;
                this.chargeP.force = .1;
                this.chargeP.forceT = 2;
                this.chargeP.gravity = .0125;
                this.chargeP = null;
                break;
        }

        game.addEntity(shot);
    }

    triggerPressed() {
        switch(this.state) {
            case "ready":
                if (this.action != "charged") {
                    this.shoot();
                    this.state = "firing";
                } else {
                    this.state = "charging";
                    this.chargeP = new Particles(this.getBarrelPos(), new Vector(this.velocity.x, this.velocity.y, 0));
                    this.chargeP.preset("plasma");
                    this.chargeP.gravity = 0;
                    this.chargeP.init();
                } 
                break;
            default:
                break;
        }
    }

    triggerReleased() {
        switch(this.state) {
            case "firing":
                if (this.action == "semi") {
                    this.state = "ready";
                }
                break;
            case "charging":
                this.shoot();
                this.state = "firing";
                this.charge = 0;
                break;
        }
    }

    carry(hand, facing) {
        this.position.set(hand.offset(this.facing, this.grip));
        this.lastFacing.set(this.facing);
        this.facing.set(facing);
    }

    draw(ctx, dt) {
        this.elapsedTime += dt;
        if (this.sprite instanceof Sprite3D) {
            var b = this.velocity.magnitude();
            this.bounce += b/6;
            this.bounce %= Math.PI*2;
            if (b < 0.1) {
                if (this.bounce > Math.PI) {
                    this.bounce *= 1.05;
                } else {
                    this.bounce /= 1.05;
                }
            }
            this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y - this.position.z, 0/*this.position.z*/, this.facing.angle(), this.bounce, 8);   
        } else { 
            this.sprite.drawSubImage(0, ctx, this.position.x, this.position.y, this.facing.angle());       
        }
    }

    save() {
        return JSON.stringify({position:this.position, direction:this.direction, rotation:this.rotation, 
            lastFacing:this.lastFacing, facing:this.facing, target:this.target, gun:this.gun, 
            state:this.state, stateTimer:this.stateTimer});
    }

    static load(data) {
        data = JSON.parse(data);
        var obj = new Weapon(Vector.create(data.position));
        obj.direction = Vector.create(data.direction);
        obj.rotation = data.rotation;
        obj.lastFacing = Vector.create(data.lastFacing);
        obj.facing = Vector.create(data.facing);
        obj.target = data.target;
        obj.gun = data.gun;
        obj.state = data.state;
        obj.stateTimer = data.stateTimer;
        obj.preset(data.gun);
        game.addEntity(obj);
        return obj;
    }
}