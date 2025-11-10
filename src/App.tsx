import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { AITutorPage } from './components/pages/AITutorPage';
import { TeacherFeaturesPage } from './components/pages/TeacherFeaturesPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ToastProvider } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/tooltip-radix';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

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
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('[AppContent] Render -', { user: user?.email, loading, role, path: location.pathname });
  }

  // Force correct dashboard based on role when user is authenticated
  useEffect(() => {
    if (!loading && user && role) {
      const currentPath = location.pathname;
      const isOnDashboard = currentPath.startsWith('/dashboard');
      const isOnTeacher = currentPath.startsWith('/teacher');
      const isOnAdmin = currentPath.startsWith('/admin');

      // Redirect if user is on wrong dashboard
      if (role === 'teacher' && !isOnTeacher && (isOnDashboard || currentPath === '/')) {
        if (import.meta.env.DEV) console.log('[AppContent] Redirecting teacher from', currentPath, 'to /teacher');
        navigate('/teacher', { replace: true });
      } else if ((role === 'admin' || role === 'super_admin') && !isOnAdmin && (isOnDashboard || isOnTeacher || currentPath === '/')) {
        if (import.meta.env.DEV) console.log('[AppContent] Redirecting admin from', currentPath, 'to /admin');
        navigate('/admin', { replace: true });
      } else if (role === 'student' && !isOnDashboard && (isOnTeacher || isOnAdmin || currentPath === '/')) {
        if (import.meta.env.DEV) console.log('[AppContent] Redirecting student from', currentPath, 'to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, role, location.pathname, navigate]);

  if (loading) {
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
        <Route path="/teacher-features" element={<TeacherFeaturesPage />} />
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
          (() => {
            const redirectPath = (role === 'admin' || role === 'super_admin')
              ? '/admin'
              : role === 'teacher'
                ? '/teacher'
                : '/dashboard';
            if (import.meta.env.DEV) {
              console.log('[AppContent] Root redirect -', { role, redirectPath });
            }
            return <Navigate to={redirectPath} replace />;
          })()
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
            <PWAInstallPrompt />
          </AuthProvider>
        </ToastProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
