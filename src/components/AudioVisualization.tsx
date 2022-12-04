import { Recorder } from "./Recorder";
import { drawPitch } from "../utility/AutoCorrelation";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { getMousePosition } from "../utility/common";
import { useStream } from "./Stream";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Audio } from "./Audio";
import { AudioChart } from "./AudioChart";

import styles from "./AudioVisContainer.module.css";

export const AudioVisualization = () => {
  const { audioRef } = useStream();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCursorPosition = useCallback(() => {
    if (containerRef && containerRef.current && audioRef && audioRef.current) {
      let audio = audioRef.current as HTMLAudioElement;
      let containerWidth = containerRef.current?.clientWidth as number;
      let newCursorPosition =
        (containerWidth * audio.currentTime) / audio.duration;
      setCursorPosition({ x: newCursorPosition, y: 0 });
    }
  }, [containerRef, audioRef]);

  const logClick = useCallback(
    (event: any) => {
      const { x, y } = getMousePosition(event);

      if (containerRef && containerRef.current && audioRef) {
        let audio = audioRef.current as HTMLAudioElement;

        const newLocation =
          (audio.duration * x) / containerRef.current.clientWidth;
        audio.currentTime = newLocation;
        setCursorPosition({ x, y });
        audio.play();
      }
      return;
    },
    [setCursorPosition, audioRef]
  );

  useEffect(() => {
    if (audioRef && audioRef.current) {
      let audio = audioRef.current as HTMLAudioElement;
      if (audio) {
        if (audio.duration === Infinity || isNaN(audio.duration)) {
          audio.currentTime = 1e101;
          setDuration(audio.duration);
          audio.addEventListener("timeupdate", updateCursorPosition);
        } else {
          setDuration(audio.duration);
        }
      }

      return () => {
        if (audio) {
          audio.removeEventListener("timeupdate", updateCursorPosition);
        }
      };
    }
  }, [audioRef, containerRef, duration, logClick, updateCursorPosition]);

  useEffect(() => {
    let audio = audioRef?.current;
    let element = containerRef.current;
    if (element && cursorPosition && audio) {
      const newLocation = (duration * cursorPosition.x) / element.clientWidth;
      if (newLocation > 0) {
        audio.currentTime = newLocation;
        audio.play();
      }
    }
  }, [cursorPosition, duration, logClick, audioRef]);

  return (
    <>
      <Recorder />
      <Audio />
      <div
        className={styles.container}
        style={
          {
            "--width": `${(duration as number) * 100}px`,
          } as React.CSSProperties
        }
        ref={containerRef}
      >
        <AudioChart
          draw={drawPitch}
          dataHook={useAudioAnalyzer}
          eventHandler={logClick}
        />
        <div
          className={styles.pointer}
          style={
            {
              "--x": `${cursorPosition.x}px`,
            } as React.CSSProperties
          }
        ></div>
      </div>
    </>
  );
};
