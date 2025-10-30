import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  quizTitle: string;
  estimatedTime: string;
  questions: QuizQuestion[];
}

interface PracticeQuizModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export function PracticeQuizModal({ quiz, onClose }: PracticeQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [startTime] = useState(Date.now());
  const [submittedTime, setSubmittedTime] = useState<number | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setSubmittedTime(Date.now());
    setShowResults(true);
  };

  const handleRetry = () => {
    setUserAnswers({});
    setShowResults(false);
    setShowHint({});
    setCurrentQuestionIndex(0);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = userAnswers[q.id]?.trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    };
  };

  const getTimeTaken = () => {
    if (!submittedTime) return '0:00';
    const seconds = Math.floor((submittedTime - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isAnswered = (questionId: number) => {
    return userAnswers[questionId] !== undefined && userAnswers[questionId] !== '';
  };

  const isCorrect = (questionId: number) => {
    const userAnswer = userAnswers[questionId]?.trim().toLowerCase();
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return false;
    return userAnswer === question.correctAnswer.trim().toLowerCase();
  };

  const answeredCount = Object.keys(userAnswers).filter((id) => userAnswers[Number(id)]?.trim()).length;

  if (showResults) {
    const score = calculateScore();

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Results Header */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Quiz Results</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{score.percentage}%</div>
              <p className="text-xl opacity-90">
                {score.correct} out of {score.total} correct
              </p>
              <p className="text-sm opacity-75 mt-2">
                Time taken: {getTimeTaken()}
              </p>
            </div>
          </div>

          {/* Results Body */}
          <div className="p-6">
            {/* Performance Message */}
            <div className={`p-4 rounded-xl mb-6 ${
              score.percentage >= 90 ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' :
              score.percentage >= 70 ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' :
              'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
            }`}>
              <p className="font-semibold text-foreground mb-1">
                {score.percentage >= 90 ? '🎉 Excellent work!' :
                 score.percentage >= 70 ? '👍 Good job!' :
                 '📚 Keep practicing!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {score.percentage >= 90 ? 'You have a strong understanding of this material!' :
                 score.percentage >= 70 ? 'You\'re on the right track. Review the explanations below.' :
                 'Take some time to review the material and try again.'}
              </p>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Answer Review</h3>
              {quiz.questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const correct = isCorrect(question.id);

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-xl border-2 ${
                      correct
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium">Your answer:</span>{' '}
                            <span className={correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                              {userAnswer || 'Not answered'}
                            </span>
                          </p>
                          {!correct && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Correct answer:</span>{' '}
                              <span className="text-green-700 dark:text-green-400">
                                {question.correctAnswer}
                              </span>
                            </p>
                          )}
                          <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                            <p className="text-xs font-semibold text-primary mb-1">Explanation:</p>
                            <p className="text-sm text-foreground">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Quiz
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-border rounded-xl hover:bg-muted transition-colors font-medium text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{quiz.quizTitle}</h2>
              <p className="text-sm opacity-90">Estimated time: {quiz.estimatedTime}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Question {currentQuestionIndex + 1}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQuestion.type === 'multiple_choice'
                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                  : currentQuestion.type === 'true_false'
                  ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                  : 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
              }`}>
                {currentQuestion.type.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-base text-foreground font-medium mb-6 leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <>
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={userAnswers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mt-1 w-4 h-4 text-primary"
                      />
                      <span className="flex-1 text-foreground">{option}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.type === 'true_false' && (
                <>
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={userAnswers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="flex-1 font-medium text-foreground">{option}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.type === 'short_answer' && (
                <textarea
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            {/* Hint */}
            <div className="mt-4">
              <button
                onClick={() => setShowHint({ ...showHint, [currentQuestion.id]: !showHint[currentQuestion.id] })}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint[currentQuestion.id] ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint[currentQuestion.id] && (
                <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Hint:</span> Think about the key concepts we covered in the module.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-lg font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered(q.id)
                      ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                      : 'bg-muted text-muted-foreground border border-border hover:border-primary'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
