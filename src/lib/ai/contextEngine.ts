// AI Context Awareness Engine
// Aggregates user data to provide intelligent, context-aware assistance

import { mockAssignments } from '../canvas/mockPlanGenerator';
import { mockDailySentiments } from '../analytics/mockStudentAnalyticsData';
import { calculateWorkloadByClass, getStressLevel } from '../analytics/studentAnalytics';

export interface AIContext {
  currentClasses: Array<{ id: string; name: string; grade: number }>;
  upcomingDeadlines: Array<{
    title: string;
    course: string;
    dueDate: string;
    daysUntil: number;
    points: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  activeStudyPlans: Array<{ id: string; title: string; progress: number }>;
  recentMood: {
    current: string;
    trend: 'improving' | 'declining' | 'stable';
    avgSentiment: number;
  };
  workloadStatus: {
    totalPoints: number;
    level: 'low' | 'moderate' | 'high' | 'critical';
    stressScore: number;
  };
  studyPatterns: {
    totalHoursThisWeek: number;
    preferredTimes: string[];
    productivity: number;
  };
  suggestions: string[];
}

/**
 * Generate comprehensive context for AI awareness
 */
export function generateAIContext(): AIContext {
  // Get upcoming assignments (next 7 days)
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingAssignments = mockAssignments
    .filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= sevenDaysLater;
    })
    .map(a => {
      const dueDate = new Date(a.dueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (daysUntil <= 1) urgency = 'critical';
      else if (daysUntil <= 2) urgency = 'high';
      else if (daysUntil <= 4) urgency = 'medium';
      
      return {
        title: a.title,
        course: a.courseName,
        dueDate: a.dueDate,
        daysUntil,
        points: a.points,
        urgency,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Mock current classes
  const currentClasses = [
    { id: '1', name: 'Calculus II', grade: 87 },
    { id: '2', name: 'Biology 101', grade: 76 },
    { id: '3', name: 'English Literature', grade: 94 },
    { id: '4', name: 'Chemistry 102', grade: 85 },
  ];

  // Recent mood analysis
  const recentSentiments = mockDailySentiments.slice(-7);
  const avgSentiment = recentSentiments.reduce((sum, s) => sum + s.sentimentValue, 0) / recentSentiments.length;
  const oldAvg = mockDailySentiments.slice(-14, -7).reduce((sum, s) => sum + s.sentimentValue, 0) / 7;
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (avgSentiment > oldAvg + 0.5) trend = 'improving';
  else if (avgSentiment < oldAvg - 0.5) trend = 'declining';

  // Workload analysis
  const workloads = calculateWorkloadByClass(mockAssignments);
  const totalPoints = workloads.reduce((sum, w) => sum + w.points, 0);
  const stressData = getStressLevel(workloads, mockAssignments, mockDailySentiments);

  // Generate contextual suggestions
  const suggestions = generateSuggestions({
    upcomingDeadlines: upcomingAssignments,
    workloadPoints: totalPoints,
    stressLevel: stressData.level,
    avgSentiment,
    currentClasses,
  });

  return {
    currentClasses,
    upcomingDeadlines: upcomingAssignments,
    activeStudyPlans: [
      { id: '1', title: 'Calculus Midterm Prep', progress: 65 },
      { id: '2', title: 'Biology Chapter 7-9', progress: 40 },
    ],
    recentMood: {
      current: recentSentiments[recentSentiments.length - 1].emotion,
      trend,
      avgSentiment: parseFloat(avgSentiment.toFixed(1)),
    },
    workloadStatus: {
      totalPoints,
      level: stressData.level,
      stressScore: stressData.score,
    },
    studyPatterns: {
      totalHoursThisWeek: 23,
      preferredTimes: ['Evening (6-9 PM)', 'Afternoon (2-5 PM)'],
      productivity: 78,
    },
    suggestions,
  };
}

/**
 * Generate smart suggestions based on context
 */
function generateSuggestions(data: {
  upcomingDeadlines: any[];
  workloadPoints: number;
  stressLevel: string;
  avgSentiment: number;
  currentClasses: any[];
}): string[] {
  const suggestions: string[] = [];

  // Deadline-based suggestions
  const urgentDeadlines = data.upcomingDeadlines.filter(d => d.urgency === 'critical' || d.urgency === 'high');
  if (urgentDeadlines.length > 0) {
    suggestions.push(`You have ${urgentDeadlines.length} urgent ${urgentDeadlines.length === 1 ? 'deadline' : 'deadlines'}. Want help prioritizing?`);
  }

  // Workload suggestions
  if (data.workloadPoints > 400) {
    suggestions.push("Your workload is high this week. Let me create an optimized study schedule.");
  }

  // Stress suggestions
  if (data.stressLevel === 'high' || data.stressLevel === 'critical') {
    suggestions.push("Stress levels are elevated. Need time management strategies or study tips?");
  }

  // Mood-based suggestions
  if (data.avgSentiment < 3) {
    suggestions.push("I notice you've been feeling down lately. Want to talk about what's challenging?");
  }

  // Grade-based suggestions
  const strugglingClasses = data.currentClasses.filter(c => c.grade < 80);
  if (strugglingClasses.length > 0) {
    suggestions.push(`Need extra help with ${strugglingClasses[0].name}? I can create a targeted study plan.`);
  }

  // Proactive help
  if (suggestions.length === 0) {
    suggestions.push("What would you like to work on today?");
    suggestions.push("I can help you study, organize, or plan your week.");
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

/**
 * Format context for AI prompt injection
 */
export function formatContextForAI(context: AIContext): string {
  let prompt = "CURRENT CONTEXT:\n\n";
  
  prompt += `Classes: ${context.currentClasses.map(c => `${c.name} (${c.grade}%)`).join(', ')}\n`;
  
  if (context.upcomingDeadlines.length > 0) {
    prompt += `\nUpcoming Deadlines:\n`;
    context.upcomingDeadlines.forEach(d => {
      prompt += `- ${d.title} (${d.course}) - Due in ${d.daysUntil} day${d.daysUntil === 1 ? '' : 's'}, ${d.points} points\n`;
    });
  }
  
  prompt += `\nMood: ${context.recentMood.current} (${context.recentMood.trend})\n`;
  prompt += `Workload: ${context.workloadStatus.level} (${context.workloadStatus.totalPoints} points due)\n`;
  prompt += `Study Hours This Week: ${context.studyPatterns.totalHoursThisWeek}h\n`;
  
  return prompt;
}

/**
 * Get context badge data for UI display
 */
export function getContextBadges(context: AIContext): Array<{
  label: string;
  value: string;
  color: string;
  icon: string;
}> {
  return [
    {
      label: 'Deadlines',
      value: context.upcomingDeadlines.length.toString(),
      color: context.upcomingDeadlines.some(d => d.urgency === 'critical') ? 'red' : 'orange',
      icon: 'Calendar',
    },
    {
      label: 'Workload',
      value: context.workloadStatus.level,
      color: context.workloadStatus.level === 'critical' ? 'red' : context.workloadStatus.level === 'high' ? 'orange' : 'green',
      icon: 'Zap',
    },
    {
      label: 'Mood',
      value: context.recentMood.trend,
      color: context.recentMood.trend === 'improving' ? 'green' : context.recentMood.trend === 'declining' ? 'red' : 'blue',
      icon: 'Heart',
    },
    {
      label: 'Study Time',
      value: `${context.studyPatterns.totalHoursThisWeek}h`,
      color: 'purple',
      icon: 'Clock',
    },
  ];
}

