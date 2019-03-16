class Projectile extends Entity {
    constructor(position, velocity) {
        super(position);
        this.acceleration = new Vector();
        this.color = "#333";
        this.velocity = velocity;
        this.type = "";
        this.size = 2;
        this.damage = 1;
        this.impact = true;
        this.timer = 20;
        this.spread = .5;
    }

    hit(mode, other) {
        var tempPos = this.position.clone();
        if (other != undefined) {
            tempPos.average(other, 2);
        }
        if (this.impact) {
            var that = this;
            mode.forEach( function(i) {
                var p = new Particles(tempPos, new Vector(that.velocity.x, that.velocity.y, -that.velocity.z));
                switch (i) {
                    case "blood":
                        p.velocity.div(3);
                        // p.velocity.z *= .125;
                        p.preset("blood");
                        break;
                    case "feathers":
                        p.velocity.div(2);
                        p.velocity.z *= 2;
                        p.preset("feathers");
                        break;
                    case "fire":
                        p.velocity.div(10);
                        p.velocity.z *= 2;
                        p.preset("fire");
                        break;
                    case "energy":
                        p.velocity.div(3);
                        p.velocity.z *= 10;
                        p.preset("energy");
                        break;
                    case "laser":
                        p.preset("laser");
                        break;
                    default:
                        p.velocity.div(2);
                        p.velocity.z *= 5;
                        p.preset("ground");
                        break;
                }
                p.init();
            });
    
        }
        game.remove(this);
    }

    checkCollisions() {
        return game.tree.retrieveCone(this.position.x, this.position.y, this.velocity.magnitude()*2, this.velocity.x, this.velocity.y, Math.PI*2);
    }

    checkHit(hit) {
        for (var h of hit) {
            if (h.takeDamage != undefined && !(h instanceof Player)) {
                h.takeDamage(this);
                if (!(h instanceof Resource)) game.remove(this);
            }
        }
    }

    update(dt) {
        super.update();
        var hit = this.checkCollisions();
        this.checkHit(hit);

        this.elapsedTime += dt;
        this.timer--;
        if (this.timer <= 0) {
            game.remove(this);
        }

        if (this.position.z <= 0) {
            if (this.size >= 0) {
                this.hit([this.type, "ground"]);
            } else {
                game.remove(this);
            }
        }
    }

    draw(ctx) {
        if (this.size >= 0) {
            ctx.globalAlpha = 1;
            ctx.setTransform(1,0,0,1,0,0);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.position.z/32+this.size;
            ctx.beginPath();
            ctx.moveTo(this.position.x - this.velocity.x*this.position.z/6 - game.view.x, this.position.y - this.velocity.y*this.position.z/6 - this.position.z - game.view.y);
            ctx.lineTo(this.position.x - game.view.x, this.position.y-this.position.z - game.view.y);
            ctx.stroke();


            ctx.globalAlpha = .75;
            ctx.strokeStyle = "#333";
            ctx.lineWidth = this.position.z/12;
            ctx.beginPath();
            ctx.moveTo(this.position.x - this.velocity.x - game.view.x, this.position.y - this.velocity.y - game.view.y);
            ctx.lineTo(this.position.x - game.view.x, this.position.y - game.view.y);
            ctx.stroke();
        }
    }

}