import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export function OnboardingFlow() {
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshProfile();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="w-full max-w-2xl relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-cyan-500 rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to Hapi.ai!
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Setting up your account...
          </p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
