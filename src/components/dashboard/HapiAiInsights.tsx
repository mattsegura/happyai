import { Brain, Sparkles, MessageSquare } from 'lucide-react';
import { generateQuickInsight, type AnalyticsData } from '../../lib/analyticsPrompts';

interface HapiAiInsightsProps {
  analyticsData: AnalyticsData;
  onTalkMore: () => void;
}

export function HapiAiInsights({ analyticsData, onTalkMore }: HapiAiInsightsProps) {
  const insight = generateQuickInsight(analyticsData);

  return (
    <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 rounded-3xl p-6 border-2 border-cyan-200 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl -ml-24 -mb-24"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent flex items-center space-x-2">
                <span>Hapi AI Insights</span>
                <Sparkles className="w-5 h-5 text-cyan-500" />
              </h3>
              <p className="text-xs text-cyan-600 font-medium">AI-powered wellness summary</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-md">
          <p className="text-gray-800 leading-relaxed text-base">
            {insight}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-cyan-700">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Personalized for you</span>
          </div>

          <button
            onClick={onTalkMore}
            className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Talk More</span>
            <Sparkles className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-cyan-200/50">
          <p className="text-xs text-gray-600 text-center">
            Want deeper insights? Click "Talk More" for a comprehensive AI analysis of your wellness journey
          </p>
        </div>
      </div>
    </div>
  );
}
