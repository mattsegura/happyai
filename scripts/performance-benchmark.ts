#!/usr/bin/env tsx
/**
 * ============================================================================
 * PERFORMANCE BENCHMARKING SCRIPT
 * ============================================================================
 * Purpose: Test all critical database queries to ensure < 500ms response time
 * Phase 6: Production Readiness - Performance Optimization
 *
 * Usage:
 *   npm install -g tsx
 *   tsx scripts/performance-benchmark.ts
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const TARGET_RESPONSE_TIME = 500; // ms
const ITERATIONS = 5; // Run each query 5 times for average

// Test user IDs (replace with actual UUIDs from your database)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'; //  Replace
const TEST_TEACHER_ID = '00000000-0000-0000-0000-000000000002'; // Replace
const TEST_UNIVERSITY_ID = '00000000-0000-0000-0000-000000000003'; // Replace

interface BenchmarkResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  passed: boolean;
  query: string;
}

const results: BenchmarkResult[] = [];

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Utility: Measure query execution time
async function benchmark(
  name: string,
  queryFn: () => Promise<any>,
  iterations: number = ITERATIONS
): Promise<BenchmarkResult> {
  const times: number[] = [];

  console.log(`\n🔍 Testing: ${name}`);

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      await queryFn();
      const end = performance.now();
      const duration = end - start;
      times.push(duration);
      process.stdout.write(`.`);
    } catch (error) {
      console.error(`\n❌ Error in ${name}:`, error);
      times.push(9999); // Mark as failed
    }
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const passed = avgTime < TARGET_RESPONSE_TIME;

  const result: BenchmarkResult = {
    name,
    avgTime: Math.round(avgTime),
    minTime: Math.round(minTime),
    maxTime: Math.round(maxTime),
    iterations,
    passed,
    query: queryFn.toString().substring(0, 100)
  };

  console.log(
    passed
      ? `\n✅ ${name}: ${result.avgTime}ms (avg)`
      : `\n❌ ${name}: ${result.avgTime}ms (SLOW - target: ${TARGET_RESPONSE_TIME}ms)`
  );

  results.push(result);
  return result;
}

// ============================================================================
// BENCHMARK TESTS
// ============================================================================

async function runBenchmarks() {
  console.log('');
  console.log('================================================================================');
  console.log('  HAPIAI PERFORMANCE BENCHMARKING');
  console.log('================================================================================');
  console.log(`Target: All queries < ${TARGET_RESPONSE_TIME}ms`);
  console.log(`Iterations per query: ${ITERATIONS}`);
  console.log('================================================================================\n');

  // ------------------------------------------------------------------------
  // 1. USER & PROFILE QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get user profile', async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', TEST_USER_ID)
      .single();
    return data;
  });

  await benchmark('Get user with points and streaks', async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, points, current_streak, longest_streak')
      .eq('id', TEST_USER_ID)
      .single();
    return data;
  });

  // ------------------------------------------------------------------------
  // 2. CLASS & ENROLLMENT QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get user classes', async () => {
    const { data } = await supabase
      .from('class_enrollment')
      .select(`
        id,
        classes:class_id (
          id,
          name,
          description,
          class_code
        )
      `)
      .eq('student_id', TEST_USER_ID)
      .limit(20);
    return data;
  });

  await benchmark('Get teacher classes with enrollment count', async () => {
    const { data } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        class_enrollment (count)
      `)
      .eq('teacher_id', TEST_TEACHER_ID)
      .limit(20);
    return data;
  });

  // ------------------------------------------------------------------------
  // 3. PULSE & SENTIMENT QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get recent pulse checks', async () => {
    const { data } = await supabase
      .from('pulse_checks')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false })
      .limit(30);
    return data;
  });

  await benchmark('Get class sentiment summary', async () => {
    const { data } = await supabase
      .from('pulse_checks')
      .select('sentiment, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);
    return data;
  });

  // ------------------------------------------------------------------------
  // 4. ACADEMIC QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get Canvas courses', async () => {
    const { data } = await supabase
      .from('canvas_courses')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .limit(20);
    return data;
  });

  await benchmark('Get Canvas assignments with cache', async () => {
    const { data } = await supabase
      .from('assignment_cache')
      .select('*')
      .eq('teacher_id', TEST_TEACHER_ID)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(50);
    return data;
  });

  // ------------------------------------------------------------------------
  // 5. NOTIFICATION QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get user notifications', async () => {
    const { data } = await supabase
      .rpc('get_user_notifications', {
        p_user_id: TEST_USER_ID,
        p_limit: 20,
        p_offset: 0,
        p_status: 'all'
      });
    return data;
  });

  // ------------------------------------------------------------------------
  // 6. ANALYTICS QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Get analytics cache (teacher)', async () => {
    const { data } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('teacher_id', TEST_TEACHER_ID)
      .gte('expires_at', new Date().toISOString())
      .limit(10);
    return data;
  });

  await benchmark('Get admin analytics cache', async () => {
    const { data } = await supabase
      .from('admin_analytics_cache')
      .select('*')
      .eq('university_id', TEST_UNIVERSITY_ID)
      .gte('expires_at', new Date().toISOString())
      .limit(10);
    return data;
  });

  // ------------------------------------------------------------------------
  // 7. AI & QUOTA QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Check AI quota', async () => {
    const { data } = await supabase
      .rpc('check_ai_quota', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'study_coach',
        p_max_weekly_usage: 50
      });
    return data;
  });

  await benchmark('Get AI usage stats', async () => {
    const { data } = await supabase
      .rpc('get_user_ai_stats', {
        p_user_id: TEST_USER_ID,
        p_days_back: 7
      });
    return data;
  });

  // ------------------------------------------------------------------------
  // 8. COMPLEX JOINS
  // ------------------------------------------------------------------------

  await benchmark('Get class with students and recent pulses', async () => {
    const { data } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        class_enrollment (
          student:profiles (
            id,
            full_name,
            email
          )
        ),
        pulse_checks (
          id,
          sentiment,
          created_at
        )
      `)
      .eq('teacher_id', TEST_TEACHER_ID)
      .limit(5);
    return data;
  });

  // ------------------------------------------------------------------------
  // 9. AGGREGATION QUERIES
  // ------------------------------------------------------------------------

  await benchmark('Daily workload summary view', async () => {
    const { data } = await supabase
      .from('daily_workload_summary')
      .select('*')
      .eq('teacher_id', TEST_TEACHER_ID)
      .gte('due_date', new Date().toISOString())
      .limit(30);
    return data;
  });

  // ------------------------------------------------------------------------
  // PRINT RESULTS
  // ------------------------------------------------------------------------

  printResults();
}

// ============================================================================
// RESULTS REPORTING
// ============================================================================

function printResults() {
  console.log('\n');
  console.log('================================================================================');
  console.log('  BENCHMARK RESULTS');
  console.log('================================================================================\n');

  // Summary stats
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => r.passed === false).length;
  const totalTests = results.length;
  const avgAllQueries =
    results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;

  console.log(`Total queries tested: ${totalTests}`);
  console.log(`Passed (< ${TARGET_RESPONSE_TIME}ms): ${passed}`);
  console.log(`Failed (>= ${TARGET_RESPONSE_TIME}ms): ${failed}`);
  console.log(`Average response time: ${Math.round(avgAllQueries)}ms\n`);

  // Detailed results table
  console.log('Query Performance Details:');
  console.log('─'.repeat(80));
  console.log(
    `${'Query'.padEnd(40)} ${'Avg'.padStart(8)} ${'Min'.padStart(8)} ${'Max'.padStart(8)} ${'Status'.padStart(10)}`
  );
  console.log('─'.repeat(80));

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const name = result.name.substring(0, 38);
    console.log(
      `${name.padEnd(40)} ${(result.avgTime + 'ms').padStart(8)} ${(result.minTime + 'ms').padStart(8)} ${(result.maxTime + 'ms').padStart(8)} ${status.padStart(10)}`
    );
  });

  console.log('─'.repeat(80));

  // Slowest queries
  const slowest = [...results].sort((a, b) => b.avgTime - a.avgTime).slice(0, 5);
  console.log('\nSlowest Queries:');
  slowest.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name}: ${result.avgTime}ms`);
  });

  // Recommendations
  console.log('\n');
  console.log('================================================================================');
  console.log('  RECOMMENDATIONS');
  console.log('================================================================================\n');

  if (failed === 0) {
    console.log('✅ All queries are performing well! No action needed.\n');
  } else {
    console.log('⚠️  Some queries are slow. Consider:');
    results
      .filter((r) => !r.passed)
      .forEach((result) => {
        console.log(`\n❌ ${result.name} (${result.avgTime}ms):`);
        console.log('   - Add database indexes');
        console.log('   - Implement caching');
        console.log('   - Optimize query joins');
        console.log('   - Consider pagination');
      });
    console.log('');
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// ============================================================================
// RUN BENCHMARKS
// ============================================================================

runBenchmarks().catch((error) => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});
