import { Brain, Sparkles, MessageSquare } from 'lucide-react';
import { generateQuickInsight, type AnalyticsData } from '../../lib/analyticsPrompts';

interface HapiAiInsightsProps {
  analyticsData: AnalyticsData;
  onTalkMore: () => void;
}

export function HapiAiInsights({ analyticsData, onTalkMore }: HapiAiInsightsProps) {
  const insight = generateQuickInsight(analyticsData);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Hapi insight</h3>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Refreshed moments ago</p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-primary-500" />
      </header>

      <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
        {insight}
      </p>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="inline-flex items-center gap-2 text-primary-600">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-400" /> Personalized snapshot
        </span>
        <button
          onClick={onTalkMore}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
        >
          <MessageSquare className="h-4 w-4" /> Continue in chat
        </button>
      </footer>
    </section>
  );
}
