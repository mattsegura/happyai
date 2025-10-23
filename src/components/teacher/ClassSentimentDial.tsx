import { Users, Smile, Meh, Frown } from 'lucide-react';
import { getSentimentColor, getSentimentLabel } from '../../lib/emotionConfig';

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

  const getSentimentColorGradient = (avg: number): string => {
    return getSentimentColor(avg).gradient;
  };

  const getSentimentIcon = (avg: number) => {
    if (avg >= 4.5) return <Smile className="h-6 w-6" />;
    if (avg >= 3) return <Meh className="h-6 w-6" />;
    return <Frown className="h-6 w-6" />;
  };

  const checkedInCount = Math.floor(studentCount * 0.7);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{className}</h3>
          <p className="text-xs text-slate-500">Real-time sentiment</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
              className="sm:hidden"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#34d399"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 376.8} 376.8`}
              strokeLinecap="round"
              className="transition-all duration-1000 sm:hidden"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
              className="hidden sm:block"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#34d399"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 502.4} 502.4`}
              strokeLinecap="round"
              className="transition-all duration-1000 hidden sm:block"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              {getSentimentIcon(averageSentiment)}
            </div>
            <span className="mt-2 text-2xl font-semibold text-slate-900">{averageSentiment.toFixed(1)}</span>
            <span className="text-xs text-slate-500">out of 6</span>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {getSentimentLabel(averageSentiment)}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-xs text-slate-600">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span>Students checked in</span>
          <span className="font-semibold text-slate-900">{checkedInCount}</span>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Top emotions</p>
          <div className="space-y-2">
            {topEmotions.slice(0, 3).map(({ emotion, count }) => (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-400" />
                  <span className="text-xs font-medium capitalize text-slate-700">{emotion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary-400"
                      style={{ width: `${(count / checkedInCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-6 text-right text-[10px] font-semibold text-slate-500">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
