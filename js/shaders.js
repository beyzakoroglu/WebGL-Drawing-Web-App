
export const vertexShaderSource = `
    attribute vec2 aPosition;
    uniform vec2 uTranslation;
    uniform float uScale;
    
    void main() {
        gl_PointSize = 0.0; // size of the point
        gl_Position = vec4((aPosition + uTranslation) * uScale, 0.0, 1.0);
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main() {
        gl_FragColor = uColor; 
    }
`;

