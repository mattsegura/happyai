import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check visit count
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
      localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());

      // Show prompt after 2nd visit
      if (visitCount >= 1) {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after 2nd visit
    if (iOS && !standalone) {
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
      localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());

      if (visitCount >= 1) {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) {
    return null;
  }

  // iOS-specific instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300 sm:bottom-8 sm:left-8 sm:right-auto">
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg dark:bg-card/95 dark:backdrop-blur-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                Install HapiAI
              </h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Install this app on your iPhone: tap{' '}
                <span className="inline-block rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
                  <svg
                    className="inline-block h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </span>{' '}
                then "Add to Home Screen"
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Chrome prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300 sm:bottom-8 sm:left-8 sm:right-auto">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg dark:bg-card/95 dark:backdrop-blur-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              Install HapiAI
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Get faster access and work offline by installing the app
            </p>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="h-8 text-xs sm:h-9 sm:text-sm"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-8 text-xs sm:h-9 sm:text-sm"
              >
                Not now
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
