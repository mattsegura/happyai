/**
 * Hapi Moments View - Teacher Dashboard
 *
 * Combines Hapi Moments oversight components into a unified view for teachers.
 * Provides visibility into class positivity culture and teacher's own moments.
 */

import { useState } from 'react';
import { Heart, Info, Sparkles } from 'lucide-react';
import { HapiMomentsOversight } from './moments/HapiMomentsOversight';
import { TeacherMomentsMetrics } from './moments/TeacherMomentsMetrics';
import { motion } from 'framer-motion';

function HapiMomentsView() {
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
          <Sparkles className="h-7 w-7 text-primary" />
          Hapi Moments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your class's culture of positivity
        </p>
      </motion.div>

      {/* Info Card - Updated Styling */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/60 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 backdrop-blur-sm p-5"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex-shrink-0">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-bold text-foreground">Class Oversight</h2>
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Track how students spread kindness through Hapi Moments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">👀 Full Visibility</p>
                <p className="text-muted-foreground">See all class moments</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">📊 Analytics</p>
                <p className="text-muted-foreground">Track participation</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground mb-1">💡 Tools</p>
                <p className="text-muted-foreground">Encourage engagement</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Class Oversight */}
        <div>
          <HapiMomentsOversight classId={selectedClass.id} className={selectedClass.name} />
        </div>

        {/* Right Column: Your Metrics */}
        <div>
          <TeacherMomentsMetrics classId={selectedClass.id} className={selectedClass.name} />
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-cyan-50 dark:to-cyan-950/30 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-foreground mb-3">💪 Best Practices for Using Hapi Moments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-2">As a Teacher:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Send at least 1 moment per day</li>
              <li>• Ensure all students receive moments regularly</li>
              <li>• Recognize specific achievements and improvements</li>
              <li>• Be genuine and personal in your messages</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Encouraging Students:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Model the behavior by sending moments yourself</li>
              <li>• Celebrate students who send moments</li>
              <li>• Remind inactive students to participate</li>
              <li>• Create a culture of appreciation and kindness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HapiMomentsView;
