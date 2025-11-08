import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, CheckCircle, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskIndicator {
  class_id: string;
  class_name: string;
  risk_level: RiskLevel;
  current_grade: number;
  missing_assignments: number;
  late_submissions: number;
  factors: string[];
  recommendations: string[];
}

export function AcademicRiskIndicators() {
  const { user } = useAuth();
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiskData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's courses from Canvas
        const { data: courses, error: coursesError } = await supabase
          .from('canvas_courses')
          .select('*')
          .eq('user_id', user.id);

        if (coursesError) throw coursesError;

        const risks: RiskIndicator[] = [];

        for (const course of courses || []) {
          // Get assignments for this course
          const { data: assignments, error: assignmentsError } = await supabase
            .from('canvas_assignments')
            .select(`
              *,
              canvas_submissions(workflow_state, score, late)
            `)
            .eq('user_id', user.id)
            .eq('course_id', course.id);

          if (assignmentsError) continue;

          // Calculate risk metrics
          const gradedAssignments = assignments?.filter(a => a.canvas_submissions?.[0]?.score !== undefined) || [];
          const missingAssignments = assignments?.filter(a => !a.canvas_submissions?.[0]) || [];
          const lateSubmissions = assignments?.filter(a => a.canvas_submissions?.[0]?.late) || [];

          let currentGrade = 0;
          if (gradedAssignments.length > 0) {
            const totalScore = gradedAssignments.reduce((sum, a) => sum + (a.canvas_submissions?.[0]?.score || 0), 0);
            const totalPossible = gradedAssignments.reduce((sum, a) => sum + (a.points_possible || 0), 0);
            currentGrade = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
          }

          // Determine risk level
          let riskLevel: RiskLevel = 'low';
          const recommendations: string[] = [];
          const factors: string[] = [];

          if (currentGrade < 70 || missingAssignments.length >= 3) {
            riskLevel = 'high';
            if (currentGrade < 70) {
              factors.push(`Current grade: ${currentGrade}%`);
              recommendations.push('Current grade is below passing');
            }
            if (missingAssignments.length >= 3) {
              factors.push(`${missingAssignments.length} missing assignments`);
              recommendations.push(`${missingAssignments.length} missing assignments`);
            }
            recommendations.push('Schedule office hours with instructor');
          } else if (currentGrade < 80 || missingAssignments.length >= 1 || lateSubmissions.length >= 2) {
            riskLevel = 'medium';
            if (currentGrade < 80) factors.push(`Current grade: ${currentGrade}%`);
            if (missingAssignments.length > 0) {
              factors.push(`${missingAssignments.length} missing assignment(s)`);
              recommendations.push('Complete missing assignments');
            }
            if (lateSubmissions.length > 0) {
              factors.push(`${lateSubmissions.length} late submission(s)`);
              recommendations.push('Improve time management');
            }
            recommendations.push('Review challenging material');
          } else {
            factors.push(`Current grade: ${currentGrade}%`);
            recommendations.push('Maintain current performance');
          }

          risks.push({
            class_id: course.id,
            class_name: course.name,
            risk_level: riskLevel,
            current_grade: currentGrade,
            missing_assignments: missingAssignments.length,
            late_submissions: lateSubmissions.length,
            factors,
            recommendations,
          });
        }

        setRiskIndicators(risks);
      } catch (error) {
        console.error('Error fetching risk data:', error);
        setRiskIndicators([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRiskData();
  }, [user]);

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
    }
  };

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
    }
  };

  const highRiskCount = riskIndicators.filter(r => r.risk_level === 'high').length;
  const mediumRiskCount = riskIndicators.filter(r => r.risk_level === 'medium').length;

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Empty state
  if (riskIndicators.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No risk data yet</h3>
          <p className="text-sm text-muted-foreground">
            Sync your Canvas courses to see academic risk indicators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Academic Risk Indicators
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Early warning system for each class</p>
        </div>
        {(highRiskCount > 0 || mediumRiskCount > 0) && (
          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                {highRiskCount} High
              </span>
            )}
            {mediumRiskCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                {mediumRiskCount} Medium
              </span>
            )}
          </div>
        )}
      </div>

      {/* Risk Cards */}
      <div className="space-y-4">
        {riskIndicators.map((indicator) => (
          <div
            key={indicator.class_id}
            className={`p-5 rounded-xl border-2 ${getRiskColor(indicator.risk_level)}`}
          >
            {/* Class Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-foreground text-lg mb-1">{indicator.class_name}</h4>
                <div className="flex items-center gap-2">
                  {getRiskIcon(indicator.risk_level)}
                  <span className="text-sm font-semibold">{getRiskLabel(indicator.risk_level)}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(indicator.risk_level)}`}>
                {getRiskLabel(indicator.risk_level)}
              </span>
            </div>

            {/* Risk Factors */}
            {indicator.factors.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Risk Factors
                </div>
                <ul className="space-y-1">
                  {indicator.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span className="text-foreground">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {indicator.recommendations.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Recommended Actions
                </div>
                <ul className="space-y-2">
                  {indicator.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span className="text-sm text-foreground font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {indicator.risk_level !== 'low' && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                  Create Action Plan
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">
          {highRiskCount === 0 && mediumRiskCount === 0 ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <strong className="text-foreground">Great job!</strong> You're on track in all your classes. Keep up the excellent work!
            </span>
          ) : (
            <span>
              <strong className="text-foreground">Stay proactive:</strong> Address high-risk classes first, then focus on medium-risk areas. Early intervention makes a big difference!
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
