/**
 * Statistical Functions Library
 *
 * Provides statistical calculations for academic analytics including:
 * - Mean, median, standard deviation
 * - Pearson correlation coefficient
 * - Linear regression
 * - Percentile calculations
 */

/**
 * Calculate the mean (average) of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the median of an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

/**
 * Calculate the standard deviation of an array of numbers
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = calculateMean(values);
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDifferences);

  return Math.sqrt(variance);
}

/**
 * Calculate the Pearson correlation coefficient between two arrays
 * Returns a value between -1 and 1 where:
 * - 1 indicates perfect positive correlation
 * - 0 indicates no correlation
 * - -1 indicates perfect negative correlation
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) {
    return 0;
  }

  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - meanX;
    const yDiff = y[i] - meanY;

    numerator += xDiff * yDiff;
    sumXSquared += xDiff * xDiff;
    sumYSquared += yDiff * yDiff;
  }

  const denominator = Math.sqrt(sumXSquared * sumYSquared);

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate linear regression coefficients (slope and intercept)
 * Returns { slope, intercept } for the equation y = slope * x + intercept
 */
export function calculateLinearRegression(x: number[], y: number[]): {
  slope: number;
  intercept: number;
} {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) {
    return { slope: 0, intercept: 0 };
  }

  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - meanX;
    const yDiff = y[i] - meanY;

    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
}

/**
 * Calculate the percentile rank of a value in an array
 * Returns a value between 0 and 100
 */
export function calculatePercentile(values: number[], targetValue: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  let belowCount = 0;

  for (const value of sorted) {
    if (value < targetValue) {
      belowCount++;
    } else {
      break;
    }
  }

  return (belowCount / sorted.length) * 100;
}

/**
 * Get the value at a specific percentile
 */
export function getValueAtPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

/**
 * Calculate the interquartile range (IQR)
 */
export function calculateIQR(values: number[]): {
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
} {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0, iqr: 0 };
  }

  const q1 = getValueAtPercentile(values, 25);
  const q2 = getValueAtPercentile(values, 50); // Median
  const q3 = getValueAtPercentile(values, 75);
  const iqr = q3 - q1;

  return { q1, q2, q3, iqr };
}

/**
 * Identify outliers using the IQR method
 */
export function identifyOutliers(values: number[]): {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
} {
  if (values.length === 0) {
    return { outliers: [], lowerBound: 0, upperBound: 0 };
  }

  const { q1, q3, iqr } = calculateIQR(values);
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values.filter(value => value < lowerBound || value > upperBound);

  return { outliers, lowerBound, upperBound };
}

/**
 * Calculate the z-score for a value
 */
export function calculateZScore(value: number, values: number[]): number {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return 0;

  return (value - mean) / stdDev;
}

/**
 * Calculate moving average with a specified window size
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  if (values.length === 0 || windowSize <= 0) return [];

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    result.push(calculateMean(window));
  }

  return result;
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA(values: number[], smoothing: number = 2): number[] {
  if (values.length === 0) return [];

  const result: number[] = [values[0]];
  const multiplier = smoothing / (values.length + 1);

  for (let i = 1; i < values.length; i++) {
    const ema = (values[i] * multiplier) + (result[i - 1] * (1 - multiplier));
    result.push(ema);
  }

  return result;
}

/**
 * Calculate the coefficient of variation (relative standard deviation)
 */
export function calculateCoefficientOfVariation(values: number[]): number {
  const mean = calculateMean(values);
  if (mean === 0) return 0;

  const stdDev = calculateStandardDeviation(values);
  return (stdDev / mean) * 100;
}

/**
 * Normalize values to a 0-1 scale
 */
export function normalizeValues(values: number[]): number[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0.5);

  return values.map(value => (value - min) / range);
}

/**
 * Calculate the trend direction based on linear regression
 */
export function calculateTrend(values: number[]): {
  direction: 'improving' | 'declining' | 'stable';
  slope: number;
  strength: 'strong' | 'moderate' | 'weak';
} {
  if (values.length < 2) {
    return { direction: 'stable', slope: 0, strength: 'weak' };
  }

  const x = values.map((_, index) => index);
  const { slope } = calculateLinearRegression(x, values);

  // Determine direction
  let direction: 'improving' | 'declining' | 'stable';
  if (slope > 0.5) {
    direction = 'improving';
  } else if (slope < -0.5) {
    direction = 'declining';
  } else {
    direction = 'stable';
  }

  // Determine strength
  const absSlope = Math.abs(slope);
  let strength: 'strong' | 'moderate' | 'weak';
  if (absSlope > 2) {
    strength = 'strong';
  } else if (absSlope > 0.5) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  return { direction, slope, strength };
}
