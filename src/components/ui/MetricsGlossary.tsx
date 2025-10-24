import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './button';

const metrics = [
  {
    name: 'Pulses',
    description: 'Daily emotional check-ins where you share how you\'re feeling. Morning pulses earn 15 points, class pulses vary by teacher.'
  },
  {
    name: 'Streaks',
    description: 'Consecutive days you\'ve completed your morning pulse. Longer streaks unlock bonus rewards and recognition.'
  },
  {
    name: 'Moments',
    description: 'Peer-to-peer recognition notes where classmates acknowledge your kindness, help, or positive impact. Each earns 5-10 points.'
  },
  {
    name: 'Points',
    description: 'Your overall engagement score. Earned through pulses (15pts), class participation, and Hapi Moments. Points level you up!'
  },
  {
    name: 'Level',
    description: 'Your progression tier, calculated as (Total Points ÷ 100) + 1. Higher levels unlock special features and show dedication.'
  },
  {
    name: 'Participation',
    description: 'Percentage of pulse checks and class activities you\'ve completed. Teachers see class averages to gauge engagement.'
  },
  {
    name: 'Sentiment Score',
    description: 'Average emotional rating from 1 (very negative) to 6 (excellent), based on your recent pulse responses.'
  },
  {
    name: 'Engagement',
    description: 'Combined metric of your pulse completion rate, moment activity, and class interactions.'
  }
];

export const MetricsGlossary: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        leftIcon={<HelpCircle className="h-4 w-4" />}
      >
        Metrics Guide
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Metrics Glossary"
        description="Understand all the terms and scores in HapiAI"
        size="lg"
      >
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {metric.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
