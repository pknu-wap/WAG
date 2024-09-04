import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./modules";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import ReactModal from "react-modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SquareBubble from "./components/layout/SquareBubble";

const queryClient = new QueryClient();
const rootElement = document.getElementById("root") as HTMLElement; // id가 'root'인 엘리먼트를 찾는 코드를 변수에 할당
const root = ReactDOM.createRoot(rootElement);
ReactModal.setAppElement(rootElement); //rootElement를 ReactModal의 app 엘리먼트로 설정

root.render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RecoilRoot>
          <BrowserRouter>
            <SquareBubble>
            <Header />
            <App />
            <ToastContainer />
            </SquareBubble>
            <Footer />
          </BrowserRouter>
        </RecoilRoot>
      </Provider>
    </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
