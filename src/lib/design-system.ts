/**
 * HapiAI Design System
 * Centralized design tokens for consistent UI/UX
 */

export const designSystem = {
  // Typography
  typography: {
    display: 'text-4xl md:text-5xl font-bold tracking-tight',
    pageTitle: 'text-2xl md:text-3xl font-bold tracking-tight',
    sectionTitle: 'text-lg md:text-xl font-semibold',
    cardTitle: 'text-base md:text-lg font-semibold',
    body: 'text-sm md:text-base leading-relaxed',
    caption: 'text-xs md:text-sm text-muted-foreground',
    label: 'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
  },

  // Spacing (gap utilities)
  spacing: {
    page: 'gap-8',          // Between major page sections
    section: 'gap-6',       // Between section groups
    component: 'gap-4',     // Between components
    group: 'gap-3',         // Related items
    inline: 'gap-2',        // Inline elements (icon + text)
    tight: 'gap-1',         // Badges, tags
  },

  // Elevation (shadows)
  elevation: {
    none: 'shadow-none',
    xs: 'shadow-sm',
    sm: 'shadow-md',
    md: 'shadow-lg shadow-primary/5',
    lg: 'shadow-xl shadow-primary/10',
    xl: 'shadow-2xl shadow-primary/20',
  },

  // Border radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Transitions
  transition: {
    default: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-150 ease-out',
  },

  // Supportive emotion colors (non-judgmental palette)
  emotions: {
    1: {
      gradient: 'from-indigo-400 to-purple-500',
      text: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      label: 'Processing'
    },
    2: {
      gradient: 'from-slate-400 to-slate-500',
      text: 'text-slate-700 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-950/20',
      border: 'border-slate-200 dark:border-slate-800',
      label: 'Reflective'
    },
    3: {
      gradient: 'from-sky-400 to-blue-500',
      text: 'text-sky-700 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-200 dark:border-sky-800',
      label: 'Calm'
    },
    4: {
      gradient: 'from-teal-400 to-cyan-500',
      text: 'text-teal-700 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/20',
      border: 'border-teal-200 dark:border-teal-800',
      label: 'Content'
    },
    5: {
      gradient: 'from-amber-400 to-orange-500',
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Energized'
    },
    6: {
      gradient: 'from-rose-400 to-pink-500',
      text: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'Thriving'
    },
  },

  // Interactive states
  interactive: {
    hover: 'hover:bg-muted/50 hover:scale-[1.02] hover:shadow-md',
    active: 'active:scale-[0.98]',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    disabled: 'opacity-50 cursor-not-allowed',
  },
} as const;

/**
 * Get emotion color configuration by sentiment level (1-6)
 */
export function getEmotionColors(sentiment: number) {
  const level = Math.max(1, Math.min(6, Math.round(sentiment))) as 1 | 2 | 3 | 4 | 5 | 6;
  return designSystem.emotions[level];
}

/**
 * Map old sentiment values (1-6) to new supportive emotion system
 */
export function getSentimentColor(value: number): { gradient: string; text: string; bg: string; border: string } {
  const emotion = getEmotionColors(value);
  return {
    gradient: emotion.gradient,
    text: emotion.text,
    bg: emotion.bg,
    border: emotion.border,
  };
}
