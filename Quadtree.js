var maxLevel = 1;

class Quadtree {
    constructor(level, x, y, width, height, parent) {
        this.level = level;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.parent = parent;
        this.entities = [];
        this.child = [];
    }

    init() {
        if (this.level < maxLevel) this.split();
    }

    getIndex(x, y) {
        var result = 0;
        if (x > this.x + this.width*.5) result++;
        if (y > this.y + this.height*.5) result += 2;
        return result;
    }

    clear() {
        this.entities.length = 0;
        if (this.child.length > 0) {
            this.child[0].clear();
            this.child[1].clear();
            this.child[2].clear();
            this.child[3].clear();
        }
    }

    insert(entity) {
        if (this.level < maxLevel) {
            this.child[this.getIndex(entity.position.x, entity.position.y)].insert(entity);
        } else {
            this.entities.push(entity);
        }
    }

    split() {
        var newW = this.width*.5;
        var newH = this.height*.5;
        this.child[0] = new Quadtree(this.level + 1, this.x, this.y, newW, newH, this);
        this.child[1] = new Quadtree(this.level + 1, this.x + newW, this.y, newW, newH, this);
        this.child[2] = new Quadtree(this.level + 1, this.x, this.y + newH, newW, newH, this);
        this.child[3] = new Quadtree(this.level + 1, this.x + newW, this.y + newH, newW, newH, this);
        this.child[0].init();
        this.child[1].init();
        this.child[2].init();
        this.child[3].init();
    }

    retrieve(x, y, dist) {
        return this.retrieveCone(x,y,dist, 1, 0, Math.PI*2);
    }

    // dx, dy, and range are for vision cones
    retrieveCone(x, y, dist, dx, dy, range) {
        var quad = this.getQuad(x, y, dist);
        var nearObjs = [];
        // if (dist >= quad.height) {
        //     var children = quad.getChildren();
        //     var l = children.length;
        //     var i = 0;
        //     for (i; i < l; i++) {
        //         nearObjs = nearObjs.concat(children[i].entities);
        //     }
        // }

        var angle = this.angle(dx, dy);
        var i = angle - range*.5;
        var end = i + range;
        var toCheck = [];
        toCheck.push(this.getQuad(x, y, dist));
        for (i; i < end; i+= range/8) {
            toCheck.push(this.getQuad(x + Math.cos(i) * (dist-1), y + Math.sin(i) * (dist-1), dist));
        }
        toCheck = [...new Set(toCheck)];
        for (i = 0; i < toCheck.length; i++) {
            if (dist >= quad.height) {
                var children = quad.getChildren();
                var l = children.length;
                var j = 0;
                for (j; j < l; j++) {
                    nearObjs = nearObjs.concat(children[j].entities);
                }
            } else {
                nearObjs = nearObjs.concat(quad.entities);
            }
        }
        var ret = [];

        for (var a of nearObjs) {
            if (this.near(a.position, {"x":x, "y":y}, dist, dx, dy, range*.5)) {
                ret.push(a);
            }
        }
        return ret;
    }

    near(other, me, d, dx, dy, range) {
        var a = this.angle(dx, dy); 
        var a2 = this.angle(other.x - me.x, other.y - me.y);
        var x = Math.min(Math.pow(other.x - me.x, 2), Math.pow(worldSize - Math.abs(other.x - me.x), 2));
        var y = Math.min(Math.pow(other.y - me.y, 2), Math.pow(worldSize - Math.abs(other.y - me.y), 2));
        return (x+y < d || (Math.min(Math.abs(a-a2), Math.PI*2-Math.abs(a-a2)) < range && x + y < d*d));
    }

    angle(x, y) {
        var angle = Math.atan(y/x);
        if (x < 0) angle += Math.PI;
        return angle;
    }

    getQuad(x, y, dist) {
        var ret;
        if (this.parent == null) {
            if (x < 0) x += this.width;
            if (y < 0) y += this.height;
            if (x > this.width) x %= this.width;
            if (y > this.height) y %= this.height;
        }
        if (dist < this.height && this.child.length > 0) {
            ret = this.child[this.getIndex(x,y)].getQuad(x,y, dist);
        } else {
            ret = this;
        }
        return ret;
    }

    getChildren() {
        var children = [];
        if (this.child.length > 0) {
            var i = 0;
            for (i; i < 4; i++) {
                children = children.concat(this.child[i].getChildren());
            }
        } else {
            children.push(this);
        }
        return children;
    }

    getRoot() {
        var ret;
        if (this.parent == null) {
            ret = this;
        } else {
            ret = this.parent.getRoot();
        }
        return ret;
    }

}
// Encapsulate these

// document.addEventListener("DOMContentLoaded", start);

// var tree;
// var mouse = {"x":0, "y":0};
// var mouseLast = {"x":0, "y":0};
// var ctx;
// var list;
// var size = 800;

// function start() {
//     var canvas = document.getElementById("canvas");
//     canvas.width = size;
//     canvas.height = size;
//     ctx = canvas.getContext("2d");
//     ctx.imageSmoothingEnabled = false;  
//     tree = new Quadtree(1, 0, 0, size, size, null);
//     tree.init();

//     var getXandY = function (e) {
//         return {"x": e.clientX - ctx.canvas.getBoundingClientRect().left,
//                 "y":e.clientY - ctx.canvas.getBoundingClientRect().top};
//     }

//     window.requestAnimationFrame(gameLoop);

//     document.addEventListener("mousedown", function(e) {
//         mouse = getXandY(e);
//         tree.insert(mouse);
//         console.log("Mouse down: " + mouse.x + ", " + mouse.y);
//     });

//     document.addEventListener("keydown", function(e) {
//         if (e.keyCode == 71) {
//             var i = 0;
//             for (i; i < 1000; i++) {
//                 tree.insert( { "x": Math.random()*size, "y": Math.random()*size } );   
//             }
//             console.log("inserted");
//         }
//     });

//     document.addEventListener("keydown", function(e) {
//         if (e.keyCode == 70) {
//             gameLoop();
//         }
//     });

//     ctx.canvas.addEventListener("mousemove", function (e) {
//         mouseLast = mouse;
//         mouse = getXandY(e);
//     }, false);
// }

// var d = 100;

// gameLoop = function() {
//     window.requestAnimationFrame(gameLoop);
//     ctx.fillStyle = "#559061";
//     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//     list = tree.retrieve(mouse.x, mouse.y, d, mouse.x - mouseLast.x, mouse.y - mouseLast.y, Math.PI*1.25);
//     ctx.fillStyle = "#F00";
//     for (var a of list) {
//         ctx.fillRect(a.x-2, a.y-2, 4, 4);
//     }
// }
