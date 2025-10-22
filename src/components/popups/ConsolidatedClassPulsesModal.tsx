import { useState, useEffect } from 'react';
import { X, MessageSquare, Clock, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getModalAnimation, getBackdropAnimation, createConfetti } from '../../lib/animations';

interface ClassPulse {
  id: string;
  class_id: string;
  question: string;
  question_type: string;
  expires_at: string;
  classes: { name: string };
  hasResponse: boolean;
  progress: any;
}

interface ConsolidatedClassPulsesModalProps {
  pulses: ClassPulse[];
  onComplete: () => void;
  onDismiss: () => void;
}

export function ConsolidatedClassPulsesModal({ pulses, onComplete, onDismiss }: ConsolidatedClassPulsesModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [completedPulses, setCompletedPulses] = useState<Set<string>>(new Set());
  const [isShowingSummary, setIsShowingSummary] = useState(false);

  useEffect(() => {
    if (pulses[currentStep]?.progress?.response_data) {
      setCurrentResponse(pulses[currentStep].progress.response_data.text || '');
    }
  }, [currentStep, pulses]);

  const currentPulse = pulses[currentStep];
  const totalPulses = pulses.length;
  const completedCount = completedPulses.size;

  const handleClose = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsOpen(false);
    onDismiss();
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

  const saveProgress = async () => {
    if (!user || !currentPulse || !currentResponse.trim()) return;

    const { data: existingProgress } = await supabase
      .from('pulse_response_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('class_pulse_id', currentPulse.id)
      .maybeSingle();

    const progressData = {
      user_id: user.id,
      class_pulse_id: currentPulse.id,
      class_id: currentPulse.class_id,
      response_data: { text: currentResponse },
      completion_percentage: 100,
      is_completed: false,
      last_updated: new Date().toISOString(),
    };

    if (existingProgress) {
      await supabase
        .from('pulse_response_progress')
        .update(progressData)
        .eq('id', existingProgress.id);
    } else {
      await supabase
        .from('pulse_response_progress')
        .insert(progressData);
    }
  };

  const handleNext = async () => {
    if (currentResponse.trim()) {
      await saveProgress();
      setResponses({ ...responses, [currentPulse.id]: currentResponse });
    }

    if (currentStep < totalPulses - 1) {
      setCurrentResponse('');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousPulse = pulses[currentStep - 1];
      setCurrentResponse(responses[previousPulse.id] || '');
    }
  };

  const handleSkip = async () => {
    setCurrentResponse('');
    if (currentStep < totalPulses - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitCurrent = async () => {
    if (!currentResponse.trim() || !user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('class_pulse_responses')
        .insert({
          class_pulse_id: currentPulse.id,
          user_id: user.id,
          class_id: currentPulse.class_id,
          response_text: currentResponse,
          points_earned: 10,
        });

      if (error) throw error;

      await supabase
        .from('pulse_response_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('class_pulse_id', currentPulse.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_points: (profile?.total_points || 0) + 10,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();

      setCompletedPulses(new Set([...completedPulses, currentPulse.id]));
      setCurrentResponse('');

      if (currentStep < totalPulses - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentStep(currentStep + 1);
      } else {
        setIsShowingSummary(true);
        createConfetti(document.body);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsExiting(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        setIsOpen(false);
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting pulse response:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isShowingSummary) {
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 z-[9998] ${getBackdropAnimation(!isExiting)}`} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-300 shadow-2xl max-w-md w-full ${getModalAnimation(!isExiting)}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-in">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">All Done!</h3>
              <p className="text-gray-600 mb-4">You completed all your class pulses</p>
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600">
                <Sparkles className="w-6 h-6" />
                <span>+{completedCount * 10} points</span>
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

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={`bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-2xl max-w-2xl w-full relative my-8 ${getModalAnimation(!isExiting)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 shadow-md transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Class Pulses</h2>
              </div>
              <div className="text-sm font-semibold text-gray-600">
                {currentStep + 1} of {totalPulses}
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              {pulses.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {currentPulse?.classes?.name || 'Class'}
              </span>
              <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">{getTimeRemaining(currentPulse?.expires_at)}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800">{currentPulse?.question}</h3>

            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">{currentResponse.length}/500</div>
          </div>

          <div className="flex items-center justify-between mt-6 space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-300"
            >
              Skip
            </button>

            {currentResponse.trim() ? (
              <button
                onClick={handleSubmitCurrent}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
              >
                <span>{loading ? 'Submitting...' : currentStep === totalPulses - 1 ? 'Finish' : 'Submit & Next'}</span>
                {!loading && (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="bg-white/30 px-2 py-0.5 rounded text-xs">+10</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentStep === totalPulses - 1}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {completedCount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {completedCount} completed
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">+{completedCount * 10} pts</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
