import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AdminEnterpriseProvider } from './context/AdminEnterpriseContext';
import { Loading } from './components/common/Loading/Loading';
import './styles.css';
import { Error } from './components/Error';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AdminEnterpriseProvider>
            <Error>
              <Suspense fallback={<Loading fullScreen label="Carregando aplicação..." />}>
                <App />
              </Suspense>
            </Error>
          </AdminEnterpriseProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
