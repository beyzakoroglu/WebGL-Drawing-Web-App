export function crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
}

export function getItem(list, index) {
    const length = list.length;
    return list[(index + length) % length];
}

export function triangulate(vertices) {
    const triangles = [];
    let errorMessage = '';

    // check if the input vertices are valid
    if (!vertices) {
        errorMessage = 'The vertex list is null.';
        return { success: false, triangles, errorMessage };
    }

    if (vertices.length < 3) {
        errorMessage = 'The vertex list must have at least 3 vertices.';
        return { success: false, triangles, errorMessage };
    }

    //console.log("vertices length:");
    //console.log(vertices.length);

    const indexList = [];
    for (let i = 0; i < vertices.length; i++) {
        indexList.push(i);
    }

    //console.log('indexList: ', indexList);

    // ear clipping to find triangles
    while (indexList.length > 3) {
        let earFound = false;

        for (let i = 0; i < indexList.length; i++) {
            const a = indexList[i];
            const b = getItem(indexList, i - 1);
            const c = getItem(indexList, i + 1);

            //console.log('checking: ', b, a, c);

            const va = vertices[a];
            const vb = vertices[b];
            const vc = vertices[c];

            const vector_va_vb = subtractVectors(vb, va);
            const vector_va_vc = subtractVectors(vc, va);

            const isPolygonCCW = isCCW(vertices);
            if ((isPolygonCCW && crossProduct(vector_va_vb, vector_va_vc) < 0) ||
                (!isPolygonCCW && crossProduct(vector_va_vb, vector_va_vc) > 0)) {
                console.log('Not a convex vertex, skip it');
                continue;
            }

            let isEar = true;

            // checking if any other point exists inside the triangle
            for (let j = 0; j < vertices.length; j++) {
                if (j === a || j === b || j === c) continue;

                const p = vertices[j];
                //console.log('Is P inside the triangle => ', p);

                if (isPointInTriangle(p, va, vb, vc)) {
                    isEar = false;
                    //console.log('Yes it is inside the triangle => ', p);
                    break;
                }
            }

            if (isEar) {
                // Add the triangle points to the list
                //console.log(b, a, c, ' is triangle');
                triangles.push(b, a, c);

                // Remove the ear vertex
                indexList.splice(i, 1);
                earFound = true;
                break;
            }
        }

        if (!earFound) {
            errorMessage = 'Failed to find an ear to clip.';
            alert("THIS SHAPE IS NOT SUITABLE FOR DRAWING. PLEASE REDRAW!");
            return { success: false, triangles, errorMessage };
        }
    }

    // add the final triangle
    triangles.push(indexList[0], indexList[1], indexList[2]);

    return { success: true, triangles, errorMessage };
}

export function isPointInTriangle(p, a, b, c) {
    const ab = subtractVectors(b, a);
    const bc = subtractVectors(c, b);
    const ca = subtractVectors(a, c);

    const ap = subtractVectors(p, a);
    const bp = subtractVectors(p, b);
    const cp = subtractVectors(p, c);

    const cross1 = crossProduct(ab, ap);
    const cross2 = crossProduct(bc, bp);
    const cross3 = crossProduct(ca, cp);

    return !(cross1 < 0 || cross2 < 0 || cross3 < 0);

}

export function subtractVectors(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function isCCW(vertices) {
    let sum = 0;
    for (let i = 0; i < vertices.length; i++) {
        const current = vertices[i];
        const next = vertices[(i + 1) % vertices.length];
        sum += (next.x - current.x) * (next.y + current.y);
    }
    return sum > 0; // CCW
}