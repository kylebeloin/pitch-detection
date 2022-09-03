import { useRecorder } from "./useRecorder";
import { useEffect, useCallback } from "react";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { useStream } from "./Stream";

export const Recorder = () => {
  const { recording, startRecording, stopRecording } = useRecorder();
  const { data } = useAudioAnalyzer();
  const { audio } = useStream();

  const logAudio = useCallback(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      logAudio();
    }
  }, [data, logAudio]);

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
