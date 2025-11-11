import { BookOpen, Calendar, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudyBuddyView() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Study Buddy</h2>
            <p className="text-sm text-muted-foreground">Your personal study companion and planner</p>
          </div>
        </div>
      </div>

      {/* Study Planner Card */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Smart Study Planner</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate personalized study plans based on your schedule and goals
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Quick Plan */}
          <button
            onClick={() => navigate('/dashboard/academics/planner')}
            className="flex flex-col items-start gap-3 p-6 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground">Quick Plan</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generate a study plan based on your current courses
              </p>
            </div>
          </button>

          {/* Custom Plan */}
          <button
            onClick={() => navigate('/dashboard/academics/planner')}
            className="flex flex-col items-start gap-3 p-6 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground">Custom Plan</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your plan with specific classes, timeframes, and goals
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/40">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Study Planner is being moved here from the Academics tab.
            Full customization options coming soon!
          </p>
        </div>
      </div>

      {/* Study Tools - Placeholder for future tools */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Study Tools</h3>
        <div className="flex items-center justify-center h-40 border-2 border-dashed border-border/40 rounded-lg">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              Additional study tools will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
