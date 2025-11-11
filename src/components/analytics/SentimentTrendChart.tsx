import { motion } from 'framer-motion';
import { TrendingUp, Heart } from 'lucide-react';
import { mockDailySentiments } from '@/lib/analytics/mockStudentAnalyticsData';

interface SentimentTrendChartProps {
  dateRange: string;
}

export function SentimentTrendChart({ dateRange }: SentimentTrendChartProps) {
  const recentData = mockDailySentiments.slice(-14); // Last 14 days
  const avgSentiment = recentData.reduce((sum, d) => sum + d.sentimentValue, 0) / recentData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Sentiment Trend</h3>
          <p className="text-sm text-muted-foreground">Your emotional journey</p>
        </div>
        <Heart className="h-5 w-5 text-pink-600" />
      </div>

      {/* Simple Line Visualization */}
      <div className="flex items-end justify-between h-32 gap-1">
        {recentData.map((day, idx) => {
          const height = (day.sentimentValue / 6) * 100;
          const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500'];
          const colorIndex = Math.floor(day.sentimentValue) - 1;
          
          return (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`flex-1 rounded-t ${colors[colorIndex] || 'bg-gray-500'} min-w-[8px]`}
              title={`${day.emotion} (${day.sentimentValue}/6)`}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
        <div>
          <div className="text-sm text-muted-foreground">Average</div>
          <div className="text-2xl font-bold text-foreground">{avgSentiment.toFixed(1)}/6</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Trend</div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-2xl font-bold">+0.3</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

