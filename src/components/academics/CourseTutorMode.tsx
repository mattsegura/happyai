import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  CheckCircle,
  Circle,
  Lock,
  ChevronRight,
  Brain,
  MessageSquare,
  Play,
  Download,
  GraduationCap,
  Zap,
} from 'lucide-react';
import {
  canvasApi,
  type CanvasCourse,
  type CanvasModule,
  type CanvasModuleItem,
} from '../../lib/canvasApiMock';
import { AICourseTutor, type TutorContext, type TutorResponse } from '../../lib/ai/features/courseTutor';
import { useAuth } from '../../contexts/AuthContext';
import { PracticeQuizModal } from './PracticeQuizModal';
import { QuickReviewModal } from './QuickReviewModal';

type CourseContent = {
  course: CanvasCourse;
  modules: CanvasModule[];
  currentModule: CanvasModule | null;
  moduleItems: CanvasModuleItem[];
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedTopics?: string[];
  resources?: Array<{ title: string; url: string }>;
};

export function CourseTutorMode() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [selectedItem, setSelectedItem] = useState<CanvasModuleItem | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [generatedReview, setGeneratedReview] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const courseTutor = useRef<AICourseTutor | null>(null);

  useEffect(() => {
    loadCourses();
    // Initialize AI tutor
    if (user?.id) {
      courseTutor.current = new AICourseTutor(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseContent(selectedCourse);
      // Reset chat when course changes
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI tutor for ${courses.find(c => c.id === selectedCourse)?.name}. I can help you understand course materials, generate practice quizzes, summarize assignments, and create study materials. What would you like to work on today?`,
        timestamp: new Date(),
      }]);
    }
  }, [selectedCourse, courses]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAIThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await canvasApi.getCourses();
      setCourses(coursesData);
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async (courseId: string) => {
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      const modules = await canvasApi.getModules(courseId);
      const currentModule = modules.find((m) => m.state === 'started') || modules[0];

      let moduleItems: CanvasModuleItem[] = [];
      if (currentModule) {
        moduleItems = await canvasApi.getModuleItems(currentModule.id);
      }

      setCourseContent({
        course,
        modules,
        currentModule,
        moduleItems,
      });
    } catch (error) {
      console.error('Failed to load course content:', error);
    }
  };

  const handleModuleSelect = async (module: CanvasModule) => {
    if (module.state === 'locked') return;

    try {
      const items = await canvasApi.getModuleItems(module.id);
      setCourseContent((prev) =>
        prev
          ? {
              ...prev,
              currentModule: module,
              moduleItems: items,
            }
          : null
      );
    } catch (error) {
      console.error('Failed to load module items:', error);
    }
  };

  const getModuleProgress = (module: CanvasModule): number => {
    if (module.state === 'completed') return 100;
    if (module.state === 'started') return 50;
    if (module.state === 'locked') return 0;
    return 0;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'File':
        return <FileText className="w-5 h-5" />;
      case 'Page':
        return <BookOpen className="w-5 h-5" />;
      case 'ExternalUrl':
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Quiz':
      case 'Assignment':
        return <FileText className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !courseTutor.current || !selectedCourse) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: aiQuestion.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setAiQuestion('');
    setIsAIThinking(true);

    try {
      // Build tutor context
      const course = courses.find((c) => c.id === selectedCourse);
      const context: TutorContext = {
        courseId: selectedCourse,
        courseName: course?.name || '',
        courseCode: course?.course_code || '',
        moduleId: courseContent?.currentModule?.id,
        moduleName: courseContent?.currentModule?.name,
        assignmentId: selectedItem?.type === 'Assignment' ? selectedItem.content_id : undefined,
        assignmentName: selectedItem?.type === 'Assignment' ? selectedItem.title : undefined,
        additionalContext: selectedItem ? `Current content: ${selectedItem.title}` : undefined,
      };

      // Get AI response
      const response: TutorResponse = await courseTutor.current.answerQuestion(
        userMessage.content,
        context
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        relatedTopics: response.relatedTopics,
        resources: response.additionalResources.map((r) => ({ title: r, url: '#' })),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please make sure Chatbase is configured in your environment variables and try again.',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!courseTutor.current || !selectedCourse || !courseContent?.currentModule) {
      alert('Please select a module first');
      return;
    }

    setIsAIThinking(true);
    try {
      const quiz = await courseTutor.current.generatePracticeQuiz(
        selectedCourse,
        courseContent.currentModule.id,
        { difficulty: 'medium', questionCount: 5 }
      );

      // Save quiz and show modal
      setGeneratedQuiz(quiz);
      setShowQuizModal(true);

      // Also add message to chat
      const quizMessage: ChatMessage = {
        id: `quiz-${Date.now()}`,
        role: 'assistant',
        content: `✅ I've generated a practice quiz titled "${quiz.quizTitle}" with ${quiz.questions.length} questions. The quiz has opened in a new window. Good luck!`,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, quizMessage]);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please make sure AI is configured properly.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleGenerateReview = async () => {
    if (!courseTutor.current || !selectedCourse) {
      alert('Please select a course first');
      return;
    }

    setIsAIThinking(true);
    try {
      const moduleIds = courseContent?.modules.map((m) => m.id) || [];
      const review = await courseTutor.current.generateQuickReview(selectedCourse, moduleIds);

      // Save review and show modal
      setGeneratedReview(review);
      setShowReviewModal(true);

      // Also add message to chat
      const reviewMessage: ChatMessage = {
        id: `review-${Date.now()}`,
        role: 'assistant',
        content: `✅ I've generated comprehensive review materials!\n\n**Includes:**\n• Key concepts summary\n• ${review.flashcards.length} flashcards for active recall\n• ${review.practiceProblems.length} practice problems with solutions\n\nThe review materials have opened in a new window. Happy studying!`,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, reviewMessage]);
    } catch (error) {
      console.error('Failed to generate review:', error);
      alert('Failed to generate review materials. Please make sure AI is configured properly.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">AI Course Tutor</h2>
            <p className="text-sm opacity-90">Interactive learning with AI-powered assistance</p>
          </div>
          <button
            onClick={() => setShowAITutor(!showAITutor)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            {showAITutor ? 'Hide' : 'Show'} AI Tutor
          </button>
        </div>

        {/* Course Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <label className="text-sm font-medium mb-2 block">Select Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id} className="text-gray-900">
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Tutor Chat */}
      {showAITutor && (
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Course Tutor</h3>
                <p className="text-sm opacity-90">Powered by AI - Ask me anything!</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-b border-border p-4 bg-muted/30">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleGenerateQuiz}
                disabled={!courseContent?.currentModule || isAIThinking}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Generate Practice Quiz
              </button>
              <button
                onClick={handleGenerateReview}
                disabled={!selectedCourse || isAIThinking}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate Quick Review
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-card text-foreground border border-border'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                          <Brain className="h-3.5 w-3.5" />
                        </div>
                        AI Tutor
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

                    {/* Related Topics */}
                    {message.relatedTopics && message.relatedTopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2 opacity-75">Related topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedTopics.map((topic, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-primary/10 rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2 opacity-75">Helpful resources:</p>
                        <ul className="text-xs space-y-1">
                          {message.resources.map((resource, i) => (
                            <li key={i}>
                              <a href={resource.url} className="underline hover:no-underline opacity-90">
                                {resource.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span
                    className={`mt-1 block text-xs text-muted-foreground ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isAIThinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                      AI Tutor is thinking...
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

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-card">
            <div className="flex gap-3">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this course..."
                disabled={!selectedCourse || isAIThinking}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleAskAI}
                disabled={!aiQuestion.trim() || !selectedCourse || isAIThinking}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
            {!selectedCourse && (
              <p className="text-xs text-muted-foreground mt-2">
                Select a course to start chatting with the AI tutor
              </p>
            )}
          </div>
        </div>
      )}

      {/* Course Content */}
      {courseContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Course Modules</h3>
              <div className="space-y-2">
                {courseContent.modules.map((module) => {
                  const progress = getModuleProgress(module);
                  const isLocked = module.state === 'locked';
                  const isActive = courseContent.currentModule?.id === module.id;

                  return (
                    <button
                      key={module.id}
                      onClick={() => !isLocked && handleModuleSelect(module)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                          : isLocked
                          ? 'bg-muted/30 border-border opacity-50 cursor-not-allowed'
                          : 'bg-card border-border hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : module.state === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            )}
                            <span className="font-semibold text-sm text-foreground">{module.name}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                progress === 100 ? 'bg-green-500 dark:bg-green-600' : 'bg-blue-500 dark:bg-blue-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>{module.items_count} items</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              {courseContent.currentModule ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{courseContent.currentModule.name}</h3>
                    <p className="text-muted-foreground">
                      {courseContent.moduleItems.length} learning materials
                    </p>
                  </div>

                  <div className="space-y-3">
                    {courseContent.moduleItems.map((item, index) => {
                      const isCompleted = item.completion_requirement?.completed || false;
                      const isSelected = selectedItem?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                              : isCompleted
                              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                              : 'bg-card border-border hover:border-blue-200 dark:hover:border-blue-800'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-muted-foreground">
                                {index + 1}
                              </span>
                              <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-950/50' : 'bg-blue-100 dark:bg-blue-950/50'}`}>
                                {getItemIcon(item.type)}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="capitalize">{item.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {item.completion_requirement && (
                                      <span className="flex items-center gap-1">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        {item.completion_requirement.type.replace(/_/g, ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {item.type !== 'Page' && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {item.type === 'File' ? (
                                      <>
                                        <Download className="w-4 h-4" />
                                        Download
                                      </>
                                    ) : item.type.includes('Video') || item.type === 'ExternalUrl' ? (
                                      <>
                                        <Play className="w-4 h-4" />
                                        Watch
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="w-4 h-4" />
                                        Open
                                      </>
                                    )}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {isSelected && item.type === 'Page' && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="prose prose-sm max-w-none">
                                <h5 className="font-semibold text-foreground mb-2">Content Preview</h5>
                                <p className="text-muted-foreground">
                                  This section covers the fundamentals of {item.title.toLowerCase()}.
                                  The content includes detailed explanations, diagrams, and interactive examples
                                  to help you understand the key concepts.
                                </p>
                                <button className="mt-3 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Complete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a module to view its content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showQuizModal && generatedQuiz && (
        <PracticeQuizModal
          quiz={generatedQuiz}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {showReviewModal && generatedReview && (
        <QuickReviewModal
          reviewMaterials={generatedReview}
          courseName={courses.find((c) => c.id === selectedCourse)?.name}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
