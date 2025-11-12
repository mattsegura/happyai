import { useState } from 'react';
import { FileText, Loader, Languages, Wand2, ArrowRight, Brain, Sparkles, Volume2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { summaryHistory } from '../../../lib/mockData/toolHistory';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type ViewMode = 'notes' | 'source' | 'side-by-side';
type Tone = 'academic' | 'casual' | 'technical';
type Length = 'concise' | 'standard' | 'detailed';

export function SummarizationTabEnhanced() {
  const [summary, setSummary] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const [tone, setTone] = useState<Tone>('academic');
  const [length, setLength] = useState<Length>('standard');
  const [language, setLanguage] = useState('english');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name);
    setIsProcessing(true);
    
    setTimeout(() => {
      // Generate different summaries based on difficulty
      const summaries = {
        beginner: `# Summary of ${file.name}\n\n## Simple Overview\n\nThis material explains important concepts in an easy-to-understand way.\n\n### Main Ideas\n\n• **First Concept**: This is about basic principles that form the foundation\n• **Second Concept**: This builds on the first idea and shows how things connect\n• **Third Concept**: This shows practical ways to use what you learned\n\n### Quick Tips\n\n1. Start by understanding the basics before moving forward\n2. Take notes on the main ideas\n3. Practice with simple examples first\n\n### Key Takeaway\n\nThe most important thing to remember is that these concepts work together to create a bigger picture.`,
        
        intermediate: `# Summary of ${file.name}\n\n## Key Points\n\n• Main concept 1: Lorem ipsum dolor sit amet with detailed explanation of core principles\n• Main concept 2: Consectetur adipiscing elit showing interconnected relationships\n• Main concept 3: Sed do eiusmod tempor incididunt with practical applications\n\n## Detailed Overview\n\nThis document covers important topics related to your study material. The AI has identified the most critical information and organized it for easy review. The content demonstrates key relationships between theoretical frameworks and practical implementations.\n\n### Conceptual Framework\n\nThe material establishes a foundation for understanding complex interactions within the domain. It builds systematically from basic principles to more advanced applications.\n\n## Action Items\n\n1. Review section 2.3 for exam preparation\n2. Practice problems on page 45\n3. Memorize key formulas in chapter 4\n4. Complete supplementary reading on advanced topics`,
        
        advanced: `# Advanced Analysis: ${file.name}\n\n## Critical Concepts\n\n### Theoretical Framework\n\nThe document presents a sophisticated examination of multifaceted concepts within the domain, establishing rigorous analytical frameworks that synthesize contemporary scholarship with empirical observations.\n\n#### Core Propositions\n\n• **Conceptual Architecture**: The theoretical underpinnings demonstrate epistemological coherence while maintaining methodological flexibility\n• **Systemic Integration**: Emergent properties arise from the dynamic interplay between constituent elements\n• **Paradigmatic Implications**: The framework challenges existing assumptions and proposes novel interpretative strategies\n\n### Methodological Considerations\n\nThe analytical approach employs both deductive and inductive reasoning, leveraging quantitative metrics alongside qualitative assessments to generate comprehensive insights.\n\n### Advanced Applications\n\n1. Integrate concepts with existing theoretical models\n2. Develop original hypotheses based on presented frameworks\n3. Critically evaluate methodological assumptions\n4. Synthesize cross-disciplinary perspectives\n\n## Research Implications\n\nThese findings suggest significant ramifications for ongoing scholarly discourse and practical implementations within the field.`
      };
      
      setSummary(summaries[difficulty]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleRegenerateSummary = () => {
    // Simulate regeneration with different settings
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const handleConvertToFlashcards = () => {
    // Mock conversion - in real app, this would create flashcards and navigate
    alert('Converting to flashcards... (This would create flashcard set from summary)');
  };

  const handleConvertToQuiz = () => {
    // Mock conversion - in real app, this would create quiz and navigate
    alert('Generating quiz... (This would create questions from summary)');
  };

  const handleConvertToAudio = () => {
    // Mock conversion - in real app, this would create audio recap
    alert('Creating audio recap... (This would generate audio version of summary)');
  };

  const mockSourceText = `# Original Source Document\n\nThis is a placeholder for the original source material. In a real implementation, this would display the actual uploaded PDF, document, or notes that the student wants to summarize.\n\n## Chapter 1: Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Chapter 2: Main Content\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Chapter 3: Conclusions\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

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
        {/* File Upload Section */}
        <StudyBuddyFileUpload />
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            Notes & Material Summarization
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PDFs, slides, or notes for AI-powered summaries with customizable difficulty and style
          </p>
        </div>

        {!summary ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-3xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <FileText className="w-10 h-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">No Summaries Yet</h3>
              
              {/* Difficulty Selector (shows before upload) */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Summarize as:
                </label>
                <div className="flex justify-center gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                        difficulty === level
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Upload a file using the upload section above to generate an AI-powered summary
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              {/* View Mode Tabs */}
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                {[
                  { id: 'notes', label: 'Notes' },
                  { id: 'source', label: 'Source' },
                  { id: 'side-by-side', label: 'Side-by-Side' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-all',
                      viewMode === mode.id
                        ? 'bg-background shadow-sm'
                        : 'hover:bg-background/50'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Editing Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
                >
                  <option value="academic">Academic</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>

                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as Length)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
                >
                  <option value="concise">Concise</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                </select>

                {/* Translation Dropdown */}
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm font-medium appearance-none"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Español</option>
                    <option value="french">Français</option>
                    <option value="german">Deutsch</option>
                    <option value="chinese">中文</option>
                    <option value="japanese">日本語</option>
                  </select>
                  <Languages className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>

                <button
                  onClick={handleRegenerateSummary}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'notes' && (
                <div className="h-full overflow-y-auto prose prose-violet dark:prose-invert max-w-none">
                  {summary.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(4)}</h3>;
                    if (line.startsWith('#### ')) return <h4 key={i} className="text-lg font-bold mt-3 mb-2">{line.slice(5)}</h4>;
                    if (line.startsWith('• ')) return <li key={i} className="ml-6">{line.slice(2)}</li>;
                    if (line.match(/^\d+\./)) return <li key={i} className="ml-6">{line}</li>;
                    if (line.trim()) return <p key={i} className="mb-4">{line}</p>;
                    return null;
                  })}
                </div>
              )}

              {viewMode === 'source' && (
                <div className="h-full overflow-y-auto prose prose-slate dark:prose-invert max-w-none p-6 bg-muted/30 rounded-xl">
                  {mockSourceText.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
                    if (line.trim()) return <p key={i} className="mb-4">{line}</p>;
                    return null;
                  })}
                </div>
              )}

              {viewMode === 'side-by-side' && (
                <div className="h-full grid grid-cols-2 gap-4 overflow-hidden">
                  <div className="overflow-y-auto p-4 bg-muted/30 rounded-xl">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
                      Source Document
                    </h3>
                    <div className="prose prose-sm prose-slate dark:prose-invert">
                      {mockSourceText.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-3">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>;
                        if (line.trim()) return <p key={i} className="mb-3 text-sm">{line}</p>;
                        return null;
                      })}
                    </div>
                  </div>
                  <div className="overflow-y-auto p-4">
                    <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 mb-4 uppercase tracking-wide">
                      AI Summary
                    </h3>
                    <div className="prose prose-sm prose-violet dark:prose-invert">
                      {summary.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-3">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>;
                        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-3 mb-2">{line.slice(4)}</h3>;
                        if (line.startsWith('• ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>;
                        if (line.match(/^\d+\./)) return <li key={i} className="ml-4 text-sm">{line}</li>;
                        if (line.trim()) return <p key={i} className="mb-3 text-sm">{line}</p>;
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* One-Click Conversion Buttons */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setSummary('')}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors"
              >
                Summarize Another File
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Convert to:</span>
                <button
                  onClick={handleConvertToFlashcards}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Flashcards
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleConvertToQuiz}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Quiz
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleConvertToAudio}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Audio
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

