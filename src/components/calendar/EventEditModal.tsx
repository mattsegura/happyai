import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, BookOpen, AlertCircle, Save, Copy, Trash2 } from 'lucide-react';
import { CalendarEvent, StudyTask } from '@/lib/canvas/enhancedPlanGenerator';
import { cn } from '@/lib/utils';

interface EventEditModalProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (event: CalendarEvent) => void;
}

export function EventEditModal({
  isOpen,
  event,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: EventEditModalProps) {
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
    }
  }, [event]);

  if (!isOpen || !event || !editedEvent) return null;

  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    onDuplicate(editedEvent);
    onClose();
  };

  const updateField = <K extends keyof CalendarEvent>(field: K, value: CalendarEvent[K]) => {
    setEditedEvent(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateTask = (taskId: string, field: keyof StudyTask, value: any) => {
    setEditedEvent(prev => {
      if (!prev || !prev.tasks) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, [field]: value } : task
        ),
      };
    });
  };

  const addTask = () => {
    setEditedEvent(prev => {
      if (!prev) return prev;
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        title: 'New task',
        completed: false,
        estimatedMinutes: 30,
      };
      return {
        ...prev,
        tasks: [...(prev.tasks || []), newTask],
      };
    });
  };

  const removeTask = (taskId: string) => {
    setEditedEvent(prev => {
      if (!prev || !prev.tasks) return prev;
      return {
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId),
      };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl mx-4"
          >
            {/* Header */}
            <div
              className="p-6 text-white relative"
              style={{ backgroundColor: editedEvent.courseColor }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-2">Edit Study Session</h2>
              <p className="text-white/80 text-sm">{editedEvent.courseName}</p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editedEvent.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={editedEvent.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editedEvent.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={editedEvent.duration}
                  onChange={(e) => updateField('duration', parseInt(e.target.value))}
                  min="15"
                  step="15"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => updateField('priority', priority)}
                      className={cn(
                        'flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium',
                        editedEvent.priority === priority
                          ? priority === 'high' ? 'bg-red-500/10 border-red-500 text-red-600' :
                            priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600' :
                            'bg-green-500/10 border-green-500 text-green-600'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Tasks
                  </label>
                  <button
                    onClick={addTask}
                    className="text-sm text-primary hover:underline"
                  >
                    + Add Task
                  </button>
                </div>
                <div className="space-y-2">
                  {editedEvent.tasks?.map(task => (
                    <div key={task.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => updateTask(task.id, 'completed', e.target.checked)}
                        className="mt-1"
                      />
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none"
                      />
                      <input
                        type="number"
                        value={task.estimatedMinutes}
                        onChange={(e) => updateTask(task.id, 'estimatedMinutes', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-border rounded text-sm"
                        min="5"
                        step="5"
                      />
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

