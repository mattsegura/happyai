/**
 * Reports Hub Component
 *
 * Unified interface for all AI-generated reports:
 * - Weekly AI Summaries (Echo)
 * - Student-Specific AI Briefs
 * - Custom Report Generation
 * - Historical Reports Archive
 */

import { useState, useEffect } from 'react';
import { FileText, TrendingUp, User, Calendar, Download, RefreshCw, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateWeeklySummary, formatWeekRange, getWeekRange, type WeeklySummary } from '../../lib/ai/weeklyEchoGenerator';
import { generateStudentBrief, type StudentBrief } from '../../lib/ai/studentBriefGenerator';
import { cn } from '../../lib/utils';

type ReportTab = 'weekly' | 'students' | 'custom' | 'archive';

export function ReportsHub() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<ReportTab>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Weekly Summary state
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  // Student Brief state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [focusArea, setFocusArea] = useState<'academic' | 'emotional' | 'balanced'>('balanced');
  const [studentBrief, setStudentBrief] = useState<StudentBrief | null>(null);

  const tabs = [
    { id: 'weekly', label: 'Weekly Summaries', icon: Calendar },
    { id: 'students', label: 'Student Briefs', icon: User },
    { id: 'custom', label: 'Custom Reports', icon: FileText },
    { id: 'archive', label: 'Archive', icon: Clock },
  ] as const;

  // Load latest weekly summary on mount
  useEffect(() => {
    if (currentTab === 'weekly' && user) {
      loadWeeklySummary();
    }
  }, [currentTab, user, selectedWeek]);

  const loadWeeklySummary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { weekStartDate, weekEndDate } = getWeekRange(selectedWeek);

      const summary = await generateWeeklySummary({
        teacherId: user.id,
        weekStartDate,
        weekEndDate,
      });

      setWeeklySummary(summary);
    } catch (err: any) {
      console.error('[ReportsHub] Failed to load weekly summary:', err);
      setError('Failed to load weekly summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewStudentBrief = async () => {
    if (!user || !selectedStudent) return;

    try {
      setLoading(true);
      setError(null);

      const brief = await generateStudentBrief({
        studentId: selectedStudent,
        teacherId: user.id,
        focusArea,
      });

      setStudentBrief(brief);
    } catch (err: any) {
      console.error('[ReportsHub] Failed to generate student brief:', err);
      setError('Failed to generate student brief. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Reports Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated insights, summaries, and student briefs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as ReportTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[500px]">
        {currentTab === 'weekly' && (
          <WeeklySummaryView
            summary={weeklySummary}
            loading={loading}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            onRefresh={loadWeeklySummary}
          />
        )}

        {currentTab === 'students' && (
          <StudentBriefView
            brief={studentBrief}
            loading={loading}
            selectedStudent={selectedStudent}
            focusArea={focusArea}
            onStudentChange={setSelectedStudent}
            onFocusAreaChange={setFocusArea}
            onGenerate={generateNewStudentBrief}
          />
        )}

        {currentTab === 'custom' && <CustomReportsView />}

        {currentTab === 'archive' && <ArchiveView />}
      </div>
    </div>
  );
}

// Weekly Summary View Component
function WeeklySummaryView({
  summary,
  loading,
  selectedWeek,
  onWeekChange,
  onRefresh,
}: {
  summary: WeeklySummary | null;
  loading: boolean;
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No summary available for this week</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  const { weekStartDate, weekEndDate } = getWeekRange(selectedWeek);

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Week of {formatWeekRange(weekStartDate, weekEndDate)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Generated {new Date(summary.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(new Date(weekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            className="px-3 py-2 text-sm border border-border rounded hover:bg-muted"
          >
            Previous Week
          </button>
          <button
            onClick={() => onWeekChange(new Date())}
            className="px-3 py-2 text-sm border border-border rounded hover:bg-muted"
          >
            Current Week
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm border border-border rounded hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Executive Summary
        </h3>
        <ul className="space-y-2">
          {summary.summary.executiveSummary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span className="text-sm text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Academic Performance */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">📊 Academic Performance</h3>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium">Grade Trends:</span> {summary.summary.academicPerformance.gradeTrends}</p>
          <p><span className="font-medium">Assignment Completion:</span> {summary.summary.academicPerformance.assignmentCompletion}</p>
          <p><span className="font-medium">Missing Submissions:</span> {summary.summary.academicPerformance.missingSubmissions}</p>

          {summary.summary.academicPerformance.topPerformers.length > 0 && (
            <div>
              <p className="font-medium">Top Performers:</p>
              <ul className="ml-4 mt-1 space-y-1">
                {summary.summary.academicPerformance.topPerformers.map((student, idx) => (
                  <li key={idx}>• {student}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Emotional Wellbeing */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">❤️ Emotional Wellbeing</h3>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium">Sentiment Trends:</span> {summary.summary.emotionalWellbeing.classSentimentTrends}</p>
          <p><span className="font-medium">Care Alerts:</span> {summary.summary.emotionalWellbeing.careAlertsSummary}</p>
          <p><span className="font-medium">Mood Patterns:</span> {summary.summary.emotionalWellbeing.moodPatterns}</p>
          <p><span className="font-medium">Positive Developments:</span> {summary.summary.emotionalWellbeing.positiveDevelopments}</p>
        </div>
      </div>

      {/* Action Items */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">✅ Action Items</h3>
        <div className="space-y-3">
          {summary.summary.actionItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded bg-muted/50">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded',
                item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
              )}>
                {item.priority.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.action}</p>
                {item.students && item.students.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Students: {item.students.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positive Highlights */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/30">
        <h3 className="font-semibold text-lg mb-4 text-green-800 dark:text-green-200">🎉 Positive Highlights</h3>
        <ul className="space-y-2">
          {summary.summary.positiveHighlights.map((highlight, idx) => (
            <li key={idx} className="text-sm text-green-700 dark:text-green-300">{highlight}</li>
          ))}
        </ul>
      </div>

      {/* Download Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
}

// Student Brief View Component
function StudentBriefView({
  brief,
  loading,
  selectedStudent,
  focusArea,
  onStudentChange,
  onFocusAreaChange,
  onGenerate,
}: {
  brief: StudentBrief | null;
  loading: boolean;
  selectedStudent: string;
  focusArea: 'academic' | 'emotional' | 'balanced';
  onStudentChange: (id: string) => void;
  onFocusAreaChange: (area: 'academic' | 'emotional' | 'balanced') => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">Generate Student Brief</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Student</label>
            <input
              type="text"
              placeholder="Enter student ID or name"
              value={selectedStudent}
              onChange={(e) => onStudentChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Focus Area</label>
            <div className="flex gap-2">
              {(['academic', 'emotional', 'balanced'] as const).map((area) => (
                <button
                  key={area}
                  onClick={() => onFocusAreaChange(area)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    focusArea === area
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={!selectedStudent || loading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Brief
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student Brief Display */}
      {brief && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4">Executive Summary</h3>
            <p className="text-sm text-foreground">{brief.brief.executiveSummary}</p>
          </div>

          {/* Academic Assessment */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4">📊 Academic Assessment</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Current Performance:</span> {brief.brief.academicAssessment.currentPerformance}</p>
              <p><span className="font-medium">Recent Trends:</span> {brief.brief.academicAssessment.recentTrends}</p>

              <div>
                <p className="font-medium">Strengths:</p>
                <ul className="ml-4 mt-1 space-y-1">
                  {brief.brief.academicAssessment.strengths.map((strength, idx) => (
                    <li key={idx}>• {strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium">Areas for Improvement:</p>
                <ul className="ml-4 mt-1 space-y-1">
                  {brief.brief.academicAssessment.areasForImprovement.map((area, idx) => (
                    <li key={idx}>• {area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4">💡 Recommendations</h3>
            <div className="space-y-3">
              {brief.brief.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      rec.priority === 'immediate' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                      rec.priority === 'medium-term' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    )}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{rec.category}</span>
                  </div>
                  <p className="text-sm font-medium">{rec.action}</p>
                  {rec.rationale && (
                    <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Reports View (Placeholder)
function CustomReportsView() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Custom Reports</h3>
      <p className="text-muted-foreground max-w-md">
        Create custom reports with specific date ranges, classes, or metrics. Coming soon!
      </p>
    </div>
  );
}

// Archive View (Placeholder)
function ArchiveView() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Report Archive</h3>
      <p className="text-muted-foreground max-w-md">
        Access your historical reports and AI summaries from previous weeks and semesters.
      </p>
    </div>
  );
}
