import { useStream } from "./Stream";
import { useState, useEffect, useCallback } from "react";
import { processAudio } from "../utility/AutoCorrelation";

export const useAudioAnalyzer = () => {
  const { recorder, audio, source } = useStream();
  const [view, setView] = useState<Float32Array>();
  const [context, setContext] = useState<AudioContext>();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[][]>();

  const handleUserMedia = useCallback(() => {
    if (
      source &&
      context &&
      audio &&
      context &&
      ((recorder && recorder["state"] === "inactive") || !recorder)
    ) {
      let reader = new FileReader() as any;
      reader.addEventListener("progress", () => {
        console.log("Audio is loading");
      });

      reader.readAsArrayBuffer(audio);
      reader.onloadend = () => {
        context
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
  }, [audio, context, source, recorder]);

  const handleAudioFile = useCallback(() => {
    if (source && context && audio) {
      let reader = new FileReader() as any;
      reader.addEventListener("progress", () => {
        console.log("Audio is loading");
      });

      reader.readAsArrayBuffer(audio);
      reader.onloadend = () => {
        context
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
  }, [audio, context, source]);

  const handleAudio = useCallback(() => {
    console.log(source);
    if (audio && context && source) {
      switch (source) {
        case "user":
          handleUserMedia();
          break;
        case "file":
          handleAudioFile();
          break;
        default:
          break;
      }
    } else if (audio && !context) {
      console.log("No context");
      let context = new AudioContext();
      setContext(context);
    }
  }, [context, audio, source, handleUserMedia, handleAudioFile]);

  useEffect(() => {
    if (recorder) {
      setLoading(true);
      handleAudio();
    }
  }, [recorder, handleAudio]);

  useEffect(() => {
    if (view) {
      let track = processAudio(view);

      setData(track);
      setLoading(false);
    }
  }, [view]);

  return { processAudio, data, loading };
};
