// Student analytics calculation utilities
import { CanvasAssignment } from '../canvas/mockPlanGenerator';
import { DailySentiment, AssignmentCompletion, StudySession } from './mockStudentAnalyticsData';

export interface WorkloadByClass {
  courseId: string;
  courseName: string;
  courseColor: string;
  points: number;
  assignmentCount: number;
  level: 'low' | 'medium' | 'high' | 'critical';
}

export interface GradeTrend {
  courseId: string;
  courseName: string;
  currentGrade: number;
  previousGrade: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CompletionRate {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface CorrelationData {
  coefficient: number; // -1 to 1
  strength: 'none' | 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative' | 'none';
  dataPoints: Array<{ x: number; y: number; label: string }>;
}

export interface StressLevel {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: {
    workload: number;
    deadlines: number;
    sentiment: number;
  };
}

export interface ProductivityScore {
  score: number; // 0-100
  efficiency: number; // tasks completed per hour
  consistency: number; // regularity of study sessions
  timeManagement: number; // tasks completed vs started close to deadline
}

/**
 * Calculate workload for next 7 days grouped by class
 */
export function calculateWorkloadByClass(assignments: CanvasAssignment[]): WorkloadByClass[] {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Filter assignments due in next 7 days
  const upcomingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate >= now && dueDate <= sevenDaysLater;
  });
  
  // Group by course
  const courseMap = new Map<string, WorkloadByClass>();
  
  upcomingAssignments.forEach(assignment => {
    if (!courseMap.has(assignment.courseId)) {
      courseMap.set(assignment.courseId, {
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        courseColor: assignment.courseColor,
        points: 0,
        assignmentCount: 0,
        level: 'low',
      });
    }
    
    const courseData = courseMap.get(assignment.courseId)!;
    courseData.points += assignment.points;
    courseData.assignmentCount += 1;
  });
  
  // Calculate levels based on points
  const workloads = Array.from(courseMap.values());
  workloads.forEach(workload => {
    if (workload.points < 100) workload.level = 'low';
    else if (workload.points < 250) workload.level = 'medium';
    else if (workload.points < 400) workload.level = 'high';
    else workload.level = 'critical';
  });
  
  return workloads.sort((a, b) => b.points - a.points);
}

/**
 * Calculate grade trends over time
 */
export function getGradeTrends(completions: AssignmentCompletion[]): GradeTrend[] {
  const courseMap = new Map<string, { grades: number[]; name: string }>();
  
  completions
    .filter(c => c.completedDate && c.grade !== undefined)
    .sort((a, b) => new Date(a.completedDate!).getTime() - new Date(b.completedDate!).getTime())
    .forEach(completion => {
      if (!courseMap.has(completion.courseId)) {
        courseMap.set(completion.courseId, {
          grades: [],
          name: completion.courseName,
        });
      }
      courseMap.get(completion.courseId)!.grades.push(completion.grade!);
    });
  
  const trends: GradeTrend[] = [];
  courseMap.forEach((data, courseId) => {
    if (data.grades.length >= 2) {
      const currentGrade = data.grades[data.grades.length - 1];
      const previousGrade = data.grades[data.grades.length - 2];
      const change = currentGrade - previousGrade;
      
      trends.push({
        courseId,
        courseName: data.name,
        currentGrade,
        previousGrade,
        change,
        trend: Math.abs(change) < 3 ? 'stable' : change > 0 ? 'up' : 'down',
      });
    }
  });
  
  return trends;
}

/**
 * Calculate assignment completion rate
 */
export function calculateCompletionRate(completions: AssignmentCompletion[]): CompletionRate {
  const total = completions.length;
  const completed = completions.filter(c => c.completedDate !== null).length;
  const pending = total - completed;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return { total, completed, pending, percentage };
}

/**
 * Calculate correlation between mood (sentiment) and grade performance
 */
