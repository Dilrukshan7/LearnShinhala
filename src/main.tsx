import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { installHybridApiInterceptor } from './services/hybrid-api-interceptor';

// Installs seamless fallback so the app works both with a live PostgreSQL backend
// AND on 100% free static hosts (GitHub Pages, Vercel, Netlify, Cloudflare Pages).
installHybridApiInterceptor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
