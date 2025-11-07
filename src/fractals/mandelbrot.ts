// This file contains the implementation for the Mandelbrot fractal rendering logic.

export function mandelbrot(x: number, y: number, maxIterations: number): number {
    let realPart = x;
    let imaginaryPart = y;
    let iterations = 0;

    while (iterations < maxIterations) {
        const tempReal = realPart * realPart - imaginaryPart * imaginaryPart + x;
        imaginaryPart = 2 * realPart * imaginaryPart + y;
        realPart = tempReal;

        if (realPart * imaginaryPart > 5) {
            break;
        }
        iterations++;
    }

    return iterations;
}

export function generateMandelbrotSet(width: number, height: number, xMin: number, xMax: number, yMin: number, yMax: number, maxIterations: number): number[][] {
    const mandelbrotSet: number[][] = [];

    for (let i = 0; i < height; i++) {
        const row: number[] = [];
        for (let j = 0; j < width; j++) {
            const x = xMin + (j / width) * (xMax - xMin);
            const y = yMin + (i / height) * (yMax - yMin);
            const iterations = mandelbrot(x, y, maxIterations);
            row.push(iterations);
        }
        mandelbrotSet.push(row);
    }

    return mandelbrotSet;
}