import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4 animate-pulse"
      >
        <div className="h-96 bg-muted rounded-lg" />
      </motion.div>
    );
  }

  if (!recovery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <p className="text-muted-foreground text-center text-[10px]">No recovery data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getRecoveryColor(recovery.recoveryRate)} opacity-10 blur-3xl rounded-full`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Emotional Recovery Rate</h3>
            <p className="text-[10px] text-muted-foreground">Impact of your interventions</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex bg-background/50 dark:bg-card/50 rounded-lg p-1 mb-3 relative z-10">
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-3"
        >
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getRecoveryColor(recovery.recoveryRate)} shadow-lg mb-3`}>
            <div className="w-20 h-20 rounded-full bg-background dark:bg-card flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getRecoveryTextColor(recovery.recoveryRate)}`}>
                {recovery.recoveryRate.toFixed(0)}%
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Recovery</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-3"
        >
          <div className="p-3 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Successful</span>
            </div>
            <div className="text-xl font-bold text-foreground">{recovery.successfulRecoveries}</div>
            <div className="text-[10px] text-muted-foreground">out of {recovery.totalInterventions}</div>
          </div>

          <div className="p-3 bg-background/50 dark:bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Days</span>
            </div>
            <div className="text-xl font-bold text-foreground">{recovery.averageDaysToRecovery.toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground">to recovery</div>
          </div>
        </motion.div>

        {/* Recovery by Intervention Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border"
        >
          <h4 className="text-sm font-bold text-foreground mb-3">Effectiveness by Type</h4>
          <div className="space-y-3">
            {recovery.byInterventionType.slice(0, 4).map((intervention, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-foreground">{intervention.type}</span>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold ${getRecoveryTextColor(intervention.rate)}`}>
                      {intervention.rate.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      (~{intervention.avgDays.toFixed(1)}d)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${intervention.rate}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className={`h-full bg-gradient-to-r ${getRecoveryColor(intervention.rate)}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Encouragement Message */}
        {recovery.recoveryRate >= 75 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30"
          >
            <p className="text-[10px] text-green-700 dark:text-green-400 font-medium text-center">
              Excellent recovery rate! Your interventions are making a real difference.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
