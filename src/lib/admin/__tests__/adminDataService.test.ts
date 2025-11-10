/**
 * Admin Data Service Tests
 *
 * Verification tests for data service, calculations, and statistics.
 */

import { describe, it, expect } from 'vitest';

import {
  getGrades,
  getSentimentData,
  getStudents,
  getTeachers,
  getClasses,
  getAssignments,
  getDataStats,
  getDataMode,
} from '../adminDataService';

import {
  calculateAverage,
  calculateGradeDistribution,
  calculateSentimentDistribution,
  calculateTeacherEngagementScore,
  calculateAtRiskScore,
  calculatePearsonCorrelation,
  calculateStudentSuccessIndex,
} from '../adminCalculations';

import {
  calculatePearsonCorrelation as pearsonCorrelation,
  calculateSignificance,
  getSignificanceLevel,
} from '../../statistics/correlation';

import {
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  calculateDescriptiveStats,
} from '../../statistics/descriptive';

import { mockAdminData } from '../mockAdminData';

// ============================================================================
// DATA SERVICE TESTS
// ============================================================================

describe('Admin Data Service', () => {
  it('should return mock data by default', () => {
    const mode = getDataMode();
    expect(mode).toBe('mock');
  });

  it('should have comprehensive mock data', () => {
    const stats = getDataStats();
    expect(stats.mode).toBe('mock');
    expect(stats.students).toBeGreaterThan(400);
    expect(stats.grades).toBeGreaterThan(900);
    expect(stats.sentimentRecords).toBeGreaterThan(1900);
    expect(stats.teachers).toBeGreaterThan(40);
    expect(stats.classes).toBeGreaterThan(90);
  });

  it('should filter grades correctly', async () => {
    const allGrades = await getGrades({ universityId: 'mock-university-1' });
    expect(allGrades.length).toBeGreaterThan(0);

    const mathGrades = await getGrades({
      universityId: 'mock-university-1',
      department: 'mathematics',
    });
    expect(mathGrades.length).toBeGreaterThan(0);
    expect(mathGrades.every((g) => g.department === 'mathematics')).toBe(true);
  });

  it('should filter sentiment data correctly', async () => {
    const allSentiment = await getSentimentData({ universityId: 'mock-university-1' });
    expect(allSentiment.length).toBeGreaterThan(0);

    const lowSentiment = await getSentimentData({
      universityId: 'mock-university-1',
      maxSentiment: 3,
    });
    expect(lowSentiment.every((s) => s.sentimentValue <= 3)).toBe(true);
  });

  it('should filter students correctly', async () => {
    const allStudents = await getStudents({ universityId: 'mock-university-1' });
    expect(allStudents.length).toBeGreaterThan(400);

    const atRiskStudents = await getStudents({
      universityId: 'mock-university-1',
      atRisk: true,
    });
    expect(atRiskStudents.every((s) => s.consecutiveLowDays >= 3)).toBe(true);
  });

  it('should get teachers correctly', async () => {
    const teachers = await getTeachers({ universityId: 'mock-university-1' });
    expect(teachers.length).toBeGreaterThan(40);
    expect(teachers.every((t) => t.pulsesCreated >= 0)).toBe(true);
  });

  it('should get classes correctly', async () => {
    const classes = await getClasses({ universityId: 'mock-university-1' });
    expect(classes.length).toBeGreaterThan(90);
    expect(classes.every((c) => c.studentCount > 0)).toBe(true);
  });

  it('should get assignments correctly', async () => {
    const assignments = await getAssignments({ universityId: 'mock-university-1' });
    expect(assignments.length).toBeGreaterThan(400);
    expect(assignments.every((a) => a.totalSubmissions >= 0)).toBe(true);
  });
});

// ============================================================================
// CALCULATION TESTS
// ============================================================================

