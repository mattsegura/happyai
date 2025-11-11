import { motion } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';

interface StressIndicatorsProps {
  dateRange: string;
}

export function StressIndicators({ dateRange }: StressIndicatorsProps) {
  const stressLevel = 58; // 0-100

  const getStressColor = (level: number) => {
    if (level < 30) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Low' };
    if (level < 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Moderate' };
    if (level < 85) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'High' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Critical' };
  };

  const stressInfo = getStressColor(stressLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Stress Level</h3>
        <Activity className="h-5 w-5 text-primary" />
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <motion.circle
              cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - stressLevel / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={stressInfo.text}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">{stressLevel}</div>
            <div className={`text-xs font-medium ${stressInfo.text}`}>{stressInfo.label}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="text-center">
          <div className="font-medium text-foreground">Workload</div>
          <div className="text-orange-600 font-bold">42%</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-foreground">Deadlines</div>
          <div className="text-red-600 font-bold">65%</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-foreground">Mood</div>
          <div className="text-yellow-600 font-bold">38%</div>
        </div>
      </div>
    </motion.div>
  );
}

