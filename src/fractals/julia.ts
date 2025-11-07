// This file contains the implementation for the Julia fractal rendering logic.

import { createShader, createProgram } from '../utils/webglUtils';
import { FractalConfig } from './types';

const juliaFragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_param;

void main() {
    vec2 z = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    z.x *= u_resolution.x / u_resolution.y;

    float cRe = u_param.x;
    float cIm = u_param.y;
    int maxIterations = 100;
    int i;
    
    for (i = 0; i < maxIterations; i++) {
        float x = z.x * z.x - z.y * z.y + cRe;
        float y = 2.0 * z.x * z.y + cIm;
        z = vec2(x, y);
        
        if (length(z) > 2.0) break;
    }

    float color = float(i) / float(maxIterations);
    gl_FragColor = vec4(vec3(color), 1.0);
}
`;

export function createJuliaFractal(gl: WebGLRenderingContext, config: FractalConfig) {
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, juliaFragmentShaderSource);
    const program = createProgram(gl, fragmentShader);

    gl.useProgram(program);
    // Set up uniforms and attributes as needed
    // ...

    return program;
}