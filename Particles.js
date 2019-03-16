class Particles extends Entity{
    constructor(position, velocity) {
        super(position);
        this.velocity = velocity;
        this.acceleration = new Vector();
        this.elapsed = 0;
        this.particles = [];
        this.sprite;
        this.maxV = velocity.magnitude();

        this.force = 0;
        this.forceT = 0; // Force change over life
        this.time = 1; // Emitter life
        this.timeP = 1; // Particle max life
        this.count = 10; // Initial burst
        this.rate = 0; // Particles per tick * % of life left
        
        this.hue = 0;
        this.hueR = 0; // Random
        this.hueV = 0; // hue + (V / maxV) * hueV
        this.hueT = 0; // End of life hue

        this.bright = 128;
        this.brightR = 0; // Random 
        this.brightV = 0; // brightness + (V / maxV) * brightV
        this.brightT = 0; // End of life brightness

        this.glow = false;
        this.shadow = false;
        this.alpha = 1;

        this.mode = "normal";
        this.gravity = 0;
        this.damage = 0;
        this.resistance = 1.1;
        this.resistanceP = 1.1;
    }

    init() {
        if (this.velocity.z < 0) {
            this.velocity.z *= -1;
        }
        this.sprite = assetMgr.getAsset("particle");
        this.addParticles(this.count);
        game.addEntity(this);
    }

    addParticles(amount) {
        for (var i = 0; i < amount; i++) {
            this.particles.push( { "position":this.position.clone(), 
                "velocity":this.velocity.clone().mult(Math.random()).add(Vector.random(this.force + this.forceT*(Math.pow(this.elapsed/this.time, 2)))),
                "acceleration":Vector.random(this.force + this.forceT*(Math.pow(this.elapsed/this.time, 2))), 
                "time":this.timeP*Math.random(),
                "hue":(this.hue+Math.random()*this.hueR),
                "bright":(this.bright+Math.random()*this.brightR)} );
        }
    }

    preset(preset) {
        switch(preset) {
            case "blood":
                this.force = 1;
                this.count = 15;
                this.rate = 5;
                this.mode = "normal";
                this.brightR = -64;
                this.gravity = .25;
                this.time = 10;
                this.timeP = 15;
                this.glow = false;
                this.shadow = true;
                break;
            case "collect":
                this.gravity = .125;
                this.force = .125;
                this.count = 20;
                this.rate = 20;
                this.mode = "normal";
                this.brightV = 64;
                this.bright = 128;
                this.brightR = 64;
                this.brightT = -128;
                this.timeP = 6;
                this.time = 5;
                this.glow = true;
                this.resistanceP = 1;
                break;
            case "energy":
                this.gravity = .5;
                this.force = .5;
                this.count = 20;
                this.rate = 20;
                this.mode = "normal";
                this.hue = 140;
                this.brightV = 128;
                this.bright = 192;
                this.brightT = -128;
                this.timeP = 3;
                this.glow = true;
                this.shadow = true;
                break;
            case "feathers":
                this.force = 1;
                this.count = 20;
                this.rate = 1;
                this.mode = "normal";
                this.bright = 255;
                this.brightR = -16;
                this.gravity = .0125;
                this.time = 10;
                this.timeP = 20;
                this.glow = false;
                this.shadow = true;
                break;
            case "fire":
                this.force = .75;
                this.rate = 1;
                this.mode = "screen";
                this.hue = 5;
                this.hueV = 35;
                this.count = 0;
                this.hueR = 10;
                this.time = 5;
                this.timeP = 3;
                this.bright = 160;
                this.brightT = -32;
                // this.brightV = 32;
                this.gravity = -.15
                this.glow = true;
                this.resistanceP = 1.25;
                break;
            case "ground":
                this.force = 1;
                this.count = 20;
                this.rate = 0;
                this.hue = 100;
                this.hueR = -40;
                this.mode = "normal";
                this.bright = 64;
                this.brightR = -48;
                this.gravity = .25;
                this.time = 10;
                this.timeP = 30;
                this.glow = false;
                this.shadow = true;
                break;
            case "laser":
                this.gravity = -.0125;
                this.force = 0.1;
                this.count = 20;
                this.mode = "normal";
                this.hue = 0;
                this.brightV = 256;
                this.timeP = 3;
                this.glow = true;
                this.shadow = true;
                break;
            case "plasma":
                this.gravity = .125;
                this.force = .5;
                this.count = 20;
                this.rate = 20;
                this.mode = "normal";
                this.hue = 80;
                this.hueR = 10;
                this.brightV = 32;
                this.bright = 192;
                this.brightT = -128;
                this.timeP = 3;
                this.resistance = 1.01;
                this.glow = true;
                this.shadow = false;
                break;
        }
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.acceleration.mult(0);
        this.velocity.div(this.resistance);

        if (this.elapsed < this.time) {
            this.elapsed++;
            this.addParticles(this.rate*(1-this.elapsed/this.time));
        }

        this.count = this.particles.length
        for (var i = this.count-1; i >= 0; i--) {
            this.particles[i].acceleration.z -= this.gravity;
            this.particles[i].velocity.add(this.particles[i].acceleration);
            this.particles[i].position.add(this.particles[i].velocity);
            this.particles[i].velocity.div(this.resistanceP);
            if (this.particles[i].position.z < 0) {
                this.particles[i].position.z = 0;
                if (this.particles[i].velocity.z < 0) {
                    this.particles[i].velocity.z *= -.8;
                }
            }
            this.particles[i].acceleration.mult(0);
            this.particles[i].time -= .1;
            if (this.particles[i].time <= 0) {
                this.particles[i].position = new Vector(0, 0, 0);
                this.particles.splice(i, 1);
                this.count--;
            }
        }
        if (this.count == 0) {
            game.remove(this);
        }

    }

    draw(ctx) {
        ctx.setTransform(1,0,0,1,0,0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = this.mode;
        for (var i = 0; i < this.count; i++) {
            if (this.shadow) this.drawParticle(1, this.alpha/4, ctx, i, true);
            this.drawParticle(1, this.alpha, ctx, i, false);
            if (this.glow) {
                this.drawParticle(2, this.alpha/5, ctx, i, false);
                this.drawParticle(7, this.alpha/100, ctx, i, false);
            }
        }
    }

    drawParticle(size, alpha, ctx, i, shadow) {
        ctx.globalAlpha = alpha;
        var modV = (this.particles[i].velocity.magnitude() / (this.force + this.maxV));
        var modT = 1-(this.particles[i].time / this.timeP);
        var pos = this.particles[i].position.clone();
        pos.subtract(game.view);
        if (shadow) {
            ctx.drawImage(this.sprite, 0,
                0, 1, 1,
                pos.x-1-(size/2), 
                pos.y-1-(size/2),
                size, size);
        } else {
            ctx.drawImage(this.sprite, this.particles[i].hue + this.hueT*modT + this.hueV*modV,
                this.particles[i].bright + this.brightT*modT + this.brightV*modV, 1, 1,
                pos.x-1-(size/2), 
                pos.y-pos.z-1-(size/2),
                size, size);
        }
    }
} 