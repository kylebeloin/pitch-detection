import { useEffect, useRef, useCallback } from "react";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { options } from "../utility/AutoCorrelation";

export const Visualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();

  const [logFreqMin, logFreqMax] = [
    Math.log(options.freqMin),
    Math.log(options.freqMax),
  ];

  const { data, loading } = useAudioAnalyzer();

  const draw = useCallback(() => {
    if (contextRef.current && data && data.length > 0) {
      let currentTime = data.length / options.freqRate;
      let ctx = contextRef.current;
      let canvas = canvasRef.current as HTMLCanvasElement;
      ctx.clearRect(0, 0, canvas.width as number, canvas.height as number);
      ctx.fillStyle = options.style.BACKCOLOUR;

      ctx.fillRect(
        0,
        0,
        canvasRef.current?.width as number,
        canvasRef.current?.height as number
      );
      ctx.strokeStyle = options.style.GRIDCOLOUR;
      ctx.lineWidth = options.style.GRIDWIDTH;

      // Draw grid
      ctx.beginPath();

      let tshift = currentTime - Math.floor(currentTime);
      for (let t = 0; t < options.disptime + tshift; t += 1) {
        let x = Math.round((canvas.width * (t - tshift)) / options.disptime);
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let f = 50; f <= options.freqMax; f += 50) {
        let y = Math.round(
          canvas.height -
            (canvas.height * (Math.log(f) - logFreqMin)) /
              (logFreqMax - logFreqMin)
        );
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.strokeStyle = options.style.AMPCOLOUR;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let offset =
        data.length - Math.round(options.disptime * options.freqRate);
      for (let i = 0; i < data.length - 1; i++) {
        let x1 = (i * canvas.width) / (options.disptime * options.freqRate);
        let x2 =
          ((i + 1) * canvas.width) / (options.disptime * options.freqRate);
        let y1 =
          (canvas.height * (Math.log(data[i][0]) - logFreqMin)) /
          (logFreqMax - logFreqMin);

        let y2 =
          (canvas.height * (Math.log(data[i + 1][0]) - logFreqMin)) /
          (logFreqMax - logFreqMin);
        let w1 = (canvas.height * data[i][1]) / 10;
        let w2 = (canvas.height * data[i + 1][1]) / 10;
        let change = Math.abs(
          (2 * (data[i][0] - data[i + 1][0])) / (data[i][0] + data[i + 1][0])
        );
        console.log(x1, x2, y1, y2, w1, w2, change);
        if (data[i + 1][0] > 0 && change < 0.2) {
          for (let x = x1; x <= x2; x++) {
            let m = (x - x1) / (x2 - x1);
            ctx.moveTo(
              x,
              canvas.height -
                ((1 - m) * y1 + m * y2) +
                ((1 - m) * w1 + m * w2) / 2
            );
            ctx.lineTo(
              x,
              canvas.height -
                ((1 - m) * y1 + m * y2) -
                ((1 - m) * w1 + m * w2) / 2
            );
          }
        } else {
          console.log("change", x1, canvas.height - y1 + w1 / 2);
          ctx.moveTo(x1, canvas.height - y1 + w1 / 2);
          ctx.lineTo(x1, canvas.height - y1 - w1 / 2);
        }
      }
      ctx.stroke();
    }
  }, [data, logFreqMax, logFreqMin]);

  useEffect(() => {
    if (data && canvasRef.current && contextRef.current) {
      console.log(data);
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = 500;
      const context = canvas?.getContext("2d") as CanvasRenderingContext2D;
      contextRef.current = context;
      draw();
    }
  }, [data, loading, draw]);

  useEffect(() => {
    if (canvasRef.current) {
      console.log("Canvas is loading");
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = 500;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      contextRef.current = context;
    }
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{ width: "500px", height: "500px" }}>Loading...</div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
};
