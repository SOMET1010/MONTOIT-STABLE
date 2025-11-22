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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react'],
          
          // Feature chunks
          'property-feature': [
            './src/features/property/index.ts',
            './src/features/property/pages/SearchPropertiesPage.tsx',
            './src/features/property/pages/PropertyDetailPage.tsx',
          ],
          'contract-feature': [
            './src/features/contract/index.ts',
          ],
          'messaging-feature': [
            './src/features/messaging/index.ts',
          ],
          'auth-feature': [
            './src/features/auth/index.ts',
          ],
          
          // Heavy libraries
          'mapbox': ['mapbox-gl'],
          'pdf': ['jspdf', 'html2canvas'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },
});

