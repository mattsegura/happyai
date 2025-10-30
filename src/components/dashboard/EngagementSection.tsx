import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { MoodTrackerWidget } from '../student/MoodTrackerWidget';
import { ParticipationReportWidget } from '../student/ParticipationReportWidget';
import { BadgeSystemWidget } from '../student/BadgeSystemWidget';
import { HapiMomentsWidget } from '../student/HapiMomentsWidget';
import { EmotionalTrajectoryWidget } from '../student/EmotionalTrajectoryWidget';

export function EngagementSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Engagement & Progress</h3>
            <p className="text-xs text-muted-foreground">
              Detailed tracking, badges, and social features
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {isExpanded ? 'Hide details' : 'Show details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/10 p-6 space-y-6">
          {/* Emotional Trajectory */}
          <EmotionalTrajectoryWidget />

          {/* Mood & Participation Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <MoodTrackerWidget />
            <ParticipationReportWidget />
          </div>

          {/* Badges & Hapi Moments Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BadgeSystemWidget />
            <HapiMomentsWidget />
          </div>
        </div>
      )}
    </div>
  );
}
