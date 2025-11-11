import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, Target, Brain, BookOpen, Upload, X,
  CheckCircle, Play, Pause, Zap, Sparkles, Send, AlertCircle, FileText
} from 'lucide-react';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { StudyChatMessage, StudyTask, StudyFile } from '@/lib/types/studyPlan';
import { cn } from '@/lib/utils';
import { StudyBuddyFileUpload } from './StudyBuddyFileUpload';
import { AdaptiveStudyFlow } from './AdaptiveStudyFlow';

export function StudyPlanWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudyPlan, updateStudyTask, addChatMessage, startStudySession, endStudySession } = useStudyPlans();
  
  const studyPlan = getStudyPlan(id!);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'tasks'>('overview');
  const [isStudying, setIsStudying] = useState(false);
  const [studyTimer, setStudyTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  if (!studyPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Study Plan Not Found</h2>
          <button
            onClick={() => navigate('/dashboard/study-buddy')}
            className="text-primary hover:underline"
          >
            Back to Study Buddy
          </button>
        </div>
      </div>
    );
  }

  const daysUntilGoal = Math.ceil((new Date(studyPlan.goalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const completedTasks = studyPlan.studyTasks.filter(t => t.completed).length;
  const totalTasks = studyPlan.studyTasks.length;

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStartStudy = () => {
    startStudySession(studyPlan.id);
    setIsStudying(true);
    // Start timer
    timerIntervalRef.current = window.setInterval(() => {
      setStudyTimer(prev => prev + 1);
    }, 1000);
  };

  const handleEndStudy = () => {
    endStudySession(studyPlan.id, [], []);
    setIsStudying(false);
    setStudyTimer(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // If studying, show adaptive flow
  if (isStudying) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <AdaptiveStudyFlow
          studyPlan={studyPlan}
          onEndSession={handleEndStudy}
          sessionTimer={studyTimer}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/study-buddy')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{studyPlan.title}</h1>
          <p className="text-muted-foreground">{studyPlan.courseName}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Goal Date</span>
          </div>
          <div className={cn('font-bold', daysUntilGoal <= 3 && 'text-red-500')}>
            {daysUntilGoal > 0 ? `${daysUntilGoal} days` : 'Today!'}
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
          <div className="font-bold">{studyPlan.progress}%</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Hours Studied</span>
          </div>
          <div className="font-bold">{studyPlan.hoursStudied.toFixed(1)}h</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tasks</span>
          </div>
          <div className="font-bold">{completedTasks}/{totalTasks}</div>
        </div>
      </div>

      {/* Upload Materials Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border-2 border-violet-200 dark:border-violet-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-violet-600 rounded-xl">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Upload Study Materials</h3>
            <p className="text-sm text-muted-foreground">Add documents, notes, or recordings to enhance your study plan</p>
          </div>
        </div>
        <StudyBuddyFileUpload />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'materials', label: 'Materials' },
              { id: 'tasks', label: 'Tasks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md transition-all font-medium text-sm whitespace-nowrap',
                  activeTab === tab.id ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-xl border border-border p-6">
            {activeTab === 'overview' && <OverviewTab studyPlan={studyPlan} />}
            {activeTab === 'materials' && <MaterialsTab studyPlan={studyPlan} />}
            {activeTab === 'tasks' && <TasksTab studyPlan={studyPlan} onToggle={updateStudyTask} />}
          </div>
        </div>

        {/* Right Panel - AI Assistant & Study Timer */}
        <div className="space-y-6">
          {/* Study Timer Card */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Study Session</h3>
                <p className="text-xs text-muted-foreground">
                  {isStudying ? 'In progress' : 'Ready to start'}
                </p>
              </div>
            </div>
            
            {isStudying && (
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-primary">
                  {Math.floor(studyTimer / 60)}:{(studyTimer % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-muted-foreground">minutes</p>
              </div>
            )}

            <button
              onClick={isStudying ? handleEndStudy : handleStartStudy}
              className={cn(
                'w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                isStudying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              {isStudying ? (
                <>
                  <Pause className="w-4 h-4" />
                  End Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Studying
                </>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Generate Flashcards
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                <Target className="w-4 h-4" />
                Take Practice Quiz
              </button>
              {studyPlan.linkedAssignments.length > 0 && (
                <button 
                  onClick={() => navigate('/dashboard/assignments')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-accent"
                >
                  <FileText className="w-4 h-4" />
                  View Related Assignments
                </button>
              )}
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components

function OverviewTab({ studyPlan }: { studyPlan: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Topics to Master</h3>
        <div className="flex flex-wrap gap-2">
          {studyPlan.topics.map((topic: string) => (
            <div
              key={topic}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {topic}
            </div>
          ))}
        </div>
      </div>

      {studyPlan.aiInsights.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">AI Insights</h3>
          <div className="space-y-2">
            {studyPlan.aiInsights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Study Preferences</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Session Length</p>
            <p className="font-medium">{studyPlan.studyPreferences.sessionDuration} min</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Learning Style</p>
            <p className="font-medium capitalize">{studyPlan.studyPreferences.learningStyle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialsTab({ studyPlan }: { studyPlan: any }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Uploaded Materials</h3>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Upload className="w-4 h-4" />
            Add
          </button>
        </div>
        {studyPlan.uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {studyPlan.uploadedFiles.map((file: StudyFile) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <button className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No materials uploaded yet</p>
        )}
      </div>
    </div>
  );
}

function TasksTab({ studyPlan, onToggle }: { studyPlan: any; onToggle: any }) {
  const tasksByUnderstanding = {
    'not-started': studyPlan.studyTasks.filter((t: StudyTask) => t.understanding === 'not-started'),
    'struggling': studyPlan.studyTasks.filter((t: StudyTask) => t.understanding === 'struggling'),
    'getting-it': studyPlan.studyTasks.filter((t: StudyTask) => t.understanding === 'getting-it'),
    'mastered': studyPlan.studyTasks.filter((t: StudyTask) => t.understanding === 'mastered'),
  };

  const understandingLabels = {
    'not-started': 'Not Started',
    'struggling': 'Need Help',
    'getting-it': 'Getting It',
    'mastered': 'Mastered'
  };

  return (
    <div className="space-y-6">
      {Object.entries(tasksByUnderstanding).map(([level, tasks]) => {
        if (tasks.length === 0) return null;

        return (
          <div key={level}>
            <h3 className="font-semibold mb-3 capitalize">{understandingLabels[level as keyof typeof understandingLabels]}</h3>
            <div className="space-y-2">
              {tasks.map((task: StudyTask) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggle(studyPlan.id, task.id, { completed: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">
                        ~{task.duration} min
                      </p>
                      <div className="flex gap-1">
                        {task.topicTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

