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

        window.levelParser.levelData.sectors = wad.ReadLump(LumpID + wad.mapIndicies.SECTOR, (offset) => {
            console.log(`Sector id ${offset}`);
            console.log(wad.Read2Bytes(offset,true));
            console.log(wad.Read2Bytes(offset + 2,true));
            return {
                floorHeight:wad.Read2Bytes(offset,true),
                ceilingHeight:wad.Read2Bytes(offset + 2,true),
                floorFlat:wad.ReadString(offset + 4,8),
                ceilFlat:wad.ReadString(offset + 12,8),
                lightLevel:wad.Read2Bytes(offset + 20,false),
                type:wad.Read2Bytes(offset + 22,false),
                tag:wad.Read2Bytes(offset + 24,false),
                lines:[]
            };
        },26);

        window.levelParser.levelData.sideDefs = wad.ReadLump(LumpID + wad.mapIndicies.SIDEDEF, (offset) => {
            return {
                x:wad.Read2Bytes(offset,true),
                y:wad.Read2Bytes(offset + 2,true),
                upper:wad.ReadString(offset + 4,8),
                lower:wad.ReadString(offset + 12,8),
                middle:wad.ReadString(offset + 20,8),
                sector:wad.Read2Bytes(offset + 28,false),
            };
        },30);

        window.levelParser.levelData.segs = wad.ReadLump(LumpID + wad.mapIndicies.SEG, (offset) => {
            return {
                start:wad.Read2Bytes(offset,false),
                end:wad.Read2Bytes(offset + 2,false),
                angle:wad.Read2Bytes(offset + 4,true),
                linedef:wad.Read2Bytes(offset + 6,false),
                direction:wad.Read2Bytes(offset + 8,false),
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
                rightChild:wad.Read2Bytes(offset + 24,false),
                leftChild:wad.Read2Bytes(offset + 26,false),
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

    //Doing this because triangulating segs is a pain in the arse.
    //And I really need these paths to calculate the BSP differentials from a subsector
    getBSPTreeForSubSectors:(startingNode,path) => {
        const levelData = window.levelParser.levelData;
        if (typeof startingNode === "undefined") {
            window.levelParser.getBSPTreeForSubSectors(levelData.nodes.length - 1, []);
        }
        else {
            const currentNode = levelData.nodes[startingNode];
            path.push(startingNode);

            if (currentNode.rightChild >= bsp.subSectorID) {
                startingNode = currentNode.rightChild - bsp.subSectorID;
                window.levelParser.levelData.subsectors[startingNode].path = path;
            }
            else {
                window.levelParser.getBSPTreeForSubSectors(currentNode.rightChild,[...path]);
            }

            if (currentNode.leftChild >= bsp.subSectorID) {
                startingNode = currentNode.leftChild - bsp.subSectorID;
                window.levelParser.levelData.subsectors[startingNode].path = path;
            }
            else {
                window.levelParser.getBSPTreeForSubSectors(currentNode.leftChild,[...path]);
            }
        }
    },

    subSectorToMesh:(subSector,subSectorID) => {
        const levelData = window.levelParser.levelData;
        const mesh = {
            a_position:{ numComponents: 3, data: []},
            a_color:{ numComponents: 3, data: []},
        };

        let points = [];

        const firstSeg = levelData.segs[subSector.first];
        const firstLinedef = levelData.linedefs[firstSeg.linedef];
        let mainSector = (firstSeg.direction == 1 ? levelData.sideDefs[firstLinedef.back] : levelData.sideDefs[firstLinedef.front]) || 65535;
        mainSector = levelData.sectors[mainSector.sector];

        console.log(subSector.path.length)

        //Add explicit points and walls
        for (let index = 0; index < subSector.segCount; index++) {
            //Sidedefs and stuff
            const seg = levelData.segs[subSector.first + index];
            const linedef = levelData.linedefs[seg.linedef];

            points.push(levelData.vertices[seg.start]);

            points[points.length - 1].push(Math.atan2(
                levelData.vertices[seg.end][1] - levelData.vertices[seg.start][1],
                levelData.vertices[seg.end][0] - levelData.vertices[seg.start][0]
            ));

            const frontSideDef = (seg.direction == 1 ? levelData.sideDefs[linedef.back] : levelData.sideDefs[linedef.front]) || 65535;
            const backSideDef = (seg.direction == 1 ? levelData.sideDefs[linedef.front] : levelData.sideDefs[linedef.back]) || 65535;

            const frontSector = levelData.sectors[frontSideDef.sector];
            const backSector = levelData.sectors[backSideDef.sector];

            //The actual wall
            if (linedef.back == 65535) {
                //UGHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.floorHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.ceilingHeight,levelData.vertices[seg.start][1]);
    
                mesh.a_color.data.push(
                    1,0,0,
                    0,0,0,
                    0,1,0,
                    1,0,0,
                    0,1,0,
                    1,1,0
                );
            }
            else {
                //Ceiling
                if (frontSector.ceilingHeight > backSector.ceilingHeight) {
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],backSector.ceilingHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  backSector.ceilingHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],backSector.ceilingHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.ceilingHeight,levelData.vertices[seg.start][1]);
        
                    mesh.a_color.data.push(
                        1,0,0,
                        0,0,0,
                        0,1,0,
                        1,0,0,
                        0,1,0,
                        1,1,0
                    );
                }
                
                //floor
                if (frontSector.floorHeight < backSector.floorHeight) {
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  backSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  backSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],backSector.floorHeight,levelData.vertices[seg.start][1]);
        
                    mesh.a_color.data.push(
                        1,0,0,
                        0,0,0,
                        0,1,0,
                        1,0,0,
                        0,1,0,
                        1,1,0
                    );
                }
            }
        }

        for (let i_line = 0; i_line < subSector.path.length - 1; i_line++) {
            for (let j_line = i_line + 1; j_line < subSector.path.length; j_line++) {
                console.log(`i ${i_line} j ${j_line}`)
                const node1 = levelData.nodes[subSector.path[i_line]];
                const node2 = levelData.nodes[subSector.path[j_line]];
                const point = bsp.findIntersection(node1,node2);
                if (!point) continue;
                console.log(`calculated point ${JSON.stringify(point)}`);

                let dist = (l) => bsp.perpDot(point,[l.dx,l.dy]) + bsp.perpDot([l.dx,l.dy],[l.x,l.y]);
                let within_bsp = (d) => d >= -1e-3;
                let within_seg = (d) => d <= 10;
                let convert = (l) => levelData.nodes[l];
                // The intersection point must lie both within the BSP volume
                // and the segs volume.
                let inside_bsp_and_segs = subSector.path.map(convert).map(dist).every(within_bsp)
                    && subSector.path.map(convert).map(dist).every(within_seg);
                if (inside_bsp_and_segs) {
                    points.push(point);
                    console.log(`Added point ${JSON.stringify(point)}`);
                }
                else {
                    points.push(point);
                    console.log(`Refused point ${JSON.stringify(point)}`);
                }
            }
        }

        //Floor
        if (points.length >= 3) {
            points.sort((a,b)=> a[2] - b[2]);
            for (let index = 0; index < points.length; index++) {
                points[index].splice(2, points[index].length - 2);
            }
            const cut = (points.length == 3) ? [0,1,2] : earcut(points.flat());
            //console.log(JSON.stringify(points));
            //console.log(JSON.stringify(cut));
            for (let index = 0; index < cut.length; index+=3) {
                const p1 = points[cut[index]];
                const p2 = points[cut[index+1]];
                const p3 = points[cut[index+2]];
                
                mesh.a_position.data.push(p1[0],mainSector.floorHeight,p1[1]);
                mesh.a_position.data.push(p2[0],mainSector.floorHeight,p2[1]);
                mesh.a_position.data.push(p3[0],mainSector.floorHeight,p3[1]);
                
                mesh.a_color.data.push(
                    1,1,0,
                    0,1,1,
                    1,0,1
                );
            }
        }

        mesh.a_position.data = new Float32Array(mesh.a_position.data);
        mesh.a_color.data = new Float32Array(mesh.a_color.data);

        //console.log(mesh);

        levelData.subsectors[subSectorID].mesh = twgl.createBufferInfoFromArrays(renderer.gl, mesh);
        //console.log((twgl.createBuffersFromArrays(renderer.gl, mesh)));
    },

    parseMesh:() => {
        window.levelParser.getBSPTreeForSubSectors();
        const subSectors = window.levelParser.levelData.subsectors;
        for (let subSectorID = 0; subSectorID < subSectors.length; subSectorID++) {
            window.levelParser.subSectorToMesh(subSectors[subSectorID],subSectorID);
        }
    },
};
