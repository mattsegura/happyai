export interface AnalyticsData {
  personalAverage: number;
  personalTrend: 'up' | 'down';
  classAverage: number;
  recentEmotions: string[];
  timeRange: 'week' | 'month' | 'custom';
  topClassEmotions: Array<{ emotion: string; count: number }>;
}

export function generateAnalyticsPrompt(data: AnalyticsData): string {
  const trendText = data.personalTrend === 'up' ? 'improving' : 'declining';
  const comparisonText = data.personalAverage > data.classAverage
    ? 'above your classmates average'
    : data.personalAverage < data.classAverage
    ? 'slightly below your classmates average'
    : 'right around your classmates average';

  const timeText = data.timeRange === 'week'
    ? 'this past week'
    : data.timeRange === 'month'
    ? 'this past month'
    : 'the selected time period';

  return `I'd love to understand more about my emotional wellness journey. Here's what my analytics show:

Over ${timeText}, my average sentiment has been ${data.personalAverage.toFixed(1)}/6.0, which is ${comparisonText} of ${data.classAverage.toFixed(1)}/6.0. My trend is ${trendText}.

I've been experiencing emotions like: ${data.recentEmotions.slice(0, 3).join(', ')}.

Meanwhile, my classmates are mostly feeling: ${data.topClassEmotions.map(e => e.emotion).slice(0, 3).join(', ')}.

Can you give me a deep dive into what these patterns mean? I'd love insights on:
1. What my emotional journey says about my wellbeing
2. How I compare to my peers and what that means
3. Specific strategies to maintain or improve my emotional wellness
4. Any patterns you notice that I should be aware of
5. Encouragement and actionable next steps

Please be detailed and supportive!`;
}

export function generateQuickInsight(data: AnalyticsData): string {
  const { personalAverage, personalTrend, classAverage, recentEmotions } = data;

  if (personalTrend === 'up' && personalAverage >= 4.5) {
    return `Your emotional wellness is thriving! You're averaging ${personalAverage.toFixed(1)}/6.0 and trending upward. You've been feeling ${recentEmotions[0]?.toLowerCase()}, ${recentEmotions[1]?.toLowerCase()}, and ${recentEmotions[2]?.toLowerCase()}, which shows a positive pattern. Keep up the great work!`;
  }

  if (personalTrend === 'up' && personalAverage >= 3.5) {
    return `You're on an upward trajectory! Your ${personalAverage.toFixed(1)}/6.0 average shows improvement, and you're experiencing emotions like ${recentEmotions[0]?.toLowerCase()} and ${recentEmotions[1]?.toLowerCase()}. This positive momentum is worth celebrating!`;
  }

  if (personalTrend === 'down' && personalAverage < 3.5) {
    return `I notice you've been experiencing some challenges lately, with emotions like ${recentEmotions[0]?.toLowerCase()} and ${recentEmotions[1]?.toLowerCase()}. Your ${personalAverage.toFixed(1)}/6.0 average suggests this might be a good time to explore supportive strategies. Remember, reaching out is a sign of strength!`;
  }

  if (personalAverage > classAverage + 0.5) {
    return `You're doing wonderfully! Your ${personalAverage.toFixed(1)}/6.0 sentiment is notably above your classmates' ${classAverage.toFixed(1)}/6.0 average. Your positive energy, reflected in emotions like ${recentEmotions[0]?.toLowerCase()}, is something to be proud of!`;
  }

  if (personalAverage < classAverage - 0.5) {
    return `Your ${personalAverage.toFixed(1)}/6.0 average is a bit below your classmates' ${classAverage.toFixed(1)}/6.0. You've been feeling ${recentEmotions[0]?.toLowerCase()} and ${recentEmotions[1]?.toLowerCase()}, and that's completely valid. Let's explore ways to support your emotional wellness journey together.`;
  }

  return `Your emotional wellness journey shows a ${personalAverage.toFixed(1)}/6.0 average, right in line with your classmates at ${classAverage.toFixed(1)}/6.0. You've been experiencing ${recentEmotions[0]?.toLowerCase()}, ${recentEmotions[1]?.toLowerCase()}, and ${recentEmotions[2]?.toLowerCase()}. Your journey is unique and meaningful!`;
}
