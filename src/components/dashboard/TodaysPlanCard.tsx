import { motion } from 'framer-motion';
import { Brain, CheckCircle, Clock, Sparkles, ChevronRight, Calendar, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PlanItem {
  id: string;
  time: string;
  title: string;
  type: 'study' | 'assignment' | 'break' | 'review';
  studyPlan: string;
  duration: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function TodaysPlanCard() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // AI-generated daily plan based on active study plans
  const todaysPlan: PlanItem[] = [
    {
      id: '1',
      time: '9:00 AM',
      title: 'Calculus II - Integration Practice',
      type: 'study',
      studyPlan: 'Calculus II Exam Prep',
      duration: '45 min',
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      time: '10:00 AM',
      title: 'Biology Lab Report - Data Analysis',
      type: 'assignment',
      studyPlan: 'Biology 101 Weekly Tasks',
      duration: '1 hr',
      completed: false,
      priority: 'high'
    },
    {
      id: '3',
      time: '11:15 AM',
      title: 'Quick Break & Mindfulness',
      type: 'break',
      studyPlan: 'Wellness Plan',
      duration: '15 min',
      completed: false,
      priority: 'medium'
    },
    {
      id: '4',
      time: '2:00 PM',
      title: 'Literature Essay - Outline Review',
      type: 'review',
      studyPlan: 'English Lit Essay Draft',
      duration: '30 min',
      completed: false,
      priority: 'medium'
    },
    {
      id: '5',
      time: '3:00 PM',
      title: 'Chemistry - Stoichiometry Flashcards',
      type: 'study',
      studyPlan: 'Chemistry 102 Mastery',
      duration: '25 min',
      completed: false,
      priority: 'low'
    },
  ];

  const toggleComplete = (id: string) => {
    setCompletedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <BookOpen className="w-4 h-4" />;
      case 'assignment':
        return <Target className="w-4 h-4" />;
      case 'break':
        return <Sparkles className="w-4 h-4" />;
      case 'review':
        return <Brain className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study':
        return 'from-blue-500 to-cyan-500';
      case 'assignment':
        return 'from-amber-500 to-orange-500';
      case 'break':
        return 'from-purple-500 to-pink-500';
      case 'review':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const completedCount = todaysPlan.filter(item => completedItems.includes(item.id)).length;
  const totalCount = todaysPlan.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-b border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Today's Plan</h3>
              <p className="text-xs text-muted-foreground">AI-curated from your active study plans</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{completedCount}/{totalCount}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>

      {/* Plan Items */}
      <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {todaysPlan.map((item, idx) => {
          const isCompleted = completedItems.includes(item.id);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'group p-3 rounded-lg border transition-all cursor-pointer',
                isCompleted
                  ? 'bg-muted/50 border-border/40 opacity-60'
                  : 'bg-background border-border/60 hover:shadow-md hover:border-border'
              )}
              onClick={() => toggleComplete(item.id)}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    isCompleted
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-primary'
                  )}
                >
                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('p-1 rounded bg-gradient-to-br flex-shrink-0', getTypeColor(item.type))}>
                      {getTypeIcon(item.type)}
                      <span className="sr-only">{item.type}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                  
                  <h4 className={cn(
                    'font-semibold text-sm mb-1',
                    isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                  )}>
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground truncate">
                    From: {item.studyPlan}
                  </p>
                </div>

                {/* Priority Badge */}
                {item.priority === 'high' && !isCompleted && (
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                    HIGH
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-muted/30 border-t border-border/60">
        <button className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2">
          View Full Study Plans
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

