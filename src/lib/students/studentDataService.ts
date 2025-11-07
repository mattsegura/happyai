/**
 * Student Data Aggregation Service
 *
 * Provides comprehensive student data for individual student reports.
 * Aggregates data from:
 * - Canvas API (academic performance)
 * - Supabase pulse_checks (emotional wellbeing)
 * - class_pulse_responses (engagement)
 * - hapi_moments (peer recognition)
 * - office_hours_queue (meetings)
 * - teacher_student_notes (teacher observations)
 *
 * Phase 3: Student Search & Reports
 */

import { supabase } from '../supabase';
import { canvasServiceEnhanced } from '../canvas/canvasServiceEnhanced';
import {
  transformCanvasSubmissionToGrade,
  calculateCourseGrade,
  type HapiGrade,
} from '../canvas/canvasTransformers';
import { calculateMean, calculateStandardDeviation, calculateTrend, calculatePearsonCorrelation } from '../analytics/statistics';
import { MOCK_STUDENT_IDS, MOCK_CLASS_IDS, isMockStudentId, isMockClassId } from '../mockStudentIds';
import { CANVAS_CONFIG } from '../canvas/canvasConfig';

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high';

export type StudentAcademicData = {
  currentGrade: number | null;
  letterGrade: string;
  trend: 'improving' | 'declining' | 'stable';
  missingAssignments: number;
  lateAssignments: number;
  participationRate: number;
  assignmentBreakdown: {
    homework: { average: number; count: number };
    quizzes: { average: number; count: number };
    projects: { average: number; count: number };
    exams: { average: number; count: number };
  };
  strengths: string[];
  weaknesses: string[];
  lastUpdated: string;
};

export type StudentWellbeingData = {
  currentSentiment: number; // 1-6 scale
  currentEmotion: string;
  lastCheckDate: string | null;
  averageSentiment30Days: number;
  frequentEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  moodTrend: Array<{ date: string; sentiment: number; emotion: string }>;
  stabilityScore: number; // Standard deviation, lower is more stable
  careAlerts: Array<{
    type: 'emotional' | 'academic' | 'combined';
    severity: 'critical' | 'high' | 'medium';
    reason: string;
    daysActive: number;
  }>;
};

export type StudentEngagementData = {
  morningPulseRate: number; // Percentage
  classPulseRate: number; // Percentage
  discussionParticipation: number;
  hapiMomentsSent: number;
  hapiMomentsReceived: number;
  lastCanvasLogin: string | null;
  overallEngagement: number; // 0-100 score
};

export type StudentCorrelationData = {
  correlation: number; // Pearson r
  correlationStrength: 'strong' | 'moderate' | 'weak' | 'none';
  insight: string;
  scatterData: Array<{ date: string; sentiment: number; grade: number }>;
};

export type TeacherInteraction = {
  id: string;
  type: 'hapi_moment' | 'meeting' | 'note' | 'intervention';
  date: string;
  content: string;
  noteType?: string;
  isFlagged?: boolean;
};

export type ComparisonToClass = {
  gradePercentile: number;
  sentimentPercentile: number;
  engagementPercentile: number;
  classAverage: {
    grade: number;
    sentiment: number;
    engagement: number;
  };
  studentValues: {
    grade: number;
    sentiment: number;
    engagement: number;
  };
};

export type ComprehensiveStudentData = {
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  classInfo: {
    classId: string;
    className: string;
  };
  academic: StudentAcademicData;
  wellbeing: StudentWellbeingData;
  engagement: StudentEngagementData;
  correlation: StudentCorrelationData;
  interactions: TeacherInteraction[];
  comparison: ComparisonToClass;
  riskLevel: RiskLevel;
  generatedAt: string;
};

// ============================================================================
// MOCK DATA HELPER
// ============================================================================

