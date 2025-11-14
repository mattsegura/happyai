/**
 * Reports Hub Component - Chat-Centric AI Assistant
 *
 * Redesigned interface with AI chat as primary interaction:
 * - AI chat assistant (right panel, ~40%)
 * - Report display (left panel, ~60%)
 * - Chat-driven report generation
 * - Quick action buttons
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, User, Calendar, Download, RefreshCw, Sparkles, Clock, AlertCircle, Send, MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateWeeklySummary, formatWeekRange, getWeekRange, type WeeklySummary } from '../../lib/ai/weeklyEchoGenerator';
import { generateStudentBrief, type StudentBrief } from '../../lib/ai/studentBriefGenerator';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reportType?: 'weekly' | 'student' | 'custom';
}

function ReportsHub() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Reports Assistant. I can help you generate weekly summaries, student briefs, and custom reports. What would you like to know about your classes today?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Report state
  const [currentReport, setCurrentReport] = useState<any | null>(null);
  const [reportType, setReportType] = useState<'weekly' | 'student' | 'custom' | null>(null);

  // Weekly Summary state
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  // Student Brief state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [focusArea, setFocusArea] = useState<'academic' | 'emotional' | 'balanced'>('balanced');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const query = chatInput.toLowerCase();
    setChatInput('');
    setLoading(true);

    // Simulate processing time
    setTimeout(async () => {
      try {
        let responseContent = '';
        let newReport = null;
        let newReportType = null;

        if (query.includes('weekly') || query.includes('summary') || query.includes('week')) {
          // Generate weekly summary
          const { weekStartDate, weekEndDate } = getWeekRange(selectedWeek);
          newReport = await generateWeeklySummary({
            teacherId: user.id,
            weekStartDate,
            weekEndDate,
          });
          newReportType = 'weekly';
          responseContent = `I've generated your weekly summary for ${formatWeekRange(weekStartDate, weekEndDate)}. The report shows key insights from your classes including sentiment trends, at-risk students, and highlights.`;
        } else if (query.includes('student') || query.includes('brief')) {
          // Generate student brief
          if (selectedStudent) {
            newReport = await generateStudentBrief({
              studentId: selectedStudent,
              teacherId: user.id,
              focusArea,
            });
            newReportType = 'student';
            responseContent = `I've created a ${focusArea} brief for the selected student. The report includes academic performance, emotional wellbeing indicators, and personalized recommendations.`;
          } else {
            responseContent = "I'd be happy to generate a student brief! Please select a student first using the student selector above, then ask me again.";
          }
        } else if (query.includes('custom') || query.includes('report')) {
          responseContent = "Custom reports allow you to analyze specific metrics across your classes. What would you like to focus on? Options include: grade trends, participation patterns, mood analytics, or workload balance.";
        } else {
          // General help
          responseContent = `I can help you with:
          
📊 **Weekly Summaries** - Overall class insights and trends
👤 **Student Briefs** - Individual student reports with recommendations
📈 **Custom Reports** - Specific analytics based on your needs

Just ask me to generate any of these, or ask questions about your classes!`;
        }

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          reportType: newReportType || undefined
        };

        setChatMessages(prev => [...prev, aiResponse]);
        
        if (newReport) {
          setCurrentReport(newReport);
          setReportType(newReportType);
        }
      } catch (err: any) {
        console.error('[ReportsHub] Failed to process request:', err);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an error processing your request. Please try again or try a different query.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleQuickAction = (action: 'weekly' | 'student' | 'custom') => {
    const actionMessages = {
      weekly: "Generate my weekly summary",
      student: "Create a student brief",
      custom: "Show me custom report options"
    };
    setChatInput(actionMessages[action]);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Report Display Panel (Left) */}
      <div className="flex-1 flex flex-col min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            AI Reports Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights and personalized reports for your classes
          </p>
        </motion.div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border-2 border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-6">
          <AnimatePresence mode="wait">
            {currentReport && reportType === 'weekly' ? (
              <motion.div
                key="weekly-report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Weekly Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatWeekRange(currentReport.week_start, currentReport.week_end)}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Classes</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentReport.overview.total_classes}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Students</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{currentReport.overview.total_students}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Avg Sentiment</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentReport.overview.average_sentiment.toFixed(1)}</p>
                  </div>
                </div>

                {/* Sentiment Trends */}
                {currentReport.sentiment_trends && currentReport.sentiment_trends.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-3">Sentiment Trends</h4>
                    <div className="space-y-2">
                      {currentReport.sentiment_trends.map((trend: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border/60">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-foreground">{trend.class_name}</p>
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-bold',
                              trend.trend === 'improving' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              trend.trend === 'declining' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            )}>
                              {trend.trend}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{trend.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* At-Risk Students */}
                {currentReport.at_risk_students && currentReport.at_risk_students.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Students Needing Attention ({currentReport.at_risk_students.length})
                    </h4>
                    <div className="space-y-2">
                      {currentReport.at_risk_students.map((student: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800">
                          <p className="font-bold text-foreground">{student.student_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{student.class_name}</p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-2">{student.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : currentReport && reportType === 'student' ? (
              <motion.div
                key="student-report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Student Brief</h3>
                    <p className="text-sm text-muted-foreground">{currentReport.student_name}</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                {/* Student Brief Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{currentReport.summary}</p>
                </div>

                {currentReport.recommendations && (
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {currentReport.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <FileText className="h-24 w-24 text-muted-foreground/40 mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-2">No Report Generated Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Use the AI assistant on the right to generate weekly summaries, student briefs, or custom reports.
                  Just describe what you'd like to see!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => handleQuickAction('weekly')}
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Generate Weekly Summary
                  </button>
                  <button
                    onClick={() => handleQuickAction('student')}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors font-semibold"
                  >
                    Create Student Brief
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Chat Assistant Panel (Right) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[500px] flex flex-col rounded-2xl border-2 border-border/60 bg-card/90 backdrop-blur-sm shadow-xl overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Reports Assistant</h3>
              <p className="text-xs text-emerald-100">Ask me anything about your classes</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('weekly')}
              className="px-3 py-2 rounded-lg bg-card text-foreground text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors border border-border"
            >
              📊 Weekly Summary
            </button>
            <button
              onClick={() => handleQuickAction('student')}
              className="px-3 py-2 rounded-lg bg-card text-foreground text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors border border-border"
            >
              👤 Student Brief
            </button>
            <button
              onClick={() => handleQuickAction('custom')}
              className="px-3 py-2 rounded-lg bg-card text-foreground text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors border border-border"
            >
              📈 Custom Report
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-background/50 to-muted/30">
          {chatMessages.map((message) => (
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl p-4 shadow-md',
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-background border border-border/60'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={cn(
                  'text-xs mt-2',
                  message.role === 'user' ? 'text-emerald-100' : 'text-muted-foreground'
                )}>
                  {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-background border border-border/60 rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about reports, students, or trends..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none text-sm disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ReportsHub;
