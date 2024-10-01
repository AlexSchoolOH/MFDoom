window.entities = {};
window.entities.base = class {
    constructor(x,y,z,angle,flags) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.angle = angle;
        this.flags = flags;

        this.init();
    }

    init() {}

    _update() {
        this.update();
    }

    update() {}

    _draw() {
        this.draw();
    }

    draw() {}
}
