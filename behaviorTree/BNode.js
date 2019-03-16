class BNode {
    constructor(parent, name) {
        this.parent = parent;
        this.name = name;
        this.children = [];
        if (parent == null) {
            this.level = 0;
        } else {
            this.level = parent.level + 1;
        }
        this.x = 0;
        this.y = 0;
        this.width = size*4;
        this.delay = 0;
        this.state;
        this.color = "#000";
        this.selected = false;
        this.active = false;
    }

    tick() {
        console.log("tick");
    }

    format() {
        this.updateWidths();
        this.getRoot().calculateIndices();
        this.getRoot().offset();
    }

    offset() {
        var x = this.x-this.width/2;
        var dx = this.width/(this.children.length+1);
        for (var i = 0; i < this.children.length; i++) {
            x += dx;
            this.children[i].x = x;
            this.children[i].offset();
        }
    }

    updateWidths() {
        var depth = this.getRoot().getDepth();
        var level;
        while (depth > 0) {
            level = this.getRoot().getLevelPop(depth--);
            for (var l of level) {
                l.width = size*2;
                for (var c of l.children) {
                    l.width += c.width;
                }
            }
        }
    }

    getDepth() {
        var level = this.level;
        for(var c of this.children) {
            level = Math.max(c.getDepth());
        }
        return level;
    }

    getLevelPop(level) {
        var ret = [];
        if (this.level == level) {
            ret.push(this);
        } else {
            for (var c of this.children) {
                ret = ret.concat(c.getLevelPop(level));
            }
        }
        ret.sort(function(a,b) {return b.x - a.x});
        return ret;
    }

    checkValidity() {
        var ret = true;
        if (this.children.length == 0 && this instanceof ActionNode) {
            ret = true;
        } else if (this.children.length == 0) {
            ret = false;
        } else if (this.children.length > 1 && !(this instanceof ParentNode)) {
            ret = false;
        } else {
            for (var c of this.children) {
                ret = (ret && c.checkValidity());
            }
        }

        return ret;
    }

    calculateIndices() {
        this.maxIndex = this.children.length-1;
        for (var c of this.children) {
            c.calculateIndices();
        }
    }

    resetIndices() {
        this.index = 0;
        this.state = undefined;
        for (var c of this.children) {
            c.resetIndices();
        }
    }

    move(x,y) {
        this.x += x;
        this.y += y;
        for (var c of this.children) {
            c.move(x,y);
        }
    }

    getNode(x,y) {
        var ret = null;
        if (this.y <= y) {
            if (this.y + size >= y && this.x <= x && this.x + size >= x) {
                ret = this;
            } else {
                for (var c of this.children) {
                    ret = c.getNode(x,y);
                    if (ret != null) break;
                }        
            }
        }
        return ret;
    }

    getRoot() {
        var ret = this;
        if (this.parent != null) {
            ret = this.parent.getRoot();
        }
        return ret;
    }

    drawNode(ctx) {
        if (this.selected) {
            ctx.fillStyle = "#FFF";
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(this.x, this.y, size, size);

        if (this.active) {
            ctx.fillStyle = "#FFF";
            ctx.fillRect(this.x+size/4, this.y+size/4, size/2, size/2);
        }
        if (this.state == "failed") {
            ctx.fillStyle = "#F00";
            ctx.fillRect(this.x+size/4, this.y+size/4, size/2, size/2);
        }
        if (this.state == "success") {
            ctx.fillStyle = "#0F0";
            ctx.fillRect(this.x+size/4, this.y+size/4, size/2, size/2);
        }
        ctx.strokeStyle = "#000";
        for (var c of this.children) {
            ctx.beginPath();
            ctx.moveTo(this.x + size/2, this.y + size);
            ctx.lineTo(c.x + size/2, c.y + size/2);
            ctx.stroke();
            c.drawNode(ctx);
        }
        ctx.fillStyle = "#FFF";
        ctx.font = "10px Arial";
        ctx.fillText(this.name, this.x, this.y);
    }
}

class ParentNode extends BNode {
    constructor(parent, name) {
        super(parent, name);
        this.maxIndex = 0;
        this.index = 0;
    }

    tick(tree) {
        if (this.index <= this.maxIndex) {
            tree.setActive(this.children[this.index++]);
        } else {
            if (this.children[this.index-1].state == "success") {
                this.state = "success";
            } else {
                this.state = "failed";
            }
            if (this.parent != null) {
                tree.setActive(this.parent);
            } else {
                this.resetIndices();
            }
        }
    }
}

class SelectorNode extends ParentNode {
    constructor(parent, name) {
        super(parent, name);
        this.color = "#600";
    }

    tick(tree) {
        if (this.index > 0 && this.children[this.index-1].state == "success") {
            this.state == "success";
            this.index = this.maxIndex+1;
        }
        if (this.index <= this.maxIndex) {
            tree.setActive(this.children[this.index++]);
        } else {
            if (this.children[this.index-1].state == "failed") {
                this.state = "failed";
            } else {
                this.state = "success";
            }            
            tree.setActive(this.parent);
        }
    }
}

class SequenceNode extends ParentNode {
    constructor(parent, name) {
        super(parent, name);
        this.color = "#006";
    }

    tick(tree) {
        if (this.index > 0 && this.children[this.index-1].state == "failed") {
            this.state == "failed";
            this.index = this.maxIndex+1;
        }
        if (this.index <= this.maxIndex) {
            tree.setActive(this.children[this.index++]);
        } else {
            if (this.children[this.index-1].state == "success") {
                this.state = "success";
            } else {
                this.state = "failed";
            }
            tree.setActive(this.parent);
        }
    }
}

class ActionNode extends BNode {
    constructor(parent, name, action) {
        super(parent, name);
        this.action = action;
        this.color = "#060";
    }

    tick(tree) {
        if (this.state != "running") {
            this.state = "running";
            this.action();
        }
        // console.log(this.state);
    }

    finish(state, tree) {
        if (state) {
            this.state = "success";
        } else {
            this.state = "failed";
        }
        tree.setActive(this.parent);
    }
}

/*

    getLevelPops(level) {
        level[this.level] = 1;
        for (var c of this.children) {
            var temp = []
            c.getLevelPops(temp);
            for (var i = this.level+1; i < temp.length; i++) {
                if (level[i] == undefined) {
                    level[i] = temp[i];
                } else {
                    level[i] += temp[i];
                }
            }
        }
    }

    getRight(level, x) {
        var ret = [];
        if (this.level >= level && this.x > x) {
            ret.push(this);
        }
        for (var c of this.children) {
            ret = ret.concat(c.getRight(level, x));
        }

        return ret;
    }

    getRightNode() { // Returns the right neighbor of equal or lower level
        var nodes = this.getRoot().getRight(this.level, this.x);
        var right = nodes.pop();
        for (var n of nodes) {
            if (n.x < right.x) right = n;
        }
        return right;
    }

    getLeft(level, x) { // Forgive my brute force solution
        var ret = [];
        if (this.level >= level && this.x < x) {
            ret.push(this);
        }
        for (var c of this.children) {
            ret = ret.concat(c.getLeft(level, x));
        }

        return ret;
    }

    getLeftNode() { // Returns the right neighbor of equal or lower level
        var nodes = this.getRoot().getLeft(this.level, this.x);
        var left = nodes.pop();
        for (var n of nodes) {
            if (n.x > left.x) left = n;
        }
        return left;
    }

*/