function getMockComprehensiveStudentData(studentId: string, classId: string): ComprehensiveStudentData {
  // Get student name from ID
  const studentNames: Record<string, string> = {
    [MOCK_STUDENT_IDS.ALEX_JOHNSON]: 'Alex Johnson',
    [MOCK_STUDENT_IDS.SARAH_MARTINEZ]: 'Sarah Martinez',
    [MOCK_STUDENT_IDS.MICHAEL_CHEN]: 'Michael Chen',
    [MOCK_STUDENT_IDS.EMILY_RODRIGUEZ]: 'Emily Rodriguez',
    [MOCK_STUDENT_IDS.DAVID_KIM]: 'David Kim',
    [MOCK_STUDENT_IDS.JESSICA_THOMPSON]: 'Jessica Thompson',
    [MOCK_STUDENT_IDS.MARCUS_WILLIAMS]: 'Marcus Williams',
    [MOCK_STUDENT_IDS.SOPHIA_LEE]: 'Sophia Lee',
  };

  const studentName = studentNames[studentId] || 'Mock Student';
  const classNames: Record<string, string> = {
    [MOCK_CLASS_IDS.PSYCHOLOGY]: 'Introduction to Psychology',
    [MOCK_CLASS_IDS.ENGLISH]: 'English Literature',
    [MOCK_CLASS_IDS.HISTORY]: 'World History',
  };
  const className = classNames[classId] || 'Mock Class';

  // Generate different data based on student ID
  const isAtRisk = studentId === MOCK_STUDENT_IDS.MICHAEL_CHEN || studentId === MOCK_STUDENT_IDS.SOPHIA_LEE;
  const currentGrade = isAtRisk ? 68 : 85 + Math.random() * 10;

  return {
    student: {
      id: studentId,
      name: studentName,
      email: `${studentName.toLowerCase().replace(' ', '.')}@school.edu`,
      avatarUrl: null,
    },
    classInfo: {
      classId: classId,
      className: className,
    },
    academic: {
      currentGrade,
      letterGrade: currentGrade >= 90 ? 'A' : currentGrade >= 80 ? 'B' : currentGrade >= 70 ? 'C' : currentGrade >= 60 ? 'D' : 'F',
      trend: isAtRisk ? 'declining' : 'improving',
      missingAssignments: isAtRisk ? 3 : 0,
      lateAssignments: isAtRisk ? 2 : 0,
      participationRate: isAtRisk ? 45 : 85,
      assignmentBreakdown: {
        homework: { average: isAtRisk ? 65 : 88, count: 8 },
        quizzes: { average: isAtRisk ? 70 : 90, count: 4 },
        projects: { average: isAtRisk ? 60 : 85, count: 2 },
        exams: { average: isAtRisk ? 72 : 87, count: 2 },
      },
      strengths: isAtRisk ? ['Exams'] : ['Homework', 'Quizzes'],
      weaknesses: isAtRisk ? ['Projects', 'Participation'] : [],
      lastUpdated: new Date().toISOString(),
    },
    wellbeing: {
      currentSentiment: isAtRisk ? 2 : 5,
      currentEmotion: isAtRisk ? 'stressed' : 'happy',
      lastCheckDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      averageSentiment30Days: isAtRisk ? 2.5 : 4.5,
      frequentEmotions: isAtRisk
        ? [
            { emotion: 'stressed', count: 12, percentage: 40 },
            { emotion: 'anxious', count: 9, percentage: 30 },
            { emotion: 'tired', count: 6, percentage: 20 },
            { emotion: 'frustrated', count: 3, percentage: 10 },
          ]
        : [
            { emotion: 'happy', count: 15, percentage: 50 },
            { emotion: 'hopeful', count: 9, percentage: 30 },
            { emotion: 'calm', count: 4, percentage: 13.3 },
            { emotion: 'excited', count: 2, percentage: 6.7 },
          ],
      moodTrend: Array.from({ length: 30 }, (_, i) => {
        const sentiment = isAtRisk ? 2 + Math.random() * 2 : 4 + Math.random() * 2;
        const emotions = isAtRisk
          ? ['stressed', 'anxious', 'tired', 'frustrated']
          : ['happy', 'hopeful', 'calm', 'excited'];
        return {
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sentiment,
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
        };
      }),
      stabilityScore: isAtRisk ? 1.2 : 0.6,
      careAlerts: isAtRisk
        ? [
            {
              type: 'emotional',
              severity: 'high',
              reason: 'Consistent negative sentiment detected (7 days)',
              daysActive: 7,
            },
          ]
        : [],
    },
    engagement: {
      morningPulseRate: isAtRisk ? 40 : 90,
      classPulseRate: isAtRisk ? 50 : 85,
      discussionParticipation: isAtRisk ? 35 : 75,
      hapiMomentsSent: isAtRisk ? 2 : 12,
      hapiMomentsReceived: isAtRisk ? 1 : 15,
      lastCanvasLogin: new Date(Date.now() - (isAtRisk ? 5 : 0.5) * 24 * 60 * 60 * 1000).toISOString(),
      overallEngagement: isAtRisk ? 45 : 88,
    },
    correlation: {
      correlation: isAtRisk ? 0.65 : 0.45,
      correlationStrength: isAtRisk ? 'moderate' : 'weak',
      insight: isAtRisk
        ? 'Lower mood correlates with declining grades. Consider wellbeing intervention.'
        : 'Mood and performance both stable. Student maintains consistent performance across different emotional states.',
      scatterData: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sentiment: isAtRisk ? 2 + Math.random() : 4 + Math.random(),
        grade: isAtRisk ? 65 + Math.random() * 10 : 80 + Math.random() * 15,
      })),
    },
    interactions: [
      {
        id: 'moment-1',
        type: 'hapi_moment',
        content: 'Great participation in class discussion!',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'note-1',
        type: 'note',
        content: 'Showed improvement in recent assignments',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        noteType: 'academic',
        isFlagged: false,
      },
    ],
    comparison: {
      gradePercentile: isAtRisk ? 25 : 75,
      sentimentPercentile: isAtRisk ? 20 : 80,
      engagementPercentile: isAtRisk ? 30 : 85,
      studentValues: {
        grade: currentGrade,
        sentiment: isAtRisk ? 2 : 5,
        engagement: isAtRisk ? 45 : 85,
      },
      classAverage: {
        grade: 78.5,
        sentiment: 3.8,
        engagement: 72,
      },
    },
    riskLevel: isAtRisk ? 'high' : 'low',
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// MAIN AGGREGATION FUNCTION
// ============================================================================

