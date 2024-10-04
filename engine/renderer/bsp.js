window.bsp = {
    subSectorID: 32768,

    perpDot: (p1,p2) => {
        return (p1[0]*p2[1]) - (p1[1]*p2[0]);
    },

    intersectOffset: (node1,node2) => {
        let denominator = window.bsp.perpDot([node1.dx,node1.dy],[node2.dx,node2.dy]);
        console.log("Denominator " +denominator);
        if (Math.abs(denominator) < 1e-16) {
            console.log("Less than");
            return;
        } else {
            console.log("Greater than " + window.bsp.perpDot([node2.x - node1.x, node2.y - node1.y],[node2.dx,node2.dy]) / denominator)
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
}