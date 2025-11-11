import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Clock, Calendar, Upload, CheckCircle,
  AlertCircle, Brain, Send, Plus, X, Download, ExternalLink, Sparkles
} from 'lucide-react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { ChatMessage, ChecklistItem, UploadedFile } from '@/lib/types/assignment';
import { cn } from '@/lib/utils';

export function AssignmentWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssignment, updateChecklistItem, addChatMessage, addFileToAssignment } = useAssignments();
  
  const assignment = getAssignment(id!);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'checklist' | 'chat'>('overview');

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Assignment Not Found</h2>
          <button
            onClick={() => navigate('/dashboard/assignments')}
            className="text-primary hover:underline"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const completedTasks = assignment.checklist.filter(t => t.completed).length;
  const totalTasks = assignment.checklist.length;

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(assignment.id, userMessage);
    setChatInput('');
    setIsSending(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: getAIResponse(chatInput, assignment),
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assignment.id, aiMessage);
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/assignments')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{assignment.title}</h1>
          <p className="text-muted-foreground">{assignment.courseName}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Due Date</span>
          </div>
          <div className={cn('font-bold', daysUntilDue <= 3 && 'text-red-500')}>
            {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Due today'}
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
          <div className="font-bold">{assignment.progress}%</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Left</span>
          </div>
          <div className="font-bold">{Math.round(assignment.estimatedTimeRemaining / 60)}h</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tasks</span>
          </div>
          <div className="font-bold">{completedTasks}/{totalTasks}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Instructions & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'files', label: 'Files' },
              { id: 'checklist', label: 'Checklist' },
              { id: 'chat', label: 'AI Chat' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md transition-all font-medium text-sm',
                  activeTab === tab.id ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-xl border border-border p-6">
            {activeTab === 'overview' && (
              <OverviewTab assignment={assignment} />
            )}
            {activeTab === 'files' && (
              <FilesTab assignment={assignment} onAddFile={addFileToAssignment} />
            )}
            {activeTab === 'checklist' && (
              <ChecklistTab assignment={assignment} onToggle={updateChecklistItem} />
            )}
            {activeTab === 'chat' && (
              <ChatTab
                assignment={assignment}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isSending={isSending}
                onSend={handleSendMessage}
              />
            )}
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="space-y-6">
          {/* AI Assistant Card */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Your AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <p className="text-sm mb-4">
              I remember all our conversations about this assignment and can help with:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Brainstorming and outlining</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Reviewing drafts and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Research and citations</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Time management tips</span>
              </li>
            </ul>
            <button
              onClick={() => setActiveTab('chat')}
              className="w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Open Chat
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Draft
              </button>
              <button 
                onClick={() => navigate('/dashboard/study-buddy/create')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-primary"
              >
                <Brain className="w-4 h-4" />
                Study Concepts for This
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View on Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components

function OverviewTab({ assignment }: { assignment: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Requirements</h3>
        <ul className="space-y-2">
          {assignment.parsedInstructions.requirements.map((req: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {assignment.parsedInstructions.rubric.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Grading Rubric</h3>
          <div className="space-y-2">
            {assignment.parsedInstructions.rubric.map((criteria: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">{criteria.category}</span>
                <span className="text-sm font-bold text-primary">{criteria.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignment.aiSuggestions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">AI Suggestions</h3>
          <div className="space-y-2">
            {assignment.aiSuggestions.map((suggestion: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilesTab({ assignment, onAddFile }: { assignment: any; onAddFile: any }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Instruction Files</h3>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <FileList files={assignment.instructionFiles} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Draft Files</h3>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <FileList files={assignment.draftFiles} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Supporting Materials</h3>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <FileList files={assignment.supportingFiles} />
      </div>
    </div>
  );
}

function FileList({ files }: { files: UploadedFile[] }) {
  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">No files uploaded yet</p>;
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{file.name}</span>
          </div>
          <button className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ChecklistTab({ assignment, onToggle }: { assignment: any; onToggle: any }) {
  const phases = ['outline', 'draft', 'revise', 'final'] as const;

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseTasks = assignment.checklist.filter((t: ChecklistItem) => t.phase === phase);
        if (phaseTasks.length === 0) return null;

        return (
          <div key={phase}>
            <h3 className="font-semibold mb-3 capitalize">{phase} Phase</h3>
            <div className="space-y-2">
              {phaseTasks.map((task: ChecklistItem) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggle(assignment.id, task.id, e.target.checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{task.estimatedMinutes} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChatTab({ assignment, chatInput, setChatInput, isSending, onSend }: any) {
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {assignment.chatHistory.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'p-3 rounded-lg max-w-[80%]',
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          placeholder="Ask for help or feedback..."
          className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={onSend}
          disabled={isSending || !chatInput.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getAIResponse(userInput: string, assignment: any): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('thesis') || input.includes('argument')) {
    return 'A strong thesis statement should be specific, arguable, and meet all the rubric requirements. Based on your assignment requirements, try to focus on the key themes that will earn you the most points. What specific aspect can we tackle first to get this done?';
  }
  
  if (input.includes('outline') || input.includes('structure')) {
    return `Based on your rubric requirements, I recommend this structure to maximize your grade:\n\n1. Introduction with thesis (10% of word count)\n2. ${assignment.parsedInstructions.sections.length - 2} body paragraphs hitting all rubric criteria\n3. Conclusion that addresses all requirements\n\nLet's build this section by section to meet the deadline. Which part should we complete first?`;
  }
  
  if (input.includes('sources') || input.includes('research') || input.includes('citations')) {
    return `For this assignment, you need ${assignment.parsedInstructions.requirements.find((r: string) => r.includes('sources')) || '5 scholarly sources'}. Remember to use ${assignment.parsedInstructions.format} format for citations. I can help you find sources quickly and format them correctly. What topics do you need sources for?`;
  }
  
  return 'I\'m here to help you complete this assignment on time and meet all requirements! I can assist with brainstorming, outlining, reviewing your drafts, finding sources, checking rubric requirements, or anything else you need to finish this. What task should we tackle next?';
}

