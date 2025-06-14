import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isTest = mode === 'test';

  return {
    // Base public path when served in development or production
    base: env.VITE_BASE_URL || '/',

    // Plugins to use for the build
    plugins: [
      // React plugin for Vite
      react({
        // Use React 17+ automatic runtime
        jsxRuntime: 'automatic',
        // Use babel for development
        babel: {
          plugins: [
            'babel-plugin-macros',
            [
              'babel-plugin-styled-components',
              {
                displayName: isDevelopment,
                fileName: isDevelopment,
                pure: true,
                ssr: true,
              },
            ],
          ],
        },
      }),

      // Enable TypeScript path aliases from tsconfig
      tsconfigPaths(),

      // SVG support
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),

      // HTML plugin for environment variables
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: env.VITE_APP_TITLE || 'Dappr Solana',
            description: env.VITE_APP_DESCRIPTION || 'A Solana DApp',
            keywords: env.VITE_APP_KEYWORDS || 'solana, blockchain, dapp',
            author: env.VITE_APP_AUTHOR || 'Dappr Team',
          },
        },
      }),

      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
        manifest: {
          name: env.VITE_APP_TITLE || 'Dappr Solana',
          short_name: 'Dappr',
          description: env.VITE_APP_DESCRIPTION || 'A Solana DApp',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          sourcemap: !isProduction,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
      }),

      // Type checking in dev server
      !isTest &&
        checker({
          typescript: true,
          eslint: {
            lintCommand: 'eslint --ext .ts,.tsx .',
          },
        }),

      // Bundle visualizer
      isProduction &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    // Resolve configuration
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

    // Server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
      strictPort: true,
      fs: {
        strict: true,
      },
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // Build configuration
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: isProduction ? 'hidden' : true,
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            solana: ['@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-wallets'],
            ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    // Test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/coverage/**',
          '**/*.d.ts',
          '**/test/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/__tests__/**',
          '**/mocks/**',
        ],
      },
    },

    // Environment variables
    define: {
      'process.env': {
        ...Object.entries(env).reduce((prev, [key, val]) => {
          return {
            ...prev,
            [key]: val,
          };
        }, {}),
      },
    },
  };
});
