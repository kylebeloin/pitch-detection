import { useRecorder } from "./useRecorder";
import { useStream } from "./Stream";

export const Recorder = () => {
  const { recording, startRecording, stopRecording } = useRecorder();
  const { audioRef } = useStream();
  // test

  return (
    <div>
      <button
        onClick={(event: any) =>
          recording ? stopRecording() : startRecording(event)
        }
      >
        {recording ? "Stop" : "Start"}
      </button>
      <audio ref={audioRef} controls />
    </div>
  );
};
