class Controls {
    constructor() {
        this.keys = [];
        this.lmb = 0;
        this.doc;
    }

    init() {
        var that = this;
        this.doc =  document.getElementById("viewport");
        this.doc.addEventListener("keydown", function(e) {
            that.keyDown(e.keyCode)});
        this.doc.addEventListener("keyup", function(e) {
            that.keyUp(e.keyCode)});
        this.doc.addEventListener("focus", function() {
            that.focus()});
        this.doc.addEventListener("blur", function() {
            that.blur()});
        this.doc.addEventListener("mouseup", function() {
            that.mouseButton(false) });
        this.doc.addEventListener("mousedown", function() {
            that.mouseButton(true) });
        this.doc.addEventListener("wheel", function(e) {
            that.mouseWheel(Math.sign(e.deltaY)) });
        // this.doc.addEventListener("mousemove", this.mouseMove);
    }

    focus() {
        game.resume();
        document.getElementById("body").style="overflow: hidden;"
    }

    blur() {
        game.pause();
        document.getElementById("body").style="overflow: auto;"
    }

    keyUp(num) {
        switch(num) {
            case 16: // LeftShift
                if (game.player != undefined)
                game.player.setState("normal");
                this.doc.style["cursor"] = "url(./sprites/crosshairWhite.png) 8 8, crosshair";
                // game.ctx.canvas.removeEventListener("mousemove", this.mouseMove);
                break;    
        }

        delete this.keys.splice(this.keys.indexOf(num),1);
    }

    keyDown(num) {
        if (game.state == "intro") game.skipIntro();
        if (this.keys.indexOf(num) == -1) {
            console.log(num);
            this.keys.push(num);
        }
    }

    mouseMove(e) {
        var x = e.clientX - game.ctx.canvas.getBoundingClientRect().left + game.view.x - 200;
        var y = e.clientY - game.ctx.canvas.getBoundingClientRect().top + game.view.y - 200;

        game.player.setTarget(x, y);
    }

    mouseButton(pressed) {
        if (pressed) {
            if (this.keys.indexOf("lmb") == -1) {
                this.keys.push("lmb");
            }
        } else {
            if (game.player != null && game.player.gun != null)
                game.player.gun.triggerReleased();
            delete this.keys.splice(this.keys.indexOf("lmb"),1);
        }
    }

    mouseWheel(y) {
        if (game.player != undefined && game.player.inventory.length != 0) {
            game.player.inventoryScroll(y);
        }
    }

    actions() {
        var moving = Vector.zero();
        for (var key of this.keys) {
            switch(key) {
                case "lmb":
                    if (game.player != null && game.player.gun != null)
                        game.player.gun.triggerPressed();
                    break;
                case 16: // LeftShift
                    if (!game.player.aiming) {
                        this.doc.style["cursor"] = "url(./sprites/crosshair.png) 8 8, crosshair";
                        this.doc.addEventListener("mousemove", this.mouseMove);
                    }
                    game.player.setState("aim");
                    break;
                case 49: // 1
                    game.player.sprite = assetMgr.getSprite("scientist");
                    break;
                case 50: // 2
                    game.player.sprite = assetMgr.getSprite("dudeRed");
                    break;
                case 51: // 3
                    game.player.sprite = assetMgr.getSprite("dudeGreen");
                    for (var c of game.entities) {
                        if (c instanceof Npc) {
                            c.rage = true;
                        }
                    }
                    break;
                case 52: // 4
                    game.player.sprite = assetMgr.getSprite("dudeBlue");
                    break;
                case 53: // 5
                    game.player.gun.preset('railgun');
                    break;
                case 54: // 6
                    game.player.gun.preset('laserPistol');
                    break;
                case 55: // 7
                    game.player.gun.preset('flamethrower');
                    break;
                case 56: // 8
                    game.player.gun.preset('plasmaPistol');
                    break;
                case 65: // A
                    moving.add(Vector.left());
                    break;
                case 69: // E
                    if (game.player != null) {
                        game.player.use();
                    }
                    this.keyUp(69);
                    break;
                case 68: // D
                    moving.add(Vector.right());
                    break;
                case 70: // F
                    terrain.generateChickens(1);
                    this.keyUp(70);
                    break;
                case 71: // G
                    terrain.generateObjects(25);
                    this.keyUp(71);
                    break;
                case 72: // H
                    terrain.generateFood(25);
                    this.keyUp(72);
                    break;
                case 81: // Q
                    if (game.player != null) {
                        game.player.drop();
                    }
                    this.keyUp(81);
                    break;
                case 83: // S
                    moving.add(Vector.back());
                    break;
                case 87: // W
                    moving.add(Vector.forward());
                    break;
                case 118: // F7
                    game.save();
                    this.keyUp(118);
                    break;
                case 120: // F9
                    game.load();
                    this.keyUp(120);
                    break;
            }
        }

        if (!(moving.equals(Vector.zero()) || (game.player == undefined))) {
            game.player.move(moving.limit(game.player.moveSpeed));
        }
    }
}