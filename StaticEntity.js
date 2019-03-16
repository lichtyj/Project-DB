class StaticEntity extends Entity {
    constructor(position, type, rotation) {
        super(position, assetMgr.getSprite(type));
        this.rotation = rotation;
        this.elapsedTime = 0;
        this.type = type;
    }

    static create(position, type, rotation) {
        var obj = new StaticEntity(position, type, rotation);
        game.addEntity(obj);
        return obj;
    }
    
    takeDamage(other) {
        var vel = Vector.up().mult(3);
        vel.average(other.velocity.clone(), 2);
        vel.mult(2);
        if (other.type != undefined) {
            p = new Particles(this.position.clone(), vel);
            p.preset(other.type);
            p.count *= 2;
            p.force *= 4;
            p.glow = true;
            p.resistanceP = 1.1;
            p.init();
        }
        var p = new Particles(this.position.clone(), vel);
        switch(this.type) {
            case "rock":
                if (other.damage >= 100) {
                    var item;
                    for (var i = 0; i < Math.random()*3; i++) {
                        item = new Resource(this.position.clone(), "metal", Math.random()*Math.PI*2);
                        item.velocity = Vector.random(1);
                        item.velocity.z = -Math.random()*2;
                        game.addEntity(item);
                    }
                    p.preset("collect");
                    p.count *= 3;
                    p.force *= 10;
                    p.hue = 256;
                    p.glow = true;
                    p.shadow = true;
                    p.resistanceP = 1.1;
                    game.remove(this);
                }
                break;
            case "tree":
                if (other.damage >= 100) {
                    p.preset("ground");
                    p.count *= 5;
                    p.rate *= 5;
                    p.force *= 2;
                    p.glow = true;
                    p.shadow = true;
                    p.resistanceP = 1.1;
                    game.remove(this);   
                }
                break;
            case "tree2":
                if (other.damage >= 100) {
                    p.preset("ground");
                    p.count *= 5;
                    p.rate *= 5;
                    p.force *= 2;
                    p.glow = true;
                    p.shadow = true;
                    p.resistanceP = 1.1;
                    game.remove(this);   
                }
                break;
            case "bush":
                if (other.damage > 50) {
                    p.preset("ground");
                    p.count *= 2;
                    p.rate *= 2;
                    p.glow = true;
                    p.shadow = true;
                    p.resistanceP = 1.1;
                    game.remove(this);   
                }
                break;
        }
        p.init();
    }



    draw(ctx, dt) {
        //TODO bake this?
        this.elapsedTime += dt;
        if (this.sprite instanceof Sprite3D) {
            this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y, 0/*this.position.z*/, this.rotation, 0.25, true);   
        }
    }


    save() {
        return JSON.stringify({position:this.position, type:this.type, 
            rotation:this.rotation});
    }

    static load(data) {
        data = JSON.parse(data);
        return StaticEntity.create(Vector.create(data.position), data.type, data.rotation);
    }
}