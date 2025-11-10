import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'study-plan' | 'suggestion';
};

type ChatContextType = {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  unreadCount: number;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  markAsRead: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: `Hi! I'm Hapi, your AI learning companion. I can help you with:\n\n• Creating personalized study plans\n• Homework and concept explanations\n• Time management and scheduling\n• Motivation and study tips\n\nWhat would you like help with today?`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const detectStudyPlanIntent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const studyPlanKeywords = [
      'create study plan',
      'make study plan',
      'study plan',
      'help me study',
      'plan my study',
      'study schedule',
      'organize my study',
      'study planner'
    ];
    return studyPlanKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const generateAIResponse = useCallback((userInput: string): Message => {
    const input = userInput.toLowerCase();
    let response = "";
    let type: Message['type'] = 'text';

    // Detect study plan intent
    if (detectStudyPlanIntent(input)) {
      response = `I'd love to help you create a personalized study plan!\n\nI'll take you to our Smart Study Planner where I can:\n\n• Analyze your upcoming assignments and deadlines\n• Consider your current grades and workload\n• Create an optimized study schedule\n• Suggest the best times for each subject\n\nRedirecting you now...`;
      type = 'study-plan';
      
      // Navigate to study planner after a short delay
      setTimeout(() => {
        navigate('/dashboard/planner', {
          state: {
            fromChat: true,
            userMessage: userInput
          }
        });
      }, 2000);
    } else if (input.includes('stress') || input.includes('anxious') || input.includes('worried') || input.includes('overwhelmed')) {
      response = `I understand you're feeling stressed. Let's work through this together.\n\n**Quick Stress Relief:**\n• Take 3 deep breaths - in for 4, hold for 4, out for 4\n• Break big tasks into smaller, manageable steps\n• Take a 5-minute break to stretch or walk\n• Remember: You've handled challenges before\n\nWhat specific task is causing the most stress? Let's tackle it together.`;
    } else if (input.includes('homework') || input.includes('assignment')) {
      response = `I can help you with your homework!\n\n**Let's break it down:**\n1. What subject is it for?\n2. What's the specific topic or question?\n3. When is it due?\n\nI can:\n• Explain difficult concepts\n• Provide step-by-step guidance\n• Suggest study resources\n• Help you manage your time\n\nTell me more about what you're working on!`;
    } else if (input.includes('time') || input.includes('schedule') || input.includes('manage')) {
      response = `Time management is key to academic success!\n\n**Quick Tips:**\n• Use the Pomodoro Technique (25 min work, 5 min break)\n• Prioritize tasks by urgency and importance\n• Schedule study sessions when your energy is highest\n• Build in buffer time for unexpected tasks\n\nWould you like me to create a study plan for you? Just say "create study plan"!`;
    } else if (input.includes('motivat') || input.includes('tired') || input.includes('give up')) {
      response = `You've got this! Remember why you started.\n\n**Motivation Boosters:**\n• Celebrate small wins - every step counts\n• Focus on progress, not perfection\n• Study with friends for accountability\n• Reward yourself after completing tasks\n\nYou're capable of amazing things. What's one small thing you can accomplish right now?`;
    } else {
      response = `I'm here to help! Based on what you're asking, I can assist with:\n\n• **Study Planning** - Say "create study plan"\n• **Homework Help** - Tell me what subject you need help with\n• **Time Management** - Ask about scheduling and organization\n• **Motivation** - I'm here when you need encouragement\n\nWhat would be most helpful for you right now?`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      content: response,
      timestamp: new Date(),
      type
    };
  }, [navigate]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Increment unread count if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1000 + Math.random() * 1000); // 1-2 seconds
  }, [isOpen, generateAIResponse]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: `Hi! I'm Hapi, your AI learning companion. I can help you with:\n\n• Creating personalized study plans\n• Homework and concept explanations\n• Time management and scheduling\n• Motivation and study tips\n\nWhat would you like help with today?`,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        messages,
        isTyping,
        unreadCount,
        toggleChat,
        openChat,
        closeChat,
        sendMessage,
        clearMessages,
        markAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
