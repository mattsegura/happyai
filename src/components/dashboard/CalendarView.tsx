import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export function CalendarView() {
  return (
    <div className="flex h-[calc(100vh-250px)] gap-4">
      {/* Main Calendar Area - 3/4 width */}
      <div className="flex-[3] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
            <p className="text-sm text-muted-foreground mt-1">View your schedule and upcoming events</p>
          </div>
          <CalendarIcon className="h-8 w-8 text-primary" />
        </div>

        <div className="flex items-center justify-center h-[calc(100%-100px)] border-2 border-dashed border-border/40 rounded-lg">
          <div className="text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Full Calendar View</p>
            <p className="text-sm text-muted-foreground mt-2">
              Coming soon: Full calendar with study plans, assignments, and events
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Sidebar - 1/4 width */}
      <div className="flex-1 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
        </div>

        <div className="flex items-center justify-center h-[calc(100%-60px)] border-2 border-dashed border-border/40 rounded-lg">
          <div className="text-center px-4">
            <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground">Study Plan Assistant</p>
            <p className="text-xs text-muted-foreground mt-2">
              Chat with AI to create custom study plans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
