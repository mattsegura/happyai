/**
 * Mock Forecasting Data
 *
 * Provides realistic mock data for forecasting and AI-powered analytics when AI API is not available.
 * This supports Phase 4 - Week 3: AI Forecasting & Automated Reports
 *
 * Usage: Set VITE_USE_FORECASTING_MOCK=true in .env to use this data
 *
 * Features Supported:
 * - Feature 48: Engagement Forecast (30-day prediction)
 * - Feature 45: Weekly AI Summary Reports
 */

export interface EngagementForecast {
  date: string;
  predictedPulseCompletionRate: number;
  predictedClassPulseParticipation: number;
  predictedAssignmentCompletionRate: number;
  predictedSentiment: number;
  confidenceLevel: number; // 0-1 scale
  forecastType: 'historical' | 'predicted';
  influencingFactors: string[];
}

export interface WeeklyAISummaryReport {
  weekStartDate: string;
  weekEndDate: string;
  executiveSummary: {
    keyInsight1: string;
    keyInsight2: string;
    keyInsight3: string;
  };
  academicPerformance: {
    gradesTrend: 'improving' | 'stable' | 'declining';
    gradesTrendPercentage: number;
    topPerformingDepartments: string[];
    strugglingDepartments: string[];
    details: string;
  };
  emotionalWellbeing: {
    sentimentTrend: 'improving' | 'stable' | 'declining';
    sentimentTrendPercentage: number;
    averageSentiment: number;
    atRiskStudentCount: number;
    positiveHighlights: string[];
    details: string;
  };
  engagementMetrics: {
    platformUsagePercentage: number;
    teacherEngagementRate: number;
    studentParticipationRate: number;
    highlights: string[];
    details: string;
  };
  actionItems: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    affectedStudents?: number;
    deadline?: string;
  }[];
  lookingAhead: {
    upcomingEvents: string[];
    predictedChallenges: string[];
    recommendations: string[];
  };
}

