import { SentimentHistory, AssignmentWithStatus, ParticipationData } from './mockData';

// ============================================================================
// Mood Variability Calculations
// ============================================================================

export function calculateMoodVariability(moodHistory: SentimentHistory[]): {
  variability: number;
  stability: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  if (moodHistory.length < 2) {
    return { variability: 0, stability: 100, trend: 'stable' };
  }

  // Calculate standard deviation of intensity scores
  const intensities = moodHistory.map(m => m.intensity);
  const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
  const squaredDiffs = intensities.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / intensities.length;
  const stdDev = Math.sqrt(variance);

  // Variability score (0-100, higher = more variable)
  const variability = Math.min(100, (stdDev / 7) * 100);

  // Stability score (inverse of variability)
  const stability = 100 - variability;

  // Determine trend (compare first half to second half)
  const midpoint = Math.floor(moodHistory.length / 2);
  const firstHalf = moodHistory.slice(0, midpoint);
  const secondHalf = moodHistory.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.intensity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.intensity, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  const trend = diff > 0.5 ? 'improving' : diff < -0.5 ? 'declining' : 'stable';

  return { variability, stability, trend };
}

// ============================================================================
// Academic Focus Score
// ============================================================================

export function calculateAcademicFocusScore(data: {
  gradeAverage: number;
  assignmentCompletionRate: number;
  participationScore: number;
  studyPlanAdherence: number;
}): {
  score: number;
  breakdown: {
    grades: number;
    completion: number;
    participation: number;
    planning: number;
  };
  level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
} {
  const { gradeAverage, assignmentCompletionRate, participationScore, studyPlanAdherence } = data;

  // Weighted calculation
  const score = Math.round(
    gradeAverage * 0.4 +
    assignmentCompletionRate * 0.3 +
    participationScore * 0.2 +
    studyPlanAdherence * 0.1
  );

  const breakdown = {
    grades: Math.round(gradeAverage * 0.4),
    completion: Math.round(assignmentCompletionRate * 0.3),
    participation: Math.round(participationScore * 0.2),
    planning: Math.round(studyPlanAdherence * 0.1),
  };

  let level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  if (score >= 90) level = 'excellent';
  else if (score >= 75) level = 'good';
  else if (score >= 60) level = 'fair';
  else level = 'needs_improvement';

  return { score, breakdown, level };
}

// ============================================================================
// Assignment Status Calculations
// ============================================================================

export function getAssignmentStatusCounts(assignments: AssignmentWithStatus[]): {
  upcoming: number;
  dueSoon: number;
  late: number;
  missing: number;
  completed: number;
  total: number;
} {
  return {
    upcoming: assignments.filter(a => a.status === 'upcoming').length,
    dueSoon: assignments.filter(a => a.status === 'due_soon').length,
    late: assignments.filter(a => a.status === 'late').length,
    missing: assignments.filter(a => a.status === 'missing').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    total: assignments.length,
  };
}

export function getAssignmentCompletionRate(assignments: AssignmentWithStatus[]): number {
  const total = assignments.length;
  if (total === 0) return 100;
  
  const completed = assignments.filter(a => a.status === 'completed').length;
  return Math.round((completed / total) * 100);
}

// ============================================================================
// Grade Calculations
// ============================================================================

export function calculateGradeAverage(assignments: AssignmentWithStatus[]): number {
  const graded = assignments.filter(a => a.score !== undefined && a.score !== null);
  if (graded.length === 0) return 0;

  const totalPoints = graded.reduce((sum, a) => sum + (a.score || 0), 0);
  const possiblePoints = graded.reduce((sum, a) => sum + a.points_possible, 0);

  return possiblePoints > 0 ? Math.round((totalPoints / possiblePoints) * 100) : 0;
}

export function calculateGradeTrend(assignments: AssignmentWithStatus[]): {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
} {
  const graded = assignments
    .filter(a => a.score !== undefined && a.graded_at)
    .sort((a, b) => new Date(a.graded_at!).getTime() - new Date(b.graded_at!).getTime());

  if (graded.length < 3) {
    return { trend: 'stable', change: 0 };
  }

  // Compare recent 3 to previous 3
  const recent = graded.slice(-3);
  const previous = graded.slice(-6, -3);

  const recentAvg = recent.reduce((sum, a) => sum + ((a.score! / a.points_possible) * 100), 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, a) => sum + ((a.score! / a.points_possible) * 100), 0) / previous.length
    : recentAvg;

  const change = Math.round(recentAvg - previousAvg);
  const trend = change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable';

  return { trend, change };
}

// ============================================================================
// Participation Calculations
// ============================================================================

export function calculateOverallParticipation(participationData: ParticipationData[]): {
  averageRate: number;
  totalPoints: number;
  overallRank: number;
  totalStudents: number;
} {
  const totalPulses = participationData.reduce((sum, p) => sum + p.total_pulses, 0);
  const completedPulses = participationData.reduce((sum, p) => sum + p.completed_pulses, 0);
  const averageRate = totalPulses > 0 ? Math.round((completedPulses / totalPulses) * 100) : 0;
  const totalPoints = participationData.reduce((sum, p) => sum + p.points_earned, 0);

  // For overall rank, we'd need more data, so we'll estimate
  const avgRank = Math.round(participationData.reduce((sum, p) => sum + p.rank, 0) / participationData.length);
  const totalStudents = Math.max(...participationData.map(p => p.total_students));

  return {
    averageRate,
    totalPoints,
    overallRank: avgRank,
    totalStudents,
  };
}

