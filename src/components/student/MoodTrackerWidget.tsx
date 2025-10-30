import { useState } from 'react';
import { mockSentimentHistory } from '../../lib/mockData';
import { calculateMoodVariability } from '../../lib/studentCalculations';
import { Heart, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

type TimeRange = '7' | '30' | 'custom';

export function MoodTrackerWidget() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [customDays, setCustomDays] = useState(14);

  const getDaysToShow = () => {
    if (timeRange === 'custom') return customDays;
    return parseInt(timeRange);
  };

  const daysToShow = getDaysToShow();
  const moodData = mockSentimentHistory.slice(-daysToShow);
  const { stability, trend } = calculateMoodVariability(moodData);

  const avgIntensity = moodData.length > 0
    ? moodData.reduce((sum, m) => sum + m.intensity, 0) / moodData.length
    : 0;

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'Happy': 'bg-yellow-400',
      'Excited': 'bg-orange-400',
      'Content': 'bg-green-400',
      'Hopeful': 'bg-blue-400',
      'Proud': 'bg-purple-400',
      'Peaceful': 'bg-teal-400',
      'Sad': 'bg-blue-600',
      'Worried': 'bg-gray-500',
      'Frustrated': 'bg-red-500',
      'Tired': 'bg-gray-400',
      'Bored': 'bg-gray-300',
      'Nervous': 'bg-yellow-600',
    };
    return colors[emotion] || 'bg-gray-400';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'declining':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    }
  };

  const maxIntensity = Math.max(...moodData.map(m => m.intensity), 7);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Mood Tracker
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Your emotional wellbeing over time</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTimeRange('7')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '7'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '30'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'custom'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Custom
        </button>
        {timeRange === 'custom' && (
          <input
            type="number"
            min="1"
            max="90"
            value={customDays}
            onChange={(e) => setCustomDays(parseInt(e.target.value) || 14)}
            className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
          <div className="text-xs font-medium text-muted-foreground mb-1">Avg Mood</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {avgIntensity.toFixed(1)}<span className="text-sm">/7</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 ${getTrendColor()}`}>
          <div className="text-xs font-medium text-muted-foreground mb-1">Trend</div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-lg font-bold">{getTrendLabel()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
          <div className="text-xs font-medium text-muted-foreground mb-1">Stability</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(stability)}<span className="text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Daily Mood Intensity</span>
          <span>Scale: 1-7</span>
        </div>
        
        {moodData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No mood data available for this period</p>
            <p className="text-sm mt-1">Complete your daily pulse to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {moodData.map((mood) => {
              const date = new Date(mood.date);
              const percentage = (mood.intensity / maxIntensity) * 100;
              
              return (
                <div key={mood.id} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${getEmotionColor(mood.emotion)} transition-all duration-500 flex items-center px-3`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 30 && (
                          <span className="text-xs font-medium text-white">
                            {mood.emotion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-foreground">
                    {mood.intensity}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Emotional Stability Indicator */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Emotional Stability</span>
          <span className="text-sm font-bold text-foreground">{Math.round(stability)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stability >= 75
                ? 'bg-green-500 dark:bg-green-600'
                : stability >= 50
                ? 'bg-yellow-500 dark:bg-yellow-600'
                : 'bg-red-500 dark:bg-red-600'
            }`}
            style={{ width: `${stability}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stability >= 75
            ? 'Your mood has been very consistent. Great emotional balance!'
            : stability >= 50
            ? 'Your mood shows some variation. This is normal.'
            : 'Your mood has been quite variable. Consider reaching out for support if needed.'}
        </p>
      </div>
    </div>
  );
}
