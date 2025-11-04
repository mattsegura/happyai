// =====================================================
// SENTRY ERROR TRACKING SETUP
// =====================================================
// Sentry provides real-time error tracking and monitoring
// for both client-side and server-side errors
// =====================================================

import * as Sentry from '@sentry/react'

/**
 * Initialize Sentry error tracking
 * Call this once in src/main.tsx before React renders
 */
export function initSentry() {
  // Check if Sentry DSN is configured
  const sentryDSN = import.meta.env.VITE_SENTRY_DSN

  // Only initialize in production AND if DSN is provided
  if (import.meta.env.PROD && sentryDSN && sentryDSN !== '') {
    Sentry.init({
      // Get DSN from Sentry dashboard
      dsn: sentryDSN,

      // Set environment
      environment: import.meta.env.MODE,

      // Performance monitoring
      tracesSampleRate: 1.0, // 100% of transactions
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Configure what to track (integrations are auto-configured in v8+)
      // BrowserTracing and Replay are automatically included

      // Filter out sensitive data
      beforeSend(event) {
        // Don't send passwords, tokens, or API keys
        if (event.request) {
          delete event.request.cookies
          delete event.request.headers?.['Authorization']
        }

        // Don't send errors from browser extensions
        if (event.exception?.values?.[0]?.stacktrace?.frames) {
          const frames = event.exception.values[0].stacktrace.frames
          const hasExtension = frames.some(
            (frame) =>
              frame.filename?.includes('chrome-extension://') ||
              frame.filename?.includes('moz-extension://')
          )
          if (hasExtension) {
            return null // Don't send
          }
        }

        return event
      },

      // Add user context
      beforeSendTransaction(transaction) {
        // Add custom tags
        transaction.tags = {
          ...transaction.tags,
          deployment: 'vercel',
        }
        return transaction
      },
    })

    console.log('✅ Sentry error tracking initialized')
  } else if (!sentryDSN || sentryDSN === '') {
    console.log('ℹ️  Sentry disabled - no DSN configured (add VITE_SENTRY_DSN to .env for production)')
  } else {
    console.log('ℹ️  Sentry disabled in development')
  }
}

/**
 * Set user context for error tracking
 * Call this after user logs in
 */
export function setSentryUser(userId: string, email?: string, role?: string) {
  // Only set user if Sentry is initialized
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email: email,
      role: role,
    })
  }
}

/**
 * Clear user context
 * Call this when user logs out
 */
export function clearSentryUser() {
  // Only clear user if Sentry is initialized
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null)
  }
}

/**
 * Manually capture an error
 * Use for caught errors you want to track
 */
export function captureError(error: Error, context?: Record<string, any>) {
  // Only capture if Sentry is initialized, otherwise log to console
  if (import.meta.env.VITE_SENTRY_DSN) {
    if (context) {
      Sentry.setContext('error_context', context)
    }
    Sentry.captureException(error)
  } else {
    // Mock mode: log to console
    console.error('[Mock Sentry] Error captured:', error, context)
  }
}

/**
 * Capture a message (for logging important events)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  // Only capture if Sentry is initialized, otherwise log to console
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  } else {
    // Mock mode: log to console
    console.log(`[Mock Sentry] ${level.toUpperCase()}:`, message)
  }
}

/**
 * Add breadcrumb for debugging
 * Breadcrumbs are tracked events leading up to an error
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  // Only add breadcrumb if Sentry is initialized
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    })
  } else {
    // Mock mode: log to console (debug level)
    if (import.meta.env.DEV) {
      console.debug(`[Mock Sentry] Breadcrumb [${category}]:`, message, data)
    }
  }
}

/**
 * Start a transaction for performance monitoring
 * Use for tracking long-running operations
 */
export function startTransaction(name: string, operation: string) {
  // Only start transaction if Sentry is initialized, otherwise return mock
  if (import.meta.env.VITE_SENTRY_DSN) {
    // In Sentry v8+, use startSpan instead of startTransaction
    return Sentry.startSpan({ name, op: operation }, (span) => span) as any
  } else {
    // Mock mode: return mock transaction object
    return {
      finish: () => console.debug(`[Mock Sentry] Transaction finished: ${name} (${operation})`),
      setTag: () => {},
      setData: () => {},
    } as any
  }
}

/**
 * Error Boundary component
 * Wrap your app with this to catch React errors
 *
 * Usage:
 * <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </Sentry.ErrorBoundary>
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
// In src/main.tsx:
import { initSentry, SentryErrorBoundary } from '@/lib/monitoring/sentry'

initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </SentryErrorBoundary>
  </React.StrictMode>
)

// After user logs in:
import { setSentryUser } from '@/lib/monitoring/sentry'

setSentryUser(user.id, user.email, user.role)

// Track custom errors:
import { captureError, addBreadcrumb } from '@/lib/monitoring/sentry'

try {
  await syncCanvasData()
} catch (error) {
  addBreadcrumb('Canvas sync attempt', 'canvas', { userId: user.id })
  captureError(error, { feature: 'canvas-sync' })
}

// Track performance:
import { startTransaction } from '@/lib/monitoring/sentry'

const transaction = startTransaction('canvas-sync', 'task')
await syncCanvasData()
transaction.finish()
*/

// =====================================================
// SETUP INSTRUCTIONS:
// =====================================================

/*
1. Install Sentry:
   npm install @sentry/react

2. Create Sentry account:
   - Go to https://sentry.io
   - Create new project (React)
   - Get your DSN

3. Add to .env:
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

4. Update src/main.tsx:
   - Import initSentry()
   - Call before React renders
   - Wrap App with SentryErrorBoundary

5. Configure alerts in Sentry dashboard:
   - Email on new issues
   - Slack integration (optional)
   - Set error thresholds
*/
