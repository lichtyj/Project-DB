class Vector { // Ignores z in all non-elementary calcs
    constructor(x, y, z) {
        if (arguments.length == 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        if (z == undefined) {
            this.z = 0;
        }
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }

    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    limit(max) {
        var last = Math.abs(this.z) | 0;
        var mag = this.magnitude();
        if (mag > max) this.div(mag/max);
        if (Math.abs(this.z > last)) this.z = last;
        return this;
    }

    average(vector, amount) {
        if (amount == undefined) amount = 1;
        this.mult(amount);
        this.add(vector);
        this.div(amount + 1);
    }

    angle() {
        var a = Math.atan(this.y/this.x);
        if (this.x < 0) a += Math.PI;
        if (this.x == 0) a = Math.PI*Math.sign(this.y);
        return a;
    }
    
    angleTo(vector) {
        if (vector instanceof Vector) {
            var a = Math.atan((vector.y - this.y)/(vector.x - this.x));
            if (vector.x < this.x) a += Math.PI;
            return a;
        }
    }

    toAngle(angle) {
        var mag = this.magnitude();
        if (mag < 1) mag = 1;
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
        this.mult(mag);
        return this;
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitude3D() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    MagnitudeSqrd() {
        return this.x * this.x + this.y * this.y;
    }

    MagnitudeSqrd3D() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    equals(other) {
        if (!(other instanceof Vector)) return false;
        return (this.x == other && this.y == other.y && this.z == other.z);
    }

    clone() {
        return new Vector(this.x, this.y, this.z);
    }

    set(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    offset(angle, offset) {
        return new Vector(this.x + Math.cos(offset.angle() + angle.angle()) * offset.magnitude(), 
                          this.y + Math.sin(offset.angle() + angle.angle()) * offset.magnitude(), 
                          this.z + offset.z);
    }

    static random(max) {
        if (max == undefined) max = 1;
        var v = new Vector((Math.random()*2-1)*max, (Math.random()*2-1)*max, 0);
        return v.limit(max);
    }

    static randomPositive(max, bounded) {
        if (max == undefined) max = 1;
        if (bounded == undefined) bounded = true;
        var v = new Vector(Math.random()*max, Math.random()*max, 0);
        if (bounded) v.limit(max);
        return v;
    }

    static random3D(max) {
        if (max == undefined) max = 1;
        var v = new Vector((Math.random()*2-1)*max, (Math.random()*2-1)*max, (Math.random()*2-1)*max);
        return v.limit(max);
    }

    static distance(me, other) {
        return Math.sqrt(Math.pow(me.x - other.x, 2) + Math.pow(me.y - other.y, 2));
    }

    static distanceSqrd(me, other) {
        return Math.pow(me.x - other.x, 2) + Math.pow(me.y - other.y, 2);
    }

    static distance3D(me, other) {
        return Math.sqrt(Math.pow(me.x - other.x, 2) + Math.pow(me.y - other.y, 2) + Math.pow(me.z - other.z, 2));
    }

    static distanceSqrd3D(me, other) {
        return Math.pow(me.x - other.x, 2) + Math.pow(me.y - other.y, 2) + Math.pow(me.z - other.z, 2);
    }

    //TODO return an encapsulated version of these.  Single instance - no GC    
    static zero() {
        return new Vector(0, 0, 0);
    }

    static left() {
        return new Vector(-1, 0, 0);
    }

    static right() {
        return new Vector(1, 0, 0);
    }

    static forward() {
        return new Vector(0, -1, 0);
    }

    static back() {
        return new Vector(0, 1, 0);
    }

    static up() {
        return new Vector(0, 0, 1);
    }
    
    static down() {
        return new Vector(0, 0, -1);
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle), 0);
    }

    static create(v) {
        return new Vector(v.x, v.y, v.z);
    }
}