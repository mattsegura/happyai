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
import { motion } from 'framer-motion';

function SafeBoxView() {
  // For demo/mock purposes, using a sample class
  // In production, this would come from selected class state
  const [selectedClass] = useState({
    id: 'mock-class-1',
    name: 'Introduction to Biology',
  });

  return (
    <div className="space-y-4">
      {/* Header - Matching Student View */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          SafeBox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Anonymous student feedback and insights
        </p>
      </motion.div>

      {/* Info Card - Updated Styling */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm p-5"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-bold text-foreground">Anonymous Feedback</h2>
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Students can share anonymous feedback about their class experience. This is a safe space for honest communication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">🔒 100% Anonymous</p>
                <p className="text-muted-foreground">Identities never tracked</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">🤖 AI Moderated</p>
                <p className="text-muted-foreground">Constructive feedback</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">⚡ Insights</p>
                <p className="text-muted-foreground">Sentiment analysis</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
