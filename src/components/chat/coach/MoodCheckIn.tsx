import { useState } from 'react';
import { X, Smile, Frown, Meh } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Textarea } from '../../ui/textarea';

interface MoodCheckInProps {
  onClose: () => void;
  onComplete: (mood: number, notes: string) => void;
}

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳', '🌟'];

/**
 * MoodCheckIn - Quick mood tracker with scale and notes
 */
export function MoodCheckIn({ onClose, onComplete }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const handleComplete = () => {
    onComplete(selectedMood, notes);
  };

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
        className="w-full max-w-md"
      >
        <Card className="p-6 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Quick Mood Check-In</h3>
              <p className="text-sm text-muted-foreground mt-1">How are you feeling right now?</p>
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

          {/* Mood Scale */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                key={selectedMood}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl"
              >
                {moodEmojis[selectedMood - 1]}
              </motion.div>
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={selectedMood}
                onChange={(e) => setSelectedMood(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-purple-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-purple-500
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Very Low</span>
                <span className="font-semibold text-purple-600">{selectedMood}/10</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Want to add any notes? (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's contributing to how you feel? Any specific thoughts or events?"
              className="resize-none h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Complete Check-In
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

