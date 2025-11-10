/**
 * Academic Dashboard Component
 *
 * Main container for academic analytics featuring:
 * - Class selector
 * - All 5 academic analytics features
 * - Loading and error states
 * - Real-time data fetching with caching
 */

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { canvasServiceEnhanced } from '../../../lib/canvas/canvasServiceEnhanced';
import {
  calculateClassAverageGrade,
  calculateGradeDistribution,
  getMissingSubmissions,
  calculateParticipationRate,
  calculateMoodPerformanceCorrelation,
  invalidateAnalyticsCache,
  type ClassAverageGrade,
  type GradeDistribution,
  type SubmissionStats,
  type ParticipationRate,
  type MoodPerformanceData,
} from '../../../lib/analytics/academicAnalytics';
import { ClassGradeCard } from './ClassGradeCard';
import { GradeDistributionChart } from './GradeDistributionChart';
import { SubmissionTracker } from './SubmissionTracker';
import { ParticipationReport } from './ParticipationReport';
import { MoodPerformanceScatter } from './MoodPerformanceScatter';

function AcademicDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics data state
  const [averageGrade, setAverageGrade] = useState<ClassAverageGrade | null>(null);
  const [distribution, setDistribution] = useState<GradeDistribution | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionStats | null>(null);
  const [participation, setParticipation] = useState<ParticipationRate | null>(null);
  const [moodCorrelation, setMoodCorrelation] = useState<MoodPerformanceData | null>(null);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Load analytics when class changes
  useEffect(() => {
    if (selectedClassId && user) {
      loadAnalytics(selectedClassId);
    }
  }, [selectedClassId, user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const courses = await canvasServiceEnhanced.getCourses({
        enrollmentState: 'active',
      });

      setClasses(courses);

      // Auto-select first class
      if (courses.length > 0 && !selectedClassId) {
        setSelectedClassId(String(courses[0].id));
      }
    } catch (err: any) {
      console.error('[AcademicDashboard] Failed to load classes:', err);
      setError('Failed to load classes. Please check your Canvas connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (classId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load all analytics in parallel for better performance
      const [gradeData, distData, submData, partData, moodData] = await Promise.all([
        calculateClassAverageGrade(classId, user.id).catch((err) => {
          console.error('[AcademicDashboard] Grade calculation error:', err);
          return null;
        }),
        calculateGradeDistribution(classId, user.id).catch((err) => {
          console.error('[AcademicDashboard] Distribution calculation error:', err);
          return null;
        }),
        getMissingSubmissions(classId, user.id).catch((err) => {
          console.error('[AcademicDashboard] Submission stats error:', err);
          return null;
        }),
        calculateParticipationRate(classId, user.id).catch((err) => {
          console.error('[AcademicDashboard] Participation calculation error:', err);
          return null;
        }),
        calculateMoodPerformanceCorrelation(classId, user.id).catch((err) => {
          console.error('[AcademicDashboard] Mood correlation error:', err);
          return null;
        }),
      ]);

      setAverageGrade(gradeData);
      setDistribution(distData);
      setSubmissions(submData);
      setParticipation(partData);
      setMoodCorrelation(moodData);
    } catch (err: any) {
      console.error('[AcademicDashboard] Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedClassId || !user) return;

    try {
      setRefreshing(true);

      // Invalidate cache for this class
      await invalidateAnalyticsCache(user.id, selectedClassId);

      // Reload analytics
      await loadAnalytics(selectedClassId);
    } catch (err: any) {
      console.error('[AcademicDashboard] Refresh failed:', err);
      setError('Failed to refresh analytics. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !selectedClassId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedClassId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-sm text-foreground">{error}</p>
          <button
            onClick={loadClasses}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-foreground">No classes found</p>
          <p className="text-xs text-muted-foreground">Connect your Canvas account to see academic analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Class Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Academic Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time insights into class performance and engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Class Selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-semibold text-foreground">Select Class</label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && selectedClassId && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && selectedClassId && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* Analytics Grid */}
      {!loading && selectedClassId && (
        <div className="space-y-6">
          {/* Row 1: Grade Card + Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {averageGrade && <ClassGradeCard data={averageGrade} />}
            {distribution && <GradeDistributionChart data={distribution} />}
          </div>

          {/* Row 2: Submissions + Participation */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {submissions && <SubmissionTracker data={submissions} />}
            {participation && <ParticipationReport data={participation} />}
          </div>

          {/* Row 3: Mood-Performance Correlation (Full Width) */}
          {moodCorrelation && (
            <div className="w-full">
              <MoodPerformanceScatter data={moodCorrelation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default AcademicDashboard;
