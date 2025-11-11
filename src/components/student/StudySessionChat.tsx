import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudyChatMessage } from '@/lib/types/studyPlan';
import { StudyPhase } from '@/lib/studyFlow/phaseManager';

interface StudySessionChatProps {
  studyPlanTitle: string;
  currentPhase: StudyPhase | null;
  messages: StudyChatMessage[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
}

export function StudySessionChat({
  studyPlanTitle,
  currentPhase,
  messages,
  onSendMessage,
  isTyping,
}: StudySessionChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const getPhaseContext = () => {
    if (!currentPhase) return null;

    switch (currentPhase.type) {
      case 'introduction':
        return '📚 Starting your study session';
      case 'material_review':
        return '📖 Reviewing materials';
      case 'concept_check':
        return '🧠 Checking understanding';
      case 'flashcard_practice':
        return '🎴 Practicing flashcards';
      case 'quiz_prompt':
      case 'active_quiz':
        return '✅ Quiz time';
      case 'break_prompt':
        return '☕ Break suggested';
      case 'summary_review':
        return '📝 Reviewing summary';
      case 'completion':
        return '🎉 Session complete';
      default:
        return '💡 Studying';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card/50 rounded-xl border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-t-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-violet-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">AI Study Tutor</h3>
            <p className="text-xs text-muted-foreground">
              {getPhaseContext() || 'Always here to help'}
            </p>
          </div>
        </div>
        <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">
          {studyPlanTitle}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'tutor' && (
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-full flex-shrink-0 h-fit">
                  <Brain className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
              )}
              <div
                className={cn(
                  'p-3 rounded-lg max-w-[85%] text-sm',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={cn(
                  'text-xs mt-1.5',
                  message.role === 'user' ? 'text-violet-100' : 'text-muted-foreground'
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-full flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
            </div>
            <div className="p-3 bg-muted rounded-lg rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (if no messages yet) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Explain this concept',
              'Give me an example',
              'Quiz me',
              'I need help',
            ].map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="px-3 py-1.5 text-xs bg-background hover:bg-muted rounded-lg border border-border transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            disabled={isTyping}
            className={cn(
              'flex-1 px-3 py-2 bg-background border border-border rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500',
              'text-sm placeholder:text-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'p-2 rounded-lg transition-all flex-shrink-0',
              input.trim() && !isTyping
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

