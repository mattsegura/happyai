import { Users, Smile, Frown, Meh } from 'lucide-react';
import { getSentimentLabel } from '../../lib/emotionConfig';
import { getStaticClassmates } from '../../lib/staticAnalyticsData';

export function ClassSentimentGauge() {
  const classmates = getStaticClassmates();
  const totalStudents = classmates.length;

  const averageSentiment = classmates.reduce((sum, c) => sum + c.value, 0) / totalStudents;
  const sentimentPercent = ((averageSentiment - 1) / 5) * 100;

  const getSentimentIcon = (avg: number) => {
    if (avg >= 4.5) return <Smile className="h-7 w-7" />;
    if (avg >= 3) return <Meh className="h-7 w-7" />;
    return <Frown className="h-7 w-7" />;
  };

  const emotionBreakdown = classmates.reduce((acc, c) => {
    acc[c.emotion] = (acc[c.emotion] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topEmotions = Object.entries(emotionBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion, count]) => ({ emotion, count }));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Class sentiment</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Across all active courses</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {totalStudents} check-ins
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,260px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top emotions today</p>
            <div className="mt-4 space-y-3">
              {topEmotions.map(({ emotion, count }) => (
                <div key={emotion} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium capitalize text-foreground">{emotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 rounded-full bg-background border border-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((count / totalStudents) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average sentiment</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{averageSentiment.toFixed(1)} / 6</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class mood</p>
              <p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{getSentimentLabel(averageSentiment)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {getSentimentIcon(averageSentiment)}
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Class energy today</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{averageSentiment.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">out of 6</p>
          <div className="mt-6 h-2 w-full rounded-full bg-background border border-border">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.round(sentimentPercent)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Insights combine sentiment pulses, Hapi moments, and class participation responses within the last 48 hours.
      </p>
    </div>
  );
}
