import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Award } from 'lucide-react';
import { calculateRecoveryRate, RecoveryRateResult } from '../../../lib/analytics/sentimentAnalytics';
import { useAuth } from '../../../contexts/AuthContext';

interface RecoveryRateCardProps {
  period?: 'month' | '3months' | 'semester';
}

export function RecoveryRateCard({ period = 'month' }: RecoveryRateCardProps) {
  const { user } = useAuth();
  const [recovery, setRecovery] = useState<RecoveryRateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | '3months' | 'semester'>(period);

  useEffect(() => {
    loadRecoveryRate();
  }, [selectedPeriod, user?.id]);

  const loadRecoveryRate = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await calculateRecoveryRate(user.id, selectedPeriod);
      setRecovery(data);
    } catch (error) {
      console.error('Error loading recovery rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecoveryColor = (rate: number) => {
    if (rate >= 75) return 'from-green-400 to-emerald-600';
    if (rate >= 60) return 'from-blue-400 to-cyan-600';
    if (rate >= 45) return 'from-yellow-400 to-amber-600';
    return 'from-orange-400 to-red-600';
  };

  const getRecoveryTextColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 45) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getRecoveryBg = (rate: number) => {
    if (rate >= 75) return 'bg-green-50 dark:bg-green-500/10';
    if (rate >= 60) return 'bg-blue-50 dark:bg-blue-500/10';
    if (rate >= 45) return 'bg-yellow-50 dark:bg-yellow-500/10';
    return 'bg-orange-50 dark:bg-orange-500/10';
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg animate-pulse">
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!recovery) {
    return (
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
        <p className="text-muted-foreground text-center">No recovery data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${getRecoveryBg(recovery.recoveryRate)} rounded-2xl p-6 border-2 border-border shadow-lg relative overflow-hidden`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getRecoveryColor(recovery.recoveryRate)} opacity-10 blur-3xl rounded-full`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${getRecoveryBg(recovery.recoveryRate)}`}>
            <Heart className={`w-6 h-6 ${getRecoveryTextColor(recovery.recoveryRate)}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Emotional Recovery Rate</h3>
            <p className="text-sm text-muted-foreground">Impact of your interventions</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex bg-background/50 dark:bg-card/50 rounded-lg p-1 mb-6 relative z-10">
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            selectedPeriod === 'month'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setSelectedPeriod('3months')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            selectedPeriod === '3months'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          3 Months
        </button>
        <button
          onClick={() => setSelectedPeriod('semester')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            selectedPeriod === 'semester'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Semester
        </button>
      </div>

      {/* Main Recovery Display */}
      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getRecoveryColor(recovery.recoveryRate)} shadow-lg mb-4`}>
            <div className="w-28 h-28 rounded-full bg-background dark:bg-card flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getRecoveryTextColor(recovery.recoveryRate)}`}>
                {recovery.recoveryRate.toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Recovery</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Successful</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{recovery.successfulRecoveries}</div>
            <div className="text-xs text-muted-foreground">out of {recovery.totalInterventions}</div>
          </div>

          <div className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Days</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{recovery.averageDaysToRecovery.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">to recovery</div>
          </div>
        </div>

        {/* Recovery by Intervention Type */}
        <div className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
          <h4 className="font-semibold text-foreground mb-4">Effectiveness by Type</h4>
          <div className="space-y-3">
            {recovery.byInterventionType.slice(0, 4).map((intervention, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{intervention.type}</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${getRecoveryTextColor(intervention.rate)}`}>
                      {intervention.rate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (~{intervention.avgDays.toFixed(1)}d)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getRecoveryColor(intervention.rate)} transition-all duration-500`}
                    style={{ width: `${intervention.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement Message */}
        {recovery.recoveryRate >= 75 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
              🎉 Excellent recovery rate! Your interventions are making a real difference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
