window.wad = {
    int8_LIM:Math.pow(2,8),
    int16_LIM:Math.pow(2,16),
    int32_LIM:Math.pow(2,32),

    int8_HLF:Math.pow(2,8) / 2,
    int16_HLF:Math.pow(2,16) / 2,
    int32_HLF:Math.pow(2,32) / 2,

    mapIndicies: {
        "THING":1,
        "LINEDEF":2,
        "SIDEDEF":3,
        "VERTEX":4,
        "SEG":5,
        "SSECTOR":6,
        "NODE":7,
        "SECTOR":8,
        "REJECT":9,
        "BLOCKMAP":10,
        "BEHAVIOR":11,
    },

    ReadByte:(offset,isSigned) => {
        let num = window.wad.ReadBytes(offset,1);
        if (isSigned) {
            if (num > window.wad.int8_HLF) num -= window.wad.int8_LIM;
        }
        return num;
    },
    Read2Bytes:(offset,isSigned) => {
        let num = window.wad.ReadBytes(offset,2);
        if (isSigned) {
            if (num > window.wad.int16_HLF) num -= window.wad.int16_LIM;
        }
        return num;
    },
    Read4Bytes:(offset,isSigned) => {
        let num = window.wad.ReadBytes(offset,4);
        if (isSigned) {
            if (num > window.wad.int32_HLF) num -= window.wad.int32_LIM;
        }
        return num;
    },
    ReadBytes:(offset,length) => {
        let string = "";
        
        for (let index = 0; index < length; index++) {
            const stringifiedNum = window.wad.file[offset + index].toString(16);
            string = (stringifiedNum.length > 1 ? stringifiedNum :`0${stringifiedNum}`) + string;
        }

        return Number(`0x${string}`);
    },

    ReadString:(offset,length) => {
        let string = "";
        for (let index = 0; index < length; index++) {
            const character = ascii[window.wad.ReadBytes(offset + index,1)];
            if (window.wad.ReadBytes(offset + index,1) >= 10) {
                string += character;
            }
        }
        return string;
    },

    DIRECTORY:[],

    ReadLump:(LumpID,ReadCallback,PartitionSize) => {
        const lumpInfo = window.wad.DIRECTORY[LumpID];
        const length = Math.floor(lumpInfo.Size / PartitionSize);
        const data = [];
        for (let index = 0; index < length; index++) {
            const offset = lumpInfo.Offset + (index * PartitionSize);
            data.push(ReadCallback(offset));
        };
        return data;
    },

    FindFirstLumpOfName:(LumpName) => {
        return window.wad.DIRECTORY.indexOf(window.wad.DIRECTORY.find((element) => {return element.Name == LumpName;}));
    }
};