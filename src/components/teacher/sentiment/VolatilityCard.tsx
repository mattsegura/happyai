import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateEmotionalVolatility, VolatilityResult } from '../../../lib/analytics/sentimentAnalytics';

interface VolatilityCardProps {
  classId: string;
  className: string;
}

export function VolatilityCard({ classId, className }: VolatilityCardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month');
  const [volatility, setVolatility] = useState<VolatilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadVolatility();
  }, [classId, period]);

  const loadVolatility = async () => {
    setLoading(true);
    try {
      const data = await calculateEmotionalVolatility(classId, period);
      setVolatility(data);
    } catch (error) {
      console.error('Error loading volatility:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVolatilityColor = (level: VolatilityResult['level']) => {
    switch (level) {
      case 'low':
        return 'from-green-400 to-emerald-600';
      case 'medium':
        return 'from-blue-400 to-cyan-600';
      case 'high':
        return 'from-orange-400 to-amber-600';
      case 'extreme':
        return 'from-red-400 to-rose-600';
      default:
        return 'from-gray-400 to-slate-600';
    }
  };

  const getVolatilityBg = (level: VolatilityResult['level']) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 dark:bg-green-500/10';
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-500/10';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-500/10';
      case 'extreme':
        return 'bg-red-50 dark:bg-red-500/10';
      default:
        return 'bg-gray-50 dark:bg-gray-500/10';
    }
  };

  const getVolatilityTextColor = (level: VolatilityResult['level']) => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'extreme':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getVolatilityIcon = (level: VolatilityResult['level']) => {
    const iconClass = `w-5 h-5 ${getVolatilityTextColor(level)}`;
    switch (level) {
      case 'extreme':
        return <Activity className={`${iconClass} animate-pulse`} />;
      case 'high':
        return <TrendingUp className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4 animate-pulse"
      >
        <div className="h-48 bg-muted rounded-lg" />
      </motion.div>
    );
  }

  if (!volatility) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
      >
        <p className="text-muted-foreground text-center text-[10px]">No volatility data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getVolatilityColor(volatility.level)} opacity-10 blur-3xl rounded-full`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center`}>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Emotional Volatility</h3>
            <p className="text-[10px] text-muted-foreground">{className}</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-background/50 dark:hover:bg-card/50 rounded-lg transition-all duration-200"
        >
          <Info className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-4 bg-background/50 dark:bg-card/50 rounded-lg border border-border relative z-10"
        >
          <h4 className="text-sm font-bold text-foreground mb-2">What is Emotional Volatility?</h4>
          <p className="text-[10px] text-muted-foreground mb-2">
            Measures how much student emotions fluctuate day-to-day using standard deviation (SD).
          </p>
          <ul className="text-[10px] text-muted-foreground space-y-1">
            <li>• <span className="text-green-600 dark:text-green-400 font-semibold">Low (SD 0-0.5):</span> Very stable emotions</li>
            <li>• <span className="text-blue-600 dark:text-blue-400 font-semibold">Medium (SD 0.5-1.0):</span> Normal fluctuation</li>
            <li>• <span className="text-orange-600 dark:text-orange-400 font-semibold">High (SD 1.0-1.5):</span> Significant mood swings</li>
            <li>• <span className="text-red-600 dark:text-red-400 font-semibold">Extreme (SD &gt;1.5):</span> Major volatility</li>
          </ul>
        </motion.div>
      )}

      {/* Time Range Selector */}
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

      {/* Main Volatility Display */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-3"
        >
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getVolatilityColor(volatility.level)} shadow-lg mb-3`}>
            <div className="w-20 h-20 rounded-full bg-background dark:bg-card flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getVolatilityTextColor(volatility.level)}`}>
                {volatility.standardDeviation.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">SD</span>
            </div>
          </div>

          <div className={`inline-block px-3 py-1 rounded-full font-semibold text-[10px] ${getVolatilityBg(volatility.level)} ${getVolatilityTextColor(volatility.level)} border ${
            volatility.level === 'low' ? 'border-green-200 dark:border-green-500/30' :
            volatility.level === 'medium' ? 'border-blue-200 dark:border-blue-500/30' :
            volatility.level === 'high' ? 'border-orange-200 dark:border-orange-500/30' :
            'border-red-200 dark:border-red-500/30'
          }`}>
            {volatility.level.charAt(0).toUpperCase() + volatility.level.slice(1)} Volatility
          </div>
        </motion.div>

        {/* Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-background/50 dark:bg-card/50 rounded-xl border border-border"
        >
          <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Interpretation
          </h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {volatility.interpretation}
          </p>
        </motion.div>

        {/* Visual Reference Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3"
        >
          <div className="relative h-2 bg-gradient-to-r from-green-400 via-blue-400 via-orange-400 to-red-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${Math.min((volatility.standardDeviation / 2) * 100, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="absolute top-0 w-1 h-full bg-foreground border-2 border-background dark:border-card"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
            <span>1.5</span>
            <span>2.0+</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
