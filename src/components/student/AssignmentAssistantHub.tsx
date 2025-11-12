import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Clock, CheckCircle, AlertCircle, Calendar,
  TrendingUp, Target, MoreVertical, Edit3, Trash2, ExternalLink, Brain
} from 'lucide-react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Assignment } from '@/lib/types/assignment';
import { cn } from '@/lib/utils';

export function AssignmentAssistantHub() {
  const navigate = useNavigate();
  const { assignments } = useAssignments();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'active') return assignment.status !== 'completed';
    if (filter === 'completed') return assignment.status === 'completed';
    return true;
  });

  const activeAssignments = assignments.filter(a => a.status !== 'completed');
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const dueSoon = assignments.filter(a => {
    const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && a.status !== 'completed';
  });

  const avgProgress = activeAssignments.length > 0
    ? Math.round(activeAssignments.reduce((sum, a) => sum + a.progress, 0) / activeAssignments.length)
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
          <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Assignment Assistant - Complete Your Work</p>
            <p className="text-xs text-muted-foreground">
              Get AI help completing essays, projects, and assignments. This is for DOING work, not studying. Each assignment has a dedicated AI assistant focused on helping you complete tasks, meet requirements, and finish on time.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/dashboard/assignments/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Active Assignments"
          value={activeAssignments.length}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Progress"
          value={`${avgProgress}%`}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Due This Week"
          value={dueSoon.length}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedAssignments.length}
          gradient="from-purple-500 to-pink-500"
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

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-xl border border-border p-12 text-center"
        >
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Assignments Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start a new assignment with AI assistance to help you complete essays, projects, and more.
          </p>
          <motion.button
            onClick={() => navigate('/dashboard/assignments/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              index={index}
              onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)}
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

function AssignmentCard({ assignment, index, onClick }: {
  assignment: Assignment;
  index: number;
  onClick: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDue <= 3;

  const statusConfig = {
    'not-started': { label: 'Not Started', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    'planning': { label: 'Planning', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'in-progress': { label: 'In Progress', color: 'text-green-500', bg: 'bg-green-500/10' },
    'revision': { label: 'Revision', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'completed': { label: 'Completed', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  const status = statusConfig[assignment.status];

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
      <div className={cn('p-4 bg-gradient-to-r', assignment.courseColor)} style={{ background: `linear-gradient(to right, ${assignment.courseColor}, ${assignment.courseColor}dd)` }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">{assignment.title}</h3>
            <p className="text-white/80 text-sm">{assignment.courseName}</p>
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
          {isUrgent && assignment.status !== 'completed' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Due Soon
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
            <span className="text-sm font-semibold">{assignment.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${assignment.progress}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className={cn(isUrgent ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
              {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Due today'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Math.round(assignment.estimatedTimeRemaining / 60)}h left
            </span>
          </div>
        </div>

        {/* AI Chat Indicator */}
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {assignment.chatHistory.length} messages with AI assistant
          </span>
        </div>
      </div>
    </motion.div>
  );
}

