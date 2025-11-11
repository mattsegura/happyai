import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface SentimentByClassWidgetProps {
  dateRange: string;
}

export function SentimentByClassWidget({ dateRange }: SentimentByClassWidgetProps) {
  const mockData = [
    { name: 'Calculus II', sentiment: 5.2, color: '#f59e0b' },
    { name: 'Biology 101', sentiment: 3.8, color: '#ef4444' },
    { name: 'English Lit', sentiment: 5.5, color: '#a855f7' },
    { name: 'Chemistry', sentiment: 4.3, color: '#10b981' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Sentiment by Class</h3>
        <BookOpen className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-4">
        {mockData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: item.color }}>
                  {item.name[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{item.sentiment.toFixed(1)}/6</span>
            </div>
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.sentiment / 6) * 100}%` }}
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

