import ReactGA from 'react-ga4';

export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  ReactGA.event({ action, category, label, value });

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA EVENT]', { action, category, label, value });
  }
};

