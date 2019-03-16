class GUI {
    constructor(uiCtx, overlayCtx) {
        this.uiCtx = uiCtx;
        this.overlayCtx = overlayCtx;

        this.invSize = 32;
        this.invBorder = 2;
        this.invBoxes = 4;

        this.rotation = 0;
        this.bounce = 0;

        this.drawRed = 0;
        this.drawWhite = 50;
        this.textFade = 0;
        this.msg = "";
        this.msgColor = "#FFF";
    }

    draw() {
        if (game.state != "dead" && game.state != "won") {
            if (this.drawRed > 0 || this.drawWhite > 0)
                this.clearUI();
            if (this.drawRed > 0) {
                if (this.drawRed > 50) this.drawRed = 50;
                this.drawRect(this.drawRed--/100, "#F00");
            }
            if (this.drawWhite > 0) {
                this.drawRect(this.drawWhite--/50, "#FFF");
            }
            if (this.textFade > 0) {
                this.clearUI();
            }
        }
    }

    clearUI() {
        this.uiCtx.canvas.width = viewSize;
        if (game.state == "playing" && game.player != undefined) {
            this.drawInventory();
        }
    }

    inventoryMessage(msg, color, fade) {
        if (color == undefined) color = "#FFF";
        if (fade == undefined) fade =  100;
        this.color = color;
        this.msg = msg;
        this.textFade = fade;
    }

    drawInventoryMessage() {
        this.uiCtx.fillStyle = this.color;
        var twidth = this.uiCtx.measureText(this.msg).width;
        this.uiCtx.globalAlpha = this.textFade--/100;
        if (this.uiCtx.globalAlpha > 1) this.uiCtx.globalAlpha = 1;
        this.uiCtx.fillText(this.msg, (game.viewWidth - twidth)*.5 | 0, game.viewHeight-this.invSize - 4);
    }
    
    drawMessage(msg, color, offset) {
        if (offset == undefined) offset = 0;
        this.uiCtx.fillStyle = color;
        var text = msg;
        var twidth = this.uiCtx.measureText(text).width;
        this.uiCtx.fillText(text, (game.viewWidth - twidth)*.5 | 0, (game.viewHeight)*.25 + offset);
    }

    drawRect(alpha, color) {
        if (alpha > 1) alpha = 1;
        this.uiCtx.globalAlpha = alpha;
        this.uiCtx.fillStyle = color;
        this.uiCtx.fillRect(0,0, game.viewWidth, game.viewHeight);
    }

    drawInventory() {
        if (game.player == undefined) return;
        this.uiCtx.canvas.width = this.uiCtx.canvas.width;
        if (this.textFade > 0) {
            this.drawInventoryMessage();
        }
        var left = (game.viewWidth - this.invSize*this.invBoxes)/2;
        var top = game.viewHeight-this.invSize;
        this.uiCtx.globalAlpha = .5;
        for (var i = 0; i < this.invBoxes; i++) {
            if (i == game.player.current && game.player.inventory.length > 0) {
                this.uiCtx.fillStyle = "#888";
            } else {
                this.uiCtx.fillStyle = "#333";
            }
            this.uiCtx.fillRect(left+this.invBorder+(this.invSize)*i, top + this.invBorder, this.invSize-this.invBorder*2, this.invSize - this.invBorder*2);
        }
        for (var i = 0; i < this.invBoxes; i++) {
            if (i == game.player.current && game.player.inventory.length > 0) {
                this.uiCtx.fillStyle = "#FFF";
            } else {
                this.uiCtx.fillStyle = "#888";
            }
            if (game.player.inventory[i] != undefined) {
                this.uiCtx.setTransform(1,0,0,1,0,0);
                this.drawResource(game.player.inventory[i].name,left+this.invBorder+(this.invSize)*(i+1/3), top+this.invBorder+this.invSize/3);
                var text = game.player.inventory[i].count;
                var twidth = this.uiCtx.measureText(text).width;
                this.uiCtx.fillText(text, left+this.invBorder+(this.invSize)*(i+.75)-twidth, top+this.invBorder+this.invSize*(3/4))
            }
        }
    }

    drawResource(sprite, x,y) {
        this.rotation += 0.01;
        x += game.view.x; // This is a janky fix
        y += game.view.y;
        assetMgr.getSprite(sprite).drawFrame(0, this.uiCtx, x, y+1, 1, this.rotation, this.bounce += .075, null, true);
        this.uiCtx.setTransform(1,0,0,1,0,0);
    }
}