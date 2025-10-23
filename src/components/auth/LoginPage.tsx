import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, Sparkles } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';

interface LoginPageProps {
  onToggleMode: () => void;
}

export function LoginPage({ onToggleMode }: LoginPageProps) {
  const { signIn } = useAuth();
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
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome to Hapi.ai" subtitle="Connect with your emotions and classmates">
      <div className="flex bg-gray-100 rounded-xl p-1.5 mb-6">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            role === 'student'
              ? 'bg-white text-cyan-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Student</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            role === 'teacher'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Teacher</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder:text-gray-400"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onToggleMode}
          className="text-sm text-gray-600 hover:text-cyan-600 transition-colors font-medium"
        >
          Don't have an account? <span className="text-cyan-600 font-semibold">Sign up</span>
        </button>
      </div>
      <div className="mt-4 sm:mt-6 space-y-2">
          <div className="bg-sky-50/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-sky-300/60 shadow-lg">
            <p className="text-xs sm:text-sm font-bold text-blue-800 mb-1.5 sm:mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Try the Demo!
            </p>
            <p className="text-xs sm:text-sm text-blue-700 mb-1.5 sm:mb-2">
              Select {role === 'student' ? 'Student' : 'Teacher'} role and click "Sign up" to create a demo account with sample data!
            </p>
          </div>
          <p className="text-white/80 text-xs sm:text-sm text-center">
            Join your classmates in creating a supportive community
          </p>
        </div>
    </AuthLayout>
  );
}

}
