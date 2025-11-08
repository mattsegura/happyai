import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the type for a single slot
export interface Slot {
  id: string | number;
  day: number;
  month: string;
  isRecommended?: boolean;
  balanceScore?: number;
}

// Define the props for the AvailabilityCard component
export interface AvailabilityCardProps {
  /**
   * The main title for the card.
   */
  title?: string;
  /**
   * An array of available slots to display.
   */
  slots: Slot[];
  /**
   * The ID of the currently selected slot.
   */
  selectedSlotId: string | number | null;
  /**
   * Callback function triggered when a slot is selected.
   */
  onSlotSelect: (id: string | number) => void;
  /**
   * Optional additional class names for the card container.
   */
  className?: string;
}

/**
 * A card component to display and select available time slots.
 * It's responsive, theme-aware, and includes animations.
 */
export const AvailabilityCard = ({
  title = "Free Slots Available",
  slots,
  selectedSlotId,
  onSlotSelect,
  className,
}: AvailabilityCardProps) => {
  // Animation variants for the container to orchestrate children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  // Animation variants for each slot item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl rounded-xl border bg-card text-card-foreground shadow-lg",
        className
      )}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <motion.div
        className="grid grid-cols-5 gap-3 p-6 pt-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {slots.map((slot) => {
          // Calculate color based on balance score
          const getColorClasses = () => {
            if (!slot.balanceScore) return "bg-card";
            
            if (slot.balanceScore >= 85) {
              // Green hue for excellent scores
              return "bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-300/60 dark:border-emerald-700/55 hover:bg-emerald-200/80 dark:hover:bg-emerald-800/50";
            } else if (slot.balanceScore >= 70) {
              // Yellow hue for moderate scores
              return "bg-yellow-100/70 dark:bg-yellow-900/40 border-yellow-300/60 dark:border-yellow-700/55 hover:bg-yellow-200/80 dark:hover:bg-yellow-800/50";
            } else {
              // Red hue for poor scores
              return "bg-red-100/70 dark:bg-red-900/40 border-red-300/60 dark:border-red-700/55 hover:bg-red-200/80 dark:hover:bg-red-800/50";
            }
          };

          return (
            <motion.button
              key={slot.id}
              onClick={() => onSlotSelect(slot.id)}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={slot.id === selectedSlotId}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                slot.id === selectedSlotId
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : getColorClasses()
              )}
            >
            {slot.isRecommended && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                ✓
              </span>
            )}
            <span className="text-3xl font-bold leading-none">
              {slot.day.toString().padStart(2, '0')}
            </span>
            <span
              className={cn(
                "mt-1",
                slot.id === selectedSlotId
                  ? "text-primary-foreground/80"
                  : slot.isRecommended
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              {slot.month}
            </span>
          </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

