import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherHomeView } from './TeacherHomeView';
import { TeacherClassesView } from './TeacherClassesView';
import { TeacherHapiLab } from './TeacherHapiLab';
import { TeacherProfileView } from './TeacherProfileView';
import { Home, Users, Beaker, User, Smile } from 'lucide-react';

type View = 'home' | 'classes' | 'lab' | 'profile';

export function TeacherDashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [labState, setLabState] = useState<{ tab?: 'pulses' | 'office-hours'; pulseId?: string }>({});

  const handleNavigateToLab = (pulseId?: string) => {
    setLabState({ tab: 'pulses', pulseId });
    setCurrentView('lab');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Hapi.ai
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium">Your Emotional Wellness Companion</p>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">

        <div className="mt-6 space-y-6">
          {currentView === 'home' && <TeacherHomeView onNavigateToLab={handleNavigateToLab} />}
          {currentView === 'classes' && <TeacherClassesView />}
          {currentView === 'lab' && (
            <TeacherHapiLab
              initialTab={labState.tab}
              highlightPulseId={labState.pulseId}
            />
          )}
          {currentView === 'profile' && <TeacherProfileView />}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-1 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {[
              { id: 'home', icon: Home, label: 'Home', color: 'blue' },
              { id: 'classes', icon: Users, label: 'Classes', color: 'cyan' },
              { id: 'lab', icon: Beaker, label: 'Hapi Lab', color: 'sky' },
              { id: 'profile', icon: User, label: 'Profile', color: 'indigo' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    if (item.id !== 'lab') {
                      setLabState({});
                    }
                  }}
                  className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 min-w-0 ${
                    isActive
                      ? `bg-${item.color}-100 text-${item.color}-600`
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? `stroke-[2.5]` : ''}`} />
                  <span className={`text-[10px] sm:text-xs font-semibold ${isActive ? '' : 'font-medium'} truncate max-w-[70px] sm:max-w-none`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
