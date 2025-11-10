import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type SubStat = {
  value: string | number;
  label: string;
  subLabel: string;
};

type TrendBar = {
  level: number;
};

interface RetentionStatsCardProps {
  title: string;
  timeFrame: string;
  impact: {
    percentage: number;
    change: number;
    changePeriod: string;
  };
  subStats: [SubStat, SubStat];
  ranking: {
    place: string;
    category: string;
    icon?: React.ReactNode;
  };
  trend: {
    title: string;
    bars: TrendBar[];
    label: string;
  };
  className?: string;
}

export const RetentionStatsCard = React.forwardRef<
  HTMLDivElement,
  RetentionStatsCardProps
>(({ title, timeFrame, impact, subStats, ranking, trend, className }, ref) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const barVariants = {
    hidden: { height: "0%", opacity: 0 },
    visible: { height: "100%", opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const barColors = [
    '#6366f1', '#7c3aed', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'
  ];

  return (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-sm rounded-2xl bg-card text-card-foreground p-6 shadow-lg font-sans flex flex-col gap-6 border",
        className
      )}
      aria-labelledby="stats-card-title"
    >
      <header className="flex justify-between items-center">
        <h2 id="stats-card-title" className="text-xl font-bold">{title}</h2>
        <div className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
          {timeFrame}
        </div>
      </header>

      <section aria-label="Retention Impact">
        <p className="text-sm text-muted-foreground">Retention Rate</p>
        <h3 className="text-5xl font-bold tracking-tighter mt-1">
          {impact.percentage}%
        </h3>
        <p
          className={cn(
            "text-sm font-semibold mt-2",
            impact.change >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {impact.change >= 0 ? "+" : ""}
          {impact.change}% {impact.changePeriod}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4" aria-label="Additional Stats">
        {subStats.map((stat, index) => (
          <div key={index} className="bg-muted rounded-lg p-4">
            <p className="text-2xl font-bold">{stat.value} <span className="text-base font-normal text-muted-foreground">{stat.label}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subLabel}</p>
          </div>
        ))}
      </section>

      <section
        className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800"
        aria-label={`Ranking: ${ranking.place}`}
      >
        <div>
          <h4 className="text-xl font-bold">{ranking.place}</h4>
          <p className="text-sm opacity-80">{ranking.category}</p>
        </div>
        {ranking.icon && <div aria-hidden="true">{ranking.icon}</div>}
      </section>

      <section aria-labelledby="trend-title">
        <h4 id="trend-title" className="text-md font-semibold">{trend.title}</h4>
        <motion.div
          className="flex items-end gap-1 h-12 mt-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label="Trend chart"
        >
          {trend.bars.map((bar, index) => {
            const colorIndex = Math.floor((index / trend.bars.length) * (barColors.length - 1));
            const color = bar.level > 0 ? barColors[colorIndex] : 'hsl(var(--muted))';

            return (
              <div key={index} className="w-full h-full rounded-sm flex items-end" style={{ backgroundColor: bar.level > 0 ? 'transparent' : 'hsl(var(--muted))'}}>
                 <motion.div
                    className="w-full rounded-sm"
                    style={{ 
                        height: `${bar.level * 100}%`,
                        backgroundColor: color,
                     }}
                    variants={barVariants}
                 />
              </div>
            );
          })}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
      </section>
    </div>
  );
});

RetentionStatsCard.displayName = "RetentionStatsCard";

