/**
 * Temporal Analytics View - Phase 4, Week 1
 *
 * Features:
 * - Feature 21: Mood by Time of Semester
 * - Feature 22: Engagement Heatmap by Day
 * - Feature 8: Department Performance Trends
 */

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import {
  mockAcademicCalendar,
  mockWeeklySentimentData,
  mockDailyEngagementData,
  mockDepartmentTrends,
  getWeeklySentimentByRange,
  getDepartmentTrendsByFilter,
  getWeeklyInsights,
} from '../../lib/mockTemporalAnalytics';

const SURFACE_BASE = 'rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm';

export function TemporalAnalyticsView() {
  const [selectedWeekRange, setSelectedWeekRange] = useState<'all' | 'first-half' | 'second-half'>('all');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<'all' | 'improving' | 'stable' | 'declining'>('all');

  // Get filtered data
  const weeklyData = selectedWeekRange === 'all'
    ? mockWeeklySentimentData
    : selectedWeekRange === 'first-half'
    ? getWeeklySentimentByRange(1, 8)
    : getWeeklySentimentByRange(9, 16);

  const departmentTrends = selectedDepartmentFilter === 'all'
    ? mockDepartmentTrends
    : getDepartmentTrendsByFilter(selectedDepartmentFilter);

  // Prepare data for workload correlation chart
  const correlationData = weeklyData.map((week) => ({
    week: `W${week.weekNumber}`,
    sentiment: week.averageSentiment,
    assignments: week.assignmentCount,
    pulseRate: week.pulseCompletionRate * 100,
    weekNumber: week.weekNumber
  }));

  // Prepare heatmap data
  const heatmapData = mockDailyEngagementData.map((week) => ({
    week: `Week ${week.weekNumber}`,
    weekNumber: week.weekNumber,
    monday: week.monday.sentiment,
    tuesday: week.tuesday.sentiment,
    wednesday: week.wednesday.sentiment,
    thursday: week.thursday.sentiment,
    friday: week.friday.sentiment,
    mondayPulse: week.monday.pulseRate * 100,
    tuesdayPulse: week.tuesday.pulseRate * 100,
    wednesdayPulse: week.wednesday.pulseRate * 100,
    thursdayPulse: week.thursday.pulseRate * 100,
    fridayPulse: week.friday.pulseRate * 100,
  }));

  // Calculate statistics
  const avgSentiment = weeklyData.reduce((sum, w) => sum + w.averageSentiment, 0) / weeklyData.length;
  const lowestWeek = weeklyData.reduce((min, w) => w.averageSentiment < min.averageSentiment ? w : min);
  const highestWeek = weeklyData.reduce((max, w) => w.averageSentiment > max.averageSentiment ? w : max);

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return 'border-green-500/40 bg-green-50/50 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    if (trend === 'declining') return 'border-red-500/40 bg-red-50/50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    return 'border-yellow-500/40 bg-yellow-50/50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
  };

  // Custom tooltip for sentiment chart
  const SentimentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const weekNumber = payload[0].payload.weekNumber;
      const insights = getWeeklyInsights(weekNumber);
      const event = mockAcademicCalendar.find((e) => e.weekNumber === weekNumber);

      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-sm text-foreground">Week {weekNumber}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.weekStartDate || payload[0].name}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toFixed(2)}
              </p>
            ))}
          </div>
          {event && (
            <div className="mt-2 rounded border border-purple-500/30 bg-purple-50/50 px-2 py-1 dark:bg-purple-950/30">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">{event.eventName}</p>
            </div>
          )}
          {insights.length > 0 && (
            <div className="mt-2 space-y-1">
              {insights.map((insight, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">{insight}</p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Temporal Analytics</h2>
        <p className="text-sm text-muted-foreground">Time-based patterns in sentiment, engagement, and performance</p>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Average Semester Sentiment</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{avgSentiment.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Out of 6.0</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Lowest Sentiment Week</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">Week {lowestWeek.weekNumber}</p>
          <p className="text-xs text-muted-foreground">{lowestWeek.averageSentiment.toFixed(1)} sentiment</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Highest Sentiment Week</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">Week {highestWeek.weekNumber}</p>
          <p className="text-xs text-muted-foreground">{highestWeek.averageSentiment.toFixed(1)} sentiment</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Total Academic Events</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{mockAcademicCalendar.length}</p>
          <p className="text-xs text-muted-foreground">Semester milestones</p>
        </div>
      </div>

      {/* Feature 21: Mood by Time of Semester */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Mood by Time of Semester</h3>
            <p className="text-sm text-muted-foreground">Emotional patterns throughout the academic term with workload correlation</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedWeekRange('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedWeekRange === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Full Semester
            </button>
            <button
              onClick={() => setSelectedWeekRange('first-half')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedWeekRange === 'first-half'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Weeks 1-8
            </button>
            <button
              onClick={() => setSelectedWeekRange('second-half')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedWeekRange === 'second-half'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Weeks 9-16
            </button>
          </div>
        </div>

        {/* Sentiment + Workload Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={correlationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={[0, 6]} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<SentimentTooltip />} />
            <Legend />

            {/* Reference lines for major events */}
            <ReferenceLine yAxisId="left" x="W7" stroke="#ef4444" label={{ value: 'Midterms', position: 'top' }} />
            <ReferenceLine yAxisId="left" x="W8" stroke="#10b981" label={{ value: 'Fall Break', position: 'top' }} />
            <ReferenceLine yAxisId="left" x="W12" stroke="#10b981" label={{ value: 'Thanksgiving', position: 'top' }} />
            <ReferenceLine yAxisId="left" x="W16" stroke="#ef4444" label={{ value: 'Finals', position: 'top' }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sentiment"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Avg Sentiment"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="assignments"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Assignments Due"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Predictive Insights */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-50/50 p-3 dark:bg-yellow-950/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Predicted Stress Period</p>
                <p className="mt-1 text-xs text-yellow-600/90 dark:text-yellow-400/80">
                  Weeks 7-8 (Midterms) and Week 16 (Finals) show consistent sentiment drops
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Break Recovery Patterns</p>
                <p className="mt-1 text-xs text-green-600/90 dark:text-green-400/80">
                  Weeks 8 and 12 (breaks) show 15-20% sentiment improvement
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-50/50 p-3 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Actionable Recommendation</p>
                <p className="mt-1 text-xs text-blue-600/90 dark:text-blue-400/80">
                  Schedule wellness activities during Weeks 7-8 and 14-16 to offset stress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 22: Engagement Heatmap by Day */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Daily Engagement Patterns</h3>
          <p className="text-sm text-muted-foreground">Sentiment and pulse completion by day of week</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={heatmapData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 6]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="monday" fill="#ef4444" name="Monday" />
            <Bar dataKey="tuesday" fill="#f97316" name="Tuesday" />
            <Bar dataKey="wednesday" fill="#eab308" name="Wednesday" />
            <Bar dataKey="thursday" fill="#22c55e" name="Thursday" />
            <Bar dataKey="friday" fill="#3b82f6" name="Friday" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Key Pattern</p>
            <p className="mt-1 text-sm text-foreground">
              Mondays show 15-20% lower sentiment than Fridays across all weeks
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Recommendation</p>
            <p className="mt-1 text-sm text-foreground">
              Consider "Motivation Mondays" initiative to boost early-week engagement
            </p>
          </div>
        </div>
      </div>

      {/* Feature 8: Department Performance Trends */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Department Performance Trends</h3>
            <p className="text-sm text-muted-foreground">Academic and engagement trends by department</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDepartmentFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedDepartmentFilter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDepartmentFilter('improving')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedDepartmentFilter === 'improving'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Improving
            </button>
            <button
              onClick={() => setSelectedDepartmentFilter('stable')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedDepartmentFilter === 'stable'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Stable
            </button>
            <button
              onClick={() => setSelectedDepartmentFilter('declining')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedDepartmentFilter === 'declining'
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Declining
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {departmentTrends.map((dept) => (
            <div key={dept.department} className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground">{dept.department}</h4>
                    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrendColor(dept.trend)}`}>
                      {getTrendIcon(dept.trend)}
                      {dept.trend === 'improving' ? '+' : dept.trend === 'declining' ? '' : ''}{dept.trendPercentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Avg Grade</p>
                      <p className="text-sm font-semibold text-foreground">{dept.currentAvgGrade.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">
                        (was {dept.previousAvgGrade.toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-semibold text-foreground">{(dept.currentEngagement * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">
                        (was {(dept.previousEngagement * 100).toFixed(0)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                      <p className="text-sm font-semibold text-foreground">{(dept.currentCompletionRate * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">
                        (was {(dept.previousCompletionRate * 100).toFixed(0)}%)
                      </p>
                    </div>
                  </div>

                  {dept.topContributingClasses.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                        Top Contributing: {dept.topContributingClasses.join(', ')}
                      </p>
                    </div>
                  )}

                  {dept.bottomContributingClasses.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                        Needs Attention: {dept.bottomContributingClasses.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-50/30 p-2 dark:bg-purple-950/20">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">AI Insight:</p>
                    <p className="mt-1 text-xs text-muted-foreground">{dept.aiExplanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