// Generate 30-day forecast (15 days historical + 15 days predicted)
export const mockEngagementForecast: EngagementForecast[] = [
  // Historical data (past 15 days) - based on actual patterns
  {
    date: '2024-10-24',
    predictedPulseCompletionRate: 0.84,
    predictedClassPulseParticipation: 0.78,
    predictedAssignmentCompletionRate: 0.88,
    predictedSentiment: 4.5,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Normal academic week', 'Moderate workload']
  },
  {
    date: '2024-10-25',
    predictedPulseCompletionRate: 0.86,
    predictedClassPulseParticipation: 0.80,
    predictedAssignmentCompletionRate: 0.89,
    predictedSentiment: 4.6,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Mid-week boost', 'Study group activities']
  },
  {
    date: '2024-10-26',
    predictedPulseCompletionRate: 0.82,
    predictedClassPulseParticipation: 0.76,
    predictedAssignmentCompletionRate: 0.85,
    predictedSentiment: 4.3,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Upcoming assignments', 'Pre-exam anxiety']
  },
  {
    date: '2024-10-27',
    predictedPulseCompletionRate: 0.88,
    predictedClassPulseParticipation: 0.82,
    predictedAssignmentCompletionRate: 0.90,
    predictedSentiment: 4.8,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Friday boost', 'Weekend anticipation']
  },
  {
    date: '2024-10-28',
    predictedPulseCompletionRate: 0.78,
    predictedClassPulseParticipation: 0.70,
    predictedAssignmentCompletionRate: 0.82,
    predictedSentiment: 4.4,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Monday blues', 'Back to week routine']
  },
  {
    date: '2024-10-29',
    predictedPulseCompletionRate: 0.80,
    predictedClassPulseParticipation: 0.74,
    predictedAssignmentCompletionRate: 0.84,
    predictedSentiment: 4.5,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Normal Tuesday', 'Assignment submissions']
  },
  {
    date: '2024-10-30',
    predictedPulseCompletionRate: 0.83,
    predictedClassPulseParticipation: 0.77,
    predictedAssignmentCompletionRate: 0.87,
    predictedSentiment: 4.6,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Mid-week productivity', 'Office hours attendance']
  },
  {
    date: '2024-10-31',
    predictedPulseCompletionRate: 0.85,
    predictedClassPulseParticipation: 0.79,
    predictedAssignmentCompletionRate: 0.88,
    predictedSentiment: 4.7,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Halloween festivities', 'Positive social events']
  },
  {
    date: '2024-11-01',
    predictedPulseCompletionRate: 0.87,
    predictedClassPulseParticipation: 0.81,
    predictedAssignmentCompletionRate: 0.90,
    predictedSentiment: 4.8,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Friday energy', 'Weekend plans']
  },
  {
    date: '2024-11-02',
    predictedPulseCompletionRate: 0.77,
    predictedClassPulseParticipation: 0.69,
    predictedAssignmentCompletionRate: 0.81,
    predictedSentiment: 4.3,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Monday return', 'New week preparation']
  },
  {
    date: '2024-11-03',
    predictedPulseCompletionRate: 0.79,
    predictedClassPulseParticipation: 0.73,
    predictedAssignmentCompletionRate: 0.83,
    predictedSentiment: 4.4,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Project due dates approaching']
  },
  {
    date: '2024-11-04',
    predictedPulseCompletionRate: 0.75,
    predictedClassPulseParticipation: 0.68,
    predictedAssignmentCompletionRate: 0.79,
    predictedSentiment: 4.1,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Major projects due', 'High workload week']
  },
  {
    date: '2024-11-05',
    predictedPulseCompletionRate: 0.73,
    predictedClassPulseParticipation: 0.66,
    predictedAssignmentCompletionRate: 0.77,
    predictedSentiment: 3.9,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Post-project stress', 'Fatigue']
  },
  {
    date: '2024-11-06',
    predictedPulseCompletionRate: 0.76,
    predictedClassPulseParticipation: 0.70,
    predictedAssignmentCompletionRate: 0.80,
    predictedSentiment: 4.2,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Recovery period', 'Lighter workload']
  },
  {
    date: '2024-11-07',
    predictedPulseCompletionRate: 0.81,
    predictedClassPulseParticipation: 0.75,
    predictedAssignmentCompletionRate: 0.85,
    predictedSentiment: 4.5,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Thursday productivity', 'Weekend approaching']
  },
  {
    date: '2024-11-08',
    predictedPulseCompletionRate: 0.85,
    predictedClassPulseParticipation: 0.79,
    predictedAssignmentCompletionRate: 0.88,
    predictedSentiment: 4.7,
    confidenceLevel: 1.0,
    forecastType: 'historical',
    influencingFactors: ['Friday motivation', 'Weekend plans']
  },

  // Predicted data (next 15 days) - with confidence intervals
  {
    date: '2024-11-09',
    predictedPulseCompletionRate: 0.78,
    predictedClassPulseParticipation: 0.71,
    predictedAssignmentCompletionRate: 0.82,
    predictedSentiment: 4.4,
    confidenceLevel: 0.92,
    forecastType: 'predicted',
    influencingFactors: ['Predicted Monday pattern', 'Historical trends']
  },
  {
    date: '2024-11-10',
    predictedPulseCompletionRate: 0.80,
    predictedClassPulseParticipation: 0.74,
    predictedAssignmentCompletionRate: 0.84,
    predictedSentiment: 4.5,
    confidenceLevel: 0.90,
    forecastType: 'predicted',
    influencingFactors: ['Normal Tuesday pattern', 'Stable workload expected']
  },
  {
    date: '2024-11-11',
    predictedPulseCompletionRate: 0.83,
    predictedClassPulseParticipation: 0.77,
    predictedAssignmentCompletionRate: 0.87,
    predictedSentiment: 4.6,
    confidenceLevel: 0.88,
    forecastType: 'predicted',
    influencingFactors: ['Mid-week productivity', 'Veterans Day (possible lighter schedule)']
  },
  {
    date: '2024-11-12',
    predictedPulseCompletionRate: 0.82,
    predictedClassPulseParticipation: 0.76,
    predictedAssignmentCompletionRate: 0.86,
    predictedSentiment: 4.5,
    confidenceLevel: 0.87,
    forecastType: 'predicted',
    influencingFactors: ['Normal Thursday', 'Pre-weekend preparation']
  },
  {
    date: '2024-11-13',
    predictedPulseCompletionRate: 0.86,
    predictedClassPulseParticipation: 0.80,
    predictedAssignmentCompletionRate: 0.89,
    predictedSentiment: 4.7,
    confidenceLevel: 0.85,
    forecastType: 'predicted',
    influencingFactors: ['Friday boost', 'Weekend anticipation']
  },
  {
    date: '2024-11-14',
    predictedPulseCompletionRate: 0.77,
    predictedClassPulseParticipation: 0.70,
    predictedAssignmentCompletionRate: 0.81,
    predictedSentiment: 4.3,
    confidenceLevel: 0.83,
    forecastType: 'predicted',
    influencingFactors: ['Monday return', 'Assignment deadlines approaching']
  },
  {
    date: '2024-11-15',
    predictedPulseCompletionRate: 0.79,
    predictedClassPulseParticipation: 0.73,
    predictedAssignmentCompletionRate: 0.83,
    predictedSentiment: 4.4,
    confidenceLevel: 0.81,
    forecastType: 'predicted',
    influencingFactors: ['Normal workload', 'Mid-November patterns']
  },
  {
    date: '2024-11-16',
    predictedPulseCompletionRate: 0.75,
    predictedClassPulseParticipation: 0.68,
    predictedAssignmentCompletionRate: 0.79,
    predictedSentiment: 4.0,
    confidenceLevel: 0.79,
    forecastType: 'predicted',
    influencingFactors: ['Pre-Thanksgiving stress', 'Multiple assignments due']
  },
  {
    date: '2024-11-17',
    predictedPulseCompletionRate: 0.74,
    predictedClassPulseParticipation: 0.67,
    predictedAssignmentCompletionRate: 0.78,
    predictedSentiment: 3.9,
    confidenceLevel: 0.77,
    forecastType: 'predicted',
    influencingFactors: ['High workload expected', 'Pre-break crunch']
  },
  {
    date: '2024-11-18',
    predictedPulseCompletionRate: 0.72,
    predictedClassPulseParticipation: 0.65,
    predictedAssignmentCompletionRate: 0.76,
    predictedSentiment: 3.8,
    confidenceLevel: 0.75,
    forecastType: 'predicted',
    influencingFactors: ['Final week before Thanksgiving', 'Peak stress period']
  },
  {
    date: '2024-11-19',
    predictedPulseCompletionRate: 0.78,
    predictedClassPulseParticipation: 0.72,
    predictedAssignmentCompletionRate: 0.82,
    predictedSentiment: 4.3,
    confidenceLevel: 0.73,
    forecastType: 'predicted',
    influencingFactors: ['Relief approaching break', 'Lighter schedule expected']
  },
  {
    date: '2024-11-20',
    predictedPulseCompletionRate: 0.81,
    predictedClassPulseParticipation: 0.75,
    predictedAssignmentCompletionRate: 0.85,
    predictedSentiment: 4.6,
    confidenceLevel: 0.71,
    forecastType: 'predicted',
    influencingFactors: ['Thanksgiving break starts', 'Holiday anticipation']
  },
  {
    date: '2024-11-21',
    predictedPulseCompletionRate: 0.70,
    predictedClassPulseParticipation: 0.62,
    predictedAssignmentCompletionRate: 0.75,
    predictedSentiment: 4.5,
    confidenceLevel: 0.68,
    forecastType: 'predicted',
    influencingFactors: ['Thanksgiving week - reduced activity', 'Travel period']
  },
  {
    date: '2024-11-22',
    predictedPulseCompletionRate: 0.65,
    predictedClassPulseParticipation: 0.58,
    predictedAssignmentCompletionRate: 0.70,
    predictedSentiment: 4.7,
    confidenceLevel: 0.65,
    forecastType: 'predicted',
    influencingFactors: ['Thanksgiving break', 'Very low academic activity']
  },
  {
    date: '2024-11-23',
    predictedPulseCompletionRate: 0.68,
    predictedClassPulseParticipation: 0.60,
    predictedAssignmentCompletionRate: 0.72,
    predictedSentiment: 4.6,
    confidenceLevel: 0.62,
    forecastType: 'predicted',
    influencingFactors: ['Return from break', 'Gradual re-engagement']
  },
];

