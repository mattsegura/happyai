/**
 * SafeBox View - Teacher Dashboard
 *
 * Combines all SafeBox components into a unified view for teachers.
 * Displays anonymous student feedback with analytics and response capabilities.
 */

import { useState } from 'react';
import { Shield, Info } from 'lucide-react';
import { SafeBoxFeed } from './safebox/SafeBoxFeed';
import { SafeBoxMetrics } from './safebox/SafeBoxMetrics';
import { SafeBoxResponse } from './safebox/SafeBoxResponse';

function SafeBoxView() {
  // For demo/mock purposes, using a sample class
  // In production, this would come from selected class state
  const [selectedClass] = useState({
    id: 'mock-class-1',
    name: 'Introduction to Biology',
  });

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
              Students can share anonymous feedback about their class experience. This is a safe space for honest communication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">🔒 100% Anonymous</p>
                <p className="text-muted-foreground">Students' identities are never tracked or stored</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">🤖 AI Moderated</p>
                <p className="text-muted-foreground">Content is filtered to keep feedback constructive</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">⚡ Actionable Insights</p>
                <p className="text-muted-foreground">Common themes and sentiment analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Feed (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <SafeBoxFeed classId={selectedClass.id} className={selectedClass.name} />
        </div>

        {/* Right Column: Metrics & Response (1/3 width) */}
        <div className="space-y-6">
          <SafeBoxMetrics classId={selectedClass.id} />
          <SafeBoxResponse classId={selectedClass.id} className={selectedClass.name} />
        </div>
      </div>
    </div>
  );
}
export default SafeBoxView;
