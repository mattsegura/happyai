// =====================================================
// GOOGLE ANALYTICS 4 (GA4) SETUP
// =====================================================
// Track user behavior, page views, and custom events
// for product analytics and user insights
// =====================================================

import ReactGA from 'react-ga4'

/**
 * Initialize Google Analytics 4
 * Call this once in src/main.tsx
 */
export function initAnalytics() {
  // Check if GA4 Measurement ID is configured
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID

  // Only initialize in production AND if Measurement ID is provided
  if (import.meta.env.PROD && measurementId && measurementId !== '') {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        send_page_view: false, // We'll send page views manually
      },
    })
    console.log('✅ Google Analytics 4 initialized')
  } else if (!measurementId || measurementId === '') {
    console.log('ℹ️  Google Analytics disabled - no Measurement ID configured (add VITE_GA4_MEASUREMENT_ID to .env for production)')
  } else {
    console.log('ℹ️  Google Analytics disabled in development')
  }
}

/**
 * Track page view
 * Call this on route changes
 */
export function trackPageView(path: string, title?: string) {
  // Only track if GA4 is configured, otherwise use mock mode
  if (import.meta.env.VITE_GA4_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || document.title,
    })
  } else if (import.meta.env.DEV) {
    // Mock mode: log to console in development
    console.debug(`[Mock GA4] Page View: ${path} - ${title || document.title}`)
  }
}

/**
 * Track custom event
 * Use for tracking user actions
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  // Only track if GA4 is configured, otherwise use mock mode
  if (import.meta.env.VITE_GA4_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    })
  } else if (import.meta.env.DEV) {
    // Mock mode: log to console in development
    console.debug(`[Mock GA4] Event: ${category} - ${action}`, { label, value })
  }
}

/**
 * Set user properties
 * Call after user logs in
 */
export function setUserProperties(userId: string, properties?: Record<string, any>) {
  // Only set properties if GA4 is configured
  if (import.meta.env.VITE_GA4_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.set({
      userId: userId,
      ...properties,
    })
  } else if (import.meta.env.DEV) {
    // Mock mode: log to console in development
    console.debug(`[Mock GA4] User Properties:`, { userId, ...properties })
  }
}

// =====================================================
// PREDEFINED EVENT TRACKERS
// =====================================================

/**
 * Track user authentication events
 */
export const trackAuth = {
  signup: (method: string) => {
    trackEvent('Auth', 'Sign Up', method)
  },

  login: (method: string) => {
    trackEvent('Auth', 'Login', method)
  },

  logout: () => {
    trackEvent('Auth', 'Logout')
  },

  passwordReset: () => {
    trackEvent('Auth', 'Password Reset')
  },
}

/**
 * Track Canvas integration events
 */
export const trackCanvas = {
  connect: () => {
    trackEvent('Canvas', 'Connect', 'Canvas OAuth')
  },

  disconnect: () => {
    trackEvent('Canvas', 'Disconnect')
  },

  syncStart: () => {
    trackEvent('Canvas', 'Sync Start')
  },

  syncComplete: (itemsCount: number) => {
    trackEvent('Canvas', 'Sync Complete', `${itemsCount} items`, itemsCount)
  },

  syncError: (error: string) => {
    trackEvent('Canvas', 'Sync Error', error)
  },
}

/**
 * Track payment & subscription events
 */
export const trackPayment = {
  checkoutStart: (plan: string) => {
    trackEvent('Payment', 'Checkout Start', plan)
  },

  checkoutComplete: (plan: string, amount: number) => {
    trackEvent('Payment', 'Checkout Complete', plan, amount)
  },

  subscriptionCancel: (plan: string) => {
    trackEvent('Payment', 'Subscription Cancel', plan)
  },

  subscriptionReactivate: (plan: string) => {
    trackEvent('Payment', 'Subscription Reactivate', plan)
  },
}

/**
 * Track academic features
 */
export const trackAcademics = {
  viewGrades: () => {
    trackEvent('Academics', 'View Grades')
  },

  createStudyPlan: () => {
    trackEvent('Academics', 'Create Study Plan')
  },

  useCourseTutor: (courseId: string) => {
    trackEvent('Academics', 'Use Course Tutor', courseId)
  },

  viewAssignment: (assignmentId: string) => {
    trackEvent('Academics', 'View Assignment', assignmentId)
  },
}

