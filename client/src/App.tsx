import { Route, Routes } from "react-router-dom";
import GamePlaying from "./GamePlaying/GamePlaying";
import MainPage from "./main/MainPage";
import FullLayout from "./components/layout/FullLayout";

function App() {
  return (
    <FullLayout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/GamePlaying" element={<GamePlaying />} />
      </Routes>
    </FullLayout>
  );
}

export default App;
