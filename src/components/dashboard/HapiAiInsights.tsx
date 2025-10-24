import { Brain, Sparkles, MessageSquare } from 'lucide-react';
import { generateQuickInsight, type AnalyticsData } from '../../lib/analyticsPrompts';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';

interface HapiAiInsightsProps {
  analyticsData: AnalyticsData;
  onTalkMore: () => void;
}

export function HapiAiInsights({ analyticsData, onTalkMore }: HapiAiInsightsProps) {
  const insight = generateQuickInsight(analyticsData);

  return (
    <Card padding="md" className="bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-800 dark:to-primary-900/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapi Insight</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Refreshed moments ago
              </p>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-primary-500 dark:text-primary-400 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <div className="absolute -left-2 top-0 h-full w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full"></div>
          <p className="pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {insight}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400">
          <span className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
          Personalized snapshot
        </span>
        <Button
          onClick={onTalkMore}
          variant="secondary"
          size="sm"
          leftIcon={<MessageSquare className="h-4 w-4" />}
          className="ml-auto"
        >
          Continue in chat
        </Button>
      </CardFooter>
    </Card>
  );
}
