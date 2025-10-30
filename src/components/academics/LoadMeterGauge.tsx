import { useEffect, useState } from 'react';
import { getLoadMeterService, type LoadMetrics } from '../../lib/calendar/loadMeter';
import type { UnifiedEvent } from '../../lib/calendar/unifiedCalendar';
import { AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface LoadMeterGaugeProps {
  events: UnifiedEvent[];
  startDate: Date;
  endDate: Date;
}

export function LoadMeterGauge({ events, startDate, endDate }: LoadMeterGaugeProps) {
  const [metrics, setMetrics] = useState<LoadMetrics | null>(null);
  const loadMeter = getLoadMeterService();

  useEffect(() => {
    const calculated = loadMeter.calculateAcademicLoad(events, startDate, endDate);
    setMetrics(calculated);
  }, [events, startDate, endDate]);

  if (!metrics) return null;

  const color = loadMeter.getLoadColorByPercentage(metrics.percentage);

  // Calculate stroke dash for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - metrics.percentage / 100);

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Academic Load Meter</h3>
      </div>

      {/* Circular Gauge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color }}>
              {metrics.percentage}%
            </div>
            <div className="text-sm text-muted-foreground capitalize font-medium">
              {metrics.level}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{metrics.totalStudyHours.toFixed(1)}h</div>
          <div className="text-xs text-muted-foreground">Study Time</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{metrics.assignmentsDue}</div>
          <div className="text-xs text-muted-foreground">Assignments</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{metrics.upcomingExams}</div>
          <div className="text-xs text-muted-foreground">Exams</div>
        </div>
      </div>

      {/* Load Breakdown */}
      <div className="mb-4 p-3 bg-muted/20 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">Load Breakdown</h4>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Study Hours</span>
              <span className="font-medium text-foreground">{Math.round(metrics.breakdown.studyTimeLoad)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.breakdown.studyTimeLoad}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Assignments</span>
              <span className="font-medium text-foreground">{Math.round(metrics.breakdown.assignmentLoad)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.breakdown.assignmentLoad}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Urgency</span>
              <span className="font-medium text-foreground">{Math.round(metrics.breakdown.urgencyLoad)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.breakdown.urgencyLoad}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {metrics.level === 'low' ? <TrendingDown className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-orange-500" />}
            Recommendations
          </h4>
          <div className="space-y-2">
            {metrics.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overloaded Days Warning */}
      {metrics.overloadedDays.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            <AlertCircle className="w-4 h-4" />
            {metrics.overloadedDays.length} Overloaded Day{metrics.overloadedDays.length > 1 ? 's' : ''}
          </div>
          <p className="text-xs text-red-600 dark:text-red-500">
            {metrics.overloadedDays.map(d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })).join(', ')}
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
            Consider redistributing your workload for better balance
          </p>
        </div>
      )}
    </div>
  );
}
