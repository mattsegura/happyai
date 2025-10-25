import { useState } from 'react';
import { EmotionSelector } from './EmotionSelector';
import { getSentimentLabel, getSentimentColor } from '../../lib/emotionConfig';
import { Sunrise, Sparkles } from 'lucide-react';

interface MorningPulseCheckProps {
  onComplete: () => void;
}

export function MorningPulseCheck({ onComplete }: MorningPulseCheckProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [sentimentValue, setSentimentValue] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn] = useState(false);

  const handleEmotionSelect = (emotion: string, value: number) => {
    setSelectedEmotion(emotion);
    setSentimentValue(value);
  };

  const handleSubmit = async () => {
    if (!selectedEmotion) return;

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
    onComplete();
  };

  if (hasCheckedIn) {
    return (
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 border-2 border-green-300 shadow-lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Done for Today!</h3>
          <p className="text-gray-600">You've completed your morning pulse check. See you tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 rounded-3xl p-8 border-2 border-orange-200 shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Sunrise className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
        Morning Pulse Check
      </h2>
      <p className="text-center text-gray-600 mb-6">
        How are you feeling today? Take a moment to check in with yourself.
      </p>

      <div className="mb-6">
        <EmotionSelector selected={selectedEmotion} onSelect={handleEmotionSelect} />
      </div>

      {selectedEmotion && sentimentValue && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className={`p-4 rounded-xl ${getSentimentColor(sentimentValue).bg} border-2 border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">You selected:</p>
                <p className={`text-xl font-bold ${getSentimentColor(sentimentValue).text}`}>{selectedEmotion}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600">Sentiment Level:</p>
                <p className={`text-3xl font-bold ${getSentimentColor(sentimentValue).text}`}>{sentimentValue}/6</p>
                <p className="text-xs text-gray-500">{getSentimentLabel(sentimentValue)}</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Want to share more? (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any thoughts about how you're feeling?"
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{notes.length}/200</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Complete Check-In</span>
                <Sparkles className="w-5 h-5" />
                <span className="bg-white/30 px-2 py-1 rounded-lg text-sm">+10 pts</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
