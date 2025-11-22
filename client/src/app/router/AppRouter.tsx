import { Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainPage from '../../pages/Main';
import CreateRoom from '../../pages/CreateRoom';
import GameRoom from '../../pages/GameRoom';

const AppRouter = () => {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/CreateRoom" element={<CreateRoom />} />
        <Route path="/GameRoom/:roomId" element={<GameRoom />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;

