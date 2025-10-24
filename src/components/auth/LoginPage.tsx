import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, Sparkles } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface LoginPageProps {
  onToggleMode: () => void;
}

export function LoginPage({ onToggleMode }: LoginPageProps) {
  const { signIn } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password, role);

    if (error) {
      setError(error.message);
      toast.error('Login failed', error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!', `Logged in as ${role}`);
    }
  };

  return (
    <AuthLayout title="Welcome to HapiAI" subtitle="Connect with your emotions and classmates">
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
          placeholder="Password"
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
          error={error && !error.includes('email') ? error : undefined}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          className="bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onToggleMode}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
        >
          Don't have an account?{' '}
          <span className="text-primary-600 dark:text-primary-400 font-semibold">Sign up</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="bg-sky-50/90 dark:bg-sky-900/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-sky-300/60 dark:border-sky-700/60 shadow-lg">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Try the Demo!
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Select {role === 'student' ? 'Student' : 'Teacher'} role and click "Sign up" to create a
            demo account with sample data!
          </p>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
          Join your classmates in creating a supportive community
        </p>
      </div>
    </AuthLayout>
  );
}
