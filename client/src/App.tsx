import { Route, Routes } from "react-router-dom";
import GamePlaying from "./Game/GamePlaying";
import MainPage from "./main/MainPage";
import FullLayout from "./components/layout/FullLayout";
import ReadyToGame from "./Game/ReadyToGame";

function App() {
  return (
    <FullLayout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ReadyToGame" element={<ReadyToGame />} />
        <Route path="/GamePlaying" element={<GamePlaying />} />
      </Routes>
    </FullLayout>
  );
}

export default App;
