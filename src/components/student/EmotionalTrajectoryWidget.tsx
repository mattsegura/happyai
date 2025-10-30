import { mockSentimentHistory } from '../../lib/mockData';
import { generateEmotionalTrajectory } from '../../lib/studentCalculations';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

export function EmotionalTrajectoryWidget() {
  const moodData = mockSentimentHistory.slice(-14); // Last 14 days
  const { summary, dominantEmotions, recommendation } = generateEmotionalTrajectory(moodData);

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Emotional Trajectory
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </h3>
          <p className="text-xs text-muted-foreground">AI-generated wellbeing summary</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-4">
        <p className="text-sm text-foreground leading-relaxed">
          {summary.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index}>{part}</strong> : part
          )}
        </p>
      </div>

      {/* Dominant Emotions */}
      {dominantEmotions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Most Frequent Emotions
          </div>
          <div className="flex flex-wrap gap-2">
            {dominantEmotions.map((emotion, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/70 dark:bg-gray-800/70 text-foreground border border-purple-200 dark:border-purple-800"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
              Recommendation
            </div>
            <p className="text-sm text-foreground">{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
