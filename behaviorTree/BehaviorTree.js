var ctx;
var cSize = 600;
var bt;
var size = 20;
var offset = 10;

// document.addEventListener("DOMContentLoaded", init);
function init() {
    var canvas = document.getElementById("btcanvas");
    canvas.style.background = '#888';
    canvas.width = cSize*2;
    canvas.height = cSize;
    ctx = canvas.getContext('2d');
}
class BehaviorTree {
    constructor(entity) {
        this.root = new ParentNode(null);
        this.root.name = "Root";
        this.root.x = cSize;
        this.root.y = offset;
        this.root.color = "#00F";
        this.entity = entity;
        this.selected = this.root;
        this.timer = 0;
    }

    setActive(node) {
        if (node instanceof BNode) {
            if (this.active != null) this.active.active = false;
            this.active = node;
            this.active.active = true;
        } else {
            console.error(node + " is not a node.");
        }
    }

    setSelected(node) {
        if (this.selected instanceof BNode) this.selected.selected = false;
        this.selected = node;
        if (this.selected instanceof BNode) this.selected.selected = true;
    }

    select(e) {
        var x = e.clientX - ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - ctx.canvas.getBoundingClientRect().top;
        this.setSelected(this.root.getNode(x,y));
        this.formatTree();
    }

    interrupt() {
        this.root.resetIndices();
        this.setActive(this.root);
    }

    buildTree() {

        var entity = this.entity;
        var d1, d2, d3, d4, d5;
        d1 = this.addNode(this.root, "Selector", "Live");


        // Safe?
        d2 = this.addNode(d1, "Sequence", "Danger?");
            this.addNode(d2, "Action", "Low Health?", function() {entity.getHealth()});
            this.addNode(d2, "Action", "Threats?", function() {entity.getThreat()});
            // d3 = this.addNode(d2, "Selector", "F(l?)ight");
                d3 = this.addNode(d2, "Sequence", "Fight");
                    this.addNode(d3, "Action", "Threshold", function() {entity.getAggression()});
                    this.addNode(d3, "Action", "Get Location", function() {entity.getLocation("Attack")});
                    this.addNode(d3, "Action", "Find", function() {entity.moveToFind("Attack")});
                    this.addNode(d3, "Action", "Attack", function() {entity.attack()});
                // d4 = this.addNode(d3, "Sequence", "Flight");
                // this.addNode(d4, "Action", "Safe Location", function() {entity.getLocation("Safe")});
                // this.addNode(d4, "Action", "Run", function() {entity.moveTo()});

        // Hungry
        d2 = this.addNode(d1, "Sequence", "Hungry?");
            this.addNode(d2, "Action", "Threshold", function() {entity.getStamina()});
            d3 = this.addNode(d2, "Sequence", "Find Food");
                d4 = this.addNode(d3, "Selector", "Get location");
                    this.addNode(d4, "Action", "Known", function() {entity.getLocation("Food")});
                    this.addNode(d4, "Action", "Random", function() {entity.getLocation("Random")});
                this.addNode(d3, "Action", "Find", function() {entity.moveToFind("Food")});
                this.addNode(d3, "Action", "Eat", function() {entity.eat()});

        // Mate?
        d2 = this.addNode(d1, "Sequence", "Mate?");
            this.addNode(d2, "Action", "Threshold", function() {entity.getMatingTimer()});
            var d3 = this.addNode(d2, "Sequence", "Find Mate");
                d4 = this.addNode(d3, "Selector", "Get location");
                    this.addNode(d4, "Action", "Known", function() {entity.getLocation("Mate")});
                    this.addNode(d4, "Action", "Random", function() {entity.getLocation("Random")});
                this.addNode(d3, "Action", "Find", function() {entity.moveToFind("Mate")});
                this.addNode(d3, "Action", "Mate", function() {entity.mate()});

        // Idle
        d2 = this.addNode(d1, "Sequence", "Wander");
            this.addNode(d2, "Action", "Random", function() {entity.getLocation("Random")});
            this.addNode(d2, "Action", "MoveTo", function() {entity.moveTo()});

        // init
        this.setActive(this.root);
    }

    finishAction(state) {
        if (this.active instanceof ActionNode)
            this.active.finish(state, this);
    }

    formatTree() {
        if (!this.root.checkValidity()) console.error("Invalid behavior tree");
        this.root.format();
        this.drawTree();
    }

    tick() {
        this.active.tick(this);
        return this.active.delay;
    }

    addNode(parent, type, name, arg1) {
        var newNode;
        switch(type) {
            case "Selector":
                newNode = new SelectorNode(parent, name);
                break;
            case "Sequence":
                newNode = new SequenceNode(parent, name);
                break;
            case "Action":
                newNode = new ActionNode(parent, name, arg1);
                break;
            default:
                newNode = new ParentNode(parent, name);
                break;
        }
        var maxX = parent.x;    // This can go away.  From here
        parent.width = size*2;
        for (var c of parent.children) {
            maxX = c.x;
            c.x -= size;
            parent.width += c.width;
        }
        if (parent.children.length != 0) {
            newNode.x = maxX+size;
        } else {
            newNode.x = maxX;
        }
        newNode.y = newNode.level*size*2+offset; // To here.
        parent.children.push(newNode);
        return newNode;
    }

    drawTree() {
        // ctx.canvas.width = ctx.canvas.width;
        // this.root.drawNode(ctx);
    }
}