export function getCorrelationCoefficient(
  sentiments: DailySentiment[],
  completions: AssignmentCompletion[]
): CorrelationData {
  const dataPoints: Array<{ x: number; y: number; label: string }> = [];
  
  // Match completed assignments with sentiment on completion date
  completions.forEach(completion => {
    if (completion.completedDate && completion.grade !== undefined) {
      const sentiment = sentiments.find(s => s.date === completion.completedDate);
      if (sentiment) {
        dataPoints.push({
          x: sentiment.sentimentValue,
          y: completion.grade,
          label: completion.title,
        });
      }
    }
  });
  
  if (dataPoints.length < 2) {
    return {
      coefficient: 0,
      strength: 'none',
      direction: 'none',
      dataPoints: [],
    };
  }
  
  // Calculate Pearson correlation coefficient
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = dataPoints.reduce((sum, p) => sum + p.y * p.y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  const coefficient = denominator === 0 ? 0 : numerator / denominator;
  
  // Determine strength and direction
  const absCoeff = Math.abs(coefficient);
  let strength: CorrelationData['strength'];
  if (absCoeff < 0.2) strength = 'none';
  else if (absCoeff < 0.5) strength = 'weak';
  else if (absCoeff < 0.8) strength = 'moderate';
  else strength = 'strong';
  
  const direction: CorrelationData['direction'] =
    coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'none';
  
  return {
    coefficient,
    strength,
    direction,
    dataPoints,
  };
}

/**
 * Calculate overall stress level
 */
export function getStressLevel(
  workload: WorkloadByClass[],
  assignments: CanvasAssignment[],
  sentiments: DailySentiment[]
): StressLevel {
  // Workload factor (0-100)
  const totalPoints = workload.reduce((sum, w) => sum + w.points, 0);
  const workloadScore = Math.min(100, (totalPoints / 500) * 100);
  
  // Deadlines factor (0-100) - assignments due in next 3 days
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const urgentAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate >= now && dueDate <= threeDaysLater;
  });
  const deadlinesScore = Math.min(100, (urgentAssignments.length / 5) * 100);
  
  // Sentiment factor (0-100) - inverse of recent average sentiment
  const recentSentiments = sentiments.slice(-7); // Last 7 days
  const avgSentiment = recentSentiments.reduce((sum, s) => sum + s.sentimentValue, 0) / recentSentiments.length;
  const sentimentScore = ((6 - avgSentiment) / 5) * 100; // Inverse scale: low mood = high stress
  
  // Combined stress score (weighted average)
  const score = Math.round(workloadScore * 0.4 + deadlinesScore * 0.3 + sentimentScore * 0.3);
  
  let level: StressLevel['level'];
  if (score < 30) level = 'low';
  else if (score < 60) level = 'moderate';
  else if (score < 85) level = 'high';
  else level = 'critical';
  
  return {
    score,
    level,
    factors: {
      workload: Math.round(workloadScore),
      deadlines: Math.round(deadlinesScore),
      sentiment: Math.round(sentimentScore),
    },
  };
}

/**
 * Calculate productivity score
 */
export function getProductivityScore(
  completions: AssignmentCompletion[],
  sessions: StudySession[]
): ProductivityScore {
  // Efficiency: completed tasks per study hour
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyHours = totalStudyMinutes / 60;
  const completedTasks = completions.filter(c => c.completedDate !== null).length;
  const efficiency = totalStudyHours > 0 ? (completedTasks / totalStudyHours) * 10 : 0; // Normalize to 0-10 scale
  
  // Consistency: regularity of study sessions (0-10 scale)
  const studyDates = sessions.map(s => new Date(s.date).getTime());
  const gaps = studyDates.slice(1).map((date, i) => date - studyDates[i]);
  const avgGap = gaps.length > 0 ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length : 0;
  const idealGap = 24 * 60 * 60 * 1000; // 1 day
  const consistency = Math.max(0, 10 - Math.abs(avgGap - idealGap) / (24 * 60 * 60 * 1000)); // 0-10 scale
  
  // Time management: tasks completed early vs last minute
  const completedWithDates = completions.filter(c => c.completedDate !== null);
  const earlyCompletions = completedWithDates.filter(c => {
    const dueDate = new Date(c.dueDate).getTime();
    const completedDate = new Date(c.completedDate!).getTime();
    const daysBefore = (dueDate - completedDate) / (24 * 60 * 60 * 1000);
    return daysBefore >= 1; // Completed at least 1 day early
  }).length;
  const timeManagement = completedWithDates.length > 0
    ? (earlyCompletions / completedWithDates.length) * 10
    : 5; // 0-10 scale
  
  // Combined score (0-100)
  const score = Math.round((efficiency + consistency + timeManagement) / 3 * 10);
  
  return {
    score: Math.min(100, score),
    efficiency: Math.min(10, efficiency),
    consistency: Math.min(10, consistency),
    timeManagement: Math.min(10, timeManagement),
  };
}

/**
 * Calculate average sentiment over time with moving average
 */
export function calculateSentimentMovingAverage(
  sentiments: DailySentiment[],
  windowSize: number = 7
): Array<{ date: string; value: number; smoothed: number }> {
  const result: Array<{ date: string; value: number; smoothed: number }> = [];
  
  sentiments.forEach((sentiment, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = sentiments.slice(start, index + 1);
    const smoothed = window.reduce((sum, s) => sum + s.sentimentValue, 0) / window.length;
    
    result.push({
      date: sentiment.date,
      value: sentiment.sentimentValue,
      smoothed,
    });
  });
  
  return result;
}

