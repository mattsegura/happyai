import { useState } from 'react';
import { mockClassWellbeingIndicators } from '../../lib/mockData';
import { Heart, ChevronDown, ChevronUp, Smile, Meh, Frown, Sparkles } from 'lucide-react';

export function WellbeingSummaryCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const wellbeingIndicators = mockClassWellbeingIndicators;

  const strugglingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'struggling').length;
  const managingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'managing').length;
  const thrivingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'thriving').length;

  const avgMood = wellbeingIndicators.reduce((sum, w) => sum + w.average_mood, 0) / wellbeingIndicators.length;
  const avgStress = wellbeingIndicators.reduce((sum, w) => sum + w.stress_level, 0) / wellbeingIndicators.length;

  const strugglingClasses = wellbeingIndicators.filter(w => w.wellbeing_level === 'struggling');
  const managingClasses = wellbeingIndicators.filter(w => w.wellbeing_level === 'managing');

  return (
    <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Compact Summary View */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Wellbeing</h3>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Key Metrics - Horizontal */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">Mood</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {avgMood.toFixed(1)}<span className="text-sm text-muted-foreground">/7</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">Stress</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {avgStress.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>

          {thrivingCount > 0 && (
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-0.5">Thriving</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{thrivingCount}</div>
            </div>
          )}
        </div>

        {/* Status Badges - Compact */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {thrivingCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
              <Smile className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">{thrivingCount}</span>
            </div>
          )}
          {managingCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
              <Meh className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{managingCount}</span>
            </div>
          )}
          {strugglingCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30">
              <Frown className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">{strugglingCount}</span>
            </div>
          )}
        </div>

        {/* Quick Alert */}
        {strugglingCount > 0 && !isExpanded && (
          <div className="mt-3 p-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="text-xs text-red-700 dark:text-red-300">
                Struggling in {strugglingCount} {strugglingCount === 1 ? 'class' : 'classes'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-5 space-y-3">
          {strugglingClasses.map((indicator) => (
            <div
              key={indicator.class_id}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-foreground">{indicator.class_name}</h4>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">Struggling</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Mood</div>
                  <div className="text-lg font-bold text-foreground">{indicator.average_mood.toFixed(1)}/7</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {indicator.factors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                  >
                    {factor}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm font-medium">
                  Talk to Counselor
                </button>
                <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium border border-red-300 dark:border-red-700">
                  Wellness Resources
                </button>
              </div>
            </div>
          ))}

          {managingClasses.map((indicator) => (
            <div
              key={indicator.class_id}
              className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{indicator.class_name}</h4>
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Managing</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Mood</div>
                  <div className="text-lg font-bold text-foreground">{indicator.average_mood.toFixed(1)}/7</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {indicator.factors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {thrivingCount > 0 && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Thriving in {thrivingCount} {thrivingCount === 1 ? 'class' : 'classes'}! Keep up the great work!
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