// Weekly AI Summary Reports (last 4 weeks)
export const mockWeeklyAISummaryReports: WeeklyAISummaryReport[] = [
  {
    weekStartDate: '2024-11-04',
    weekEndDate: '2024-11-10',
    executiveSummary: {
      keyInsight1: 'Student sentiment increased 8% this week following successful implementation of new study group programs',
      keyInsight2: '23 students flagged as academically at-risk, requiring immediate intervention',
      keyInsight3: 'Computer Science and Biology departments showing exceptional improvement in engagement metrics'
    },
    academicPerformance: {
      gradesTrend: 'improving',
      gradesTrendPercentage: 2.4,
      topPerformingDepartments: ['Computer Science (+2.9%)', 'Biology (+3.2%)', 'Business (+2.8%)'],
      strugglingDepartments: ['Mathematics (-1.6%)', 'Chemistry (-1.0%)'],
      details: 'Overall GPA up 2.4% compared to previous period. Computer Science leading with 2.9% improvement driven by enhanced lab resources. Mathematics department requires attention with 1.6% decline attributed to reduced office hours attendance in upper-level courses.'
    },
    emotionalWellbeing: {
      sentimentTrend: 'improving',
      sentimentTrendPercentage: 8.0,
      averageSentiment: 4.5,
      atRiskStudentCount: 23,
      positiveHighlights: [
        'New wellness initiatives showing 15% increase in positive check-ins',
        'Peer recognition (Hapi Moments) up 22% this week',
        'Office hours utilization increased 18%'
      ],
      details: 'Significant improvement in student wellbeing metrics. Average sentiment rose from 4.1 to 4.5 (8% increase). At-risk student count down from 31 to 23. Major contributors: expanded mental health resources, successful peer tutoring program launch, and positive response to new study spaces.'
    },
    engagementMetrics: {
      platformUsagePercentage: 87,
      teacherEngagementRate: 0.91,
      studentParticipationRate: 0.84,
      highlights: [
        'Daily pulse check completion rate: 84% (up from 78%)',
        'Class pulse responses: 91% participation',
        'Teacher engagement at all-time high (91%)',
        'Hapi Moments exchanges increased 22%'
      ],
      details: 'Strong engagement across all metrics. Platform usage up 5% week-over-week. Teachers particularly active with 91% creating at least one class pulse. Student participation in Hapi Moments exceeded expectations with 22% growth, indicating strong peer connection culture.'
    },
    actionItems: [
      {
        priority: 'high',
        action: 'Follow up with 12 cross-risk students (low sentiment + declining grades)',
        affectedStudents: 12,
        deadline: '2024-11-17'
      },
      {
        priority: 'high',
        action: 'Provide additional support resources for Mathematics department (1.6% decline)',
        deadline: '2024-11-20'
      },
      {
        priority: 'medium',
        action: 'Schedule intervention meetings for 11 students with 5+ missed assignments',
        affectedStudents: 11,
        deadline: '2024-11-22'
      },
      {
        priority: 'medium',
        action: 'Expand successful CS lab hours model to Chemistry department',
        deadline: '2024-11-30'
      },
      {
        priority: 'low',
        action: 'Recognize top 5 teachers with highest sentiment improvement',
        deadline: '2024-11-24'
      }
    ],
    lookingAhead: {
      upcomingEvents: [
        'Thanksgiving Break (Nov 25-29) - expect reduced activity',
        'Final projects due Week 14 (Dec 9) - prepare for stress spike',
        'Reading Week 15 (Dec 16) - plan wellness activities'
      ],
      predictedChallenges: [
        'Pre-Thanksgiving stress expected Week 12 (Nov 18-22) - sentiment may dip 8-12%',
        'Final project submissions in 4 weeks - workload will increase significantly',
        'Winter season affecting mood - consider additional wellness support'
      ],
      recommendations: [
        'Schedule proactive check-ins with at-risk students before Thanksgiving break',
        'Prepare academic support resources for final project period (Weeks 13-14)',
        'Consider implementing "Wellness Wednesdays" during high-stress weeks',
        'Expand successful interventions from CS and Biology to other departments',
        'Maintain momentum on peer tutoring and study group programs'
      ]
    }
  },
  {
    weekStartDate: '2024-10-28',
    weekEndDate: '2024-11-03',
    executiveSummary: {
      keyInsight1: 'Major project deadlines resulted in 12% sentiment drop but strong completion rates (91%)',
      keyInsight2: '18 new students identified as at-risk following midterm results',
      keyInsight3: 'Business department launched innovative case study program with immediate positive impact'
    },
    academicPerformance: {
      gradesTrend: 'stable',
      gradesTrendPercentage: 0.3,
      topPerformingDepartments: ['Business (+2.1%)', 'Psychology (+1.2%)'],
      strugglingDepartments: ['History (-1.5%)', 'Chemistry (-0.8%)'],
      details: 'Academic performance remained relatively stable during high-workload week. Despite major project deadlines, students maintained 91% completion rate. Business department new case study approach showing early promise with 2.1% grade improvement.'
    },
    emotionalWellbeing: {
      sentimentTrend: 'declining',
      sentimentTrendPercentage: -12.0,
      averageSentiment: 4.1,
      atRiskStudentCount: 31,
      positiveHighlights: [
        'High resilience despite heavy workload',
        'Peer support networks actively utilized',
        'Office hours attendance up 15%'
      ],
      details: 'Expected sentiment decline during major project week (4.1 vs 4.6 previous week). Important note: decline is seasonal/predictable rather than systemic. Students showing good coping mechanisms with increased peer support and office hours usage. 31 students at-risk, up from 23.'
    },
    engagementMetrics: {
      platformUsagePercentage: 82,
      teacherEngagementRate: 0.88,
      studentParticipationRate: 0.79,
      highlights: [
        'Despite stress, 79% pulse completion maintained',
        'Class pulse responses steady at 88%',
        'Office hours bookings increased 15%'
      ],
      details: 'Engagement metrics held strong despite challenging week. Platform usage at 82% shows students still actively seeking support. Teachers responsive with 88% engagement rate. Positive sign: students proactively using resources during high-stress period.'
    },
    actionItems: [
      {
        priority: 'high',
        action: 'Immediate outreach to 18 newly identified at-risk students',
        affectedStudents: 18,
        deadline: '2024-11-10'
      },
      {
        priority: 'medium',
        action: 'Analyze History department decline and implement support plan',
        deadline: '2024-11-15'
      },
      {
        priority: 'medium',
        action: 'Document and scale Business dept case study success to other departments',
        deadline: '2024-11-20'
      },
      {
        priority: 'low',
        action: 'Survey students on project deadline management and workload distribution',
        deadline: '2024-11-18'
      }
    ],
    lookingAhead: {
      upcomingEvents: [
        'Recovery period expected (Nov 4-10)',
        'Veterans Day (Nov 11) - possible lighter schedule',
        'Thanksgiving prep begins Week 12'
      ],
      predictedChallenges: [
        'Student fatigue following intense project week - monitor sentiment recovery',
        'Approaching Thanksgiving break may cause mid-November engagement dip',
        'At-risk student count elevated - requires sustained intervention'
      ],
      recommendations: [
        'Implement "recovery week" with lighter assignments (Nov 4-10)',
        'Continue high-touch support for 31 at-risk students',
        'Celebrate project completion successes to boost morale',
        'Plan ahead for Thanksgiving week reduced activity',
        'Share Business department innovations in faculty meeting'
      ]
    }
  }
];

