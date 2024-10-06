window.renderer = {
    gl:null,
    shaders:{},
    camera: [0,1,0,0,1,0,0,1,0],
    create:(canvas) => {
        window.renderer.gl = canvas.getContext("webgl", {
            antialias:false,
            preserveDrawingBuffer:true,
            premultipliedAlpha:true
        });
        window.renderer.shaders.unlit = twgl.createProgramInfo(window.renderer.gl,[
            `
            attribute highp vec3 a_position;
            attribute highp vec3 a_color;
            varying highp vec3 v_color;
            attribute highp vec2 a_texCoord;
            varying highp vec2 v_texCoord;
            attribute highp vec4 a_texBound;
            varying highp vec4 v_texBound;

            uniform highp mat3 u_camera;
            uniform highp float u_aspect;

            highp vec3 transform(highp vec3 inputPosition, highp mat3 transformation) {
                inputPosition -= vec3(transformation[0][2],transformation[1][2],transformation[2][2]);

                inputPosition.xz = vec2(
                    inputPosition.z * transformation[0][0] + inputPosition.x * transformation[0][1],
                    inputPosition.z * transformation[0][1] - inputPosition.x * transformation[0][0]
                );

                inputPosition.xy = vec2(
                    inputPosition.y * transformation[2][0] + inputPosition.x * transformation[2][1],
                    inputPosition.y * transformation[2][1] - inputPosition.x * transformation[2][0]
                );
                
                return inputPosition;
            }

            void main()
            {
                v_color = a_color;
                v_texCoord = a_texCoord;
                v_texBound = a_texBound;
                highp vec3 transformed = transform(a_position,u_camera);
                gl_Position = vec4(transformed,transformed.z) - vec4(0,0,1,0);
                gl_Position.x /= u_aspect;
            }
            `,
            `
            varying highp vec3 v_color;
            varying highp vec2 v_texCoord;
            varying highp vec4 v_texBound;

            uniform highp vec3 u_pallete[256];
            uniform highp float u_usePallete;

            uniform sampler2D u_texture;

            void main()
            {
                highp vec2 coord = v_texCoord;
                coord = fract(coord);
                coord *= v_texBound.zw;
                coord += v_texBound.xy;
                gl_FragColor = texture2D(u_texture,v_texCoord); //* vec4(v_color,1);
                gl_FragColor.xyz *= gl_FragColor.w;

                if (gl_FragColor.a == 0.0) {
                    discard;
                }

                if (u_usePallete == 1.0) {
                    highp vec3 closestColor = u_pallete[6];
                    highp vec3 nextClosestColor = u_pallete[6];

                    for(int i=0;i<256;++i) {
                        highp float distance = length(u_pallete[i] - gl_FragColor.xyz);
                        if (distance < length(gl_FragColor.xyz - closestColor)) {
                            nextClosestColor = closestColor;
                            closestColor = u_pallete[i];
                        }
                        else if (distance < length(gl_FragColor.xyz - nextClosestColor)) {
                            nextClosestColor = closestColor;
                        }
                    }

                    gl_FragColor.xyz = closestColor;
                }
            }
            `
        ]);

        window.renderer.gl.viewport(0, 0, window.renderer.gl.canvas.width, window.renderer.gl.canvas.height);

        window.renderer.gl.clearColor(0,0,0,1);
        window.renderer.gl.enable(renderer.gl.DEPTH_TEST);
        window.renderer.gl.depthFunc(renderer.gl.LEQUAL);

        window.renderer.gl.enable(window.renderer.gl.CULL_FACE);
        window.renderer.gl.cullFace(window.renderer.gl.BACK);
    }
}
