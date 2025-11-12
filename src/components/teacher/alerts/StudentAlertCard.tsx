import { motion } from 'framer-motion';
import {
  Brain,
  GraduationCap,
  AlertCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import type { AtRiskStudent } from '../../../lib/alerts/atRiskDetection';

interface StudentAlertCardProps {
  student: AtRiskStudent;
  onViewDetails: (student: AtRiskStudent) => void;
}

export function StudentAlertCard({ student, onViewDetails }: StudentAlertCardProps) {
  // Get severity styling
  const severityConfig = {
    critical: {
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      borderColor: 'border-rose-200 dark:border-rose-800',
      textColor: 'text-rose-700 dark:text-rose-300',
      badgeBg: 'bg-rose-600 dark:bg-rose-500',
      badgeText: 'text-white',
      label: 'CRITICAL',
      animate: 'animate-pulse',
    },
    high: {
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-700 dark:text-orange-300',
      badgeBg: 'bg-orange-600 dark:bg-orange-500',
      badgeText: 'text-white',
      label: 'HIGH',
      animate: '',
    },
    medium: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      badgeBg: 'bg-yellow-600 dark:bg-yellow-500',
      badgeText: 'text-white',
      label: 'MEDIUM',
      animate: '',
    },
  };

  const severity = severityConfig[student.severity];

  // Get risk type badges
  const showEmotionalBadge =
    student.riskType === 'emotional' || student.riskType === 'cross-risk';
  const showAcademicBadge =
    student.riskType === 'academic' || student.riskType === 'cross-risk';

  // Format days at risk
  function formatDaysAtRisk() {
    if (student.daysAtRisk === 0) return 'New';
    if (student.daysAtRisk === 1) return '1 day';
    return `${student.daysAtRisk} days`;
  }

  // Get concern preview text
  function getConcernPreview(): string[] {
    const concerns: string[] = [];

    if (student.emotionalRisk) {
      if (student.emotionalRisk.persistentLow) {
        concerns.push('Tier 1 mood for 3+ consecutive days');
      }
      if (student.emotionalRisk.suddenDrop) {
        concerns.push('Sudden mood drop');
      }
      if (student.emotionalRisk.prolongedNegative) {
        concerns.push('Prolonged negative sentiment');
      }
      if (student.emotionalRisk.highVolatility) {
        concerns.push('High emotional volatility');
      }
    }

    if (student.academicRisk) {
      if (student.academicRisk.flags.lowGrade) {
        concerns.push(`Grade: ${student.academicRisk.currentGrade}%`);
      }
      if (student.academicRisk.flags.missingWork) {
        concerns.push(
          `${student.academicRisk.missingAssignments} missing assignments`
        );
      }
      if (student.academicRisk.flags.gradeDecline) {
        concerns.push('Grade declining');
      }
      if (student.academicRisk.flags.lowParticipation) {
        concerns.push(`${student.academicRisk.participationRate}% participation`);
      }
    }

    return concerns.slice(0, 3); // Show max 3 concerns
  }

  const concerns = getConcernPreview();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4 ${severity.animate}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Avatar placeholder */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 text-foreground font-semibold text-sm">
              {student.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{student.studentName}</h3>
              <p className="text-xs text-muted-foreground">{student.className}</p>
            </div>
          </div>
        </div>

        {/* Severity Badge */}
        <span
          className={`${severity.badgeBg} ${severity.badgeText} px-2 py-1 rounded-full text-[10px] font-bold tracking-wider`}
        >
          {severity.label}
        </span>
      </div>

      {/* Risk Type Badges */}
      <div className="flex gap-2 mb-3">
        {showEmotionalBadge && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/50">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/40 dark:to-purple-900/40">
              <Brain className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Emotional
            </span>
          </div>
        )}
        {showAcademicBadge && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800/40 dark:to-amber-900/40">
              <GraduationCap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Academic
            </span>
          </div>
        )}
      </div>

      {/* Days at Risk */}
      <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded-lg bg-muted/50">
        <div className="w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/20">
          <Clock className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">At risk for {formatDaysAtRisk()}</span>
      </div>

      {/* Concerns Preview */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Concerns:
        </p>
        {concerns.length > 0 ? (
          <ul className="space-y-1.5">
            {concerns.map((concern, index) => (
              <li
                key={index}
                className="text-xs text-foreground flex items-start gap-2 pl-1"
              >
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-rose-500 dark:text-rose-400" />
                <span className="font-medium">{concern}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic pl-1">No specific concerns listed</p>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewDetails(student)}
          className="px-3 py-2 rounded-lg border border-border/60 bg-card text-foreground text-xs font-bold hover:bg-muted hover:shadow-sm transition-all duration-200"
        >
          View Details
        </button>
        <button
          onClick={() => onViewDetails(student)}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold hover:from-primary-600 hover:to-primary-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Reach Out
        </button>
      </div>

      {/* Last Intervention Indicator */}
      {student.interventionCount > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground font-medium">
            {student.interventionCount} previous intervention{student.interventionCount > 1 ? 's' : ''}
            {student.lastIntervention && (
              <> • Last: {new Date(student.lastIntervention).toLocaleDateString()}</>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
}
