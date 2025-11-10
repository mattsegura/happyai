import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send,
  Brain,
  User,
  Bot,
  Loader
} from 'lucide-react';
import { cn } from '../../lib/utils';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'study-plan' | 'tutor' | 'suggestion';
};

type AcademicContext = {
  type: 'study-plan' | 'ai-tutor';
  courses?: any[];
  assignments?: any[];
  focusCourse?: any;
  message: string;
};

export function EnhancedHapiChat() {
  const location = useLocation();
  const academicContext = location.state?.context as AcademicContext | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with context if provided
  useEffect(() => {
    if (academicContext) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'ai',
        content: academicContext.message,
        timestamp: new Date(),
        type: academicContext.type === 'study-plan' ? 'study-plan' : 'tutor'
      };
      setMessages([welcomeMessage]);

      // Generate suggestions based on context
      if (academicContext.type === 'study-plan') {
        setSuggestions([
          "Create a weekly study schedule",
          "Which assignment should I start with?",
          "How much time for each subject?",
          "Best study techniques for my courses"
        ]);

        // Auto-generate study plan after a delay
        setTimeout(() => generateStudyPlan(), 1500);
      } else if (academicContext.type === 'ai-tutor') {
        setSuggestions([
          `Help with ${academicContext.focusCourse?.name}`,
          "Explain difficult concepts",
          "Practice problems",
          "Review for upcoming tests"
        ]);
      }
    } else {
      // Default welcome message
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        content: `Hi! I'm Hapi, your AI learning companion. 🎓 I can help you with homework, create study plans, explain concepts, and keep you motivated. What would you like help with today?`,
        timestamp: new Date(),
        type: 'text'
      }]);

      setSuggestions([
        "Help me study",
        "Create a study plan",
        "Explain a concept",
        "I'm feeling stressed"
      ]);
    }
  }, [academicContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateStudyPlan = () => {
    if (!academicContext?.assignments) return;

    setIsTyping(true);
    setTimeout(() => {
      const studyPlanContent = `
## 📚 Your Personalized Study Plan

Based on your current workload, here's an optimized schedule:

### 🚨 Priority Tasks (Next 48 hours)
${(academicContext.assignments || [])
  .filter((a: any) => a.priority === 'high')
  .map((a: any) => `• **${a.title}** - ${a.course} (Due: ${a.due})`)
  .join('\n')}

### 📅 This Week's Schedule

**Monday - Wednesday**
- Morning (9-11 AM): Focus on high-priority assignments
- Afternoon (2-4 PM): Course review and practice problems
- Evening (7-8 PM): Light reading and notes review

**Thursday - Friday**
- Complete remaining assignments
- Review weak areas (especially Chemistry - currently at 84%)
- Prepare for next week

### ⏰ Recommended Time Allocation
- Biology 101: 6 hours/week (Lab report priority!)
- Calculus II: 5 hours/week
- History 201: 4 hours/week (Essay planning)
- Chemistry: 3 hours/week

### 💡 Study Tips
1. Use **Pomodoro Technique**: 25 min focused work, 5 min break
2. Start with hardest subjects when energy is high
3. Review notes before bed for better retention
4. Join study groups for difficult topics

Would you like me to adjust this plan or focus on a specific subject?
      `.trim();

      const studyPlanMessage: Message = {
        id: `ai-plan-${Date.now()}`,
        sender: 'ai',
        content: studyPlanContent,
        timestamp: new Date(),
        type: 'study-plan'
      };

      setMessages(prev => [...prev, studyPlanMessage]);
      setIsTyping(false);

      // Update suggestions
      setSuggestions([
        "Adjust the schedule",
        "More help with Biology lab",
        "Study techniques for math",
        "Break down the History essay"
      ]);
    }, 2000);
  };

  const handleSendMessage = (content?: string) => {
    const messageText = content || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: messageText,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    let response = "";

    if (input.includes('stress') || input.includes('anxious') || input.includes('worried')) {
      response = `I understand you're feeling stressed. Let's work through this together. 💙

Remember:
• Take deep breaths - in for 4, hold for 4, out for 4
• Break big tasks into smaller, manageable steps
• It's okay to take breaks when you need them
• You've handled challenges before, and you can handle this too

What specific task is causing the most stress right now? Let's tackle it together.`;
    } else if (input.includes('biology') || input.includes('lab')) {
      response = `Let's focus on your Biology lab report! Here's a structured approach:

**Lab Report Structure:**
1. **Title & Objective** - Clear statement of what you're investigating
2. **Hypothesis** - Your predicted outcome based on research
3. **Methods** - Step-by-step procedure (past tense, passive voice)
4. **Results** - Data tables, graphs, observations (no interpretation yet!)
5. **Discussion** - Interpret results, explain trends, address errors
6. **Conclusion** - Summary and hypothesis evaluation

Need help with any specific section? I can provide examples!`;
    } else if (input.includes('math') || input.includes('calculus')) {
      response = `Calculus II can be challenging! Here are key topics to focus on:

**Integration Techniques:**
• Substitution method
• Integration by parts
• Partial fractions
• Trigonometric substitution

Would you like me to:
1. Walk through a specific problem?
2. Explain a concept you're stuck on?
3. Provide practice problems with solutions?`;
    } else {
      response = `I'm here to help! Based on your academic profile, I can assist with:

• Creating study schedules
• Breaking down complex assignments
• Explaining difficult concepts
• Providing motivation and support
• Helping with time management

What would be most helpful for you right now?`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      content: response,
      timestamp: new Date(),
      type: 'text'
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hapi AI</h2>
            <p className="text-xs text-muted-foreground">Your learning companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {academicContext && (
            <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
              {academicContext.type === 'study-plan' ? 'Study Planning Mode' : 'AI Tutor Mode'}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              message.sender === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
            )}>
              {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={cn(
                'max-w-[70%] rounded-2xl p-3 shadow-sm',
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border',
                message.type === 'study-plan' && 'max-w-[85%]'
              )}
            >
              {message.type === 'study-plan' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('##')) {
                      return <h3 key={i} className="text-base font-semibold mt-3 mb-2">{line.replace('##', '').trim()}</h3>;
                    } else if (line.startsWith('###')) {
                      return <h4 key={i} className="text-sm font-semibold mt-2 mb-1 text-primary">{line.replace('###', '').trim()}</h4>;
                    } else if (line.startsWith('•')) {
                      return <li key={i} className="text-xs ml-3">{line.replace('•', '').trim()}</li>;
                    } else if (line.includes('**')) {
                      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return <p key={i} className="text-xs my-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
                    } else if (line.trim()) {
                      return <p key={i} className="text-xs my-1">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              )}
              <div className={cn(
                'text-[10px] mt-2',
                message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Hapi is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-xs font-medium whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm rounded-b-2xl">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your studies..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm placeholder:text-muted-foreground transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              inputValue.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
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