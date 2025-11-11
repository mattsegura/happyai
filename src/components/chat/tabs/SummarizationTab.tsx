import { useState } from 'react';
import { Upload, FileText, Loader } from 'lucide-react';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { summaryHistory } from '../../../lib/mockData/toolHistory';

export function SummarizationTab() {
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setTimeout(() => {
      setSummary(`# Summary of ${file.name}\n\n## Key Points\n\n• Main concept 1: Lorem ipsum dolor sit amet\n• Main concept 2: Consectetur adipiscing elit\n• Main concept 3: Sed do eiusmod tempor incididunt\n\n## Detailed Overview\n\nThis document covers important topics related to your study material. The AI has identified the most critical information and organized it for easy review.\n\n## Action Items\n\n1. Review section 2.3 for exam preparation\n2. Practice problems on page 45\n3. Memorize key formulas in chapter 4`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={summaryHistory}
        title="Previous Summaries"
        onSelectItem={(item) => {
          console.log('Selected summary:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* File Upload Section - Persistent across all Study Buddy pages */}
        <StudyBuddyFileUpload />
        
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-violet-600" />
          Notes & Material Summarization
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload PDFs, slides, or notes for AI-powered summaries
        </p>
      </div>

      {!summary ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <FileText className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Summaries Yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload a file using the upload section above to generate an AI-powered summary
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-violet dark:prose-invert max-w-none">
            {summary.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith('• ')) return <li key={i} className="ml-6">{line.slice(2)}</li>;
              if (line.match(/^\d+\./)) return <li key={i} className="ml-6">{line}</li>;
              if (line.trim()) return <p key={i} className="mb-4">{line}</p>;
              return null;
            })}
          </div>
          <button onClick={() => setSummary('')} className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Summarize Another File
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
