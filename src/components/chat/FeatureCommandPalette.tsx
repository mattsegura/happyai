import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, BookOpen, Brain, Target, TrendingUp,
  FileText, Sparkles, Clock, Award, Heart, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  { id: 'calendar', name: 'Smart Calendar', description: 'View and manage your schedule', icon: Calendar, path: '/dashboard/planner', color: 'text-blue-600' },
  { id: 'classes', name: 'Classes', description: 'View your courses and grades', icon: BookOpen, path: '/dashboard/classes', color: 'text-purple-600' },
  { id: 'analytics', name: 'Analytics', description: 'Track your performance', icon: TrendingUp, path: '/dashboard/classes/analytics', color: 'text-green-600' },
  { id: 'assignments', name: 'Assignments', description: 'Manage your work', icon: Target, path: '/dashboard/assignments', color: 'text-orange-600' },
  { id: 'study-buddy', name: 'Study Buddy', description: 'Create study plans', icon: Brain, path: '/dashboard/study-buddy', color: 'text-pink-600' },
  { id: 'flashcards', name: 'Flashcards', description: 'AI-generated flashcards', icon: Sparkles, path: '/dashboard/flashcards', color: 'text-cyan-600' },
  { id: 'quizzes', name: 'Quizzes', description: 'Practice tests', icon: Award, path: '/dashboard/quizzes', color: 'text-amber-600' },
];

export function FeatureCommandPalette({ isOpen, onClose }: FeatureCommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
          >
            <div className="mx-4 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border border-white/40 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border/40">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search features..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
                <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {filteredFeatures.length > 0 ? (
                  <div className="p-2">
                    {filteredFeatures.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <motion.button
                          key={feature.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => handleSelect(feature.path)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className={cn('p-2 rounded-lg bg-muted', feature.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">No features found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/40 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Navigate with arrow keys</span>
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/50 font-mono">Esc</kbd> to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

