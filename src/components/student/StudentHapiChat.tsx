import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Heart, BookOpen, Target } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const QUICK_PROMPTS = [
  { icon: Heart, text: "I'm feeling stressed about homework", color: "from-pink-500 to-rose-500" },
  { icon: Target, text: "Help me plan my tasks", color: "from-blue-500 to-cyan-500" },
  { icon: BookOpen, text: "Tell me about my progress", color: "from-green-500 to-emerald-500" },
  { icon: Sparkles, text: "Give me study tips", color: "from-orange-500 to-yellow-500" },
];

const MOCK_CONVERSATIONS: Record<string, Message[]> = {
  stress: [
    {
      id: 'ai-stress-1',
      sender: 'ai',
      content: "I understand that homework can feel overwhelming sometimes. Let's break this down together. First, can you tell me which assignment is causing you the most stress right now?",
      timestamp: new Date(Date.now() - 2000),
    },
    {
      id: 'ai-stress-2',
      sender: 'ai',
      content: "Here are some strategies that might help:\n\n• Break large tasks into smaller, manageable chunks\n• Set a timer for 25-minute focused work sessions (Pomodoro technique)\n• Take short breaks to recharge\n• Remember that it's okay to ask for help\n\nYou've got this! 💪",
      timestamp: new Date(Date.now() - 1000),
    },
  ],
  tasks: [
    {
      id: 'ai-tasks-1',
      sender: 'ai',
      content: "Great idea! Let's organize your tasks. Based on your dashboard, I can see you have:\n\n✓ Morning Pulse Check (15 pts)\n✓ Class Pulse for Biology II (20 pts)\n\nWould you like me to help you prioritize these along with any homework assignments?",
      timestamp: new Date(Date.now() - 2000),
    },
    {
      id: 'ai-tasks-2',
      sender: 'ai',
      content: "Pro tip: Try completing quick tasks first to build momentum! The Morning Pulse takes just 2 minutes and you'll earn 15 points. 🌟",
      timestamp: new Date(Date.now() - 1000),
    },
  ],
  progress: [
    {
      id: 'ai-progress-1',
      sender: 'ai',
      content: "You're doing amazing! Let me show you your recent achievements:\n\n📊 Sentiment Trend: Improving this week\n🏆 Leaderboard: Moving up in your classes\n✨ Points Earned: Consistently completing tasks\n\nYour emotional wellness journey shows real growth. Keep up the fantastic work!",
      timestamp: new Date(Date.now() - 1000),
    },
  ],
  study: [
    {
      id: 'ai-study-1',
      sender: 'ai',
      content: "Here are my top study tips for you:\n\n1. **Active Recall**: Test yourself instead of re-reading\n2. **Spaced Repetition**: Review material at increasing intervals\n3. **Teach Others**: Explaining concepts helps solidify understanding\n4. **Environment**: Find a quiet, well-lit study space\n5. **Stay Hydrated**: Your brain needs water to function optimally\n\nWhich of these would you like to explore more?",
      timestamp: new Date(Date.now() - 1000),
    },
  ],
};

