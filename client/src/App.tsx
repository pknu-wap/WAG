import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainPage from './pages/Main';
import CreateRoom from './pages/CreateRoom';
import GameRoom from './pages/GameRoom';
import WrongUrl from './components/layout/404';
import { initializeGA } from './util/googleAnalytics/initializeGA';
function isChrome() {
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('Chrome') || userAgent.includes('Safari');
}

function App() {
  useEffect(() => {
    initializeGA();
  }, []);

  return (
    <AnimatePresence>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/CreateRoom' element={<CreateRoom />} />
        <Route path='/GameRoom/:roomId' element={<GameRoom />} />
        <Route path='/*' element={<WrongUrl />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
