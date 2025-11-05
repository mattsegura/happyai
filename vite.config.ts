import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable code splitting and optimize chunks
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks(id) {
          // Vendor chunks for core libraries
          if (id.includes('node_modules')) {
            // React and all React-dependent libraries must be in the same chunk
            // to avoid "useLayoutEffect" errors in production
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-hot-toast') ||
              id.includes('framer-motion') ||  // framer-motion uses React hooks internally
              id.includes('use-') ||  // use-callback-ref, use-sidecar, etc.
              id.includes('@radix-ui') ||  // Radix UI uses React hooks internally
              id.includes('lucide-react')  // lucide-react also uses React
            ) {
              return 'vendor-react';
            }

            // Charts - separate chunk since they're large
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }

            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }

            // AI libraries (OpenAI, Anthropic) - separate chunk
            if (id.includes('openai') || id.includes('@anthropic-ai')) {
              return 'vendor-ai';
            }

            // Stripe - separate chunk
            if (id.includes('@stripe') || id.includes('stripe')) {
              return 'vendor-stripe';
            }

            // Other node_modules
            return 'vendor-misc';
          }

          // Application chunks
          // Canvas integration
          if (id.includes('/canvas/') || id.includes('canvasApiMock')) {
            return 'canvas-integration';
          }

          // Teacher components
          if (id.includes('/teacher/')) {
            return 'teacher-components';
          }

          // Student-specific components
          if (id.includes('/student/')) {
            return 'student-components';
          }

          // Academics components - split into smaller chunks
          if (id.includes('/academics/')) {
            // Split academics into sub-chunks to avoid large bundle
            if (id.includes('EnhancedStudyPlanner') || id.includes('StudyPlanner') || id.includes('UnifiedCalendar')) {
              return 'academics-planner';
            }
            if (id.includes('CourseTutorMode') || id.includes('FeedbackHub')) {
              return 'academics-ai-features';
            }
            if (id.includes('MoodGradeAnalytics') || id.includes('GradeProjection')) {
              return 'academics-analytics';
            }
            return 'academics-core';
          }

          // Payment components
          if (id.includes('/payment/')) {
            return 'payment-components';
          }

          // Leaderboard components
          if (id.includes('/leaderboard/')) {
            return 'leaderboard-components';
          }

          // Moments components
          if (id.includes('/moments/')) {
            return 'moments-components';
          }

          // Wellbeing components
          if (id.includes('/wellbeing/')) {
            return 'wellbeing-components';
          }

          // Progress components
          if (id.includes('/progress/')) {
            return 'progress-components';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Reduce chunk size warning limit to catch issues earlier
    chunkSizeWarningLimit: 500,

    // Use esbuild for minification (faster and built-in)
    minify: 'esbuild',

    // Disable source maps for smaller builds
    sourcemap: false,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Target modern browsers for smaller output
    target: 'es2020',
  },
});
