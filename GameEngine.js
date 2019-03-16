class GameEngine {
    constructor(ctx, uiCtx, overlayCtx, worldSize) {
        this.entities = [];
        this.ctx = ctx;
        this.lastFrame = 0;
        this.dt = 0;
        this.step = 1/60;
        this.viewWidth = ctx.canvas.width;
        this.viewHeight = ctx.canvas.height;
        this.cameraTarget = null;
        this.cameraOffset= new Vector();
        this.bounds = new Vector(worldSize, worldSize);
        this.view = new Vector();
        this.tree;
        this.toRemove = [];
        this.paused = true;
        this.player;
        this.state = "loading";
        this.ui = new GUI(uiCtx, overlayCtx);
        this.ship;
        this.socket;
    }

    init() {
        console.log("Initialized");
        this.tree = new Quadtree(1, 0, 0, this.bounds.x, this.bounds.y, null);
        this.tree.init();
        this.cameraTarget = {position: new Vector(terrain.overworldSize/2, terrain.overworldSize/2, 0)};
        this.socket = io.connect("http://127.0.0.1:8888");
        this.socket.on("load", function (data) {
            data = data.data;
            game.loadData(data);
        });
        this.save();
        this.ui.drawRect(1,"#000");
        this.ctx.canvas.style.background = "#F00";
        this.ui.drawMessage("BUILDING WORLD...", "#FFF");
        console.log("Loading");
        window.setTimeout(this.gameLoop, 10);
    }

    start() {
        this.ui.clearUI();
        this.ui.drawRect(.5,"#333");
        this.ui.drawMessage("CLICK TO BEGIN", "#FFF");
        document.getElementById("viewport").blur();
        this.state = "ready";
    }

    end() {
        this.state = "outro";
        this.ui.clearUI();
        this.ship.state = "take off";
    }

    win() {
        this.state = "won";
    }

    skipIntro() {
        if (terrain.zoom < 1024) {
            this.ui.drawRed = 0;
            this.ship.state = "falling";
            terrain.zoom = 1024;
            terrain.zooming = false;
            this.ctx.canvas.style.backgroundSize = (terrain.zoom)+"%";
            this.ui.drawWhite = 60;
            terrain.populate();
        }
    }

    gameLoop() {
        if (!game.paused) { 
            var current = performance.now();
            game.dt += Math.min(.02, (current - game.lastFrame) / 1000);   // duration capped at 20ms
            while(game.dt > game.step) {
                game.dt -= game.step;
                if (game.state != "dead" && game.state != "won") game.update(game.step);
                game.draw(game.step);
            }
            game.lastFrame = current;
        }
        if (game.state == "loading") {
            terrain.load();
        }
        window.requestAnimationFrame(game.gameLoop);
    }

    update(dt) {
        // Handle collisions;
        this.tree.clear();
        var entitiesCount = this.entities.length;
        for (var i = entitiesCount-1; i >= 0; i--) {
            this.tree.insert(this.entities[i]);
        }

        if (game.state == "playing") controls.actions();

        this.updateView();
        var toUpdate = this.tree.retrieve(this.view.x + (viewSize>>1), this.view.y + (viewSize>>1), viewSize); // TODO find a better solution
        for (var i = toUpdate.length-1; i >= 0; i--) {
            toUpdate[i].update(dt);    
        }
        while (this.toRemove.length > 0) {

            this.entities.splice(this.entities.indexOf(this.toRemove.pop()),1);
        }
    }

    draw(dt) {
        if (game.state != "dead" && game.state != "won") {
            this.ctx.canvas.width = this.ctx.canvas.width;
            var toDraw = this.tree.retrieve(this.view.x + (viewSize>>1), this.view.y + (viewSize>>1), viewSize*.75);
            toDraw.sort(function(a,b) {return a.position.y-b.position.y});
            for (var i = 0; i < toDraw.length; i++) {
                toDraw[i].draw(this.ctx, dt);
            }
        } else if (game.state == "dead") {
            this.ui.clearUI();
            this.ui.drawRect(1,"#000");
            this.ui.drawMessage("YOU DIED", "#F00");
        } else if (game.state == "won") {
            this.ui.clearUI();
            this.ui.drawRect(1, "#FFF");
            this.ui.drawMessage("YOU WON!", "#080");
        }
        this.ui.draw();
    }

    updateView() {
        this.view.x = (this.cameraTarget.position.x + this.cameraOffset.x - this.viewWidth*.5);
        this.view.y = (this.cameraTarget.position.y + this.cameraOffset.y - this.cameraOffset.z - this.viewHeight*.5);
        var vx = -this.view.x - (terrain.zoom-100)*2 + (worldSize - this.viewWidth)*.5;
        var vy = -this.view.y - (terrain.zoom-100)*2 + (worldSize - this.viewHeight)*.5;
        this.ctx.canvas.style.backgroundPosition = vx + "px " + vy + "px";
    }

    pause() {
        if (this.state == "playing" || this.state == "intro" || this.state == "outro") {
            this.paused = true;
            this.ui.drawRect(.5, "#333");
            this.ui.drawMessage("PAUSED", "#FFF");
            this.ui.drawMessage("- click to continue -","#FFF", 15);
        }
    }

    resume() {
        if (this.state == "ready") {
            this.state = "intro";
            this.ship = new Ship(assetMgr.getSprite("ship"), assetMgr.getAsset("shipShadow"));
            this.ship.position.x = game.view.x + viewSize*.33;
            this.ship.position.y = game.view.y + viewSize*.75;
            this.addEntity(this.ship); 
        }

        if (this.state != "loading" && this.paused){
            this.ui.clearUI();
            this.paused = false;
            this.ctx.globalAlpha = 1;
            window.requestAnimationFrame(game.gameLoop);
        }
    }
 
    addEntity(entity) {
        this.entities.push(entity);
    }

    remove(entity) {
        this.toRemove.push(entity);
    }



    saveData() {
        var e = [];
        for (var entity of this.entities) {
            if (!(entity instanceof Particles || entity instanceof Projectile))
                e.push({"class":entity.constructor.name, "data":entity.save()});
        }
        return JSON.stringify({entities:e});
    }

    save() {
        // this.socket.emit("save", { studentname: "Josh Lichty", statename: "gameState", data: "Goodbye World" });
        if (this.state == "playing")
            this.socket.emit("save", { studentname: "Josh Lichty", statename: "gameState", data: this.saveData() });
    }

    load() {
        game.entities = [];
        this.socket.emit("load", { studentname: "Josh Lichty", statename: "gameState" });
    }

    loadData(data) {
        // map
        var gun;
        data = JSON.parse(data);
        var a = {};
        a.Player = 0;
        a.Ship = 0;
        a.Weapon = 0;
        a.Npc = 0;
        a.StaticEntity = 0;
        a.Resource = 0;
        for (var entity of data.entities) {
            a[entity.class]++;
            switch(entity.class) {
                case "Player":
                    this.player = Player.load(entity.data);
                    break;
                case "Ship":
                    this.ship = Ship.load(entity.data);
                    break;
                case "Weapon":
                    gun = Weapon.load(entity.data);
                    break;
                case "Npc":
                    Npc.load(entity.data);
                    break;
                case "StaticEntity":
                    StaticEntity.load(entity.data);
                    break;
                case "Resource":
                    Resource.load(entity.data);
                    break;
            }
        }
        console.log(a);
        this.player.gun = gun;
        this.cameraTarget = this.player
    }
}