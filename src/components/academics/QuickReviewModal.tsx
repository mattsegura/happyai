import { useState } from 'react';
import { X, BookOpen, Layers, Brain, ChevronLeft, ChevronRight, RotateCcw, Printer } from 'lucide-react';

interface ReviewMaterials {
  summary: string;
  keyPoints: string[];
  flashcards: Array<{ front: string; back: string }>;
  practiceProblems: Array<{ problem: string; solution: string }>;
}

interface QuickReviewModalProps {
  reviewMaterials: ReviewMaterials;
  courseName?: string;
  onClose: () => void;
}

type Tab = 'summary' | 'flashcards' | 'practice';

export function QuickReviewModal({ reviewMaterials, courseName, onClose }: QuickReviewModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const handleFlashcardNext = () => {
    if (currentFlashcardIndex < reviewMaterials.flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFlashcardPrevious = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleProblemNext = () => {
    if (currentProblemIndex < reviewMaterials.practiceProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setShowSolution(false);
    }
  };

  const handleProblemPrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
      setShowSolution(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentFlashcard = reviewMaterials.flashcards[currentFlashcardIndex];
  const currentProblem = reviewMaterials.practiceProblems[currentProblemIndex];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quick Review Materials</h2>
              {courseName && (
                <p className="text-sm opacity-90 mt-1">{courseName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30 flex-shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'summary'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Layers className="w-5 h-5" />
            Flashcards ({reviewMaterials.flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'practice'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Brain className="w-5 h-5" />
            Practice ({reviewMaterials.practiceProblems.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Overview
                </h3>
                <p className="text-foreground leading-relaxed">{reviewMaterials.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Key Points to Remember
                </h3>
                <div className="space-y-3">
                  {reviewMaterials.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-foreground leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h4 className="font-bold text-foreground mb-2">Study Tips:</h4>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Use the flashcards for active recall practice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Work through practice problems without looking at solutions first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Review key points multiple times over several days (spaced repetition)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Try to explain concepts to someone else to test your understanding</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === 'flashcards' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Card {currentFlashcardIndex + 1} of {reviewMaterials.flashcards.length}
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentFlashcardIndex + 1) / reviewMaterials.flashcards.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-80 cursor-pointer mb-6"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-gpu`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 flex items-center justify-center text-white shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-center">
                      <p className="text-sm font-semibold mb-4 opacity-80">QUESTION</p>
                      <p className="text-2xl font-bold leading-relaxed">{currentFlashcard.front}</p>
                      <p className="text-sm mt-6 opacity-70">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 flex items-center justify-center text-white shadow-xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="text-center">
                      <p className="text-sm font-semibold mb-4 opacity-80">ANSWER</p>
                      <p className="text-xl font-medium leading-relaxed">{currentFlashcard.back}</p>
                      <p className="text-sm mt-6 opacity-70">Click to see question</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleFlashcardPrevious}
                  disabled={currentFlashcardIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <button
                  onClick={() => {
                    setCurrentFlashcardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors font-medium text-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </button>

                <button
                  onClick={handleFlashcardNext}
                  disabled={currentFlashcardIndex === reviewMaterials.flashcards.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard Hint */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Tip: Click the card to flip • Use arrow buttons to navigate
                </p>
              </div>
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === 'practice' && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Problem {currentProblemIndex + 1} of {reviewMaterials.practiceProblems.length}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    Practice Problem
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentProblemIndex + 1) / reviewMaterials.practiceProblems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Problem */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-foreground mb-3">Problem:</h4>
                <p className="text-foreground leading-relaxed text-lg">{currentProblem.problem}</p>
              </div>

              {/* Solution */}
              <div className="mb-6">
                {!showSolution ? (
                  <button
                    onClick={() => setShowSolution(true)}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg"
                  >
                    Show Solution
                  </button>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Solution:
                    </h4>
                    <p className="text-foreground leading-relaxed whitespace-pre-line">
                      {currentProblem.solution}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleProblemPrevious}
                  disabled={currentProblemIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <button
                  onClick={() => {
                    setCurrentProblemIndex(0);
                    setShowSolution(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors font-medium text-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </button>

                <button
                  onClick={handleProblemNext}
                  disabled={currentProblemIndex === reviewMaterials.practiceProblems.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next Problem
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted/30 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-border rounded-xl hover:bg-muted transition-colors font-medium text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
