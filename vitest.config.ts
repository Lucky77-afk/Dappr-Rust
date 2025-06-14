/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Use React 17+ automatic runtime
      jsxRuntime: 'automatic',
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.d.ts',
        '**/test/**',
        '**/mocks/**',
        '**/__tests__/utils/**',
        '**/types/**',
        '**/styles/**',
        '**/constants/**',
        '**/config/**',
        '**/index.ts',
        '**/*.config.*',
        '**/.eslintrc.*',
        '**/.prettierrc.*',
        '**/vite-env.d.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      watermarks: {
        lines: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        statements: [80, 95],
      },
    },
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    deps: {
      inline: ['@solana/web3.js', '@solana/wallet-adapter-react'],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    watch: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    passWithNoTests: true,
    logHeapUsage: true,
    update: false,
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/.github/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/coverage/**',
      '**/temp/**',
    ],
    silent: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app/src'),
      '@components': resolve(__dirname, 'app/src/components'),
      '@pages': resolve(__dirname, 'app/src/pages'),
      '@styles': resolve(__dirname, 'app/src/styles'),
      '@utils': resolve(__dirname, 'app/src/utils'),
      '@hooks': resolve(__dirname, 'app/src/hooks'),
      '@contexts': resolve(__dirname, 'app/src/contexts'),
      '@services': resolve(__dirname, 'app/src/services'),
      '@types': resolve(__dirname, 'app/src/types'),
    },
  },
});
