/**
 * Student Report Page Component
 *
 * Main container for comprehensive student report displaying:
 * 1. Student Header (avatar, name, email, risk badge)
 * 2. Academic Overview Card
 * 3. Emotional Wellbeing Card
 * 4. Engagement Metrics Card
 * 5. Mood-to-Performance Correlation Card
 * 6. Teacher Interactions History
 * 7. Comparison to Class Average
 *
 * Phase 3: Student Search & Reports
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, AlertCircle, User, Mail, Award, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getStudentComprehensiveData,
  type ComprehensiveStudentData,
} from '../../../lib/students/studentDataService';
import { StudentAcademicCard } from './StudentAcademicCard';
import { StudentWellbeingCard } from './StudentWellbeingCard';
import { StudentEngagementCard } from './StudentEngagementCard';
import { StudentCorrelationCard } from './StudentCorrelationCard';
import { StudentInteractionHistory } from './StudentInteractionHistory';

interface StudentReportPageProps {
  studentId: string;
  classId: string;
  onBack: () => void;
}

export function StudentReportPage({ studentId, classId, onBack }: StudentReportPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComprehensiveStudentData | null>(null);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [studentId, classId, user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const studentData = await getStudentComprehensiveData(studentId, classId, user.id);
      setData(studentData);
    } catch (err: any) {
      console.error('[StudentReportPage] Failed to load student data:', err);
      setError('Failed to load student report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStudentData();
  };

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'high':
        return (
          <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-white shadow-md">
            Moderate Risk
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white shadow-md">
            Low Risk
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Generating comprehensive student report...</p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-sm text-foreground">{error || 'Failed to load student report'}</p>
          <div className="mt-4 flex justify-center space-x-3">
            <button
              onClick={onBack}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Go Back
            </button>
            <button
              onClick={loadStudentData}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-semibold">Back to Student Lookup</span>
      </button>

      {/* Student Header */}
      <div className="rounded-2xl border-2 border-border bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-lg dark:from-blue-950/30 dark:to-cyan-950/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              {data.student.avatarUrl ? (
                <img
                  src={data.student.avatarUrl}
                  alt={data.student.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>

            {/* Student Info */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{data.student.name}</h1>
              <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{data.student.email}</span>
              </div>
              <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{data.classInfo.className}</span>
              </div>
            </div>
          </div>

          {/* Risk Badge & Refresh */}
          <div className="flex flex-col items-end space-y-3">
            {getRiskBadge(data.riskLevel)}
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison to Class Average */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-foreground">Comparison to Class Average</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Grade Percentile */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted/50">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Grade Percentile</p>
            <div className="mb-2 flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {data.comparison.gradePercentile}th
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Student: {data.comparison.studentValues.grade.toFixed(1)}%</span>
              <span>•</span>
              <span>Class: {data.comparison.classAverage.grade.toFixed(1)}%</span>
            </div>
          </div>

          {/* Sentiment Percentile */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted/50">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Sentiment Percentile</p>
            <div className="mb-2 flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {data.comparison.sentimentPercentile}th
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Student: {data.comparison.studentValues.sentiment.toFixed(1)}</span>
              <span>•</span>
              <span>Class: {data.comparison.classAverage.sentiment.toFixed(1)}</span>
            </div>
          </div>

          {/* Engagement Percentile */}
          <div className="rounded-lg bg-muted p-4 dark:bg-muted/50">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Engagement Percentile</p>
            <div className="mb-2 flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {data.comparison.engagementPercentile}th
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Student: {data.comparison.studentValues.engagement.toFixed(0)}%</span>
              <span>•</span>
              <span>Class: {data.comparison.classAverage.engagement.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Academic Overview */}
        <StudentAcademicCard data={data.academic} />

        {/* Emotional Wellbeing */}
        <StudentWellbeingCard data={data.wellbeing} />

        {/* Engagement Metrics */}
        <StudentEngagementCard data={data.engagement} />

        {/* Mood-to-Performance Correlation */}
        <StudentCorrelationCard data={data.correlation} />
      </div>

      {/* Teacher Interactions (Full Width) */}
      <StudentInteractionHistory
        interactions={data.interactions}
        studentId={studentId}
        classId={classId}
        teacherId={user!.id}
        onNoteAdded={handleRefresh}
      />

      {/* Generated At Footer */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-center dark:bg-muted/10">
        <p className="text-xs text-muted-foreground">
          Report generated: {new Date(data.generatedAt).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Click Refresh to update with latest data
        </p>
      </div>
    </div>
  );
}
