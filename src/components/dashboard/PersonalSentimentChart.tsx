import { useState } from 'react';
import { TrendingUp, Calendar, X } from 'lucide-react';
import { getStaticPersonalWeekData, getStaticPersonalMonthData, getStaticPersonalCustomData } from '../../lib/staticAnalyticsData';

type TimeRange = 'week' | 'month' | 'custom';

// Use Tailwind color values that work with dark mode
const getBlueShade = (value: number): string => {
  // Returns RGB values that can be used with opacity
  if (value >= 5) return 'rgb(30 58 138)'; // blue-900
  if (value >= 4.5) return 'rgb(30 64 175)'; // blue-800
  if (value >= 4) return 'rgb(37 99 235)'; // blue-600
  if (value >= 3.5) return 'rgb(59 130 246)'; // blue-500
  if (value >= 3) return 'rgb(96 165 250)'; // blue-400
  if (value >= 2.5) return 'rgb(147 197 253)'; // blue-300
  if (value >= 2) return 'rgb(191 219 254)'; // blue-200
  return 'rgb(219 234 254)'; // blue-100
};

export function PersonalSentimentChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const weekData = getStaticPersonalWeekData();
  const monthData = getStaticPersonalMonthData();
  const customData = getStaticPersonalCustomData();

  const currentData = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : customData;

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setTimeRange('custom');
      setShowCustomPicker(false);
    }
  };

  const average = currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length;
  const trend = currentData[currentData.length - 1].value > currentData[0].value ? 'up' : 'down';

  const maxValue = 6;
  const minValue = 1;

  const getDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    if (timeRange === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return index % 5 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sentiment overview</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily mood averages</p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-500">
          {[
            { id: 'week', label: '7 days' },
            { id: 'month', label: '30 days' },
            { id: 'custom', label: 'Custom' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => (option.id === 'custom' ? setShowCustomPicker(true) : setTimeRange(option.id as TimeRange))}
              className={`rounded-full px-4 py-2 transition ${
                timeRange === option.id ? 'bg-white text-primary-600 shadow-sm' : 'hover:text-primary-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-primary-700">
          Avg sentiment: <strong className="text-primary-700">{average.toFixed(1)}/6</strong>
        </span>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            trend === 'up'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
              : 'border border-amber-100 bg-amber-50 text-amber-700'
          }`}
        >
          <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          {trend === 'up' ? 'Trending upward' : 'Needs attention'}
        </span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[auto,1fr]">
        <div className="flex flex-col justify-between border-r border-slate-200 pr-4 text-xs text-slate-400 md:pr-6">
          {[6, 5, 4, 3, 2, 1].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-0 grid grid-rows-6 gap-0 text-slate-100">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border-b border-slate-100" />
            ))}
          </div>
          <div className="relative flex items-end justify-between gap-1">
            {currentData.map((point, index) => {
              const heightPixels = ((point.value - minValue) / (maxValue - minValue)) * 180;
              return (
                <div key={index} className="group relative flex-1">
                  <div
                    className="mx-auto w-full max-w-[18px] rounded-t-lg bg-primary-200 transition hover:bg-primary-300"
                    style={{ height: `${Math.max(heightPixels, 12)}px` }}
                  >
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {point.emotion} · {point.value.toFixed(1)}
                    </span>
                  </div>
                  <span className="mt-2 block text-center text-[10px] text-slate-500">
                    {getDateLabel(point.date, index)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Updated today
        </span>
        <button
          onClick={() => setShowCustomPicker(true)}
          className="text-xs font-semibold text-primary-600 transition hover:text-primary-700"
        >
          Adjust dates
        </button>
      </div>

      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 text-gray-800"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
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
