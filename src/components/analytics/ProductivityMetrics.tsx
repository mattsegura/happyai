import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

interface ProductivityMetricsProps {
  dateRange: string;
}

export function ProductivityMetrics({ dateRange }: ProductivityMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Productivity Score</h3>
        <Zap className="h-5 w-5 text-yellow-600" />
      </div>

      <div className="text-center py-4">
        <div className="text-5xl font-bold text-foreground mb-2">78</div>
        <div className="text-sm text-muted-foreground">Out of 100</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <div className="text-2xl font-bold text-blue-600">8.5</div>
          <div className="text-xs text-muted-foreground">Efficiency</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
          <div className="text-2xl font-bold text-green-600">7.2</div>
          <div className="text-xs text-muted-foreground">Consistency</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
          <div className="text-2xl font-bold text-purple-600">6.8</div>
          <div className="text-xs text-muted-foreground">Planning</div>
        </div>
      </div>
    </motion.div>
  );
}

