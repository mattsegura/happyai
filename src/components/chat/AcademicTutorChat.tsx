import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Paperclip, X, Sparkles, FileText, BookOpen, Calculator, Zap, Clock, Code, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { MultiModalInput } from './MultiModalInput';
import { EnhancedMessage } from './EnhancedMessage';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { InlineStudyTools } from './tutor/InlineStudyTools';
import { QuickReference } from './tutor/QuickReference';
import { StudySessionTimer } from './tutor/StudySessionTimer';
import { SelectedContext } from './ContextSelectionModal';
import {
  loadMessages,
  addMessage,
  type Message,
  getActiveConversationId,
  getAllConversations,
} from '../../lib/chat/conversationManager';

/**
 * AcademicTutorChat - Blue-themed AI focused on studying and academic mastery
 * Features: Inline tool generation, study timer, formula rendering, concept mapping
 */
export function AcademicTutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [historySidebarCollapsed, setHistorySidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({
    documents: [],
    classes: [],
    studyPlans: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for active conversation
  useEffect(() => {
    const convId = getActiveConversationId();
    setActiveConversationId(convId);
    if (convId) {
      const loadedMessages = loadMessages(convId);
      setMessages(loadedMessages);
    } else {
      // Create welcome message for new conversation
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hey! I'm your Academic Tutor 📚 Ready to master some concepts? I can help you study, break down complex topics, generate practice problems, and more. What would you like to learn today?",
        timestamp: new Date(),
      }]);
    }
  }, [activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      files: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
    };

    setMessages(prev => [...prev, userMessage]);
    addMessage(userMessage, activeConversationId || undefined);
    setInputValue('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response with academic personality
    setTimeout(() => {
      const response = generateAcademicResponse(inputValue, attachedFiles);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
      };

      setMessages(prev => [...prev, aiMessage]);
      addMessage(aiMessage, activeConversationId || undefined);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAcademicResponse = (input: string, files: File[]) => {
    const lowerInput = input.toLowerCase();
    
    // Academic-focused responses
    if (lowerInput.includes('help') || lowerInput.includes('explain')) {
      return {
        content: "I'd be happy to explain! Let's break this down step-by-step. First, what specific aspect would you like me to focus on? I can:\n\n• Provide a conceptual overview\n• Show worked examples\n• Create practice problems\n• Build a visual diagram\n\nWhat works best for your learning style?",
        actions: ['generate_flashcards', 'create_quiz', 'build_study_plan']
      };
    }
    
    if (lowerInput.includes('quiz') || lowerInput.includes('practice')) {
      return {
        content: "Great idea! Practice is key to mastery. I'll generate a personalized quiz based on what we've covered. I'll start with foundational questions and gradually increase difficulty.\n\nShould I include:\n• Multiple choice\n• Short answer\n• Problem solving\n• Or a mix of all three?",
        actions: ['create_quiz', 'view_progress']
      };
    }
    
    if (lowerInput.includes('study') || lowerInput.includes('schedule')) {
      return {
        content: "Let's create an effective study plan! Based on your upcoming deadlines and current workload, I recommend:\n\n**This Week:**\n• 2 sessions on [topic] (45 min each)\n• Review sessions every other day\n• Practice quiz on Friday\n\nWant me to add this to your calendar?",
        actions: ['build_study_plan', 'add_to_calendar', 'start_timer']
      };
    }

    if (files.length > 0) {
      return {
        content: `Perfect! I've analyzed your ${files.length} file(s). I can help you:\n\n• Summarize key concepts\n• Extract important formulas/definitions\n• Generate flashcards\n• Create practice questions\n• Build a study guide\n\nWhat would be most helpful?`,
        actions: ['generate_flashcards', 'create_summary', 'generate_quiz']
      };
    }

    // Default academic response
    return {
      content: "I'm here to help you learn! Could you tell me more about what you're working on? I specialize in:\n\n• Breaking down complex concepts\n• Creating study materials (flashcards, quizzes)\n• Problem-solving strategies\n• Exam preparation\n• Spaced repetition planning\n\nWhat subject are we tackling today?",
      actions: ['generate_flashcards', 'create_quiz']
    };
  };

  const handleToolAction = (action: string) => {
    // Handle inline tool generation
    const toolMessages: Record<string, string> = {
      generate_flashcards: "✨ Generating flashcard set... I'll create 15-20 cards covering the key concepts we discussed. They'll be optimized for spaced repetition!",
      create_quiz: "📝 Building your quiz... I'm creating a balanced mix of question types to test your understanding at different levels.",
      build_study_plan: "📅 Creating your personalized study schedule... I'm considering your deadlines, current workload, and optimal review intervals.",
      add_to_calendar: "✅ Added to your Smart Calendar! You'll get reminders before each session.",
      start_timer: "⏱️ Starting study session timer... Focus mode activated!",
      create_summary: "📄 Summarizing content... Extracting main ideas, key points, and essential details.",
      view_progress: "📊 Here's your progress: You've mastered 65% of this topic! Keep going!"
    };

    if (action === 'start_timer') {
      setShowTimer(true);
    }

    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: toolMessages[action] || `Executing: ${action}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    addMessage(message, activeConversationId || undefined);
  };

  const handlePinItem = (content: string) => {
    setPinnedItems(prev => [...prev, content]);
    setShowQuickRef(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        collapsed={historySidebarCollapsed}
        onToggleCollapse={() => setHistorySidebarCollapsed(!historySidebarCollapsed)}
        onConversationChange={(id) => setActiveConversationId(id)}
        activeConversationId={activeConversationId}
        aiType="tutor"
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Blue Theme */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 border-b border-blue-200 dark:border-blue-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              {/* Animated AI Avatar */}
              <motion.div
                animate={{
                  scale: isTyping ? [1, 1.1, 1] : 1,
                  rotate: isTyping ? [0, 5, -5, 0] : 0
                }}
                transition={{
                  duration: 1,
                  repeat: isTyping ? Infinity : 0
                }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {isTyping && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400"
                  />
                )}
              </motion.div>

              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Academic Tutor
                </h2>
                <p className="text-xs text-muted-foreground">Your study companion</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTimer(!showTimer)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Clock className="w-4 h-4 mr-1" />
                {showTimer ? 'Hide' : 'Timer'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickRef(!showQuickRef)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ListChecks className="w-4 h-4 mr-1" />
                Quick Ref
              </Button>

              {/* Academic Badge */}
              <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Academic Mode</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages Area with Grid Pattern Background */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* Subtle tech grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <EnhancedMessage
                key={message.id}
                message={message}
                onActionClick={handleToolAction}
                onPinContent={handlePinItem}
                themeColor="blue"
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-blue-200 dark:border-blue-900/50">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-blue-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-blue-200 dark:border-blue-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3">
          <div className="max-w-4xl mx-auto">
            <MultiModalInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              onFileSelect={(files) => setAttachedFiles(prev => [...prev, ...files])}
              attachedFiles={attachedFiles}
              onRemoveFile={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
              deepSearchEnabled={deepSearchEnabled}
              onToggleDeepSearch={() => setDeepSearchEnabled(!deepSearchEnabled)}
              isTyping={isTyping}
              placeholder="Ask me anything about your studies..."
              themeColor="blue"
              selectedContext={selectedContext}
              onContextChange={setSelectedContext}
            />
          </div>
        </div>
      </div>

      {/* Study Session Timer - Overlay */}
      <AnimatePresence>
        {showTimer && (
          <StudySessionTimer
            onClose={() => setShowTimer(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Reference Panel - Right Sidebar */}
      <AnimatePresence>
        {showQuickRef && (
          <QuickReference
            pinnedItems={pinnedItems}
            onRemoveItem={(index) => setPinnedItems(prev => prev.filter((_, i) => i !== index))}
            onClose={() => setShowQuickRef(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

