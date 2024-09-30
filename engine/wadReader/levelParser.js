window.levelParser = {
    levelData: {},

    read:(LEVEL_NAME) => {
        LumpID = wad.FindFirstLumpOfName(LEVEL_NAME);

        window.levelParser.levelData.ID = LEVEL_NAME;

        //Read our vertices
        window.levelParser.levelData.vertices = wad.ReadLump(LumpID + wad.mapIndicies.VERTEX, (offset) => {
            return [wad.Read2Bytes(offset,true),wad.Read2Bytes(offset + 2,true)];
        },4);

        window.levelParser.levelData.linedefs = wad.ReadLump(LumpID + wad.mapIndicies.LINEDEF, (offset) => {
            return {
                start:wad.Read2Bytes(offset,false),
                end:wad.Read2Bytes(offset + 2,false),
                flags:wad.Read2Bytes(offset + 4,false),
                type:wad.Read2Bytes(offset + 6,false),
                tag:wad.Read2Bytes(offset + 8,false),
                front:wad.Read2Bytes(offset + 10,false),
                back:wad.Read2Bytes(offset + 12,false)
            };
        },14);

        window.levelParser.levelData.sectors = wad.ReadLump(LumpID + wad.mapIndicies.LINEDEF, (offset) => {
            return {
                floorHeight:wad.Read2Bytes(offset,true),
                ceilingHeight:wad.Read2Bytes(offset + 2,true),
                floorFlat:wad.ReadString(offset + 4,8),
                ceilFlat:wad.ReadString(offset + 12,8),
                lightLevel:wad.Read2Bytes(offset + 20,true),
                type:wad.Read2Bytes(offset + 22,true),
                tag:wad.Read2Bytes(offset + 24,true)
            };
        },26);

        window.levelParser.levelData.sideDefs = wad.ReadLump(LumpID + wad.mapIndicies.SIDEDEF, (offset) => {
            return {
                x:wad.Read2Bytes(offset,true),
                y:wad.Read2Bytes(offset + 2,true),
                upper:wad.ReadString(offset + 4,8),
                lower:wad.ReadString(offset + 12,8),
                middle:wad.ReadString(offset + 20,8),
                sector:wad.Read2Bytes(offset + 28,true),
            };
        },30);

        window.levelParser.levelData.segs = wad.ReadLump(LumpID + wad.mapIndicies.SEG, (offset) => {
            return {
                start:wad.Read2Bytes(offset,false),
                end:wad.Read2Bytes(offset + 2,false),
                angle:wad.Read2Bytes(offset + 4,true),
                linedef:wad.Read2Bytes(offset + 6,false),
                direction:wad.Read2Bytes(offset + 8,true),
                offset:wad.Read2Bytes(offset + 10,true),
            };
        },12);

        window.levelParser.levelData.subsectors = wad.ReadLump(LumpID + wad.mapIndicies.SSECTOR, (offset) => {
            return {
                segCount:wad.Read2Bytes(offset,true),
                first:wad.Read2Bytes(offset + 2,true),
            };
        },4);

        window.levelParser.levelData.nodes = wad.ReadLump(LumpID + wad.mapIndicies.NODE, (offset) => {
            return {
                x:wad.Read2Bytes(offset,true),
                y:wad.Read2Bytes(offset + 2,true),
                dx:wad.Read2Bytes(offset + 4,true),
                dy:wad.Read2Bytes(offset + 6,true),
                right: [
                    wad.Read2Bytes(offset + 8,true),
                    wad.Read2Bytes(offset + 10,true),
                    wad.Read2Bytes(offset + 12,true),
                    wad.Read2Bytes(offset + 14,true),
                ],
                left: [
                    wad.Read2Bytes(offset + 16,true),
                    wad.Read2Bytes(offset + 18,true),
                    wad.Read2Bytes(offset + 20,true),
                    wad.Read2Bytes(offset + 22,true),
                ],
                rightChild:wad.Read2Bytes(offset + 24,true),
                leftChild:wad.Read2Bytes(offset + 26,true),
            };
        },28);

        window.levelParser.levelData.things = wad.ReadLump(LumpID + wad.mapIndicies.THING, (offset) => {
            return new (wad.entity[wad.Read2Bytes(offset + 6,false)] || window.entities.base)(
                wad.Read2Bytes(offset,true),
                0,
                wad.Read2Bytes(offset + 2,true),
                wad.Read2Bytes(offset + 4,true),
                wad.Read2Bytes(offset + 8,true)
            );
        },10);

        window.levelParser.levelData.blockmap = wad.ReadLump(LumpID + wad.mapIndicies.BLOCKMAP, (offset) => {
            //TODO
            return {};
        },2);

        window.levelParser.levelData.reject = wad.ReadLump(LumpID + wad.mapIndicies.REJECT, (offset) => {
            //TODO
            //EACH BIT IN THE REJECT TABLE REPRESENTS A SECTOR'S LOS
            //EXAMPLE
            // |0|1|2|3|4
            //-----------
            //0|V| |V| | 
            //-----------
            //1| |V|V| |V
            //-----------
            //2|V|V|V|V| 
            //-----------
            //3| | |V|V| 
            //-----------
            //4| |V| | |V
            //
            //V being visible
            return {};
        },1);

        console.log(`${window.levelParser.levelData.ID} has`)
        console.log(`${window.levelParser.levelData.vertices.length} verts`);
        console.log(`${window.levelParser.levelData.linedefs.length} lines`);
        console.log(`${window.levelParser.levelData.sectors.length} sectors`);
        console.log(`${window.levelParser.levelData.sideDefs.length} sides`);
        console.log(`${window.levelParser.levelData.segs.length} segments`);
        console.log(`${window.levelParser.levelData.subsectors.length} subsectors`);
        console.log(`${window.levelParser.levelData.nodes.length} nodes`);
        console.log(`${window.levelParser.levelData.blockmap.length} blocks`);
        console.log(`${window.levelParser.levelData.reject.length} rejects`);
        console.log(`${window.levelParser.levelData.things.length} things`);

        window.levelParser.parseMesh();
    },

    subsectorToMesh:(subSector,subSectorID) => {
        console.log(`Building mesh for ${subSectorID}`);
        const levelData = window.levelParser.levelData;
        const mesh = {
            a_position:{ numComponents: 3, data: []},
            a_color:{ numComponents: 3, data: []},
        };

        for (let index = 0; index < subSector.segCount; index++) {
            console.log(`Segment starts at ${subSector.first + index}`)
            const seg = levelData.segs[subSector.first + index];
            mesh.a_position.data.push(levelData.vertices[seg.start][0],-1,levelData.vertices[seg.start][1]);
            mesh.a_position.data.push(levelData.vertices[seg.end][0],-1,levelData.vertices[seg.end][1]);
            mesh.a_position.data.push(levelData.vertices[seg.end][0],1,levelData.vertices[seg.end][1]);

            mesh.a_position.data.push(levelData.vertices[seg.start][0],-1,levelData.vertices[seg.start][1]);
            mesh.a_position.data.push(levelData.vertices[seg.start][0],1,levelData.vertices[seg.start][1]);
            mesh.a_position.data.push(levelData.vertices[seg.end][0],1,levelData.vertices[seg.end][1]);

            mesh.a_color.data.push(
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0
            );
        }

        levelData.subsectors[subSectorID].mesh = twgl.createBuffersFromArrays(renderer.gl, mesh);
        console.log(Object.keys(twgl.createBuffersFromArrays(renderer.gl, mesh)));
    },

    parseMesh:() => {
        let subSectors = window.levelParser.levelData.subsectors;
        for (let subSectorID = 0; subSectorID < subSectors.length; subSectorID++) {
            window.levelParser.subsectorToMesh(subSectors[subSectorID],subSectorID);
        }
    },
};
