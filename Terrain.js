class Terrain {ds  
    constructor() {
        this.overworldSize = 4096;
        this.map = [worldSize*worldSize];
        this.colors = [];
        this.type = [];

        this.zoom = 10;
        this.zooming = true;
    }

    init() {
        this.colors.push({r:10 , g:40 , b:98});
        this.type.push("Deepest water");
        this.colors.push({r:22 , g:50 , b:105});
        this.type.push("Deep water");
        this.colors.push({r:33 , g:61 , b:115});
        this.type.push("Deep water");
        this.colors.push({r:65 , g:110 , b:160});
        this.type.push("Water");
        this.colors.push({r:80 , g:142 , b:185});
        this.type.push("Shallow water");
        this.colors.push({r:97 , g:162 , b:209});
        this.type.push("Shallows");
        this.colors.push({r:222 , g:212 , b:174});
        this.type.push("Sand");
        this.colors.push({r:117 , g:179 , b:95});
        this.type.push("Land");
        this.colors.push({r:101 , g:161 , b:96});
        this.type.push("Land");
        this.colors.push({r:85 , g:144 , b:97});
        this.type.push("Land");
        this.colors.push({r:83 , g:125 , b:92});
        this.type.push("High Land");
        this.colors.push({r:95 , g:117 , b:103});
        this.type.push("High Land");
        this.colors.push({r:105 , g:105 , b:105});
        this.type.push("Mountain");
        this.colors.push({r:135 , g:135 , b:135});
        this.type.push("Mountain");
        this.colors.push({r:195 , g:195 , b:195});
        this.type.push("Snowline");
        this.colors.push({r:235 , g:235 , b:245});
        this.type.push("Peak");
    }

    update() {

    }

    getHeight(x,y) {
        x = x|0;
        y = y|0;
        x = Math.min(x, worldSize);
        x = Math.max(x, 0);
        y = Math.min(y, worldSize);
        y = Math.max(y, 0);
        return this.map[x][y];
    }

    getTerrainType(x,y) {
        var m = this.getHeight(x,y)*this.type.length | 0;
        return this.type[m];
    }

    getRandomLand() {
        var valid = false;
        var h;
        var pos;
        while (!valid) {
            pos = Vector.randomPositive(worldSize, false);
            h = this.getHeight(pos.x, pos.y);
            if (h > 0.375 && h < 0.875) {
                valid = true;
            }
        }
        return pos;
    }

    isAboveWater(pos) {
        return (this.getHeight(pos.x,pos.y) > 0.375);
    }

    load() {
        this.map = generateTerrainMap(worldSize, 1, 6);
        this.clampWorld();
        this.draw();
        console.log("Done drawing world");
        game.start();
    }

    clampWorld() {
        var x,y,d;
        var s = worldSize/2;
        // var a = 32;
        var a = 0;
        for (x = 0; x < worldSize; x++) {
            for (y = 0; y < worldSize; y++) {
                d = this.distToCenter(x,y);
                if (d > s + a) {
                    this.map[x][y] = -1;
                } else if (d > s && d < s + a) {
                    this.map[x][y] *= (1-Math.pow(d/(s+a),2))*.125;
                } else {
                    this.map[x][y] *= 1-Math.pow(d/s,2);
                }
                if (this.map[x][y] < 0) this.map[x][y] = -1;
            }
        }
    }

    draw() {
        var total = worldSize*worldSize*4;
        var v = new Uint8ClampedArray(total);
        var j,k,l,m, x, y;
        var i = 0;
        for (y = 0; y < worldSize; y++) {
            for (x = 0; x < worldSize; x++) {
                j = this.map[x][y];
                k = j;
                if (this.zooming) {
                    l = (this.distToPoint(x,y, this.overworldSize>>1, this.overworldSize>>4)>>4-32)|0;
                    m = (this.distToCenter(x,y)>>4);
                } else {
                    l = 0;
                    m = 0;
                }

                if (k < 0) k = 0;
                if (k > 1) k = 1;

                k = Math.round(k*(this.colors.length-1));
                if (j == -1 || isNaN(k)) {
                    if (this.zooming) {
                        v[i++] = 0;
                        v[i++] = 0;
                        v[i++] = 0;
                    } else {
                        v[i++] = this.colors[0].r;
                        v[i++] = this.colors[0].g;
                        v[i++] = this.colors[0].b;
                    }
                } else {
                    v[i++] = this.colors[k].r - l+m;
                    v[i++] = this.colors[k].g - (l*1.25)+m;
                    v[i++] = this.colors[k].b - (l*1.5)+m;
                }
                v[i++] = 255;
            }
        }
            var can = document.createElement('canvas');
            can.width = worldSize;
            can.height = worldSize;
            var tempCtx = can.getContext('2d');
            tempCtx.putImageData(new ImageData(v, worldSize, worldSize), 0, 0);
            game.ctx.canvas.style.background = "url(" + can.toDataURL('terrain/png', 1.0) + ")";
            if (this.zooming) {
                game.ctx.canvas.style.backgroundRepeat = "no-repeat";
                game.ctx.canvas.style.backgroundColor = "#000";
            } else {
                game.ctx.canvas.style.backgroundRepeat = "initial";
                game.ctx.canvas.style.backgroundColor = "rgb(" + this.colors[0].r + ", " + this.colors[0].g + ", " + this.colors[0].b + ", "  + ")";
            }
            game.ctx.canvas.style.backgroundSize = (this.zoom)+"%";
            game.updateView();
    }

    distToCenter(x,y) {
        return this.distToPoint(x,y, worldSize*.5, worldSize*.5);
    }

    distToPoint(x,y, px, py) {
        return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
    }

    populate() {
        terrain.generateObjects(250);        
        terrain.generateFood(10);
        terrain.generateChickens(50);
    }

    zoomIn(amount) {
        if (amount == undefined) console.error("zoom amount undefined");
        this.zoom *= amount;
        game.ctx.canvas.style.backgroundSize = (this.zoom)+"%";
        game.updateView();
    }

    generateObjects(count) {
        var type;
        for (var i = 0; i < count; i++) {
            switch (Math.floor(Math.random()*4)) {
                case 0:
                    type = "bush";
                    break;
                case 1: 
                    type = "tree";
                    break;
                case 2: 
                    type = "tree2";
                    break;
                case 3: 
                    type = "rock";
                    break;
            }
            StaticEntity.create(this.getRandomLand(), type, Math.random()*Math.PI*2);
        }
    }

    generateFood(count) {
        var type;
        var spin;
        for (var i = 0; i < count; i++) {
            switch (Math.floor(Math.random()*2)) {
                case 0:
                    type = "rawMeat";
                    break;
                case 1: 
                    type = "metal";
                    break;
                case 2: 
                    type = "dna";
                    break;
            }
            game.addEntity(new Resource(this.getRandomLand(), type, Math.random()*Math.PI*2, spin));
        }
    }

    generateChickens(count) {
        for (var i = 0; i < count; i++) {
            Npc.create(this.getRandomLand(), assetMgr.getSprite("chicken"));
        };
    }

    save() {
        return JSON.stringify(this.map);
    }

    static load(data) {
        this.map = JSON.parse(data);
        draw();
    }


}