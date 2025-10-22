import { Users, Smile, Frown, Meh } from 'lucide-react';
import { getSentimentLabel, getSentimentColor as getConfigSentimentColor } from '../../lib/emotionConfig';
import { getStaticClassmates } from '../../lib/staticAnalyticsData';

export function ClassSentimentGauge() {
  const classmates = getStaticClassmates();
  const totalStudents = classmates.length;

  const averageSentiment = classmates.reduce((sum, c) => sum + c.value, 0) / totalStudents;
  const sentimentPercent = ((averageSentiment - 1) / 5) * 100;

  const getSentimentColorGradient = (avg: number): string => {
    return getConfigSentimentColor(avg).gradient;
  };

  const getSentimentIcon = (avg: number) => {
    if (avg >= 4.5) return <Smile className="w-8 h-8 text-white" />;
    if (avg >= 3) return <Meh className="w-8 h-8 text-white" />;
    return <Frown className="w-8 h-8 text-white" />;
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
    <div className="bg-white rounded-2xl p-5 border-2 border-green-200 shadow-md h-full">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Class Sentiment</h3>
          <p className="text-xs text-gray-600">How your classmates are feeling right now</p>
        </div>
      </div>

      <div className="flex items-stretch gap-6">
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm pb-2 border-b border-gray-100">
              <span className="text-gray-600 font-semibold">Students Checked In</span>
              <span className="text-gray-800 font-bold text-lg">{totalStudents}</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">Top Emotions:</p>
              <div className="space-y-3">
                {topEmotions.map(({ emotion, count }) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                      <span className="text-sm text-gray-700 capitalize">{emotion}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 mb-4">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#e5e7eb"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#2563eb"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${(sentimentPercent / 100) * 691} 691`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${getSentimentColorGradient(averageSentiment)} rounded-full flex items-center justify-center shadow-lg mb-3`}>
                {getSentimentIcon(averageSentiment)}
              </div>
              <span className="text-4xl font-bold text-gray-800">{averageSentiment.toFixed(1)}</span>
              <span className="text-sm text-gray-500">out of 6.0</span>
            </div>
          </div>

          <div className={`px-6 py-2 bg-gradient-to-r ${getSentimentColorGradient(averageSentiment)} rounded-full shadow-md`}>
            <span className="text-white font-bold text-base">{getSentimentLabel(averageSentiment)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Aggregate from all your classes
        </p>
      </div>
    </div>
  );
}