// Helper functions
export function getForecastForDateRange(startDate: string, endDate: string): EngagementForecast[] {
  return mockEngagementForecast.filter(
    (forecast) => forecast.date >= startDate && forecast.date <= endDate
  );
}

export function getPredictedData(): EngagementForecast[] {
  return mockEngagementForecast.filter((f) => f.forecastType === 'predicted');
}

export function getHistoricalData(): EngagementForecast[] {
  return mockEngagementForecast.filter((f) => f.forecastType === 'historical');
}

export function getLatestWeeklySummary(): WeeklyAISummaryReport {
  return mockWeeklyAISummaryReports[0];
}

export function getLowConfidencePredictions(threshold: number = 0.75): EngagementForecast[] {
  return mockEngagementForecast.filter(
    (f) => f.forecastType === 'predicted' && f.confidenceLevel < threshold
  );
}

export function getEngagementAlerts(): string[] {
  const alerts: string[] = [];
  const predictions = getPredictedData();

  predictions.forEach((forecast) => {
    if (forecast.predictedPulseCompletionRate < 0.60) {
      alerts.push(
        `⚠️ Low pulse completion predicted for ${forecast.date}: ${(forecast.predictedPulseCompletionRate * 100).toFixed(0)}%`
      );
    }
    if (forecast.predictedSentiment < 3.5) {
      alerts.push(
        `⚠️ Low sentiment predicted for ${forecast.date}: ${forecast.predictedSentiment.toFixed(1)}/6`
      );
    }
  });

  return alerts;
}
