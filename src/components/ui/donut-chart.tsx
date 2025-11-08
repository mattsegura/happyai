"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

export interface DonutChartSegment {
  value: number;
  color: string;
  label: string;
  [key: string]: any;
}

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[];
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  animationDelayPerSegment?: number;
  highlightOnHover?: boolean;
  centerContent?: React.ReactNode;
  onSegmentHover?: (segment: DonutChartSegment | null) => void;
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 1.5,
      animationDelayPerSegment = 0.15,
      highlightOnHover = true,
      centerContent,
      onSegmentHover,
      className,
      ...props
    },
    ref
  ) => {
    const [hoveredSegment, setHoveredSegment] =
      React.useState<DonutChartSegment | null>(null);
    const [hasAnimated, setHasAnimated] = React.useState(false);

    const internalTotalValue = React.useMemo(
      () =>
        propTotalValue || data.reduce((sum, segment) => sum + segment.value, 0),
      [data, propTotalValue]
    );

    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    React.useEffect(() => {
      onSegmentHover?.(hoveredSegment);
    }, [hoveredSegment, onSegmentHover]);

    const handleMouseLeave = () => {
      setHoveredSegment(null);
    };

    // Trigger animation on mount
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    let cumulativePercentage = 0;

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring with subtle pulse animation */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(var(--border) / 0.3)"
            strokeWidth={strokeWidth}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <AnimatePresence>
            {data.map((segment, index) => {
              if (segment.value === 0) return null;

              const percentage =
                internalTotalValue === 0
                  ? 0
                  : (segment.value / internalTotalValue) * 100;
              
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
              
              const isActive = hoveredSegment?.label === segment.label;
              
              cumulativePercentage += percentage;

              return (
                <g key={segment.label || index}>
                  {/* Glow effect when hovered */}
                  {isActive && (
                    <motion.circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={strokeWidth + 8}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      opacity={0.2}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ filter: `blur(8px)` }}
                    />
                  )}
                  
                  {/* Main segment */}
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className={highlightOnHover ? "cursor-pointer" : ""}
                    initial={{ 
                      strokeDashoffset: circumference,
                      opacity: 0
                    }}
                    animate={{ 
                      strokeDashoffset: strokeDashoffset,
                      opacity: isActive ? 1 : 0.95,
                    }}
                    transition={{
                      strokeDashoffset: {
                        duration: animationDuration,
                        delay: index * animationDelayPerSegment,
                        ease: [0.4, 0, 0.2, 1],
                      },
                      opacity: {
                        duration: 0.3,
                        delay: index * animationDelayPerSegment,
                      },
                      strokeWidth: {
                        duration: 0.2,
                        ease: "easeOut"
                      }
                    }}
                    style={{
                      filter: isActive
                        ? `drop-shadow(0px 0px 8px ${segment.color})`
                        : 'none',
                    }}
                    onMouseEnter={() => setHoveredSegment(segment)}
                    whileHover={{
                      filter: `drop-shadow(0px 0px 12px ${segment.color})`,
                    }}
                  />
                </g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Center content */}
        {centerContent && (
          <motion.div
            className="absolute flex flex-col items-center justify-center pointer-events-none"
            style={{
              width: size - strokeWidth * 2.5,
              height: size - strokeWidth * 2.5,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: animationDelayPerSegment * data.length * 0.5,
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            {centerContent}
          </motion.div>
        )}

        {/* Animated ring that appears on first load */}
        {hasAnimated && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              border: `2px solid ${data[0]?.color || 'hsl(var(--primary))'}`,
            }}
          />
        )}
      </div>
    );
  }
);

DonutChart.displayName = "DonutChart";

export { DonutChart };
