import { useState } from 'react';
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

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserModal({ open, onOpenChange, onUserAdded }: AddUserModalProps) {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'admin' | 'super_admin',
  });

  // Client-side admin role check for UX
  const isAdmin = role === 'admin' || role === 'super_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate input before submission
      const trimmedEmail = formData.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        throw new Error('Valid email address is required');
      }

      const trimmedName = formData.fullName.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error('Full name is required');
      }
      if (trimmedName.length > 255) {
        throw new Error('Full name must be 255 characters or less');
      }

      if (!formData.password || formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (formData.password.length > 72) {
        throw new Error('Password must be 72 characters or less');
      }

      const validRoles = ['student', 'teacher', 'admin', 'super_admin'];
      if (!validRoles.includes(formData.role)) {
        throw new Error('Invalid role selected');
      }

      // Get session token explicitly
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated - please login again');
      }

      // Call Edge Function with explicit auth header
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            password: formData.password,
            fullName: trimmedName,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Reset form and close modal
      setFormData({ email: '', fullName: '', password: '', role: 'student' });
      onUserAdded();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. They will receive access immediately.
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
                  Only administrators can create new users.
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
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
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
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
              {role === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
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
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
