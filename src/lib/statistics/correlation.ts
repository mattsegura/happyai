/**
 * Correlation and Regression Analysis
 *
 * Statistical functions for analyzing relationships between variables.
 * Implements Pearson correlation, significance testing, and linear regression.
 */

import type { Correlation, RegressionResult } from '../admin/types';

// ============================================================================
// PEARSON CORRELATION
// ============================================================================

/**
 * Calculate Pearson correlation coefficient
 *
 * Measures linear relationship between two variables.
 * Returns value between -1 (perfect negative) and 1 (perfect positive).
 *
 * @param x - First variable array
 * @param y - Second variable array
 * @returns Pearson's r correlation coefficient
 * @throws Error if arrays are empty, different lengths, or have insufficient variance
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0) {
    throw new Error('Arrays must be non-empty');
  }

  if (x.length !== y.length) {
    throw new Error('Arrays must be of equal length');
  }

  const n = x.length;

  if (n < 2) {
    throw new Error('Need at least 2 data points for correlation');
  }

  // Calculate sums
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  // Calculate Pearson's r
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) {
    // No variance in one or both variables
    return 0;
  }

  const r = numerator / denominator;

  // Clamp to [-1, 1] to handle floating point errors
  return Math.max(-1, Math.min(1, r));
}

// ============================================================================
// SIGNIFICANCE TESTING
// ============================================================================

/**
 * Calculate significance (p-value) for correlation coefficient
 *
 * Uses t-distribution approximation for correlation significance.
 * H0: true correlation = 0
 *
 * @param r - Correlation coefficient
 * @param n - Sample size
 * @returns p-value (probability that correlation occurred by chance)
 */
export function calculateSignificance(r: number, n: number): number {
  if (n < 3) {
    return 1; // Not enough data for significance
  }

  if (Math.abs(r) === 1) {
    return 0; // Perfect correlation
  }

  // Calculate t-statistic
  const t = r * Math.sqrt((n - 2) / (1 - r * r));

  // Degrees of freedom
  const df = n - 2;

  // Two-tailed p-value using t-distribution approximation
  return tDistributionPValue(Math.abs(t), df);
}

/**
 * Approximate p-value from t-distribution
 *
 * Uses polynomial approximation for speed.
 * Accurate for df > 30; reasonable approximation for df >= 10.
 *
 * @param t - t-statistic (absolute value)
 * @param df - Degrees of freedom
 * @returns Two-tailed p-value
 */
function tDistributionPValue(t: number, df: number): number {
  // For large df, use normal approximation
  if (df > 100) {
    return 2 * (1 - normalCDF(t));
  }

  // For small df, use t-distribution approximation
  // This is a simplified approximation - production code might use a library
  const x = df / (df + t * t);
  const p = 0.5 * betaIncomplete(df / 2, 0.5, x);

  return 2 * Math.min(p, 1 - p);
}

/**
 * Cumulative distribution function for standard normal distribution
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - p : p;
}

/**
 * Incomplete beta function (simplified approximation)
 */
function betaIncomplete(a: number, b: number, x: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;

  // Use continued fraction expansion
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;

  const f = continuedFraction(a, b, x);
  return front * f;
}

/**
 * Log gamma function approximation
 */
function logGamma(x: number): number {
  const coef = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);

  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    ser += coef[j] / ++y;
  }

  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Continued fraction for incomplete beta
 */
function continuedFraction(a: number, b: number, x: number): number {
  const maxIterations = 100;
  const epsilon = 3e-7;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < epsilon) d = epsilon;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;

    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;

    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;

    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;

    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < epsilon) break;
  }

  return h;
}

/**
 * Determine significance level based on p-value
 *
 * @param pValue - P-value from significance test
 * @returns Significance level
 */
export function getSignificanceLevel(pValue: number): 'high' | 'medium' | 'low' | 'none' {
  if (pValue < 0.001) return 'high';
  if (pValue < 0.01) return 'high';
  if (pValue < 0.05) return 'medium';
  if (pValue < 0.1) return 'low';
  return 'none';
}

/**
 * Get description for correlation strength
 *
 * @param r - Correlation coefficient
 * @returns Description of correlation strength
 */
export function getCorrelationDescription(r: number): string {
  const abs = Math.abs(r);

  if (abs >= 0.9) return 'very strong';
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.5) return 'moderate';
  if (abs >= 0.3) return 'weak';
  return 'very weak';
}

/**
 * Calculate correlation with full metadata
 *
 * @param x - First variable array
 * @param y - Second variable array
 * @param xLabel - Label for x variable (optional)
 * @param yLabel - Label for y variable (optional)
 * @returns Correlation object with coefficient, p-value, and metadata
 */
export function calculateCorrelation(
  x: number[],
  y: number[],
  xLabel?: string,
  yLabel?: string
): Correlation {
  const r = calculatePearsonCorrelation(x, y);
  const n = x.length;
  const pValue = calculateSignificance(r, n);
  const significance = getSignificanceLevel(pValue);

  const direction = r > 0 ? 'positive' : 'negative';
  const strength = getCorrelationDescription(r);

  const description = `${strength} ${direction} correlation (r = ${r.toFixed(3)}, p = ${pValue.toFixed(4)}, n = ${n})`;

  return {
    r,
    pValue,
    significance,
    n,
    description,
  };
}

// ============================================================================
// LINEAR REGRESSION
// ============================================================================

/**
 * Calculate simple linear regression
 *
 * Fits a line: y = slope * x + intercept
 *
 * @param x - Independent variable array
 * @param y - Dependent variable array
 * @returns Regression results with slope, intercept, R², and predictions
 */
export function calculateLinearRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length) {
    throw new Error('Arrays must be of equal length');
  }

  if (x.length < 2) {
    throw new Error('Need at least 2 data points for regression');
  }

  const n = x.length;

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += (x[i] - meanX) * (x[i] - meanX);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R² (coefficient of determination)
  const predictions = x.map((xi) => slope * xi + intercept);
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  // Calculate p-value for slope
  const r = Math.sqrt(Math.abs(rSquared)) * (slope > 0 ? 1 : -1);
  const pValue = calculateSignificance(r, n);

  return {
    slope,
    intercept,
    rSquared,
    pValue,
    predictions,
  };
}

/**
 * Calculate correlation matrix for multiple variables
 *
 * @param data - Object with variable names as keys and arrays as values
 * @returns Correlation matrix with variable names
 */
export function calculateCorrelationMatrix(data: Record<string, number[]>): {
  variables: string[];
  matrix: number[][];
  pValues: number[][];
} {
  const variables = Object.keys(data);
  const n = variables.length;
  const matrix: number[][] = [];
  const pValues: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    pValues[i] = [];

    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        pValues[i][j] = 0;
      } else {
        const x = data[variables[i]];
        const y = data[variables[j]];

        try {
          const r = calculatePearsonCorrelation(x, y);
          const p = calculateSignificance(r, x.length);
          matrix[i][j] = r;
          pValues[i][j] = p;
        } catch {
          matrix[i][j] = 0;
          pValues[i][j] = 1;
        }
      }
    }
  }

  return { variables, matrix, pValues };
}
