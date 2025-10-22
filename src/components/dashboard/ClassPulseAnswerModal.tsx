import { useState } from 'react';
import { X, Clock, Sparkles } from 'lucide-react';

type ClassPulseWithClass = {
  id: string;
  class_id: string;
  question: string;
  question_type: string;
  expires_at: string;
  classes: { name: string };
};

interface ClassPulseAnswerModalProps {
  pulse: ClassPulseWithClass;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pulseId: string, response: string) => Promise<void>;
}

export function ClassPulseAnswerModal({ pulse, isOpen, onClose, onSubmit }: ClassPulseAnswerModalProps) {
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setSubmitting(true);
    await onSubmit(pulse.id, response);
    setResponse('');
    setSubmitting(false);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-3">
                {pulse.classes.name}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {pulse.question}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-semibold">{getTimeRemaining(pulse.expires_at)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold text-white">+10 pts</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your answer here..."
            rows={8}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 text-base text-gray-800 placeholder:text-gray-400 resize-none"
            maxLength={500}
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{response.length}/500 characters</span>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || submitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Answer'}</span>
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
