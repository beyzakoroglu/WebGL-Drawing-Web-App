"use strict";

import { createProgram, createShader } from "./webgl-utils.js";
import { fragmentShaderSource, vertexShaderSource } from "./shaders.js";
import { triangulate } from "./triangulate.js";

let canvas;
let gl;
let points = [];
let pointsCopy = [];

let isDrawing = false;
let currentColor = [0.0, 0.0, 0.0, 1.0];

let translation = [0.0, 0.0];
const translationAmount = 0.1;

let scale = 1.0;

let rotationAngle = 0;

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
        translation = [0, 0];
        isDrawing = true;
        canvas.style.cursor = "crosshair";
    });

    canvas.addEventListener("mousedown", (event) => {
        if(isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
            const y = -((event.clientY - rect.top) / canvas.height * 2 - 1);

            points.push(x, y);
            pointsCopy.push(x, y);

            //drawPoints();
            if (points.length >= 2) {
                drawLines();
            }
        }
    });

    // clear button
    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", () => {
        translation = [0, 0];
        scale = 1.0;
        isDrawing = false;
        canvas.style.cursor = "default";

        points = [];
        pointsCopy = [];

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // set slider value as default
        const scaleSlider = document.getElementById("scaleSlider");
        scaleSlider.value = 1.0;
    });


    // fill button
    const fillButton = document.getElementById("fillButton");
    fillButton.addEventListener("click", () => {
        if (points.length < 3) {
            alert("At least 3 points are required to fill a shape.");
            return;
        }
        fillShape();
    });


    // translation buttons
    const rightButton  = document.getElementById("rightButton");
    const leftButton = document.getElementById("leftButton");
    const upButton  = document.getElementById("upButton");
    const downButton = document.getElementById("downButton");

    rightButton.addEventListener("click", () => {
        isDrawing = false;
        translation[0] += translationAmount;
        for (let i = 0; i < points.length; i += 2) {
            points[i] += translationAmount;
            pointsCopy[i] += translationAmount;
        }
        redraw();
    });

    leftButton.addEventListener("click", () => {
        isDrawing = false;
        translation[0] -= translationAmount;
        for (let i = 0; i < points.length; i += 2) {
            points[i] -= translationAmount;
            pointsCopy[i] -= translationAmount;
        }
        redraw();
    });

    upButton.addEventListener("click", () => {
        isDrawing = false;
        translation[1] += translationAmount;
        for (let i = 1; i <= points.length; i += 2) {
            points[i] += translationAmount;
            pointsCopy[i] += translationAmount;
        }
        redraw();
    });

    downButton.addEventListener("click", () => {
        isDrawing = false;
        translation[1] -= translationAmount;
        for (let i = 1; i < points.length; i += 2) {
            points[i] -= translationAmount;
            pointsCopy[i] -= translationAmount;
        }
        redraw();
    });


    // scale slider
    const scaleSlider = document.getElementById("scaleSlider");
    scaleSlider.addEventListener("change", (event) => {
        isDrawing = false;
        let newScale = parseFloat(event.target.value);

        // calculating the geometric center of the shape
        const centerX = points.reduce((sum, _, i) => i % 2 === 0 ? sum + points[i] : sum, 0) / (points.length / 2);
        const centerY = points.reduce((sum, _, i) => i % 2 !== 0 ? sum + points[i] : sum, 0) / (points.length / 2);

        console.log("CENTER OF THE SHAPE: " + centerX + "," + centerY);

        for (let i = 0; i < points.length; i += 2) {
            //points[i] = centerX + (points[i] - centerX) * newScale;
            //points[i + 1] = centerY + (points[i + 1] - centerY) * newScale;

            pointsCopy[i] = centerX + (points[i] - centerX) * newScale;
            pointsCopy[i + 1] = centerY + (points[i + 1] - centerY) * newScale;
        }

        console.log("MY POINTS: ", pointsCopy);

        scale = newScale;
        console.log(scale);
        redraw();
    });

    // rotation buttons
    const clockwiseButton = document.getElementById("clockwiseButton");
    const counterClockwiseButton = document.getElementById("counterClockwiseButton");

    clockwiseButton.addEventListener("click", () => {
        rotationAngle -= Math.PI / 18;
        redraw();
    });

    counterClockwiseButton.addEventListener("click", () => {
        rotationAngle += Math.PI / 18;
        redraw();
    });

};


/*function rotateShape(angle) {
    isDrawing = false;

    const centerX = points.reduce((sum, _, i) => i % 2 === 0 ? sum + points[i] : sum, 0) / (points.length / 2);
    const centerY = points.reduce((sum, _, i) => i % 2 !== 0 ? sum + points[i] : sum, 0) / (points.length / 2);

    // rotation
    for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];

        points[i] = centerX + (x - centerX) * Math.cos(angle) - (y - centerY) * Math.sin(angle);
        points[i + 1] = centerY + (x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle);

        pointsCopy[i] = points[i];
        pointsCopy[i + 1] = points[i + 1];
    }

    redraw();
}*/


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

    // pass translation value
    const uTranslation = gl.getUniformLocation(program, "uTranslation");
    gl.uniform2fv(uTranslation, translation);

    // pass the scale value
    //const uScale = gl.getUniformLocation(program, "uScale");
    //gl.uniform1f(uScale, scale);

    // pass the selected color
    const uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, currentColor);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
}

function redraw() {
    fillShape();
}


function fillShape() {
    const vertices = pointsToVertices(pointsCopy);
    const { success, triangles, errorMessage } = triangulate(vertices);

    console.log("FILLING POINTS: ", vertices);

    if (!success) {
        console.error(errorMessage);
        return;
    }

    // to make 2D array 1D means flattening
    const flattenedTriangles = triangles.flatMap(index => [vertices[index].x, vertices[index].y]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattenedTriangles), gl.STATIC_DRAW);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // pass translation value
    const uTranslation = gl.getUniformLocation(program, "uTranslation");
    gl.uniform2fv(uTranslation, translation);

    // pass the center of rotation
    const centerX = points.reduce((sum, _, i) => i % 2 === 0 ? sum + points[i] : sum, 0) / (points.length / 2);
    const centerY = points.reduce((sum, _, i) => i % 2 !== 0 ? sum + points[i] : sum, 0) / (points.length / 2);
    const uCenter = gl.getUniformLocation(program, "uCenter");
    gl.uniform2fv(uCenter, [centerX, centerY]);

    // pass the rotation angle
    const uAngle = gl.getUniformLocation(program, "uAngle");
    gl.uniform1f(uAngle, rotationAngle);


    // pass the scale value
    //const uScale = gl.getUniformLocation(program, "uScale");
    //gl.uniform1f(uScale, scale);

    const uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, currentColor);

    gl.drawArrays(gl.TRIANGLES, 0, flattenedTriangles.length / 2);
}


function pointsToVertices(pointsArray) {
    const vertices = [];
    for (let i = 0; i < pointsArray.length; i += 2) {
        vertices.push({x: pointsArray[i], y: pointsArray[i + 1]});
    }
    return vertices;
}


// to convert HEX to normalized RGBA
function hexToRGBA(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b, 1.0];
}
