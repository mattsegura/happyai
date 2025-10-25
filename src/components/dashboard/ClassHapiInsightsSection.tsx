import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import {
  getClassAnalyticsData,
  getClassSpecific2WeekData,
  generateClassInsight
} from '../../lib/classAnalyticsData';

interface ClassHapiInsightsSectionProps {
  classId: string;
  className: string;
}

export function ClassHapiInsightsSection({ classId, className }: ClassHapiInsightsSectionProps) {
  const twoWeekData = getClassSpecific2WeekData(classId);
  const currentData = twoWeekData;

  const insight = generateClassInsight(classId, className);
  const analyticsData = getClassAnalyticsData(classId, className);

  const maxValue = 6;
  const minValue = 1;

  const getBlueShade = (value: number): string => {
    if (value >= 5) return '#1e3a8a';
    if (value >= 4.5) return '#1e40af';
    if (value >= 4) return '#2563eb';
    if (value >= 3.5) return '#3b82f6';
    if (value >= 3) return '#60a5fa';
    if (value >= 2.5) return '#93c5fd';
    if (value >= 2) return '#bfdbfe';
    return '#dbeafe';
  };

  const getDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    return index % 2 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
  };

  return (
    <div className="pt-4 border-t border-border space-y-4">
      <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 border-2 border-cyan-200 dark:border-cyan-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 dark:from-cyan-700/20 dark:to-blue-700/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 dark:from-teal-700/20 dark:to-cyan-700/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent flex items-center space-x-2">
                <span>Hapi AI Insights</span>
                <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">AI-powered class wellness summary</p>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <p className="text-foreground leading-relaxed text-sm">
              {insight}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border-2 border-blue-200 dark:border-blue-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Class Sentiment</h3>
              <p className="text-xs text-muted-foreground">Daily class emotional wellness</p>
            </div>
          </div>

          <div className="flex bg-muted rounded-lg p-1">
            <button
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-card text-blue-600 dark:text-blue-400 shadow-md"
            >
              2 Weeks
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">
              Current: <span className="font-bold text-foreground">{analyticsData.currentSentiment.toFixed(1)}/6.0</span>
            </span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            analyticsData.sentimentTrend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
            <TrendingUp className={`w-3 h-3 ${analyticsData.sentimentTrend === 'down' ? 'rotate-180' : ''}`} />
            <span className="text-xs font-semibold">{analyticsData.sentimentTrend === 'up' ? 'Improving' : 'Stable'}</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-semibold">{analyticsData.participationRate}%</span> participation
          </div>
        </div>

        <div className="relative h-40 mb-2">
          <div className="absolute inset-0 flex items-end justify-between gap-0.5">
            {currentData.map((point, index) => {
              const heightPixels = ((point.avgSentiment - minValue) / (maxValue - minValue)) * 160;

              return (
                <div key={index} className="flex-1 group relative" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
                      style={{
                        height: `${heightPixels}px`,
                        backgroundColor: getBlueShade(point.avgSentiment),
                        minHeight: '10px'
                      }}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                        Avg: {point.avgSentiment.toFixed(1)}/6<br/>
                        {point.studentCount} students
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground -ml-6">
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
            if (label) {
              return (
                <span key={index} className="flex-1 text-center">
                  {label}
                </span>
              );
            }
            return <span key={index} className="flex-1"></span>;
          })}
        </div>
      </div>
    </div>
  );
}
