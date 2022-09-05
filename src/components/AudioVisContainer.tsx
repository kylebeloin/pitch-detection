import { Recorder } from "./Recorder";

import { Visualization } from "./Visualization";
import { drawPitch } from "../utility/AutoCorrelation";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { getMousePosition, getElementAtLocation } from "../utility/common";
import { useStream } from "./Stream";
import React, { useEffect, useState } from "react";

import styles from "./AudioVisContainer.module.css";

export const AudioVisContainer = () => {
  const { audioRef } = useStream();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [duration, setDuration] = useState(0);

  const logClick = (event: any) => {
    const { x, y } = getMousePosition(event);
    const element = getElementAtLocation(x, y);

    setCursorPosition({ x, y });
    console.log(audioRef?.current?.duration);
    return;
  };

  useEffect(() => {
    if (audioRef?.current) {
      setDuration(audioRef.current.duration);
    }
  }, [audioRef, logClick]);

  return (
    <>
      <Recorder />
      <div
        className={styles.container}
        style={
          {
            "--width": `${(duration as number) * 100}px`,
          } as React.CSSProperties
        }
      >
        <Visualization
          draw={drawPitch}
          dataHook={useAudioAnalyzer}
          eventHandler={logClick}
        />
        <div
          className={styles.pointer}
          style={
            {
              "--x": `${cursorPosition.x}`,
            } as React.CSSProperties
          }
        ></div>
      </div>
    </>
  );
};
