import { HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, position = 'top' }) => {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="More information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    </Tooltip>
  );
};
