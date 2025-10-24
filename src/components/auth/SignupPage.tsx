import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface SignupPageProps {
  onToggleMode: () => void;
}

export function SignupPage({ onToggleMode }: SignupPageProps) {
  const { signUp } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      toast.error('Validation Error', errorMsg);
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError(error.message);
      toast.error('Signup failed', error.message);
      setLoading(false);
    } else {
      toast.success('Account created!', `Welcome to HapiAI, ${fullName}!`);
    }
  };

  return (
    <AuthLayout title="Join HapiAI" subtitle="Start your emotional wellness journey">
      {/* Role Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 mb-6">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            role === 'student'
              ? 'bg-white dark:bg-slate-700 text-accent-600 dark:text-accent-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
          aria-pressed={role === 'student'}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Student</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            role === 'teacher'
              ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
          aria-pressed={role === 'teacher'}
        >
          <Users className="w-5 h-5" />
          <span>Teacher</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
          leftIcon={<User className="w-5 h-5" />}
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          leftIcon={<Mail className="w-5 h-5" />}
          error={error && error.includes('email') ? error : undefined}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={error && error.includes('password') ? error : undefined}
          helperText="Must be at least 6 characters long"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          className="bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onToggleMode}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
        >
          Already have an account?{' '}
          <span className="text-primary-600 dark:text-primary-400 font-semibold">Sign in</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Start earning points and building your emotional wellness journey
        </p>
      </div>
    </AuthLayout>
  );
}
