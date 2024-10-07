window.decorate = {
    parse:() => {
        const lump = wad.FindFirstLumpOfName("DECORATE");

        if (lump < 0) return;

        console.log(lump);

        const AsciiDeclarations = wad.ReadLump(
            lump,
            (offset)=>{
                return ascii[wad.ReadByte(offset)]
            },1
        ).join("");

        console.log(AsciiDeclarations);
    }
}