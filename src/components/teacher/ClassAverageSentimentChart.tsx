import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStaticClassWeekData, getStaticClassMonthData, getStaticClassCustomData } from '../../lib/staticAnalyticsData';

// TODO: Fetch from Supabase
const mockTeacherClasses: any[] = [];

type TimeRange = 'week' | 'month' | 'custom';

function getBlueShade(value: number, isDark: boolean = false): string {
  if (isDark) {
    // Dark mode colors (brighter for contrast)
    if (value >= 5) return '#60a5fa';
    if (value >= 4.5) return '#3b82f6';
    if (value >= 4) return '#2563eb';
    if (value >= 3.5) return '#1d4ed8';
    if (value >= 3) return '#1e40af';
    if (value >= 2.5) return '#1e3a8a';
    if (value >= 2) return '#172554';
    return '#0f172a';
  }
  // Light mode colors
  if (value >= 5) return '#1e3a8a';
  if (value >= 4.5) return '#1e40af';
  if (value >= 4) return '#2563eb';
  if (value >= 3.5) return '#3b82f6';
  if (value >= 3) return '#60a5fa';
  if (value >= 2.5) return '#93c5fd';
  if (value >= 2) return '#bfdbfe';
  return '#dbeafe';
}

export function ClassAverageSentimentChart() {
  const [selectedClassId, setSelectedClassId] = useState<string>(mockTeacherClasses[0]?.id || '');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setTimeRange('custom');
      setShowCustomPicker(false);
    }
  };

  const weekData = getStaticClassWeekData();
  const monthData = getStaticClassMonthData();
  const customData = getStaticClassCustomData();

  const currentData = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : customData;

  const average = currentData.reduce((sum, d) => sum + d.avgSentiment, 0) / currentData.length;
  const trend = currentData[currentData.length - 1].avgSentiment > currentData[0].avgSentiment ? 'up' : 'down';

  const maxValue = 6;
  const minValue = 1;

  const getDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    if (timeRange === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else if (timeRange === 'month') {
      return index % 5 === 0 || index === currentData.length - 1 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    } else {
      return index % 15 === 0 || index === currentData.length - 1 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Class Sentiment Journey</h3>
            <p className="text-[10px] text-muted-foreground">Track emotional wellness over time</p>
          </div>
        </div>

        <div className="flex bg-muted/50 dark:bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              timeRange === 'week'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              timeRange === 'month'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setShowCustomPicker(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              timeRange === 'custom'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {mockTeacherClasses.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              selectedClassId === cls.id
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <span className="text-xs text-muted-foreground">
            Avg: <span className="font-bold text-foreground">{average.toFixed(1)}/6.0</span>
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span className="text-[10px] font-semibold">{trend === 'up' ? 'Improving' : 'Declining'}</span>
        </div>
      </div>

      <div className="relative h-40 mb-2 ml-6">
        <div className="absolute inset-0 flex items-end justify-between gap-0.5">
          {currentData.map((point, index) => {
            const heightPixels = ((point.avgSentiment - minValue) / (maxValue - minValue)) * 160;

            return (
              <div key={index} className="flex-1 group relative" style={{ height: '100%' }}>
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center">
                  <motion.div
                    className="w-full rounded-t-md cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: getBlueShade(point.avgSentiment, isDark),
                      minHeight: '8px'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPixels}px` }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                  >
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      {point.avgSentiment.toFixed(1)}/6
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        {currentData.map((point, index) => {
          const label = getDateLabel(point.date, index);
          if (timeRange === 'week' || label) {
            return (
              <span key={index} className="flex-1 text-center">
                {label}
              </span>
            );
          }
          return <span key={index} className="flex-1"></span>;
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Last updated: Today</span>
        </div>
      </div>

      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Custom Date Range</h3>
                  <p className="text-xs text-white/80">Select your preferred time period</p>
                </div>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 text-sm text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 text-sm text-foreground"
                />
              </div>
            </div>

            <div className="border-t border-border/50 p-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/80 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomRange}
                disabled={!customStartDate || !customEndDate}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-bold hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                Apply Range
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
