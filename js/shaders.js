
export const vertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_PointSize = 0.0; // Size of the point
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main() {
        gl_FragColor = uColor; // Black points
    }
`;

