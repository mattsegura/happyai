import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ArrowRight, ArrowLeft, Pause, Play, Clock, TrendingUp,
  BookOpen, Brain, Target, Sparkles, Award, ChevronRight
} from 'lucide-react';
import { StudyPlan, StudyChatMessage, Flashcard } from '@/lib/types/studyPlan';
import { PhaseManager, StudyPhase } from '@/lib/studyFlow/phaseManager';
import { DifficultyAdapter } from '@/lib/studyFlow/difficultyAdapter';
import { StudySessionChat } from './StudySessionChat';
import { cn } from '@/lib/utils';

interface AdaptiveStudyFlowProps {
  studyPlan: StudyPlan;
  onEndSession: () => void;
  sessionTimer: number;
}

export function AdaptiveStudyFlow({
  studyPlan,
  onEndSession,
  sessionTimer,
}: AdaptiveStudyFlowProps) {
  const [phaseManager] = useState(() => new PhaseManager(studyPlan));
  const [difficultyAdapter] = useState(() => new DifficultyAdapter(
    studyPlan.studyPreferences.learningStyle === 'visual' ? 'beginner' : 'intermediate'
  ));
  
  const [currentPhase, setCurrentPhase] = useState<StudyPhase | null>(phaseManager.getCurrentPhase());
  const [chatMessages, setChatMessages] = useState<StudyChatMessage[]>([
    {
      id: 'welcome',
      role: 'tutor',
      content: `Hi! I'm your AI tutor for ${studyPlan.title}. My goal is to help you LEARN and UNDERSTAND this material, not just complete assignments. I'll guide you through an adaptive study session that adjusts to your pace. Ready to start learning?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [nextPhase, setNextPhase] = useState<StudyPhase | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Flashcard state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  
  // Timer for question answer time
  const answerStartTime = useRef<number>(Date.now());

  useEffect(() => {
    // Send initial phase context message
    if (currentPhase) {
      sendPhaseContextMessage(currentPhase);
    }
  }, [currentPhase?.type]);

  const sendPhaseContextMessage = (phase: StudyPhase) => {
    let message = '';
    
    switch (phase.type) {
      case 'introduction':
        message = `Let's start with an overview. Today's session will cover: ${phase.data.topics.slice(0, 3).join(', ')}. We'll adapt the difficulty based on your performance!`;
        break;
      case 'material_review':
        message = `Now let's review: ${phase.data.material.name}. Take your time to read through it. Ask me if anything is unclear!`;
        break;
      case 'concept_check':
        message = phase.data.prompt;
        break;
      case 'flashcard_practice':
        message = `Time for flashcard practice! I have ${phase.data.cards.length} cards for you. I'll adjust the difficulty based on how you do.`;
        break;
      case 'quiz_prompt':
        message = phase.data.message;
        break;
      case 'break_prompt':
        message = phase.data.reason;
        break;
      case 'summary_review':
        message = `Let's review a summary of what we've covered. This will help reinforce your learning.`;
        break;
      case 'completion':
        message = `Excellent work! You've completed this study session. Let's review your progress.`;
        break;
    }

    if (message) {
      addTutorMessage(message);
    }
  };

  const addTutorMessage = (content: string) => {
    setIsChatTyping(true);
    setTimeout(() => {
      const message: StudyChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, message]);
      setIsChatTyping(false);
    }, 1000);
  };

  const handleUserMessage = (content: string) => {
    const userMessage: StudyChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Generate contextual response
    setIsChatTyping(true);
    setTimeout(() => {
      const response = generateTutorResponse(content, currentPhase);
      addTutorMessage(response);
    }, 1500);
  };

  const generateTutorResponse = (userInput: string, phase: StudyPhase | null): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('help') || input.includes('confused') || input.includes('don\'t understand')) {
      return 'No problem! Let me break this down differently. Which specific part would you like me to explain more clearly?';
    }
    
    if (input.includes('example')) {
      return 'Great question! Here\'s a practical example: [The AI would provide a contextual example based on the current topic].';
    }
    
    if (input.includes('quiz') || input.includes('test')) {
      return 'I can quiz you right now if you\'d like! Or we can continue through the planned session. What would you prefer?';
    }
    
    if (input.includes('skip') || input.includes('next')) {
      return 'Sure! Let me know when you\'re ready to move on to the next part.';
    }
    
    return 'That\'s a great thought! Keep going - you\'re doing well. Feel free to ask me anything as we progress.';
  };

  const handleAdvancePhase = () => {
    const next = phaseManager.advancePhase();
    setCurrentPhase(next);
    setShowTransitionPrompt(false);
    setNextPhase(null);
    
    // Reset state for new phase
    setCurrentFlashcardIndex(0);
    setFlashcardRevealed(false);
    setCurrentQuestionIndex(0);
    answerStartTime.current = Date.now();
  };

  const handlePhaseTransitionPrompt = () => {
    const next = phaseManager.getNextPhase();
    if (next) {
      setNextPhase(next);
      setShowTransitionPrompt(true);
      addTutorMessage(getTransitionMessage(next));
    } else {
      // Session complete
      handleAdvancePhase();
    }
  };

  const getTransitionMessage = (phase: StudyPhase): string => {
    switch (phase.type) {
      case 'material_review':
        return 'Ready to review some study materials?';
      case 'concept_check':
        return 'Let\'s check your understanding with a quick question!';
      case 'flashcard_practice':
        return 'How about some flashcard practice to reinforce what you\'ve learned?';
      case 'quiz_prompt':
        return 'You\'ve been doing great! Ready to test yourself with a quiz?';
      case 'break_prompt':
        return phase.data.reason + ' Take a quick break?';
      case 'summary_review':
        return 'Let\'s review a summary of everything we\'ve covered!';
      case 'completion':
        return 'Amazing work! Let\'s wrap up and see your progress!';
      default:
        return 'Ready to continue?';
    }
  };

  const handleFlashcardAnswer = (wasCorrect: boolean) => {
    const timeSpent = (Date.now() - answerStartTime.current) / 1000;
    difficultyAdapter.recordAnswer(wasCorrect, timeSpent);
    
    // Check if we should adjust difficulty
    const adjustment = difficultyAdapter.shouldAdjustDifficulty();
    if (adjustment.shouldAdjust && adjustment.reason) {
      addTutorMessage(adjustment.reason);
      difficultyAdapter.adjustDifficulty(adjustment.direction!);
    }

    // Move to next flashcard
    if (currentPhase?.type === 'flashcard_practice') {
      const cards = currentPhase.data.cards;
      if (currentFlashcardIndex < cards.length - 1) {
        setTimeout(() => {
          setCurrentFlashcardIndex(prev => prev + 1);
          setFlashcardRevealed(false);
          answerStartTime.current = Date.now();
        }, 500);
      } else {
        // Flashcards complete
        addTutorMessage(`Great job! You completed all flashcards with ${Math.round(difficultyAdapter.getPerformanceMetrics().overallAccuracy * 100)}% accuracy.`);
        setTimeout(() => handlePhaseTransitionPrompt(), 2000);
      }
    }
  };

  const renderPhaseContent = () => {
    if (!currentPhase) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Award className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
            <p className="text-muted-foreground mb-6">Great work on completing your study session.</p>
            <button
              onClick={onEndSession}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      );
    }

    switch (currentPhase.type) {
      case 'introduction':
        return <IntroductionPhase data={currentPhase.data} onContinue={handlePhaseTransitionPrompt} />;
      case 'material_review':
        return <MaterialReviewPhase data={currentPhase.data} onContinue={handlePhaseTransitionPrompt} />;
      case 'concept_check':
        return <ConceptCheckPhase data={currentPhase.data} onContinue={handlePhaseTransitionPrompt} onAnswer={handleUserMessage} />;
      case 'flashcard_practice':
        return (
          <FlashcardPhase
            cards={currentPhase.data.cards}
            currentIndex={currentFlashcardIndex}
            isRevealed={flashcardRevealed}
            onReveal={() => setFlashcardRevealed(true)}
            onAnswer={handleFlashcardAnswer}
            currentDifficulty={difficultyAdapter.getCurrentLevel()}
          />
        );
      case 'quiz_prompt':
        return <QuizPromptPhase data={currentPhase.data} onAccept={handleAdvancePhase} onDefer={handlePhaseTransitionPrompt} />;
      case 'break_prompt':
        return <BreakPromptPhase data={currentPhase.data} onAccept={handleAdvancePhase} onSkip={handleAdvancePhase} />;
      case 'completion':
        return <CompletionPhase stats={phaseManager.getSessionStats()} onEnd={onEndSession} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={handlePhaseTransitionPrompt}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        );
    }
  };

  const progress = phaseManager.getProgress();

  return (
    <div className="h-full flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Phase {phaseManager.getCurrentPhaseNumber()} of {phaseManager.getTotalPhases()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-muted-foreground">
                Level: <span className="font-medium capitalize">{difficultyAdapter.getCurrentLevel()}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Study Content */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase?.type || 'empty'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPhaseContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Chat */}
        <div className="lg:col-span-1 min-h-0">
          <StudySessionChat
            studyPlanTitle={studyPlan.title}
            currentPhase={currentPhase}
            messages={chatMessages}
            onSendMessage={handleUserMessage}
            isTyping={isChatTyping}
          />
        </div>
      </div>

      {/* Transition Prompt Modal */}
      <AnimatePresence>
        {showTransitionPrompt && nextPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTransitionPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-2">Ready to continue?</h3>
              <p className="text-muted-foreground mb-6">
                {getTransitionMessage(nextPhase)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAdvancePhase}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Yes, let's go
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowTransitionPrompt(false)}
                  className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Not yet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Phase Components

