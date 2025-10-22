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
    if (avg >= 4.5) return <Smile className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
    if (avg >= 3) return <Meh className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
    return <Frown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
  };

  const checkedInCount = Math.floor(studentCount * 0.7);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-green-200 shadow-md h-full">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">{className}</h3>
          <p className="text-[10px] sm:text-xs text-gray-600">Real-time class sentiment</p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 mb-3 sm:mb-4">
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
              stroke="#2563eb"
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
              stroke="#2563eb"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(sentimentPercent / 100) * 502.4} 502.4`}
              strokeLinecap="round"
              className="transition-all duration-1000 hidden sm:block"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${getSentimentColorGradient(averageSentiment)} rounded-full flex items-center justify-center shadow-lg mb-1 sm:mb-2`}>
              {getSentimentIcon(averageSentiment)}
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-800">{averageSentiment.toFixed(1)}</span>
            <span className="text-[10px] sm:text-xs text-gray-500">out of 6.0</span>
          </div>
        </div>

        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${getSentimentColorGradient(averageSentiment)} rounded-full shadow-md`}>
          <span className="text-white font-bold text-xs sm:text-sm">{getSentimentLabel(averageSentiment)}</span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm pb-2 border-b border-gray-100">
          <span className="text-gray-600 font-semibold">Students Checked In</span>
          <span className="text-gray-800 font-bold">{checkedInCount}</span>
        </div>

        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2">Top Emotions:</p>
          <div className="space-y-1.5 sm:space-y-2">
            {topEmotions.slice(0, 3).map(({ emotion, count }) => (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                  <span className="text-xs sm:text-sm text-gray-700 capitalize">{emotion}</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / checkedInCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 w-6 sm:w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
