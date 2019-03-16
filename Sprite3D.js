class Sprite3D {
    constructor(spriteSheet, frameWidth, frameHeight, layers,
                 frameDuration, frames, loop) {
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.layers = layers;
        this.frameDuration = frameDuration;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.loop = loop;
        this.ax = frameWidth/2;
        this.ay = frameHeight/2;
    }

    drawSprite(ctx, elapsedTime, x, y, z, r, bounce, swing, shadow) {
        var currentFrame;
        if (this.loop) elapsedTime %= this.totalTime;
        currentFrame = Math.floor(elapsedTime / this.frameDuration) % this.frames;
        if (shadow == undefined) shadow = false;
        // if (x > game.view.x + game.viewWidth + borderBuffer) {
        //     x -= worldSize;
        // } else if (x + game.viewWidth - borderBuffer < game.view.x) {
        //     x += worldSize;
        // }
        // if (y > game.view.y + game.viewHeight + borderBuffer) {
        //     y -= worldSize;
        // } else if (y + game.viewHeight - borderBuffer < game.view.y) {
        //     y += worldSize;
        // }
        // x -= game.view.x;
        // y -= game.view.y;
        // if (x >= -borderBuffer && 
        //     x <= borderBuffer + game.viewWidth && 
        //     y > -borderBuffer && 
        //     y < borderBuffer + game.viewHeight) {
                this.drawFrame(currentFrame, ctx, x, y, z, r, bounce, swing, shadow);
        // }
    }

    drawFrame(frame, ctx, x, y, z, r, bounce, swing, shadow) {
        
        var b = (Math.cos(bounce)-1)/16+1;
        var tempR = Math.sin(bounce)*.75;
        var start = 0;
        if (z < 1) {
            var w = terrain.getHeight(x,y);
            if (w < 0.375) start = (0.375-w)*160; // Cover the player's head after the second water biome
        }
        x -= game.view.x;
        y -= game.view.y;
        for (let index = 0; index < this.layers; index++) {
            if (index == 0 && shadow) {
                ctx.globalCompositeOperation = "multiply";
                var alpha = .25-Math.pow(z/250,2);
                if (alpha < 0) alpha = 0;
                ctx.globalAlpha = alpha;
                ctx.setTransform(1,0,0,1,x,y-index*b);
            } else {
                if (start > index) {
                    var alpha = (.125 - ((start - index)/48));
                    if (alpha < 0) alpha = 0;   
                    ctx.globalAlpha = alpha;
                } else {
                    ctx.globalAlpha = 1;
                }
                ctx.globalCompositeOperation = "normal";
                ctx.setTransform(1,0,0,1,x,y-z+start-index*b);
            }
            if (typeof swing == "number" && index < swing && index != 0) {
                ctx.rotate(r+tempR*(1-index/swing));
            } else {
                ctx.rotate(r);
            }
            ctx.drawImage(this.spriteSheet, index * this.frameWidth, 
                frame * this.frameHeight ,this.frameWidth, this.frameHeight, -this.ax, -this.ay, this.frameWidth, 
                this.frameHeight);
        }
    }
}