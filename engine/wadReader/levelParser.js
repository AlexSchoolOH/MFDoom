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
            let DX = Math.pow(wad.Read2Bytes(offset + 4,true),2);
            let DY = Math.pow(wad.Read2Bytes(offset + 6,true),2);

            if (isNaN(DX)) {
                DX = 0;
            }
            if (isNaN(DY)) {
                DY = 0;
            }
            const distance = Math.sqrt(DX + DY);
            return {
                x:wad.Read2Bytes(offset,true),
                y:wad.Read2Bytes(offset + 2,true),
                dx:wad.Read2Bytes(offset + 4,true) / distance,
                dy:wad.Read2Bytes(offset + 6,true) /  distance,
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

        window.levelParser.parseMesh();
    },

    //Trying something different
    getLinesForSectors() {
        const levelData = window.levelParser.levelData;
        for (let index = 0; index < levelData.linedefs.length; index++) {
            const linedef = levelData.linedefs[index];
            let front = linedef.front;
            if (front != 65535) {
                window.levelParser.levelData.sectors[levelData.sideDefs[front].sector].lines.push([index,false]);
            }
            let back = linedef.back;
            if (back != 65535) {
                window.levelParser.levelData.sectors[levelData.sideDefs[back].sector].lines.push([index,true]);
            }
        }
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
            a_texCoord:{ numComponents: 2, data: []},
            a_texBound:{ numComponents: 4, data: []},
            a_renderType:{ numComponents: 1, data: []},
        };

        let points = [];

        const firstSeg = levelData.segs[subSector.first];
        const firstLinedef = levelData.linedefs[firstSeg.linedef];
        let mainSector = (firstSeg.direction == 1 ? levelData.sideDefs[firstLinedef.back] : levelData.sideDefs[firstLinedef.front]) || 65535;
        mainSector = levelData.sectors[mainSector.sector];

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

            const distance = Math.sqrt(
                Math.pow(levelData.vertices[seg.end][0] - levelData.vertices[seg.start][0],2) +
                Math.pow(levelData.vertices[seg.end][1] - levelData.vertices[seg.start][1],2)
            )

            //The actual wall
            if (linedef.back == 65535) {
                //UGHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.floorHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.ceilingHeight,levelData.vertices[seg.end][1]);
                mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.ceilingHeight,levelData.vertices[seg.start][1]);
    
                const textureWidthMiddle = 64 * (textures.textureDefs[frontSideDef.middle].width / 64);
                const textureHeightMiddle = 64 * (textures.textureDefs[frontSideDef.middle].height / 64);

                const OffsetX = frontSideDef.x / textureWidthMiddle;
                const OffsetY = frontSideDef.y / textureHeightMiddle;

                const heightDifferenceMiddle = (frontSector.ceilingHeight - frontSector.floorHeight);

                const segEnd = (distance / textureWidthMiddle) + OffsetX;
                const topEnd = (heightDifferenceMiddle / textureHeightMiddle) + OffsetY;

                mesh.a_color.data.push(
                    1,0,0,
                    0,0,0,
                    0,1,0,
                    1,0,0,
                    0,1,0,
                    1,1,0
                );

                mesh.a_texCoord.data.push(
                    OffsetX,topEnd,
                    segEnd,topEnd,
                    segEnd,OffsetY,
                    OffsetX,topEnd,
                    segEnd,OffsetY,
                    OffsetX,OffsetY,
                );

                mesh.a_texBound.data.push(
                    ...textures.textureDefs[frontSideDef.middle].position,
                    ...textures.textureDefs[frontSideDef.middle].position,
                    ...textures.textureDefs[frontSideDef.middle].position,
                    ...textures.textureDefs[frontSideDef.middle].position,
                    ...textures.textureDefs[frontSideDef.middle].position,
                    ...textures.textureDefs[frontSideDef.middle].position
                );

                mesh.a_renderType.data.push(0);
                mesh.a_renderType.data.push(0);
                mesh.a_renderType.data.push(0);
                mesh.a_renderType.data.push(0);
                mesh.a_renderType.data.push(0);
                mesh.a_renderType.data.push(0);
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

                    const heightDifferenceUpper = frontSector.ceilingHeight - backSector.ceilingHeight;    
                    const textureWidthUpper = 64 * (textures.textureDefs[frontSideDef.upper].width / 64);
                    const textureHeightUpper = 64 * (textures.textureDefs[frontSideDef.upper].height / 64);
    
                    const OffsetX = frontSideDef.x / textureWidthUpper;
                    const OffsetY = frontSideDef.y / textureHeightUpper;
    
                    const segEnd = (distance / textureWidthUpper) + OffsetX;
                    const topEnd = (heightDifferenceUpper / textureHeightUpper) + OffsetY;
        
                    mesh.a_color.data.push(
                        1,0,0,
                        0,0,0,
                        0,1,0,
                        1,0,0,
                        0,1,0,
                        1,1,0
                    );

                    mesh.a_texCoord.data.push(
                        OffsetX,topEnd,
                        segEnd,topEnd,
                        segEnd,OffsetY,
                        OffsetX,topEnd,
                        segEnd,OffsetY,
                        OffsetX,OffsetY,
                    );

                    mesh.a_texBound.data.push(
                        ...textures.textureDefs[frontSideDef.upper].position,
                        ...textures.textureDefs[frontSideDef.upper].position,
                        ...textures.textureDefs[frontSideDef.upper].position,
                        ...textures.textureDefs[frontSideDef.upper].position,
                        ...textures.textureDefs[frontSideDef.upper].position,
                        ...textures.textureDefs[frontSideDef.upper].position
                    );

                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.ceilFlat == "F_SKY") ? 1 : 0);
                }
                
                //floor
                if (frontSector.floorHeight < backSector.floorHeight) {
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  frontSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  backSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],frontSector.floorHeight,levelData.vertices[seg.start][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.end][0],  backSector.floorHeight,levelData.vertices[seg.end][1]);
                    mesh.a_position.data.push(levelData.vertices[seg.start][0],backSector.floorHeight,levelData.vertices[seg.start][1]);

                    const heightDifferenceLower = backSector.floorHeight - frontSector.floorHeight;    
                    const textureWidthLower = 64 * (textures.textureDefs[frontSideDef.lower].width / 64);
                    const textureHeightLower = 64 * (textures.textureDefs[frontSideDef.lower].height / 64);
    
                    const OffsetX = frontSideDef.x / textureWidthLower;
                    const OffsetY = frontSideDef.y / textureHeightLower;
    
                    const segEnd = (distance / textureWidthLower) + OffsetX;
                    const topEnd = (heightDifferenceLower / textureHeightLower) + OffsetY;
        
                    mesh.a_color.data.push(
                        1,0,0,
                        0,0,0,
                        0,1,0,
                        1,0,0,
                        0,1,0,
                        1,1,0
                    );

                    mesh.a_texCoord.data.push(
                        OffsetX,topEnd,
                        segEnd,topEnd,
                        segEnd,OffsetY,
                        OffsetX,topEnd,
                        segEnd,OffsetY,
                        OffsetX,OffsetY,
                    );

                    mesh.a_texBound.data.push(
                        ...textures.textureDefs[frontSideDef.lower].position,
                        ...textures.textureDefs[frontSideDef.lower].position,
                        ...textures.textureDefs[frontSideDef.lower].position,
                        ...textures.textureDefs[frontSideDef.lower].position,
                        ...textures.textureDefs[frontSideDef.lower].position,
                        ...textures.textureDefs[frontSideDef.lower].position
                    );

                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                    mesh.a_renderType.data.push((backSector.floorFlat == "F_SKY") ? 1 : 0);
                }
            }
        }

        /* Imma stop doing subsectors for floors.
        for (let i_line = 0; i_line < subSector.path.length - 1; i_line++) {
            for (let j_line = i_line + 1; j_line < subSector.path.length; j_line++) {
                console.log(`i ${i_line} j ${j_line}`);
                const node1 = levelData.nodes[subSector.path[i_line]];
                const node2 = levelData.nodes[subSector.path[j_line]];
                console.log(node1);
                console.log(node2);
                const point = bsp.findIntersection(node1,node2);
                if (!point) continue;
                console.log(`calculated point ${JSON.stringify(point)}`);

                let dist = (l) => bsp.perpDot(point,[l.dx,l.dy]) + bsp.perpDot([l.dx,l.dy],[l.x,l.y]);
                let within_bsp = (d) => d >= -1e-3;
                let within_seg = (d) => d <= 10;
                let convert = (l) => levelData.nodes[l];
                //The intersection point must lie both within the BSP volume
                //and the segs volume.
                let inside_bsp_and_segs = subSector.path.map(convert).map(dist).every(within_bsp)
                    && subSector.path.map(convert).map(dist).every(within_seg);
                if (inside_bsp_and_segs) {
                    points.push(point);
                    console.log(`Added point ${JSON.stringify(point)}`);
                }
                else {
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
                
                mesh.a_position.data.push(p1[0],mainSector.ceilingHeight,p1[1]);
                mesh.a_position.data.push(p3[0],mainSector.ceilingHeight,p3[1]);
                mesh.a_position.data.push(p2[0],mainSector.ceilingHeight,p2[1]);
                
                mesh.a_color.data.push(
                    1,1,0,
                    0,1,1,
                    1,0,1
                );
            }
        }
        //console.log((twgl.createBuffersFromArrays(renderer.gl, mesh)));
        */

        mesh.a_position.data = new Float32Array(mesh.a_position.data);
        mesh.a_color.data = new Float32Array(mesh.a_color.data);

        //console.log(mesh);

        levelData.subsectors[subSectorID].mesh = twgl.createBufferInfoFromArrays(renderer.gl, mesh);
    },

    sectorToFlat:(sector,sectorID) => {
        const mesh = {
            a_position:{ numComponents: 3, data: []},
            a_color:{ numComponents: 3, data: []},
            a_texCoord:{ numComponents: 2, data: []},
            a_texBound:{ numComponents: 4, data: []},
            a_renderType:{ numComponents: 1, data: []},
        };

        const levelData = window.levelParser.levelData;
        let points = [];
        let holes = [];

        //Add required points
        sector.lines.forEach(line => {
            const lineDef = levelData.linedefs[line[0]];
            points.push((line[1]) ? 
            [levelData.vertices[lineDef.end][0],levelData.vertices[lineDef.end][1],levelData.vertices[lineDef.start][0],levelData.vertices[lineDef.start][1]] : 
            [levelData.vertices[lineDef.start][0],levelData.vertices[lineDef.start][1],levelData.vertices[lineDef.end][0],levelData.vertices[lineDef.end][1]]);
        });

        let median = [0,0];

        //Find the mean point
        //and also find connected points
        for (let index = 0; index < points.length; index++) {
            for (let index2 = 0; index2 < points.length; index2++) {
                if (points[index2][2] == points[index][0] && points[index2][3] == points[index][1]) {
                    points[index][4] = index2;
                    break;
                }
            }

            //A check for when we do 
            points[index][5] = false;

            median[0] += points[index][0];
            median[1] += points[index][1];
        }

        median[0] /= points.length;
        median[1] /= points.length;

        //Remove duplicate points
        points = [...new Set(points)];

        points.sort((a,b)=> {
            return a[4] - b[4];
        });

        //Cut em
        let cut = (points.length == 3) ? [0,1,2] : earcut(points.flat(),holes,6);

        cut.forEach(point => {
            points[point][5] = true;
        })
        
        //If not all points are accounted for use method 2
        if (!points.every((currentValue) => currentValue[5] == true)) {
                points.sort((a,b)=> {
                    return (Math.atan2(a[1] - median[1],a[0] - median[0]) - Math.atan2(b[1] - median[1],b[0] - median[0]));//Math.abs(
                });

                for (let index = 0; index < points.length; index++) {
                    points[index].splice(2, points[index].length - 2);
                }

                cut = (points.length == 3) ? [0,1,2] : earcut(points.flat(),holes);
        }

        //Calculate sizing
        const textureWidthFloor = 64 * (textures.textureDefs[sector.floorFlat].width / 64);
        const textureHeightFloor = 64 * (textures.textureDefs[sector.floorFlat].height / 64);

        const textureWidthCeiling = 64 * (textures.textureDefs[sector.ceilFlat].width / 64);
        const textureHeightCeiling = 64 * (textures.textureDefs[sector.ceilFlat].height / 64);

        for (let index = 0; index < cut.length; index+=3) {
            const p1 = points[cut[index]];
            const p2 = points[cut[index+1]];
            const p3 = points[cut[index+2]];

            //Floor mesher
            mesh.a_position.data.push(p1[0],sector.floorHeight,p1[1]);
            mesh.a_position.data.push(p2[0],sector.floorHeight,p2[1]);
            mesh.a_position.data.push(p3[0],sector.floorHeight,p3[1]);
            
            mesh.a_color.data.push(
                1,1,0,
                0,1,1,
                1,0,1
            );

            mesh.a_texCoord.data.push(
                p1[0] / textureWidthFloor,p1[1] / textureHeightFloor,
                p2[0] / textureWidthFloor,p2[1] / textureHeightFloor,
                p3[0] / textureWidthFloor,p3[1] / textureHeightFloor
            );

            mesh.a_texBound.data.push(
                ...textures.textureDefs[sector.floorFlat].position,
                ...textures.textureDefs[sector.floorFlat].position,
                ...textures.textureDefs[sector.floorFlat].position
            );

            mesh.a_renderType.data.push((sector.floorFlat == "F_SKY") ? 1 : 0);
            mesh.a_renderType.data.push((sector.floorFlat == "F_SKY") ? 1 : 0);
            mesh.a_renderType.data.push((sector.floorFlat == "F_SKY") ? 1 : 0);

            //Ceiling mesher
            mesh.a_position.data.push(p1[0],sector.ceilingHeight,p1[1]);
            mesh.a_position.data.push(p3[0],sector.ceilingHeight,p3[1]);
            mesh.a_position.data.push(p2[0],sector.ceilingHeight,p2[1]);
            
            mesh.a_color.data.push(
                1,0,1,
                0,1,1,
                0,0,1
            );

            mesh.a_texCoord.data.push(
                p1[0] / textureWidthCeiling,p1[1] / textureHeightCeiling,
                p3[0] / textureWidthCeiling,p3[1] / textureHeightCeiling,
                p2[0] / textureWidthCeiling,p2[1] / textureHeightCeiling
            );

            mesh.a_texBound.data.push(
                ...textures.textureDefs[sector.ceilFlat].position,
                ...textures.textureDefs[sector.ceilFlat].position,
                ...textures.textureDefs[sector.ceilFlat].position
            );

            mesh.a_renderType.data.push((sector.ceilFlat == "F_SKY") ? 1 : 0);
            mesh.a_renderType.data.push((sector.ceilFlat == "F_SKY") ? 1 : 0);
            mesh.a_renderType.data.push((sector.ceilFlat == "F_SKY") ? 1 : 0);
        }

        levelData.sectors[sectorID].mesh = twgl.createBufferInfoFromArrays(renderer.gl, mesh);
    },

    parseMesh:() => {
        window.levelParser.getLinesForSectors();
        const subSectors = window.levelParser.levelData.subsectors;
        const sectors = window.levelParser.levelData.sectors;
        for (let subSectorID = 0; subSectorID < subSectors.length; subSectorID++) {
            window.levelParser.subSectorToMesh(subSectors[subSectorID],subSectorID);
        }

        //Flats I got tired of BSP not really working in my favour
        for (let sectorID = 0; sectorID < sectors.length; sectorID++) {
            window.levelParser.sectorToFlat(sectors[sectorID],sectorID);
        }
    },
};
