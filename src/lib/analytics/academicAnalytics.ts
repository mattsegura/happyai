/**
 * Academic Analytics Data Layer
 *
 * Provides calculation functions for the 5 academic analytics features:
 * 1. Class Average Grade
 * 2. Grade Distribution (A-F)
 * 3. Missing/Late Submissions Count
 * 4. Class Participation Report
 * 5. Mood-to-Performance Correlation
 *
 * Supports both real Canvas API data and mock data mode via VITE_USE_ANALYTICS_MOCK env variable.
 */

import { canvasServiceEnhanced } from '../canvas/canvasServiceEnhanced';
import {
  transformCanvasSubmissionToGrade,
  calculateCourseGrade,
  percentageToLetterGrade,
  type HapiGrade,
} from '../canvas/canvasTransformers';
import {
  calculateMean,
  calculatePearsonCorrelation,
  calculateLinearRegression,
  calculateTrend,
} from './statistics';
import { supabase } from '../supabase';
import {
  mockClassAverageGrades,
  mockGradeDistributions,
  mockSubmissionStats,
  mockParticipationRates,
  mockMoodPerformanceData,
  mockClasses,
} from './mockAnalyticsData';

// Check if we should use mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_ANALYTICS_MOCK === 'true';

console.log('[Analytics] Mode:', USE_MOCK_DATA ? 'MOCK DATA' : 'REAL DATA');

// ============================================================================
// TYPES
// ============================================================================

export type GradeTrend = 'improving' | 'declining' | 'stable';

export type ClassAverageGrade = {
  classId: string;
  className: string;
  averagePercentage: number;
  letterGrade: string;
  trend: GradeTrend;
  studentCount: number;
  lastUpdated: string;
};

export type GradeDistribution = {
  classId: string;
  className: string;
  distribution: {
    A: number; // 90-100%
    B: number; // 80-89%
    C: number; // 70-79%
    D: number; // 60-69%
    F: number; // <60%
  };
  total: number;
  healthStatus: 'healthy' | 'moderate' | 'concern';
  lastUpdated: string;
};

export type SubmissionStats = {
  classId: string;
  className: string;
  missing: {
    count: number;
    percentage: number;
    students: Array<{ id: string; name: string; count: number }>;
  };
  late: {
    count: number;
    percentage: number;
    students: Array<{ id: string; name: string; count: number }>;
  };
  total: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
};

export type ParticipationRate = {
  classId: string;
  className: string;
  byType: {
    homework: number;
    quizzes: number;
    projects: number;
    exams: number;
    discussions: number;
    classPulses: number;
    morningPulses: number;
  };
  overall: number;
  studentCount: number;
  lastUpdated: string;
};

export type MoodPerformanceData = {
  classId: string;
  className: string;
  correlation: number; // Pearson r value
  correlationStrength: 'strong' | 'moderate' | 'weak' | 'none';
  scatterData: Array<{
    studentId: string;
    studentName: string;
    sentiment: number; // 1-6 scale
    grade: number; // percentage
  }>;
  regressionLine: {
    slope: number;
    intercept: number;
  };
  insights: string[];
  timeframe: 'month' | 'semester';
  lastUpdated: string;
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const CACHE_DURATION = {
  GRADES: 15 * 60 * 1000, // 15 minutes
  SUBMISSIONS: 24 * 60 * 60 * 1000, // 24 hours
  PARTICIPATION: 24 * 60 * 60 * 1000, // 24 hours
  MOOD_CORRELATION: 24 * 60 * 60 * 1000, // 24 hours
};

async function getCachedOrCalculate<T>(
  userId: string,
  classId: string,
  metricType: string,
  calculateFn: () => Promise<T>,
  cacheDuration: number
): Promise<T> {
  // Try to get from cache
  const { data: cached } = await supabase
    .from('analytics_cache')
    .select('*')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .eq('metric_type', metricType)
    .single();

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.calculated_at).getTime();
    if (cacheAge < cacheDuration) {
      console.log(`[Analytics] Cache hit for ${metricType}`);
      return cached.metric_data as T;
    }
  }

  // Calculate fresh data
  console.log(`[Analytics] Cache miss for ${metricType}, calculating...`);
  const freshData = await calculateFn();

  // Store in cache
  const expiresAt = new Date(Date.now() + cacheDuration).toISOString();
  await supabase.from('analytics_cache').upsert({
    user_id: userId,
    class_id: classId,
    metric_type: metricType,
    metric_data: freshData,
    calculated_at: new Date().toISOString(),
    expires_at: expiresAt,
  });

  return freshData;
}

