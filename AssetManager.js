class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
        this.spr = [];
    }
    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }

    getAsset(path) {
        if (this.cache[path] == undefined) path = path.match(/[^/]+(?=\..{1,5}$)/)[0];
        return this.cache[path];
    };
    
    downloadAll(callback) {
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var img = new Image();
            var that = this;

            var path = this.downloadQueue[i];
            console.log(path);

            img.addEventListener("load", function() {
                console.log("Loaded " + this.src);
                that.successCount++;
                if (that.isDone()) callback();
            });
            img.addEventListener("error", function() {
                console.error("Error loading " + this.src);
                that.errorCount++;
                if (that.isDone()) callback();
            });

            img.src = path;
            this.cache[path.match(/[^/]+(?=\..{1,5}$)/)[0]] = img;
        }
    }
    
    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }

    createSprite(name, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, sx, sy, ax, ay) {
        var sprite = new Sprite(this.getAsset(name), frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, sx, sy, ax, ay);
        this.spr[name] = sprite;
    }

    createSprite3D(name, frameWidth, frameHeight, layers, frameDuration, frames, loop) {
        var sprite = new Sprite3D(this.getAsset(name), frameWidth, frameHeight, layers, frameDuration, frames, loop);
        this.spr[name] = sprite;
    }

    getSprite(name) {
        return this.spr[name];
    }
}