export async function getStudentComprehensiveData(
  studentId: string,
  classId: string,
  teacherId: string
): Promise<ComprehensiveStudentData> {
  console.log('[StudentDataService] Fetching comprehensive data for student:', studentId, 'in class:', classId);

  // Return mock data when using mock IDs or in mock mode
  if (isMockStudentId(studentId) || isMockClassId(classId) || CANVAS_CONFIG.USE_MOCK_DATA) {
    console.log('[StudentDataService] Using mock mode - returning mock comprehensive student data');
    return getMockComprehensiveStudentData(studentId, classId);
  }

  // Check cache first
  const cached = await getCachedStudentReport(teacherId, studentId, classId);
  if (cached) {
    console.log('[StudentDataService] Returning cached student report');
    return cached;
  }

  // Fetch all data in parallel
  const [student, classInfo, academic, wellbeing, engagement, interactions] = await Promise.all([
    getStudentBasicInfo(studentId),
    getClassInfo(classId),
    getStudentAcademicData(studentId, classId),
    getStudentWellbeingData(studentId, classId),
    getStudentEngagementData(studentId, classId),
    getTeacherInteractions(teacherId, studentId, classId),
  ]);

  // Calculate correlation
  const correlation = await calculateStudentMoodPerformanceCorrelation(studentId, classId);

  // Calculate comparison to class
  const comparison = await calculateComparisonToClass(studentId, classId, academic, wellbeing, engagement);

  // Calculate risk level
  const riskLevel = calculateStudentRiskLevel(academic, wellbeing, engagement);

  const comprehensiveData: ComprehensiveStudentData = {
    student,
    classInfo,
    academic,
    wellbeing,
    engagement,
    correlation,
    interactions,
    comparison,
    riskLevel,
    generatedAt: new Date().toISOString(),
  };

  // Cache the report for 2 hours
  await cacheStudentReport(teacherId, studentId, classId, comprehensiveData, 2 * 60 * 60 * 1000);

  return comprehensiveData;
}

// ============================================================================
// CACHE FUNCTIONS
// ============================================================================

async function getCachedStudentReport(
  teacherId: string,
  studentId: string,
  classId: string
): Promise<ComprehensiveStudentData | null> {
  try {
    const cacheKey = `student_report_${studentId}`;
    const { data, error } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('user_id', teacherId)
      .eq('class_id', classId)
      .eq('metric_type', cacheKey)
      .single();

    if (error || !data) return null;

    const cacheAge = Date.now() - new Date(data.calculated_at).getTime();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    if (cacheAge < maxAge) {
      return data.metric_data as ComprehensiveStudentData;
    }
  } catch (error) {
    console.error('[StudentDataService] Cache retrieval error:', error);
  }
  return null;
}

