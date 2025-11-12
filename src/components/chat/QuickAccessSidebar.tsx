import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BookOpen, Target, TrendingUp, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAccessSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAccessSidebar({ isOpen, onClose }: QuickAccessSidebarProps) {
  const navigate = useNavigate();

  const recentFiles = [
    { name: 'Biology Notes.pdf', type: 'pdf', date: '2h ago' },
    { name: 'Math Diagram.png', type: 'image', date: '5h ago' },
    { name: 'Lecture Recording.mp4', type: 'video', date: '1d ago' },
  ];

  const activeStudyPlans = [
    { title: 'Calculus Midterm Prep', progress: 65, color: '#f59e0b' },
    { title: 'Biology Chapter 7-9', progress: 40, color: '#ef4444' },
  ];

  const upcomingDeadlines = [
    { title: 'Math Quiz', course: 'Calculus II', daysUntil: 2 },
    { title: 'Bio Lab Report', course: 'Biology 101', daysUntil: 4 },
  ];

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
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute left-0 top-0 bottom-0 w-80 z-30 backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-r border-white/40 shadow-2xl overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/40 flex items-center justify-between">
              <h2 className="font-bold text-foreground">Quick Access</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Recent Files */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Recent Files</h3>
              </div>
              <div className="space-y-2">
                {recentFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{file.name}</div>
                        <div className="text-[10px] text-muted-foreground">{file.date}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Study Plans */}
            <div className="p-4 border-t border-white/40">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Active Plans</h3>
              </div>
              <div className="space-y-2">
                {activeStudyPlans.map((plan, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      navigate('/dashboard/study-buddy');
                      onClose();
                    }}
                    className="w-full p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: plan.color }}
                      />
                      <div className="text-xs font-medium text-foreground">{plan.title}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{plan.progress}%</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="p-4 border-t border-white/40">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Upcoming</h3>
              </div>
              <div className="space-y-2">
                {upcomingDeadlines.map((deadline, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white/50"
                  >
                    <div className="text-xs font-medium text-foreground">{deadline.title}</div>
                    <div className="text-[10px] text-muted-foreground">{deadline.course}</div>
                    <div className={cn(
                      'text-[10px] font-semibold mt-1',
                      deadline.daysUntil <= 2 ? 'text-red-600' : 'text-orange-600'
                    )}>
                      {deadline.daysUntil}d remaining
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-white/40">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/dashboard/classes/analytics');
                    onClose();
                  }}
                  className="w-full p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-colors text-left flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">View Analytics</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/study-buddy/create');
                    onClose();
                  }}
                  className="w-full p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors text-left flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-foreground">Create Study Plan</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

