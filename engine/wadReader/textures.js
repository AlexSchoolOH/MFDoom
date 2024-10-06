window.textures = {
    textureDefs: {},
    texture:{},
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
            const name = texture.match(/".*"/g)[0].replaceAll("\"","");
            const initilization = texture.split("\n")[0].split(",");
            const texWidth = Number(initilization[1].replaceAll(/\s/g,""));
            const texHeight = Number(initilization[2].replaceAll(/\s/g,""));

            //I'm gonna trust we don't use multiple patches
            window.textures.textureDefs[name] = {
                width:texWidth,
                height:texHeight
            }

            if (texHeight > maxHeight) maxHeight = texHeight;
            width += texWidth;
        });

        //Whoops lets make our textures
        const textureArray = new Uint8Array(maxHeight * width * 4);
        const textureNames = Object.keys(window.textures.textureDefs);

        //Hell
        let XOffset = 0;
        for (let TID = 0; TID < textureNames.length; TID++) {
            const textureName = textureNames[TID];
            const texture = window.textures.textureDefs[textureName];

            const textureLump = wad.FindFirstLumpOfName(textureName);

            //FUUUUUUUUCK!
            const headerEnd = 8 + (4 * texture.width);
            const textureIndexes = wad.ReadLump(textureLump,(offset) => {
                return wad.ReadByte(offset);
            },1);

            textureIndexes.splice(0,headerEnd);

            //This shit barely works
            for (let Y = 0; Y < texture.height; Y++) {
                for (let X = 0; X < texture.width; X++) {
                    //R=0 G=1 B=2 A=3
                    const pos = (Y * (texture.width + 5)) + X + 3;
                    textureArray[((X * width) + Y + XOffset) * 4] = /*(X/texture.width) * 255*/pallete.palletes[pallete.currentPallete][textureIndexes[pos]][0] * 255;
                    textureArray[((X * width) + Y + XOffset) * 4 + 1] = /*(Y/texture.height) * 255*/pallete.palletes[pallete.currentPallete][textureIndexes[pos]][1] * 255;
                    textureArray[((X * width) + Y + XOffset) * 4 + 2] = pallete.palletes[pallete.currentPallete][textureIndexes[pos]][2] * 255;
                    textureArray[((X * width) + Y + XOffset) * 4 + 3] = 255;
                }
            }

            texture.position = [XOffset / width, 0, texture.width / width, texture.height / maxHeight];

            XOffset += texture.width;
        }

        //Make that texture
        window.textures.sheet = twgl.createTexture(renderer.gl,{
            target:renderer.gl.TEXTURE_2D,
            minMag:renderer.gl.NEAREST,
            src:textureArray,
            width:width,
            height:maxHeight,
            internalFormat:renderer.gl.RGBA,
            format:renderer.gl.RGBA,
            type:renderer.gl.UNSIGNED_BYTE,
        });
    }
}