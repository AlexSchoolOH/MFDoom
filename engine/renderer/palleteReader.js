window.pallete = {
    palletes: [],
    currentPallete: 0,
    use:0,

    readPlayPal:() => {
        window.pallete.use = 0;
        window.pallete.palletes = [];
        if (wad.FindFirstLumpOfName("PLAYPAL") >= 0) {
            window.pallete.use = 1;

            //Read the PlayPal
            const palleteID = wad.FindFirstLumpOfName("PLAYPAL");
            window.pallete.palletes = wad.ReadLump(palleteID,(offset) => {
                const pallete = [];
                for (let index = 0; index < 768; index+=3) {
                    let oIndex = index + offset;
                    pallete.push([wad.ReadByte(oIndex,false) / 255,wad.ReadByte(oIndex+1,false) / 255,wad.ReadByte(oIndex+2,false) / 255]);
                }
                return pallete;
            },768)
        };

        window.pallete.setPallete(0);
    },

    setPallete:(id) => {
        window.pallete.currentPallete = id;
        Object.keys(renderer.shaders).forEach(shader => {
            renderer.gl.useProgram(renderer.shaders[shader].program);
            twgl.setUniforms(renderer.shaders[shader],{u_usePallete:window.pallete.use,u_pallete:window.pallete.palletes[id].flat()});
        });
    },
};