import { useState, useEffect } from 'react';
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
  Sparkles,
  MessageSquare,
  Play,
  Download,
} from 'lucide-react';
import {
  canvasApi,
  type CanvasCourse,
  type CanvasModule,
  type CanvasModuleItem,
} from '../../lib/canvasApiMock';

type CourseContent = {
  course: CanvasCourse;
  modules: CanvasModule[];
  currentModule: CanvasModule | null;
  moduleItems: CanvasModuleItem[];
};

export function CourseTutorMode() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [selectedItem, setSelectedItem] = useState<CanvasModuleItem | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseContent(selectedCourse);
    }
  }, [selectedCourse]);

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

  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;

    // Simulate AI response
    alert(`AI Tutor: Let me help you understand "${aiQuestion}". This feature uses AI to provide personalized explanations based on your course content and learning style.`);
    setAiQuestion('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
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
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Ask AI Tutor Anything</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="e.g., Can you explain cellular respiration in simple terms?"
              className="flex-1 px-4 py-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAskAI}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              Ask
            </button>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Ask questions about course content, request explanations, get study tips, or practice problems!
            </p>
          </div>
        </div>
      )}

      {/* Course Content */}
      {courseContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Modules</h3>
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
                          ? 'bg-blue-50 border-blue-300'
                          : isLocked
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : module.state === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="font-semibold text-sm text-gray-900">{module.name}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{module.items_count} items</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {courseContent.currentModule ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{courseContent.currentModule.name}</h3>
                    <p className="text-gray-600">
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
                              ? 'bg-blue-50 border-blue-300'
                              : isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-400">
                                {index + 1}
                              </span>
                              <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                                {getItemIcon(item.type)}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="capitalize">{item.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {item.completion_requirement && (
                                      <span className="flex items-center gap-1">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-400" />
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
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
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
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="prose prose-sm max-w-none">
                                <h5 className="font-semibold text-gray-900 mb-2">Content Preview</h5>
                                <p className="text-gray-600">
                                  This section covers the fundamentals of {item.title.toLowerCase()}.
                                  The content includes detailed explanations, diagrams, and interactive examples
                                  to help you understand the key concepts.
                                </p>
                                <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
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
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a module to view its content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
