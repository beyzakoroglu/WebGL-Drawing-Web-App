
export const vertexShaderSource = `
    attribute vec2 aPosition;
    uniform vec2 uTranslation;  // right-left-down-up
    uniform float uScale;       // scale amount
    uniform float uAngle;       // rotation angle
    uniform vec2 uCenter;       // rotation center
    
    void main() {
        // subtract the positions from the geometrical center
        vec2 translatedPosition = aPosition - uCenter;
        
        // scaling
        vec2 scaledPosition = translatedPosition * uScale;
        
        // rotating
        vec2 rotatedPosition;
        rotatedPosition.x = scaledPosition.x * cos(uAngle) - scaledPosition.y * sin(uAngle);
        rotatedPosition.y = scaledPosition.x * sin(uAngle) + scaledPosition.y * cos(uAngle);
    
        vec2 finalPosition = rotatedPosition + uCenter + uTranslation;
    
        gl_PointSize = 0.0; // size of the point
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

