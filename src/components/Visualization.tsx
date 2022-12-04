import { useEffect, useRef, useCallback } from "react";

interface VisualizationProps {
  draw: (
    data: any,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  dataHook: () => any;
  eventHandler?: (e: any) => void;
}

export const Visualization = ({
  draw,
  dataHook,
  eventHandler,
}: VisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();
  const parentRef = useRef<HTMLDivElement>(null);
  const { data, loading } = dataHook();

  const paint = useCallback(() => {
    if (canvasRef.current && contextRef.current && data && data.length > 0) {
      let canvas = canvasRef.current;
      let context = contextRef.current;
      draw(data, canvas, context);
      if (eventHandler) {
        canvas.onclick = (e) => eventHandler(e);
      }
    }
  }, [data, draw, eventHandler]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") as CanvasRenderingContext2D;
    if (canvas && context) {
      // get parent container width
      canvas.width = canvas.parentElement?.clientWidth || 0;
      canvas.height = canvas.parentElement?.clientHeight || 0;

      contextRef.current = context;
      paint();
    }
    return () => {
      if (canvas && eventHandler) {
        canvas.onclick = null;
      }
    };
  }, [loading, paint, eventHandler]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 0;
      canvas.height = canvas.parentElement?.clientHeight || 0;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      contextRef.current = context;
    }
  }, []);

  return (
    <div
      ref={parentRef}
      style={{
        width: parentRef?.current?.parentElement?.clientWidth || "100%",
        height: parentRef?.current?.parentElement?.clientHeight || "auto",
      }}
    >
      {loading && parentRef.current ? (
        <div
          style={{
            width: parentRef.current.clientWidth,
            height: parentRef.current.clientHeight,
          }}
        >
          Loading...
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
};
