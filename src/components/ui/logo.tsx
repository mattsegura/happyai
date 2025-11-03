import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  showIcon?: boolean;
}

export function Logo({ className, showIcon = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className="relative">
          {/* Gradient background circle */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 blur-sm opacity-70" />
          
          {/* Icon container */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 shadow-lg">
            <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
      )}
      
      {/* Text logo */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
          Hapi
        </span>
        <span className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          AI
        </span>
      </div>
    </div>
  );
}

