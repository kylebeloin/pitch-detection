// Recorder component
import { useState, useEffect, useCallback } from "react";
import { useStream } from "./Stream";

const options = {
  audioBitsPerSecond: 44100,
};

// async function requestAudioStream() {
//   // check if browser supports web audio API
//   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//     console.log("Web audio API not supported.");
//     return;
//   }
//   let stream = null;
//   try {
//     stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     /* use the stream */
//   } catch (err: any) {
//     console.log(`navigator.mediaDevices.getUserMedia() failed: ${err.message}`);
//     /* handle the error */
//   }

//   if (stream === null) {
//     console.log("Stream is null");
//   }

//   return stream as MediaStream;
// }

export const useRecorder = () => {
  const [recorder, setRecorder] = useState<MediaRecorder>();
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Blob>();
  const [view, setView] = useState<Float32Array>();

  const { stream, requestAudioStream } = useStream();

  const handleData = useCallback(
    (event: BlobEvent) => {
      setAudio(event.data);
    },
    [setAudio]
  );

  useEffect(() => {
    if (audio) {
      let ctx = new AudioContext();
      let reader = new FileReader() as any;
      reader.readAsArrayBuffer(audio);
      reader.onloadend = () => {
        ctx
          .decodeAudioData(reader.result)
          .then(function (decodedData) {
            // create new blob with type of mp3 from e.data
            setView(decodedData.getChannelData(0));
          })
          .catch((err) => {
            console.error(err);
            // alert user of error
            console.log("Error decoding audio data. Please try again.");
          });
      };
    }
  }, [audio]);

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (!recorder && recording && stream) {
      setRecorder(new MediaRecorder(stream as MediaStream, options));
      return;
    }

    // Manage recorder state.
    if (recorder) {
      if (recorder["state"] === "recording") {
        recorder.stop();
      } else if (recorder["state"] === "inactive") {
        recorder.start();
      }
    }

    // Obtain the audio when ready.

    recorder && recorder.addEventListener("dataavailable", handleData);
    // Clean up.
    return () =>
      recorder && recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, recording, stream, handleData]);

  const startRecording = (e: MouseEvent) => {
    e.preventDefault();
    if (!stream) {
      requestAudioStream().then(() => setRecording(true));
    } else {
      setRecording(true);
    }
  };

  const stopRecording = () => {
    setRecording(false);
  };

  return { audio, recording, startRecording, stopRecording, view };
};
