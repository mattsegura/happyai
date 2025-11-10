/**
 * Descriptive Statistics
 *
 * Statistical functions for summarizing and describing data.
 * Implements measures of central tendency, dispersion, and distribution shape.
 */

import type { DescriptiveStats } from '../admin/types';

// ============================================================================
// CENTRAL TENDENCY
// ============================================================================

/**
 * Calculate mean (average) of an array of numbers
 *
 * @param values - Array of numbers
 * @returns Mean value
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate median (middle value) of an array of numbers
 *
 * @param values - Array of numbers
 * @returns Median value
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate mode (most frequent value) of an array of numbers
 *
 * @param values - Array of numbers
 * @returns Mode value (if multiple modes, returns first)
 */
export function calculateMode(values: number[]): number {
  if (values.length === 0) return 0;

  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode = values[0];

  for (const value of values) {
    frequency[value] = (frequency[value] || 0) + 1;

    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  }

  return mode;
}

// ============================================================================
// DISPERSION
// ============================================================================

/**
 * Calculate variance of an array of numbers
 *
 * @param values - Array of numbers
 * @param sample - If true, uses sample variance (n-1). Default: true
 * @returns Variance
 */
export function calculateVariance(values: number[], sample = true): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const mean = calculateMean(values);
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const sum = squaredDiffs.reduce((acc, val) => acc + val, 0);

  const divisor = sample ? values.length - 1 : values.length;
  return sum / divisor;
}

/**
 * Calculate standard deviation of an array of numbers
 *
 * @param values - Array of numbers
 * @param sample - If true, uses sample SD (n-1). Default: true
 * @returns Standard deviation
 */
export function calculateStandardDeviation(values: number[], sample = true): number {
  return Math.sqrt(calculateVariance(values, sample));
}

/**
 * Calculate range (max - min) of an array of numbers
 *
 * @param values - Array of numbers
 * @returns Range
 */
export function calculateRange(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

/**
 * Calculate interquartile range (IQR) of an array of numbers
 *
 * @param values - Array of numbers
 * @returns IQR (Q3 - Q1)
 */
export function calculateIQR(values: number[]): number {
  if (values.length < 4) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length / 4);
  const q3Index = Math.floor((sorted.length * 3) / 4);

  return sorted[q3Index] - sorted[q1Index];
}

/**
 * Calculate coefficient of variation (CV)
 *
 * @param values - Array of numbers
 * @returns CV as percentage
 */
export function calculateCoefficientOfVariation(values: number[]): number {
  const mean = calculateMean(values);
  if (mean === 0) return 0;

  const stdDev = calculateStandardDeviation(values);
  return (stdDev / Math.abs(mean)) * 100;
}

// ============================================================================
// DISTRIBUTION SHAPE
// ============================================================================

/**
 * Calculate skewness (measure of asymmetry)
 *
 * Positive skew: tail on right side
 * Negative skew: tail on left side
 *
 * @param values - Array of numbers
 * @returns Skewness coefficient
 */
export function calculateSkewness(values: number[]): number {
  if (values.length < 3) return 0;

  const n = values.length;
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return 0;

  const cubedDiffs = values.map((val) => Math.pow((val - mean) / stdDev, 3));
  const sum = cubedDiffs.reduce((acc, val) => acc + val, 0);

  return (n / ((n - 1) * (n - 2))) * sum;
}

/**
 * Calculate kurtosis (measure of tailedness)
 *
 * High kurtosis: heavy tails, more outliers
 * Low kurtosis: light tails, fewer outliers
 *
 * @param values - Array of numbers
 * @returns Excess kurtosis (normal distribution = 0)
 */
export function calculateKurtosis(values: number[]): number {
  if (values.length < 4) return 0;

  const n = values.length;
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return 0;

  const fourthPowers = values.map((val) => Math.pow((val - mean) / stdDev, 4));
  const sum = fourthPowers.reduce((acc, val) => acc + val, 0);

  const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const adjustment = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));

  return kurtosis - adjustment; // Excess kurtosis
}

// ============================================================================
// PERCENTILES & QUANTILES
// ============================================================================

/**
 * Calculate percentile of an array of numbers
 *
 * @param values - Array of numbers
 * @param percentile - Percentile to calculate (0-100)
 * @returns Value at given percentile
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

/**
 * Calculate quartiles (Q1, Q2/median, Q3)
 *
 * @param values - Array of numbers
 * @returns Object with Q1, Q2, Q3
 */
export function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  return {
    q1: calculatePercentile(values, 25),
    q2: calculatePercentile(values, 50),
    q3: calculatePercentile(values, 75),
  };
}

// ============================================================================
// COMPREHENSIVE DESCRIPTIVE STATS
// ============================================================================

/**
 * Calculate all descriptive statistics for an array
 *
 * @param values - Array of numbers
 * @returns Complete descriptive statistics
 */
export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      count: 0,
    };
  }

  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    mode: calculateMode(values),
    stdDev: calculateStandardDeviation(values),
    variance: calculateVariance(values),
    min: Math.min(...values),
    max: Math.max(...values),
    range: calculateRange(values),
    count: values.length,
  };
}

// ============================================================================
// Z-SCORES & NORMALIZATION
// ============================================================================

/**
 * Calculate z-score for a value
 *
 * Z-score indicates how many standard deviations a value is from the mean.
 *
 * @param value - Value to calculate z-score for
 * @param values - Array of numbers (population)
 * @returns Z-score
 */
export function calculateZScore(value: number, values: number[]): number {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Normalize values to 0-1 range
 *
 * @param values - Array of numbers
 * @returns Normalized array
 */
export function normalizeValues(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return values.map(() => 0.5);
  }

  return values.map((val) => (val - min) / range);
}

/**
 * Standardize values (z-score normalization)
 *
 * @param values - Array of numbers
 * @returns Standardized array (mean=0, sd=1)
 */
export function standardizeValues(values: number[]): number[] {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) {
    return values.map(() => 0);
  }

  return values.map((val) => (val - mean) / stdDev);
}

// ============================================================================
// OUTLIER DETECTION
// ============================================================================

/**
 * Detect outliers using IQR method
 *
 * @param values - Array of numbers
 * @param multiplier - IQR multiplier (default: 1.5)
 * @returns Array of outlier values
 */
export function detectOutliersIQR(values: number[], multiplier = 1.5): number[] {
  if (values.length < 4) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const { q1, q3 } = calculateQuartiles(sorted);
  const iqr = q3 - q1;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  return values.filter((val) => val < lowerBound || val > upperBound);
}

/**
 * Detect outliers using z-score method
 *
 * @param values - Array of numbers
 * @param threshold - Z-score threshold (default: 3)
 * @returns Array of outlier values
 */
export function detectOutliersZScore(values: number[], threshold = 3): number[] {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return [];

  return values.filter((val) => Math.abs((val - mean) / stdDev) > threshold);
}

// ============================================================================
// SUMMARY STATISTICS STRING
// ============================================================================

/**
 * Format descriptive stats as human-readable string
 *
 * @param stats - Descriptive statistics
 * @returns Formatted string
 */
export function formatDescriptiveStats(stats: DescriptiveStats): string {
  return `
Mean: ${stats.mean.toFixed(2)}
Median: ${stats.median.toFixed(2)}
Mode: ${stats.mode.toFixed(2)}
Std Dev: ${stats.stdDev.toFixed(2)}
Variance: ${stats.variance.toFixed(2)}
Min: ${stats.min.toFixed(2)}
Max: ${stats.max.toFixed(2)}
Range: ${stats.range.toFixed(2)}
Count: ${stats.count}
  `.trim();
}
