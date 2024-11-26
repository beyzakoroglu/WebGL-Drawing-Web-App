"use strict";

import { createProgram, createShader } from "./webgl-utils.js";
import { fragmentShaderSource, vertexShaderSource } from "./shaders.js";

let canvas;
let gl;
let points = [];

let isDrawing = false;
let currentColor = [0.0, 0.0, 0.0, 1.0];

window.onload = function init() {
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL isn't available");
    }

    const colorPickerButton = document.getElementById("colorPicker");

    colorPickerButton.addEventListener("click", () => {
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.style.display = "none";

        colorInput.addEventListener("input", (event) => {
            colorPickerButton.style.backgroundColor = event.target.value;
            currentColor = hexToRGBA(event.target.value);
        });

        document.body.appendChild(colorInput);
        colorInput.click();

        colorInput.addEventListener("blur", () => {
            document.body.removeChild(colorInput);
        });
    });


    const drawButton = document.getElementById("drawButton");
    drawButton.addEventListener("click", () => {
        isDrawing = true;
        canvas.style.cursor = "crosshair";
    });

    canvas.addEventListener("mousedown", (event) => {
        if(isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
            const y = -((event.clientY - rect.top) / canvas.height * 2 - 1);
            points.push(x, y);

            console.log("Points:", points);

            //drawPoints();
            if (points.length >= 2) {
                drawLines();
            }
        }
    });

    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", () => {
        isDrawing = false;
        canvas.style.cursor = "default";

        points = [];
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

    });
};

/*function drawPoints() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // pass the selected color
    const uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, currentColor);

    gl.drawArrays(gl.POINTS, 0, points.length / 2);
}*/

function drawLines() {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    //drawPoints();

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // pass the selected color
    const uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, currentColor);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
}


// to convert HEX to normalized RGBA
function hexToRGBA(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b, 1.0];
}
