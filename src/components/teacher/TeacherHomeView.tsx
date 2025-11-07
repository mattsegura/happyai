import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { ClassSentimentDial } from './ClassSentimentDial';
import { ClassAverageSentimentChart } from './ClassAverageSentimentChart';
import { ClassPulseSummary } from './ClassPulseSummary';
import { calculatePulseStatistics, getActivePulses } from '../../lib/pulseUtils';
import { useAuth } from '../../contexts/AuthContext';
import { getAtRiskCounts } from '../../lib/alerts/atRiskDetection';
import { MOCK_STUDENT_IDS, MOCK_CLASS_IDS } from '../../lib/mockStudentIds';

// TODO: Fetch from Supabase - Using mock data for now
const mockTeacherClasses: any[] = [
  {
    id: MOCK_CLASS_IDS.PSYCHOLOGY,
    name: 'Introduction to Psychology',
    description: 'PSYCH 101 - Fall 2024',
    teacher_name: 'You',
    class_code: 'PSYCH101',
  },
  {
    id: MOCK_CLASS_IDS.ENGLISH,
    name: 'English Literature',
    description: 'ENG 201 - Fall 2024',
    teacher_name: 'You',
    class_code: 'ENG201',
  },
  {
    id: MOCK_CLASS_IDS.HISTORY,
    name: 'World History',
    description: 'HIST 101 - Fall 2024',
    teacher_name: 'You',
    class_code: 'HIST101',
  },
];

const mockClassRosters: any = {
  [MOCK_CLASS_IDS.PSYCHOLOGY]: [
    {
      user_id: MOCK_STUDENT_IDS.ALEX_JOHNSON,
      full_name: 'Alex Johnson',
      email: 'alex.j@school.edu',
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString().split('T')[0], // 2 hours ago
      recent_emotions: ['happy', 'hopeful', 'calm'],
    },
    {
      user_id: MOCK_STUDENT_IDS.SARAH_MARTINEZ,
      full_name: 'Sarah Martinez',
      email: 'sarah.m@school.edu',
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['excited', 'grateful', 'happy'],
    },
    {
      user_id: MOCK_STUDENT_IDS.MICHAEL_CHEN,
      full_name: 'Michael Chen',
      email: 'michael.c@school.edu',
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0], // 4 days ago
      recent_emotions: ['stressed', 'anxious', 'tired'],
    },
    {
      user_id: MOCK_STUDENT_IDS.EMILY_RODRIGUEZ,
      full_name: 'Emily Rodriguez',
      email: 'emily.r@school.edu',
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['calm', 'hopeful', 'happy'],
    },
  ],
  [MOCK_CLASS_IDS.ENGLISH]: [
    {
      user_id: MOCK_STUDENT_IDS.DAVID_KIM,
      full_name: 'David Kim',
      email: 'david.k@school.edu',
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['energized', 'excited', 'grateful'],
    },
    {
      user_id: MOCK_STUDENT_IDS.JESSICA_THOMPSON,
      full_name: 'Jessica Thompson',
      email: 'jessica.t@school.edu',
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // 1 day ago
      recent_emotions: ['tired', 'bored', 'nervous'],
    },
  ],
  [MOCK_CLASS_IDS.HISTORY]: [
    {
      user_id: MOCK_STUDENT_IDS.MARCUS_WILLIAMS,
      full_name: 'Marcus Williams',
      email: 'marcus.w@school.edu',
      last_pulse_check: new Date().toISOString().split('T')[0],
      recent_emotions: ['happy', 'calm', 'hopeful'],
    },
    {
      user_id: MOCK_STUDENT_IDS.SOPHIA_LEE,
      full_name: 'Sophia Lee',
      email: 'sophia.l@school.edu',
      last_pulse_check: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // 5 days ago
      recent_emotions: ['sad', 'stressed', 'anxious'],
    },
  ],
};

