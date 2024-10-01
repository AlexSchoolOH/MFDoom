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

    if (wad.FindFirstLumpOfName("MAP01") > 0) {
        levelParser.read("MAP01");
    }
    else if (wad.FindFirstLumpOfName("E1M1") > 0) {
        levelParser.read("E1M1");
    }
    else {
        console.error("No first map.");
    }

    renderer.gl.clearColor(0,0,0,1);
    renderer.gl.enable(renderer.gl.DEPTH_TEST);
    renderer.gl.depthFunc(renderer.gl.LEQUAL);

    setInterval(() => {
        renderer.gl.clear(renderer.gl.DEPTH_BUFFER_BIT);
        if (levelParser.levelData && levelParser.levelData.subsectors) {
            renderer.gl.viewport(0, 0, 600, 300);
            renderer.gl.useProgram(renderer.shaders.unlit.program);
            twgl.setUniforms(renderer.shaders.unlit,{u_camera:renderer.camera});

            levelParser.levelData.subsectors.forEach(subsector => {
                if (!subsector.mesh) return;
                twgl.setBuffersAndAttributes(renderer.gl, renderer.shaders.unlit, subsector.mesh);
                twgl.drawBufferInfo(renderer.gl, subsector.mesh);
            });
        }
    },16)
}