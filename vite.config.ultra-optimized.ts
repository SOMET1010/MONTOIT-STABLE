import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      // Désactiver les features non utilisées
      fastRefresh: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Pré-bundling agressif
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'clsx',
      'tailwind-merge'
    ],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    // Compression maximale
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // 2kb inline
    rollupOptions: {
      output: {
        // Manual chunks ultra-optimisés
        manualChunks: (id) => {
          // Mapbox - entièrement séparé
          if (id.includes('mapbox-gl')) {
            return 'mapbox';
          }

          // PDF - entièrement séparé
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf';
          }

          // Sentry - uniquement en prod
          if (id.includes('@sentry')) {
            return 'sentry';
          }

          // React Core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-core';
          }

          // State Management
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
            return 'state';
          }

          // UI Libraries
          if (id.includes('lucide-react') || id.includes('@radix-ui')) {
            return 'ui';
          }

          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }

          // Utils
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils';
          }

          // Features
          if (id.includes('src/features/')) {
            if (id.includes('/auth/')) return 'auth';
            if (id.includes('/property/')) return 'property';
            if (id.includes('/contract/')) return 'contract';
            if (id.includes('/messaging/')) return 'messaging';
            if (id.includes('/payment/')) return 'payment';
            if (id.includes('/admin/')) return 'admin';
            return 'features';
          }

          // Vendor chunk pour tout le reste
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          // App principal
          return 'app';
        },
        // Optimisation des noms de fichiers
        chunkFileNames: (chunkInfo) => {
          return `js/[name].[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/\.(css)$/.test(assetInfo.name ?? '')) {
            return `css/[name].[hash][extname]`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')) {
            return `img/[name].[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? '')) {
            return `fonts/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
      },
      // Options de bundle
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      // Externals pour les très grosses libs (optionnel)
      external: [],
    },
    // Optimisations avancées
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    // Limite de chunk
    chunkSizeWarningLimit: 1000,
    // CSS inlining
    cssMinify: 'lightningcss',
  },
  // Experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});