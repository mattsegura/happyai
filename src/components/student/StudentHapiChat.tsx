import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Heart, BookOpen, Target, TrendingUp, Users } from 'lucide-react';

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
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 rounded-3xl p-8 shadow-2xl border-2 border-cyan-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/40 to-blue-300/40 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl -ml-40 -mb-40"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-teal-700 bg-clip-text text-transparent tracking-tight">
                Hapi AI
              </h1>
              <p className="text-blue-700 font-semibold mt-1 text-lg">Your wellness and study companion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-20rem)] max-h-[700px] bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-3xl shadow-2xl border-2 border-blue-200 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-600 p-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white drop-shadow-md">Chat with Hapi</h2>
              <p className="text-cyan-100 text-sm font-medium">Real-time support and guidance</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-blue-50/30" style={{ scrollBehavior: 'smooth' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-5 py-4 shadow-lg border-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white border-blue-300'
                      : 'bg-white text-gray-800 border-blue-100'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md opacity-50"></div>
                        <div className="relative w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Hapi</span>
                    </div>
                  )}
                  <p className="text-base leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                </div>
                <span className={`text-xs text-gray-400 mt-1 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="max-w-[80%]">
                <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border-2 border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                      <div className="relative w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Hapi</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-6">
            <div className="mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quick Start</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_PROMPTS.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className={`relative overflow-hidden bg-gradient-to-br ${prompt.color} text-white rounded-2xl p-4 text-left shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group border-2 border-white/20`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                    <div className="relative z-10">
                      <Icon className="w-6 h-6 mb-3 drop-shadow-lg" />
                      <p className="text-sm font-bold leading-tight drop-shadow-md">{prompt.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-t-2 border-blue-200">
          <div className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-5 py-4 bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-300 text-gray-800 placeholder:text-gray-400 font-medium shadow-md"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-colors duration-300"></div>
              <Send className="relative z-10 w-6 h-6 text-white drop-shadow-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
