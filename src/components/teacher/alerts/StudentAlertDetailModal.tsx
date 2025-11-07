import React, { useState, useEffect } from 'react';
import {
  X,
  Brain,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Clock,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import type { AtRiskStudent } from '../../../lib/alerts/atRiskDetection';
import { QuickInterventionModal } from './QuickInterventionModal';
import { supabase } from '../../../lib/supabase';
import { getLetterGrade } from '../../../lib/alerts/mockAcademicData';

interface StudentAlertDetailModalProps {
  student: AtRiskStudent;
  isOpen: boolean;
  onClose: () => void;
  onInterventionComplete: () => void;
}

interface InterventionLog {
  id: string;
  intervention_type: string;
  intervention_date: string;
  notes: string;
  outcome: string;
  outcome_date: string;
}

export function StudentAlertDetailModal({
  student,
  isOpen,
  onClose,
  onInterventionComplete,
}: StudentAlertDetailModalProps) {
  const [interventionHistory, setInterventionHistory] = useState<InterventionLog[]>([]);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadInterventionHistory();
    }
  }, [isOpen, student]);

  async function loadInterventionHistory() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('intervention_logs')
        .select('*')
        .eq('user_id', student.userId)
        .eq('class_id', student.classId)
        .order('intervention_date', { ascending: false });

      if (error) throw error;
      setInterventionHistory(data || []);
    } catch (error) {
      console.error('Error loading intervention history:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInterventionClick() {
    setIsInterventionModalOpen(true);
  }

  function handleInterventionModalClose() {
    setIsInterventionModalOpen(false);
  }

  async function handleInterventionSaved() {
    setIsInterventionModalOpen(false);
    await loadInterventionHistory();
    onInterventionComplete();
  }

  async function handleMarkAddressed() {
    try {
      // Acknowledge all alerts for this student
      for (const alertId of student.alertIds) {
        await supabase.rpc('acknowledge_alert', {
          alert_id_param: alertId,
          teacher_id_param: (await supabase.auth.getUser()).data.user?.id,
          notes_param: 'Marked as addressed from Care Alerts dashboard',
        });
      }
      onClose();
      onInterventionComplete();
    } catch (error) {
      console.error('Error marking alert as addressed:', error);
    }
  }

  // Generate recommended actions based on risk type
  function getRecommendedActions(): string[] {
    const actions: string[] = [];

    if (student.riskType === 'cross-risk') {
      actions.push('Schedule 1-on-1 meeting to discuss both emotional wellbeing and academic performance');
      actions.push('Consider deadline extension for missing assignments');
      actions.push('Send encouraging Hapi Moment acknowledging their challenges');
      actions.push('Refer to school counselor for additional support');
    } else if (student.riskType === 'emotional') {
      if (student.emotionalRisk?.persistentLow) {
        actions.push('Reach out privately to check on their wellbeing');
        actions.push('Send a personalized Hapi Moment to boost their mood');
      }
      if (student.emotionalRisk?.suddenDrop) {
        actions.push('Schedule immediate check-in to identify cause of mood drop');
        actions.push('Alert school counselor if situation appears serious');
      }
      if (student.emotionalRisk?.highVolatility) {
        actions.push('Monitor daily pulse checks for patterns');
        actions.push('Consider stress management resources or referral');
      }
      actions.push('Create a supportive classroom environment');
    } else if (student.riskType === 'academic') {
      if (student.academicRisk?.flags.lowGrade) {
        actions.push('Offer tutoring or additional academic support');
        actions.push('Schedule meeting to create improvement plan');
      }
      if (student.academicRisk?.flags.missingWork) {
        actions.push('Reach out about missing assignments and offer deadline extensions');
        actions.push('Identify barriers to assignment completion');
      }
      if (student.academicRisk?.flags.lowParticipation) {
        actions.push('Encourage class participation through small group work');
        actions.push('Check for understanding and offer clarification');
      }
    }

    return actions;
  }

  const recommendedActions = getRecommendedActions();

  // Get severity styling
  const severityConfig = {
    critical: {
      bgColor: 'bg-rose-600',
      textColor: 'text-white',
      label: 'CRITICAL ALERT',
    },
    high: {
      bgColor: 'bg-orange-600',
      textColor: 'text-white',
      label: 'HIGH PRIORITY',
    },
    medium: {
      bgColor: 'bg-yellow-600',
      textColor: 'text-white',
      label: 'MEDIUM PRIORITY',
    },
  };

  const severity = severityConfig[student.severity];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
          {/* Section 1: Header */}
          <div className={`${severity.bgColor} ${severity.textColor} p-6 rounded-t-2xl`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white font-bold text-2xl">
                  {student.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.studentName}</h2>
                  <p className="text-sm opacity-90">{student.className}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                    {severity.label}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Section 2: Emotional Concerns */}
            {student.emotionalRisk && (
              <div className="rounded-xl border border-border bg-purple-50/50 dark:bg-purple-900/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-foreground">Emotional Concerns</h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Sentiment</p>
                      <p className="text-lg font-bold text-foreground">
                        {student.emotionalRisk.currentSentiment.toFixed(1)} / 6.0
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Trend</p>
                      <div className="flex items-center gap-1">
                        {student.emotionalRisk.sentimentTrend === 'improving' && (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">Improving</span>
                          </>
                        )}
                        {student.emotionalRisk.sentimentTrend === 'declining' && (
                          <>
                            <TrendingDown className="h-4 w-4 text-rose-600" />
                            <span className="text-sm font-semibold text-rose-600">Declining</span>
                          </>
                        )}
                        {student.emotionalRisk.sentimentTrend === 'stable' && (
                          <span className="text-sm font-semibold text-muted-foreground">Stable</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {student.emotionalRisk.persistentLow && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />
                        <span className="text-foreground">Tier 1 sentiment for 3+ consecutive days</span>
                      </div>
                    )}
                    {student.emotionalRisk.prolongedNegative && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />
                        <span className="text-foreground">Tier 1-2 for &gt;5 out of 7 days</span>
                      </div>
                    )}
                    {student.emotionalRisk.suddenDrop && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />
                        <span className="text-foreground">Sudden mood drop from high to low</span>
                      </div>
                    )}
                    {student.emotionalRisk.highVolatility && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />
                        <span className="text-foreground">High emotional volatility (SD &gt; 1.5)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Academic Concerns */}
            {student.academicRisk && (
              <div className="rounded-xl border border-border bg-amber-50/50 dark:bg-amber-900/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-foreground">Academic Concerns</h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Grade</p>
                      <p className="text-lg font-bold text-foreground">
                        {student.academicRisk.currentGrade}% ({getLetterGrade(student.academicRisk.currentGrade)})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Missing Work</p>
                      <p className="text-lg font-bold text-foreground">
                        {student.academicRisk.missingAssignments}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Participation</p>
                      <p className="text-lg font-bold text-foreground">
                        {student.academicRisk.participationRate}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {student.academicRisk.flags.lowGrade && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-foreground">Grade below 70%</span>
                      </div>
                    )}
                    {student.academicRisk.flags.missingWork && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-foreground">3+ missing assignments</span>
                      </div>
                    )}
                    {student.academicRisk.flags.gradeDecline && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-foreground">Grade declined ≥1 letter grade</span>
                      </div>
                    )}
                    {student.academicRisk.flags.lowParticipation && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-foreground">Participation below 50%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Risk Timeline */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Risk Timeline</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days at risk:</span>
                  <span className="font-semibold text-foreground">{student.daysAtRisk} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First alert:</span>
                  <span className="font-semibold text-foreground">
                    {student.lastAlertDate.toLocaleDateString()}
                  </span>
                </div>
                {student.lastPulseCheck && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last pulse check:</span>
                    <span className="font-semibold text-foreground">
                      {student.lastPulseCheck.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Recommended Actions */}
            <div className="rounded-xl border border-border bg-blue-50/50 dark:bg-blue-900/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-foreground">Recommended Actions</h3>
              </div>
              <ul className="space-y-2">
                {recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 6: Intervention History */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Intervention History</h3>
                <span className="text-xs text-muted-foreground">
                  ({interventionHistory.length} total)
                </span>
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : interventionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No interventions recorded yet</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {interventionHistory.map((intervention) => (
                    <div
                      key={intervention.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {intervention.intervention_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(intervention.intervention_date).toLocaleDateString()}
                        </span>
                      </div>
                      {intervention.notes && (
                        <p className="text-xs text-muted-foreground mb-2">{intervention.notes}</p>
                      )}
                      {intervention.outcome && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          intervention.outcome === 'improved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : intervention.outcome === 'declined'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {intervention.outcome}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 7: Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleInterventionClick}
                className="px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Log Intervention
              </button>
              <button
                onClick={handleMarkAddressed}
                className="px-4 py-3 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-muted transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Mark Addressed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Intervention Modal */}
      {isInterventionModalOpen && (
        <QuickInterventionModal
          student={student}
          isOpen={isInterventionModalOpen}
          onClose={handleInterventionModalClose}
          onSaved={handleInterventionSaved}
        />
      )}
    </>
  );
}
