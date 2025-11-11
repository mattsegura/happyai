import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Globe, Calendar, Target, Brain, Zap, Heart, Clock,
  Award, Settings, Pin, Download, Trash2, Menu, X, ChevronRight,
  MessageCircle, Image as ImageIcon, FileText, Video, Mic, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateAIContext, getContextBadges, formatContextForAI, AIContext } from '@/lib/ai/contextEngine';
import { DragDropOverlay } from './DragDropOverlay';
import { SmartSuggestions } from './SmartSuggestions';
import { EnhancedMessage } from './EnhancedMessage';
import { MultiModalInput } from './MultiModalInput';
import { FeatureCommandPalette } from './FeatureCommandPalette';
import { QuickAccessSidebar } from './QuickAccessSidebar';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { SmartNotesExtractor } from './SmartNotesExtractor';
import { QuickActionButtons } from './QuickActionButtons';
import {
  loadMessages,
  addMessage,
  cleanupOldMessages,
  initializeCleanup,
  Message,
  getActiveConversationId,
  setActiveConversationId,
  isPrivateModeEnabled,
  getAllConversations,
  createConversation,
} from '@/lib/chat/conversationManager';
import { detectPersonalityMode, generatePersonalityPrompt, needsCrisisResources, getCrisisResourcesMessage } from '@/lib/ai/adaptivePersonality';
import { detectActions, generateContextualActions } from '@/lib/ai/actionDetector';

