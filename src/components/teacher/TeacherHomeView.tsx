import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Heart, Users, Target, Activity, Sparkles } from 'lucide-react';
import { ClassSentimentDial } from './ClassSentimentDial';
import { ClassAverageSentimentChart } from './ClassAverageSentimentChart';
import { ClassPulseSummary } from './ClassPulseSummary';
import { calculatePulseStatistics, getActivePulses } from '../../lib/pulseUtils';
import { useAuth } from '../../contexts/AuthContext';
import { getAtRiskCounts } from '../../lib/alerts/atRiskDetection';
import { MOCK_STUDENT_IDS, MOCK_CLASS_IDS } from '../../lib/mockStudentIds';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

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
    const todayChecks = roster.filter((s: any) => s.last_pulse_check === todayStr);

    if (todayChecks.length === 0) {
      return { avg: 0, studentCount: roster.length, topEmotions: [] };
    }

    const emotionCounts: Record<string, number> = {};
    let totalValue = 0;

    todayChecks.forEach((student: any) => {
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

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Compact Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Good morning, Teacher! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
      </motion.div>

      {/* Main Dashboard Grid - Optimized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Class Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Class Sentiment Today</h2>
              <p className="text-xs text-muted-foreground">Real-time emotional wellness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {mockTeacherClasses.map((cls, index) => {
              const sentiment = getClassSentiment(cls.id);
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <ClassSentimentDial
                    className={cls.name}
                    studentCount={sentiment.studentCount}
                    averageSentiment={sentiment.avg}
                    topEmotions={sentiment.topEmotions}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column - Pulse Checks & Stats */}
        <div className="space-y-4">
          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                <p className="text-2xl font-bold text-foreground">{mockTeacherClasses.length}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1" />
                <p className="text-2xl font-bold text-foreground">
                  {mockTeacherClasses.reduce((sum, cls) => sum + (mockClassRosters[cls.id]?.length || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </motion.div>

          {/* Active Pulse Checks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Active Pulses</h2>
                  <p className="text-xs text-muted-foreground">Engagement overview</p>
                </div>
              </div>
              {onNavigateToLab && (
                <button
                  onClick={() => onNavigateToLab()}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1"
                >
                  View All
                  <TrendingUp className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {mockTeacherClasses.map((cls, index) => {
                const pulseData = getClassPulseData(cls.id);
                return (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <ClassPulseSummary
                      className={cls.name}
                      totalStudents={pulseData.totalStudents}
                      responded={pulseData.responded}
                      missing={pulseData.missing}
                      activePulses={pulseData.activePulses}
                      topAnswers={pulseData.topAnswers}
                      onViewDetails={onNavigateToLab}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row - Chart and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Average Sentiment Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ClassAverageSentimentChart />
        </motion.div>

        {/* Care Alerts & Tips Column */}
        <div className="space-y-4">
          {/* Care Alerts Card - Styled like Student Notifications */}
          {!isLoadingAlerts && alertCounts.total > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-rose-200/60 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-950/20 dark:to-orange-950/20 backdrop-blur-sm shadow-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 dark:bg-rose-500/20">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Care Alerts</h3>
                  <p className="text-xs text-muted-foreground">Students need attention</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <p className="text-2xl font-bold bg-gradient-to-br from-rose-600 to-orange-600 bg-clip-text text-transparent">
                    {alertCounts.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{alertCounts.critical}</p>
                  <p className="text-xs text-muted-foreground mt-1">Critical</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.alert('Navigate to Care Alerts dashboard to view all alerts');
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                View All Alerts
              </button>
            </motion.div>
          )}

          {/* Wellness Tip Card - Matching Student Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-lg p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-semibold text-foreground">Teacher Tip</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Students with consistent check-ins show 40% better emotional resilience. Encourage daily participation!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
