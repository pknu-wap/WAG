import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from '../../modules';
import Header from '../../components/layout/Header';
import SquareBubble from '../../components/layout/SquareBubble';
import FullLayout from '../../components/layout/FullLayout';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children?: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RecoilRoot>
          <BrowserRouter>
            <SquareBubble>
              <FullLayout>
                <Header />
                {children}
              </FullLayout>
              <ToastContainer />
            </SquareBubble>
          </BrowserRouter>
        </RecoilRoot>
      </Provider>
    </QueryClientProvider>
  );
};

export default AppProviders;

