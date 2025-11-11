import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWorkloadByClass } from '@/lib/analytics/studentAnalytics';
import { mockAssignments } from '@/lib/canvas/mockPlanGenerator';

interface WorkloadGaugeProps {
  dateRange: string;
  selectedClass: string;
}

export function WorkloadGauge({ dateRange, selectedClass }: WorkloadGaugeProps) {
  const workloads = useMemo(() => {
    let data = calculateWorkloadByClass(mockAssignments);
    
    if (selectedClass !== 'all') {
      data = data.filter(w => w.courseId === selectedClass);
    }
    
    return data;
  }, [selectedClass]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical':
        return <Zap className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'from-green-500 to-emerald-600';
      case 'medium':
        return 'from-yellow-500 to-amber-600';
      case 'high':
        return 'from-orange-500 to-red-600';
      case 'critical':
        return 'from-red-600 to-rose-700';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-muted border-border';
    }
  };

  const getGaugePercentage = (points: number) => {
    // Scale: 0-500 points = 0-100%
    return Math.min(100, (points / 500) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-1 lg:col-span-2 xl:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Workload Gauge</h3>
          <p className="text-sm text-muted-foreground">Points due in next 7 days by class</p>
        </div>
        <Zap className="h-5 w-5 text-primary" />
      </div>

      {workloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
          <p className="text-sm font-medium text-foreground">All clear!</p>
          <p className="text-xs text-muted-foreground">No major assignments due in the next week</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workloads.map((workload, index) => {
            const percentage = getGaugePercentage(workload.points);
            
            return (
              <motion.div
                key={workload.courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn('p-4 rounded-lg border', getLevelBg(workload.level))}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: workload.courseColor }}
                    >
                      {workload.courseName.split(' ')[0][0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{workload.courseName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {workload.assignmentCount} {workload.assignmentCount === 1 ? 'assignment' : 'assignments'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(workload.level)}
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">{workload.points}</div>
                      <div className="text-xs text-muted-foreground capitalize">{workload.level}</div>
                    </div>
                  </div>
                </div>

                {/* Gauge Bar */}
                <div className="relative w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className={cn('h-full bg-gradient-to-r', getLevelColor(workload.level))}
                  />
                </div>

                {/* Points Breakdown */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Points</span>
                  <span className="text-xs font-medium text-foreground">
                    {workload.points} / 500
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Low (&lt;100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Medium (100-250)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-muted-foreground">High (250-400)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-xs text-muted-foreground">Critical (&gt;400)</span>
        </div>
      </div>
    </motion.div>
  );
}