function IntroductionPhase({ data, onContinue }: any) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center"
      >
        <Brain className="w-10 h-10 text-violet-600 dark:text-violet-400" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-4">Let's Begin Your Study Session</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{data.overview}</p>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {data.topics.map((topic: string) => (
          <div key={topic} className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium">
            {topic}
          </div>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
      >
        Start Learning
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MaterialReviewPhase({ data, onContinue }: any) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Review Material</h3>
          <p className="text-sm text-muted-foreground">{data.material.name}</p>
        </div>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-6 mb-6 min-h-[300px]">
        <p className="text-sm text-muted-foreground mb-4">
          Material content would be displayed here. In a real implementation, this would show:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>PDF viewer for documents</li>
          <li>Markdown renderer for notes</li>
          <li>Video player for recordings</li>
          <li>Interactive elements for engagement</li>
        </ul>
      </div>

      <button
        onClick={onContinue}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 ml-auto"
      >
        I've reviewed this
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConceptCheckPhase({ data, onContinue, onAnswer }: any) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    onAnswer(answer);
    setAnswer('');
    setTimeout(onContinue, 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
          <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Concept Check</h3>
          <p className="text-sm text-muted-foreground">{data.concept}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg p-6 mb-6">
        <p className="font-medium mb-4">{data.prompt}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onContinue}
          className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Submit Answer
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FlashcardPhase({ cards, currentIndex, isRevealed, onReveal, onAnswer, currentDifficulty }: any) {
  const card = cards[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Flashcard Practice</h3>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length} • {currentDifficulty}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          key={`card-${currentIndex}`}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md h-64 relative preserve-3d cursor-pointer"
          onClick={!isRevealed ? onReveal : undefined}
        >
          <div className={cn(
            "absolute inset-0 backface-hidden bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl border-2 border-violet-200 dark:border-violet-800 p-8 flex items-center justify-center",
            isRevealed && "hidden"
          )}>
            <div className="text-center">
              <p className="text-2xl font-bold mb-4">{card.front}</p>
              <p className="text-sm text-muted-foreground">Click to reveal</p>
            </div>
          </div>
          
          <div className={cn(
            "absolute inset-0 backface-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-800 p-8 flex items-center justify-center",
            !isRevealed && "hidden"
          )} style={{ transform: 'rotateY(180deg)' }}>
            <div className="text-center" style={{ transform: 'rotateY(180deg)' }}>
              <p className="text-lg mb-6">{card.back}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center mt-6"
        >
          <button
            onClick={() => onAnswer(false)}
            className="px-8 py-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 font-medium"
          >
            <X className="w-5 h-5" />
            Didn't Know
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="px-8 py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2 font-medium"
          >
            <Check className="w-5 h-5" />
            Got It!
          </button>
        </motion.div>
      )}
    </div>
  );
}

