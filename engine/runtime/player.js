entities.player = class extends entities.base {
    init() {
        console.log(`Player at ${this.x} ${this.y} ${this.z}!`);
        renderer.camera[2] = this.x;
        renderer.camera[5] = this.y;
        renderer.camera[8] = this.z;

        this.cameraHeight = 41;

        this.viewBob = 1
        this.viewBobSpeed = 20;

        this.cameraOffset = 0;
        this.cameraBob = 0;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.roll = 0;
    }

    update() {
        if (window.inputs.keys["w"]) {this.vz += 0.25 * renderer.camera[1]; this.vx -= 0.25 * renderer.camera[0];}
        if (window.inputs.keys["s"]) {this.vz -= 0.25 *renderer.camera[1]; this.vx += 0.25 * renderer.camera[0];}
        if (window.inputs.keys["a"]) {this.vx -= 0.25 * renderer.camera[1]; this.vz -= 0.25 * renderer.camera[0];}
        if (window.inputs.keys["d"]) {this.vx += 0.25 * renderer.camera[1]; this.vz += 0.25 * renderer.camera[0];}

        const currentSubsector = bsp.traverseToBottom(this.x,this.z);
        const segment = levelParser.levelData.segs[currentSubsector.first];
        const linedef = levelParser.levelData.linedefs[segment.linedef];
        const sector = levelParser.levelData.sectors[(segment.direction == 1) ? 
        levelParser.levelData.sideDefs[linedef.back].sector : 
        levelParser.levelData.sideDefs[linedef.front].sector];

        if (this.y < sector.floorHeight) {this.y = sector.floorHeight; this.vy = 0;}
        else if (this.y > sector.floorHeight) {this.y += this.vy;  this.vy -= 0.125}

        this.x += this.vx;
        this.z += this.vz;

        this.vx *= 0.9;
        this.vz *= 0.9;

        this.currentSpeed = Math.sqrt(Math.pow(this.vx,2) + Math.pow(this.vz,2));
        this.cameraBob += this.currentSpeed;
        this.cameraOffset *= 0.75;
        this.cameraOffset += Math.sin(this.cameraBob * 0.075) * Math.min(1,this.currentSpeed);

        if (window.inputs.keys["1"]) this.angle -= 0.05;
        if (window.inputs.keys["2"]) this.angle += 0.05;
        if (window.inputs.keys["1"]) this.roll -= 0.0125;
        if (window.inputs.keys["2"]) this.roll += 0.0125;

        this.roll *= 0.925;

        renderer.camera[2] = this.x;
        renderer.camera[5] = this.y + this.cameraHeight + this.cameraOffset;
        renderer.camera[8] = this.z;

        renderer.camera[0] = Math.sin(-this.angle);
        renderer.camera[1] = Math.cos(-this.angle);

        renderer.camera[6] = Math.sin(-this.roll);
        renderer.camera[7] = Math.cos(-this.roll);
    }
}