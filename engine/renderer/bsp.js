window.bsp = {
    subSectorID: 32768,

    perpDot: (p1,p2) => {
        return (p1[0]*p2[1]) - (p1[1]*p2[0]);
    },

    intersectOffset: (node1,node2) => {
        let denominator = window.bsp.perpDot([node1.dx,node1.dy],[node2.dx,node2.dy]);
        if (Math.abs(denominator) < 1e-16) {
            return;
        } else {
            return window.bsp.perpDot([node2.x - node1.x, node2.y - node1.y],[node2.dx,node2.dy]) / denominator;
        }
    },

    findIntersection: (node1,node2) => {
        const offset = window.bsp.intersectOffset(node1,node2);
        if (!offset) return false;
        return [node1.x + (node1.dx * offset),node1.y + (node1.dy * offset)];
        /* Dookie!
        const x1 = node1.x;
        const y1 = node1.y;
        const x2 = node1.x + node1.dx;
        const y2 = node1.y + node1.dy;

        const x3 = node2.x;
        const y3 = node2.y;
        const x4 = node2.x + node2.dx;
        const y4 = node2.y + node2.dy;
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false
        }
    
        denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    
      // Lines are parallel
        if (denominator === 0) {
            return false
        }
    
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
    
      // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false
        }
    
      // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1)
        let y = y1 + ua * (y2 - y1)
    
        return [x, y]
        */
    },

    isOnBack:(x,y,nodeDef) => {
        x -= nodeDef.x;
        y -= nodeDef.y;
        return x * nodeDef.dy - y * nodeDef.dx <= 0
    },

    traverseToBottom:(x,y,fromNode) => {
        if (typeof fromNode === "undefined") {
            return window.bsp.traverseToBottom(x,y,levelParser.levelData.nodes.length - 1);
        }
        else {
            if (fromNode >= window.bsp.subSectorID) {
                fromNode -= window.bsp.subSectorID;
                return levelParser.levelData.subsectors[fromNode];
            }

            const nodeDef = levelParser.levelData.nodes[fromNode];
            
            if (!window.bsp.isOnBack(x,y,nodeDef)) {
                return window.bsp.traverseToBottom(x,y,nodeDef.rightChild);
            }
            else {
                return window.bsp.traverseToBottom(x,y,nodeDef.leftChild);
            }
        }
    }
}