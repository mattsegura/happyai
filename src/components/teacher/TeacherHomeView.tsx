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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Class Overview</h2>
        <p className="text-sm sm:text-base text-gray-600">Real-time sentiment snapshot from today's pulse checks</p>
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
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Class Pulse Questionnaires</h3>
          {onNavigateToLab && (
            <button
              onClick={() => onNavigateToLab()}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-300"
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
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-red-200 shadow-lg">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Students at Risk</h3>
              <p className="text-xs sm:text-sm text-gray-600">These students may need your attention</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {atRiskStudents.map(student => (
              <div key={`${student.user_id}-${student.className}`} className="bg-white rounded-xl p-3 sm:p-4 border-2 border-orange-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-800">{student.full_name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{student.className}</p>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-full text-[10px] sm:text-xs font-semibold">
                    At Risk
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Issue:</span>
                    <span className="font-semibold text-gray-800 text-right text-[11px] sm:text-sm">{student.riskType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Last Check:</span>
                    <span className="font-semibold text-gray-800">
                      {student.last_pulse_check
                        ? Math.floor((Date.now() - new Date(student.last_pulse_check).getTime()) / (1000 * 60 * 60 * 24)) + 'd ago'
                        : 'Never'}
                    </span>
                  </div>
                  <button className="w-full mt-1 sm:mt-2 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                    Reach Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
