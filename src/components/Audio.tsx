import { useAudio } from "./useAudio";
import { useStream } from "./Stream";

export const Audio = () => {
  const { handleFileUpload, handlePlay } = useAudio();
  const { audioRef } = useStream();

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handlePlay}>Play</button>
      <audio ref={audioRef} controls />
    </div>
  );
};
