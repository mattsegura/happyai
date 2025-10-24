/**
 * Design System Constants
 * Centralized values for consistency across the app
 */

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Spacing Scale (matches Tailwind)
export const SPACING = {
  xs: '0.5rem',    // 2 - 8px
  sm: '0.75rem',   // 3 - 12px
  md: '1rem',      // 4 - 16px
  lg: '1.5rem',    // 6 - 24px
  xl: '2rem',      // 8 - 32px
  '2xl': '3rem',   // 12 - 48px
} as const;

// Border Radius Scale
export const RADIUS = {
  sm: '0.375rem',  // rounded-sm - 6px
  md: '0.5rem',    // rounded-md - 8px
  lg: '0.75rem',   // rounded-lg - 12px
  xl: '1rem',      // rounded-xl - 16px
  '2xl': '1.5rem', // rounded-2xl - 24px
  full: '9999px',  // rounded-full
} as const;

// Animation Durations
export const DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Shadow Styles
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;
