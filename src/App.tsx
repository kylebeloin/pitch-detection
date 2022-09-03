import { Recorder } from "./components/Recorder";
import { StreamProvider } from "./components/Stream";
import { CanvasProvider } from "./components/Canvas";
import "./App.css";

function App() {
  return (
    <div className="App">
      <CanvasProvider>
        <StreamProvider>
          <Recorder />
        </StreamProvider>
      </CanvasProvider>
    </div>
  );
}

export default App;