export function HapiChatViewRedesigned() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showNotesExtractor, setShowNotesExtractor] = useState(false);
  const [historySidebarCollapsed, setHistorySidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const privateMode = isPrivateModeEnabled();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize context and messages
  useEffect(() => {
    const aiContext = generateAIContext();
    setContext(aiContext);
    
    // Initialize auto-cleanup
    initializeCleanup();
    
    // Load active conversation or create one
    const existingConvId = getActiveConversationId();
    const allConvs = getAllConversations();
    
    if (existingConvId || allConvs.length > 0) {
      const convId = existingConvId || allConvs[0]?.id;
      setActiveConversationId(convId);
      const stored = loadMessages(convId);
      setMessages(stored);
    } else if (!privateMode) {
      // No conversations, create first one
      const newConv = createConversation();
      setActiveConversationId(newConv.id);
      setMessages([]);
    } else {
      // Private mode, load private messages
      const stored = loadMessages();
      setMessages(stored);
    }
  }, []);

  // Update messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const stored = loadMessages(activeConversationId);
      setMessages(stored);
    }
  }, [activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle drag and drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.target === containerRef.current) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (content: string, files?: File[]) => {
    // Add user message
    const userMsg = addMessage({ role: 'user', content, files: files || [] }, activeConversationId || undefined);
    setMessages(prev => [...prev, userMsg]);

    // Detect personality mode (academic vs wellbeing)
    const personalityContext = detectPersonalityMode(content);
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Generate AI response with adaptive personality
    setTimeout(() => {
      const contextInfo = context ? formatContextForAI(context) : '';
      
      // Generate response using personality-aware prompt
      let aiResponse = generateAIResponseWithPersonality(content, contextInfo, personalityContext);
      
      // Add crisis resources if needed
      if (needsCrisisResources(personalityContext)) {
        aiResponse += '\n\n' + getCrisisResourcesMessage();
      }
      
      // Detect actions from AI response
      const detectedActions = detectActions(aiResponse, content);
      
      const aiMsg = addMessage({ 
        role: 'assistant', 
        content: aiResponse,
        actions: detectedActions.map(a => a.type)
      }, activeConversationId || undefined);
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleConversationChange = (conversationId: string | null) => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      const stored = loadMessages(conversationId);
      setMessages(stored);
    } else {
      setMessages([]);
    }
  };

  const contextBadges = context ? getContextBadges(context) : [];

  // Show "Extract Notes" button after 5+ messages
  const canExtractNotes = messages.length >= 5;

  return (
    <div
      ref={containerRef}
      className="relative flex h-[calc(100vh-120px)] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0e7ff 75%, #ede9fe 100%)',
      }}
    >
      {/* Glassmorphism Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Chat History Sidebar (Left) */}
      <ChatHistorySidebar
        collapsed={historySidebarCollapsed}
        onCollapse={setHistorySidebarCollapsed}
        onConversationChange={handleConversationChange}
        activeConversationId={activeConversationId}
      />

      {/* Quick Access Sidebar (Right - toggleable) */}
      <QuickAccessSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col z-10 min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 p-3 backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-b border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI Learning Companion</h1>
                  <p className="text-xs text-muted-foreground">
                    Context-aware • Multi-modal • Always learning
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canExtractNotes && !showNotesExtractor && (
                <button
                  onClick={() => setShowNotesExtractor(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-primary to-accent text-white hover:shadow-md transition-all"
                >
                  <FileText className="h-3 w-3 inline mr-1" />
                  Extract Notes
                </button>
              )}
              <button
                onClick={() => setShowContext(!showContext)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  showContext
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              >
                <Brain className="h-3 w-3 inline mr-1" />
                Context
              </button>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/50 hover:bg-white/70 transition-colors"
              >
                ⌘K Features
              </button>
            </div>
          </div>

          {/* Context Badges */}
          <div className="flex flex-wrap gap-2">
            {contextBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border',
                  badge.color === 'red' && 'bg-red-100/80 border-red-300 text-red-700',
                  badge.color === 'orange' && 'bg-orange-100/80 border-orange-300 text-orange-700',
                  badge.color === 'green' && 'bg-green-100/80 border-green-300 text-green-700',
                  badge.color === 'blue' && 'bg-blue-100/80 border-blue-300 text-blue-700',
                  badge.color === 'purple' && 'bg-purple-100/80 border-purple-300 text-purple-700'
                )}
              >
                {badge.label}: {badge.value}
              </motion.div>
            ))}
          </div>

          {/* Expanded Context Panel */}
          <AnimatePresence>
            {showContext && context && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-lg"
              >
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-muted-foreground mb-1">Current Classes</div>
                    {context.currentClasses.map(c => (
                      <div key={c.id} className="text-foreground">{c.name} ({c.grade}%)</div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-muted-foreground mb-1">Upcoming Deadlines</div>
                    {context.upcomingDeadlines.slice(0, 3).map((d, idx) => (
                      <div key={idx} className="text-foreground">{d.title} - {d.daysUntil}d</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Smart Suggestions */}
        {context && messages.length === 0 && (
          <SmartSuggestions
            suggestions={context.suggestions}
            onSelect={handleSendMessage}
          />
        )}

        {/* Smart Notes Extractor */}
        <AnimatePresence>
          {showNotesExtractor && (
            <SmartNotesExtractor
              messages={messages}
              onClose={() => setShowNotesExtractor(false)}
            />
          )}
        </AnimatePresence>

        {/* Messages Area - Full Width - Maximized */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-4">
            {messages.length === 0 && !context?.suggestions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Hi! I'm your AI Learning Companion
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  I have full context of your classes, assignments, mood, and study patterns.
                  Ask me anything or try one of the suggestions above!
                </p>
              </motion.div>
            )}

            {messages.map((message, idx) => (
              <EnhancedMessage
                key={message.id}
                message={message}
                index={idx}
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 max-w-xs"
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Positioned at Bottom */}
        <div className="flex-shrink-0">
          <MultiModalInput
            onSend={handleSendMessage}
            disabled={isTyping}
          />
        </div>
      </div>

      {/* Drag & Drop Overlay */}
      <DragDropOverlay
        isVisible={isDragging}
        onDrop={(files) => {
          setIsDragging(false);
          // Handle dropped files
        }}
      />

      {/* Command Palette */}
      <FeatureCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

// AI response generator with adaptive personality
function generateAIResponseWithPersonality(
  userMessage: string,
  context: string,
  personalityContext: any
): string {
  const mode = personalityContext.mode;
  const tone = personalityContext.suggestedTone;
  
  // Academic mode responses
  if (mode === 'academic') {
    const academicResponses = [
      `Let's tackle this systematically. ${userMessage.includes('deadline') ? 'I see you have a deadline coming up.' : ''} Here's a plan to help you succeed:\n\n1. Break down the assignment into smaller tasks\n2. Allocate specific time blocks for each\n3. Start with the most challenging parts while you're fresh\n\nWould you like me to create a detailed study plan for this?`,
      `Based on your current workload, I recommend prioritizing ${context.includes('Calculus') ? 'Calculus' : 'your most urgent assignment'} first. Let's create a strategy to maximize your efficiency and ensure you meet all deadlines.`,
      `Great question! Let me break this concept down for you step by step. Understanding the fundamentals will make the rest much easier. ${context.includes('critical') ? 'This is especially important given your upcoming deadlines.' : ''}`,
      `I can help you with that. Let's focus on building a strong foundation in this topic. Would you like me to generate some practice problems or create flashcards to help you master this?`,
    ];
    return academicResponses[Math.floor(Math.random() * academicResponses.length)];
  }
  
  // Wellbeing mode responses
  if (mode === 'wellbeing') {
    const wellbeingResponses = [
      `I hear you, and what you're feeling is completely valid. It sounds like you're going through a really challenging time right now. Let's take this one step at a time together.\n\nFirst, let's acknowledge that it's okay to feel overwhelmed. You're dealing with a lot. How can I best support you right now?`,
      `That must feel really overwhelming. You're not alone in this - many students experience similar feelings, especially during busy periods.\n\nLet's focus on what we can control. Would it help to:\n• Schedule some breaks into your day\n• Talk through what's causing the most stress\n• Create a more manageable plan\n\nWhat sounds most helpful to you?`,
      `Thank you for sharing that with me. Your wellbeing matters, and it's important that we address how you're feeling. Sometimes when we're stressed, even small tasks can feel impossible.\n\nWould you like to talk more about what's on your mind, or would you prefer if we worked together on managing your workload in a way that feels less overwhelming?`,
      `I'm here for you. It takes courage to acknowledge when things feel too much. Let's work together to find some balance. Remember, your mental health is just as important as your academic success.\n\nWhat's one small thing we could do right now that might help you feel a bit better?`,
    ];
    return wellbeingResponses[Math.floor(Math.random() * wellbeingResponses.length)];
  }
  
  // Neutral/default responses
  const neutralResponses = [
    `I'm here to help! Tell me more about what you're working on, and we can figure out the best way forward together.`,
    `That's an interesting question. Let me provide some guidance. What specific aspect would you like to explore first?`,
    `I can assist you with that. Would you like to focus on the academic side (study strategies, deadlines, concepts) or would you prefer to talk about how you're managing everything?`,
    `Let's work through this together. I'm here to support you however you need - whether that's help with coursework or just someone to talk to about how things are going.`,
  ];
  
  return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
}

