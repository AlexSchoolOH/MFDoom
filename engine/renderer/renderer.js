window.renderer = {
    gl:null,
    shaders:{},
    camera: [0,1,0,0,1,0,0,1,0],
    create:(canvas) => {
        window.renderer.gl = canvas.getContext("webgl");
        window.renderer.shaders.unlit = twgl.createProgramInfo(window.renderer.gl,[
            `
            attribute highp vec3 a_position;
            attribute highp vec3 a_color;
            varying highp vec3 v_color;

            uniform highp mat3 u_camera;

            highp vec3 transform(highp vec3 inputPosition, highp mat3 transformation) {
                inputPosition -= vec3(transformation[0][2],transformation[1][2],transformation[2][2]);

                inputPosition.xz = vec2(
                    inputPosition.z * transformation[0][0] + inputPosition.x * transformation[0][1],
                    inputPosition.z * transformation[0][1] - inputPosition.x * transformation[0][0]
                );
                
                return inputPosition;
            }

            void main()
            {
                v_color = a_color;
                highp vec3 transformed = transform(a_position,u_camera);
                gl_Position = vec4(transformed,transformed.z) - vec4(0,0,1,0);
            }
            `,
            `
            varying highp vec3 v_color;

            void main()
            {
                gl_FragColor = vec4(v_color,1);
                gl_FragColor.rgb *= gl_FragColor.a;
                if (gl_FragColor.a == 0.0) {
                    discard;
                }
            }
            `
        ]);

        window.renderer.gl.viewport(0, 0, window.renderer.gl.canvas.width, window.renderer.gl.canvas.height);
        window.renderer.gl.enable(window.renderer.gl.CULL_FACE);
        window.renderer.gl.cullFace(window.renderer.gl.BACK);
    }
}
