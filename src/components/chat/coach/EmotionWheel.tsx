import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { useState } from 'react';

interface EmotionWheelProps {
  onClose: () => void;
  onEmotionSelect: (emotion: string) => void;
}

const emotions = [
  { name: 'Happy', color: 'bg-yellow-400', description: 'Joyful, content, cheerful' },
  { name: 'Sad', color: 'bg-blue-400', description: 'Down, disappointed, low' },
  { name: 'Angry', color: 'bg-red-400', description: 'Frustrated, irritated, upset' },
  { name: 'Anxious', color: 'bg-purple-400', description: 'Worried, nervous, tense' },
  { name: 'Excited', color: 'bg-orange-400', description: 'Energized, enthusiastic, eager' },
  { name: 'Calm', color: 'bg-green-400', description: 'Peaceful, relaxed, serene' },
  { name: 'Confused', color: 'bg-gray-400', description: 'Uncertain, puzzled, unclear' },
  { name: 'Grateful', color: 'bg-pink-400', description: 'Thankful, appreciative, blessed' },
];

/**
 * EmotionWheel - Interactive emotion identifier
 */
export function EmotionWheel({ onClose, onEmotionSelect }: EmotionWheelProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <Card className="p-6 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">How are you feeling?</h3>
              <p className="text-sm text-muted-foreground mt-1">Select the emotion that resonates most</p>
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

          {/* Emotion Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {emotions.map((emotion, index) => (
              <motion.button
                key={emotion.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEmotionSelect(emotion.name)}
                onMouseEnter={() => setHoveredEmotion(emotion.name)}
                onMouseLeave={() => setHoveredEmotion(null)}
                className={`p-4 rounded-xl ${emotion.color} text-white font-medium transition-all shadow-md hover:shadow-lg`}
              >
                <div className="text-lg">{emotion.name}</div>
                {hoveredEmotion === emotion.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs mt-2 text-white/90"
                  >
                    {emotion.description}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Helper Text */}
          <div className="text-xs text-muted-foreground text-center">
            It's okay if you feel multiple emotions - we'll explore them together
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

