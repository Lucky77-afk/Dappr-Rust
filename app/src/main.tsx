import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { EscrowProvider } from './contexts/EscrowContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EscrowProvider>
      <App />
    </EscrowProvider>
  </React.StrictMode>
);
