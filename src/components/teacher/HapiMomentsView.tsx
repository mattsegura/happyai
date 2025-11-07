/**
 * Hapi Moments View - Teacher Dashboard
 *
 * Combines Hapi Moments oversight components into a unified view for teachers.
 * Provides visibility into class positivity culture and teacher's own moments.
 */

import { useState } from 'react';
import { Heart, Info } from 'lucide-react';
import { HapiMomentsOversight } from './moments/HapiMomentsOversight';
import { TeacherMomentsMetrics } from './moments/TeacherMomentsMetrics';

export function HapiMomentsView() {
  // For demo/mock purposes, using a sample class
  // In production, this would come from selected class state
  const [selectedClass] = useState({
    id: 'mock-class-1',
    name: 'Introduction to Biology',
  });

  return (
    <div className="space-y-6">
      {/* Header with Info */}
      <div className="bg-gradient-to-r from-pink-50 dark:from-pink-950/30 to-rose-50 dark:to-rose-950/30 rounded-xl p-6 border-2 border-pink-200 dark:border-pink-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              Hapi Moments Oversight
              <Info className="w-5 h-5 text-pink-500" />
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Monitor your class's culture of positivity and recognition. Track how students (and you) spread kindness through Hapi Moments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">👀 Full Visibility</p>
                <p className="text-muted-foreground">See all moments shared within your class</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">📊 Culture Analytics</p>
                <p className="text-muted-foreground">Track participation and identify trends</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-semibold text-foreground mb-1">💡 Encouragement Tools</p>
                <p className="text-muted-foreground">Nudge students who need engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
