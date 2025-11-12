import { useState, useEffect, useRef } from 'react';
import { Heart, Send, Paperclip, X, Sparkles, Wind, Smile, Moon, Sun, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { MultiModalInput } from './MultiModalInput';
import { EnhancedMessage } from './EnhancedMessage';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { BreathingExercise } from './coach/BreathingExercise';
import { EmotionWheel } from './coach/EmotionWheel';
import { MoodCheckIn } from './coach/MoodCheckIn';
import {
  loadMessages,
  addMessage,
  type Message,
  getActiveConversationId,
} from '../../lib/chat/conversationManager';

/**
 * WellbeingCoachChat - Purple-themed AI focused on emotional support and balance
 * Features: Breathing exercises, mood tracking, grounding techniques, therapeutic presence
 */
export function WellbeingCoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [historySidebarCollapsed, setHistorySidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showEmotionWheel, setShowEmotionWheel] = useState(false);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for active conversation
  useEffect(() => {
    const convId = getActiveConversationId();
    setActiveConversationId(convId);
    if (convId) {
      const loadedMessages = loadMessages(convId);
      setMessages(loadedMessages);
    } else {
      // Create warm welcome message for new conversation
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi there 💜 I'm your Wellbeing Coach. This is a safe, judgment-free space where you can share whatever's on your mind. Whether you're feeling stressed, need to talk through something, or just want to check in - I'm here for you. How are you doing today?",
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

    // Simulate AI response with therapeutic personality
    setTimeout(() => {
      const response = generateTherapeuticResponse(inputValue);
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
    }, 1200 + Math.random() * 800);
  };

  const generateTherapeuticResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Crisis detection
    if (lowerInput.includes('harm') || lowerInput.includes('hurt myself') || lowerInput.includes('suicide')) {
      return {
        content: "I hear that you're going through an incredibly difficult time right now, and I want you to know that your safety is the most important thing. Please reach out to someone who can provide immediate support:\n\n🆘 **Crisis Resources:**\n• National Crisis Hotline: 988\n• Crisis Text Line: Text HOME to 741741\n• International Helplines: findahelpline.com\n\nYou don't have to face this alone. Would you like to talk about what's bringing up these feelings?",
        actions: ['crisis_resources', 'breathing_exercise']
      };
    }
    
    // Stress/anxiety responses
    if (lowerInput.includes('stress') || lowerInput.includes('anxious') || lowerInput.includes('overwhelm')) {
      return {
        content: "It sounds like you're carrying a lot right now. That feeling of being overwhelmed is really tough. Let's take a moment together - would a quick breathing exercise help ground you? Or would you prefer to talk through what's on your mind?\n\nRemember: You don't have to figure everything out at once. We can take this one step at a time.",
        actions: ['breathing_exercise', 'grounding_technique', 'mood_check']
      };
    }
    
    // Emotional validation responses
    if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('down')) {
      return {
        content: "I'm really sorry you're feeling this way. Sadness can feel so heavy, and it takes courage to acknowledge it. Your feelings are valid, and it's okay to not be okay sometimes.\n\nCan you tell me a bit more about what's been going on? Sometimes putting feelings into words can help lighten the load a little.",
        actions: ['mood_check', 'journaling_prompt', 'self_compassion']
      };
    }
    
    // Sleep/rest concerns
    if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('exhaust')) {
      return {
        content: "Sleep is so important for our wellbeing, and it sounds like you might not be getting the rest you need. Let's explore this:\n\n• What's your current sleep routine like?\n• Are worries keeping you up?\n• How can we build better sleep habits?\n\nI can also guide you through a relaxation exercise if that would help.",
        actions: ['sleep_hygiene', 'breathing_exercise', 'relaxation_guide']
      };
    }
    
    // Positive check-ins
    if (lowerInput.includes('good') || lowerInput.includes('better') || lowerInput.includes('happy')) {
      return {
        content: "That's wonderful to hear! 🌟 It's important to celebrate these moments. What do you think has been contributing to feeling this way? Recognizing what helps us feel good can be really valuable.\n\nHow can we build on this positive momentum?",
        actions: ['mood_check', 'gratitude_prompt']
      };
    }

    // Default empathetic response
    return {
      content: "Thank you for sharing with me. I'm here to listen and support you, no matter what you're going through. There's no pressure to have everything figured out.\n\nWhat feels most important to talk about right now? Or if you'd prefer, we could start with a simple mood check-in or a calming exercise.",
      actions: ['mood_check', 'emotion_wheel', 'breathing_exercise']
    };
  };

  const handleToolAction = (action: string) => {
    // Handle therapeutic interventions
    if (action === 'breathing_exercise') {
      setShowBreathingExercise(true);
      return;
    }
    
    if (action === 'emotion_wheel') {
      setShowEmotionWheel(true);
      return;
    }
    
    if (action === 'mood_check') {
      setShowMoodCheckIn(true);
      return;
    }

    const toolMessages: Record<string, string> = {
      grounding_technique: "Let's try the 5-4-3-2-1 grounding technique:\n\n👀 Name **5 things** you can see\n✋ **4 things** you can touch\n👂 **3 things** you can hear\n👃 **2 things** you can smell\n👅 **1 thing** you can taste\n\nTake your time with each one. This helps bring you back to the present moment.",
      crisis_resources: "🆘 **Immediate Help:**\n• 988 Suicide & Crisis Lifeline\n• Crisis Text Line: Text HOME to 741741\n• SAMHSA Helpline: 1-800-662-4357\n• International: findahelpline.com\n\nPlease reach out - you deserve support.",
      journaling_prompt: "Sometimes writing can help process feelings. Here's a gentle prompt:\n\n\"Right now, I'm feeling... because...\"\n\nWrite as much or as little as feels right. There's no wrong way to do this.",
      self_compassion: "Let's practice self-compassion together. Imagine a friend came to you with what you're going through. What would you tell them? \n\nNow, can you extend that same kindness to yourself? You deserve the same compassion you'd give to others.",
      sleep_hygiene: "Let's build a better sleep routine:\n\n🌙 **Sleep Hygiene Tips:**\n• Same bedtime each night\n• No screens 1hr before bed\n• Cool, dark room\n• Relaxation routine\n• Limit caffeine after 2pm\n\nSmall changes can make a big difference.",
      relaxation_guide: "Let's do a quick body scan relaxation. Close your eyes if comfortable, and starting from your toes, notice any tension. Breathe into those areas and let them soften...",
      gratitude_prompt: "Gratitude can shift our perspective. Can you think of 3 things you're grateful for today? They can be big or small - a warm cup of coffee, a kind word, a sunny day...",
    };

    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: toolMessages[action] || `${action}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    addMessage(message, activeConversationId || undefined);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        collapsed={historySidebarCollapsed}
        onToggleCollapse={() => setHistorySidebarCollapsed(!historySidebarCollapsed)}
        onConversationChange={(id) => setActiveConversationId(id)}
        activeConversationId={activeConversationId}
        aiType="coach"
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Purple Theme */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 border-b border-purple-200 dark:border-purple-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              {/* Animated AI Avatar - Breathing motion */}
              <motion.div
                animate={{
                  scale: isTyping ? [1, 1.05, 1] : [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                {isTyping && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-purple-400 -z-10"
                  />
                )}
              </motion.div>

              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Wellbeing Coach
                </h2>
                <p className="text-xs text-muted-foreground">Your safe space</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Wellness Tools */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBreathingExercise(true)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Wind className="w-4 h-4 mr-1" />
                Breathe
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoodCheckIn(true)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Smile className="w-4 h-4 mr-1" />
                Mood
              </Button>

              {/* Wellbeing Badge */}
              <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Wellbeing Mode</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages Area with Aurora Background */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* Animated aurora gradient background */}
          <motion.div 
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          />
          
          <div className="relative max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <EnhancedMessage
                key={message.id}
                message={message}
                onActionClick={handleToolAction}
                themeColor="purple"
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-purple-200 dark:border-purple-900/50">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-purple-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-pink-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-purple-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-purple-200 dark:border-purple-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3">
          <div className="max-w-4xl mx-auto">
            <MultiModalInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              onFileSelect={(files) => setAttachedFiles(prev => [...prev, ...files])}
              attachedFiles={attachedFiles}
              onRemoveFile={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
              deepSearchEnabled={false}
              onToggleDeepSearch={() => {}}
              isTyping={isTyping}
              placeholder="Share what's on your mind... this is a safe space"
              themeColor="purple"
              hideDeepSearch={true}
            />
          </div>
        </div>
      </div>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathingExercise && (
          <BreathingExercise
            onClose={() => setShowBreathingExercise(false)}
          />
        )}
      </AnimatePresence>

      {/* Emotion Wheel Modal */}
      <AnimatePresence>
        {showEmotionWheel && (
          <EmotionWheel
            onClose={() => setShowEmotionWheel(false)}
            onEmotionSelect={(emotion) => {
              const message: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Thank you for sharing that you're feeling ${emotion}. That's a really important emotion to notice. Can you tell me more about what's contributing to this feeling?`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, message]);
              addMessage(message, activeConversationId || undefined);
              setShowEmotionWheel(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mood Check-In Modal */}
      <AnimatePresence>
        {showMoodCheckIn && (
          <MoodCheckIn
            onClose={() => setShowMoodCheckIn(false)}
            onComplete={(mood, notes) => {
              const message: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Thanks for checking in. I see you're feeling ${mood}/10 today${notes ? `. You mentioned: "${notes}"` : ''}. I'm here if you'd like to explore that further, or we can work on some strategies to support your wellbeing.`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, message]);
              addMessage(message, activeConversationId || undefined);
              setShowMoodCheckIn(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

