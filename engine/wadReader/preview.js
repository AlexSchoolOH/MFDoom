window.preview = () => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const verts = window.levelParser.levelData.vertices;
    const lines = window.levelParser.levelData.linedefs;

    for (let index = 0; index < verts.length; index++) {
        const vert = verts[index];
        
        if (minX > vert[0]) minX = vert[0];
        if (maxX < vert[0]) maxX = vert[0];
        if (minY > vert[1]) minY = vert[1];
        if (maxY < vert[1]) maxY = vert[1];
    }

    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.style.backgroundColor = "#0f0f0f";
    const gl = canvas.getContext("2d");

    gl.fillStyle = "#0000ff";
    gl.strokeStyle = "#ffff00";
    gl.lineWidth = 2;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const startVert = verts[line.start];
        const endVert = verts[line.end];

        gl.beginPath();

        let x = (startVert[0] - minX) / (maxX-minX);
        let y = (startVert[1] - minY) / (maxY-minY);
        gl.moveTo((x * canvas.width),(y * canvas.height));

        x = (endVert[0] - minX) / (maxX-minX);
        y = (endVert[1] - minY) / (maxY-minY);
        gl.lineTo((x * canvas.width),(y * canvas.height));

        gl.stroke();
    }

    for (let index = 0; index < verts.length; index++) {
        const vert = verts[index];

        const x = (vert[0] - minX) / (maxX-minX);
        const y = (vert[1] - minY) / (maxY-minY);

        gl.beginPath();
        gl.rect((x * canvas.width) - 2,(y * canvas.height) - 2,5,5);
        gl.fill();

        console.log(`${vert[0]},${vert[1]}`);
    }
}