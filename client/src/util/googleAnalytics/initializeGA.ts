import ReactGA from "react-ga4";

export const initializeGA = () => {
    const trackingId = process.env.REACT_APP_GA_TRACKING_ID;

    if (!trackingId) {
        console.warn("⚠️ GA_TRACKING_ID is missing");
        return;
    }

    // ✔️ 무조건 초기화 (개발/운영 구분 없이 수집 가능하게)
    ReactGA.initialize(trackingId);

    if (process.env.NODE_ENV === "development") {
        console.log("🧪 GA initialized in development mode");
    }
};
