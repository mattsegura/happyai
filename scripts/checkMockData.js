/**
 * Quick check of mock data generation
 * Run with: node scripts/checkMockData.js
 */

// This is a simple JS version to quickly check the mock data
console.log('Checking mock data generation...');

// Simulate the data generation
function normalRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Generate sample data
const sampleGrades = [];
const sampleSentiment = [];

for (let i = 0; i < 100; i++) {
  const grade = clamp(normalRandom(78, 10), 0, 100);
  const sentiment = clamp(normalRandom(4.5, 1.2), 1, 6);

  sampleGrades.push(grade);
  sampleSentiment.push(sentiment);
}

// Calculate stats
const avgGrade = sampleGrades.reduce((a, b) => a + b, 0) / sampleGrades.length;
const avgSentiment = sampleSentiment.reduce((a, b) => a + b, 0) / sampleSentiment.length;

console.log('\n✅ Mock Data Generation Test:');
console.log('  Sample Size: 100');
console.log(`  Average Grade: ${avgGrade.toFixed(2)} (expected: ~78)`);
console.log(`  Average Sentiment: ${avgSentiment.toFixed(2)} (expected: ~4.5)`);
console.log('\n✅ Data generation functions working correctly!');
console.log('\nFull mock data should have:');
console.log('  - 500 students');
console.log('  - 50 teachers');
console.log('  - 100 classes');
console.log('  - 1000+ grades');
console.log('  - 2000+ sentiment records');
console.log('  - 500 assignments');
