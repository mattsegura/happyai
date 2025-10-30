import { mockParticipationData, mockCombinedParticipation } from '../../lib/mockData';
import { MessageSquare, Trophy, TrendingUp } from 'lucide-react';

export function ParticipationReportWidget() {
  const combined = mockCombinedParticipation;

  const getParticipationColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 75) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-500" />
            Participation Report
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Class pulse engagement across all courses</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
          <div className="text-xs font-medium text-muted-foreground mb-1">Overall Rate</div>
          <div className={`text-2xl font-bold ${getParticipationColor(combined.participation_rate)}`}>
            {combined.participation_rate}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {combined.completed_pulses}/{combined.total_pulses} completed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
          <div className="text-xs font-medium text-muted-foreground mb-1">Total Points</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {combined.total_points_earned}
          </div>
          <div className="text-xs text-muted-foreground mt-1">From participation</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
          <div className="text-xs font-medium text-muted-foreground mb-1">Overall Rank</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            #{combined.overall_rank}
          </div>
          <div className="text-xs text-muted-foreground mt-1">of {combined.total_students} students</div>
        </div>
      </div>

      {/* Per-Class Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Per-Class Breakdown
        </div>

        {mockParticipationData.map((classData) => (
          <div
            key={classData.class_id}
            className="p-4 rounded-xl bg-muted/30 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{classData.class_name}</h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{classData.completed_pulses}/{classData.total_pulses} pulses</span>
                  <span>•</span>
                  <span>{classData.points_earned} points</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Rank #{classData.rank}/{classData.total_students}
                  </span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getParticipationColor(classData.participation_rate)}`}>
                {classData.participation_rate}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  classData.participation_rate >= 90
                    ? 'bg-green-500 dark:bg-green-600'
                    : classData.participation_rate >= 75
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : classData.participation_rate >= 60
                    ? 'bg-yellow-500 dark:bg-yellow-600'
                    : 'bg-red-500 dark:bg-red-600'
                }`}
                style={{ width: `${classData.participation_rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">Participation Insight</div>
            <p className="text-sm text-muted-foreground">
              {combined.participation_rate >= 85
                ? 'Excellent engagement! Your consistent participation is building strong connections with your classes.'
                : combined.participation_rate >= 70
                ? 'Good participation overall. Try to complete more class pulses to boost your engagement score.'
                : 'Your participation could use improvement. Class pulses are quick ways to earn points and stay connected!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
