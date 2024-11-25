
export const vertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_PointSize = 10.0; // Size of the point
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black points
    }
`;

export function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
