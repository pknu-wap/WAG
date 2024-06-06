import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const RouteChangeTracker = () => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  //localhost는 기록 x
  useEffect(() => {
    if (!window.location.href.includes("localhost")) { 
      ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
    }
    setInitialized(true);
  }, []);

  //location 변경 감지시 이벤트 전송
  useEffect(() => {
    if (initialized) {
      ReactGA.set({ page: location.pathname });
      ReactGA.send("pageview");
    }
  }, [initialized, location]);
  return null;
};

export default RouteChangeTracker;