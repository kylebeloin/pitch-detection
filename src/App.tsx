import { Recorder } from "./components/Recorder";
import { StreamProvider } from "./components/Stream";
import "./App.css";

function App() {
  return (
    <div className="App">
      <StreamProvider>
        <Recorder />
      </StreamProvider>
    </div>
  );
}

export default App;
