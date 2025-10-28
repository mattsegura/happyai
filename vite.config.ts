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
              id.includes('use-') ||  // use-callback-ref, use-sidecar, etc.
              id.includes('@radix-ui') ||  // Radix UI uses React hooks internally
              id.includes('lucide-react')  // lucide-react also uses React
            ) {
              return 'vendor-react';
            }

            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }

            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
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

          // Academics components
          if (id.includes('/academics/')) {
            return 'academics-components';
          }

          // Leaderboard components
          if (id.includes('/leaderboard/')) {
            return 'leaderboard-components';
          }

          // Moments components
          if (id.includes('/moments/')) {
            return 'moments-components';
          }
        },
      },
    },

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,

    // Use esbuild for minification (faster and built-in)
    minify: 'esbuild',

    // Source maps for production debugging (can disable for smaller builds)
    sourcemap: false,
  },
});
