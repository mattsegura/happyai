import { Brain, Sparkles, MessageSquare } from 'lucide-react';
import { generateQuickInsight, type AnalyticsData } from '../../lib/analyticsPrompts';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

interface HapiAiInsightsProps {
  analyticsData: AnalyticsData;
  onTalkMore: () => void;
}

export function HapiAiInsights({ analyticsData, onTalkMore }: HapiAiInsightsProps) {
  const insight = generateQuickInsight(analyticsData);

  return (
    <Card padding="none" className="overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-accent-50/40 dark:from-slate-800 dark:via-primary-900/10 dark:to-accent-900/10 shadow-xl border-primary-200 dark:border-primary-800">
      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-2xl">
              <Brain className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">Hapi Insight</h3>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mt-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
                Refreshed moments ago
              </p>
            </div>
          </div>
          <Sparkles className="h-6 w-6 text-primary-500 dark:text-primary-400 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="px-5 sm:px-6 py-4">
        <div className="relative">
          <div className="absolute -left-2 top-0 h-full w-1.5 bg-gradient-to-b from-primary-500 to-accent-600 rounded-full shadow-lg"></div>
          <p className="pl-5 text-base sm:text-lg leading-relaxed font-medium text-foreground">
            {insight}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-3 px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse shadow-lg shadow-primary-500/50" />
          Personalized snapshot
        </span>
        <Button
          onClick={onTalkMore}
          variant="accent"
          size="sm"
          leftIcon={<MessageSquare className="h-4 w-4" />}
          className="ml-auto shadow-lg"
        >
          Continue in chat
        </Button>
      </CardFooter>
    </Card>
  );
}
