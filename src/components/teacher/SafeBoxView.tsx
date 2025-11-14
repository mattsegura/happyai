/**
 * SafeBox View - Teacher Dashboard
 *
 * One-sided anonymous feedback system where students can submit feedback
 * and teachers receive AI-generated daily summaries with optional individual message viewing.
 * 
 * Features:
 * - Students submit anonymous messages (no teacher replies)
 * - AI daily summaries for quick insights
 * - Optional individual message viewing
 * - Analytics and metrics
 */

import { useState } from 'react';
import { Shield, Info, Brain, MessageSquare, BarChart3 } from 'lucide-react';
import { SafeBoxFeed } from './safebox/SafeBoxFeed';
import { SafeBoxMetrics } from './safebox/SafeBoxMetrics';
import { SafeBoxAISummary } from './safebox/SafeBoxAISummary';

type TabType = 'summary' | 'messages' | 'analytics';

function SafeBoxView() {
  // For demo/mock purposes, using a sample class
  // In production, this would come from selected class state
  const [selectedClass] = useState({
    id: 'mock-class-1',
    name: 'Introduction to Biology',
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  return (
    <div className="space-y-6">
      {/* Header with Info */}
      <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              SafeBox Anonymous Feedback
              <Info className="w-5 h-5 text-indigo-500" />
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Students can share anonymous feedback about their class experience. This is a safe, one-way communication channel for honest feedback.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">🔒 100% Anonymous</p>
                <p className="text-muted-foreground">Students' identities are never tracked or stored</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">🤖 AI Moderated</p>
                <p className="text-muted-foreground">Content is filtered to keep feedback constructive</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">📊 Daily AI Summaries</p>
                <p className="text-muted-foreground">Get key insights without reading every message</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">🔇 One-Way Channel</p>
                <p className="text-muted-foreground">Students submit, teachers receive (no replies)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-px ${
            activeTab === 'summary'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Brain className="w-5 h-5" />
          AI Daily Summaries
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-px ${
            activeTab === 'messages'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <MessageSquare className="w-5 w-5" />
          All Messages
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-px ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'summary' && (
          <SafeBoxAISummary classId={selectedClass.id} className={selectedClass.name} />
        )}
        
        {activeTab === 'messages' && (
          <SafeBoxFeed classId={selectedClass.id} className={selectedClass.name} />
        )}
        
        {activeTab === 'analytics' && (
          <SafeBoxMetrics classId={selectedClass.id} />
        )}
      </div>
    </div>
  );
}
export default SafeBoxView;
