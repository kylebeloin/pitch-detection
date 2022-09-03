import {
  useState,
  FC,
  useContext,
  createContext,
  PropsWithChildren,
} from "react";

interface StreamContext {
  audio?: Blob;
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

  return { stream, requestAudioStream, audio, setAudio, recorder, setRecorder };
}

export const StreamProvider: FC<PropsWithChildren> = ({ children }) => {
  const stream: StreamContext = useStreamContext();

  return (
    <streamContext.Provider value={stream}>{children}</streamContext.Provider>
  );
};
