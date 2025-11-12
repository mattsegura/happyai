import { Users, Smile, Meh, Frown } from 'lucide-react';
import { getSentimentLabel } from '../../lib/emotionConfig';
import { motion } from 'framer-motion';

interface EmotionData {
  emotion: string;
  count: number;
}

interface ClassSentimentDialProps {
  className: string;
  studentCount: number;
  averageSentiment: number;
  topEmotions: EmotionData[];
}

export function ClassSentimentDial({ className, studentCount, averageSentiment, topEmotions }: ClassSentimentDialProps) {
  const sentimentPercent = ((averageSentiment - 1) / 5) * 100;

  const getSentimentIcon = (avg: number) => {
    if (avg >= 4.5) return <Smile className="h-6 w-6" />;
    if (avg >= 3) return <Meh className="h-6 w-6" />;
    return <Frown className="h-6 w-6" />;
  };

  const checkedInCount = Math.floor(studentCount * 0.7);

  return (
    <div className="h-full rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{className}</h3>
          <p className="text-xs text-muted-foreground">Real-time sentiment</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
          <Users className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative mb-3 h-32 w-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-muted/30 dark:text-muted/20"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 351.68} 351.68`}
              strokeLinecap="round"
              className="transition-all duration-1000"
              initial={{ strokeDasharray: "0 351.68" }}
              animate={{ strokeDasharray: `${(sentimentPercent / 100) * 351.68} 351.68` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" stopColor="currentColor" />
                <stop offset="100%" className="text-accent" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
              {getSentimentIcon(averageSentiment)}
            </div>
            <span className="mt-1.5 text-xl font-bold text-foreground">{averageSentiment.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">out of 6</span>
          </div>
        </div>
        <span className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {getSentimentLabel(averageSentiment)}
        </span>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <span className="text-muted-foreground">Checked in</span>
          <span className="font-semibold text-foreground">{checkedInCount}/{studentCount}</span>
        </div>

        {/* Most Popular Emotion Display */}
        {topEmotions.length > 0 && (
          <div className="p-2.5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-primary/20">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Most students feel
            </p>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent capitalize">
                {topEmotions[0].emotion}
              </span>
              <span className="text-sm font-bold text-primary">
                {((topEmotions[0].count / checkedInCount) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top emotions</p>
          <div className="space-y-1.5">
            {topEmotions.slice(0, 3).map(({ emotion, count }) => (
              <div key={emotion} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[11px] font-medium capitalize text-foreground truncate">{emotion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 rounded-full bg-muted/50">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / checkedInCount) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-5 text-right text-[10px] font-semibold text-muted-foreground">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
