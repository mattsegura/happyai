import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface SleekPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badges?: Array<{
    label: string;
    value: string | number;
    color?: 'primary' | 'green' | 'orange' | 'red' | 'purple' | 'blue';
    icon?: LucideIcon;
  }>;
}

export function SleekPageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions,
  badges = [] 
}: SleekPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-b border-white/20 shadow-sm"
    >
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Title & Icon */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions & Notifications */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
          </div>
        </div>

        {/* Badges Row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border shadow-sm flex items-center gap-1.5',
                    badge.color === 'primary' && 'bg-primary/10 border-primary/30 text-primary',
                    badge.color === 'green' && 'bg-green-100/80 border-green-300 text-green-700',
                    badge.color === 'orange' && 'bg-orange-100/80 border-orange-300 text-orange-700',
                    badge.color === 'red' && 'bg-red-100/80 border-red-300 text-red-700',
                    badge.color === 'purple' && 'bg-purple-100/80 border-purple-300 text-purple-700',
                    badge.color === 'blue' && 'bg-blue-100/80 border-blue-300 text-blue-700',
                    !badge.color && 'bg-white/60 border-white/40 text-foreground'
                  )}
                >
                  {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                  <span>{badge.label}:</span>
                  <span className="font-semibold">{badge.value}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

