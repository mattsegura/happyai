/**
 * ============================================================================
 * K6 LOAD TESTING SCRIPT
 * ============================================================================
 * Purpose: Simulate 1,000+ concurrent users to test system performance
 * Phase 6: Production Readiness - Load Testing
 *
 * Installation:
 *   brew install k6  (Mac)
 *   sudo apt install k6  (Ubuntu)
 *   choco install k6  (Windows)
 *
 * Usage:
 *   # Small load test (100 users)
 *   k6 run scripts/load-test.js
 *
 *   # Production load test (1,000+ users)
 *   k6 run --vus 1000 --duration 5m scripts/load-test.js
 *
 *   # Stress test (ramp up to 2,000 users)
 *   k6 run --stage 1m:500 --stage 2m:1000 --stage 2m:2000 --stage 1m:0 scripts/load-test.js
 * ============================================================================
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Load from environment or use defaults
const SUPABASE_URL = __ENV.VITE_SUPABASE_URL || 'https://varogchclygvkuzfgxhh.supabase.co';
const SUPABASE_ANON_KEY = __ENV.VITE_SUPABASE_ANON_KEY || '';
const APP_URL = __ENV.APP_URL || 'http://localhost:5173';

// Test configuration
export const options = {
  // Default: Ramp up to 100 users over 1 minute, hold for 3 minutes, ramp down
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Hold at 100 users
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],

  // Performance thresholds (tests will fail if these are not met)
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests must complete < 500ms
    'http_req_failed': ['rate<0.01'],    // Error rate must be < 1%
    'checks': ['rate>0.95'],             // 95% of checks must pass
  },

  // Custom tags for better reporting
  tags: {
    test: 'load-test',
    environment: 'production',
  },
};

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const authSuccess = new Counter('auth_success');
const querySuccess = new Counter('query_success');

// ============================================================================
// TEST DATA
// ============================================================================

// Mock user credentials (update with actual test users)
const testUsers = [
  { email: 'student1@test.com', password: 'Test123!@#' },
  { email: 'student2@test.com', password: 'Test123!@#' },
  { email: 'teacher1@test.com', password: 'Test123!@#' },
];

// Headers for Supabase API
const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Prefer': 'return=representation',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function authenticateUser(email, password) {
  const payload = JSON.stringify({
    email,
    password,
  });

  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    payload,
    { headers: supabaseHeaders }
  );

  const success = check(res, {
    'auth status is 200': (r) => r.status === 200,
    'auth returns access token': (r) => r.json('access_token') !== undefined,
  });

  if (success) {
    authSuccess.add(1);
    return res.json('access_token');
  } else {
    errorRate.add(1);
    console.error(`Auth failed: ${res.status} - ${res.body}`);
    return null;
  }
}

function makeAuthenticatedRequest(url, token, method = 'GET', body = null) {
  const headers = {
    ...supabaseHeaders,
    'Authorization': `Bearer ${token}`,
  };

  const start = Date.now();
  const res = method === 'GET'
    ? http.get(url, { headers })
    : http.post(url, body, { headers });
  const duration = Date.now() - start;

  apiLatency.add(duration);

  const success = check(res, {
    [`${method} status is 200-299`]: (r) => r.status >= 200 && r.status < 300,
    [`${METHOD} response time < 500ms`]: () => duration < 500,
  });

  if (success) {
    querySuccess.add(1);
  } else {
    errorRate.add(1);
  }

  return res;
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

export default function () {
  // Pick a random test user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  group('Authentication Flow', function () {
    const token = authenticateUser(user.email, user.password);

    if (!token) {
      console.error('Authentication failed, skipping tests');
      return;
    }

    sleep(1); // Think time between requests

    // ========================================================================
    // Student Dashboard Queries
    // ========================================================================

    group('Student Dashboard', function () {
      // Get user profile
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
        token
      );

      sleep(0.5);

      // Get user classes
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/class_enrollment?student_id=eq.${user.id}&select=*,classes(*)`,
        token
      );

      sleep(0.5);

      // Get recent pulse checks
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/pulse_checks?user_id=eq.${user.id}&order=created_at.desc&limit=30`,
        token
      );

      sleep(0.5);

      // Get notifications
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/rpc/get_user_notifications`,
        token,
        'POST',
        JSON.stringify({
          p_user_id: user.id,
          p_limit: 20,
          p_offset: 0,
          p_status: 'unread',
        })
      );
    });

    sleep(2); // User reading dashboard

    // ========================================================================
    // Academic Features
    // ========================================================================

    group('Academic Features', function () {
      // Get Canvas courses
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/canvas_courses?user_id=eq.${user.id}&limit=20`,
        token
      );

      sleep(0.5);

      // Get assignments
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/canvas_assignments?user_id=eq.${user.id}&limit=50`,
        token
      );

      sleep(0.5);

      // Check AI quota
      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/rpc/check_ai_quota`,
        token,
        'POST',
        JSON.stringify({
          p_user_id: user.id,
          p_feature_type: 'study_coach',
          p_max_weekly_usage: 50,
        })
      );
    });

    sleep(3); // User interacting with features

    // ========================================================================
    // Sentiment & Pulse
    // ========================================================================

    group('Pulse Check Submission', function () {
      // Submit morning pulse
      const pulsePayload = JSON.stringify({
        user_id: user.id,
        emotion: 'happy',
        sentiment: 6,
        note: 'Load test pulse check',
      });

      makeAuthenticatedRequest(
        `${SUPABASE_URL}/rest/v1/pulse_checks`,
        token,
        'POST',
        pulsePayload
      );
    });

    sleep(1);
  });

  // Random think time between user sessions
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`   Target: ${SUPABASE_URL}`);
  console.log(`   App URL: ${APP_URL}`);
  console.log('');

  // Verify connection
  const res = http.get(`${SUPABASE_URL}/rest/v1/`);
  if (res.status !== 200) {
    throw new Error(`Cannot connect to Supabase: ${res.status}`);
  }

  return { startTime: new Date() };
}

export function teardown(data) {
  const endTime = new Date();
  const duration = (endTime - data.startTime) / 1000;

  console.log('');
  console.log('================================================================================');
  console.log('  LOAD TEST COMPLETE');
  console.log('================================================================================');
  console.log(`Duration: ${Math.round(duration)}s`);
  console.log(`Auth successes: ${authSuccess.count}`);
  console.log(`Query successes: ${querySuccess.count}`);
  console.log('');
  console.log('📊 Check detailed results above');
  console.log('');
}

// ============================================================================
// CUSTOM SUMMARY
// ============================================================================

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;
  const { metrics } = data;

  let output = '\n';
  output += `${indent}================================================================================\n`;
  output += `${indent}  LOAD TEST SUMMARY\n`;
  output += `${indent}================================================================================\n\n`;

  // HTTP metrics
  output += `${indent}HTTP Performance:\n`;
  output += `${indent}  Total requests: ${metrics.http_reqs.values.count}\n`;
  output += `${indent}  Request rate: ${metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  output += `${indent}  Failed requests: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  output += `${indent}  Avg response time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  output += `${indent}  P95 response time: ${metrics['http_req_duration{p(95)}'].toFixed(2)}ms\n`;
  output += `${indent}  P99 response time: ${metrics['http_req_duration{p(99)}'].toFixed(2)}ms\n\n`;

  // Custom metrics
  if (metrics.errors) {
    output += `${indent}Errors:\n`;
    output += `${indent}  Error rate: ${(metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;
  }

  // Checks
  output += `${indent}Checks:\n`;
  output += `${indent}  Passed: ${(metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;

  // Thresholds
  const thresholds = data.thresholds || {};
  const failedThresholds = Object.entries(thresholds).filter(
    ([_, value]) => !value.ok
  );

  if (failedThresholds.length > 0) {
    output += `${indent}⚠️  Failed Thresholds:\n`;
    failedThresholds.forEach(([name, _]) => {
      output += `${indent}  ❌ ${name}\n`;
    });
    output += '\n';
  } else {
    output += `${indent}✅ All thresholds passed!\n\n`;
  }

  output += `${indent}================================================================================\n`;

  return output;
}
