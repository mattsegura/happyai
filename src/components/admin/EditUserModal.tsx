import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
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
import { Loader2, Shield } from 'lucide-react';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
  userId: string;
  initialData: {
    email: string;
    fullName: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

export function EditUserModal({
  open,
  onOpenChange,
  onUserUpdated,
  userId,
  initialData,
}: EditUserModalProps) {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    role: initialData.role,
  });

  // Client-side admin role check for UX
  const isAdmin = role === 'admin';

  // Update form when initialData changes
  useEffect(() => {
    setFormData({
      fullName: initialData.fullName,
      role: initialData.role,
    });
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate input before submission
      const trimmedName = formData.fullName.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error('Full name is required');
      }
      if (trimmedName.length > 255) {
        throw new Error('Full name must be 255 characters or less');
      }

      const validRoles = ['student', 'teacher', 'admin'];
      if (!validRoles.includes(formData.role)) {
        throw new Error('Invalid role selected');
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          role: formData.role,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Close modal and refresh
      onUserUpdated();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details. Email cannot be changed.
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
                  Only administrators can edit users.
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-muted-foreground">
              Email Address (cannot be changed)
            </label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
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
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