describe('Admin Calculations', () => {
  it('should calculate average correctly', () => {
    expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateAverage([10, 20, 30])).toBe(20);
    expect(calculateAverage([])).toBe(0);
  });

  it('should calculate grade distribution', async () => {
    const grades = await getGrades({ universityId: 'mock-university-1' });
    const distribution = calculateGradeDistribution(grades);

    expect(distribution.length).toBe(5);
    expect(distribution.every((d) => d.count >= 0)).toBe(true);
    expect(distribution.every((d) => d.percentage >= 0)).toBe(true);

    const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it('should calculate sentiment distribution', async () => {
    const sentiment = await getSentimentData({ universityId: 'mock-university-1' });
    const distribution = calculateSentimentDistribution(sentiment);

    expect(distribution.length).toBe(6);
    expect(distribution.every((d) => d.sentimentLevel >= 1 && d.sentimentLevel <= 6)).toBe(true);

    const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it('should calculate teacher engagement score', () => {
    const score = calculateTeacherEngagementScore({
      teacherId: 'test-1',
      teacherName: 'Test Teacher',
      department: 'mathematics',
      pulsesCreated: 10,
      commentsCount: 50,
      avgResponseTime: 24,
      loginDays: 20,
      totalStudents: 100,
      studentEngagementRate: 85,
      sentimentImprovement: 5,
      gradeImprovement: 3,
      universityId: 'test',
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should calculate at-risk score', () => {
    const highRisk = calculateAtRiskScore({
      id: 'test-1',
      name: 'Test Student',
      email: 'test@test.com',
      gradeLevel: 10,
      department: 'mathematics',
      avgGrade: 55,
      avgSentiment: 2,
      consecutiveLowDays: 7,
      moodVariability: 2.5,
      universityId: 'test',
    });

    expect(highRisk).toBeGreaterThan(50);

    const lowRisk = calculateAtRiskScore({
      id: 'test-2',
      name: 'Test Student 2',
      email: 'test2@test.com',
      gradeLevel: 10,
      department: 'mathematics',
      avgGrade: 90,
      avgSentiment: 5,
      consecutiveLowDays: 0,
      moodVariability: 0.5,
      universityId: 'test',
    });

    expect(lowRisk).toBeLessThan(20);
  });
});

// ============================================================================
// STATISTICAL TESTS
// ============================================================================

describe('Statistical Functions', () => {
  it('should calculate Pearson correlation correctly', () => {
    // Perfect positive correlation
    const r1 = pearsonCorrelation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    expect(r1).toBeCloseTo(1, 2);

    // Perfect negative correlation
    const r2 = pearsonCorrelation([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]);
    expect(r2).toBeCloseTo(-1, 2);

    // No correlation
    const r3 = pearsonCorrelation([1, 2, 3, 4, 5], [3, 3, 3, 3, 3]);
    expect(r3).toBeCloseTo(0, 2);
  });

  it('should verify sentiment-grade correlation in mock data', async () => {
    const students = await getStudents({ universityId: 'mock-university-1' });

    const sentimentScores = students.map((s) => s.avgSentiment);
    const gradeScores = students.map((s) => s.avgGrade);

    const r = pearsonCorrelation(sentimentScores, gradeScores);

    // Should have moderate to strong positive correlation (0.5-0.75)
    expect(r).toBeGreaterThan(0.5);
    expect(r).toBeLessThan(0.8);
  });

  it('should calculate significance correctly', () => {
    const r = 0.7;
    const n = 100;
    const pValue = calculateSignificance(r, n);

    expect(pValue).toBeGreaterThan(0);
    expect(pValue).toBeLessThan(0.05); // Should be significant

    const significance = getSignificanceLevel(pValue);
    expect(significance).toBe('high');
  });

  it('should calculate mean correctly', () => {
    expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateMean([10, 20, 30])).toBe(20);
  });

  it('should calculate median correctly', () => {
    expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
  });

  it('should calculate standard deviation correctly', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stdDev = calculateStandardDeviation(values);
    expect(stdDev).toBeCloseTo(2, 0);
  });

  it('should calculate descriptive stats', () => {
    const stats = calculateDescriptiveStats([1, 2, 3, 4, 5]);

    expect(stats.mean).toBe(3);
    expect(stats.median).toBe(3);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(5);
    expect(stats.range).toBe(4);
    expect(stats.count).toBe(5);
  });
});

// ============================================================================
// DATA QUALITY TESTS
// ============================================================================

describe('Mock Data Quality', () => {
  it('should have realistic grade distribution', async () => {
    const grades = await getGrades({ universityId: 'mock-university-1' });
    const scores = grades.map((g) => g.score);
    const avgGrade = calculateMean(scores);

    // Average should be around 75-82 (C+ to B-)
    expect(avgGrade).toBeGreaterThan(70);
    expect(avgGrade).toBeLessThan(85);
  });

  it('should have realistic sentiment distribution', async () => {
    const sentiment = await getSentimentData({ universityId: 'mock-university-1' });
    const values = sentiment.map((s) => s.sentimentValue);
    const avgSentiment = calculateMean(values);

    // Average should be slightly positive (4-5)
    expect(avgSentiment).toBeGreaterThan(3.5);
    expect(avgSentiment).toBeLessThan(5.5);
  });

  it('should have students with varying risk levels', async () => {
    const students = await getStudents({ universityId: 'mock-university-1' });
    const riskScores = students.map(calculateAtRiskScore);

    const highRisk = riskScores.filter((r) => r > 50).length;
    const lowRisk = riskScores.filter((r) => r < 20).length;

    // Should have both high and low risk students
    expect(highRisk).toBeGreaterThan(0);
    expect(lowRisk).toBeGreaterThan(0);
  });
});
