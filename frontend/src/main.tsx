import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Create root and render App immediately
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Initialize app functionality after React renders
import('./utils/appInitializer').then(({ initializeApp }) => {
  initializeApp();
}).catch(console.error);

// Initialize security headers after React renders
import('./security/securityMiddleware').then(({ applySecurityHeaders }) => {
  applySecurityHeaders();
}).catch(console.error);

// Initialize cache busting service after React renders
import('./services/CacheBustingService').then(({ cacheBustingService }) => {
  cacheBustingService.setCacheBustingEnabled(true);
}).catch(console.error);
