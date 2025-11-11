import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';

interface WorkloadStressCorrelationProps {
  dateRange: string;
}

export function WorkloadStressCorrelation({ dateRange }: WorkloadStressCorrelationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Workload vs Stress</h3>
        <Activity className="h-5 w-5 text-primary" />
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">-0.54</div>
          <div className="text-sm text-muted-foreground">Moderate Negative Correlation</div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            Higher workload tends to correlate with lower mood
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Current Workload</div>
          <div className="text-xl font-bold text-orange-600">525 pts</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Stress Level</div>
          <div className="text-xl font-bold text-yellow-600">Medium</div>
        </div>
      </div>
    </motion.div>
  );
}

