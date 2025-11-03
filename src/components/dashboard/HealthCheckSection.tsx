import { useState } from 'react';
import { GraduationCap, Heart, TrendingUp, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// TODO: Fetch from Supabase
const mockClassRiskIndicators: any[] = [];
const mockClassWellbeingIndicators: any[] = [];

export function HealthCheckSection() {
  const [expandedSection, setExpandedSection] = useState<'academic' | 'wellbeing' | null>(null);
  
  const riskIndicators = mockClassRiskIndicators;
  const wellbeingIndicators = mockClassWellbeingIndicators;

  const highRiskCount = riskIndicators.filter(r => r.risk_level === 'high').length;
  const mediumRiskCount = riskIndicators.filter(r => r.risk_level === 'medium').length;
  const lowRiskCount = riskIndicators.filter(r => r.risk_level === 'low').length;
  const overallGPA = 3.2;

  const strugglingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'struggling').length;
  const managingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'managing').length;
  const thrivingCount = wellbeingIndicators.filter(w => w.wellbeing_level === 'thriving').length;
  const avgMood = wellbeingIndicators.reduce((sum, w) => sum + w.average_mood, 0) / wellbeingIndicators.length;

  const getAcademicStatus = () => {
    if (highRiskCount > 0) return { label: 'Needs Attention', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' };
    if (mediumRiskCount > 0) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' };
    return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' };
  };

  const getWellbeingStatus = () => {
    if (strugglingCount > 0) return { label: 'Struggling', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' };
    if (managingCount > 0) return { label: 'Managing', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' };
    return { label: 'Thriving', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' };
  };

  const academicStatus = getAcademicStatus();
  const wellbeingStatus = getWellbeingStatus();

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-base font-bold text-foreground">Health Check</h2>
      </div>

      {/* Stacked Cards */}
      <div className="space-y-2">
        {/* Academic Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden rounded-xl border-2 border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-transparent dark:from-blue-950/20 opacity-50" />
          
          <div className="relative p-3">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-1.5">
                  <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Academic</h3>
                </div>
              </div>
              <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${academicStatus.bg} ${academicStatus.color}`}>
                {academicStatus.label}
              </div>
            </div>

            {/* Compact Stats Row */}
            <div className="mb-2 flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {overallGPA.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground">GPA</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-red-600 dark:text-red-400">{highRiskCount}</div>
                <div className="text-[10px] text-muted-foreground">High Risk</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{mediumRiskCount}</div>
                <div className="text-[10px] text-muted-foreground">Medium</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-green-600 dark:text-green-400">{lowRiskCount}</div>
                <div className="text-[10px] text-muted-foreground">On Track</div>
              </div>
            </div>

            {/* Compact Risk Breakdown */}
            <div className="space-y-1.5">
              {(highRiskCount > 0 || mediumRiskCount > 0) && (
                <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 p-1.5 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                      {highRiskCount > 0 && `${highRiskCount} high`}
                      {highRiskCount > 0 && mediumRiskCount > 0 && ', '}
                      {mediumRiskCount > 0 && `${mediumRiskCount} medium risk`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => setExpandedSection(expandedSection === 'academic' ? null : 'academic')}
              className="mt-2 w-full flex items-center justify-center gap-1 rounded-md bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-blue-700 dark:hover:bg-blue-800"
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        {/* Wellbeing Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative overflow-hidden rounded-xl border-2 border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-transparent to-transparent dark:from-rose-950/20 opacity-50" />
          
          <div className="relative p-3">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 p-1.5">
                  <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Wellbeing</h3>
                </div>
              </div>
              <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${wellbeingStatus.bg} ${wellbeingStatus.color}`}>
                {wellbeingStatus.label}
              </div>
            </div>

            {/* Compact Stats Row */}
            <div className="mb-2 flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {avgMood.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground">Mood /7</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-red-600 dark:text-red-400">{strugglingCount}</div>
                <div className="text-[10px] text-muted-foreground">Struggling</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{managingCount}</div>
                <div className="text-[10px] text-muted-foreground">Managing</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-green-600 dark:text-green-400">{thrivingCount}</div>
                <div className="text-[10px] text-muted-foreground">Thriving</div>
              </div>
            </div>

            {/* Compact Wellbeing Breakdown */}
            <div className="space-y-1.5">
              {strugglingCount > 0 && (
                <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-1.5 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                    <span className="text-[10px] font-semibold text-red-700 dark:text-red-300">
                      Struggling in {strugglingCount} {strugglingCount === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => setExpandedSection(expandedSection === 'wellbeing' ? null : 'wellbeing')}
              className="mt-2 w-full flex items-center justify-center gap-1 rounded-md bg-rose-600 dark:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-rose-700 dark:hover:bg-rose-800"
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