interface StudentHapiChatProps {
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

export function StudentHapiChat({ initialPrompt, onPromptUsed }: StudentHapiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: `Hi there! 👋 I'm Hapi, your AI companion for emotional wellness and academic success. I'm here to help you with anything you need - from managing stress to organizing tasks, or just being a supportive friend. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialPrompt && !hasProcessedInitialPrompt) {
      setHasProcessedInitialPrompt(true);
      setInputValue(initialPrompt);
      setTimeout(() => {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          sender: 'user',
          content: initialPrompt,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        simulateAIResponse(initialPrompt);
        if (onPromptUsed) {
          onPromptUsed();
        }
      }, 500);
    }
  }, [initialPrompt, hasProcessedInitialPrompt, onPromptUsed]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let aiMessages: Message[] = [];

      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('analytics') || lowerMessage.includes('sentiment') || lowerMessage.includes('emotional wellness journey') || lowerMessage.includes('deep dive')) {
        aiMessages = [
          {
            id: `ai-analytics-1`,
            sender: 'ai',
            content: `Thank you for sharing your analytics with me! Let me provide you with a comprehensive analysis of your emotional wellness journey.\n\n📊 **Your Sentiment Journey:**\nYour recent patterns show meaningful insights about your emotional state. The emotions you've been experiencing tell a story of your day-to-day experiences and how you're navigating your academic life.`,
            timestamp: new Date(),
          },
          {
            id: `ai-analytics-2`,
            sender: 'ai',
            content: `🎯 **Key Insights:**\n\n1. **Trend Analysis**: Your emotional trajectory reflects both challenges and triumphs. Every trend - whether up or down - is part of your growth journey.\n\n2. **Peer Comparison**: Remember, comparing yourself to classmates isn't about being "better" or "worse" - it's about understanding different perspectives and emotional experiences. Your journey is uniquely yours!\n\n3. **Pattern Recognition**: The emotions you're experiencing are valid and important. They provide clues about what's working well and where you might benefit from additional support.`,
            timestamp: new Date(),
          },
          {
            id: `ai-analytics-3`,
            sender: 'ai',
            content: `💪 **Actionable Strategies:**\n\n• **For Positive Trends**: Celebrate your wins! Acknowledge what's contributing to your positive emotions and try to maintain those habits.\n\n• **For Challenging Times**: Be gentle with yourself. Reach out to friends, teachers, or counselors. Consider stress-management techniques like deep breathing, journaling, or taking short breaks.\n\n• **For Stability**: Even when things feel consistent, small adjustments can lead to growth. Try setting micro-goals or exploring new study techniques.`,
            timestamp: new Date(),
          },
          {
            id: `ai-analytics-4`,
            sender: 'ai',
            content: `✨ **Remember**: Your emotional wellness is a journey, not a destination. Every data point represents a moment in time, and you have the power to shape your experience. I'm here to support you every step of the way!\n\nIs there a specific aspect of your emotional journey you'd like to explore further?`,
            timestamp: new Date(),
          },
        ];
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm') || lowerMessage.includes('anxious')) {
        aiMessages = MOCK_CONVERSATIONS.stress;
      } else if (lowerMessage.includes('task') || lowerMessage.includes('plan') || lowerMessage.includes('organize')) {
        aiMessages = MOCK_CONVERSATIONS.tasks;
      } else if (lowerMessage.includes('progress') || lowerMessage.includes('achievement') || lowerMessage.includes('doing')) {
        aiMessages = MOCK_CONVERSATIONS.progress;
      } else if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('tips')) {
        aiMessages = MOCK_CONVERSATIONS.study;
      } else {
        aiMessages = [
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            content: "That's a great question! I'm here to support you in several ways:\n\n• **Emotional Support**: Talk about how you're feeling\n• **Task Management**: Help organize your assignments\n• **Study Strategies**: Share effective learning techniques\n• **Progress Tracking**: Review your achievements\n\nWhat would you like to explore?",
            timestamp: new Date(),
          },
        ];
      }

      setMessages((prev) => [...prev, ...aiMessages]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    simulateAIResponse(userMessage.content);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Hapi AI companion</h1>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal guidance for wellbeing and study</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-20rem)] max-h-[680px] rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Chat with Hapi</h2>
              <p className="text-xs text-muted-foreground">Thoughtful responses grounded in your recent activity.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 bg-muted/30" style={{ scrollBehavior: 'smooth' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground border border-border'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                      Hapi
                    </div>
                  )}
                  <p className="text-base leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                </div>
                <span className={`mt-1 block text-xs text-muted-foreground ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="max-w-[80%]">
                <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                      <Brain className="h-3.5 w-3.5" />
                    </div>
                    Hapi is typing
                  </div>
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="border-t border-border bg-card px-6 py-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Suggested prompts
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {QUICK_PROMPTS.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    {prompt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-border bg-card px-6 py-5">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
