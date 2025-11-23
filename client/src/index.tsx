import ReactDOM from 'react-dom/client';
import ReactModal from 'react-modal';
import './index.css';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import { initializeGA } from './shared/lib/google-analytics';
import reportWebVitals from './reportWebVitals';

// GA 초기화
initializeGA();

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

ReactModal.setAppElement(rootElement);

root.render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
