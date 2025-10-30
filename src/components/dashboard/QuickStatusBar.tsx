import { TrendingUp, TrendingDown, Flame, Star, Trophy, Heart } from 'lucide-react';
import { mockClassRiskIndicators, mockClassWellbeingIndicators } from '../../lib/mockData';

interface QuickStatusBarProps {
  streak: number;
  pointsToday: number;
  rank: number;
  rankTrend: 'up' | 'down' | 'same';
  level: number;
  levelProgress: number;
}

export function QuickStatusBar({
  streak,
  pointsToday,
  rank,
  rankTrend,
  level,
  levelProgress,
}: QuickStatusBarProps) {
  // Calculate academic status
  const riskIndicators = mockClassRiskIndicators;
  const highRiskCount = riskIndicators.filter(r => r.risk_level === 'high').length;
  const overallGPA = 3.2;
  
  const academicStatus = highRiskCount > 0 ? 'At Risk' : 'On Track';
  const academicColor = highRiskCount > 0 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-green-600 dark:text-green-400';

  // Calculate wellbeing status
  const wellbeingIndicators = mockClassWellbeingIndicators;
  const strugglingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'struggling').length;
  const thrivingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'thriving').length;
  
  const wellbeingStatus = strugglingCount > 0 ? 'Struggling' : thrivingCount > 0 ? 'Thriving' : 'Managing';
  const wellbeingColor = strugglingCount > 0
    ? 'text-red-600 dark:text-red-400'
    : thrivingCount > 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-yellow-600 dark:text-yellow-400';

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Top Row: Streak & Points */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-2xl font-black text-foreground">{streak}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-border"></div>
          
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-black text-foreground">+{pointsToday}</div>
              <div className="text-xs text-muted-foreground">points today</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-foreground">#{rank}</span>
                {rankTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {rankTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
              <div className="text-xs text-muted-foreground">rank</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-border"></div>
          
          <div>
            <div className="text-2xl font-black text-foreground">Lv {level}</div>
            <div className="mt-1 h-1.5 w-20 rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Academic & Wellbeing Status */}
      <div className="flex items-center gap-3 border-t border-border pt-3">
        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">ACADEMIC</span>
            <span className={`text-xs font-bold ${academicColor}`}>{academicStatus}</span>
          </div>
          <div className="text-xl font-black text-foreground">{overallGPA.toFixed(2)} GPA</div>
          {highRiskCount > 0 && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              {highRiskCount} {highRiskCount === 1 ? 'class' : 'classes'} at risk
            </div>
          )}
        </div>

        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">WELLBEING</span>
            <span className={`text-xs font-bold ${wellbeingColor}`}>{wellbeingStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className={`h-5 w-5 ${wellbeingColor}`} />
            <span className="text-xl font-black text-foreground">
              {((wellbeingIndicators.reduce((sum, w) => sum + w.average_mood, 0) / wellbeingIndicators.length) || 0).toFixed(1)}/7
            </span>
          </div>
          {strugglingCount > 0 && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              Struggling in {strugglingCount} {strugglingCount === 1 ? 'class' : 'classes'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
