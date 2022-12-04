// Recorder component
import { useState, useEffect, useCallback } from "react";
import { useStream } from "./Stream";

export const useAudio = () => {
  // handles file upload / reading and audio playback

  const { audio, setAudio, audioCtx, requestAudioStream, audioRef,  } =
    useStream();

  const [audioFile, setAudioFile] = useState<File>();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleFileRead = useCallback(
    (e: ProgressEvent<FileReader>) => {
      console.log("handleFileRead", e);
      if (e.target) {
        console.log("handleFileRead");
        const audioFile = new Blob([e.target.result as ArrayBuffer], {
          type: "audio/wav",
        });
        setAudio(audioFile);
      }
    },
    [setAudio]
  );

  useEffect(() => {
    if (audioFile) {
      console.log("audioFile", audioFile);
      const reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsArrayBuffer(audioFile);
    }
  }, [audioFile, handleFileRead]);

  const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (audio && audioRef && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audio);
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }, [audioCtx]);

  useEffect(() => {
    if (audioCtx && requestAudioStream) {
      console.log("requestAudioStream");
      requestAudioStream().then((stream) => {
        console.log("stream", stream);
      });
    }
  }, [audioCtx, requestAudioStream]);

  return {
    audio,
    handleFileUpload,
    handlePlay,
  };
};
