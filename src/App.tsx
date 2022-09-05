import { AudioVisContainer } from "./components/AudioVisContainer";
import "./App.css";
import { StreamProvider } from "./components/Stream";
function App() {
  return (
    <div className="App">
      <StreamProvider>
        <AudioVisContainer />
      </StreamProvider>
    </div>
  );
}

export default App;
