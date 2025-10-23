import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AuthGate } from './components/auth/AuthGate';
import { LandingPage } from './components/landing/LandingPage';

function AppContent() {
  const { user, loading, role } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthGate />;
  }

  return role === 'teacher' ? <TeacherDashboard /> : <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
