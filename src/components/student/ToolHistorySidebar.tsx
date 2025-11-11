import { motion } from 'framer-motion';
import { Clock, BookOpen, Folder } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToolHistoryItem, formatRelativeDate, formatDuration } from '../../lib/mockData/toolHistory';

interface ToolHistorySidebarProps {
  items: ToolHistoryItem[];
  title: string;
  onSelectItem?: (item: ToolHistoryItem) => void;
  selectedItemId?: string;
}

export function ToolHistorySidebar({ items, title, onSelectItem, selectedItemId }: ToolHistorySidebarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-80 border-r border-border/60 bg-card/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/60">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-600" />
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectItem?.(item)}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-all',
              selectedItemId === item.id
                ? 'bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-400'
                : 'bg-background hover:bg-muted/50 border-2 border-transparent'
            )}
          >
            {/* Title */}
            <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-2">
              {item.title}
            </h4>

            {/* Class Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: item.classColor }}
              >
                {item.className}
              </span>
            </div>

            {/* Study Plan (if linked) */}
            {item.studyPlanTitle && (
              <div className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 mb-2">
                <BookOpen className="w-3 h-3" />
                <span className="line-clamp-1">{item.studyPlanTitle}</span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{formatRelativeDate(item.createdAt)}</span>
              {item.itemCount && (
                <span className="font-medium">{item.itemCount} items</span>
              )}
              {item.duration && (
                <span className="font-medium">{formatDuration(item.duration)}</span>
              )}
              {item.size && (
                <span className="font-medium">{item.size}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer Stats (optional) */}
      <div className="p-3 border-t border-border/60 bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total generated:</span>
          <span className="font-semibold text-foreground">{items.length}</span>
        </div>
      </div>
    </div>
  );
}