// ============================================================================
// FEATURE 1: CLASS AVERAGE GRADE
// ============================================================================

export async function calculateClassAverageGrade(
  classId: string,
  userId: string
): Promise<ClassAverageGrade> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('[Analytics] Returning mock class average grade for:', classId);
    return mockClassAverageGrades[classId] || mockClassAverageGrades['class-1'];
  }

  return getCachedOrCalculate(
    userId,
    classId,
    'class_average_grade',
    async () => {
      // Get course and assignments
      const course = await canvasServiceEnhanced.getCourse(classId);
      const assignments = await canvasServiceEnhanced.getAssignments(classId);

      // Get all student submissions for all assignments
      const allGrades: HapiGrade[] = [];

      for (const assignment of assignments) {
        const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
          include: ['user'],
        });

        for (const submission of submissions) {
          if (submission.user_id) {
            const grade = transformCanvasSubmissionToGrade(submission, assignment, course);
            allGrades.push(grade);
          }
        }
      }

      // Calculate average per student, then average across students
      const studentGrades: Record<string, HapiGrade[]> = {};

      for (const grade of allGrades) {
        const key = `student-${grade.class_id}`; // Would use student ID if available
        if (!studentGrades[key]) {
          studentGrades[key] = [];
        }
        studentGrades[key].push(grade);
      }

      // Calculate each student's course grade
      const studentAverages: number[] = [];
      for (const grades of Object.values(studentGrades)) {
        const courseGrade = calculateCourseGrade(grades);
        if (courseGrade.percentage !== null) {
          studentAverages.push(courseGrade.percentage);
        }
      }

      const averagePercentage = calculateMean(studentAverages);
      const letterGrade = percentageToLetterGrade(averagePercentage);
      const trend = calculateTrend(studentAverages).direction;

      return {
        classId,
        className: course.name,
        averagePercentage,
        letterGrade,
        trend,
        studentCount: studentAverages.length,
        lastUpdated: new Date().toISOString(),
      };
    },
    CACHE_DURATION.GRADES
  );
}

// ============================================================================
// FEATURE 2: GRADE DISTRIBUTION
// ============================================================================

export async function calculateGradeDistribution(
  classId: string,
  userId: string
): Promise<GradeDistribution> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('[Analytics] Returning mock grade distribution for:', classId);
    return mockGradeDistributions[classId] || mockGradeDistributions['class-1'];
  }

  return getCachedOrCalculate(
    userId,
    classId,
    'grade_distribution',
    async () => {
      // Get course and assignments
      const course = await canvasServiceEnhanced.getCourse(classId);
      const assignments = await canvasServiceEnhanced.getAssignments(classId);

      // Get all student submissions
      const studentGrades: Record<string, HapiGrade[]> = {};

      for (const assignment of assignments) {
        const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
          include: ['user'],
        });

        for (const submission of submissions) {
          if (submission.user_id) {
            const grade = transformCanvasSubmissionToGrade(submission, assignment, course);
            const key = `student-${submission.user_id}`;
            if (!studentGrades[key]) {
              studentGrades[key] = [];
            }
            studentGrades[key].push(grade);
          }
        }
      }

      // Calculate each student's course grade and categorize
      const distribution = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
      };

      for (const grades of Object.values(studentGrades)) {
        const courseGrade = calculateCourseGrade(grades);
        if (courseGrade.percentage !== null) {
          const pct = courseGrade.percentage;
          if (pct >= 90) distribution.A++;
          else if (pct >= 80) distribution.B++;
          else if (pct >= 70) distribution.C++;
          else if (pct >= 60) distribution.D++;
          else distribution.F++;
        }
      }

      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      const healthyPercentage = total > 0 ? ((distribution.A + distribution.B) / total) * 100 : 0;

      let healthStatus: 'healthy' | 'moderate' | 'concern';
      if (healthyPercentage >= 60) healthStatus = 'healthy';
      else if (healthyPercentage >= 40) healthStatus = 'moderate';
      else healthStatus = 'concern';

      return {
        classId,
        className: course.name,
        distribution,
        total,
        healthStatus,
        lastUpdated: new Date().toISOString(),
      };
    },
    CACHE_DURATION.GRADES
  );
}

