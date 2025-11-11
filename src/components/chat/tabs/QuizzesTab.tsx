import { useState } from 'react';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { quizHistory } from '../../../lib/mockData/toolHistory';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
};

export function QuizzesTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const updated = [...questions];
    updated[currentIndex].userAnswer = answerIndex;
    setQuestions(updated);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    } else {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const score = questions.filter(q => q.userAnswer === q.correctAnswer).length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={quizHistory}
        title="Previous Quizzes"
        onSelectItem={(item) => {
          console.log('Selected quiz:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* File Upload Section - Persistent across all Study Buddy pages */}
        <StudyBuddyFileUpload />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-600" />
          AI-Generated Quizzes
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Practice with AI-generated questions based on your study materials
        </p>
      </div>

      {questions.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Quizzes Yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload study materials using the file upload section above to generate AI-powered practice quizzes
            </p>
          </div>
        </div>
      ) : showResults ? (
        /* Results */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-4">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Quiz Complete!
            </h3>
            <p className="text-muted-foreground mb-8">
              You got {score} out of {questions.length} questions correct
            </p>

            <div className="space-y-4 mb-8">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-muted/30 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    {q.userAnswer === q.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground mb-2">{q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Your answer: {q.options[q.userAnswer!]} 
                        {q.userAnswer !== q.correctAnswer && ` • Correct: ${q.options[q.correctAnswer]}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setQuestions([]);
                setCurrentIndex(0);
                setShowResults(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Questions */
        <div className="flex-1 flex flex-col">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
            <div className="w-full p-8 bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-3xl shadow-xl mb-8">
              <p className="text-2xl font-bold text-center text-foreground">
                {currentQuestion?.question}
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={currentQuestion.userAnswer !== undefined}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left font-semibold transition-all",
                    currentQuestion.userAnswer === undefined
                      ? "border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      : currentQuestion.userAnswer === idx
                      ? idx === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-muted opacity-50"
                  )}
                >
                  <span className="text-sm text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
