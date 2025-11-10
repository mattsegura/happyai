import { cn } from '@/lib/utils';
import { useState, createContext, useContext, useEffect } from 'react';
import {
  motion,
  MotionValue,
  SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

const ImageComparisonContext = createContext<
  | {
      sliderPosition: number;
      setSliderPosition: (pos: number) => void;
      motionSliderPosition: MotionValue<number>;
    }
  | undefined
>(undefined);

type ImageComparisonProps = {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  springOptions?: SpringOptions;
  toggleMode?: boolean;
  onToggle?: (position: number) => void;
  externalPosition?: number;
};

const DEFAULT_SPRING_OPTIONS = {
  bounce: 0,
  duration: 0,
};

function ImageComparison({
  children,
  className,
  enableHover,
  springOptions,
  toggleMode = false,
  onToggle,
  externalPosition,
}: ImageComparisonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const motionValue = useMotionValue(externalPosition ?? 50);
  const motionSliderPosition = useSpring(
    motionValue,
    springOptions ?? DEFAULT_SPRING_OPTIONS
  );
  const [sliderPosition, setSliderPosition] = useState(externalPosition ?? 50);

  // Update position when externalPosition changes
  useEffect(() => {
    if (externalPosition !== undefined && toggleMode) {
      motionValue.set(externalPosition);
      setSliderPosition(externalPosition);
    }
  }, [externalPosition, toggleMode, motionValue]);

  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (toggleMode) return; // Disable dragging in toggle mode
    if (!isDragging && !enableHover) return;

    const containerRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const x =
      'touches' in event
        ? event.touches[0].clientX - containerRect.left
        : (event as React.MouseEvent).clientX - containerRect.left;

    const percentage = Math.min(
      Math.max((x / containerRect.width) * 100, 0),
      100
    );
    motionValue.set(percentage);
    setSliderPosition(percentage);
  };

  const handleToggle = (newPosition: number) => {
    motionValue.set(newPosition);
    setSliderPosition(newPosition);
    if (onToggle) onToggle(newPosition);
  };

  return (
    <ImageComparisonContext.Provider
      value={{ sliderPosition, setSliderPosition: handleToggle, motionSliderPosition }}
    >
      <div
        className={cn(
          'relative select-none',
          !toggleMode && enableHover && 'cursor-ew-resize',
          className
        )}
        onMouseMove={!toggleMode ? handleDrag : undefined}
        onMouseDown={!toggleMode ? () => !enableHover && setIsDragging(true) : undefined}
        onMouseUp={!toggleMode ? () => !enableHover && setIsDragging(false) : undefined}
        onMouseLeave={!toggleMode ? () => !enableHover && setIsDragging(false) : undefined}
        onTouchMove={!toggleMode ? handleDrag : undefined}
        onTouchStart={!toggleMode ? () => !enableHover && setIsDragging(true) : undefined}
        onTouchEnd={!toggleMode ? () => !enableHover && setIsDragging(false) : undefined}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  );
}

const ImageComparisonImage = ({
  className,
  alt,
  src,
  position,
}: {
  className?: string;
  alt: string;
  src: string;
  position: 'left' | 'right';
}) => {
  const { motionSliderPosition } = useContext(ImageComparisonContext)!;
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`
  );
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
      style={{
        clipPath: position === 'left' ? leftClipPath : rightClipPath,
      }}
    />
  );
};

const ImageComparisonSlider = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const { motionSliderPosition } = useContext(ImageComparisonContext)!;

  const left = useTransform(motionSliderPosition, (value) => `${value}%`);

  return (
    <motion.div
      className={cn('absolute bottom-0 top-0 w-1 cursor-ew-resize', className)}
      style={{
        left,
      }}
    >
      {children}
    </motion.div>
  );
};

// Custom component for content comparison (not just images)
const ImageComparisonContent = ({
  className,
  children,
  position,
}: {
  className?: string;
  children: React.ReactNode;
  position: 'left' | 'right';
}) => {
  const { motionSliderPosition } = useContext(ImageComparisonContext)!;

  // For left side: show from left edge to slider position
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  // First child (position="right") should be the base layer
  // Second child (position="left") should overlay on top
  if (position === 'right') {
    return (
      <div className={cn('w-full', className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn('absolute inset-0 w-full overflow-hidden', className)}
      style={{
        clipPath: leftClipPath,
      }}
    >
      {children}
    </motion.div>
  );
};

// Toggle Switch Component
const ImageComparisonToggle = ({
  className,
  leftLabel = 'Left',
  rightLabel = 'Right',
}: {
  className?: string;
  leftLabel?: string;
  rightLabel?: string;
}) => {
  const { sliderPosition, setSliderPosition } = useContext(ImageComparisonContext)!;
  const isLeft = sliderPosition > 50;

  const handleToggle = () => {
    const newPosition = isLeft ? 0 : 100;
    setSliderPosition(newPosition);
  };

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <span className={cn(
        'text-sm font-medium transition-all duration-300',
        isLeft ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
      )}>
        {leftLabel}
      </span>
      <button
        onClick={handleToggle}
        className={cn(
          'relative h-8 w-16 rounded-full transition-all duration-300',
          isLeft ? 'bg-sky-500' : 'bg-blue-500'
        )}
        aria-label={`Switch to ${isLeft ? rightLabel : leftLabel}`}
      >
        <motion.div
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
          animate={{
            left: isLeft ? '4px' : 'calc(100% - 28px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      </button>
      <span className={cn(
        'text-sm font-medium transition-all duration-300',
        !isLeft ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
      )}>
        {rightLabel}
      </span>
    </div>
  );
};

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider, ImageComparisonContent, ImageComparisonToggle };

