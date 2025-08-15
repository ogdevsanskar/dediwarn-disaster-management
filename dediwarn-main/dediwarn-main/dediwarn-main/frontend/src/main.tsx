import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApp } from './utils/appInitializer';
import { applySecurityHeaders } from './security/securityMiddleware';

// Initialize security headers and CSP
applySecurityHeaders();

// Initialize the application with all button functionality
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
