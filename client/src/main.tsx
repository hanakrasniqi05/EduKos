import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './app/globals.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RtcProvider } from './context/RtcContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RtcProvider>
          <App />
        </RtcProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
