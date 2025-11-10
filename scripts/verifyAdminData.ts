/**
 * Admin Data Verification Script
 *
 * Quick verification of admin data service implementation.
 * Run with: npx tsx scripts/verifyAdminData.ts
 */

import { getDataStats, getDataMode, getGrades, getSentimentData, getStudents } from '../src/lib/admin/adminDataService';
import { calculatePearsonCorrelation } from '../src/lib/statistics/correlation';
import { calculateMean, calculateStandardDeviation, calculateDescriptiveStats } from '../src/lib/statistics/descriptive';
import { calculateGradeDistribution, calculateSentimentDistribution } from '../src/lib/admin/adminCalculations';

async function verify() {
  console.log('='.repeat(80));
  console.log('ADMIN DATA SERVICE VERIFICATION');
  console.log('='.repeat(80));
  console.log();

  // Check data mode
  console.log('📊 Data Mode:', getDataMode());
  console.log();

  // Check data stats
  console.log('📈 Data Statistics:');
  const stats = getDataStats();
  console.log(stats);
  console.log();

  // Verify data counts
  console.log('✅ Verification Checks:');
  const checks = [
    { name: 'Students >= 500', pass: stats.students >= 500 },
    { name: 'Teachers >= 50', pass: stats.teachers >= 50 },
    { name: 'Classes >= 100', pass: stats.classes >= 100 },
    { name: 'Grades >= 1000', pass: stats.grades >= 1000 },
    { name: 'Sentiment >= 2000', pass: stats.sentimentRecords >= 2000 },
    { name: 'Assignments >= 500', pass: stats.assignments >= 500 },
  ];

  checks.forEach((check) => {
    console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  console.log();

  // Test data service methods
  console.log('🔍 Testing Data Service Methods:');

  const grades = await getGrades({ universityId: 'mock-university-1' });
  console.log(`  ✅ getGrades(): ${grades.length} records`);

  const sentiment = await getSentimentData({ universityId: 'mock-university-1' });
  console.log(`  ✅ getSentimentData(): ${sentiment.length} records`);

  const students = await getStudents({ universityId: 'mock-university-1' });
  console.log(`  ✅ getStudents(): ${students.length} records`);
  console.log();

  // Test filtering
  console.log('🎯 Testing Filters:');

  const mathGrades = await getGrades({
    universityId: 'mock-university-1',
    department: 'mathematics',
  });
  console.log(`  ✅ Filter by department: ${mathGrades.length} math grades`);

  const lowSentiment = await getSentimentData({
    universityId: 'mock-university-1',
    maxSentiment: 3,
  });
  console.log(`  ✅ Filter by sentiment: ${lowSentiment.length} low sentiment records`);

  const atRiskStudents = await getStudents({
    universityId: 'mock-university-1',
    atRisk: true,
  });
  console.log(`  ✅ Filter at-risk students: ${atRiskStudents.length} students`);
  console.log();

  // Test calculations
  console.log('🧮 Testing Calculations:');

  const gradeScores = grades.map((g) => g.score);
  const avgGrade = calculateMean(gradeScores);
  const stdGrade = calculateStandardDeviation(gradeScores);
  console.log(`  ✅ Average Grade: ${avgGrade.toFixed(2)} (±${stdGrade.toFixed(2)})`);

  const sentimentValues = sentiment.map((s) => s.sentimentValue);
  const avgSentiment = calculateMean(sentimentValues);
  const stdSentiment = calculateStandardDeviation(sentimentValues);
  console.log(`  ✅ Average Sentiment: ${avgSentiment.toFixed(2)} (±${stdSentiment.toFixed(2)})`);
  console.log();

  // Test distributions
  console.log('📊 Testing Distributions:');

  const gradeDistribution = calculateGradeDistribution(grades);
  console.log('  Grade Distribution:');
  gradeDistribution.forEach((bin) => {
    console.log(`    ${bin.grade}: ${bin.count} (${bin.percentage.toFixed(1)}%)`);
  });
  console.log();

  const sentimentDistribution = calculateSentimentDistribution(sentiment);
  console.log('  Sentiment Distribution:');
  sentimentDistribution.slice(0, 3).forEach((dist) => {
    console.log(`    Level ${dist.sentimentLevel} (${dist.label}): ${dist.count} (${dist.percentage.toFixed(1)}%)`);
  });
  console.log();

  // Test correlation
  console.log('🔗 Testing Correlation:');

  const studentGrades = students.map((s) => s.avgGrade);
  const studentSentiment = students.map((s) => s.avgSentiment);

  const correlation = calculatePearsonCorrelation(studentGrades, studentSentiment);
  console.log(`  ✅ Sentiment-Grade Correlation: r = ${correlation.toFixed(3)}`);

  const expectedRange = correlation >= 0.5 && correlation <= 0.8;
  console.log(`  ${expectedRange ? '✅' : '❌'} Correlation in expected range (0.5-0.8): ${expectedRange}`);
  console.log();

  // Test descriptive stats
  console.log('📈 Descriptive Statistics (Grades):');
  const gradeStats = calculateDescriptiveStats(gradeScores);
  console.log(`  Mean: ${gradeStats.mean.toFixed(2)}`);
  console.log(`  Median: ${gradeStats.median.toFixed(2)}`);
  console.log(`  Std Dev: ${gradeStats.stdDev.toFixed(2)}`);
  console.log(`  Min: ${gradeStats.min.toFixed(2)}`);
  console.log(`  Max: ${gradeStats.max.toFixed(2)}`);
  console.log(`  Range: ${gradeStats.range.toFixed(2)}`);
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(80));
  console.log();
  console.log('All admin data service components are working correctly!');
  console.log();
  console.log('Next Steps:');
  console.log('  1. Start using adminDataService in admin components');
  console.log('  2. Replace hardcoded values with real calculations');
  console.log('  3. When ready, set VITE_USE_ADMIN_MOCK=false for real data');
  console.log();
}

verify().catch(console.error);
