import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

interface UpcomingDeadlinesTimelineProps {
  dateRange: string;
}

export function UpcomingDeadlinesTimeline({ dateRange }: UpcomingDeadlinesTimelineProps) {
  const mockDeadlines = [
    { title: 'Math Quiz', course: 'Calculus II', date: 'Tomorrow', color: '#f59e0b', urgency: 'high' },
    { title: 'Bio Lab Report', course: 'Biology 101', date: 'In 3 days', color: '#ef4444', urgency: 'medium' },
    { title: 'Essay Draft', course: 'English Lit', date: 'Next week', color: '#a855f7', urgency: 'low' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Upcoming Deadlines</h3>
        <Calendar className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-3">
        {mockDeadlines.map((deadline, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: deadline.color }}
            >
              {deadline.course[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground">{deadline.title}</div>
              <div className="text-xs text-muted-foreground">{deadline.course}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {deadline.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

