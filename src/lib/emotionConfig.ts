import { getSentimentColor as getDesignSystemColor } from './design-system';

export type EmotionName =
  | 'Scared' | 'Sad' | 'Lonely'
  | 'Frustrated' | 'Worried' | 'Nervous'
  | 'Tired' | 'Bored' | 'Careless'
  | 'Peaceful' | 'Relieved' | 'Content'
  | 'Hopeful' | 'Proud'
  | 'Happy' | 'Excited' | 'Inspired';

export type SentimentValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmotionConfig {
  name: EmotionName;
  sentimentValue: SentimentValue;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
}

export const EMOTION_SENTIMENT_MAP: Record<EmotionName, SentimentValue> = {
  'Scared': 1,
  'Sad': 1,
  'Lonely': 1,
  'Frustrated': 2,
  'Worried': 2,
  'Nervous': 2,
  'Tired': 3,
  'Bored': 3,
  'Careless': 3,
  'Peaceful': 4,
  'Relieved': 4,
  'Content': 4,
  'Hopeful': 5,
  'Proud': 5,
  'Happy': 6,
  'Excited': 6,
  'Inspired': 6,
};

export const EMOTIONS_BY_SENTIMENT: Record<SentimentValue, EmotionName[]> = {
  1: ['Scared', 'Sad', 'Lonely'],
  2: ['Frustrated', 'Worried', 'Nervous'],
  3: ['Tired', 'Bored', 'Careless'],
  4: ['Peaceful', 'Relieved', 'Content'],
  5: ['Hopeful', 'Proud'],
  6: ['Happy', 'Excited', 'Inspired'],
};

export const EMOTION_CONFIGS: EmotionConfig[] = [
  // Sentiment 6: Excellent - Vibrant Teal/Cyan
  { name: 'Happy', sentimentValue: 6, icon: 'Smile', color: 'text-teal-600', bgColor: 'bg-teal-100', borderColor: 'border-teal-400', category: 'Excellent' },
  { name: 'Excited', sentimentValue: 6, icon: 'Zap', color: 'text-cyan-600', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400', category: 'Excellent' },
  { name: 'Inspired', sentimentValue: 6, icon: 'Sparkles', color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-500', category: 'Excellent' },

  // Sentiment 5: Very Positive - Cyan/Sky
  { name: 'Hopeful', sentimentValue: 5, icon: 'Sun', color: 'text-cyan-600', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400', category: 'Very Positive' },
  { name: 'Proud', sentimentValue: 5, icon: 'Award', color: 'text-sky-600', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', category: 'Very Positive' },

  // Sentiment 4: Positive - Blue/Indigo
  { name: 'Peaceful', sentimentValue: 4, icon: 'Cloud', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', category: 'Positive' },
  { name: 'Relieved', sentimentValue: 4, icon: 'CloudRain', color: 'text-indigo-600', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400', category: 'Positive' },
  { name: 'Content', sentimentValue: 4, icon: 'Coffee', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-500', category: 'Positive' },

  // Sentiment 3: Neutral - Gray/Slate
  { name: 'Tired', sentimentValue: 3, icon: 'Moon', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', category: 'Neutral' },
  { name: 'Bored', sentimentValue: 3, icon: 'Meh', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', category: 'Neutral' },
  { name: 'Careless', sentimentValue: 3, icon: 'Wind', color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', category: 'Neutral' },

  // Sentiment 2: Negative - Orange/Amber
  { name: 'Nervous', sentimentValue: 2, icon: 'TrendingDown', color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-400', category: 'Negative' },
  { name: 'Frustrated', sentimentValue: 2, icon: 'Frown', color: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-400', category: 'Negative' },
  { name: 'Worried', sentimentValue: 2, icon: 'AlertCircle', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-500', category: 'Negative' },

  // Sentiment 1: Very Negative - Red/Rose
  { name: 'Scared', sentimentValue: 1, icon: 'AlertTriangle', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-400', category: 'Very Negative' },
  { name: 'Sad', sentimentValue: 1, icon: 'Frown', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-500', category: 'Very Negative' },
  { name: 'Lonely', sentimentValue: 1, icon: 'UserX', color: 'text-rose-600', bgColor: 'bg-rose-100', borderColor: 'border-rose-400', category: 'Very Negative' },
];

export function getEmotionSentimentValue(emotion: string): SentimentValue {
  return EMOTION_SENTIMENT_MAP[emotion as EmotionName] || 3;
}

export function getSentimentLabel(value: number): string {
  if (value <= 1.5) return 'Very Negative';
  if (value <= 2.5) return 'Negative';
  if (value <= 3.5) return 'Neutral';
  if (value <= 4.5) return 'Positive';
  if (value <= 5.5) return 'Very Positive';
  return 'Excellent';
}

// Use design system colors for consistent, supportive emotion representation
export function getSentimentColor(value: number): { gradient: string; text: string; bg: string } {
  const colors = getDesignSystemColor(value);
  return {
    gradient: colors.gradient,
    text: colors.text,
    bg: colors.bg
  };
}

export function calculateAverageSentiment(emotions: string[]): number {
  if (emotions.length === 0) return 3;

  const total = emotions.reduce((sum, emotion) => {
    return sum + getEmotionSentimentValue(emotion);
  }, 0);

  return total / emotions.length;
}

export function getSentimentDistribution(emotions: string[]): Record<SentimentValue, number> {
  const distribution: Record<SentimentValue, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  };

  emotions.forEach(emotion => {
    const value = getEmotionSentimentValue(emotion);
    distribution[value]++;
  });

  return distribution;
}
