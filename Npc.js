class Npc extends Entity {
    constructor(position, sprite) {
        super(position, sprite);
        this.healthBar = assetMgr.getAsset("particle");
        this.vision = Math.random()*100+150;
        this.visionCone = Math.PI*(1+Math.random());
        this.canSee = [];
        this.separation = Math.random()*15+15;
        this.moveSpeed = 2;
        this.topSpeed = 1.5;
        this.runSpeed = 4;
        this.crawlSpeed = 1;
        this.ai;
        this.aiTimer = 0;

        // Survival variables
        this.health = 100;
        this.maxhealth = 100;
        this.healthThreshold = 150; // Genetic

        this.stamina = 1000;
        this.maxStamina = 1000;
        this.staminaThreshold = 500; // Genetic

        this.isMale = (Math.random()*2 | 0 == 0);
        this.aggression = Math.random() + Math.random()*this.isMale // genetic
        this.damage = 5;
        this.attacking = false;
        this.matingTimer = 0;
        this.matingThreshold = 25 // genetic

        this.targetPos = new Vector();
        this.targetEntity = null;
        this.inAction = false;
        this.find = null;
        this.idle = 0;

        this.onFire = 0;
        this.dead = false;
        this.rage = false;
        this.facing = new Vector();
    }

    static create(position, sprite) {
        var obj = new Npc(position, sprite);
        game.addEntity(obj);
        obj.init();
        return obj;
    }

    init() {
        this.ai = new BehaviorTree(this);
        this.ai.buildTree();
        this.ai.formatTree();
    }

    perceptionCheck() {
        return game.tree.retrieveCone(this.position.x, this.position.y, this.vision, this.velocity.x, this.velocity.y, this.visionCone);
    }


    ////// ACTIONS ////////////
    getLocation(type) { // Add check for memory map position
        var result = false;
        this.attacking = false;
        switch(type) {
            case "Attack":
                // Threats are expected to be evaluated prior to this step
                if (this.targetEntity != null && this.targetPos != null) {
                    this.targetPos.set(this.targetEntity.position);
                    this.topSpeed = this.runSpeed;
                    this.attacking = true;
                    result = true;   
                }
                break;
            case "Food":
                // console.error("Implement memory map");
                break; 
            case "Mate":
                
                break;
            case "Safe":
                // Threats are expected to be evaluated prior to this step
                this.targetPos.subtract(this.position);
                this.targetPos.mult(-5); // 5 should be replaced with "safe distance"
                this.targetPos.add(this.position);
                result = true;
                break;
            case "Random":
                var valid = 5
                while (valid-- > 0 && !result) {
                    this.targetPos = this.position.clone();
                    this.targetPos.add(Vector.random(this.vision*.25));
                    this.targetPos.x = Math.abs(this.targetPos.x) % worldSize;
                    this.targetPos.y = Math.abs(this.targetPos.y) % worldSize;
                    if (terrain.isAboveWater(this.targetPos)) result = true;
                }
                break;
            default:
                console.error("Bad type");
        }
        this.ai.finishAction(result);
    }

    moveToFind(type) { // Be sure to set the targetEntity to null after its been handled, setTimeout?
        if (this.targetPos != null) {
            this.direction.set(this.targetPos)
            this.direction.subtract(this.position);
            this.find = type;
            this.targetEntity = null;
            this.inAction = true;
        } else {
            this.ai.finishAction(false);
        }
    }

    moveTo() {
        if (this.targetPos instanceof Vector) {
            this.direction.set(this.targetPos)
            this.direction.subtract(this.position);
            this.inAction = true;
        } else {
            this.ai.finishAction(false);
        }
    }

    getStamina() {
        this.ai.finishAction(this.stamina < this.staminaThreshold);
    }

    getHealth() {
        this.ai.finishAction(this.health < this.healthThreshold);
    }

    getMatingTimer() {
        if (this.matingTimer < 0) this.matingTimer = 100;
        this.ai.finishAction(this.matingTimer < this.matingThreshold && this.stamina > this.staminaThreshold);
    }

    getThreat() {
        var threats = 0;
        var dist;
        for (var e of this.canSee) {
            if (e instanceof Player) { // Todo: switch to threat
                if (threats == 0) {
                    this.targetPos = e.position.clone();
                } 
                this.targetPos.add(e.position);
                dist = Vector.distance(this.position, e.position);
                if (this.targetEntity === null || dist < Vector.distance(this.position, this.targetEntity.position)) {
                    this.targetEntity = e;
                }
                threats++;
            }
        }
        if (threats > 0) this.targetPos.div(threats);
        this.ai.finishAction(threats > 0);
    }

    getAggression() {
        // console.error("Implement this");
        this.ai.finishAction(this.stamina > 0);
    }

    eat() {
        if (this.targetEntity instanceof Resource && Vector.distance(this.position, this.targetEntity.position) < 25) {// Replace with eating range?
            this.targetEntity.remove();
            this.stamina += 1000;
            this.topSpeed = this.moveSpeed;
            this.ai.finishAction(true);
        } else {
            this.ai.finishAction(false);
        }
    }

    attack() {
        this.topSpeed = this.moveSpeed;
        if (Vector.distance(this.position, this.targetEntity.position) < 40) {// Replace with attack range?  Join with eat?
            this.targetEntity.takeDamage(this);
            this.targetEntity = null;
            this.inAction = true;
            this.ai.finishAction(true);
        } else {
            this.ai.finishAction(false);
        }
    }

    mate() {
        if (Vector.distance(this.position, this.targetEntity.position) < 25) {
            var temp = this.position.clone();
            temp.average(this.targetEntity.position);
            this.chicken = Npc.create(temp, assetMgr.getSprite("chicken"));
            // console.error("baby chicken");
            this.matingTimer = 1000;
            this.targetEntity.matingTimer = 1000;
            this.ai.finishAction(true);
        } else {
            // console.error("maybe when you're older");
            this.ai.finishAction(false);
        }
    }
    ////// END ACTIONS ////////

    interrupt() {
        this.ai.interrupt();
    }

    update() {
        if (this.health <= 0) this.die();
        
        this.aiTimer--;
        if (this.rage == true && game.player != null) {
            this.targetEntity = game.player;
            this.targetPos = game.player.position.clone();
            this.attacking = true;
            this.stamina = 1000;
            this.direction.set(this.targetPos)
            this.direction.subtract(this.position);
            this.inAction = true;
        } else if (this.aiTimer <= 0) {
            this.energy--;
            this.aiTimer = this.ai.tick() + Math.random()*2;
        }

        this.canSee = this.perceptionCheck();

        // for (var e of this.canSee) {
        //     if (e instanceof Resource) {
        //         e.visible = true;
        //     }
        // }

        if (this.stamina <= 0) {
            this.topSpeed = this.crawlSpeed;
        } else {
            if (this.rage) {
                this.topSpeed = this.runSpeed;
            } else {
                this.topSpeed = this.moveSpeed;
            }
            this.stamina -= this.velocity.magnitude();
        }

        if (this.inAction && this.targetPos != null) { // Pull this out

            if (this.find != null && this.targetEntity == null) {
                var dist = this.vision;
                switch(this.find) {
                    case null:
                        break;
                    case "Attack":
                        for (var e of this.canSee) {
                            if (e instanceof Player) {
                                dist = Vector.distance(this.position, e.position);
                                if (this.targetEntity === null || dist < Vector.distance(this.position, this.targetEntity.position)) {
                                    this.targetEntity = e;
                                    this.attacking = true;
                                }
                            }
                        }
                        break;
                        case "Food":
                        for (var e of this.canSee) {
                            if (e instanceof Resource) {
                                dist = Vector.distance(this.position, e.position);
                                if (this.targetEntity === null || dist < Vector.distance(this.position, this.targetEntity.position)) {
                                    this.targetEntity = e;
                                }
                            }
                        }
                        break;
                    case "Mate":
                    for (var e of this.canSee) {
                        if (e === this) continue;
                        if (e instanceof Npc) {
                            dist = Vector.distance(this.position, e.position);
                            if (this.targetEntity === null || dist < Vector.distance(this.position, this.targetEntity.position)) {
                                this.targetEntity = e;
                            }
                        }
                    }
                        break;
                    default:
                        break;
                }
            }

            // if (this.targetEntity != null && this.targetEntity instanceof Resource) {
            //     this.targetPos.set(this.targetEntity.position);
            //     this.targetEntity.target = true;
            // }

            if (this.inAction && Vector.distance(this.position, this.targetPos) > 25) {
                if (this.velocity.magnitude() < .1) {
                    this.idle++;
                    if (this.idle > 50) {
                        this.ai.finishAction(false);
                        this.idle = 0;
                    }
                } else {
                    this.idle = 0;
                }
                this.direction.set(this.targetPos);
                this.direction.subtract(this.position).limit(1);
                this.acceleration.add(this.direction).limit(.125);
            } else if (this.rage && this.targetEntity != null) {
                this.attack();
            } else {
                this.acceleration.mult(0);
                this.targetPos = null;
                this.inAction = false;
                if (this.find != null) {
                    this.find = null;
                    this.ai.finishAction(this.targetEntity != null);
                } else {
                    this.ai.finishAction(true);
                }
            }
        }
        this.flock(this.canSee);
        super.update();
        this.facing.set(this.velocity);

        if (this.onFire) this.burn();        
    }

    burn() {
        if (Math.random()*2 | 0) {
            var p = new Particles(new Vector(this.position.x + (Math.random()*2-1), this.position.y + (Math.random()*4-2), 0), new Vector(this.velocity.x, this.velocity.y, 0));
            p.preset("fire");
            p.rate = 1;
            p.init();
        }
        this.onFire -= .01;
        if (this.onFire < 0) this.onFire = 0;
        this.health -= this.onFire/100;
    }

    die() {
        if (!this.dead) {
            if (this.onFire > 0) {
                Resource.create(this.position, "cookedMeat", Math.random()*Math.PI*2);
            } else {
                Resource.create(this.position, "rawMeat", Math.random()*Math.PI*2);
            }
            this.dead = true;
            game.remove(this);
        }
    }

    takeDamage(other) {
        this.health -= other.damage;
        var pos;
        if (other.size == undefined) {
            pos = this.position.clone();
        } else {
            pos = other.position.clone();
        }
        pos.z *= -1;
        if (other.size == undefined || other.size >= 0) {
            var p = new Particles(pos, new Vector(other.velocity.x, other.velocity.y, -other.velocity.z));
            p.velocity.div(3);
            p.preset("blood");
            p.init();
            p = new Particles(pos, new Vector(other.velocity.x, other.velocity.y, -other.velocity.z));
            p.velocity.div(2);
            p.velocity.z *= 2;
            p.preset("feathers");
            p.init();
        }
        if (other.type == "fire" || other.type == "plasma") {
            this.onFire += Math.random()*5;
        }
        this.interrupt();
    }

    flock(entities) {

        var avg = new Vector();
        var avgSep = new Vector();
        var avgPos = new Vector();
        var total = 0;
        for (var other of entities) {
            if (other instanceof Player && this.attacking) break;
            var d = Vector.distance(this.position,other.position);
            if (other != this && d < this.vision) {
                if (other instanceof Npc) {
                    avg.add(other.velocity);  // Orientation
                    avgPos.add(other.position); // Cohesion
                    total++;
                }
                if (d < this.separation && !(other instanceof Resource)) { // Separation
                    var sep = this.position.clone();
                    sep.subtract(other.position).limit(0.5);
                    var rate = (this.separation - d)/this.separation;
                    sep.mult(Math.pow(rate,2));
                    avgSep.add(sep);
                    if (other instanceof Player) {
                        avgSep.add(sep).mult(5);
                    }
                } 
            }
        }
        if (total > 0) {
            avg.add(avgPos.div(total++).subtract(this.position).limit(1)); // Cohesion
            avg.div(total).subtract(this.velocity).limit(0.05); // Orientation
        }
        if (!this.attacking) this.acceleration.add(avg);
        this.acceleration.add(avgSep); // Separation
        this.acceleration.limit(this.sprint);
    }

    draw(ctx, dt) {
        super.draw(ctx, dt, true);
        super.drawHealth(ctx);
    }

    save() {
        return JSON.stringify({position:this.position, velocity:this.velocity, 
            direction:this.direction, acceleration:this.acceleration, rotation:this.rotation, 
            gravity:this.gravity, vision:this.vision, visionCone:this.visionCone, 
            separation:this.separation, aiTimer:this.aiTimer, health:this.health, 
            stamina:this.stamina, isMale:this.isMale, aggression:this.aggression, 
            matingTimer:this.matingTimer, targetPos:this.targetPos, inAction:this.inAction, 
            find:this.find, idle:this.idle, onFire:this.onFire, dead:this.dead, rage:this.rage, 
            elapsedTime:this.elapsedTime, facing:this.facing});
    }

    static load(data) {
        data = JSON.parse(data);
        var obj = Npc.create(Vector.create(data.position), assetMgr.getSprite("chicken"));
        obj.velocity = Vector.create(data.velocity);
        obj.direction = Vector.create(data.direction);
        obj.acceleration = Vector.create(data.acceleration);
        obj.rotation = data.rotation;
        obj.gravity = data.gravity;
        obj.vision = data.vision;
        obj.visionCone = data.visionCone;
        obj.separation = data.separation;
        obj.aiTimer = data.aiTimer;
        obj.health = data.health;
        obj.stamina = data.stamina;
        obj.isMale = data.isMale;
        obj.aggression = data.aggression;
        obj.matingTimer = data.matingTimer;
        if (data.targetPos != null) obj.targetPos = Vector.create(data.targetPos);
        obj.inAction = data.inAction;
        obj.find = data.find;
        obj.idle = data.idle;
        obj.onFire = data.onFire;
        obj.dead = data.dead;
        obj.rage = data.rage;
        obj.elapsedTime = data.elapsedTime;
        obj.facing = Vector.create(data.facing);
        return obj;
    }
}