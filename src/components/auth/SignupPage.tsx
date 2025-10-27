import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '../ui/Toast';
import { EmailVerificationPage } from './EmailVerificationPage';

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
  const [showVerification, setShowVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

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
      // Show verification page instead of staying in loading state
      setSignupEmail(email);
      setShowVerification(true);
      setLoading(false);
      toast.success('Account created!', 'Please check your email to verify your account.');
    }
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  // Show verification page if signup was successful
  if (showVerification) {
    return <EmailVerificationPage email={signupEmail} onBack={handleBackToSignup} />;
  }

  return (
    <AuthLayout title="Join HapiAI" subtitle="Start your emotional wellness journey">
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
              className="text-muted-foreground transition-colors hover:text-foreground"
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
          variant="default"
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
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Already have an account?{' '}
          <span className="font-semibold text-primary">Sign in</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Start earning points and building your emotional wellness journey
        </p>
      </div>
    </AuthLayout>
  );
}
