import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Smile, Meh, Frown, Sparkles, Loader2 } from 'lucide-react';

type WellbeingLevel = 'thriving' | 'managing' | 'struggling';

interface WellbeingIndicator {
  class_id: string;
  class_name: string;
  wellbeing_level: WellbeingLevel;
  avg_sentiment: number;
  stress_level: number;
  support_needed: boolean;
}

export function WellbeingIndicators() {
  const { user } = useAuth();
  const [wellbeingIndicators, setWellbeingIndicators] = useState<WellbeingIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWellbeingData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's classes
        const { data: classMembers, error: classError } = await supabase
          .from('class_members')
          .select('class_id, classes(id, name)')
          .eq('user_id', user.id);

        if (classError) throw classError;

        // Calculate wellbeing for each class based on pulse checks
        const wellbeingData: WellbeingIndicator[] = [];

        for (const member of classMembers || []) {
          const classData = member.classes as any;
          if (!classData) continue;

          // Get recent pulse checks for this class
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: pulses, error: pulseError } = await supabase
            .from('pulse_checks')
            .select('sentiment')
            .eq('user_id', user.id)
            .gte('created_at', thirtyDaysAgo.toISOString());

          if (pulseError) continue;

          if (pulses && pulses.length > 0) {
            const avgSentiment = pulses.reduce((sum, p) => sum + p.sentiment, 0) / pulses.length;
            const stressLevel = Math.max(1, Math.min(10, 11 - avgSentiment)); // Inverse of sentiment

            let wellbeingLevel: WellbeingLevel = 'managing';
            if (avgSentiment >= 5) wellbeingLevel = 'thriving';
            else if (avgSentiment < 3) wellbeingLevel = 'struggling';

            wellbeingData.push({
              class_id: classData.id,
              class_name: classData.name,
              wellbeing_level: wellbeingLevel,
              avg_sentiment: avgSentiment,
              stress_level: stressLevel,
              support_needed: avgSentiment < 3,
            });
          }
        }

        setWellbeingIndicators(wellbeingData);
      } catch (error) {
        console.error('Error fetching wellbeing data:', error);
        setWellbeingIndicators([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWellbeingData();
  }, [user]);

  const getWellbeingIcon = (level: WellbeingLevel) => {
    switch (level) {
      case 'thriving':
        return <Smile className="w-5 h-5" />;
      case 'managing':
        return <Meh className="w-5 h-5" />;
      case 'struggling':
        return <Frown className="w-5 h-5" />;
    }
  };

  const getWellbeingColor = (level: WellbeingLevel) => {
    switch (level) {
      case 'thriving':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'managing':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 'struggling':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    }
  };

  const getWellbeingLabel = (level: WellbeingLevel) => {
    switch (level) {
      case 'thriving':
        return 'Thriving';
      case 'managing':
        return 'Managing';
      case 'struggling':
        return 'Struggling';
    }
  };

  const getWellbeingBadgeColor = (level: WellbeingLevel) => {
    switch (level) {
      case 'thriving':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'managing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'struggling':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
    }
  };

  const getStressColor = (stressLevel: number) => {
    if (stressLevel >= 7) return 'bg-red-500 dark:bg-red-600';
    if (stressLevel >= 5) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-green-500 dark:bg-green-600';
  };

  const strugglingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'struggling').length;
  const managingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'managing').length;
  const thrivingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'thriving').length;

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Empty state
  if (wellbeingIndicators.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No wellbeing data yet</h3>
          <p className="text-sm text-muted-foreground">
            Complete your daily pulse checks to track your wellbeing across classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Wellbeing Indicators
          </h3>
          <p className="text-sm text-muted-foreground mt-1">How you're feeling in each class</p>
        </div>
        <div className="flex items-center gap-2">
          {thrivingCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
              {thrivingCount} Thriving
            </span>
          )}
          {strugglingCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
              {strugglingCount} Struggling
            </span>
          )}
        </div>
      </div>

      {/* Wellbeing Cards */}
      <div className="space-y-4">
        {wellbeingIndicators.map((indicator) => (
          <div
            key={indicator.class_id}
            className={`p-5 rounded-xl border-2 ${getWellbeingColor(indicator.wellbeing_level)}`}
          >
            {/* Class Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-foreground text-lg mb-1">{indicator.class_name}</h4>
                <div className="flex items-center gap-2">
                  {getWellbeingIcon(indicator.wellbeing_level)}
                  <span className="text-sm font-semibold">{getWellbeingLabel(indicator.wellbeing_level)}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getWellbeingBadgeColor(indicator.wellbeing_level)}`}>
                {getWellbeingLabel(indicator.wellbeing_level)}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-background/50">
                <div className="text-xs font-medium text-muted-foreground mb-1">Average Mood</div>
                <div className="text-2xl font-bold text-foreground">
                  {indicator.average_mood.toFixed(1)}<span className="text-sm text-muted-foreground">/7</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <div className="text-xs font-medium text-muted-foreground mb-1">Stress Level</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${getStressColor(indicator.stress_level)}`}
                      style={{ width: `${(indicator.stress_level / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground">{indicator.stress_level}/10</span>
                </div>
              </div>
            </div>

            {/* Factors */}
            {indicator.factors.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Contributing Factors
                </div>
                <div className="flex flex-wrap gap-2">
                  {indicator.factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-background/70 text-foreground border border-border"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Support Resources */}
            {indicator.wellbeing_level === 'struggling' && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4" />
                  Support Resources
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
                    Talk to Counselor
                  </button>
                  <button className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium">
                    Wellness Resources
                  </button>
                </div>
              </div>
            )}

            {/* Encouragement */}
            {indicator.wellbeing_level === 'thriving' && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>You're doing great in this class! Keep up the positive momentum.</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Summary */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Overall Wellbeing</h4>
            <p className="text-sm text-muted-foreground">
              {strugglingCount > 0 ? (
                <>
                  You're experiencing challenges in {strugglingCount} {strugglingCount === 1 ? 'class' : 'classes'}. 
                  Remember, it's okay to ask for help. Reach out to your instructors, counselors, or use campus wellness resources.
                </>
              ) : managingCount === wellbeingIndicators.length ? (
                <>
                  You're managing well across all your classes. Keep monitoring your stress levels and maintain your self-care routines.
                </>
              ) : (
                <>
                  You're thriving in {thrivingCount} {thrivingCount === 1 ? 'class' : 'classes'}! 
                  Your positive wellbeing is supporting your academic success. Keep it up!
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
