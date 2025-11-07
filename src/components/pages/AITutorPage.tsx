import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Calendar,
  Target,
  Share2,
  TrendingUp,
  Gauge,
  Clock,
  Users,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  Zap,
  BookOpen,
  Activity,
  Lock
} from 'lucide-react';
import { Logo } from '../ui/logo';
import { PromptBox } from '../ui/chatgpt-prompt-input';
import { AIStudyFlow } from '../ui/ai-study-flow';

// AI Chat Interface Component
interface AIChatInterfaceProps {
  onStudyPlanGenerated: (blocks: StudyBlock[]) => void;
  onFlowStart: () => void;
  onFlowComplete: () => void;
  isFlowComplete: boolean;
  onResetFlow: () => void;
}

interface StudyBlock {
  day: Date;
  subject: string;
  time: string;
  duration: string;
  color: string;
}

function AIChatInterface({ onStudyPlanGenerated, onFlowStart, onFlowComplete, isFlowComplete, onResetFlow }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string, isLoading?: boolean }>>([
    { role: 'ai', content: 'What can I help you with today?' }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasClicked, setHasClicked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasDeployed, setHasDeployed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    // Only auto-scroll if the user is near the bottom of the chat
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, progress]);

  const handleReset = () => {
    setMessages([{ role: 'ai', content: 'What can I help you with today?' }]);
    setInputValue("");
    setHasClicked(false);
    setIsSending(false);
    setProgress(0);
    setHasDeployed(false); // Allow template to be clicked again
    onStudyPlanGenerated([]); // Clear the calendar
    onResetFlow(); // Trigger AIStudyFlow reset
    onFlowComplete(); // Reset the flow state
  };
  
  // Update "Generating" message to "Your study plan has been created!" when complete
  useEffect(() => {
    if (isFlowComplete) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isLoading) {
          return [...prev.slice(0, -1), { role: 'ai', content: 'Your study plan has been created!', isLoading: false }];
        }
        return prev;
      });
    }
  }, [isFlowComplete]);

  const handleTemplateClick = () => {
    if (hasDeployed) return; // Prevent clicking if already deployed
    setInputValue("Help me plan for my upcoming assignments");
    setHasClicked(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const messageInput = formData.get("message") as string || inputValue;
    
    if (!messageInput || isSending || !hasClicked) return;

    setIsSending(true);
    setHasClicked(false);
    setHasDeployed(true); // Mark as deployed
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: messageInput }]);

    // Start the AI flow visualization
    onFlowStart();
    
    // Show "Generating..." message with loading effect
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Generating', isLoading: true }]);
      setIsSending(false);
      
      // Generate intelligently sorted study blocks (sorted by date, earliest first)
      const studyBlocks: StudyBlock[] = [
        // Biology Research Paper - Due Aug 11 (EARLIEST - gets priority, starts Aug 4)
        { day: new Date("2025-08-04"), subject: "Biology Research Paper", time: "2:00 PM", duration: "2h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        { day: new Date("2025-08-05"), subject: "Biology Research Paper", time: "3:00 PM", duration: "2h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        { day: new Date("2025-08-06"), subject: "Biology Research Paper", time: "1:00 PM", duration: "2h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        { day: new Date("2025-08-07"), subject: "Biology Research Paper", time: "4:00 PM", duration: "2h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        { day: new Date("2025-08-08"), subject: "Biology Research Paper", time: "3:00 PM", duration: "1.5h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        { day: new Date("2025-08-09"), subject: "Biology Research Paper", time: "2:00 PM", duration: "1h", color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white" },
        
        // History Project - Due Aug 16 (starts after Bio paper is mostly done)
        { day: new Date("2025-08-10"), subject: "History Project", time: "10:00 AM", duration: "1.5h", color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white" },
        { day: new Date("2025-08-11"), subject: "History Project", time: "11:00 AM", duration: "1.5h", color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white" },
        { day: new Date("2025-08-12"), subject: "History Project", time: "2:00 PM", duration: "1.5h", color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white" },
        { day: new Date("2025-08-13"), subject: "History Project", time: "3:00 PM", duration: "1.5h", color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white" },
        { day: new Date("2025-08-14"), subject: "History Project", time: "10:00 AM", duration: "1.5h", color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white" },
        
        // Calculus Exam - Due Aug 20 (overlaps with History, starts mid-week)
        { day: new Date("2025-08-14"), subject: "Calculus Exam Prep", time: "4:00 PM", duration: "1.5h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        { day: new Date("2025-08-15"), subject: "Calculus Exam Prep", time: "11:00 AM", duration: "2h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        { day: new Date("2025-08-16"), subject: "Calculus Exam Prep", time: "2:00 PM", duration: "2h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        { day: new Date("2025-08-17"), subject: "Calculus Exam Prep", time: "3:00 PM", duration: "2h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        { day: new Date("2025-08-18"), subject: "Calculus Exam Prep", time: "1:00 PM", duration: "2h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        { day: new Date("2025-08-19"), subject: "Calculus Exam Prep", time: "3:00 PM", duration: "2h", color: "bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-400 text-white" },
        
        // AP Biology Exam - Due Aug 26 (starts after Calculus exam)
        { day: new Date("2025-08-21"), subject: "AP Biology Exam Prep", time: "1:00 PM", duration: "1.5h", color: "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white" },
        { day: new Date("2025-08-22"), subject: "AP Biology Exam Prep", time: "10:00 AM", duration: "1.5h", color: "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white" },
        { day: new Date("2025-08-23"), subject: "AP Biology Exam Prep", time: "11:00 AM", duration: "2h", color: "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white" },
        { day: new Date("2025-08-24"), subject: "AP Biology Exam Prep", time: "2:00 PM", duration: "2h", color: "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white" },
        { day: new Date("2025-08-25"), subject: "AP Biology Exam Prep", time: "10:00 AM", duration: "2h", color: "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white" },
      ];
      
      // Trigger the calendar animation (each block takes 250ms)
      onStudyPlanGenerated(studyBlocks);
      
      // Progress bar is now updated by the AIStudyFlow component via callback
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-slate-50/80 via-white to-slate-50/80 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col h-full overflow-hidden"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Premium Chat Header */}
      <div className="relative p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Schedule Planner</h3>
        </div>
      </div>

      {/* Premium Chat Messages */}
      <div className="relative h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white shadow-sm'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span>{message.content}</span>
                    <div className="flex gap-0.5 ml-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 bg-slate-900 dark:bg-white rounded-full"
                          animate={{
                            y: [0, -4, 0],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}

        {isSending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Chat Input - Sticky at Bottom */}
      <form onSubmit={handleSubmit} className="relative mt-auto border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
        <div className="p-4 pb-2">
          {!hasClicked ? (
            <div 
              onClick={handleTemplateClick}
              className={`relative w-full p-3 text-foreground dark:text-white min-h-12 flex items-center rounded-[28px] border transition-all ${
                hasDeployed 
                  ? 'cursor-not-allowed opacity-50 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30' 
                  : 'cursor-pointer border-sky-300 dark:border-sky-600 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-900/40 dark:hover:to-blue-900/40 shadow-lg shadow-sky-500/20 animate-pulse'
              }`}
            >
              <span className={`font-medium ${
                hasDeployed 
                  ? 'text-slate-500 dark:text-slate-500' 
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent'
              }`}>
                Help me plan for my upcoming assignments
              </span>
              {!hasDeployed && <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-sky-400/20 to-blue-400/20 blur-md -z-10" />}
            </div>
          ) : (
            <PromptBox 
              name="message" 
              value={inputValue}
              onChange={(e) => setInputValue((e.target as HTMLTextAreaElement).value)}
            />
          )}
        </div>
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            Reset Chat
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Study Tools Section Component with Toggle
export function AITutorPage({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [, setAnimatedBlocks] = useState<Array<{id: number, name: string, time: string, datetime: string, color: string}>>([]);
  const [isFlowGenerating, setIsFlowGenerating] = useState(false);
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [flowResetKey, setFlowResetKey] = useState(0);

  const handleStudyPlanGenerated = (blocks: StudyBlock[]) => {
    if (blocks.length === 0) {
      // Reset calendar
      setStudyBlocks([]);
      setAnimatedBlocks([]);
      return;
    }
    
    setStudyBlocks(blocks);
    setAnimatedBlocks([]); // Clear previous blocks
    
    // Animate blocks being added to calendar sequentially
    blocks.forEach((block, index) => {
      setTimeout(() => {
        const newEvent = {
          id: 1000 + index,
          name: `${block.subject}`,
          time: block.time,
          datetime: `${block.day.toISOString().split('T')[0]}T${block.time.replace(/[^\d:]/g, '')}`,
          color: block.color
        };
        
        setAnimatedBlocks(prev => [...prev, newEvent]);
      }, index * 250); // 250ms delay between each block
    });
  };

  // // Sample calendar events
  // const calendarEvents = [
  //   {
  //     day: new Date("2025-08-11"),
  //     events: [
  //       { 
  //         id: 1, 
  //         name: "Biology Research Paper", 
  //         time: "Due 11:59 PM", 
  //         datetime: "2025-08-11T23:59",
  //         color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white"
  //       },
  //     ],
  //   },
  //   {
  //     day: new Date("2025-08-16"),
  //     events: [
  //       { 
  //         id: 2, 
  //         name: "History Project", 
  //         time: "Due 11:59 PM", 
  //         datetime: "2025-08-16T23:59",
  //         color: "bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white"
  //       },
  //     ],
  //   },
  //   {
  //     day: new Date("2025-08-20"),
  //     events: [
  //       { 
  //         id: 3, 
  //         name: "Calculus Exam", 
  //         time: "10:00 AM", 
  //         datetime: "2025-08-20T10:00",
  //         color: "bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-500 text-white"
  //       },
  //     ],
  //   },
  //   {
  //     day: new Date("2025-08-26"),
  //     events: [
  //       { 
  //         id: 4, 
  //         name: "AP Biology Exam", 
  //         time: "9:00 AM", 
  //         datetime: "2025-08-26T09:00",
  //         color: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white"
  //       },
  //     ],
  //   },
  // ];

  const sections = [
    { id: 'hero', name: 'Overview', icon: Brain },
    { id: 'workload', name: 'Workload Gauge™', icon: Gauge },
    { id: 'calendar', name: 'Smart Calendar™', icon: Calendar },
    { id: 'gpa', name: 'GPA Pathway™', icon: Target },
    { id: 'studyshare', name: 'Study Share™', icon: Share2 },
    { id: 'insights', name: 'Performance Insights™', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF8] via-blue-50/30 to-[#FFFDF8] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Navigation Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo />

            {/* Back to Home Button */}
            <motion.button
              onClick={onNavigateHome}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Side Navigation */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    // Don't control scroll - let user scroll freely
                    // document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  whileHover={{ scale: 1.1, x: 5 }}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {section.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <motion.section
            id="hero"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('hero')}
            className="mb-32 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 mb-8"
            >
              <Brain className="w-5 h-5 text-sky-600" />
              <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">AI-Powered Learning</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 bg-clip-text text-transparent">
                AI Tutor
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your personal academic assistant — plan smarter, study faster, and reach your goals.
            </p>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The AI Tutor integrates intelligent scheduling, workload analysis, and adaptive study creation 
              to help you excel in every subject. From automatic flashcard generation to GPA tracking, 
              we've built the ultimate academic companion.
            </p>

            {/* Floating Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              {['Smart Scheduling', 'Adaptive Learning', 'GPA Tracking', 'Study Collaboration'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Workload Gauge Section */}
          <motion.section
            id="workload"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('workload')}
            className="mb-32"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                    <Gauge className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Workload Gauge™
                  </h2>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Never feel overwhelmed again. Our AI analyzes all your assignments, tests, and grades 
                  to show exactly where your workload and point concentration are highest across every class.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Real-time workload analysis', icon: Activity },
                    { label: 'Point concentration heatmaps', icon: BarChart3 },
                    { label: 'Class-by-class breakdowns', icon: BookOpen },
                    { label: 'Stress level indicators', icon: Gauge },
                  ].map((item, i) => {
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Academic Load Analysis</h3>
                  
                  {[
                    { subject: 'Biology', load: 85, color: 'from-red-500 to-orange-500' },
                    { subject: 'Mathematics', load: 70, color: 'from-yellow-500 to-amber-500' },
                    { subject: 'History', load: 55, color: 'from-green-500 to-emerald-500' },
                    { subject: 'English', load: 40, color: 'from-blue-500 to-sky-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.subject}</span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.load}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.load}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Smart Calendar Sync Section */}
          <motion.section
            id="calendar"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('calendar')}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Smart Calendar Sync™
                </h2>
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Watch as our AI analyzes your schedule and intelligently places study blocks around your 
                classes, practices, and daily commitments. Seamlessly syncs with Google Calendar for automatic scheduling.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { 
                    title: 'Auto-sync with Google Calendar', 
                    description: 'Seamlessly connects with your Google Calendar for automatic two-way synchronization of all events and study sessions.',
                    icon: Calendar,
                  },
                  { 
                    title: 'Intelligent conflict resolution', 
                    description: 'Automatically detects scheduling conflicts and suggests optimal alternatives to keep your calendar organized.',
                    icon: Zap,
                  },
                  { 
                    title: 'Adaptive rescheduling', 
                    description: 'Dynamically adjusts your study plan when unexpected events arise, ensuring you stay on track with minimal disruption.',
                    icon: Clock,
                  },
                  { 
                    title: 'Priority-based time blocking', 
                    description: 'Intelligently schedules study sessions based on assignment deadlines, exam dates, and your academic priorities.',
                    icon: Target,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                    >
                      {/* Icon with neutral background */}
                      <div className="relative w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4 shadow-sm">
                        <Icon className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="relative">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AI Study Flow Visualization and Condensed AI Chat Side by Side */}
            <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
              {/* AI Study Flow - Takes Majority of Space */}
              <div className="h-[600px]">
                <AIStudyFlow 
                  isGenerating={isFlowGenerating} 
                  onComplete={() => {
                    setIsFlowGenerating(false);
                    setIsFlowComplete(true);
                  }}
                  resetKey={flowResetKey}
                />
              </div>

              {/* Condensed AI Chat */}
              <AIChatInterface 
                onStudyPlanGenerated={handleStudyPlanGenerated}
                onFlowStart={() => {
                  setIsFlowGenerating(true);
                  setIsFlowComplete(false);
                }}
                onFlowComplete={() => {
                  setIsFlowGenerating(false);
                  setIsFlowComplete(false);
                }}
                onResetFlow={() => setFlowResetKey(prev => prev + 1)}
                isFlowComplete={isFlowComplete}
              />
            </div>
          </motion.section>

          {/* GPA Pathway Planner Section */}
          <motion.section
            id="gpa"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('gpa')}
            className="mb-32"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    GPA Pathway Planner™
                  </h2>
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Set your target GPA and let our AI project your performance trajectory. Get real-time 
                  feedback, personalized recommendations, and strategic insights to reach your academic goals.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Set target GPA goals', icon: Target },
                    { label: 'Real-time performance projections', icon: TrendingUp },
                    { label: 'Strategic grade recommendations', icon: Brain },
                    { label: 'Progress tracking & alerts', icon: BarChart3 },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current GPA</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">3.45</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Target GPA</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">3.75</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Progress to Goal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">67%</span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '67%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-300 font-semibold mb-2">AI Recommendation</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Focus on Biology and Math for the next two weeks. Achieving 85%+ on upcoming exams will put you on track to reach your 3.75 GPA goal by semester end.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Study Share Section */}
          <motion.section
            id="studyshare"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('studyshare')}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Study Share™
                </h2>
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Learning is better together. Securely share flashcards, quizzes, and study materials with classmates. 
                Create study groups, track collective progress, and collaborate in real-time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Share2,
                  title: 'Share Materials',
                  description: 'Securely share flashcards and quizzes with classmates'
                },
                {
                  icon: Users,
                  title: 'Study Groups',
                  description: 'Create and manage collaborative learning spaces'
                },
                {
                  icon: TrendingUp,
                  title: 'Track Progress',
                  description: 'Monitor group performance and engagement levels'
                },
                {
                  icon: Lock,
                  title: 'Secure Sharing',
                  description: 'End-to-end encryption for all shared materials'
                }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl w-fit mb-4">
                      <Icon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Performance Insights Dashboard Section */}
          <motion.section
            id="insights"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            onViewportEnter={() => setActiveSection('insights')}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Performance Insights Dashboard™
                </h2>
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Visual progress tracking that shows your quiz performance, GPA trajectory, and study efficiency. 
                Know exactly where you stand and where you're headed.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
            >
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {[
                  { label: 'Avg Quiz Score', value: '87%', icon: Target, color: 'text-green-600 dark:text-green-400' },
                  { label: 'Study Streak', value: '12 days', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
                  { label: 'Total Study Time', value: '24.5 hrs', icon: Clock, color: 'text-blue-600 dark:text-blue-400' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                      </div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
