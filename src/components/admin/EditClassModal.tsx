import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
import { Loader2 } from 'lucide-react';

interface EditClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassUpdated: () => void;
  classId: string;
  initialData: {
    name: string;
    subject: string;
    description?: string;
    teacherId: string;
  };
}

interface Teacher {
  id: string;
  full_name: string;
}

export function EditClassModal({
  open,
  onOpenChange,
  onClassUpdated,
  classId,
  initialData,
}: EditClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    name: initialData.name,
    subject: initialData.subject,
    description: initialData.description || '',
    teacher_id: initialData.teacherId,
  });

  useEffect(() => {
    if (open) {
      loadTeachers();
      setFormData({
        name: initialData.name,
        subject: initialData.subject,
        description: initialData.description || '',
        teacher_id: initialData.teacherId,
      });
    }
  }, [open, initialData]);

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
      const { error: updateError } = await supabase
        .from('classes')
        .update({
          name: formData.name,
          subject: formData.subject,
          description: formData.description || null,
          teacher_id: formData.teacher_id,
        })
        .eq('id', classId);

      if (updateError) throw updateError;

      onClassUpdated();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class details and reassign teacher if needed.
          </DialogDescription>
        </DialogHeader>

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
                  Updating...
                </>
              ) : (
                'Update Class'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
