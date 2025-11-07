import React, { useRef, useEffect } from 'react';

const Canvas: React.FC<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D) => void }> = ({ width, height, draw }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                draw(ctx);
            }
        }
    }, [draw]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Canvas;