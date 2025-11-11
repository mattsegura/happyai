import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';

interface MoodDistributionChartProps {
  dateRange: string;
}

export function MoodDistributionChart({ dateRange }: MoodDistributionChartProps) {
  const mockData = [
    { category: 'Excellent', count: 12, color: '#10b981', percentage: 35 },
    { category: 'Positive', count: 10, color: '#3b82f6', percentage: 29 },
    { category: 'Neutral', count: 8, color: '#64748b', percentage: 24 },
    { category: 'Negative', count: 4, color: '#f59e0b', percentage: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Mood Distribution</h3>
        <PieChart className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-3">
        {mockData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-foreground">{item.category}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{item.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

