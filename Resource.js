class Resource extends StaticEntity {
    constructor(position, type, rotation, spin) {
        super(position, type, rotation);
        this.spin = spin;
        this.type = type;
        this.timer = 30;
    }

    static create(position, type, rotation, spin) {
        var obj = new Resource(position, type, rotation, spin);
        game.addEntity(obj);
        return obj;
    }

    remove() {
        game.remove(this);
    }

    takeDamage(other) {
        if (this.type == "rawMeat" && other.type == "fire" || other.type == "plasma") {
            this.type = "cookedMeat";
            this.sprite = assetMgr.getSprite(this.type);
        }
    }

    emit() {
        var p = new Particles(this.position.clone(), Vector.up().mult(3));
        p.preset("collect");
        switch(this.type) {
            case "rawMeat":
                p.hue = 60;
                break;
            case "cookedMeat":
                p.hue = 0;
                p.bright = 192;
                break;
            case "metal":
                p.hue = 256;
                break;
            case "dna":
                p.hue = 180;
                break;
        }
        p.init();
    }

    draw(ctx, dt) {
        this.rotation += 0.01;
        this.elapsedTime += dt;
        this.timer--;
        this.sprite.drawSprite(ctx, this.elapsedTime, this.position.x, this.position.y, 
            0/*this.position.z*/, this.rotation, this.bounce += .075, this.spin, true);
    }

    save() {
        return JSON.stringify({position:this.position, type:this.type, 
            rotation:this.rotation, spin:this.spin, timer:this.timer});
    }

    static load(data) {
        data = JSON.parse(data);
        var obj = Resource.create(Vector.create(data.position), data.type, data.rotation, data.spin);
        obj.timer = data.timer;
        return obj;
    }
}