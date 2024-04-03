import "./App.css";
import { Route, Routes } from "react-router-dom";
import GamePlaying from "./GamePlaying/GamePlaying";
import MainPage from "./main/MainPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/GamePlaying" element={<GamePlaying />} />
      </Routes>
    </div>
  );
}

export default App;
