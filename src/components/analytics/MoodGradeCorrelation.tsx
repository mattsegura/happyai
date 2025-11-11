import { motion } from 'framer-motion';
import { TrendingUp, Heart, Brain } from 'lucide-react';

interface MoodGradeCorrelationProps {
  dateRange: string;
}

export function MoodGradeCorrelation({ dateRange }: MoodGradeCorrelationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Mood-Grade Correlation</h3>
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4 text-pink-600" />
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">+0.67</div>
          <div className="text-sm text-muted-foreground">Moderate Positive Correlation</div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            Better mood tends to correlate with better grades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Avg Sentiment</div>
          <div className="text-xl font-bold text-foreground">4.2/6</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Avg Grade</div>
          <div className="text-xl font-bold text-foreground">85%</div>
        </div>
      </div>
    </motion.div>
  );
}

