import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, Clock, BookOpen, Target, AlertCircle, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  title: string;
  type: 'assignment' | 'study' | 'break' | 'general';
  date: string;
  time: string;
  description?: string;
  classId?: string;
  className?: string;
  createdAt: string;
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    type?: 'assignment' | 'study' | 'break' | 'general';
    title?: string;
    classId?: string;
    className?: string;
  };
}

const reminderTypes = [
  { value: 'assignment', label: 'Assignment Due', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
  { value: 'study', label: 'Study Session', icon: Target, color: 'from-purple-500 to-pink-500' },
  { value: 'break', label: 'Take a Break', icon: Coffee, color: 'from-green-500 to-emerald-500' },
  { value: 'general', label: 'General Reminder', icon: Bell, color: 'from-amber-500 to-orange-500' },
];

export function ReminderModal({ isOpen, onClose, initialContext }: ReminderModalProps) {
  const [type, setType] = useState<string>(initialContext?.type || 'general');
  const [title, setTitle] = useState(initialContext?.title || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [className, setClassName] = useState(initialContext?.className || '');

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a reminder title');
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: title.trim(),
      type: type as any,
      date,
      time,
      description: description.trim(),
      className: className.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('reminders') || '[]');
    existing.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(existing));

    // Show success message
    alert(`✓ Reminder set for ${new Date(date).toLocaleDateString()} at ${time}`);

    // Close modal
    onClose();
  };

  const selectedType = reminderTypes.find(t => t.value === type);
  const Icon = selectedType?.icon || Bell;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className={cn('bg-gradient-to-r p-6 text-white', selectedType?.color)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Set Reminder</h2>
                  <p className="text-sm opacity-90">Never miss an important task</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reminder Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {reminderTypes.map((reminderType) => {
                  const TypeIcon = reminderType.icon;
                  return (
                    <button
                      key={reminderType.value}
                      onClick={() => setType(reminderType.value)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                        type === reminderType.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <TypeIcon className={cn(
                        'w-5 h-5',
                        type === reminderType.value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'text-sm font-medium',
                        type === reminderType.value ? 'text-primary' : 'text-foreground'
                      )}>
                        {reminderType.label}
                      </span>
                    </button>
                  );
                })}
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
                placeholder="e.g., Study for Math Quiz"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Class (optional) */}
            {(type === 'assignment' || type === 'study') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class (Optional)
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Calculus II"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Info Banner */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Reminders will appear in your notifications at the scheduled time. You can view all your reminders in the notifications panel.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'px-6 py-2 bg-gradient-to-r text-white rounded-lg hover:shadow-lg transition-all font-medium',
                selectedType?.color
              )}
            >
              Set Reminder
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

