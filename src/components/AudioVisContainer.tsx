import { Recorder } from "./Recorder";

import { Visualization } from "./Visualization";
import { drawPitch } from "../utility/AutoCorrelation";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { getMousePosition, getElementAtLocation } from "../utility/common";
import { useStream } from "./Stream";
import React, { useCallback, useEffect, useState, useRef } from "react";

import styles from "./AudioVisContainer.module.css";

export const AudioVisContainer = () => {
  const { audioRef } = useStream();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const playAudio = useCallback(() => {
    if (audioRef && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioRef]);

  const logClick = useCallback(
    (event: any) => {
      const { x, y } = getMousePosition(event);

      if (containerRef && containerRef.current) {
        let audio = document.querySelector("audio") as HTMLAudioElement;

        const newLocation =
          (audio.duration * x) / containerRef.current.clientWidth;
        console.log("newLocation", newLocation);
        audio.currentTime = newLocation;
        setCursorPosition({ x, y });
        audio.play();
      }
      return;
    },
    [setCursorPosition]
  );

  useEffect(() => {
    let audio = document.querySelector("audio") as HTMLAudioElement;
    if (audio) {
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        audio.currentTime = 1e101;
        setDuration(audio.duration);
        audio.ontimeupdate = () => {
          let containerWidth = containerRef.current?.clientWidth as number;
          let newCursorPosition =
            (containerWidth * audio.currentTime) / audio.duration;
          console.log("new cursor position", newCursorPosition);
          setCursorPosition({ x: newCursorPosition, y: 0 });
        };
      }
    }
    return () => {
      if (audio) {
        audio.ontimeupdate = null;
      }
    };
  }, [audioRef, containerRef, duration, logClick]);

  useEffect(() => {
    let audio = audioRef?.current;
    let element = containerRef.current;
    console.log(element);
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
      <div
        className={styles.container}
        style={
          {
            "--width": `${(duration as number) * 100}px`,
          } as React.CSSProperties
        }
        ref={containerRef}
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
              "--x": `${cursorPosition.x}px`,
            } as React.CSSProperties
          }
        ></div>
      </div>
    </>
  );
};
