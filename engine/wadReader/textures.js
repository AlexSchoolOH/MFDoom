window.textures = {
    textureDefs: {},
    registerAll: () => {
        //Grab our texture lump
        window.textures.textureDefs = {};
        const AsciiDeclarations = wad.ReadLump(
            wad.FindFirstLumpOfName("TEXTURES"),
            (offset)=>{
                return ascii[wad.ReadByte(offset)]
            },1
        ).join("").match(/Texture.*".*",.*,.*\n{[.\t\n\d\w\s",]*}/g);

        let maxHeight = 0;
        let width = 0;

        AsciiDeclarations.forEach(texture => {
            console.log(texture);
            const name = texture.match(/".*"/g)[0];
            const initilization = texture.split("\n")[0].split(",");
            const texWidth = Number(initilization[1].replaceAll(/\s/g,""));
            const texHeight = Number(initilization[2].replaceAll(/\s/g,""));

            window.textures.textureDefs[name] = {
                width:texWidth,
                height:texHeight
            }

            if (texHeight > maxHeight) maxHeight = texHeight;
            width += texWidth;
        });

        //Whoops
        const textureArray = new Uint8Array(maxHeight * width * 4);
        console.log(textureArray.length);
    }
}