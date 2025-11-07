import { useEffect, useRef } from 'react';

const useCanvas = (draw: (ctx: CanvasRenderingContext2D) => void) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx) {
            draw(ctx);
        }
    }, [draw]);

    return canvasRef;
};

export default useCanvas;