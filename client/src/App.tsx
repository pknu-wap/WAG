import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import GamePlaying from "./Game/GamePlaying";
import MainPage from "./main/MainPage";
import FullLayout from "./components/layout/FullLayout";
import JoinGame from "./Game/JoinGame";
import CreateRoom from "./CreateRoom/CreateRoom";
import ReadyToGame from "./Game/ReadyToGame";
import WrongUrl from "./components/layout/404";
import WrongBrowser from "./components/layout/ChromePage";
import RouteChangeTracker from "./util/RouteChangeTracker";
function isChrome() {
  const userAgent = window.navigator.userAgent;
  //console.log(userAgent)
  return userAgent.includes('Chrome') || userAgent.includes('Safari');
}

function App() {
  RouteChangeTracker();
  return (
    <FullLayout>
      <AnimatePresence>
        {isChrome() ? (
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/CreateRoom" element={<CreateRoom />} />
              <Route path="/JoinGame" element={<JoinGame />} />
              <Route path="/ReadyToGame/:roomId" element={<ReadyToGame />} />
              <Route path="/GamePlaying" element={<GamePlaying />} />
              <Route path="/*" element={<WrongUrl />} />
            </Routes>
        ):(
            <WrongBrowser />
        )}
        
      </AnimatePresence>
    </FullLayout>
  );
}

export default App;
