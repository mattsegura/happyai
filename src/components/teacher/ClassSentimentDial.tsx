import { Users, Smile, Meh, Frown } from 'lucide-react';
import { getSentimentLabel } from '../../lib/emotionConfig';

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
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{className}</h3>
          <p className="text-xs text-muted-foreground">Real-time sentiment</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Users className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative mb-4 h-36 w-36 sm:h-44 sm:w-44">
          <svg className="transform -rotate-90 w-36 h-36 sm:w-48 sm:h-48">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="sm:hidden text-muted dark:text-muted/50"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 376.8} 376.8`}
              strokeLinecap="round"
              className="transition-all duration-1000 sm:hidden text-emerald-500 dark:text-emerald-400"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              className="hidden sm:block text-muted dark:text-muted/50"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 502.4} 502.4`}
              strokeLinecap="round"
              className="transition-all duration-1000 hidden sm:block text-emerald-500 dark:text-emerald-400"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              {getSentimentIcon(averageSentiment)}
            </div>
            <span className="mt-2 text-2xl font-semibold text-foreground">{averageSentiment.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">out of 6</span>
          </div>
        </div>
        <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
          {getSentimentLabel(averageSentiment)}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span>Students checked in</span>
          <span className="font-semibold text-foreground">{checkedInCount}</span>
        </div>

        {/* Most Popular Emotion Display */}
        {topEmotions.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg border border-primary-200 dark:border-primary-500/30">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Most students feel
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400 capitalize">
                  {topEmotions[0].emotion}
                </span>
              </div>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {((topEmotions[0].count / checkedInCount) * 100).toFixed(0)}%
              </span>
            </div>
            {topEmotions.length > 1 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Second: {topEmotions[1].emotion} ({((topEmotions[1].count / checkedInCount) * 100).toFixed(0)}%)
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top emotions</p>
          <div className="space-y-2">
            {topEmotions.slice(0, 3).map(({ emotion, count }) => (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-400 dark:bg-primary-500" />
                  <span className="text-xs font-medium capitalize text-foreground">{emotion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-muted dark:bg-muted/50">
                    <div
                      className="h-full rounded-full bg-primary-400 dark:bg-primary-500"
                      style={{ width: `${(count / checkedInCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-6 text-right text-[10px] font-semibold text-muted-foreground">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
