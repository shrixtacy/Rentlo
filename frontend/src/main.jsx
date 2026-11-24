import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: { borderRadius: '12px', background: '#0F172A', color: '#fff' },
        success: { iconTheme: { primary: '#A8E63D', secondary: '#0F172A' } },
      }}
    />
  </React.StrictMode>
);
