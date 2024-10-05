renderer.create(document.getElementById("stage"));
window.wadRead = () => {
    //Read our wad data.
    wad.TYPE = wad.ReadString(0,4);
    console.log(`Wad is an ${wad.TYPE}`);

    wad.LUMPCOUNT = wad.Read4Bytes(4);
    console.log(`Wad has ${wad.LUMPCOUNT} lumps`);

    wad.LUMPOFFSET = wad.Read4Bytes(8);
    console.log(`Lumps start at ${wad.LUMPOFFSET}`);
    
    //Make lump directory
    wad.DIRECTORY = [];
    for (let lumpID = 0; lumpID < wad.LUMPCOUNT; lumpID++) {
        const readID = wad.LUMPOFFSET + (lumpID * 16);
        wad.DIRECTORY.push({
            Name:wad.ReadString(readID + 8,8),
            Offset:wad.Read4Bytes(readID),
            Size:wad.Read4Bytes(readID + 4)
        });
    }

    window.textures.registerAll();

    if (wad.FindFirstLumpOfName("MAP01") >= 0) {
        levelParser.read("MAP01");
    }
    else if (wad.FindFirstLumpOfName("E1M1") >= 0) {
        levelParser.read("E1M1");
    }
    else {
        console.error("No first map.");
    }

    window.pallete.readPlayPal();

    setInterval(() => {
        let aspectRatio = renderer.gl.canvas.width / renderer.gl.canvas.height;
        renderer.gl.clear(renderer.gl.DEPTH_BUFFER_BIT);
        if (levelParser.levelData) {
            //Entity Update Routine
            if (levelParser.levelData.things) {
                levelParser.levelData.things.forEach(thing => {
                    thing._update();
                });
            }

            //Level Draw Routine
            if (levelParser.levelData.sectors) {
                renderer.gl.viewport(0, 0, renderer.gl.canvas.width, renderer.gl.canvas.height);
                renderer.gl.useProgram(renderer.shaders.unlit.program);
                twgl.setUniforms(renderer.shaders.unlit,{u_camera:renderer.camera, u_aspect:aspectRatio});
    
                levelParser.levelData.subsectors.forEach(subsector => {
                    if (!subsector.mesh) return;
                    twgl.setBuffersAndAttributes(renderer.gl, renderer.shaders.unlit, subsector.mesh);
                    twgl.drawBufferInfo(renderer.gl, subsector.mesh);
                });
    
                levelParser.levelData.sectors.forEach(sector => {
                    if (!sector.mesh) return;
                    twgl.setBuffersAndAttributes(renderer.gl, renderer.shaders.unlit, sector.mesh);
                    twgl.drawBufferInfo(renderer.gl, sector.mesh);
                });
            }
        }
    },16)
}