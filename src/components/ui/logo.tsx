import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  showIcon?: boolean;
}

export function Logo({ className, showIcon = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/hapi-logo.jpg" 
        alt="Hapi AI Logo" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}

