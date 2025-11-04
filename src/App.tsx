import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { AITutorPage } from './components/pages/AITutorPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ToastProvider } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/tooltip-radix';

// Lazy load dashboards for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const TeacherDashboard = lazy(() => import('./components/teacher/TeacherDashboard').then(module => ({ default: module.TeacherDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

// Wrapper components for auth pages with navigation
function LoginPageWrapper() {
  const navigate = useNavigate();
  return <LoginPage onToggleMode={() => navigate('/signup')} />;
}

function SignupPageWrapper() {
  const navigate = useNavigate();
  return <SignupPage onToggleMode={() => navigate('/login')} />;
}

function AppContent() {
  const { user, loading, role, profile } = useAuth();

  // Show loading while authenticating OR while profile is being fetched
  // This prevents wrong redirects before role is loaded from database
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Loading HapiAI
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Preparing your experience...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ai-tutor" element={<AITutorPage onNavigateHome={() => window.location.href = '/'} />} />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/signup" element={<SignupPageWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Suspense fallback for lazy-loaded components
  const DashboardLoadingFallback = (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={DashboardLoadingFallback}>
      <Routes>
        <Route path="/" element={
          (role === 'admin' || role === 'super_admin') ? (
            <Navigate to="/admin" replace />
          ) : role === 'teacher' ? (
            <Navigate to="/teacher" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Student Dashboard Routes */}
        <Route path="/dashboard/*" element={<Dashboard />} />

        {/* Teacher Dashboard Routes */}
        <Route path="/teacher/*" element={<TeacherDashboard />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
