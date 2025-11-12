import { Brain, FileText, Clock, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import { motion } from 'framer-motion';

interface InlineStudyToolsProps {
  onToolSelect: (tool: string) => void;
}

/**
 * InlineStudyTools - Quick action buttons for generating study materials
 */
export function InlineStudyTools({ onToolSelect }: InlineStudyToolsProps) {
  const tools = [
    { id: 'flashcards', icon: Brain, label: 'Flashcards', color: 'from-blue-500 to-cyan-500' },
    { id: 'quiz', icon: FileText, label: 'Quiz', color: 'from-cyan-500 to-blue-500' },
    { id: 'study-plan', icon: Clock, label: 'Study Plan', color: 'from-blue-600 to-cyan-600' },
    { id: 'summarize', icon: Sparkles, label: 'Summarize', color: 'from-cyan-600 to-blue-600' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToolSelect(tool.id)}
            className="group hover:shadow-lg transition-all"
          >
            <div className={`w-5 h-5 rounded bg-gradient-to-br ${tool.color} flex items-center justify-center mr-2`}>
              <tool.icon className="w-3 h-3 text-white" />
            </div>
            {tool.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

