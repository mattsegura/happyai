import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, Sparkles } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
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

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast.error('Login failed', error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!', 'Successfully logged in');
    }
  };

  return (
    <AuthLayout title="Welcome to HapiAI" subtitle="Connect with your emotions and classmates">
      {/* Role Toggle */}
      <div className="mb-6 flex rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm dark:bg-muted/40">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            role === 'student'
              ? 'bg-background text-accent shadow ring-1 ring-accent/30 dark:bg-background/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={role === 'student'}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Student</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            role === 'teacher'
              ? 'bg-background text-primary shadow ring-1 ring-primary/30 dark:bg-background/80'
              : 'text-muted-foreground hover:text-foreground'
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
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={error && !error.includes('email') ? error : undefined}
        />

        <Button
          type="submit"
          variant="default"
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
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Don't have an account?{' '}
          <span className="font-semibold text-primary">Sign up</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 backdrop-blur-sm shadow-lg dark:border-accent/30 dark:bg-accent/15">
          <p className="mb-2 flex items-center text-sm font-semibold text-accent">
            <Sparkles className="w-4 h-4 mr-2" />
            Try the Demo!
          </p>
          <p className="text-sm text-muted-foreground">
            Select {role === 'student' ? 'Student' : 'Teacher'} role and click "Sign up" to create a
            demo account with sample data!
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Join your classmates in creating a supportive community
        </p>
      </div>
    </AuthLayout>
  );
}
