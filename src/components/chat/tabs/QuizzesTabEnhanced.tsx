import { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, Settings, ChevronDown, ChevronUp, Eye, Clock, FileQuestion } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { quizHistory } from '../../../lib/mockData/toolHistory';

type QuizMode = 'practice' | 'test';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  confidenceLevel?: 'low' | 'medium' | 'high';
  explanation?: string; // AI-generated explanation
  type?: 'mcq' | 'true-false'; // For test builder
};

export function QuizzesTabEnhanced() {
  const [mode, setMode] = useState<QuizMode>('practice');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfidenceSlider, setShowConfidenceSlider] = useState(false);
  const [showReviewSidebar, setShowReviewSidebar] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  
  // Test Builder settings
  const [showTestSettings, setShowTestSettings] = useState(false);
  const [testSettings, setTestSettings] = useState({
    questionCount: 10,
    includeMCQ: true,
    includeTrueFalse: true,
    includeShortAnswer: false,
    timeLimit: 0, // 0 = no limit
  });

  const handleAnswer = (answerIndex: number) => {
    const updated = [...questions];
    updated[currentIndex].userAnswer = answerIndex;
    setQuestions(updated);
    setShowConfidenceSlider(true);
  };

  const handleConfidence = (level: 'low' | 'medium' | 'high') => {
    const updated = [...questions];
    updated[currentIndex].confidenceLevel = level;
    setQuestions(updated);
    setShowConfidenceSlider(false);

    // Move to next question or show results
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    } else {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const toggleResultExpansion = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const startMockQuiz = () => {
    // Mock questions with AI explanations
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'What is the primary function of mitochondria in a cell?',
        options: [
          'Protein synthesis',
          'Energy production through ATP',
          'DNA replication',
          'Waste removal'
        ],
        correctAnswer: 1,
        explanation: 'Mitochondria are often called the "powerhouse of the cell" because they generate most of the cell\'s supply of ATP (adenosine triphosphate), which is used as a source of chemical energy. They do this through a process called cellular respiration.',
        type: 'mcq'
      },
      {
        id: '2',
        question: 'The derivative of x² is 2x.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'This is TRUE. Using the power rule for derivatives (d/dx[x^n] = n·x^(n-1)), we get: d/dx[x²] = 2·x^(2-1) = 2x. The power rule states that we multiply by the exponent and then subtract 1 from the exponent.',
        type: 'true-false'
      },
      {
        id: '3',
        question: 'Which battle marked the turning point of WWII in Europe?',
        options: [
          'Battle of Britain',
          'Battle of Stalingrad',
          'D-Day Invasion',
          'Battle of the Bulge'
        ],
        correctAnswer: 1,
        explanation: 'The Battle of Stalingrad (1942-1943) is widely considered the turning point of WWII in Europe. The Soviet victory ended Germany\'s advance into the Soviet Union and marked the beginning of a continuous retreat for German forces on the Eastern Front. The battle was one of the bloodiest in history, with over 2 million casualties.',
        type: 'mcq'
      },
    ];
    
    setQuestions(mockQuestions);
    setCurrentIndex(0);
    setShowResults(false);
    setShowConfidenceSlider(false);
  };

  const score = questions.filter(q => q.userAnswer === q.correctAnswer).length;
  const currentQuestion = questions[currentIndex];

  // Calculate confidence-weighted performance
  const getPerformanceInsight = () => {
    let correctHighConfidence = 0;
    let incorrectHighConfidence = 0;
    
    questions.forEach(q => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      const isHighConfidence = q.confidenceLevel === 'high';
      
      if (isCorrect && isHighConfidence) correctHighConfidence++;
      if (!isCorrect && isHighConfidence) incorrectHighConfidence++;
    });

    if (incorrectHighConfidence > 0) {
      return `You were highly confident on ${incorrectHighConfidence} incorrect ${incorrectHighConfidence === 1 ? 'answer' : 'answers'}. Review these topics carefully.`;
    }
    if (correctHighConfidence === questions.length) {
      return 'Excellent! You were confident and correct on all questions.';
    }
    return 'Good work! Focus on building confidence in areas where you hesitated.';
  };

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
        {/* File Upload Section */}
        <StudyBuddyFileUpload />
      
        {/* Header with Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-600" />
                AI-Generated {mode === 'practice' ? 'Quizzes' : 'Tests'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'practice' 
                  ? 'Practice with AI-generated questions based on your study materials'
                  : 'Create custom tests with multiple question formats and time limits'
                }
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                <button
                  onClick={() => setMode('practice')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    mode === 'practice'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Practice Mode
                </button>
                <button
                  onClick={() => setMode('test')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    mode === 'test'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FileQuestion className="w-4 h-4 inline mr-2" />
                  Test Builder
                </button>
              </div>
            </div>
          </div>

          {/* Test Builder Settings */}
          {mode === 'test' && questions.length === 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
              <button
                onClick={() => setShowTestSettings(!showTestSettings)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Test Settings
                </span>
                {showTestSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTestSettings && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={testSettings.questionCount}
                        onChange={(e) => setTestSettings({...testSettings, questionCount: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={testSettings.timeLimit}
                        onChange={(e) => setTestSettings({...testSettings, timeLimit: parseInt(e.target.value)})}
                        placeholder="0 = No limit"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Question Types
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testSettings.includeMCQ}
                          onChange={(e) => setTestSettings({...testSettings, includeMCQ: e.target.checked})}
                          className="rounded"
                        />
                        Multiple Choice Questions
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testSettings.includeTrueFalse}
                          onChange={(e) => setTestSettings({...testSettings, includeTrueFalse: e.target.checked})}
                          className="rounded"
                        />
                        True/False Questions
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={testSettings.includeShortAnswer}
                          onChange={(e) => setTestSettings({...testSettings, includeShortAnswer: e.target.checked})}
                          className="rounded"
                          disabled
                        />
                        Short Answer (Coming Soon)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {questions.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-3xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {mode === 'practice' ? 'No Quizzes Yet' : 'No Tests Created'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {mode === 'practice'
                  ? 'Upload study materials using the file upload section above to generate AI-powered practice quizzes'
                  : 'Configure your test settings above and upload study materials to create a custom test'
                }
              </p>
              {/* Demo button */}
              <button
                onClick={startMockQuiz}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Try Demo Quiz
              </button>
            </div>
          </div>
        ) : showResults ? (
          /* Results with AI Explanations */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <div className="text-center max-w-5xl w-full px-8 py-8">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-4">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Quiz Complete!
              </h3>
              <p className="text-muted-foreground mb-4">
                You got {score} out of {questions.length} questions correct
              </p>
              
              {/* Confidence-based insight */}
              <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                <p className="text-sm text-violet-900 dark:text-violet-100">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  {getPerformanceInsight()}
                </p>
              </div>

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
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-foreground flex-1">{q.question}</p>
                          {q.confidenceLevel && (
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full ml-2",
                              q.confidenceLevel === 'high' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                              q.confidenceLevel === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                              q.confidenceLevel === 'low' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}>
                              {q.confidenceLevel} confidence
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Your answer: {q.options[q.userAnswer!]} 
                          {q.userAnswer !== q.correctAnswer && ` • Correct: ${q.options[q.correctAnswer]}`}
                        </p>
                        
                        {/* Expandable Explanation */}
                        {q.explanation && (
                          <>
                            <button
                              onClick={() => toggleResultExpansion(q.id)}
                              className="text-xs text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 hover:underline"
                            >
                              {expandedResults.has(q.id) ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  Hide explanation
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  Show AI explanation
                                </>
                              )}
                            </button>
                            {expandedResults.has(q.id) && (
                              <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                                <p className="text-sm text-foreground leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </>
                        )}
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
                  setExpandedResults(new Set());
                }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Questions with Review Sidebar */
          <div className="flex-1 flex gap-4">
            {/* Main Quiz Area */}
            <div className="flex-1 flex flex-col">
              {/* Progress + Review Button */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex-1">
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
                
                <button
                  onClick={() => setShowReviewSidebar(!showReviewSidebar)}
                  className="ml-4 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Review Answers
                </button>
              </div>

              {/* Question */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full px-4">
                <div className="w-full p-8 bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-3xl shadow-xl mb-8">
                  <p className="text-2xl font-bold text-center text-foreground">
                    {currentQuestion?.question}
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                          : "border-muted opacity-50"
                      )}
                    >
                      <span className="text-sm text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {/* Confidence Slider */}
                {showConfidenceSlider && currentQuestion?.userAnswer !== undefined && (
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl">
                    <p className="text-sm font-semibold text-foreground mb-4 text-center">
                      How confident are you in this answer?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleConfidence('low')}
                        className="px-4 py-3 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-semibold text-sm transition-all"
                      >
                        Low
                      </button>
                      <button
                        onClick={() => handleConfidence('medium')}
                        className="px-4 py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 font-semibold text-sm transition-all"
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => handleConfidence('high')}
                        className="px-4 py-3 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-semibold text-sm transition-all"
                      >
                        High
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Sidebar */}
            {showReviewSidebar && (
              <div className="w-80 flex-shrink-0 p-4 bg-muted/30 rounded-xl border border-border overflow-y-auto">
                <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Answer Review
                </h3>
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-all text-sm",
                        idx === currentIndex 
                          ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                          : 'bg-background hover:bg-muted',
                        q.userAnswer !== undefined && 'border-l-4',
                        q.userAnswer !== undefined && q.userAnswer === q.correctAnswer && 'border-l-green-500',
                        q.userAnswer !== undefined && q.userAnswer !== q.correctAnswer && 'border-l-red-500',
                        q.userAnswer === undefined && 'border-l-4 border-l-gray-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Q{idx + 1}</span>
                        {q.userAnswer !== undefined ? (
                          q.userAnswer === q.correctAnswer ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">Not answered</span>
                        )}
                      </div>
                      {q.confidenceLevel && (
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {q.confidenceLevel} confidence
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

