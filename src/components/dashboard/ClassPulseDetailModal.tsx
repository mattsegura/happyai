import { useState } from 'react';
import { X, MessageSquare, Sparkles, Award, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getModalAnimation, getBackdropAnimation, createConfetti } from '../../lib/animations';

interface ClassPulseDetailModalProps {
  pulse: {
    id: string;
    class_id: string;
    question: string;
    point_value?: number;
    classes?: { name: string };
    allow_anonymous?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ClassPulseDetailModal({ pulse, isOpen, onClose, onComplete }: ClassPulseDetailModalProps) {
  const { user } = useAuth();
  const [sliderValue, setSliderValue] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const pointValue = pulse.point_value || 20;
  const className = pulse.classes?.name || 'Class';

  const handleClose = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setShowSuccess(true);
      createConfetti(document.body);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsExiting(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      onComplete();
    } catch (error) {
      console.error('Error submitting pulse response:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-3xl p-8 border-2 border-green-300 dark:border-green-700 shadow-2xl max-w-md w-full ${getModalAnimation(!isExiting)}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-in">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Submitted!</h3>
              <p className="text-muted-foreground mb-4">Your response has been recorded</p>
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600">
                <Sparkles className="w-6 h-6" />
                <span>+{pointValue} points</span>
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className={`bg-card rounded-3xl p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-800 shadow-2xl max-w-lg w-full relative ${getModalAnimation(!isExiting)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 shadow-md transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {className}
            </span>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-foreground">{pointValue} pts</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground leading-tight">
            {pulse.question}
          </h2>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Not Ready</span>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg">
                  <span className="text-4xl font-bold">{sliderValue}</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Very Ready</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right,
                    rgb(254 202 202) 0%,
                    rgb(254 240 138) 50%,
                    rgb(187 247 208) 100%)`
                }}
              />
              <div className="flex justify-between mt-2 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span
                    key={num}
                    className={`text-xs font-semibold transition-all duration-300 ${
                      num === sliderValue
                        ? 'text-blue-600 scale-125'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {pulse.allow_anonymous && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="anonymousCheckbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-2 border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-400 cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="anonymousCheckbox" className="font-semibold text-purple-900 cursor-pointer flex items-center space-x-2">
                    <EyeOff className="w-4 h-4" />
                    <span>Submit Anonymously</span>
                  </label>
                  <p className="text-sm text-purple-800 mt-1">
                    Your response will be recorded without your name attached. Your teacher will see the feedback but won't know it came from you.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Submit Response</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>

          <style>{`
            .slider-thumb::-webkit-slider-thumb {
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              transition: all 0.2s ease;
            }

            .slider-thumb::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
            }

            .slider-thumb::-webkit-slider-thumb:active {
              transform: scale(1.1);
            }

            .slider-thumb::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border: none;
              border-radius: 50%;
              background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              transition: all 0.2s ease;
            }

            .slider-thumb::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
            }

            .slider-thumb::-moz-range-thumb:active {
              transform: scale(1.1);
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