// ============================================================================
// Emotional Trajectory (AI Summary Generation)
// ============================================================================

export function generateEmotionalTrajectory(moodHistory: SentimentHistory[]): {
  summary: string;
  dominantEmotions: string[];
  recommendation: string;
} {
  if (moodHistory.length === 0) {
    return {
      summary: "Start tracking your mood to see insights about your emotional wellbeing.",
      dominantEmotions: [],
      recommendation: "Complete your daily morning pulse to begin tracking.",
    };
  }

  const { trend } = calculateMoodVariability(moodHistory);
  const avgIntensity = moodHistory.reduce((sum, m) => sum + m.intensity, 0) / moodHistory.length;

  // Count emotion frequencies
  const emotionCounts: Record<string, number> = {};
  moodHistory.forEach(m => {
    emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
  });

  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);

  // Generate summary based on trend and intensity
  let summary = '';
  let recommendation = '';

  if (trend === 'improving' && avgIntensity >= 5) {
    summary = `Your emotional wellbeing has been **steadily improving** over the past ${moodHistory.length} days. You're experiencing more positive emotions (${dominantEmotions.slice(0, 2).join(', ')}) and maintaining good emotional balance. Keep up the great work! 🌟`;
    recommendation = "Continue your current habits and routines that are supporting your wellbeing.";
  } else if (trend === 'improving' && avgIntensity < 5) {
    summary = `Your mood is **showing signs of improvement** over the past ${moodHistory.length} days. While you're still experiencing some challenges, the positive trend is encouraging. You're on the right path! 💪`;
    recommendation = "Keep engaging with support resources and maintain your self-care practices.";
  } else if (trend === 'declining' && avgIntensity < 4) {
    summary = `Your emotional wellbeing has been **declining** recently, with more frequent feelings of ${dominantEmotions[0]?.toLowerCase() || 'stress'}. This is a signal that you may need additional support. Remember, it's okay to ask for help. 🤗`;
    recommendation = "Consider reaching out to a counselor, talking to a trusted friend, or using campus wellness resources.";
  } else if (trend === 'declining') {
    summary = `Your mood has been **slightly declining** over the past ${moodHistory.length} days. You're experiencing more ${dominantEmotions[0]?.toLowerCase() || 'challenging'} emotions lately. Let's work on getting you back on track. 💙`;
    recommendation = "Try scheduling some self-care time, connecting with friends, or using stress-reduction techniques.";
  } else {
    summary = `Your emotional wellbeing has been **stable** over the past ${moodHistory.length} days, with consistent feelings of ${dominantEmotions[0]?.toLowerCase() || 'balance'}. You're maintaining a steady emotional state. 😊`;
    recommendation = "Continue monitoring your mood and maintain your current balance.";
  }

  return { summary, dominantEmotions, recommendation };
}

// ============================================================================
// Badge Progress Calculations
// ============================================================================

export function calculateBadgeProgress(badgeId: string, userData: {
  assignments: AssignmentWithStatus[];
  streak: number;
  pulseResponses: number;
  hapiMomentsSent: number;
  aiTutorQuestions: number;
  studyPlanWeeks: number;
  moodHistory: SentimentHistory[];
}): number {
  const { assignments, streak, pulseResponses, hapiMomentsSent, aiTutorQuestions, studyPlanWeeks, moodHistory } = userData;

  switch (badgeId) {
    case 'badge-1': // Perfect Score
      return assignments.some(a => a.score === a.points_possible) ? 100 : 0;
    
    case 'badge-2': // Consistent Performer (5 assignments 90%+)
      const highScores = assignments.filter(a => a.score && (a.score / a.points_possible) >= 0.9).length;
      return Math.min(100, (highScores / 5) * 100);
    
    case 'badge-4': // Early Bird (5 early submissions)
      const earlySubmissions = assignments.filter(a => 
        a.submitted_at && a.due_at && new Date(a.submitted_at) < new Date(a.due_at)
      ).length;
      return Math.min(100, (earlySubmissions / 5) * 100);
    
    case 'badge-6': // Streak Master (30 days)
      return Math.min(100, (streak / 30) * 100);
    
    case 'badge-7': // Active Participant (50 pulses)
      return Math.min(100, (pulseResponses / 50) * 100);
    
    case 'badge-8': // Helpful Peer (10 Hapi moments)
      return Math.min(100, (hapiMomentsSent / 10) * 100);
    
    case 'badge-9': // Curious Mind (25 AI questions)
      return Math.min(100, (aiTutorQuestions / 25) * 100);
    
    case 'badge-10': // Planner Pro (4 weeks)
      return Math.min(100, (studyPlanWeeks / 4) * 100);
    
    case 'badge-11': // Positive Vibes (7 days positive)
      const recentPositive = moodHistory.slice(-7).filter(m => m.intensity >= 5).length;
      return Math.min(100, (recentPositive / 7) * 100);
    
    case 'badge-14': // Self-Care Champion (21 days morning pulse)
      return Math.min(100, (streak / 21) * 100);
    
    default:
      return 0;
  }
}
