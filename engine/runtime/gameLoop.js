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
            twgl.setUniforms(renderer.shaders.unlit,{u_camera:renderer.camera, u_aspect:aspectRatio, u_texture:textures.sheet});

            levelParser.levelData.subsectors.forEach(subsector => {
                if (!subsector.mesh) return;
                const seg = levelParser.levelData.segs[subsector.first];
                const sidedef = levelParser.levelData.sideDefs[(seg.direction == 1) ? levelParser.levelData.linedefs[seg.linedef].back : levelParser.levelData.linedefs[seg.linedef].front];
                const sector = levelParser.levelData.sectors[sidedef.sector].lightLevel;

                twgl.setUniforms(renderer.shaders.unlit,{u_sectorBrightness:sector});
                twgl.setBuffersAndAttributes(renderer.gl, renderer.shaders.unlit, subsector.mesh);
                twgl.drawBufferInfo(renderer.gl, subsector.mesh);
            });

            levelParser.levelData.sectors.forEach(sector => {
                if (!sector.mesh) return;
                twgl.setBuffersAndAttributes(renderer.gl, renderer.shaders.unlit, sector.mesh);
                twgl.setUniforms(renderer.shaders.unlit,{u_sectorBrightness:sector.lightLevel});
                twgl.drawBufferInfo(renderer.gl, sector.mesh);
            });
        }
    }
},16)