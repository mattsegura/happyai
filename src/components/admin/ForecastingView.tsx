/**
 * Forecasting View - Phase 4, Week 3
 *
 * Features:
 * - Feature 48: Engagement Forecast (30-day prediction)
 * - Feature 45: Weekly AI Summary Reports
 */

import { useState } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar, FileText, Download, Mail, Sparkles } from 'lucide-react';
import {
  mockEngagementForecast,
  mockWeeklyAISummaryReports,
  getPredictedData,
  getHistoricalData,
  getLatestWeeklySummary,
  getLowConfidencePredictions,
  getEngagementAlerts,
} from '../../lib/mockForecasting';

const SURFACE_BASE = 'rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm';

export function ForecastingView() {
  const [forecastView, setForecastView] = useState<'all' | 'predicted' | 'historical'>('all');

  const latestSummary = getLatestWeeklySummary();
  const alerts = getEngagementAlerts();
  const lowConfidencePredictions = getLowConfidencePredictions(0.75);

  const forecastData = forecastView === 'all'
    ? mockEngagementForecast
    : forecastView === 'predicted'
    ? getPredictedData()
    : getHistoricalData();

  // Calculate averages
  const predictedData = getPredictedData();
  const avgPredictedPulse = predictedData.reduce((sum, d) => sum + d.predictedPulseCompletionRate, 0) / predictedData.length;
  const avgPredictedSentiment = predictedData.reduce((sum, d) => sum + d.predictedSentiment, 0) / predictedData.length;

  // Custom tooltip
  const ForecastTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-sm text-foreground">{data.date}</p>
          <p className={`text-xs ${data.forecastType === 'predicted' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`}>
            {data.forecastType === 'predicted' ? 'Predicted' : 'Historical'}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">Pulse Completion: {(data.predictedPulseCompletionRate * 100).toFixed(0)}%</p>
            <p className="text-xs">Sentiment: {data.predictedSentiment.toFixed(2)}</p>
            {data.forecastType === 'predicted' && (
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Confidence: {(data.confidenceLevel * 100).toFixed(0)}%
              </p>
            )}
          </div>
          {data.influencingFactors && data.influencingFactors.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {data.influencingFactors.map((factor: string, idx: number) => (
                <p key={idx} className="text-xs text-muted-foreground">• {factor}</p>
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
        <h2 className="text-2xl font-bold text-foreground">Forecasting & AI Reports</h2>
        <p className="text-sm text-muted-foreground">Predictive analytics and automated insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Avg Predicted Pulse Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{(avgPredictedPulse * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Next 15 days</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Avg Predicted Sentiment</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{avgPredictedSentiment.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Out of 6.0</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Active Alerts</p>
          <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">{alerts.length}</p>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </div>
        <div className={SURFACE_BASE + ' p-4'}>
          <p className="text-xs font-semibold text-muted-foreground">Low Confidence Days</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowConfidencePredictions.length}</p>
          <p className="text-xs text-muted-foreground">&lt;75% confidence</p>
        </div>
      </div>

      {/* Feature 48: Engagement Forecast */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">30-Day Engagement Forecast</h3>
            <p className="text-sm text-muted-foreground">Predictive model for pulse completion, participation, and sentiment</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setForecastView('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                forecastView === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Data
            </button>
            <button
              onClick={() => setForecastView('predicted')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                forecastView === 'predicted'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Predicted Only
            </button>
            <button
              onClick={() => setForecastView('historical')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                forecastView === 'historical'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Historical Only
            </button>
          </div>
        </div>

        {/* Forecast Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={[0, 1]} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" domain={[0, 6]} />
            <Tooltip content={<ForecastTooltip />} />
            <Legend />

            {/* Vertical line to separate historical vs predicted */}
            <ReferenceLine yAxisId="left" x="2024-11-08" stroke="#8b5cf6" strokeDasharray="3 3" label={{ value: 'Today', position: 'top' }} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="predictedPulseCompletionRate"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Pulse Completion Rate"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="predictedSentiment"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.2}
              name="Sentiment"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Confidence Indicator */}
        <div className="mt-4 rounded-lg border border-purple-500/40 bg-purple-50/50 p-3 dark:bg-purple-950/20">
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">Model Information:</p>
          <p className="mt-1 text-xs text-purple-600/90 dark:text-purple-400/80">
            Predictions based on historical patterns, academic calendar events, and seasonal trends. Confidence levels decrease for dates further in the future. Shaded areas represent confidence intervals.
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-50/50 p-3 dark:bg-orange-950/20">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Engagement Alerts</p>
                <div className="mt-1 space-y-0.5">
                  {alerts.map((alert, idx) => (
                    <p key={idx} className="text-xs text-orange-600/90 dark:text-orange-400/80">{alert}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature 45: Weekly AI Summary Reports */}
      <div className={SURFACE_BASE + ' p-6'}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI-Generated Weekly Summary</h3>
              <p className="text-sm text-muted-foreground">Automated executive reports with insights and recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/80">
              <Download className="h-3 w-3" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/80">
              <Mail className="h-3 w-3" />
              Email Report
            </button>
          </div>
        </div>

        {/* Latest Report */}
        <div className="rounded-lg border border-purple-500/40 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-5 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Week of {latestSummary.weekStartDate}</h4>
              <p className="text-xs text-muted-foreground">{latestSummary.weekStartDate} - {latestSummary.weekEndDate}</p>
            </div>
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">LATEST</span>
          </div>

          {/* Executive Summary */}
          <div className="mt-4">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Executive Summary
            </h5>
            <div className="mt-2 space-y-2">
              <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
                <p className="text-sm text-foreground">✓ {latestSummary.executiveSummary.keyInsight1}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
                <p className="text-sm text-foreground">✓ {latestSummary.executiveSummary.keyInsight2}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
                <p className="text-sm text-foreground">✓ {latestSummary.executiveSummary.keyInsight3}</p>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="mt-5">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {latestSummary.academicPerformance.gradesTrend === 'improving' ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              Academic Performance
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                latestSummary.academicPerformance.gradesTrend === 'improving'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {latestSummary.academicPerformance.gradesTrendPercentage > 0 ? '+' : ''}
                {latestSummary.academicPerformance.gradesTrendPercentage.toFixed(1)}%
              </span>
            </h5>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50/50 p-2 dark:bg-green-950/20">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Top Performing</p>
                <div className="mt-1 space-y-0.5">
                  {latestSummary.academicPerformance.topPerformingDepartments.map((dept, idx) => (
                    <p key={idx} className="text-xs text-green-600 dark:text-green-400">• {dept}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-red-50/50 p-2 dark:bg-red-950/20">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">Needs Attention</p>
                <div className="mt-1 space-y-0.5">
                  {latestSummary.academicPerformance.strugglingDepartments.map((dept, idx) => (
                    <p key={idx} className="text-xs text-red-600 dark:text-red-400">• {dept}</p>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{latestSummary.academicPerformance.details}</p>
          </div>

          {/* Emotional Wellbeing */}
          <div className="mt-5">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {latestSummary.emotionalWellbeing.sentimentTrend === 'improving' ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              Emotional Wellbeing
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                latestSummary.emotionalWellbeing.sentimentTrend === 'improving'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {latestSummary.emotionalWellbeing.sentimentTrendPercentage > 0 ? '+' : ''}
                {latestSummary.emotionalWellbeing.sentimentTrendPercentage.toFixed(1)}%
              </span>
            </h5>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs text-muted-foreground">Avg Sentiment</p>
                <p className="text-lg font-semibold text-foreground">{latestSummary.emotionalWellbeing.averageSentiment.toFixed(1)}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs text-muted-foreground">At-Risk Students</p>
                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{latestSummary.emotionalWellbeing.atRiskStudentCount}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs text-muted-foreground">Trend</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Improving</p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {latestSummary.emotionalWellbeing.positiveHighlights.map((highlight, idx) => (
                <p key={idx} className="text-xs text-green-600 dark:text-green-400">✓ {highlight}</p>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{latestSummary.emotionalWellbeing.details}</p>
          </div>

          {/* Engagement Metrics */}
          <div className="mt-5">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Engagement Metrics
            </h5>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50/50 p-2 dark:bg-blue-950/20">
                <p className="text-xs text-muted-foreground">Platform Usage</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {latestSummary.engagementMetrics.platformUsagePercentage}%
                </p>
              </div>
              <div className="rounded-lg bg-blue-50/50 p-2 dark:bg-blue-950/20">
                <p className="text-xs text-muted-foreground">Teacher Engagement</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {(latestSummary.engagementMetrics.teacherEngagementRate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-blue-50/50 p-2 dark:bg-blue-950/20">
                <p className="text-xs text-muted-foreground">Student Participation</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {(latestSummary.engagementMetrics.studentParticipationRate * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {latestSummary.engagementMetrics.highlights.map((highlight, idx) => (
                <p key={idx} className="text-xs text-blue-600 dark:text-blue-400">• {highlight}</p>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-5">
            <h5 className="text-sm font-semibold text-foreground">Priority Action Items</h5>
            <div className="mt-2 space-y-2">
              {latestSummary.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-2 ${
                    item.priority === 'high'
                      ? 'border-red-500/40 bg-red-50/50 dark:bg-red-950/20'
                      : item.priority === 'medium'
                      ? 'border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-950/20'
                      : 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className={`text-xs font-bold uppercase ${
                        item.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                        item.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.priority}
                      </span>
                      <p className="mt-1 text-sm text-foreground">{item.action}</p>
                      {item.affectedStudents && (
                        <p className="mt-0.5 text-xs text-muted-foreground">Affects {item.affectedStudents} students</p>
                      )}
                    </div>
                    {item.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.deadline}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Looking Ahead */}
          <div className="mt-5">
            <h5 className="text-sm font-semibold text-foreground">Looking Ahead</h5>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs font-semibold text-muted-foreground">Upcoming Events</p>
                <div className="mt-1 space-y-0.5">
                  {latestSummary.lookingAhead.upcomingEvents.map((event, idx) => (
                    <p key={idx} className="text-xs text-foreground">• {event}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs font-semibold text-muted-foreground">Predicted Challenges</p>
                <div className="mt-1 space-y-0.5">
                  {latestSummary.lookingAhead.predictedChallenges.map((challenge, idx) => (
                    <p key={idx} className="text-xs text-orange-600 dark:text-orange-400">• {challenge}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-white/60 p-2 dark:bg-slate-900/40">
                <p className="text-xs font-semibold text-muted-foreground">Recommendations</p>
                <div className="mt-1 space-y-0.5">
                  {latestSummary.lookingAhead.recommendations.slice(0, 3).map((rec, idx) => (
                    <p key={idx} className="text-xs text-green-600 dark:text-green-400">• {rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Reports */}
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">Previous Reports</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {mockWeeklyAISummaryReports.slice(1).map((report, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <p className="text-sm font-semibold text-foreground">Week of {report.weekStartDate}</p>
                <p className="text-xs text-muted-foreground">{report.weekStartDate} - {report.weekEndDate}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{report.executiveSummary.keyInsight1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
