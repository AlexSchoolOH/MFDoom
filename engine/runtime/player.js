entities.player = class extends entities.base {
    init() {
        console.log(`Player at ${this.x} ${this.y} ${this.z}!`);
        renderer.camera[2] = this.x;
        renderer.camera[5] = this.y;
        renderer.camera[8] = this.z;
    }
}