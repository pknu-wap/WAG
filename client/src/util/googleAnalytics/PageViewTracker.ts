import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const PageViewTracker = (): null => {
  const location = useLocation();

  useEffect(() => {
    const rawPath = location.pathname;

    let page = rawPath;
    if (rawPath.startsWith('/GameRoom/')) page = '/GameRoom';

    ReactGA.set({ page });
    ReactGA.send('pageview');

    if (process.env.NODE_ENV === 'development') {
      console.log('[PAGEVIEW]', page);
    }
  }, [location.pathname]);

  return null;
};

export default PageViewTracker;
