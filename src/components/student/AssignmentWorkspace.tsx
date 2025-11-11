import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Clock, Calendar, Upload, CheckCircle,
  AlertCircle, Brain, Plus, X, Download, ExternalLink, Sparkles,
  Chrome, Check, Zap, Shield, RefreshCw, Paperclip, Globe, Send
} from 'lucide-react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { ChecklistItem, UploadedFile } from '@/lib/types/assignment';
import { cn } from '@/lib/utils';

export function AssignmentWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssignment, updateChecklistItem, addFileToAssignment } = useAssignments();
  
  const assignment = getAssignment(id!);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'checklist'>('overview');
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const prefix = deepSearchEnabled ? '[WEB SEARCH] ' : '';
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: prefix + chatInput,
      timestamp: new Date().toISOString(),
    };

    // Add message to assignment context
    if (assignment.chatHistory) {
      assignment.chatHistory.push(userMessage);
    }
    
    // Handle file uploads
    if (attachedFiles.length > 0) {
      attachedFiles.forEach(file => {
        addFileToAssignment(assignment.id, {
          id: `file-${Date.now()}-${file.name}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category: 'supporting',
        });
      });
    }
    
    setChatInput('');
    setAttachedFiles([]);
    setIsSending(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: getAIResponse(chatInput, assignment, deepSearchEnabled),
        timestamp: new Date().toISOString(),
      };
      if (assignment.chatHistory) {
        assignment.chatHistory.push(aiMessage);
      }
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
          </div>
        </div>

        {/* Right Panel - AI Assistant & Quick Actions */}
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
              onClick={() => setShowChatModal(true)}
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
              <button 
                onClick={() => setShowExtensionModal(true)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-blue-600"
              >
                <Chrome className="w-4 h-4" />
                Chrome Extension
              </button>
            </div>
          </div>
        </div>
        
        {/* Extension Modal */}
        {showExtensionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExtensionModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl mx-4 p-8"
            >
              <button
                onClick={() => setShowExtensionModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <ExtensionContent />
            </motion.div>
          </div>
        )}

        {/* AI Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChatModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-4xl max-h-[85vh] bg-background rounded-2xl shadow-2xl mx-4"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ask me anything about your assignment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ChatInterface
                  assignment={assignment}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isSending={isSending}
                  onSend={handleSendMessage}
                  attachedFiles={attachedFiles}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                  deepSearchEnabled={deepSearchEnabled}
                  setDeepSearchEnabled={setDeepSearchEnabled}
                />
              </div>
            </motion.div>
          </div>
        )}
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

function ChatInterface({ 
  assignment, 
  chatInput, 
  setChatInput, 
  isSending, 
  onSend,
  attachedFiles,
  onFileSelect,
  onRemoveFile,
  deepSearchEnabled,
  setDeepSearchEnabled
}: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-[600px]">
      {/* Deep Search Banner */}
      {deepSearchEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2"
        >
          <Globe className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Web Search Active - AI will search the internet for relevant information
          </span>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
        {assignment.chatHistory.map((message: any) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
                'p-3 rounded-lg max-w-[80%] shadow-sm',
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-accent text-white'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file: File, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm"
            >
              <FileText className="w-3 h-3 text-primary" />
              <span className="text-xs max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => onRemoveFile(index)}
                className="p-0.5 hover:bg-primary/20 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onFileSelect}
            className="hidden"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Attach files"
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeepSearchEnabled(!deepSearchEnabled)}
            className={cn(
              'p-2 rounded-lg transition-all',
              deepSearchEnabled
                ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                : 'hover:bg-muted'
            )}
            title="Toggle deep web search"
          >
            <Globe className={cn('w-4 h-4', deepSearchEnabled && 'animate-pulse')} />
          </motion.button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder={deepSearchEnabled ? "Ask with web search..." : "Ask for help or feedback..."}
            className={cn(
              "flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all",
              deepSearchEnabled && "border-blue-500/50 focus:border-blue-500"
            )}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSend}
            disabled={isSending || !chatInput.trim()}
            className="px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function getAIResponse(userInput: string, assignment: any, deepSearch: boolean = false): string {
  const input = userInput.toLowerCase();
  
  if (deepSearch) {
    return `🌐 [Web Search Results]\n\nI've searched the internet for information related to your query. Based on current sources and research, here's what I found:\n\n${getRegularResponse(input, assignment)}\n\nNote: These results include up-to-date information from the web to ensure accuracy and relevance.`;
  }
  
  return getRegularResponse(input, assignment);
}

function getRegularResponse(input: string, assignment: any): string {
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

function ExtensionContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl"
        >
          <Chrome className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Hapi AI Chrome Extension</h2>
        <p className="text-muted-foreground">Real-time AI assistance while writing in Google Docs</p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <Zap className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-600">Coming Soon</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            icon: Brain,
            title: 'Smart Writing Assistance',
            description: 'Get contextual suggestions as you type',
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Shield,
            title: 'Plagiarism Detection',
            description: 'Ensure originality in real-time',
            color: 'from-green-500 to-emerald-500',
          },
          {
            icon: Check,
            title: 'Grammar & Style',
            description: 'Advanced writing refinement',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: RefreshCw,
            title: 'Auto-Sync Progress',
            description: 'Seamless integration with workspace',
            color: 'from-orange-500 to-red-500',
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <div className={cn(
              'w-12 h-12 rounded-lg bg-gradient-to-br mb-4 flex items-center justify-center',
              feature.color
            )}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Screenshot Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative p-8 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border border-border overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border shadow-sm">
            <Chrome className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <div className="h-3 bg-primary/20 rounded w-3/4 mb-2" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Extension interface preview
          </p>
        </div>
      </motion.div>

      {/* Install Button (Non-functional) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <button
          disabled
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-xl opacity-50 cursor-not-allowed inline-flex items-center gap-3"
        >
          <Chrome className="w-5 h-5" />
          Install Extension
          <span className="text-xs">(Coming Soon)</span>
        </button>
        <p className="mt-4 text-sm text-muted-foreground">
          Get notified when the extension launches →{' '}
          <a href="#" className="text-primary hover:underline">Join Waitlist</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

