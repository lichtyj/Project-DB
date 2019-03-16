class Ship extends Entity {
    constructor(sprite, shadowSprite) {
        super(new Vector(), sprite);
        this.velocity = new Vector();
        this.acceleration = new Vector();
        this.direction = 5.25;
        this.spin = 0;
        this.shadowSprite = shadowSprite;
        this.timer = 0;
        this.damage = 100000;
        this.repair = 50;
        this.state = "flying";
    }

    smoke() {
        var dist = 16;
        var angle = 2.6;
        var pos = this.position.clone();
        var dir = new Vector(Math.cos(this.direction+angle)*dist, Math.sin(this.direction+angle)*dist+6, 9);
        var p = new Particles(pos.add(dir), this.velocity.clone());
        p.count = Math.random()*5;
        p.alpha = .75;
        p.force = .25;
        p.bright = 0;
        p.time = 10;
        p.timeP = Math.random()*4+2;
        p.glow = true;
        p.gravity -= .125;
        p.init();    
    }

    fire() {
        var dist = 16;
        var angle = 2.6;
        var pos = this.position.clone();
        var dir = new Vector(Math.cos(this.direction+angle)*dist, Math.sin(this.direction+angle)*dist+6, 9);
        var p = new Particles(pos.add(dir), Vector.fromAngle(this.direction+Math.PI*.6).mult(5));
        p.preset("energy");
        p.count = Math.random()*5;
        p.hueR = 40;
        p.rate = 5;
        p.alpha = .75;
        p.brightR = 64;
        p.force = .75;
        p.time = 10;
        p.timeP = Math.random()*4+2;
        p.glow = true;
        p.shadow = false;
        p.gravity = 0;
        p.resistanceP = 1.01;
        p.init(); 
    }

    explode() {
        var dist = 16;
        var angle = 2.6;
        var pos = this.position.clone();
        var dir = new Vector(Math.cos(this.direction+angle)*dist, Math.sin(this.direction+angle)*dist+6, 9);
        var p = new Particles(pos.add(dir), Vector.fromAngle(this.direction+Math.PI*.6).mult(10));
        p.preset("fire");
        p.count = 60;
        p.hueR = 40;
        p.rate = 30;
        p.alpha = .75;
        p.brightR = 64;
        p.force = 1;
        p.time = 5;
        p.timeP = 30;
        p.glow = true;
        p.shadow = false;
        p.gravity = 0;
        p.resistanceP = 1.01;
        p.init(); 
    }

    engines(left, hue) {
        if (hue == undefined) hue = 0;
        var dist = 22;
        var angle = 2.725;
        if (left) angle *= -1;
        var pos = this.position.clone();
        var dir = new Vector(Math.cos(this.direction+angle)*dist, Math.sin(this.direction+angle)*dist+6, 9);
        var p = new Particles(pos.add(dir), Vector.fromAngle(this.direction+Math.PI).mult(10));
        p.preset("energy");
        p.count = 24;
        p.hue = 160 + hue;
        p.bright = 170;
        p.brightR = 64
        p.alpha = .75;
        p.force = .5;
        p.time = 2;
        p.timeP = 1;
        p.glow = true;
        p.shadow = false;
        p.gravity = 0;
        p.init();    
    }

    ftl(speed) {
        var pos = this.position.clone();
        var p = new Particles(pos.add(Vector.random(16)), Vector.fromAngle(this.direction+Math.PI).mult(speed));
        p.preset("energy");
        p.count = speed;
        p.hue = 160
        p.bright = 223;
        p.brightR = 32
        p.alpha = .75;
        p.time = 5;
        p.timeP = 3;
        p.glow = false;
        p.shadow = false;
        p.gravity = 0;
        p.init();    
    }

    checkCollisions() {
        var hit = game.tree.retrieve(this.position.x, this.position.y, 32);
        for (var h of hit) {
            if (h.takeDamage != undefined && !(h instanceof Player)) {
                h.takeDamage(this);
            }
        }
    }

    update(dt) {
        super.update();

        // console.log(this.position);

        this.direction += this.spin;

        switch(this.state) {
            case "ready":
                break;
            case "flying":
                this.position.x = game.view.x + viewSize*.33;
                this.position.y = game.view.y + viewSize*.75;
                this.position.z = Math.sin(this.elapsedTime*4)*2;
                this.gravity = 0;
                if (terrain.zoom < 70) {
                    terrain.zoomIn(1.075);
                    this.engines();
                    this.engines(true);
                    this.ftl(20*(1-terrain.zoom/80));
                } else if (terrain.zoom < 100) { // Running
                    terrain.zoomIn(1.01);
                    this.engines();
                    this.engines(true);
                } else if (terrain.zoom < 110) { // Right out
                    terrain.zoomIn(1.003);
                    this.engines(true);
                } else if (terrain.zoom < 115) { // Flicker on
                    terrain.zoomIn(1.003);
                    this.engines();
                    this.engines(true);
                } else if (terrain.zoom < 119) { // Right out
                    terrain.zoomIn(1.003);
                    this.engines(true);
                } else if (terrain.zoom < 120) { // Flame out
                    terrain.zoomIn(1.005);
                    this.engines(false, -120);
                    this.engines(true);
                } else if (terrain.zoom < 123) { // Running
                    terrain.zoomIn(1.005);
                    this.engines();
                    this.engines(true);
                } else if (terrain.zoom < 125) { // Right out
                    terrain.zoomIn(1.001);
                    this.engines(true);
                } else {
                    this.state = "mayday";
                } 
                break;
            case "mayday":
                if (this.spin == 0) {
                    game.ui.drawRed = 5;
                    this.explode();
                }
                this.acceleration.add(Vector.fromAngle(this.direction-Math.PI/2).mult(0.1));
                game.ui.drawRed += 1.5;
                if (terrain.zoom > 135) {
                    game.ui.drawWhite += 1.5;
                }
                this.spin = 0.04;
                this.fire();
                this.engines(true);
                terrain.zoomIn(1.001);
                if (terrain.zoom > 150) {
                    game.ui.drawRed = 0;
                    this.state = "falling";
                    terrain.zoom = 1024;
                    terrain.zooming = false;
                    game.ctx.canvas.style.backgroundSize = (terrain.zoom)+"%";
                    game.ui.drawWhite = 60;
                    terrain.populate();
                }
                break;
            case "falling":
                if (this.gravity == 0) {
                    terrain.draw();
                    this.gravity = .125;
                    this.position = terrain.getRandomLand();
                    this.position.x -= 1390; // Moves 1390 in fall
                    this.position.y -= 990; // 990
                    this.position.z = 275;
                    this.spin = 0.09;
                    this.velocity = new Vector(40,20,-1);
                    game.cameraOffset.x = 17;
                    game.cameraOffset.y = -12;
                    game.cameraTarget = this;
                }
                // console.log(this.position);
                if (this.position.z <= 0) this.state = "impact";
                this.acceleration.x += .25;
                this.acceleration.y += .25;
                this.smoke();
                break;
            case "impact":
                this.smoke();
                this.velocity.div(1.015);
                this.spin /= 1.05;
                game.ui.drawRed += (1+this.spin);
                this.checkCollisions();
                if (this.spin < 0.001) {
                    this.state = "landed";
                    this.timer = 30;
                    this.spin = 0;
                    this.velocity.subtract(this.velocity);
                }
                if (this.spin > 0.025) {
                    var pos = new Vector(this.position.x, this.position.y-3, 3);
                    var dist = 25+Math.random()*5;
                    var angle = 1.5+Math.random()*-.5;
                    var angle2 = .8+Math.random()*.6-.3;
                    var dir = new Vector(Math.cos(this.direction+angle-angle2)*dist, Math.sin(this.direction+angle-angle2)*dist, 3);
                    var dir2 = new Vector(Math.cos(this.direction+angle)*dist, Math.sin(this.direction+angle)*dist, -Math.random()*10-10).mult(this.spin*8);
                    var p = new Particles(pos.add(dir), dir2);
                    p.preset("ground");
                    p.count =  this.spin*this.spin*10000;
                    p.rate = 1;//this.spin/8;
                    p.timeP = 20;
                    p.force = .75;
                    p.resistanceP = 1.05;
                    p.init();
                }
                break;
            case "landed":
                this.smoke();
                this.timer -= 1;
                if (this.timer <= 0) {
                    game.player = new Player(new Vector(this.position.x+17, this.position.y-12), assetMgr.getSprite("scientist"));
                    game.player.gun = new Weapon(game.player.position.clone());
                    game.player.gun.preset("railgun");
                    game.player.init();
                    game.addEntity(game.player);
                    game.addEntity(game.player.gun);
                    game.cameraTarget = game.player;
                    game.cameraOffset.x = 0;
                    game.cameraOffset.y = 0;
                    game.state = "playing";
                    this.state = "playing";
                }
                break;
            case "playing":
                this.smoke();
                break;
            case "take off":
                if (this.gravity != 0) { //init
                    game.cameraTarget = {position: game.player.position.clone()};
                    this.gravity = 0;
                    this.direction %= Math.PI*2;
                    if (this.direction > Math.PI) this.direction -= Math.PI*2;
                    game.remove(game.player.gun);
                    game.remove(game.player);
                }
                this.direction /= 1.05;
                if (this.position.z < 60) {
                    this.position.z += .25;
                } else {
                    this.state = "fly away";
                }
                break;
            case "fly away":
                this.engines();
                this.engines(true);
                this.acceleration.z = 0;
                this.velocity.z = 0;
                this.acceleration.x += .5;
                game.ui.drawWhite += 2;
                if (game.ui.drawWhite > 50) {
                    game.win();
                    game.ui.drawWhite = 50;
                    this.state = "done";
                }
                break;
            case "done":
                break;
        }
    }

    draw(ctx, dt) {
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
        this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y, this.position.z, this.direction, this.bounce, null, true);   
    }

    save() {
        return JSON.stringify({position:this.position, direction:this.direction, repair:this.repair});
    }

    static load(data) {
        data = JSON.parse(data);
        var obj = new Ship(assetMgr.getSprite("ship"), assetMgr.getAsset("shipShadow"));
        game.addEntity(obj);
        obj.position = Vector.create(data.position);
        obj.direction = data.direction; 
        obj.repair = data.repair;
        obj.state = "playing";
        return obj;
    }
}