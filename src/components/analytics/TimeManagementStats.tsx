import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';

interface TimeManagementStatsProps {
  dateRange: string;
}

export function TimeManagementStats({ dateRange }: TimeManagementStatsProps) {
  const mockData = [
    { class: 'Calculus II', hours: 8, color: '#f59e0b' },
    { class: 'Biology 101', hours: 6, color: '#ef4444' },
    { class: 'English Lit', hours: 5, color: '#a855f7' },
    { class: 'Chemistry', hours: 4, color: '#10b981' },
  ];

  const totalHours = mockData.reduce((sum, d) => sum + d.hours, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Time Management</h3>
        <Clock className="h-5 w-5 text-primary" />
      </div>

      <div className="text-center py-4">
        <div className="text-4xl font-bold text-foreground mb-1">{totalHours}h</div>
        <div className="text-sm text-muted-foreground">Study time this week</div>
      </div>

      <div className="space-y-3 mt-4">
        {mockData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{item.class}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.hours}h</span>
            </div>
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.hours / totalHours) * 100}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Avg per day</span>
        <span className="font-bold text-foreground">{(totalHours / 7).toFixed(1)}h</span>
      </div>
    </motion.div>
  );
}

