import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Sparkles } from "lucide-react";
import { Button } from "./button";

export interface AnimatedHeroProps {
  /** Array of rotating title words */
  titles?: string[];
  /** Main heading text before the animated word */
  headingPrefix?: string;
  /** Description text below the heading */
  description?: string;
  /** Primary CTA button text */
  primaryCtaText?: string;
  /** Primary CTA button click handler */
  onPrimaryCtaClick?: () => void;
  /** Secondary CTA button text */
  secondaryCtaText?: string;
  /** Secondary CTA button click handler */
  onSecondaryCtaClick?: () => void;
  /** Optional badge text */
  badgeText?: string;
  /** Optional badge click handler */
  onBadgeClick?: () => void;
}

export function AnimatedHero({
  titles = ["powerful", "intuitive", "transformative", "essential", "intelligent"],
  headingPrefix = "One companion for wellbeing and learning",
  description = "Hapi pairs daily mood pulses with classroom data so students feel heard, teachers see what matters, and leaders act with clarity.",
  primaryCtaText = "Get Started Free",
  onPrimaryCtaClick,
  secondaryCtaText = "Explore the platform",
  onSecondaryCtaClick,
  badgeText = "Designed for whole-student care",
  onBadgeClick,
}: AnimatedHeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const memoizedTitles = useMemo(() => titles, [titles]);

  // All words move from right to left like a wheel
  const getAnimationDirection = (index: number, isActive: boolean, currentIndex: number) => {
    if (isActive) {
      // Word is currently visible at center
      return { x: 0, y: 0, opacity: 1, scale: 1 };
    } else if (currentIndex > index) {
      // Word was already shown, exit to the left
      return { 
        x: -150, 
        y: 0, 
        opacity: 0,
        scale: 0.8
      };
    } else {
      // Word hasn't been shown yet, start from the right
      return { 
        x: 150, 
        y: 0, 
        opacity: 0,
        scale: 0.8
      };
    }
  };

  // Special styling for the last word (happiness)
  const isLastWord = (index: number) => index === memoizedTitles.length - 1;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === memoizedTitles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, memoizedTitles]);

  return (
    <div className="w-full">
      <div className="flex gap-8 items-center justify-center lg:justify-start flex-col">
          {badgeText && (
            <div>
              <Button
                variant="secondary"
                size="sm"
                className="gap-4"
                onClick={onBadgeClick}
              >
                <Sparkles className="w-4 h-4" />
                {badgeText}
                <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-left font-regular">
              <span className="text-foreground">{headingPrefix}</span>
              <span className="relative flex w-full justify-start text-left h-[4rem] md:h-[5.5rem] items-center min-w-[300px] md:min-w-[500px]">
                {memoizedTitles.map((title, index) => (
                  <motion.span
                    key={index}
                    className={`absolute font-semibold whitespace-nowrap left-0 ${
                      isLastWord(index)
                        ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 bg-clip-text text-transparent'
                    }`}
                    style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    initial={{ opacity: 0, x: 150, scale: 0.8 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: isLastWord(index) ? 70 : 50,
                      damping: isLastWord(index) ? 12 : 15,
                    }}
                    animate={getAnimationDirection(index, titleNumber === index, titleNumber)}
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-left">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="gap-4"
              onClick={onPrimaryCtaClick}
              variant="accent"
            >
              {primaryCtaText}
              <MoveRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4"
              variant="outline"
              onClick={onSecondaryCtaClick}
            >
              {secondaryCtaText}
            </Button>
          </div>
      </div>
    </div>
  );
}

