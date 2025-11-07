// This file contains utility functions for mathematical operations used in the Fractal Explorer application.

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

export const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
};

export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
};

export const complexAdd = (a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } => {
    return { re: a.re + b.re, im: a.im + b.im };
};

export const complexMultiply = (a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } => {
    return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
};

export const complexMagnitude = (c: { re: number; im: number }): number => {
    return Math.sqrt(c.re * c.re + c.im * c.im);
};