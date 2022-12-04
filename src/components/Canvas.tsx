import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  FC,
} from "react";
import ReactDOM from "react-dom";

interface CanvasContext {
  canvas?: HTMLCanvasElement;
  requestCanvas: () => Promise<HTMLCanvasElement>;
  renderCanvas: () => Promise<React.ReactNode>;
  getCanvas: (parent: React.ReactNode) => void;
}

const canvasContext = createContext({} as CanvasContext);

export const useCanvas = () => {
  return useContext(canvasContext);
};

function useCanvasContext() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [parent, setParent] = useState<React.ReactNode>();

  const requestCanvas = async () => {
    if (canvas) {
      return canvas;
    }
    const newCanvas = document.createElement("canvas");
    setCanvas(newCanvas);
    return newCanvas;
  };

  const renderCanvas = async () => {
    if (parent) {
      const canvas = await requestCanvas();
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.fillRect(0, 0, 100, 100);
      context.fillRect(100, 100, 100, 100);
      context.fillRect(200, 200, 100, 100);
      context.fillRect(300, 300, 100, 100);

      ReactDOM.createPortal(parent, canvas);
    } else {
      console.log("no parent");
      return null;
    }
  };

  return { canvas, requestCanvas, renderCanvas, getCanvas: setParent };
}

export const CanvasProvider: FC<PropsWithChildren> = ({ children }) => {
  const canvas: CanvasContext = useCanvasContext();

  return (
    <canvasContext.Provider value={canvas}>{children}</canvasContext.Provider>
  );
};
