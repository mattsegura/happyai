import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/integration-setup.ts'],
    include: ['tests/integration/**/*.test.{ts,tsx}'],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
