import { useState } from 'react';
import * as Icons from 'lucide-react';
import { EMOTION_CONFIGS, EmotionName } from '../../lib/emotionConfig';

export type Emotion = {
  name: EmotionName;
  sentimentValue: number;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
};

function getIconComponent(iconName: string) {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon className="w-5 h-5 sm:w-7 sm:h-7" /> : <Icons.Smile className="w-5 h-5 sm:w-7 sm:h-7" />;
}

export const emotions: Emotion[] = EMOTION_CONFIGS.map(config => ({
  name: config.name,
  sentimentValue: config.sentimentValue,
  icon: getIconComponent(config.icon),
  color: config.color,
  bgColor: config.bgColor,
  borderColor: config.borderColor,
  category: config.category,
}));

interface EmotionSelectorProps {
  onSelect: (emotion: string, sentimentValue: number) => void;
  selected: string | null;
}

export function EmotionSelector({ onSelect, selected }: EmotionSelectorProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full">
      {emotions.map((emotion) => {
        const isSelected = selected === emotion.name;
        const isHovered = hoveredEmotion === emotion.name;

        return (
          <button
            key={emotion.name}
            onClick={() => onSelect(emotion.name, emotion.sentimentValue)}
            onMouseEnter={() => setHoveredEmotion(emotion.name)}
            onMouseLeave={() => setHoveredEmotion(null)}
            className={`
              relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-3 transition-all duration-300
              bg-blue-50 border-blue-200 min-h-[60px] sm:min-h-[76px]
              ${isSelected ? 'border-4 border-blue-500 scale-105 shadow-lg' : 'border-2'}
              ${isHovered && !isSelected ? 'scale-105 shadow-md border-blue-300' : ''}
              hover:shadow-lg transform active:scale-95
            `}
          >
            <div className={`flex flex-col items-center justify-center space-y-0.5 sm:space-y-1.5 h-full ${emotion.color}`}>
              {emotion.icon}
              <span className="text-[10px] sm:text-xs font-semibold leading-tight">{emotion.name}</span>
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
