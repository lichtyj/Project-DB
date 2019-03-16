class Entity {
    constructor(position, sprite) {
        this.position = position;
        this.velocity = new Vector();
        this.direction = new Vector();
        this.acceleration = new Vector();
        this.sprite = sprite;
        this.rotation = 0;
        this.gravity = .125;
        this.bounce = 0;
        this.elapsedTime = 0;
        this.healthBar = assetMgr.getAsset("particle");
    }

    static create(position, sprite) {
        var obj = new Entity(position, sprite);
        game.addEntity(obj);
        return obj;
    }

    update() {
        this.position.add(this.velocity);
        this.acceleration.limit(this.sprint);
        this.acceleration.z -= this.gravity;
        this.velocity.add(this.acceleration);
        var grav = this.velocity.z;
        this.velocity.limit(this.topSpeed);
        this.velocity.z = grav;
        this.velocity.mult(.95);
        this.acceleration.mult(0);

        if (this.position.x < 0) this.position.x += game.bounds.x;
        if (this.position.y < 0) this.position.y += game.bounds.y;
        if (this.position.z < 0) this.position.z = 0;
        if (this.position.x > game.bounds.x) this.position.x -= game.bounds.x;
        if (this.position.y > game.bounds.y) this.position.y -= game.bounds.y;

    }

    draw(ctx, dt, shadow) {
        this.elapsedTime += dt;
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
        var facing;
        if (this.facing == undefined) {
            facing = this.velocity.angle();
        } else {
            facing = this.facing.angle();
        }
        this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y, this.position.z, facing, this.bounce, 8, shadow);
    }

    drawHealth(ctx) {
        ctx.setTransform(1,0,0,1,0,0);
        if (this.health < this.maxhealth) {
            ctx.drawImage(this.healthBar, 0,
                128, 1, 1,
                this.position.x + 5 - (1-this.health/this.maxhealth)*10 - game.view.x, 
                this.position.y + 8 - game.view.y,
                (1-this.health/this.maxhealth)*10, 2);
            ctx.drawImage(this.healthBar, 80,
                128, 1, 1,
                this.position.x - 5 - game.view.x, 
                this.position.y + 8 - game.view.y,
                (this.health/this.maxhealth)*10, 2);
        }
    }
}

// Entity.prototype.draw = function (ctx, dt) {
//     this.elapsedTime += dt;
//     if (this.sprite instanceof Sprite3D) {
//         this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y, 0/*this.position.z*/, this.direction,0);   
//     } else { 
//         this.sprite.drawSubImage(0, ctx, this.position.x, this.position.y, this.direction);       
//     }
//     //this.sprite.drawFrame(ctx, dt, this.position.x, this.position.y);
// }