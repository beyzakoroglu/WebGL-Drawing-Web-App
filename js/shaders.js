
export const vertexShaderSource = `
    attribute vec2 aPosition;
    uniform vec2 uTranslation;
    //uniform float uScale;
    uniform float uAngle;  // rotation angle
    uniform vec2 uCenter;  // rotation center
    
    void main() {
        vec2 translatedPosition = aPosition - uCenter;
        
        vec2 rotatedPosition;
        rotatedPosition.x = translatedPosition.x * cos(uAngle) - translatedPosition.y * sin(uAngle);
        rotatedPosition.y = translatedPosition.x * sin(uAngle) + translatedPosition.y * cos(uAngle);
    
        vec2 finalPosition = rotatedPosition + uCenter + uTranslation;
    
        gl_PointSize = 0.0; // size of the point
        //gl_Position = vec4((aPosition + uTranslation), 0.0, 1.0);
        gl_Position = vec4(finalPosition, 0.0, 1.0);
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main() {
        gl_FragColor = uColor; 
    }
`;

