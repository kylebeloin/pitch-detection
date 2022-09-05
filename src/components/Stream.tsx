import {
  useState,
  FC,
  useContext,
  createContext,
  PropsWithChildren,
  useRef,
  useEffect,
} from "react";

interface StreamContext {
  audio?: Blob;
  audioRef?: React.RefObject<HTMLAudioElement>;
  stream?: MediaStream;
  recorder?: MediaRecorder;
  requestAudioStream: () => Promise<MediaStream>;
  setAudio: (audio: Blob) => void;
  setRecorder: (recorder: MediaRecorder) => void;
}

const streamContext = createContext({} as StreamContext);

export const useStream = () => {
  return useContext(streamContext);
};

function useStreamContext() {
  const [stream, setStream] = useState<MediaStream>();
  const [audio, setAudio] = useState<Blob>();
  const [recorder, setRecorder] = useState<MediaRecorder>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const requestAudioStream = async () => {
    if (stream) {
      return stream;
    }
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setStream(newStream);
    return newStream;
  };

  useEffect(() => {
    if (audioRef && audioRef.current && audio) {
      audioRef.current.src = URL.createObjectURL(audio);
      audioRef.current.onloadeddata = () => {
        let audio = audioRef.current as HTMLAudioElement;
        if (audio.duration === Infinity) {
          audio.currentTime = 1e101;
        }
      };
    }
  }, [audio, audioRef]);

  return {
    stream,
    requestAudioStream,
    audio,
    audioRef,
    setAudio,
    recorder,
    setRecorder,
  };
}

export const StreamProvider: FC<PropsWithChildren> = ({ children }) => {
  const stream: StreamContext = useStreamContext();

  return (
    <streamContext.Provider value={stream}>{children}</streamContext.Provider>
  );
};
