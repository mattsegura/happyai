import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradeTrendChartProps {
  dateRange: string;
  selectedClass: string;
}

export function GradeTrendChart({ dateRange, selectedClass }: GradeTrendChartProps) {
  const mockData = [
    { course: 'Calculus II', current: 87, previous: 82, trend: 'up' },
    { course: 'Biology 101', current: 76, previous: 78, trend: 'down' },
    { course: 'English Lit', current: 94, previous: 94, trend: 'stable' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-foreground mb-4">Grade Trends</h3>
      <div className="space-y-4">
        {mockData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-foreground">{item.course}</div>
              <div className="text-xs text-muted-foreground">
                {item.previous}% → {item.current}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{item.current}%</span>
              {item.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
              {item.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
              {item.trend === 'stable' && <Minus className="h-5 w-5 text-yellow-600" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

