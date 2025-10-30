import { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { getUnifiedCalendarService } from '../../lib/calendar/unifiedCalendar';
import { getStudyTemplateManager, type StudyTemplate } from '../../lib/calendar/studyTemplates';

interface StudySessionEditorProps {
  userId: string;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
  sessionId?: string;
  courses?: Array<{ id: string; name: string }>;
  assignments?: Array<{ id: string; name: string; courseId: string }>;
}

export function StudySessionEditor({
  userId,
  onClose,
  onSave,
  initialDate,
  courses = [],
  assignments = [],
}: StudySessionEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(initialDate || new Date());
  const [startTime, setStartTime] = useState('14:00');
  const [duration, setDuration] = useState(60);
  const [courseId, setCourseId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [sessionType, setSessionType] = useState<string>('study');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<StudyTemplate | null>(null);

  const templateManager = getStudyTemplateManager();
  const templates = templateManager.getAllTemplates();

  // Update duration when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.name);
      setDescription(selectedTemplate.description);
      setDuration(selectedTemplate.duration);
    }
  }, [selectedTemplate]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const calendar = getUnifiedCalendarService(userId);

      // Parse start time
      const [hours, minutes] = startTime.split(':').map(Number);
      const start = new Date(startDate);
      start.setHours(hours, minutes, 0, 0);

      // Calculate end time
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      await calendar.createStudySession(title, start, end, {
        description,
        courseId: courseId || undefined,
        assignmentId: assignmentId || undefined,
        sessionType,
        aiGenerated: false,
      });

      onSave();
      onClose();
    } catch (err) {
      setError('Failed to create study session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignmentId
    ? assignments
    : courseId
    ? assignments.filter((a) => a.courseId === courseId)
    : assignments;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-bold text-foreground">Create Study Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Templates Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Use a Template (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 border-2 rounded-lg hover:bg-muted transition-colors text-left ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium text-sm text-foreground">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{template.duration} min</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Study for Biology Exam"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about what you'll cover..."
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={150}>2.5 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="study">Study</option>
              <option value="review">Review</option>
              <option value="assignment">Assignment Work</option>
              <option value="exam_prep">Exam Preparation</option>
              <option value="reading">Reading</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* Course Selection */}
          {courses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course (Optional)
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No course selected</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Assignment Selection */}
          {filteredAssignments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Related Assignment (Optional)
              </label>
              <select
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No assignment selected</option>
                {filteredAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
