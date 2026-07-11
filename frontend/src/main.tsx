/**
 * Punto de entrada Vite: monta App en #root con React StrictMode.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initGlitchTip } from './observability/glitchtip';
import './styles.css';

initGlitchTip();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
