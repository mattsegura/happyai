import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle, Target, TrendingUp,
  MoreVertical, Edit3, Trash2, ExternalLink, Brain, Calendar, Zap, Plus
} from 'lucide-react';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { StudyPlan } from '@/lib/types/studyPlan';
import { cn } from '@/lib/utils';

export function StudyBuddyHub() {
  const navigate = useNavigate();
  const { studyPlans } = useStudyPlans();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredPlans = studyPlans.filter(plan => {
    if (filter === 'active') return plan.status === 'active';
    if (filter === 'completed') return plan.status === 'completed';
    return true;
  });

  const activePlans = studyPlans.filter(p => p.status === 'active');
  const completedPlans = studyPlans.filter(p => p.status === 'completed');
  const totalHours = studyPlans.reduce((sum, p) => sum + p.hoursStudied, 0);
  const avgProgress = activePlans.length > 0
    ? Math.round(activePlans.reduce((sum, p) => sum + p.progress, 0) / activePlans.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-4 border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Study Buddy - Learn & Master Concepts</p>
            <p className="text-xs text-muted-foreground">
              This is for LEARNING, not completing assignments. Upload study materials above to create personalized study plans for exams, mastering topics, and truly understanding material. Generate flashcards, quizzes, and summaries. Each plan has an AI tutor focused on helping you learn and retain knowledge.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Your Study Plans</h2>
          <p className="text-sm text-muted-foreground">AI-powered learning for mastering concepts</p>
        </div>
        <motion.button
          onClick={() => navigate('/dashboard/study-buddy/create')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all animate-gradient-x"
        >
          <Brain className="w-5 h-5" />
          Create Study Plan
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Active Plans"
          value={activePlans.length}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Progress"
          value={`${avgProgress}%`}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Hours Studied"
          value={totalHours.toFixed(1)}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedPlans.length}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg w-fit">
        {['all', 'active', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={cn(
              'px-4 py-2 rounded-md transition-all font-medium text-sm',
              filter === tab ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Study Plans Grid */}
      {filteredPlans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-xl border border-border p-12 text-center"
        >
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Study Plans Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first study plan to start mastering concepts with AI assistance
          </p>
          <motion.button
            onClick={() => navigate('/dashboard/study-buddy/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Study Plan
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPlans.map((plan, index) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              index={index}
              onClick={() => navigate(`/dashboard/study-buddy/${plan.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: {
  icon: any;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl p-6 border border-border/40 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </motion.div>
  );
}

function StudyPlanCard({ plan, index, onClick }: {
  plan: StudyPlan;
  index: number;
  onClick: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const daysUntilGoal = Math.ceil((new Date(plan.goalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilGoal <= 3;

  const statusConfig = {
    'active': { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10' },
    'completed': { label: 'Completed', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'archived': { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  };

  const purposeLabels = {
    'exam': 'Exam Prep',
    'assignment-help': 'Assignment Help',
    'topic-mastery': 'Topic Mastery',
    'review': 'General Review'
  };

  const status = statusConfig[plan.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border/40 shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${plan.courseColor}, ${plan.courseColor}dd)` }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">{plan.title}</h3>
            <p className="text-white/80 text-sm">{plan.courseName}</p>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-xl border border-border z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Workspace
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </button>
                <div className="border-t border-border my-1" />
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/10 text-red-500 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-semibold', status.bg, status.color)}>
            {status.label}
          </span>
          <span className="px-2 py-1 bg-white/20 text-white rounded text-xs font-semibold">
            {purposeLabels[plan.purpose]}
          </span>
          {isUrgent && plan.status !== 'completed' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-100 rounded text-xs font-semibold">
              Goal Soon!
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-semibold">{plan.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plan.progress}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>

        {/* Topics */}
        {plan.topics.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Topics to Master:</p>
            <div className="flex flex-wrap gap-1">
              {plan.topics.slice(0, 3).map((topic: string) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                >
                  {topic}
                </span>
              ))}
              {plan.topics.length > 3 && (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                  +{plan.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className={cn(isUrgent ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
              {daysUntilGoal > 0 ? `${daysUntilGoal} days` : 'Today!'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {plan.hoursStudied.toFixed(1)}h studied
            </span>
          </div>
        </div>

        {/* AI Tutor Indicator */}
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {plan.chatHistory.length} conversations with AI tutor
          </span>
        </div>

        {/* Tools Generated */}
        {(plan.generatedTools.flashcards.length > 0 ||
          plan.generatedTools.quizzes.length > 0 ||
          plan.generatedTools.summaries.length > 0) && (
          <div className="flex items-center gap-2 p-2 bg-accent/5 rounded-lg">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">
              {plan.generatedTools.flashcards.length} flashcards, {plan.generatedTools.quizzes.length} quizzes
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

