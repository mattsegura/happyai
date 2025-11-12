import { useState, useEffect } from 'react';
import { PieChart, Smile, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculatePositiveSentimentRatio, PositiveSentimentRatioResult } from '../../../lib/analytics/sentimentAnalytics';

interface PositiveRatioCardProps {
  classId: string;
  className: string;
}

export function PositiveRatioCard({ classId, className }: PositiveRatioCardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month');
  const [ratio, setRatio] = useState<PositiveSentimentRatioResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatio();
  }, [classId, period]);

  const loadRatio = async () => {
    setLoading(true);
    try {
      const data = await calculatePositiveSentimentRatio(classId, period);
      setRatio(data);
    } catch (error) {
      console.error('Error loading positive ratio:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: PositiveSentimentRatioResult['level']) => {
    switch (level) {
      case 'excellent':
        return 'from-teal-400 to-cyan-600';
      case 'healthy':
        return 'from-green-400 to-emerald-600';
      case 'moderate':
        return 'from-yellow-400 to-amber-600';
      case 'concerning':
        return 'from-orange-400 to-red-600';
      default:
        return 'from-gray-400 to-slate-600';
    }
  };

  const getLevelTextColor = (level: PositiveSentimentRatioResult['level']) => {
    switch (level) {
      case 'excellent':
        return 'text-teal-600 dark:text-teal-400';
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'concerning':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLevelBg = (level: PositiveSentimentRatioResult['level']) => {
    switch (level) {
      case 'excellent':
        return 'bg-teal-50 dark:bg-teal-500/10';
      case 'healthy':
        return 'bg-green-50 dark:bg-green-500/10';
      case 'moderate':
        return 'bg-yellow-50 dark:bg-yellow-500/10';
      case 'concerning':
        return 'bg-orange-50 dark:bg-orange-500/10';
      default:
        return 'bg-gray-50 dark:bg-gray-500/10';
    }
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

  if (!ratio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <p className="text-muted-foreground text-center text-[10px]">No ratio data available</p>
      </motion.div>
    );
  }

  // Calculate pie chart angles
  const positiveAngle = (ratio.positivePercentage / 100) * 360;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const positiveDash = (positiveAngle / 360) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getLevelColor(ratio.level)} opacity-10 blur-3xl rounded-full`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Positive Sentiment Ratio</h3>
            <p className="text-[10px] text-muted-foreground">{className}</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex bg-background/50 dark:bg-card/50 rounded-lg p-1 mb-3 relative z-10">
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            period === 'week'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            period === 'month'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setPeriod('3months')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
            period === '3months'
              ? 'bg-background dark:bg-card text-blue-600 shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          3 Months
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Large Ratio Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-3"
        >
          <div className={`text-5xl font-bold ${getLevelTextColor(ratio.level)} mb-2`}>
            {ratio.ratioString}
          </div>
          <div className={`inline-block px-3 py-1 rounded-full font-semibold text-[10px] ${getLevelBg(ratio.level)} ${getLevelTextColor(ratio.level)} border ${
            ratio.level === 'excellent' ? 'border-teal-200 dark:border-teal-500/30' :
            ratio.level === 'healthy' ? 'border-green-200 dark:border-green-500/30' :
            ratio.level === 'moderate' ? 'border-yellow-200 dark:border-yellow-500/30' :
            'border-orange-200 dark:border-orange-500/30'
          }`}>
            {ratio.level.charAt(0).toUpperCase() + ratio.level.slice(1)}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <div className="flex justify-center mb-3">
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted dark:text-muted/30"
              />

              {/* Positive section (green/teal) */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#positiveGradient)"
                strokeWidth="10"
                strokeDasharray={`${positiveDash} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {ratio.positivePercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Positive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-3"
        >
          <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Smile className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Positive (4-6)</span>
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{ratio.positiveCount}</div>
            <div className="text-[10px] text-muted-foreground">{ratio.positivePercentage.toFixed(1)}% of total</div>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Frown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Negative (1-3)</span>
            </div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{ratio.negativeCount}</div>
            <div className="text-[10px] text-muted-foreground">{ratio.negativePercentage.toFixed(1)}% of total</div>
          </div>
        </motion.div>

        {/* Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border"
        >
          <h4 className="text-sm font-bold text-foreground mb-2">What this means</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {ratio.level === 'excellent' && (
              <>Exceptional emotional health! Your class has an outstanding positive-to-negative sentiment ratio. Students are thriving.</>
            )}
            {ratio.level === 'healthy' && (
              <>Great job! Your class maintains a healthy balance with more positive than negative sentiments. This is the recommended target.</>
            )}
            {ratio.level === 'moderate' && (
              <>Your class shows moderate sentiment balance. Consider strategies to boost positive emotions and address concerns.</>
            )}
            {ratio.level === 'concerning' && (
              <>Low positive-to-negative ratio detected. Students may need additional support and engagement. Consider interventions.</>
            )}
          </p>
        </motion.div>

        {/* Reference Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 p-3 bg-background/50 dark:bg-card/50 rounded-lg border border-border"
        >
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ratio Targets</h5>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>• <span className="text-teal-600 dark:text-teal-400 font-semibold">≥4:1</span> = Excellent</div>
            <div>• <span className="text-green-600 dark:text-green-400 font-semibold">≥3:1</span> = Healthy (Target)</div>
            <div>• <span className="text-yellow-600 dark:text-yellow-400 font-semibold">1.5-3:1</span> = Moderate</div>
            <div>• <span className="text-orange-600 dark:text-orange-400 font-semibold">&lt;1.5:1</span> = Concerning</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
