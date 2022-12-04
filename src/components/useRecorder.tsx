// Recorder component
import { useState, useEffect, useCallback } from "react";
import { useStream } from "./Stream";

const options = {
  audioBitsPerSecond: 48000,
};

export const useRecorder = () => {
  // const [recorder, setRecorder] = useState<MediaRecorder>();
  const [recording, setRecording] = useState(false);

  const {
    stream,
    requestUserMediaStream,
    recorder,
    setRecorder,
    audio,
    setAudio,
  } = useStream();

  const handleData = useCallback(
    (event: BlobEvent) => {
      setAudio(event.data);
    },
    [setAudio]
  );

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (!recorder && recording && stream) {
      setRecorder(new MediaRecorder(stream as MediaStream, options));
      return;
    }

    // Manage recorder state.
    if (recorder) {
      if (recorder["state"] === "recording" && !recording) {
        recorder.stop();
      } else if (recorder["state"] === "inactive" && recording) {
        recorder.start();
      }
    }

    // Obtain the audio when ready.

    recorder && recorder.addEventListener("dataavailable", handleData);
    // Clean up.
    return () =>
      recorder && recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, recording, stream, handleData, setRecorder]);

  const startRecording = (e: MouseEvent) => {
    e.preventDefault();
    if (!stream && requestUserMediaStream) {
      requestUserMediaStream().then(() => setRecording(true));
    } else {
      setRecording(true);
    }
  };

  const stopRecording = () => {
    setRecording(false);
  };

  return { audio, recording, startRecording, stopRecording };
};
