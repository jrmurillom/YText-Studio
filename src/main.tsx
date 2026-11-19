import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Suprimir menú contextual genérico del navegador para ofrecer una experiencia de escritorio 100% nativa
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found in DOM');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
