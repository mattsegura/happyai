import { useState } from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  FileText, 
  Mic, 
  Volume2, 
  PenTool, 
  Image as ImageIcon,
  Brain,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatTab } from './tabs/ChatTab';
import { FlashcardsTab } from './tabs/FlashcardsTab';
import { QuizzesTab } from './tabs/QuizzesTab';
import { SummarizationTab } from './tabs/SummarizationTab';
import { TranscriptionTab } from './tabs/TranscriptionTab';
import { AudioRecapsTab } from './tabs/AudioRecapsTab';
import { EssayGradingTab } from './tabs/EssayGradingTab';
import { ImageAnalysisTab } from './tabs/ImageAnalysisTab';

type TabId = 'chat' | 'flashcards' | 'quizzes' | 'summarize' | 'transcribe' | 'audio' | 'essay' | 'image';

const tabs = [
  { id: 'chat' as TabId, label: 'AI Chat', icon: MessageCircle, description: 'General study assistance' },
  { id: 'flashcards' as TabId, label: 'Flashcards', icon: Brain, description: 'AI-generated from your materials' },
  { id: 'quizzes' as TabId, label: 'Quizzes', icon: Sparkles, description: 'Practice tests & questions' },
  { id: 'summarize' as TabId, label: 'Summarize', icon: FileText, description: 'Notes, PDFs, slides' },
  { id: 'transcribe' as TabId, label: 'Transcribe', icon: Mic, description: 'Lecture recordings' },
  { id: 'audio' as TabId, label: 'Audio Recaps', icon: Volume2, description: 'Listen to summaries' },
  { id: 'essay' as TabId, label: 'Essay Help', icon: PenTool, description: 'Grading & writing assistance' },
  { id: 'image' as TabId, label: 'Image Analysis', icon: ImageIcon, description: 'Diagrams & visual materials' },
];

export function AIStudyHub() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatTab />;
      case 'flashcards':
        return <FlashcardsTab />;
      case 'quizzes':
        return <QuizzesTab />;
      case 'summarize':
        return <SummarizationTab />;
      case 'transcribe':
        return <TranscriptionTab />;
      case 'audio':
        return <AudioRecapsTab />;
      case 'essay':
        return <EssayGradingTab />;
      case 'image':
        return <ImageAnalysisTab />;
      default:
        return <ChatTab />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Feature Tabs */}
      <aside className="w-64 flex-shrink-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 rounded-2xl border border-violet-200/50 dark:border-violet-800/30 shadow-lg p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">AI Study Hub</h2>
              <p className="text-xs text-muted-foreground">Your learning companion</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg'
                    : 'hover:bg-violet-100 dark:hover:bg-violet-900/20 text-foreground'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0 mt-0.5',
                  isActive ? 'text-white' : 'text-violet-600 dark:text-violet-400'
                )} />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'font-semibold text-sm',
                    isActive ? 'text-white' : 'text-foreground'
                  )}>
                    {tab.label}
                  </div>
                  <div className={cn(
                    'text-xs mt-0.5',
                    isActive ? 'text-white/80' : 'text-muted-foreground'
                  )}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-violet-100 dark:bg-violet-900/20 rounded-xl">
          <h3 className="text-xs font-semibold text-violet-900 dark:text-violet-100 mb-2">
            This Week
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Flashcards created</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">24</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Quizzes taken</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">8</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Materials summarized</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">12</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gradient-to-br from-violet-50/95 via-white/95 to-pink-50/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl border border-violet-200/50 dark:border-violet-800/30 shadow-2xl shadow-violet-500/10 overflow-hidden">
        {renderTabContent()}
      </main>
    </div>
  );
}