async function cacheStudentReport(
  teacherId: string,
  studentId: string,
  classId: string,
  data: ComprehensiveStudentData,
  ttl: number
): Promise<void> {
  try {
    const cacheKey = `student_report_${studentId}`;
    const expiresAt = new Date(Date.now() + ttl).toISOString();

    await supabase.from('analytics_cache').upsert({
      user_id: teacherId,
      class_id: classId,
      metric_type: cacheKey,
      metric_data: data as any,
      calculated_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('[StudentDataService] Cache storage error:', error);
  }
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

async function getStudentBasicInfo(studentId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .eq('id', studentId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch student info: ${error?.message}`);
  }

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    avatarUrl: data.avatar_url,
  };
}

async function getClassInfo(classId: string) {
  try {
    const course = await canvasServiceEnhanced.getCourse(classId);
    return {
      classId: String(course.id),
      className: course.name,
    };
  } catch (error) {
    console.error('[StudentDataService] Failed to fetch class info:', error);
    return {
      classId,
      className: 'Unknown Class',
    };
  }
}

async function getStudentAcademicData(studentId: string, classId: string): Promise<StudentAcademicData> {
  try {
    // Get Canvas course and assignments
    const course = await canvasServiceEnhanced.getCourse(classId);
    const assignments = await canvasServiceEnhanced.getAssignments(classId);

    // Get student's submissions
    const studentGrades: HapiGrade[] = [];
    const assignmentsByType: Record<string, HapiGrade[]> = {
      homework: [],
      quizzes: [],
      projects: [],
      exams: [],
    };

    let missingCount = 0;
    let lateCount = 0;

    for (const assignment of assignments) {
      const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
        include: ['user'],
      });

      const studentSubmission = submissions.find((s) => String(s.user_id) === studentId);

      if (studentSubmission) {
        const grade = transformCanvasSubmissionToGrade(studentSubmission, assignment, course);
        studentGrades.push(grade);

        // Count missing/late
        if (studentSubmission.missing) missingCount++;
        if (studentSubmission.late) lateCount++;

        // Categorize by type
        const name = assignment.name.toLowerCase();
        let type = 'homework';
        if (name.includes('quiz')) type = 'quizzes';
        else if (name.includes('project')) type = 'projects';
        else if (name.includes('exam') || name.includes('test')) type = 'exams';

        if (assignmentsByType[type]) {
          assignmentsByType[type].push(grade);
        }
      }
    }

    // Calculate course grade
    const courseGrade = calculateCourseGrade(studentGrades);
    const currentGrade = courseGrade.percentage;
    const letterGrade = courseGrade.letter_grade;

    // Calculate trend
    const gradeValues = studentGrades.filter((g) => g.percentage !== null).map((g) => g.percentage!);
    const trend = calculateTrend(gradeValues).direction;

    // Calculate participation rate
    const participationRate = assignments.length > 0 ? ((assignments.length - missingCount) / assignments.length) * 100 : 0;

    // Calculate breakdown by type
    const assignmentBreakdown = {
      homework: {
        average: calculateMean(assignmentsByType.homework.filter((g) => g.percentage !== null).map((g) => g.percentage!)),
        count: assignmentsByType.homework.length,
      },
      quizzes: {
        average: calculateMean(assignmentsByType.quizzes.filter((g) => g.percentage !== null).map((g) => g.percentage!)),
        count: assignmentsByType.quizzes.length,
      },
      projects: {
        average: calculateMean(assignmentsByType.projects.filter((g) => g.percentage !== null).map((g) => g.percentage!)),
        count: assignmentsByType.projects.length,
      },
      exams: {
        average: calculateMean(assignmentsByType.exams.filter((g) => g.percentage !== null).map((g) => g.percentage!)),
        count: assignmentsByType.exams.length,
      },
    };

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(assignmentBreakdown).forEach(([type, data]) => {
      if (data.count > 0) {
        if (data.average >= 90) strengths.push(`Strong ${type} performance (${data.average.toFixed(1)}%)`);
        else if (data.average < 75) weaknesses.push(`${type} need attention (${data.average.toFixed(1)}%)`);
      }
    });

    return {
      currentGrade,
      letterGrade,
      trend,
      missingAssignments: missingCount,
      lateAssignments: lateCount,
      participationRate,
      assignmentBreakdown,
      strengths,
      weaknesses,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[StudentDataService] Failed to fetch academic data:', error);
    // Return empty data on error
    return {
      currentGrade: null,
      letterGrade: 'N/A',
      trend: 'stable',
      missingAssignments: 0,
      lateAssignments: 0,
      participationRate: 0,
      assignmentBreakdown: {
        homework: { average: 0, count: 0 },
        quizzes: { average: 0, count: 0 },
        projects: { average: 0, count: 0 },
        exams: { average: 0, count: 0 },
      },
      strengths: [],
      weaknesses: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

async function getStudentWellbeingData(studentId: string, _classId: string): Promise<StudentWellbeingData> {
  // Get pulse checks for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('*')
    .eq('user_id', studentId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[StudentDataService] Failed to fetch pulse checks:', error);
  }

  // Emotion to tier mapping
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

  const checks = pulseChecks || [];
  const sentiments = checks.map((c) => emotionToTier[c.emotion] || 3);

  const currentSentiment = sentiments.length > 0 ? sentiments[0] : 3;
  const currentEmotion = checks.length > 0 ? checks[0].emotion : 'unknown';
  const lastCheckDate = checks.length > 0 ? checks[0].created_at : null;
  const averageSentiment30Days = calculateMean(sentiments);
  const stabilityScore = calculateStandardDeviation(sentiments);

  // Frequent emotions
  const emotionCounts: Record<string, number> = {};
  checks.forEach((c) => {
    emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
  });

  const totalEmotions = checks.length;
  const frequentEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalEmotions > 0 ? (count / totalEmotions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Mood trend
  const moodTrend = checks.map((c) => ({
    date: c.created_at.split('T')[0],
    sentiment: emotionToTier[c.emotion] || 3,
    emotion: c.emotion,
  }));

  // Care alerts (simplified - just check for concerning patterns)
  const careAlerts: Array<{
    type: 'emotional' | 'academic' | 'combined';
    severity: 'critical' | 'high' | 'medium';
    reason: string;
    daysActive: number;
  }> = [];

  // Check for sustained low mood
  const recentSentiments = sentiments.slice(0, 7);
  const lowMoodDays = recentSentiments.filter((s) => s <= 2).length;
  if (lowMoodDays >= 3) {
    careAlerts.push({
      type: 'emotional',
      severity: lowMoodDays >= 5 ? 'critical' : 'high',
      reason: `Low mood (Tier 1-2) for ${lowMoodDays} out of last 7 days`,
      daysActive: lowMoodDays,
    });
  }

  // Check for sudden mood drop
  if (sentiments.length >= 5) {
    const recent = calculateMean(sentiments.slice(0, 2));
    const previous = calculateMean(sentiments.slice(3, 5));
    if (previous >= 5 && recent <= 2) {
      careAlerts.push({
        type: 'emotional',
        severity: 'high',
        reason: 'Sudden mood drop from Tier 5-6 to Tier 1-2',
        daysActive: 2,
      });
    }
  }

  return {
    currentSentiment,
    currentEmotion,
    lastCheckDate,
    averageSentiment30Days,
    frequentEmotions,
    moodTrend,
    stabilityScore,
    careAlerts,
  };
}

async function getStudentEngagementData(studentId: string, classId: string): Promise<StudentEngagementData> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Morning pulse rate
  const { data: morningPulses } = await supabase
    .from('pulse_checks')
    .select('*')
    .eq('user_id', studentId)
    .gte('created_at', thirtyDaysAgo);

  const morningPulseRate = morningPulses ? (morningPulses.length / 30) * 100 : 0;

  // Class pulse rate
  const { data: classResponses } = await supabase
    .from('class_pulse_responses')
    .select('*, class_pulses!inner(class_id)')
    .eq('user_id', studentId)
    .eq('class_pulses.class_id', classId)
    .gte('created_at', thirtyDaysAgo);

  const { data: totalPulses } = await supabase
    .from('class_pulses')
    .select('*')
    .eq('class_id', classId)
    .gte('created_at', thirtyDaysAgo);

  const classPulseRate = totalPulses && totalPulses.length > 0 ? ((classResponses?.length || 0) / totalPulses.length) * 100 : 0;

  // Hapi Moments
  const { data: momentsSent } = await supabase
    .from('hapi_moments')
    .select('*')
    .eq('sender_id', studentId)
    .eq('class_id', classId)
    .gte('created_at', thirtyDaysAgo);

  const { data: momentsReceived } = await supabase
    .from('hapi_moments')
    .select('*')
    .eq('recipient_id', studentId)
    .eq('class_id', classId)
    .gte('created_at', thirtyDaysAgo);

  // Overall engagement score
  const overallEngagement = calculateMean([morningPulseRate, classPulseRate]);

  return {
    morningPulseRate,
    classPulseRate,
    discussionParticipation: 0, // Would need Canvas discussion API
    hapiMomentsSent: momentsSent?.length || 0,
    hapiMomentsReceived: momentsReceived?.length || 0,
    lastCanvasLogin: null, // Would need Canvas user activity API
    overallEngagement,
  };
}

async function calculateStudentMoodPerformanceCorrelation(
  studentId: string,
  _classId: string
): Promise<StudentCorrelationData> {
  const classId = _classId; // Use renamed parameter
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get pulse checks
    const { data: pulseChecks } = await supabase
      .from('pulse_checks')
      .select('*')
      .eq('user_id', studentId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    // Get Canvas submissions
    const assignments = await canvasServiceEnhanced.getAssignments(classId);
    const course = await canvasServiceEnhanced.getCourse(classId);

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

    // Build date-aligned data
    const scatterData: Array<{ date: string; sentiment: number; grade: number }> = [];
    const sentimentValues: number[] = [];
    const gradeValues: number[] = [];

    // Group pulse checks by day
    const pulseByDay: Record<string, number> = {};
    (pulseChecks || []).forEach((check) => {
      const date = check.created_at.split('T')[0];
      const sentiment = emotionToTier[check.emotion] || 3;
      pulseByDay[date] = sentiment;
    });

    // Get submissions with dates
    for (const assignment of assignments) {
      const submissions = await canvasServiceEnhanced.getSubmissions(classId, String(assignment.id), {
        include: ['user'],
      });

      const studentSubmission = submissions.find((s) => String(s.user_id) === studentId);
      if (studentSubmission && studentSubmission.score !== null && studentSubmission.submitted_at) {
        const submittedDate = studentSubmission.submitted_at.split('T')[0];
        const grade = transformCanvasSubmissionToGrade(studentSubmission, assignment, course);

        if (grade.percentage !== null && pulseByDay[submittedDate]) {
          scatterData.push({
            date: submittedDate,
            sentiment: pulseByDay[submittedDate],
            grade: grade.percentage,
          });

          sentimentValues.push(pulseByDay[submittedDate]);
          gradeValues.push(grade.percentage);
        }
      }
    }

    // Calculate correlation
    const correlation = sentimentValues.length >= 3 ? calculatePearsonCorrelation(sentimentValues, gradeValues) : 0;

    const absCorrelation = Math.abs(correlation);
    let correlationStrength: 'strong' | 'moderate' | 'weak' | 'none';
    if (absCorrelation > 0.7) correlationStrength = 'strong';
    else if (absCorrelation > 0.4) correlationStrength = 'moderate';
    else if (absCorrelation > 0.2) correlationStrength = 'weak';
    else correlationStrength = 'none';

    // Generate insight
    let insight = 'Insufficient data to determine correlation';
    if (correlation > 0.4) {
      insight = `This student performs ${(correlation * 20).toFixed(1)}% better when sentiment is positive (Tier 4-6)`;
    } else if (correlation < -0.4) {
      insight = 'Negative correlation detected - student grades are lower when mood is better (unusual pattern)';
    } else if (correlationStrength === 'weak' || correlationStrength === 'none') {
      insight = 'Mood and performance show weak correlation - other factors may be more significant';
    }

    return {
      correlation,
      correlationStrength,
      insight,
      scatterData,
    };
  } catch (error) {
    console.error('[StudentDataService] Failed to calculate correlation:', error);
    return {
      correlation: 0,
      correlationStrength: 'none',
      insight: 'Unable to calculate correlation',
      scatterData: [],
    };
  }
}

async function getTeacherInteractions(teacherId: string, studentId: string, classId: string): Promise<TeacherInteraction[]> {
  const interactions: TeacherInteraction[] = [];

  // Get Hapi Moments from teacher to student
  const { data: moments } = await supabase
    .from('hapi_moments')
    .select('*')
    .eq('sender_id', teacherId)
    .eq('recipient_id', studentId)
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
    .limit(10);

  (moments || []).forEach((moment) => {
    interactions.push({
      id: moment.id,
      type: 'hapi_moment',
      date: moment.created_at,
      content: moment.message,
    });
  });

  // Get office hours meetings
  const { data: meetings } = await supabase
    .from('office_hours_queue')
    .select('*, office_hours!inner(teacher_id)')
    .eq('student_id', studentId)
    .eq('office_hours.teacher_id', teacherId)
    .order('joined_at', { ascending: false })
    .limit(10);

  (meetings || []).forEach((meeting: any) => {
    interactions.push({
      id: meeting.id,
      type: 'meeting',
      date: meeting.completed_at || meeting.started_at || meeting.joined_at,
      content: meeting.reason || 'Office hours meeting',
    });
  });

  // Get teacher notes
  const { data: notes } = await supabase
    .from('teacher_student_notes')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(10);

  (notes || []).forEach((note: any) => {
    interactions.push({
      id: note.id,
      type: 'note',
      date: note.created_at,
      content: note.note_text,
      noteType: note.note_type,
      isFlagged: note.is_flagged,
    });
  });

  // Sort all interactions by date
  interactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return interactions;
}

async function calculateComparisonToClass(
  _studentId: string,
  _classId: string,
  academic: StudentAcademicData,
  wellbeing: StudentWellbeingData,
  engagement: StudentEngagementData
): Promise<ComparisonToClass> {
  // This would require fetching all students in the class
  // For now, return mock percentiles
  // In production, you'd calculate actual percentiles from class data

  return {
    gradePercentile: 75, // Mock
    sentimentPercentile: 60, // Mock
    engagementPercentile: 80, // Mock
    classAverage: {
      grade: 82,
      sentiment: 3.8,
      engagement: 72,
    },
    studentValues: {
      grade: academic.currentGrade || 0,
      sentiment: wellbeing.averageSentiment30Days,
      engagement: engagement.overallEngagement,
    },
  };
}

// ============================================================================
// RISK LEVEL CALCULATION
// ============================================================================

export function calculateStudentRiskLevel(
  academic: StudentAcademicData,
  wellbeing: StudentWellbeingData,
  engagement: StudentEngagementData
): RiskLevel {
  let riskScore = 0;

  // Academic risk factors
  if (academic.currentGrade !== null && academic.currentGrade < 70) riskScore += 2;
  else if (academic.currentGrade !== null && academic.currentGrade < 80) riskScore += 1;

  if (academic.missingAssignments >= 3) riskScore += 2;
  else if (academic.missingAssignments >= 1) riskScore += 1;

  if (academic.trend === 'declining') riskScore += 1;

  // Emotional risk factors
  if (wellbeing.averageSentiment30Days < 2.5) riskScore += 2;
  else if (wellbeing.averageSentiment30Days < 3.5) riskScore += 1;

  if (wellbeing.careAlerts.some((a) => a.severity === 'critical')) riskScore += 3;
  else if (wellbeing.careAlerts.some((a) => a.severity === 'high')) riskScore += 2;
  else if (wellbeing.careAlerts.length > 0) riskScore += 1;

  // Engagement risk factors
  if (engagement.morningPulseRate < 30) riskScore += 1;
  if (engagement.classPulseRate < 50) riskScore += 1;

  // Determine overall risk level
  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

// ============================================================================
// STUDENT SEARCH FUNCTIONS
// ============================================================================

export type StudentSearchResult = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  classPoints: number;
  currentStreak: number;
  lastPulseCheck: string | null;
  riskLevel: RiskLevel;
  recentEmotions: string[];
};

export async function searchStudents(
  _teacherId: string,
  classId: string,
  query: string
): Promise<StudentSearchResult[]> {
  // Get all students in the class
  const { data: members, error } = await supabase
    .from('class_members')
    .select('user_id, class_points, profiles!inner(id, full_name, email, avatar_url, current_streak, last_pulse_check_date)')
    .eq('class_id', classId);

  if (error || !members || members.length === 0 || isMockClassId(classId)) {
    console.log('[StudentDataService] No class members in database or using mock mode, using mock data');

    // Return mock students when database is empty OR when using mock class IDs
    const mockStudents: StudentSearchResult[] = [
      {
        id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
        name: 'Alex Johnson',
        email: 'alex.j@school.edu',
        avatarUrl: null,
        classPoints: 150,
        currentStreak: 5,
        lastPulseCheck: new Date().toISOString(),
        riskLevel: 'low',
        recentEmotions: ['happy', 'hopeful', 'calm'],
      },
      {
        id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
        name: 'Sarah Martinez',
        email: 'sarah.m@school.edu',
        avatarUrl: null,
        classPoints: 200,
        currentStreak: 8,
        riskLevel: 'low',
        lastPulseCheck: new Date().toISOString(),
        recentEmotions: ['excited', 'grateful', 'happy'],
      },
      {
        id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
        name: 'Michael Chen',
        email: 'michael.c@school.edu',
        avatarUrl: null,
        classPoints: 75,
        currentStreak: 0,
        riskLevel: 'high',
        lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        recentEmotions: ['stressed', 'anxious', 'tired'],
      },
      {
        id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
        name: 'Emily Rodriguez',
        email: 'emily.r@school.edu',
        avatarUrl: null,
        classPoints: 180,
        currentStreak: 6,
        riskLevel: 'low',
        lastPulseCheck: new Date().toISOString(),
        recentEmotions: ['calm', 'hopeful', 'happy'],
      },
      {
        id: MOCK_STUDENT_IDS.DAVID_KIM,
        name: 'David Kim',
        email: 'david.k@school.edu',
        avatarUrl: null,
        classPoints: 190,
        currentStreak: 7,
        riskLevel: 'low',
        lastPulseCheck: new Date().toISOString(),
        recentEmotions: ['energized', 'excited', 'grateful'],
      },
      {
        id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
        name: 'Jessica Thompson',
        email: 'jessica.t@school.edu',
        avatarUrl: null,
        classPoints: 120,
        currentStreak: 3,
        riskLevel: 'medium',
        lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        recentEmotions: ['tired', 'bored', 'nervous'],
      },
      {
        id: MOCK_STUDENT_IDS.MARCUS_WILLIAMS,
        name: 'Marcus Williams',
        email: 'marcus.w@school.edu',
        avatarUrl: null,
        classPoints: 165,
        currentStreak: 4,
        riskLevel: 'low',
        lastPulseCheck: new Date().toISOString(),
        recentEmotions: ['happy', 'calm', 'hopeful'],
      },
      {
        id: MOCK_STUDENT_IDS.SOPHIA_LEE,
        name: 'Sophia Lee',
        email: 'sophia.l@school.edu',
        avatarUrl: null,
        classPoints: 50,
        currentStreak: 0,
        riskLevel: 'high',
        lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        recentEmotions: ['sad', 'stressed', 'anxious'],
      },
    ];

    // Filter by search query
    const lowerQuery = query.toLowerCase();
    return mockStudents.filter((s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by search query
  const lowerQuery = query.toLowerCase();
  const filtered = members.filter((m: any) => {
    const profile = m.profiles;
    return profile.full_name.toLowerCase().includes(lowerQuery) || profile.email.toLowerCase().includes(lowerQuery);
  });

  // For each student, calculate risk level (simplified)
  const results = await Promise.all(
    filtered.map(async (m: any) => {
      const profile = m.profiles;

      // Get recent emotions
      const { data: recentChecks } = await supabase
        .from('pulse_checks')
        .select('emotion')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentEmotions = (recentChecks || []).map((c: any) => c.emotion);

      // Simple risk calculation based on last check
      let riskLevel: RiskLevel = 'low';
      if (!profile.last_pulse_check_date) {
        riskLevel = 'medium';
      } else {
        const daysSinceCheck = Math.floor((Date.now() - new Date(profile.last_pulse_check_date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCheck >= 5) riskLevel = 'high';
        else if (daysSinceCheck >= 3) riskLevel = 'medium';
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        classPoints: m.class_points,
        currentStreak: profile.current_streak,
        lastPulseCheck: profile.last_pulse_check_date,
        riskLevel,
        recentEmotions,
      };
    })
  );

  return results;
}

export async function getAtRiskStudents(teacherId: string, classId: string): Promise<StudentSearchResult[]> {
  const allStudents = await searchStudents(teacherId, classId, '');
  return allStudents.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'medium');
}

export async function getTopPerformers(_teacherId: string, classId: string): Promise<StudentSearchResult[]> {
  const teacherId = _teacherId; // Use renamed parameter
  const allStudents = await searchStudents(teacherId, classId, '');
  return allStudents.filter((s) => s.classPoints > 100).sort((a, b) => b.classPoints - a.classPoints).slice(0, 10);
}

export async function getLowParticipationStudents(teacherId: string, classId: string): Promise<StudentSearchResult[]> {
  const allStudents = await searchStudents(teacherId, classId, '');
  return allStudents.filter((s) => !s.lastPulseCheck || s.currentStreak === 0);
}
