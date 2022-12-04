import { useEffect, useRef, useCallback, useState } from "react";
import { normalizeData } from "../utility/AutoCorrelation";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface ChartProps {
  draw: (
    data: any,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  dataHook: () => any;
  eventHandler?: (e: any) => void;
}

export const AudioChart = ({ draw, dataHook, eventHandler }: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();
  const parentRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Chart>();

  const { data, loading } = dataHook();

  const createChart = useCallback(() => {
    if (canvasRef.current && contextRef.current && data && data.length > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      let d = normalizeData(data, canvas) as any;

      if (!Chart.getChart(context)) {
        const newChart = new Chart(context, {
          type: "line",
          data: {
            labels: d.map((d: any, i: number) => i),
            datasets: [
              {
                label: "Frequency",
                data: d.map((d: number[]) => d.at(1)),
                backgroundColor: "rgba(255, 99, 132, 1)",
                borderColor: "rgba(255, 99, 132, 1)",

                pointBorderWidth: 1,
                pointRadius: 2,
              },
            ],
          },
          options: {
            layout: {
              padding: {
                left: 0,
                right: 0,
              },
            },
            elements: {
              line: {
                borderWidth: 5,

                borderColor: "rgba(255, 99, 132, 1)",
                tension: 0.01,
              },
            },
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          },
        });
        setChart(newChart);
      }
    }
  }, [data]);

  const paint = useCallback(() => {
    if (canvasRef.current && contextRef.current && data && data.length > 0) {
      let canvas = canvasRef.current;
      //   draw(data, canvas, context);
      if (eventHandler) {
        canvas.onclick = (e) => eventHandler(e);
      }
    }
  }, [data, eventHandler]);

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

  useEffect(() => {
    if (data && data.length > 0 && !chart) {
      createChart();
    }
    return () => {
      if (chart) {
        console.log("destroying chart");
        chart.destroy();
        setChart(undefined);
      }
    };
  }, [data, chart, createChart]);

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
