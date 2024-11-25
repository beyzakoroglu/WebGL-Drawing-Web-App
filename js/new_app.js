"use strict";

import { createProgram, createShader } from "./webgl-utils.js";
import { fragmentShaderSource, vertexShaderSource } from "./shaders.js";

let canvas;
let gl;
let points = [];

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
        });

        document.body.appendChild(colorInput);
        colorInput.click();

        colorInput.addEventListener("blur", () => {
            document.body.removeChild(colorInput);
        });
    });


    const drawButton = document.getElementById("drawButton");
    drawButton.addEventListener("click", () => {

        canvas.addEventListener("mousedown", (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
            const y = -((event.clientY - rect.top) / canvas.height * 2 - 1);
            points.push(x, y);

            console.log("Points:", points);

            drawPoints();
            if (points.length >= 2) {
                drawLines();
            }
        });

    });

    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", () => {
        points = [];

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

    });
};

function drawPoints() {
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

    gl.drawArrays(gl.POINTS, 0, points.length / 2);
}

function drawLines() {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    drawPoints();
    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
}
