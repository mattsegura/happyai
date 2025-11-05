import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initSentry, SentryErrorBoundary } from './lib/monitoring/sentry';
import { initAnalytics } from './lib/monitoring/analytics';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import 'preline';

// Initialize monitoring (only in production)
initSentry();
initAnalytics();

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a notification to the user that a new version is available
    if (confirm('New version available! Click OK to update.')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
  onRegistered(registration) {
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // 1 hour
    }
  }
});

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
