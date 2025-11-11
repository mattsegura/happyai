import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OverviewDashboard } from './OverviewDashboard';
import { SingleClassAnalytics } from './SingleClassAnalytics';
import { mockClassesAnalytics } from '@/lib/analytics/comprehensiveMockData';

export function UnifiedAnalyticsView() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Load from localStorage or default to 'overview'
    return localStorage.getItem('analytics_active_tab') || 'overview';
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('analytics_active_tab', activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...mockClassesAnalytics.map(cls => ({
      id: cls.classId,
      label: cls.className,
      color: cls.color,
    })),
  ];

  const activeClass = mockClassesAnalytics.find(cls => cls.classId === activeTab);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-b border-white/20 sticky top-0 z-20 mb-6">
        <div className="flex items-center gap-2 px-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {/* Tab Color Indicator (for class tabs) */}
                {tab.color && (
                  <div
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tab.color }}
                  />
                )}
                
                <span className={tab.color ? 'ml-3' : ''}>{tab.label}</span>
                
                {/* Active Tab Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' ? (
              <OverviewDashboard />
            ) : activeClass ? (
              <SingleClassAnalytics classData={activeClass} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

