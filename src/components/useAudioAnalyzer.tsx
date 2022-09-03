import { useStream } from "./Stream";
import { useState, useEffect, useCallback } from "react";
import { AutoCorrelation, options } from "../utility/AutoCorrelation";

export const useAudioAnalyzer = () => {
  const { recorder, audio } = useStream();
  const [view, setView] = useState<Float32Array>();
  const [context, setContext] = useState<AudioContext>();
  const [autoCorrelator, setAutoCorrelator] = useState<AutoCorrelation>();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[][]>();

  const handleAudio = useCallback(() => {
    if (audio && context) {
      console.log("Audio is loading");
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
  }, [context, audio]);

  const processAudio = useCallback(async () => {
    if (view && !autoCorrelator) {
      let { freqMin, freqLow, freqHigh, freqMax, sampleRate } = options;
      let ac = new AutoCorrelation(
        freqMin,
        freqLow,
        freqHigh,
        freqMax,
        sampleRate
      );
      setAutoCorrelator(ac);
    } else if (view && autoCorrelator) {
      let track = [];
      let animationLength = options.sampleRate / 20;
      let animationBuff = new Float32Array(animationLength);
      let animationPosition = 0;
      let enmin = 0.5;
      let enmax = 0.1;
      for (let i = 0; i < view.length; i++) {
        animationBuff[animationPosition++] = view[i].valueOf();
        if (animationPosition === animationLength) {
          let fxest = autoCorrelator.calculateFrequency(
            animationBuff,
            animationLength
          );
          if (fxest.en > 0) {
            enmin =
              fxest.en < enmin ? fxest.en : 0.99 * enmin + 0.01 * fxest.en;
            enmax =
              fxest.en > enmax ? fxest.en : 0.99 * enmax + 0.01 * fxest.en;
          }
          //					console.log("enmin="+enmin+" enmax="+enmax+" en="+fxest.en);
          fxest.en > 0.1 * enmax
            ? track.push([fxest.fx, fxest.en / enmax, fxest.vs])
            : track.push([0, 0, 0]);
          // stop after one screen in mode 2
          // shift analysis buffer by 10ms
          let j;
          for (
            animationPosition = 0, j = animationLength / 5;
            j < animationLength;
            j++, animationPosition++
          )
            animationBuff[animationPosition] = animationBuff[j];
          console.log("Track is being processed");
        }
      }
      setData(track);
    }
  }, [view, autoCorrelator]);

  useEffect(() => {
    if (recorder) {
      setLoading(true);
      handleAudio();
    }
  }, [recorder, handleAudio]);

  useEffect(() => {
    if (view) {
      processAudio().then(() => {
        setLoading(false);
      });
    }
    return () => {
      setLoading(false);
    };
  }, [view, processAudio]);

  return { processAudio, data, loading };
};
