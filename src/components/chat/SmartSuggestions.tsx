import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SmartSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SmartSuggestions({ suggestions, onSelect }: SmartSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Suggested for you</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(suggestion)}
              className="group p-4 rounded-xl backdrop-blur-xl bg-white/60 hover:bg-white/80 border border-white/40 shadow-sm hover:shadow-md transition-all text-left"
            >
              <p className="text-sm text-foreground font-medium line-clamp-2">
                {suggestion}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">Tap to ask</span>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

