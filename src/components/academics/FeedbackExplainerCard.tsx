import { useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight, Lightbulb, BookOpen, Heart } from 'lucide-react';
import type { FeedbackExplanation, ImprovementPlan } from '../../lib/ai/features/feedbackExplainer';
import { FeedbackExplainerService } from '../../lib/ai/features/feedbackExplainer';
import { useAuth } from '../../contexts/AuthContext';
import { ImprovementPlanModal } from './ImprovementPlanModal';

interface FeedbackExplainerCardProps {
  submissionId: string;
  originalFeedback: string;
  score: number;
  pointsPossible: number;
  assignmentName: string;
}

export function FeedbackExplainerCard({
  submissionId,
  originalFeedback,
  score,
  pointsPossible,
  assignmentName,
}: FeedbackExplainerCardProps) {
  const { user } = useAuth();
  const [explanation, setExplanation] = useState<FeedbackExplanation | null>(null);
  const [improvementPlan, setImprovementPlan] = useState<ImprovementPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainFeedback = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const service = new FeedbackExplainerService(user.id);
      const result = await service.explainFeedback(submissionId);
      setExplanation(result);
    } catch (err) {
      console.error('Failed to explain feedback:', err);
      setError('Unable to explain feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createImprovementPlan = async () => {
    if (!user || !explanation) return;

    setPlanLoading(true);

    try {
      const service = new FeedbackExplainerService(user.id);
      const plan = await service.generateImprovementPlan(explanation);
      setImprovementPlan(plan);
      setShowPlanModal(true);
    } catch (err) {
      console.error('Failed to create improvement plan:', err);
      setError('Unable to create improvement plan. Please try again.');
    } finally {
      setPlanLoading(false);
    }
  };

  const percentage = (score / pointsPossible) * 100;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground">Instructor Feedback</h4>
        <div className="text-sm font-medium text-muted-foreground">
          {score}/{pointsPossible} ({percentage.toFixed(1)}%)
        </div>
      </div>

      {/* Original feedback */}
      {originalFeedback && originalFeedback.trim().length > 0 ? (
        <div className="bg-muted/30 p-3 rounded mb-3">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{originalFeedback}</p>
        </div>
      ) : (
        <div className="bg-muted/30 p-3 rounded mb-3">
          <p className="text-sm text-muted-foreground italic">No feedback provided by instructor.</p>
        </div>
      )}

      {/* AI explanation button */}
      {!explanation && (
        <button
          onClick={explainFeedback}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing feedback...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Explain this feedback with AI
            </>
          )}
        </button>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3 mb-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* AI explanation */}
      {explanation && (
        <div className="space-y-4">
          {/* Main explanation */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                  AI Explanation
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">{explanation.aiExplanation}</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {explanation.strengths.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-medium text-sm mb-2 text-green-900 dark:text-green-100">
                    What you did well:
                  </h5>
                  <ul className="space-y-1">
                    {explanation.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Areas for improvement */}
          {explanation.areasForImprovement.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-medium text-sm mb-2 text-orange-900 dark:text-orange-100">
                    Areas for improvement:
                  </h5>
                  <ul className="space-y-1">
                    {explanation.areasForImprovement.map((area, i) => (
                      <li key={i} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actionable advice */}
          {explanation.actionableAdvice.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-medium text-sm mb-2 text-purple-900 dark:text-purple-100">
                    Actionable advice:
                  </h5>
                  <ul className="space-y-1">
                    {explanation.actionableAdvice.map((advice, i) => (
                      <li key={i} className="text-sm text-purple-800 dark:text-purple-200 flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Encouraging message */}
          {explanation.encouragingMessage && (
            <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-pink-800 dark:text-pink-200 flex-1">
                  {explanation.encouragingMessage}
                </p>
              </div>
            </div>
          )}

          {/* Create improvement plan button */}
          <button
            onClick={createImprovementPlan}
            disabled={planLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {planLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating plan...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Create Improvement Plan
              </>
            )}
          </button>
        </div>
      )}

      {/* Improvement Plan Modal */}
      {improvementPlan && (
        <ImprovementPlanModal
          plan={improvementPlan}
          assignmentName={assignmentName}
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
