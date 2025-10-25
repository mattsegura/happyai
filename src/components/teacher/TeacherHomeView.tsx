import { mockTeacherClasses, mockClassRosters, mockClassPulses, StudentRoster } from '../../lib/mockData';
import { AlertCircle } from 'lucide-react';
import { ClassSentimentDial } from './ClassSentimentDial';
import { ClassAverageSentimentChart } from './ClassAverageSentimentChart';
import { ClassPulseSummary } from './ClassPulseSummary';
import { calculatePulseStatistics, getActivePulses } from '../../lib/pulseUtils';

const emotionValues: Record<string, number> = {
  'happy': 5, 'excited': 5, 'grateful': 4.5, 'hopeful': 4.5,
  'calm': 4, 'energized': 4, 'neutral': 3,
  'tired': 2.5, 'nervous': 2, 'anxious': 2, 'stressed': 1.5, 'sad': 1,
};


interface TeacherHomeViewProps {
  onNavigateToLab?: (pulseId?: string) => void;
}

export function TeacherHomeView({ onNavigateToLab }: TeacherHomeViewProps = {}) {
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

  const atRiskStudents = getAtRiskStudents();

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

      {atRiskStudents.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Students flagged for follow up</h3>
              <p className="text-xs text-muted-foreground">Review recent patterns and consider outreach.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {atRiskStudents.map(student => (
              <div key={`${student.user_id}-${student.className}`} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{student.full_name}</h4>
                    <p className="text-xs text-muted-foreground">{student.className}</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">At risk</span>
                </div>
                <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <dt>Focus area</dt>
                    <dd className="max-w-[60%] text-right font-semibold text-foreground">{student.riskType}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Last pulse</dt>
                    <dd className="font-semibold text-foreground">
                      {student.last_pulse_check
                        ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24)) + 'd ago'
                        : 'Never'}
                    </dd>
                  </div>
                </dl>
                <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary-200 hover:text-primary-600 dark:hover:border-primary-800 dark:hover:text-primary-400">
                  Reach out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
