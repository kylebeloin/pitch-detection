import {
  useState,
  FC,
  useContext,
  createContext,
  PropsWithChildren,
} from "react";

interface StreamContext {
  stream?: MediaStream;
  requestAudioStream: () => Promise<MediaStream>;
}

const streamContext = createContext({} as StreamContext);

export const useStream = () => {
  return useContext(streamContext);
};

function useStreamContext() {
  const [stream, setStream] = useState<MediaStream>();
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
  return { stream, requestAudioStream };
}

export const StreamProvider: FC<PropsWithChildren> = ({ children }) => {
  const stream: StreamContext = useStreamContext();

  return (
    <streamContext.Provider value={stream}>{children}</streamContext.Provider>
  );
};
