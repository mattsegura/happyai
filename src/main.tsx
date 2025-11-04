import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initSentry, SentryErrorBoundary } from './lib/monitoring/sentry';
import { initAnalytics } from './lib/monitoring/analytics';
import './index.css';
import 'preline';

// Initialize monitoring (only in production)
initSentry();
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary fallback={<ErrorBoundary />}>
      <ErrorBoundary>
        <App />
        <Toaster />
      </ErrorBoundary>
    </SentryErrorBoundary>
  </StrictMode>
);
