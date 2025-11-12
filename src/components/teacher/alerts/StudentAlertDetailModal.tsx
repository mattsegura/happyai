import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border"
          >
            {/* Section 1: Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold text-xl shadow-sm">
                  {student.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{student.studentName}</h2>
                  <p className="text-sm text-muted-foreground">{student.className}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${severity.badgeBg} ${severity.badgeText}`}>
                    {severity.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
              {/* Section 2: Emotional Concerns */}
              {student.emotionalRisk && (
                <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Emotional Concerns</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Current Sentiment</p>
                        <p className="text-lg font-bold text-foreground">
                          {student.emotionalRisk.currentSentiment.toFixed(1)} / 6.0
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Trend</p>
                        <div className="flex items-center gap-1.5">
                          {student.emotionalRisk.sentimentTrend === 'improving' && (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">Improving</span>
                            </>
                          )}
                          {student.emotionalRisk.sentimentTrend === 'declining' && (
                            <>
                              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Declining</span>
                            </>
                          )}
                          {student.emotionalRisk.sentimentTrend === 'stable' && (
                            <span className="text-sm font-bold text-muted-foreground">Stable</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {student.emotionalRisk.persistentLow && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Tier 1 sentiment for 3+ consecutive days</span>
                        </div>
                      )}
                      {student.emotionalRisk.prolongedNegative && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Tier 1-2 for &gt;5 out of 7 days</span>
                        </div>
                      )}
                      {student.emotionalRisk.suddenDrop && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Sudden mood drop from high to low</span>
                        </div>
                      )}
                      {student.emotionalRisk.highVolatility && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">High emotional volatility (SD &gt; 1.5)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Academic Concerns */}
              {student.academicRisk && (
                <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Academic Concerns</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Current Grade</p>
                        <p className="text-base font-bold text-foreground">
                          {student.academicRisk.currentGrade}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({getLetterGrade(student.academicRisk.currentGrade)})
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Missing Work</p>
                        <p className="text-base font-bold text-foreground">
                          {student.academicRisk.missingAssignments}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Participation</p>
                        <p className="text-base font-bold text-foreground">
                          {student.academicRisk.participationRate}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {student.academicRisk.flags.lowGrade && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Grade below 70%</span>
                        </div>
                      )}
                      {student.academicRisk.flags.missingWork && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">3+ missing assignments</span>
                        </div>
                      )}
                      {student.academicRisk.flags.gradeDecline && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Grade declined ≥1 letter grade</span>
                        </div>
                      )}
                      {student.academicRisk.flags.lowParticipation && (
                        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground font-medium">Participation below 50%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Risk Timeline */}
              <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Risk Timeline</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground font-medium">Days at risk:</span>
                    <span className="font-bold text-foreground">{student.daysAtRisk} days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground font-medium">First alert:</span>
                    <span className="font-bold text-foreground">
                      {student.lastAlertDate.toLocaleDateString()}
                    </span>
                  </div>
                  {student.lastPulseCheck && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground font-medium">Last pulse check:</span>
                      <span className="font-bold text-foreground">
                        {student.lastPulseCheck.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Recommended Actions */}
              <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Recommended Actions</h3>
                </div>
                <ul className="space-y-2">
                  {recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 6: Intervention History */}
              <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Intervention History</h3>
                  <span className="text-xs font-semibold text-muted-foreground ml-auto">
                    ({interventionHistory.length} total)
                  </span>
                </div>

                {isLoading ? (
                  <p className="text-sm text-muted-foreground font-medium">Loading...</p>
                ) : interventionHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic font-medium">No interventions recorded yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {interventionHistory.map((intervention) => (
                      <div
                        key={intervention.id}
                        className="p-3 rounded-lg bg-muted/50 border border-border/40"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">
                            {intervention.intervention_type}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {new Date(intervention.intervention_date).toLocaleDateString()}
                          </span>
                        </div>
                        {intervention.notes && (
                          <p className="text-xs text-muted-foreground font-medium mb-2">{intervention.notes}</p>
                        )}
                        {intervention.outcome && (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
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
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleInterventionClick}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-600 text-white text-sm font-bold hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  Log Intervention
                </button>
                <button
                  onClick={handleMarkAddressed}
                  className="px-4 py-3 rounded-lg border border-border/60 bg-card text-foreground text-sm font-bold hover:bg-muted hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Addressed
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Intervention Modal */}
      {isInterventionModalOpen && (
        <QuickInterventionModal
          student={student}
          isOpen={isInterventionModalOpen}
          onClose={handleInterventionModalClose}
          onSaved={handleInterventionSaved}
        />
      )}
    </AnimatePresence>
  );
}