/**
 * Track engagement features
 */
export const trackEngagement = {
  morningPulse: (emotion: string) => {
    trackEvent('Engagement', 'Morning Pulse', emotion)
  },

  classPulseResponse: (pulseId: string) => {
    trackEvent('Engagement', 'Class Pulse Response', pulseId)
  },

  sendHapiMoment: (recipientId: string) => {
    trackEvent('Engagement', 'Send Hapi Moment', recipientId)
  },

  viewLeaderboard: (classId: string) => {
    trackEvent('Engagement', 'View Leaderboard', classId)
  },

  earnAchievement: (achievementName: string) => {
    trackEvent('Engagement', 'Earn Achievement', achievementName)
  },
}

/**
 * Track AI features
 */
export const trackAI = {
  chatMessage: (feature: 'hapi-lab' | 'course-tutor' | 'study-coach') => {
    trackEvent('AI', 'Chat Message', feature)
  },

  generateStudyPlan: () => {
    trackEvent('AI', 'Generate Study Plan')
  },

  gradeProjection: () => {
    trackEvent('AI', 'Grade Projection')
  },
}

/**
 * Track errors and issues
 */
export const trackError = {
  apiError: (endpoint: string, statusCode: number) => {
    trackEvent('Error', 'API Error', `${endpoint} - ${statusCode}`)
  },

  authError: (errorType: string) => {
    trackEvent('Error', 'Auth Error', errorType)
  },

  paymentError: (errorMessage: string) => {
    trackEvent('Error', 'Payment Error', errorMessage)
  },
}

/**
 * Track performance metrics
 */
export const trackPerformance = {
  pageLoad: (page: string, loadTime: number) => {
    trackEvent('Performance', 'Page Load', page, Math.round(loadTime))
  },

  apiCall: (endpoint: string, duration: number) => {
    trackEvent('Performance', 'API Call', endpoint, Math.round(duration))
  },
}

// =====================================================
// REACT ROUTER INTEGRATION
// =====================================================

/**
 * Hook to track page views automatically
 * Use in your router component
 */
export function usePageTracking() {
  // This would integrate with React Router
  // to automatically track page views on route change

  /* Example usage with React Router v6:

  import { useLocation } from 'react-router-dom'
  import { useEffect } from 'react'

  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  */
}

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
// In src/main.tsx:
import { initAnalytics } from '@/lib/monitoring/analytics'

initAnalytics()

// Track page views in your router:
import { trackPageView } from '@/lib/monitoring/analytics'
import { useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location])

  return <YourApp />
}

// Track user login:
import { trackAuth, setUserProperties } from '@/lib/monitoring/analytics'

function handleLogin(user) {
  trackAuth.login('email')
  setUserProperties(user.id, {
    role: user.role,
    university: user.university_id
  })
}

// Track Canvas sync:
import { trackCanvas } from '@/lib/monitoring/analytics'

async function syncCanvas() {
  trackCanvas.syncStart()
  try {
    const result = await api.syncCanvas()
    trackCanvas.syncComplete(result.itemsCount)
  } catch (error) {
    trackCanvas.syncError(error.message)
  }
}

// Track payment:
import { trackPayment } from '@/lib/monitoring/analytics'

function handleCheckout(plan, amount) {
  trackPayment.checkoutStart(plan)
  // ... after successful payment
  trackPayment.checkoutComplete(plan, amount)
}
*/

// =====================================================
// SETUP INSTRUCTIONS:
// =====================================================

/*
1. Install React GA4:
   npm install react-ga4

2. Create GA4 property:
   - Go to https://analytics.google.com
   - Create new GA4 property
   - Get Measurement ID (G-XXXXXXXXXX)

3. Add to .env:
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

4. Update src/main.tsx:
   - Import initAnalytics()
   - Call before React renders

5. Configure in GA4 dashboard:
   - Set up custom dimensions (role, university)
   - Create conversion events (signup, checkout)
   - Set up funnels (signup → canvas connect → active user)

6. Privacy:
   - Add cookie consent banner
   - Update privacy policy
   - Respect user opt-out preferences
*/
