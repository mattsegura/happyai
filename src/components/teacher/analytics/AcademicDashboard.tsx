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
import { Loader2, RefreshCw, BookOpen, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
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

      // Try to load real courses with timeout, but fall back to mock data if it fails
      try {
        const coursesPromise = canvasServiceEnhanced.getCourses({
          enrollmentState: 'active',
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Canvas API timeout')), 3000)
        );

        const courses = await Promise.race([coursesPromise, timeoutPromise]) as any[];

        if (courses && courses.length > 0) {
          setClasses(courses);
          if (!selectedClassId) {
            setSelectedClassId(String(courses[0].id));
          }
          setLoading(false);
          return;
        }
      } catch (canvasErr) {
        console.log('[AcademicDashboard] Canvas not available, using mock data:', canvasErr);
      }

      // Fall back to mock classes
      const mockClasses = [
        { id: 'mock-psych-101', name: 'Introduction to Psychology', course_code: 'PSYCH 101' },
        { id: 'mock-eng-201', name: 'English Literature', course_code: 'ENG 201' },
        { id: 'mock-hist-101', name: 'World History', course_code: 'HIST 101' },
      ];

      setClasses(mockClasses);
      if (!selectedClassId && mockClasses.length > 0) {
        setSelectedClassId(String(mockClasses[0].id));
      }
    } catch (err: any) {
      console.error('[AcademicDashboard] Failed to load classes:', err);
      
      // Even on error, provide mock data
      const mockClasses = [
        { id: 'mock-psych-101', name: 'Introduction to Psychology', course_code: 'PSYCH 101' },
        { id: 'mock-eng-201', name: 'English Literature', course_code: 'ENG 201' },
        { id: 'mock-hist-101', name: 'World History', course_code: 'HIST 101' },
      ];
      
      setClasses(mockClasses);
      if (!selectedClassId && mockClasses.length > 0) {
        setSelectedClassId(String(mockClasses[0].id));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (classId: string) => {
    if (!user) {
      setLoading(false);
      return;
    }

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
      // Don't set error, just log it - components will show empty state
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
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Academic Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights into class performance
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Class Selector Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5"
      >
        <label className="block text-sm font-medium text-foreground mb-2">Select Class</label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </motion.div>

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

      {/* Analytics Grid - Animated */}
      {!loading && selectedClassId && (
        <div className="space-y-4">
          {/* Row 1: Grade Card + Distribution */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {averageGrade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ClassGradeCard data={averageGrade} />
              </motion.div>
            )}
            {distribution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GradeDistributionChart data={distribution} />
              </motion.div>
            )}
          </div>

          {/* Row 2: Submissions + Participation */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {submissions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SubmissionTracker data={submissions} />
              </motion.div>
            )}
            {participation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <ParticipationReport data={participation} />
              </motion.div>
            )}
          </div>

          {/* Row 3: Mood-Performance Correlation (Full Width) */}
          {moodCorrelation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <MoodPerformanceScatter data={moodCorrelation} />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
export default AcademicDashboard;
