window.bsp = {
    subSectorID: 32768,

    findIntersection: (node1,node2) => {
        const x1 = node1.x;
        const y1 = node1.y;
        const x2 = node1.x + node1.dx;
        const y2 = node1.y + node1.dy;

        const x3 = node2.x;
        const y3 = node2.y;
        const x4 = node2.x + node2.dx;
        const y4 = node2.y + node2.dy;
        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        if (denominator == 0) {
            return [x1,y1];
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denominator;
        return [x1 + ua * (x2 - x1),y1 + ua * (y2 - y1)];
    }
}