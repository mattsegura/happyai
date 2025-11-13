/**
 * AI Insights View - Phase 3 Admin Features
 *
 * Implements:
 * - Features 13 & 49: Wellness-Performance Correlation
 * - Feature 46: Top 3 Emotional Trends
 * - Feature 47: Top 3 Academic Risk Drivers
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  mockCorrelationAnalysis,
  mockEmotionalTrendsAnalysis,
  mockAcademicRiskDriversAnalysis,
  getSeverityColor,
  getTrendDirection,
} from '../../lib/mockAIInsights';

type ViewMode = 'correlation' | 'emotional-trends' | 'risk-drivers';

export function AIInsightsView() {
  const [viewMode, setViewMode] = useState<ViewMode>('correlation');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            AI-Powered Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced analytics using AI to identify patterns, correlations, and predictive trends
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 px-3 py-2">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
            AI Analysis Active
          </span>
        </div>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex space-x-2 border-b border-border"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('correlation')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'correlation'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Wellness-Performance Correlation
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('emotional-trends')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'emotional-trends'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Emotional Trends
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('risk-drivers')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            viewMode === 'risk-drivers'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Academic Risk Drivers
        </motion.button>
      </motion.div>

      {/* Wellness-Performance Correlation View */}
      {viewMode === 'correlation' && (
        <div className="space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <Card className="border-purple-200 dark:border-purple-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                AI Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{mockCorrelationAnalysis.aiSummary}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Correlation</div>
                  <div className="text-2xl font-bold text-foreground">
                    r = {mockCorrelationAnalysis.correlationCoefficient.toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {mockCorrelationAnalysis.strength}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Statistical Significance</div>
                  <div className="text-2xl font-bold text-foreground">
                    p = {mockCorrelationAnalysis.pValue.toFixed(3)}
                  </div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    Highly Significant
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Sample Size</div>
                  <div className="text-2xl font-bold text-foreground">{mockCorrelationAnalysis.sampleSize}</div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Scatter Plot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Sentiment vs. GPA Scatter Plot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each dot represents a student. Positive correlation indicates higher sentiment = higher GPA
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 bg-muted/20 rounded-lg p-6">
                {/* Simple scatter plot visualization */}
                <div className="absolute inset-0 p-6">
                  {/* Y-axis (GPA) */}
                  <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  {/* X-axis (Sentiment) */}
                  <div className="absolute left-12 right-6 bottom-2 flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                  </div>
                  {/* Data points */}
                  <div className="absolute left-12 right-6 top-6 bottom-12">
                    {mockCorrelationAnalysis.dataPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="absolute h-2 w-2 rounded-full bg-purple-500 opacity-70 hover:opacity-100 hover:scale-150 transition"
                        style={{
                          left: `${((point.sentiment - 1) / 5) * 100}%`,
                          bottom: `${(point.gpa / 100) * 100}%`,
                        }}
                        title={`Sentiment: ${point.sentiment.toFixed(1)}, GPA: ${point.gpa.toFixed(1)}%`}
                      />
                    ))}
                    {/* Trend line */}
                    <svg className="absolute inset-0 pointer-events-none">
                      <line
                        x1="0%"
                        y1="90%"
                        x2="100%"
                        y2="10%"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="text-purple-400"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Trend line shows positive correlation: as sentiment increases, GPA tends to increase
              </p>
            </CardContent>
          </Card>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                AI-Generated Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCorrelationAnalysis.aiInsights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Sparkles className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCorrelationAnalysis.aiRecommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + idx * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="flex gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Lead/Lag Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Predictive Lead/Lag Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {mockCorrelationAnalysis.leadLagAnalysis.moodChangeLeadsGradeChange
                      ? 'Mood Changes Predict Future Grade Changes'
                      : 'Grade Changes Precede Mood Changes'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mockCorrelationAnalysis.leadLagAnalysis.description}
                  </p>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                    Lag: {mockCorrelationAnalysis.leadLagAnalysis.lagWeeks} weeks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}

      {/* Emotional Trends View */}
      {viewMode === 'emotional-trends' && (
        <div className="space-y-6">
          {/* Top 3 Common Emotions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Most Common Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {mockEmotionalTrendsAnalysis.commonEmotions.map((emotion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                      <span className={cn('text-xs font-semibold', `text-${emotion.tier >= 4 ? 'green' : emotion.tier >= 3 ? 'yellow' : 'red'}-600`)}>
                        Tier {emotion.tier}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{emotion.emotion}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {(emotion.frequency * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{emotion.count} check-ins</div>
                      </div>
                      <div className={cn('text-sm font-semibold flex items-center gap-1', emotion.change > 0 ? 'text-red-600 dark:text-red-400' : emotion.change < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600')}>
                        {getTrendDirection(emotion.trend)}
                        {Math.abs(emotion.change).toFixed(1)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Top 3 Concerning Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
          <Card className="border-orange-200 dark:border-orange-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Top 3 Concerning Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEmotionalTrendsAnalysis.concerningTrends.map((trend, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + idx * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold', getSeverityColor(trend.severity), getRiskLevelBgColor(trend.severity))}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{trend.trend}</h3>
                        <p className="text-sm text-foreground/80 mb-2">{trend.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={cn('font-semibold', getSeverityColor(trend.severity))}>
                            {trend.severity} Severity
                          </span>
                          <span className="text-muted-foreground">
                            {trend.affectedStudents} students ({trend.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* AI Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Sparkles className="h-5 w-5" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {mockEmotionalTrendsAnalysis.aiRecommendation}
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}

      {/* Academic Risk Drivers View */}
      {viewMode === 'risk-drivers' && (
        <div className="space-y-6">
          {/* Top 3 Risk Drivers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Academic Risk Drivers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Primary factors contributing to academic struggle
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockAcademicRiskDriversAnalysis.topDrivers.map((driver, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-lg border-2 border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold', getRiskLevelBgColor(driver.severity), getRiskLevelColor(driver.severity))}>
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{driver.driver}</h3>
                          <p className={cn('text-sm font-semibold', getSeverityColor(driver.severity))}>
                            {driver.severity} Severity {getTrendDirection(driver.trend)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{driver.studentsAffected}</div>
                        <div className="text-xs text-muted-foreground">
                          {driver.percentOfStudents.toFixed(1)}% of students
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 mb-4">{driver.description}</p>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">AI-Suggested Interventions:</h4>
                      <div className="space-y-2">
                        {driver.aiRecommendations.map((rec, recIdx) => (
                          <div key={recIdx} className="flex gap-2 text-sm">
                            <span className="text-purple-600 dark:text-purple-400">•</span>
                            <span className="text-foreground/90">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Department Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Primary risk driver by department
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAcademicRiskDriversAnalysis.departmentBreakdown
                  .sort((a, b) => b.studentsAffected - a.studentsAffected)
                  .map((dept, idx) => (
                    <motion.div
                      key={dept.department}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + idx * 0.05 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground capitalize">{dept.department.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">Primary Issue: {dept.primaryDriver}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{dept.studentsAffected}</div>
                        <div className="text-xs text-muted-foreground">students affected</div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'Critical': return 'text-red-700 dark:text-red-400';
    case 'High': return 'text-orange-700 dark:text-orange-400';
    case 'Medium': return 'text-yellow-700 dark:text-yellow-400';
    case 'Low': return 'text-green-700 dark:text-green-400';
    default: return 'text-gray-700 dark:text-gray-400';
  }
}

function getRiskLevelBgColor(level: string): string {
  switch (level) {
    case 'Critical': return 'bg-red-100 dark:bg-red-900/20';
    case 'High': return 'bg-orange-100 dark:bg-orange-900/20';
    case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'Low': return 'bg-green-100 dark:bg-green-900/20';
    default: return 'bg-gray-100 dark:bg-gray-900/20';
  }
}
