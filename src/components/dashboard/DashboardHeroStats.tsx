import { TrendingUp, Flame, Star, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  delay?: number;
}

function StatCard({ label, value, subtitle, icon, gradient, trend, trendValue, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group relative overflow-hidden rounded-lg ${gradient} p-3 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-lg transition-all duration-300 group-hover:scale-150" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-black/10 blur-lg" />
      
      <div className="relative">
        <div className="mb-2 flex items-start justify-between">
          <div className="rounded-md bg-white/20 p-1.5 backdrop-blur-sm">
            {icon}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              trend === 'up' ? 'bg-white/20' : 'bg-black/20'
            }`}>
              {trend === 'up' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              {trendValue}
            </div>
          )}
        </div>
        
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-90">
          {label}
        </div>
        
        <div className="mb-0.5 text-2xl font-black leading-none">
          {value}
        </div>
        
        <div className="text-[10px] font-medium opacity-80">
          {subtitle}
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardHeroStats() {
  const stats = [
    {
      label: 'Streak',
      value: '7',
      subtitle: 'days active',
      icon: <Flame className="h-6 w-6" />,
      gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
      trend: 'up' as const,
      trendValue: '+2',
      delay: 0,
    },
    {
      label: 'Points',
      value: '850',
      subtitle: 'total earned',
      icon: <Star className="h-6 w-6" />,
      gradient: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
      trend: 'up' as const,
      trendValue: '+45',
      delay: 0.1,
    },
    {
      label: 'Level',
      value: '9',
      subtitle: '50/100 to level 10',
      icon: <Zap className="h-6 w-6" />,
      gradient: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
      trend: 'up' as const,
      trendValue: '+1',
      delay: 0.2,
    },
    {
      label: 'Rank',
      value: '#12',
      subtitle: 'in your cohort',
      icon: <TrendingUp className="h-6 w-6" />,
      gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500',
      trend: 'up' as const,
      trendValue: '+3',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
