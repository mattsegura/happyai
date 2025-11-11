import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface ClassPerformanceComparisonProps {
  dateRange: string;
}

export function ClassPerformanceComparison({ dateRange }: ClassPerformanceComparisonProps) {
  const mockData = [
    { name: 'Calculus II', grade: 87, color: '#f59e0b' },
    { name: 'Biology 101', grade: 76, color: '#ef4444' },
    { name: 'English Lit', grade: 94, color: '#a855f7' },
    { name: 'Chemistry', grade: 85, color: '#10b981' },
  ];

  const maxGrade = 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Class Performance</h3>
        <BarChart3 className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-4">
        {mockData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>
                {item.grade}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.grade / maxGrade) * 100}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

