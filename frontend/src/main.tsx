import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to render React application:', error);
  // Fallback rendering untuk error recovery
  const errorElement = document.createElement('div');
  errorElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Gagal Memuat Aplikasi</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">Terjadi kesalahan saat memuat aplikasi GASS API. Silakan refresh halaman atau hubungi administrator.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Refresh Halaman
        </button>
      </div>
    </div>
  `;
  rootElement.replaceWith(errorElement);
}
