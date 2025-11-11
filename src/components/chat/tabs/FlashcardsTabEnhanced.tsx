import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Volume2,
  RotateCw,
  Check,
  X,
  Grid,
  Star,
  Settings,
  BookOpen,
  TrendingUp,
  Sparkles,
  FileText,
  Filter
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Flashcard } from '../../../lib/types/studyPlan';
import { mockFlashcards, flashcardsByTopic, getFlashcardsNeedingReview, getMasteredFlashcards } from '../../../lib/mockData/flashcards';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';

type ViewMode = 'study' | 'grid';
type FilterMode = 'all' | 'need-practice' | 'mastered';

export function FlashcardsTabEnhanced() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const masteredCount = flashcards.filter(c => c.masteryScore >= 90).length;
  const needsPracticeCount = flashcards.filter(c => c.masteryScore < 80).length;

  // Apply filter
  useEffect(() => {
    let filtered: Flashcard[] = [];
    switch (filterMode) {
      case 'need-practice':
        filtered = getFlashcardsNeedingReview();
        break;
      case 'mastered':
        filtered = getMasteredFlashcards();
        break;
      default:
        filtered = mockFlashcards;
    }
    setFlashcards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
      setShowExplanation(false);
      setConfidenceRating(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
      setShowExplanation(false);
      setConfidenceRating(null);
    }
  };

  const handleCardClick = (index: number) => {
    setCurrentIndex(index);
    setViewMode('study');
    setIsFlipped(false);
    setShowHint(false);
    setShowExplanation(false);
  };

  const handleConfidenceRating = (rating: number) => {
    setConfidenceRating(rating);
    // In a real app, this would update the card's mastery score
  };

  const handleReadAloud = () => {
    // Mock TTS functionality
    const text = isFlipped ? currentCard.back : currentCard.front;
    console.log('Reading aloud:', text);
    // In a real app: window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col h-full p-6">
        <StudyBuddyFileUpload />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Brain className="w-16 h-16 mx-auto text-violet-600 dark:text-violet-400 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Flashcards Found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filterMode === 'need-practice' && 'Great job! No cards need practice right now.'}
              {filterMode === 'mastered' && 'No cards mastered yet. Keep studying!'}
              {filterMode === 'all' && 'Upload materials above to generate flashcards'}
            </p>
            <button
              onClick={() => setFilterMode('all')}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Show All Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* File Upload Section */}
      <div className="px-6 pt-6">
        <StudyBuddyFileUpload />
      </div>

      {/* Header with Stats and Controls */}
      <div className="px-6 py-4 border-b border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-violet-600" />
              Smart Flashcards
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {flashcards.length} cards • {masteredCount} mastered • {needsPracticeCount} need practice
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
            >
              <option value="all">All Cards ({mockFlashcards.length})</option>
              <option value="need-practice">Need Practice ({getFlashcardsNeedingReview().length})</option>
              <option value="mastered">Mastered ({getMasteredFlashcards().length})</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
              <button
                onClick={() => setViewMode('study')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'study' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
                )}
                title="Study Mode"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
                )}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="text-primary">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'study' ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            {/* Flashcard */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl"
            >
              {/* Card Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
                    currentCard.difficulty === 'easy' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                    currentCard.difficulty === 'medium' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                    currentCard.difficulty === 'hard' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  )}>
                    {currentCard.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                    {currentCard.type.replace('-', ' ')}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {currentCard.topic}
                  </span>
                </div>

                {/* Mastery Score */}
                <div className="flex items-center gap-2">
                  <TrendingUp className={cn(
                    'w-4 h-4',
                    currentCard.masteryScore >= 90 ? 'text-green-600' : 
                    currentCard.masteryScore >= 70 ? 'text-amber-600' :
                    'text-red-600'
                  )} />
                  <span className="text-sm font-bold text-foreground">
                    {currentCard.masteryScore}% Mastered
                  </span>
                </div>
              </div>

              {/* The Card */}
              <div
                onClick={handleFlip}
                className="relative cursor-pointer select-none"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="relative w-full bg-card border-2 border-border/60 rounded-2xl shadow-xl p-8 min-h-[400px] flex flex-col items-center justify-center"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center p-8',
                      isFlipped && 'invisible'
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-4" />
                    <h3 className="text-2xl font-bold text-center text-foreground mb-4">
                      {currentCard.front}
                    </h3>
                    {currentCard.type === 'mcq' && currentCard.options && (
                      <div className="w-full space-y-2 mt-4">
                        {currentCard.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-muted/30 rounded-lg text-center font-medium"
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-6">Click to flip</p>
                  </div>

                  {/* Back Side */}
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center p-8',
                      !isFlipped && 'invisible'
                    )}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Check className="w-8 h-8 text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold text-center text-foreground mb-4">
                      {currentCard.back}
                    </h3>
                    {currentCard.type === 'mcq' && currentCard.options && currentCard.correctOption !== undefined && (
                      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          Correct Answer: {String.fromCharCode(65 + currentCard.correctOption)}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-6">Click to flip back</p>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons Below Card */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {/* Hint Button */}
                {currentCard.hint && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHint(!showHint)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all',
                      showHint
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-2 border-amber-400'
                        : 'bg-background border-2 border-border text-foreground hover:bg-muted'
                    )}
                  >
                    <Lightbulb className="w-4 h-4" />
                    Hint
                  </motion.button>
                )}

                {/* Explanation Button */}
                {currentCard.explanation && isFlipped && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowExplanation(!showExplanation)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all',
                      showExplanation
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-400'
                        : 'bg-background border-2 border-border text-foreground hover:bg-muted'
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Explanation
                  </motion.button>
                )}

                {/* Read Aloud Button */}
                {currentCard.audioUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReadAloud}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-background border-2 border-border text-foreground hover:bg-muted transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    Read Aloud
                  </motion.button>
                )}

                {/* Shuffle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentIndex(Math.floor(Math.random() * flashcards.length))}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-background border-2 border-border text-foreground hover:bg-muted transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  Random
                </motion.button>
              </div>

              {/* Hint/Explanation Display */}
              <AnimatePresence>
                {showHint && currentCard.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Hint</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-400">{currentCard.hint}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showExplanation && currentCard.explanation && isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Detailed Explanation</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-400">{currentCard.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confidence Rating (appears when flipped) */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-muted/30 rounded-lg"
                >
                  <p className="text-sm font-medium text-center text-foreground mb-3">
                    How confident are you with this card?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleConfidenceRating(rating)}
                        className={cn(
                          'p-2 rounded-lg transition-all',
                          confidenceRating === rating
                            ? 'bg-violet-600 text-white scale-110'
                            : 'bg-background hover:bg-muted'
                        )}
                      >
                        <Star
                          className={cn(
                            'w-6 h-6',
                            confidenceRating === rating || (confidenceRating && rating <= confidenceRating)
                              ? 'fill-current text-violet-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-background border-2 border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <span className="font-bold text-violet-700 dark:text-violet-400">
                  {currentIndex + 1} / {flashcards.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {flashcards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleCardClick(index)}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    currentIndex === index
                      ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-400'
                      : 'bg-card border-border hover:border-violet-300 dark:hover:border-violet-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      card.masteryScore >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      card.masteryScore >= 70 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    )}>
                      {card.masteryScore}%
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3 h-3',
                            i < card.confidenceLevel
                              ? 'fill-violet-400 text-violet-400'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-3 mb-2">
                    {card.front}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{card.type.replace('-', ' ')}</span>
                    <span>{card.topic}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

