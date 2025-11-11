import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initSentry, SentryErrorBoundary } from './lib/monitoring/sentry';
import { initAnalytics } from './lib/monitoring/analytics';
import './index.css';
// import 'preline';

// Initialize monitoring (only in production)
// Temporarily disabled due to script injection issues
// initSentry();
// initAnalytics();

// PWA registration temporarily disabled - plugin not configured
// import { registerSW } from 'virtual:pwa-register';
// const updateSW = registerSW({ ... });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster />
    </ErrorBoundary>
  </StrictMode>
);
