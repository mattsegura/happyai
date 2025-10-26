import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { logAdminAction } from '../../lib/auditLog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2, Shield } from 'lucide-react';

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
}

interface Teacher {
  id: string;
  full_name: string;
}

export function CreateClassModal({ open, onOpenChange, onClassCreated }: CreateClassModalProps) {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    teacher_id: '',
  });

  // Client-side admin role check for UX
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (open) {
      loadTeachers();
    }
  }, [open]);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'teacher')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      // Error loading teachers - silent in production
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate input before submission
      const trimmedName = formData.name.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error('Class name is required');
      }
      if (trimmedName.length > 255) {
        throw new Error('Class name must be 255 characters or less');
      }

      if (!formData.subject || formData.subject.length === 0) {
        throw new Error('Subject is required');
      }

      const validSubjects = ['Mathematics', 'Science', 'English', 'History', 'Art', 'Physical Education', 'Music', 'Computer Science', 'Other'];
      if (!validSubjects.includes(formData.subject)) {
        throw new Error('Invalid subject selected');
      }

      if (!formData.teacher_id || formData.teacher_id.length === 0) {
        throw new Error('Teacher selection is required');
      }

      if (formData.description && formData.description.length > 1000) {
        throw new Error('Description must be 1000 characters or less');
      }

      // Find the selected teacher's name
      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      const teacherName = selectedTeacher?.full_name || '';

      const { data: newClass, error: insertError } = await supabase
        .from('classes')
        .insert({
          name: trimmedName,
          subject: formData.subject,
          description: formData.description?.trim() || null,
          teacher_id: formData.teacher_id,
          teacher_name: teacherName,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log the action for audit trail (non-blocking)
      if (newClass) {
        logAdminAction({
          action: 'create_class',
          targetType: 'class',
          targetId: newClass.id,
          details: {
            name: formData.name,
            subject: formData.subject,
            teacher_id: formData.teacher_id,
          },
        }).catch((err) => {
          // Audit failures shouldn't block class creation success
          console.error('Audit log failed:', err);
        });
      }

      // Reset form and close modal
      setFormData({ name: '', subject: '', description: '', teacher_id: '' });

      // Refresh the class list BEFORE closing modal to ensure it updates
      await onClassCreated();

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Add a new class to the platform and assign a teacher.
          </DialogDescription>
        </DialogHeader>

        {!isAdmin ? (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  Only administrators can create classes.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
              Class Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Mathematics 101"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
              Subject
            </label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            >
              <option value="">Select subject...</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="Physical Education">Physical Education</option>
              <option value="Music">Music</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="teacher" className="mb-2 block text-sm font-medium text-foreground">
              Teacher
            </label>
            {loadingTeachers ? (
              <div className="flex h-10 items-center justify-center rounded-md border border-input">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <select
                id="teacher"
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Select teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            )}
            {teachers.length === 0 && !loadingTeachers && (
              <p className="mt-1 text-xs text-muted-foreground">
                No teachers found. Create teacher accounts first.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Brief description of the class..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || teachers.length === 0}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Class'
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
