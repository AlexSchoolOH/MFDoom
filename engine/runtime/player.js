entities.player = class extends entities.base {
    init() {
        console.log(`Player at ${this.x} ${this.y} ${this.z}!`);
        renderer.camera[2] = this.x;
        renderer.camera[5] = this.y;
        renderer.camera[8] = this.z;
    }

    update() {
        if (window.inputs.keys["w"]) renderer.camera[8] += 0.5;
        if (window.inputs.keys["s"]) renderer.camera[8] -= 0.5;
        if (window.inputs.keys["a"]) renderer.camera[2] -= 0.5;
        if (window.inputs.keys["d"]) renderer.camera[2] += 0.5;
        if (window.inputs.keys["q"]) renderer.camera[5] -= 0.5;
        if (window.inputs.keys["e"]) renderer.camera[5] += 0.5;

        if (window.inputs.keys["1"]) this.angle -= 0.05;
        if (window.inputs.keys["2"]) this.angle += 0.05;

        renderer.camera[0] = Math.sin(-this.angle);
        renderer.camera[1] = Math.cos(-this.angle);
    }
}