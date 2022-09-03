import { useRecorder } from "./useRecorder";
import { useEffect, useCallback } from "react";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { useStream } from "./Stream";
import { Visualization } from "./Visualization";

export const Recorder = () => {
  const { recording, startRecording, stopRecording } = useRecorder();
  const { audio } = useStream();

  return (
    <div>
      <button
        onClick={(event: any) =>
          recording ? stopRecording() : startRecording(event)
        }
      >
        {recording ? "Stop" : "Start"}
      </button>
      <audio src={audio ? URL.createObjectURL(audio) : ""} controls />
    </div>
  );
};
