import { Recorder } from "./Recorder";
import { StreamProvider } from "./Stream";
import { Visualization } from "./Visualization";

export const AudioVisContainer = () => {
  return (
    <StreamProvider>
      <Recorder />
      <Visualization />
    </StreamProvider>
  );
};