const mockClassPulses: any[] = [
  {
    id: 'pulse-1',
    class_id: MOCK_CLASS_IDS.PSYCHOLOGY,
    question: 'How are you feeling about the upcoming exam?',
    question_type: 'multiple_choice',
    answer_choices: ['Confident', 'Nervous', 'Not sure'],
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // expires tomorrow
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

type StudentRoster = any;

const emotionValues: Record<string, number> = {
  'happy': 5, 'excited': 5, 'grateful': 4.5, 'hopeful': 4.5,
  'calm': 4, 'energized': 4, 'neutral': 3,
  'tired': 2.5, 'nervous': 2, 'anxious': 2, 'stressed': 1.5, 'sad': 1,
};


interface TeacherHomeViewProps {
  onNavigateToLab?: (pulseId?: string) => void;
}

export function TeacherHomeView({ onNavigateToLab }: TeacherHomeViewProps = {}) {
  const { user } = useAuth();
  const [alertCounts, setAlertCounts] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    emotional: 0,
    academic: 0,
    crossRisk: 0,
  });
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    loadAlertCounts();
  }, [user]);

  async function loadAlertCounts() {
    if (!user) return;

    setIsLoadingAlerts(true);
    try {
      const counts = await getAtRiskCounts(user.id);
      setAlertCounts(counts);
    } catch (error) {
      console.error('Error loading alert counts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  }

  const getClassSentiment = (classId: string) => {
    const roster = mockClassRosters[classId] || [];
    if (roster.length === 0) return { avg: 0, studentCount: 0, topEmotions: [] };

    const todayStr = new Date().toISOString().split('T')[0];
    const todayChecks = roster.filter(s => s.last_pulse_check === todayStr);

    if (todayChecks.length === 0) {
      return { avg: 0, studentCount: roster.length, topEmotions: [] };
    }

    const emotionCounts: Record<string, number> = {};
    let totalValue = 0;

    todayChecks.forEach(student => {
      if (student.recent_emotions && student.recent_emotions.length > 0) {
        const latestEmotion = student.recent_emotions[0];
        emotionCounts[latestEmotion] = (emotionCounts[latestEmotion] || 0) + 1;
        totalValue += emotionValues[latestEmotion] || 3;
      }
    });

    const avgSentiment = todayChecks.length > 0 ? totalValue / todayChecks.length : 3;

    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      avg: avgSentiment,
      studentCount: roster.length,
      topEmotions,
    };
  };

  const getClassPulseData = (classId: string) => {
    const roster = mockClassRosters[classId] || [];
    const statistics = calculatePulseStatistics(classId, mockClassPulses, roster);
    const activePulses = getActivePulses(classId, mockClassPulses);

    return {
      activePulses,
      totalStudents: statistics.totalStudents,
      responded: statistics.responded,
      missing: statistics.missing,
      topAnswers: statistics.topAnswers,
    };
  };

  const getAtRiskStudents = (): (StudentRoster & { className: string; riskType: string })[] => {
    const atRisk: (StudentRoster & { className: string; riskType: string })[] = [];

    mockTeacherClasses.forEach(cls => {
      const roster = mockClassRosters[cls.id] || [];
      roster.forEach(student => {
        const daysSinceCheck = student.last_pulse_check
          ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const negativeEmotions = ['sad', 'anxious', 'stressed', 'nervous'];
        const recentNegative = student.recent_emotions.filter(e => negativeEmotions.includes(e)).length;

        if (daysSinceCheck >= 3) {
          atRisk.push({
            ...student,
            className: cls.name,
            riskType: 'Missing Pulse Checks',
          });
        } else if (recentNegative >= 3) {
          atRisk.push({
            ...student,
            className: cls.name,
            riskType: 'Negative Sentiment Pattern',
          });
        }
      });
    });

    return atRisk;
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Class Overview</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Real-time sentiment snapshot from today's pulse checks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mockTeacherClasses.map(cls => {
          const sentiment = getClassSentiment(cls.id);

          return (
            <ClassSentimentDial
              key={cls.id}
              className={cls.name}
              studentCount={sentiment.studentCount}
              averageSentiment={sentiment.avg}
              topEmotions={sentiment.topEmotions}
            />
          );
        })}
      </div>

      <ClassAverageSentimentChart />

      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">Class Pulse Questionnaires</h3>
          {onNavigateToLab && (
            <button
              onClick={() => onNavigateToLab()}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
            >
              View All in Hapi Lab →
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {mockTeacherClasses.map(cls => {
            const pulseData = getClassPulseData(cls.id);

            return (
              <ClassPulseSummary
                key={cls.id}
                className={cls.name}
                totalStudents={pulseData.totalStudents}
                responded={pulseData.responded}
                missing={pulseData.missing}
                activePulses={pulseData.activePulses}
                topAnswers={pulseData.topAnswers}
                onViewDetails={onNavigateToLab}
              />
            );
          })}
        </div>
      </div>

      {/* Care Alerts Summary Card */}
      {!isLoadingAlerts && alertCounts.total > 0 && (
        <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Care Alerts Active</h3>
                <p className="text-sm text-muted-foreground">Students requiring attention</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{alertCounts.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Alerts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{alertCounts.critical}</p>
              <p className="text-xs text-muted-foreground mt-1">Critical</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{alertCounts.emotional}</p>
              <p className="text-xs text-muted-foreground mt-1">Emotional</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{alertCounts.academic}</p>
              <p className="text-xs text-muted-foreground mt-1">Academic</p>
            </div>
          </div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // This will trigger the parent to change view to 'alerts'
              // For now, just show a message
              window.alert('Navigate to Care Alerts dashboard to view all alerts');
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition shadow-md"
          >
            <TrendingUp className="h-5 w-5" />
            View All Care Alerts
          </a>
        </div>
      )}
    </div>
  );
}
