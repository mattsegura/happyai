import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader, CheckCircle, XCircle } from 'lucide-react';
import { getAIService } from '../../lib/ai/aiService';
import { fillTemplate, SCHEDULING_REQUEST_PROMPT } from '../../lib/ai/promptTemplates';
import { getUnifiedCalendarService, type UnifiedEvent } from '../../lib/calendar/unifiedCalendar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: SchedulingAction;
  timestamp: Date;
}

interface SchedulingAction {
  action: 'move_study_session' | 'create_study_session' | 'delete_study_session' | 'clarify';
  confidence: number;
  parameters: Record<string, any>;
  explanation: string;
  needsConfirmation: boolean;
  confirmationMessage?: string;
}

interface SchedulingAssistantProps {
  userId: string;
  onClose: () => void;
  onEventsUpdated: () => void;
  currentEvents?: UnifiedEvent[];
  upcomingAssignments?: any[];
}

export function SchedulingAssistant({
  userId,
  onClose,
  onEventsUpdated,
  currentEvents = [],
  upcomingAssignments = [],
}: SchedulingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Scheduling Assistant. I can help you schedule, move, or delete study sessions. Just tell me what you'd like to do!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<SchedulingAction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = getAIService();
  const calendarService = getUnifiedCalendarService(userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    "Add 2-hour study block tomorrow afternoon",
    "Move Friday's Biology review to Thursday",
    "Clear all sessions next Monday",
    "Show my schedule for this week",
  ];

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      aiService.setUserId(userId);

      // Prepare context for AI
      const currentDateTime = new Date().toISOString();
      const calendar = currentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.startTime.toISOString(),
        end: e.endTime.toISOString(),
        course: e.courseName,
        source: e.source,
        isEditable: e.isEditable,
      }));

      const studySessions = currentEvents
        .filter((e) => e.type === 'study_session')
        .map((e) => ({
          id: e.id,
          title: e.title,
          start: e.startTime.toISOString(),
          end: e.endTime.toISOString(),
        }));

      const assignments = upcomingAssignments.map((a) => ({
        id: a.id,
        name: a.name,
        dueDate: a.due_at,
        course: a.course?.name,
      }));

      // Fill prompt template
      const prompt = fillTemplate(SCHEDULING_REQUEST_PROMPT.template, {
        userMessage,
        currentDateTime,
        calendar: JSON.stringify(calendar, null, 2),
        studySessions: JSON.stringify(studySessions, null, 2),
        assignments: JSON.stringify(assignments, null, 2),
      });

      // Call AI service
      const response = await aiService.complete({
        prompt,
        featureType: 'scheduling_assistant',
        options: {
          responseFormat: 'json',
          temperature: 0.7,
        },
        promptVersion: SCHEDULING_REQUEST_PROMPT.version,
      });

      // Parse AI response
      const action = JSON.parse(response.content) as SchedulingAction;

      // Add assistant message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: action.explanation,
        action: action.needsConfirmation ? action : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If action needs confirmation, set it as pending
      if (action.needsConfirmation) {
        setPendingAction(action);
      } else {
        // Execute action immediately
        await executeAction(action);
      }
    } catch (err) {
      console.error('Scheduling assistant error:', err);

      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that request. Could you try rephrasing it?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: SchedulingAction) => {
    try {
      let success = false;
      let resultMessage = '';

      switch (action.action) {
        case 'create_study_session': {
          const { title, startTime, endTime, courseId, assignmentId, description } = action.parameters;
          const start = new Date(startTime);
          const end = new Date(endTime);

          await calendarService.createStudySession(title, start, end, {
            description,
            courseId,
            assignmentId,
          });

          success = true;
          resultMessage = `✅ Created study session: "${title}"`;
          break;
        }

        case 'move_study_session': {
          const { sessionId, newDate, newStartTime } = action.parameters;

          // Parse new date and time
          const [hours, minutes] = newStartTime.split(':').map(Number);
          const startDate = new Date(newDate);
          startDate.setHours(hours, minutes, 0, 0);

          // Find original session to get duration
          const originalSession = currentEvents.find((e) => e.id === `hapi-${sessionId}`);
          if (!originalSession) {
            throw new Error('Session not found');
          }

          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + originalSession.duration);

          await calendarService.updateStudySession(sessionId, {
            startTime: startDate,
            endTime: endDate,
          });

          success = true;
          resultMessage = `✅ Moved session to ${startDate.toLocaleDateString()} at ${newStartTime}`;
          break;
        }

        case 'delete_study_session': {
          const { sessionId } = action.parameters;
          await calendarService.deleteStudySession(sessionId);
          success = true;
          resultMessage = '✅ Deleted study session';
          break;
        }

        case 'clarify': {
          resultMessage = action.explanation;
          success = true;
          break;
        }

        default:
          resultMessage = 'Action not supported yet';
      }

      // Add result message
      const resultMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: resultMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, resultMsg]);

      if (success && action.action !== 'clarify') {
        onEventsUpdated();
      }
    } catch (err) {
      console.error('Failed to execute action:', err);

      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to execute action. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setPendingAction(null);
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancel = () => {
    setPendingAction(null);

    const cancelMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Action cancelled. What else would you like to do?',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, cancelMsg]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-xl max-w-2xl w-full h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Scheduling Assistant</h2>
              <p className="text-xs text-muted-foreground">Natural language scheduling</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                }`}
              >
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'flex flex-col items-end' : ''
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Action Confirmation */}
                {message.action && pendingAction && (
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium mb-2">{message.action.confirmationMessage}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <span className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(action)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || !!pendingAction}
              placeholder="Type your scheduling request..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !!pendingAction}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
