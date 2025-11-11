import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateCompletionRate } from '@/lib/analytics/studentAnalytics';
import { mockAssignmentCompletions } from '@/lib/analytics/mockStudentAnalyticsData';

interface AssignmentCompletionRateProps {
  dateRange: string;
  selectedClass: string;
}

export function AssignmentCompletionRate({ dateRange, selectedClass }: AssignmentCompletionRateProps) {
  const completionData = useMemo(() => {
    let data = mockAssignmentCompletions;
    
    if (selectedClass !== 'all') {
      data = data.filter(c => c.courseId === selectedClass);
    }
    
    return calculateCompletionRate(data);
  }, [selectedClass]);

  const percentage = completionData.percentage;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Completion Rate</h3>
          <p className="text-sm text-muted-foreground">Assignments completed</p>
        </div>
        <Target className="h-5 w-5 text-primary" />
      </div>

      <div className="flex items-center justify-center py-4">
        {/* Donut Chart */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="url(#completionGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-4xl font-bold text-foreground"
            >
              {Math.round(percentage)}%
            </motion.div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <div className="text-sm font-medium text-foreground">Completed</div>
            <div className="text-xl font-bold text-green-600">{completionData.completed}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
          <Circle className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium text-foreground">Pending</div>
            <div className="text-xl font-bold text-orange-600">{completionData.pending}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{completionData.completed} of {completionData.total}</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>
    </motion.div>
  );
}

