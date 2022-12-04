import { AudioVisualization } from "./components/AudioVisualization";
import "./App.css";
import { StreamProvider } from "./components/Stream";
function App() {
  return (
    <div className="App">
      <StreamProvider>
        <AudioVisualization />
      </StreamProvider>
    </div>
  );
}

export default App;
