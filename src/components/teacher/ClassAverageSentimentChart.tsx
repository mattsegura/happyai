import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, X } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-500/30 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Class Sentiment Journey</h3>
            <p className="text-xs text-muted-foreground">Track class emotional wellness over time</p>
          </div>
        </div>

        <div className="flex bg-muted dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === 'week'
                ? 'bg-background text-blue-600 shadow-md dark:bg-white dark:text-blue-600'
                : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === 'month'
                ? 'bg-background text-blue-600 shadow-md dark:bg-white dark:text-blue-600'
                : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setShowCustomPicker(true)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              timeRange === 'custom'
                ? 'bg-background text-blue-600 shadow-md dark:bg-white dark:text-blue-600'
                : 'text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {mockTeacherClasses.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedClassId === cls.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-muted-foreground">
            Avg: <span className="font-bold text-foreground">{average.toFixed(1)}/6.0</span>
          </span>
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-900/50 text-green-400 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-900/50 text-orange-400 dark:bg-orange-500/20 dark:text-orange-400'
        }`}>
          <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span className="text-xs font-semibold">{trend === 'up' ? 'Improving' : 'Declining'}</span>
        </div>
      </div>

      <div className="relative h-48 mb-2 ml-8">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {currentData.map((point, index) => {
            const heightPixels = ((point.avgSentiment - minValue) / (maxValue - minValue)) * 192;

            return (
              <div key={index} className="flex-1 group relative" style={{ height: '100%' }}>
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 cursor-pointer hover:opacity-80"
                    style={{
                      height: `${heightPixels}px`,
                      backgroundColor: getBlueShade(point.avgSentiment, isDark),
                      minHeight: '12px'
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      Avg: {point.avgSentiment.toFixed(1)}/6
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute -left-7 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-2">
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

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: Today</span>
        </div>
      </div>

      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Custom Date Range</h3>
                  <p className="text-sm text-white/80">Select your preferred time period</p>
                </div>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 focus:bg-background transition-all duration-300 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 focus:bg-background transition-all duration-300 text-foreground"
                />
              </div>
            </div>

            <div className="border-t border-border p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomRange}
                disabled={!customStartDate || !customEndDate}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