// ============================================================================
// FEATURE 3: MISSING/LATE SUBMISSIONS
// ============================================================================

export async function getMissingSubmissions(
  classId: string,
  userId: string
): Promise<SubmissionStats> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('[Analytics] Returning mock submission stats for:', classId);
    return mockSubmissionStats[classId] || mockSubmissionStats['class-1'];
  }

  return getCachedOrCalculate(
    userId,
    classId,
    'submission_stats',
    async () => {
      // Get course and assignments
      const course = await canvasServiceEnhanced.getCourse(classId);
      const assignments = await canvasServiceEnhanced.getAssignments(classId);

      let totalMissing = 0;
      let totalLate = 0;
      let totalSubmissions = 0;

      const studentMissing: Record<string, { name: string; count: number }> = {};
      const studentLate: Record<string, { name: string; count: number }> = {};

      for (const assignment of assignments) {
        const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
          include: ['user'],
        });

        for (const submission of submissions) {
          totalSubmissions++;

          if (submission.missing) {
            totalMissing++;
            const userId = submission.user_id || 'unknown';
            if (!studentMissing[userId]) {
              studentMissing[userId] = {
                name: submission.user?.name || 'Unknown',
                count: 0,
              };
            }
            studentMissing[userId].count++;
          }

          if (submission.late) {
            totalLate++;
            const userId = submission.user_id || 'unknown';
            if (!studentLate[userId]) {
              studentLate[userId] = {
                name: submission.user?.name || 'Unknown',
                count: 0,
              };
            }
            studentLate[userId].count++;
          }
        }
      }

      const missingPercentage = totalSubmissions > 0 ? (totalMissing / totalSubmissions) * 100 : 0;
      const latePercentage = totalSubmissions > 0 ? (totalLate / totalSubmissions) * 100 : 0;

      // Sort students by count
      const missingStudents = Object.entries(studentMissing)
        .map(([id, data]) => ({ id, name: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20

      const lateStudents = Object.entries(studentLate)
        .map(([id, data]) => ({ id, name: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return {
        classId,
        className: course.name,
        missing: {
          count: totalMissing,
          percentage: missingPercentage,
          students: missingStudents,
        },
        late: {
          count: totalLate,
          percentage: latePercentage,
          students: lateStudents,
        },
        total: totalSubmissions,
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
      };
    },
    CACHE_DURATION.SUBMISSIONS
  );
}

export async function getLateSubmissions(
  classId: string,
  userId: string
): Promise<SubmissionStats> {
  // Same as getMissingSubmissions - returns both in one call
  return getMissingSubmissions(classId, userId);
}

// ============================================================================
// FEATURE 4: CLASS PARTICIPATION REPORT
// ============================================================================

export async function calculateParticipationRate(
  classId: string,
  userId: string
): Promise<ParticipationRate> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('[Analytics] Returning mock participation rate for:', classId);
    return mockParticipationRates[classId] || mockParticipationRates['class-1'];
  }

  return getCachedOrCalculate(
    userId,
    classId,
    'participation_rate',
    async () => {
      // Get course and assignments
      const course = await canvasServiceEnhanced.getCourse(classId);
      const assignments = await canvasServiceEnhanced.getAssignments(classId);

      const participationByType: Record<string, { submitted: number; total: number }> = {
        homework: { submitted: 0, total: 0 },
        quizzes: { submitted: 0, total: 0 },
        projects: { submitted: 0, total: 0 },
        exams: { submitted: 0, total: 0 },
        discussions: { submitted: 0, total: 0 },
      };

      const studentSet = new Set<string>();

      for (const assignment of assignments) {
        // Determine assignment type from name
        const name = assignment.name.toLowerCase();
        let type = 'homework';
        if (name.includes('quiz')) type = 'quizzes';
        else if (name.includes('project')) type = 'projects';
        else if (name.includes('exam') || name.includes('test')) type = 'exams';
        else if (name.includes('discussion')) type = 'discussions';

        const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
          include: ['user'],
        });

        for (const submission of submissions) {
          if (submission.user_id) {
            studentSet.add(String(submission.user_id));
            participationByType[type].total++;
            if (submission.submitted_at && !submission.missing) {
              participationByType[type].submitted++;
            }
          }
        }
      }

      // Get class pulse participation
      const { data: classPulses } = await supabase
        .from('class_pulse_responses')
        .select('*, class_pulses!inner(class_id)')
        .eq('class_pulses.class_id', classId);

      const classPulseRate = classPulses ? (classPulses.length / studentSet.size) * 100 : 0;

      // Get morning pulse participation
      const { data: morningPulses } = await supabase
        .from('pulse_checks')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const morningPulseRate = morningPulses ? (morningPulses.length / (studentSet.size * 30)) * 100 : 0;

      // Calculate rates
      const calculateRate = (data: { submitted: number; total: number }) => {
        return data.total > 0 ? (data.submitted / data.total) * 100 : 0;
      };

      const byType = {
        homework: calculateRate(participationByType.homework),
        quizzes: calculateRate(participationByType.quizzes),
        projects: calculateRate(participationByType.projects),
        exams: calculateRate(participationByType.exams),
        discussions: calculateRate(participationByType.discussions),
        classPulses: classPulseRate,
        morningPulses: morningPulseRate,
      };

      const overall = calculateMean(Object.values(byType));

      return {
        classId,
        className: course.name,
        byType,
        overall,
        studentCount: studentSet.size,
        lastUpdated: new Date().toISOString(),
      };
    },
    CACHE_DURATION.PARTICIPATION
  );
}