function QuizPromptPhase({ data, onAccept, onDefer }: any) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center"
      >
        <Target className="w-10 h-10 text-green-600 dark:text-green-400" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-4">Ready for a Quiz?</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{data.message}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onDefer}
          className="px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          Not Yet
        </button>
        <button
          onClick={onAccept}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          Let's Do It!
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BreakPromptPhase({ data, onAccept, onSkip }: any) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center"
      >
        <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-4">Time for a Break?</h2>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">{data.reason}</p>
      <p className="text-sm text-muted-foreground mb-8">Suggested: {data.duration} minutes</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onSkip}
          className="px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          Keep Going
        </button>
        <button
          onClick={onAccept}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          Take a Break
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CompletionPhase({ stats, onEnd }: any) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 flex items-center justify-center"
      >
        <Award className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">Excellent Work!</h2>
      <p className="text-muted-foreground mb-8">You've completed this study session</p>
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Time Studied</p>
          <p className="text-2xl font-bold">{stats.totalTime} min</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Topics Covered</p>
          <p className="text-2xl font-bold">{stats.topicsCovered.length}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Questions</p>
          <p className="text-2xl font-bold">{stats.questionsAnswered}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
          <p className="text-2xl font-bold">{Math.round(stats.accuracy * 100)}%</p>
        </div>
      </div>

      <button
        onClick={onEnd}
        className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-lg font-semibold"
      >
        Finish Session
      </button>
    </div>
  );
}

