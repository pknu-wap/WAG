import { Route, Routes } from "react-router-dom";
import GamePlaying from "./Game/GamePlaying";
import MainPage from "./main/MainPage";
import FullLayout from "./components/layout/FullLayout";
import JoinGame from "./Game/JoinGame";
import CreateRoom from "./CreateRoom/CreateRoom";
import ReadyToGame from "./Game/ReadyToGame";
import WrongUrl from "./components/layout/404";

function App() {
  return (
    <FullLayout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/CreateRoom" element={<CreateRoom />} />
        <Route path="/JoinGame" element={<JoinGame />} />
        <Route path="/ReadyToGame/:roomId" element={<ReadyToGame />} />
        <Route path="/GamePlaying" element={<GamePlaying />} />
        <Route path="/*" element={<WrongUrl />} />
      </Routes>
    </FullLayout>
  );
}

export default App;
