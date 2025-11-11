import { motion } from 'framer-motion';
import { Smile, Heart } from 'lucide-react';

interface EmotionFrequencyWidgetProps {
  dateRange: string;
}

export function EmotionFrequencyWidget({ dateRange }: EmotionFrequencyWidgetProps) {
  const mockEmotions = [
    { name: 'Happy', count: 12, percentage: 35, emoji: '😊' },
    { name: 'Content', count: 10, percentage: 29, emoji: '😌' },
    { name: 'Tired', count: 5, percentage: 15, emoji: '😴' },
    { name: 'Excited', count: 4, percentage: 12, emoji: '🤩' },
    { name: 'Worried', count: 3, percentage: 9, emoji: '😰' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Top Emotions</h3>
        <Smile className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-3">
        {mockEmotions.map((emotion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emotion.emoji}</span>
              <div>
                <div className="font-medium text-foreground">{emotion.name}</div>
                <div className="text-xs text-muted-foreground">{emotion.count} times</div>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">{emotion.percentage}%</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