// ============================================================================
// FEATURE 5: MOOD-TO-PERFORMANCE CORRELATION
// ============================================================================

export async function calculateMoodPerformanceCorrelation(
  classId: string,
  userId: string,
  timeframe: 'month' | 'semester' = 'month'
): Promise<MoodPerformanceData> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('[Analytics] Returning mock mood-performance correlation for:', classId);
    return mockMoodPerformanceData[classId] || mockMoodPerformanceData['class-1'];
  }

  return getCachedOrCalculate(
    userId,
    classId,
    `mood_correlation_${timeframe}`,
    async () => {
      // Get course
      const course = await canvasServiceEnhanced.getCourse(classId);

      // Get time range
      const now = Date.now();
      const startDate =
        timeframe === 'month'
          ? new Date(now - 30 * 24 * 60 * 60 * 1000)
          : new Date(now - 120 * 24 * 60 * 60 * 1000);

      // Get student grades
      const assignments = await canvasServiceEnhanced.getAssignments(classId);
      const studentGrades: Record<string, { name: string; grades: HapiGrade[] }> = {};

      for (const assignment of assignments) {
        const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
          include: ['user'],
        });

        for (const submission of submissions) {
          if (submission.user_id) {
            const userId = submission.user_id;
            if (!studentGrades[userId]) {
              studentGrades[userId] = {
                name: submission.user?.name || 'Unknown',
                grades: [],
              };
            }

            const grade = transformCanvasSubmissionToGrade(submission, assignment, course);
            studentGrades[userId].grades.push(grade);
          }
        }
      }

      // Get student sentiment data
      const { data: pulseChecks } = await supabase
        .from('pulse_checks')
        .select('user_id, sentiment_value, created_at')
        .gte('created_at', startDate.toISOString());

      // Map sentiment tiers (1-6 scale)
      const emotionToTier: Record<string, number> = {
        happy: 6,
        excited: 6,
        inspired: 6,
        hopeful: 5,
        proud: 5,
        peaceful: 4,
        relieved: 4,
        content: 4,
        tired: 3,
        bored: 3,
        careless: 3,
        frustrated: 2,
        worried: 2,
        nervous: 2,
        scared: 1,
        sad: 1,
        lonely: 1,
      };

      const studentSentiment: Record<string, number[]> = {};
      pulseChecks?.forEach((check: any) => {
        const tier = emotionToTier[check.sentiment_value] || 3;
        if (!studentSentiment[check.user_id]) {
          studentSentiment[check.user_id] = [];
        }
        studentSentiment[check.user_id].push(tier);
      });

      // Create scatter data
      const scatterData: Array<{
        studentId: string;
        studentName: string;
        sentiment: number;
        grade: number;
      }> = [];

      const sentimentValues: number[] = [];
      const gradeValues: number[] = [];

      for (const [studentId, data] of Object.entries(studentGrades)) {
        const courseGrade = calculateCourseGrade(data.grades);
        const avgSentiment = studentSentiment[studentId]
          ? calculateMean(studentSentiment[studentId])
          : null;

        if (courseGrade.percentage !== null && avgSentiment !== null) {
          scatterData.push({
            studentId,
            studentName: data.name,
            sentiment: avgSentiment,
            grade: courseGrade.percentage,
          });

          sentimentValues.push(avgSentiment);
          gradeValues.push(courseGrade.percentage);
        }
      }

      // Calculate correlation
      const correlation = calculatePearsonCorrelation(sentimentValues, gradeValues);
      const regressionLine = calculateLinearRegression(sentimentValues, gradeValues);

      // Determine correlation strength
      const absCorrelation = Math.abs(correlation);
      let correlationStrength: 'strong' | 'moderate' | 'weak' | 'none';
      if (absCorrelation > 0.7) correlationStrength = 'strong';
      else if (absCorrelation > 0.4) correlationStrength = 'moderate';
      else if (absCorrelation > 0.2) correlationStrength = 'weak';
      else correlationStrength = 'none';

      // Generate insights
      const insights: string[] = [];
      if (correlation > 0.4) {
        const avgGradeDiff =
          (regressionLine.slope * 2).toFixed(1); // Grade difference per 2-tier sentiment change
        insights.push(
          `Students with higher sentiment (Tier 5-6) average ${avgGradeDiff}% higher grades than those with lower sentiment (Tier 1-2)`
        );
      }

      if (correlation > 0.7) {
        insights.push('Strong positive correlation suggests mood significantly impacts performance');
      } else if (correlation < -0.4) {
        insights.push('Negative correlation detected - investigate students with high grades but low mood');
      }

      return {
        classId,
        className: course.name,
        correlation,
        correlationStrength,
        scatterData,
        regressionLine,
        insights,
        timeframe,
        lastUpdated: new Date().toISOString(),
      };
    },
    CACHE_DURATION.MOOD_CORRELATION
  );
}

// ============================================================================
// COMBINED ANALYTICS
// ============================================================================

export async function getAllClassAnalytics(classId: string, userId: string) {
  const [averageGrade, distribution, submissions, participation, moodCorrelation] =
    await Promise.all([
      calculateClassAverageGrade(classId, userId),
      calculateGradeDistribution(classId, userId),
      getMissingSubmissions(classId, userId),
      calculateParticipationRate(classId, userId),
      calculateMoodPerformanceCorrelation(classId, userId),
    ]);

  return {
    averageGrade,
    distribution,
    submissions,
    participation,
    moodCorrelation,
  };
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

export async function invalidateAnalyticsCache(
  userId: string,
  classId?: string,
  metricType?: string
) {
  let query = supabase.from('analytics_cache').delete().eq('user_id', userId);

  if (classId) {
    query = query.eq('class_id', classId);
  }

  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  await query;
  console.log('[Analytics] Cache invalidated');
}
