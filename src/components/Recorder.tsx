import { useRecorder } from "./useRecorder";
import { useEffect } from "react";

export const Recorder = () => {
  const { audio, recording, startRecording, stopRecording, view } =
    useRecorder();
  //

  useEffect(() => {
    if (view) {
      console.log(view);
    }
  }, [view]);

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
