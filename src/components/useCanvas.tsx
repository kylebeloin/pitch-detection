import { useState, useCallback } from "react";

export const useCanvas = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  const handleCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas) {
      setCanvas(canvas);
      setContext(canvas.getContext("2d") as CanvasRenderingContext2D);
    } else {
      setCanvas(undefined);
      setContext(undefined);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    if (context) {
      context.clearRect(
        0,
        0,
        canvas?.width as number,
        canvas?.height as number
      );
    }
  }, [context, canvas]);

  return { canvas, context, handleCanvas, clearCanvas };
};
