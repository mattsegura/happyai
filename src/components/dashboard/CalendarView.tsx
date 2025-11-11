import { Sparkles, ChevronLeft, ChevronRight, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toDateString();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Mock events
  const events: { [key: string]: { title: string; color: string; type: string }[] } = {
    [new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toDateString()]: [
      { title: 'Biology Exam', color: 'bg-red-500', type: 'exam' },
    ],
    [new Date(currentDate.getFullYear(), currentDate.getMonth(), 18).toDateString()]: [
      { title: 'Study: Calculus', color: 'bg-blue-500', type: 'study' },
    ],
    [new Date(currentDate.getFullYear(), currentDate.getMonth(), 20).toDateString()]: [
      { title: 'History Essay Due', color: 'bg-amber-500', type: 'assignment' },
    ],
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // TODO: Implement AI chat functionality
    setChatMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-250px)] gap-4">
      {/* Main Calendar Area - 3/4 width */}
      <div className="flex-[3] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 lg:p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">Calendar</h2>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">View your schedule and study plans</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{monthName}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateString = day.toDateString();
            const isToday = dateString === today;
            const isSelected = selectedDate?.toDateString() === dateString;
            const dayEvents = events[dateString] || [];

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'aspect-square p-2 rounded-lg border transition-all hover:border-primary/40',
                  isToday && 'bg-primary/10 border-primary font-bold',
                  isSelected && !isToday && 'bg-accent/20 border-accent',
                  !isToday && !isSelected && 'border-border/40 hover:bg-muted/50'
                )}
              >
                <div className="flex flex-col h-full">
                  <span className={cn(
                    'text-sm',
                    isToday ? 'text-primary font-bold' : 'text-foreground'
                  )}>
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={i}
                          className={cn('h-1 rounded-full', event.color)}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Date Events */}
        {selectedDate && events[selectedDate.toDateString()] && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/40">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <div className="space-y-2">
              {events[selectedDate.toDateString()].map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                  <div className={cn('h-2 w-2 rounded-full', event.color)} />
                  <span className="text-sm text-foreground flex-1">{event.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{event.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Sidebar - 1/4 width */}
      <div className="flex-1 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 lg:p-6 flex flex-col min-h-[400px] lg:min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Study Planner</h3>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <p className="text-sm text-foreground">
              Hi! I can help you create study plans based on your calendar. Try asking me to:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• Create a study plan for Biology exam</li>
              <li>• Schedule 2 hours of Calculus review</li>
              <li>• Suggest study times this week</li>
            </ul>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about study planning..."
            className="flex-1 px-3 py-2 text-sm bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
