import { X, Pin, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface QuickReferenceProps {
  pinnedItems: string[];
  onRemoveItem: (index: number) => void;
  onClose: () => void;
}

/**
 * QuickReference - Sidebar for pinned formulas, definitions, and important notes
 */
export function QuickReference({ pinnedItems, onRemoveItem, onClose }: QuickReferenceProps) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 border-l border-blue-200 dark:border-blue-900/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-900/50">
        <div className="flex items-center gap-2">
          <Pin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Quick Reference</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Pinned Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pinnedItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Pin className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No pinned items yet</p>
            <p className="text-xs mt-1">Pin important formulas or definitions during your study session</p>
          </div>
        ) : (
          pinnedItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 group relative">
                <p className="text-sm pr-8">{item}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(index)}
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10">
        <div className="text-xs text-muted-foreground text-center">
          {pinnedItems.length} {pinnedItems.length === 1 ? 'item' : 'items'} pinned
        </div>
      </div>
    </motion.div>
  );
}

