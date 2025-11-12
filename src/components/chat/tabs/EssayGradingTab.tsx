import { useState } from 'react';
import { Upload, PenTool, Loader } from 'lucide-react';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { ToolHistoryItem } from '../../../lib/mockData/toolHistory';

const essayHistory: ToolHistoryItem[] = [
  {
    id: 'essay-1',
    title: 'Analysis of Shakespeare\'s Hamlet',
    className: 'ENG 202',
    classColor: '#ec4899',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    size: '3.2 KB'
  },
  {
    id: 'essay-2',
    title: 'WWII Historical Essay',
    className: 'HIST 301',
    classColor: '#f59e0b',
    studyPlanTitle: 'WWII Exam Preparation',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: '4.1 KB'
  }
];

export function EssayGradingTab() {
  const [feedback, setFeedback] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setTimeout(() => {
      setFeedback({
        grade: 'B+',
        score: 87,
        strengths: [
          'Strong thesis statement',
          'Good use of evidence',
          'Clear paragraph structure'
        ],
        improvements: [
          'Add more transitions between paragraphs',
          'Expand conclusion with broader implications',
          'Check for passive voice usage'
        ],
        grammar: 'Excellent - only 2 minor errors found',
        suggestions: 'Consider adding a counterargument section to strengthen your position.'
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={essayHistory}
        title="Previous Essays"
        onSelectItem={(item) => {
          console.log('Selected essay:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* File Upload Section - Persistent across all Study Buddy pages */}
        <StudyBuddyFileUpload />
        
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PenTool className="w-6 h-6 text-violet-600" />
          Essay Grading & Writing Assistance
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get AI feedback on your essays, papers, and written assignments
        </p>
      </div>

      {!feedback ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <PenTool className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Essays Yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload your essay using the upload section above to get AI-powered feedback and grading
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <div className="text-6xl font-bold mb-2">{feedback.grade}</div>
            <div className="text-2xl font-semibold mb-1">{feedback.score}/100</div>
            <div className="text-white/80">Overall Score</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
            <h3 className="font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              ✓ Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-green-800 dark:text-green-200">• {s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
              ⚠ Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {feedback.improvements.map((s: string, i: number) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-200">• {s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Grammar & Style</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">{feedback.grammar}</p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-2xl p-6">
            <h3 className="font-bold text-violet-900 dark:text-violet-100 mb-2">AI Suggestions</h3>
            <p className="text-sm text-violet-800 dark:text-violet-200">{feedback.suggestions}</p>
          </div>

          <button onClick={() => setFeedback(null)} className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Grade Another Essay
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
