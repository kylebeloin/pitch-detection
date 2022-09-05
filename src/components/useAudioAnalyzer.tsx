import { useStream } from "./Stream";
import { useState, useEffect, useCallback } from "react";
import { processAudio } from "../utility/AutoCorrelation";

export const useAudioAnalyzer = () => {
  const { recorder, audio } = useStream();
  const [view, setView] = useState<Float32Array>();
  const [context, setContext] = useState<AudioContext>();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[][]>();

  const handleAudio = useCallback(() => {
    if (audio && context && recorder && recorder["state"] === "inactive") {
      setLoading(true);
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
    } else if (audio && !context) {
      let context = new AudioContext();
      setContext(context);
    }
  }, [context, audio, recorder]);

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
