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
  { name: 'Happy', sentimentValue: 6, icon: 'Smile', color: 'text-cyan-600', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400', category: 'Excellent' },
  { name: 'Tired', sentimentValue: 3, icon: 'Moon', color: 'text-cyan-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', category: 'Neutral' },
  { name: 'Nervous', sentimentValue: 2, icon: 'TrendingDown', color: 'text-cyan-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', category: 'Negative' },
  { name: 'Peaceful', sentimentValue: 4, icon: 'Cloud', color: 'text-cyan-600', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', category: 'Positive' },
  { name: 'Scared', sentimentValue: 1, icon: 'AlertTriangle', color: 'text-cyan-600', bgColor: 'bg-red-100', borderColor: 'border-red-400', category: 'Very Negative' },
  { name: 'Excited', sentimentValue: 6, icon: 'Zap', color: 'text-cyan-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', category: 'Excellent' },
  { name: 'Bored', sentimentValue: 3, icon: 'Meh', color: 'text-cyan-600', bgColor: 'bg-teal-100', borderColor: 'border-teal-400', category: 'Neutral' },
  { name: 'Hopeful', sentimentValue: 5, icon: 'Sun', color: 'text-cyan-600', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400', category: 'Very Positive' },
  { name: 'Sad', sentimentValue: 1, icon: 'Frown', color: 'text-cyan-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', category: 'Very Negative' },
  { name: 'Relieved', sentimentValue: 4, icon: 'CloudRain', color: 'text-cyan-600', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400', category: 'Positive' },
  { name: 'Frustrated', sentimentValue: 2, icon: 'Frown', color: 'text-cyan-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-400', category: 'Negative' },
  { name: 'Inspired', sentimentValue: 6, icon: 'Sparkles', color: 'text-cyan-600', bgColor: 'bg-teal-100', borderColor: 'border-teal-400', category: 'Excellent' },
  { name: 'Worried', sentimentValue: 2, icon: 'AlertCircle', color: 'text-cyan-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', category: 'Negative' },
  { name: 'Content', sentimentValue: 4, icon: 'Coffee', color: 'text-cyan-600', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', category: 'Positive' },
  { name: 'Lonely', sentimentValue: 1, icon: 'UserX', color: 'text-cyan-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', category: 'Very Negative' },
  { name: 'Careless', sentimentValue: 3, icon: 'Wind', color: 'text-cyan-600', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', category: 'Neutral' },
  { name: 'Proud', sentimentValue: 5, icon: 'Award', color: 'text-cyan-600', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400', category: 'Very Positive' },
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

export function getSentimentColor(value: number): { gradient: string; text: string; bg: string } {
  if (value <= 1.5) return {
    gradient: 'from-red-400 to-red-600',
    text: 'text-red-600',
    bg: 'bg-red-100'
  };
  if (value <= 2.5) return {
    gradient: 'from-sky-400 to-blue-600',
    text: 'text-blue-600',
    bg: 'bg-blue-100'
  };
  if (value <= 3.5) return {
    gradient: 'from-slate-400 to-gray-600',
    text: 'text-gray-600',
    bg: 'bg-gray-100'
  };
  if (value <= 4.5) return {
    gradient: 'from-blue-400 to-blue-600',
    text: 'text-blue-600',
    bg: 'bg-blue-100'
  };
  if (value <= 5.5) return {
    gradient: 'from-cyan-400 to-cyan-600',
    text: 'text-cyan-600',
    bg: 'bg-cyan-100'
  };
  return {
    gradient: 'from-teal-400 to-cyan-600',
    text: 'text-teal-600',
    bg: 'bg-teal-100'
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
