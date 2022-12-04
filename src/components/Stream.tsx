import {
  useState,
  FC,
  useContext,
  createContext,
  PropsWithChildren,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface StreamContext {
  audio?: Blob;
  audioRef?: React.RefObject<HTMLAudioElement>;
  stream?: MediaStream;
  source?: string;
  recorder?: MediaRecorder;
  audioCtx?: AudioContext;
  initCallback?: (callback: () => void) => void;
  requestUserMediaStream?: () => Promise<MediaStream>;
  requestAudioStream?: () => Promise<MediaStream>;
  setAudio: (audio: Blob) => void;
  setRecorder: (recorder: MediaRecorder) => void;
}

const streamContext = createContext({} as StreamContext);

export const useStream = () => {
  return useContext(streamContext);
};

function useStreamContext() {
  const [stream, setStream] = useState<MediaStream>();
  const [source, setSource] = useState<string>();
  const [audio, setAudio] = useState<Blob>();
  const [recorder, setRecorder] = useState<MediaRecorder>();
  const [callback, setCallback] = useState<() => void>();
  const [audioCtx, setAudioCtx] = useState<AudioContext>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const requestUserMediaStream = async () => {
    if (stream) {
      return stream;
    }
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setSource("user");
    setStream(newStream);
    return newStream;
  };

  const requestAudioStream = async () => {
    console.log("requestAudioStream");
    if (stream) {
      return stream;
    }

    const audioCtx = new AudioContext();
    const newStream = audioCtx.createMediaStreamDestination().stream;
    setSource("audio");
    setStream(newStream);
    setAudioCtx(audioCtx);

    return newStream;
  };

  const addTimeUpdateListener = useCallback(() => {
    if (audioRef && audioRef.current && callback) {
      console.log("addTimeUpdateListener");
      let audio = audioRef.current as HTMLAudioElement;
      audio.addEventListener("timeupdate", callback);
    }
  }, [audioRef, callback]);

  const removeTimeUpdateListener = useCallback(() => {
    if (audioRef && audioRef.current && callback) {
      let audio = audioRef.current as HTMLAudioElement;
      audio.removeEventListener("timeupdate", callback);
    }
  }, [audioRef, callback]);

  const initCurrentTime = useCallback(() => {
    if (audioRef && audioRef.current && audio) {
      let audio = audioRef.current as HTMLAudioElement;
      audio.currentTime = 1e101;
    }
  }, [audioRef, audio]);

  const initCallback = useCallback(
    (callback: () => void) => {
      console.log("initCallback", callback);
      if (audioRef && audioRef.current && audio) {
        setCallback(callback);
      } else {
        setCallback(undefined);
      }
    },
    [audioRef, audio, setCallback]
  );

  useEffect(() => {
    if (audioRef && audioRef.current && audio) {
      audioRef.current.src = URL.createObjectURL(audio);
      audioRef.current.addEventListener("loadeddata", initCurrentTime);
    }
  }, [audio, audioRef, initCurrentTime]);

  useEffect(() => {
    let a = audioRef.current as HTMLAudioElement;
    if (audioRef && a) {
      addTimeUpdateListener();
    }
    return () => {
      if (audioRef && a) {
        removeTimeUpdateListener();
      }
    };
  }, [audio, audioRef, addTimeUpdateListener, removeTimeUpdateListener]);

  return {
    stream,
    source,
    requestUserMediaStream,
    requestAudioStream,
    audioCtx,
    audio,
    audioRef,
    setAudio,
    recorder,
    setRecorder,
    initCallback,
  };
}

export const StreamProvider: FC<PropsWithChildren> = ({ children }) => {
  const stream: StreamContext = useStreamContext();

  return (
    <streamContext.Provider value={stream}>{children}</streamContext.Provider>
  );
};
