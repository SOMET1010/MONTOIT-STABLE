import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh seulement en dev
      fastRefresh: process.env.NODE_ENV === 'development',
      // Optimiser React
      jsxImportSource: undefined,
    }),
  ],
  define: {
    global: 'globalThis',
    // Polyfill pour require si nécessaire
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Configuration pour gérer les modules CJS
  ssr: {
    noExternal: [],
  },
  // Configuration spécifique pour mapbox-gl
  assetsInclude: ['**/*.map'],
  resolve: {
    // Gérer l'import de mapbox-gl
    dedupe: ['mapbox-gl'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@stores': path.resolve(__dirname, './src/stores'),
    },
  },
  optimizeDeps: {
    // Exclure pour charger à la demande
    exclude: [
      'lucide-react',
      'jspdf',
    ],
    // Pré-builder les dépendances critiques
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      '@sentry/react',
      '@sentry/tracing',
      '@sentry/replay',
      'hoist-non-react-statics',
      'mapbox-gl'
    ],
    // Force la transformation des modules CJS
    force: true,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    // CSS extraction
    cssCodeSplit: true,
    // Assets optimisation
    assetsInlineLimit: 4096, // 4kb inline limit
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Ignorer les avertissements sur les modules dynamiques
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        // Ignorer les avertissements sur this est undefined
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return;
        }
        warn(warning);
      },
      output: {
        // Code splitting stratégique
        manualChunks(id) {
          // Vendor chunks - bibliothèques externes
          if (id.includes('node_modules')) {
            // React et écosystème
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // État et requêtes
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'state-vendor';
            }
            // Supabase et base de données
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // UI et icônes
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Cartes et géolocalisation
            if (id.includes('mapbox-gl') || id.includes('leaflet')) {
              return 'maps-vendor';
            }
            // PDF et documents
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            // Validation et formulaires
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'forms-vendor';
            }
            // Monitoring
            if (id.includes('@sentry')) {
              return 'monitoring-vendor';
            }
            // Autres dépendances
            return 'vendor';
          }

          // Feature chunks - modules métier
          if (id.includes('src/features/')) {
            // Authentification
            if (id.includes('src/features/auth')) {
              return 'auth-feature';
            }
            // Propriétés
            if (id.includes('src/features/property')) {
              return 'property-feature';
            }
            // Contrats
            if (id.includes('src/features/contract')) {
              return 'contract-feature';
            }
            // Messagerie
            if (id.includes('src/features/messaging')) {
              return 'messaging-feature';
            }
            // Paiements
            if (id.includes('src/features/payment')) {
              return 'payment-feature';
            }
            // Locataire
            if (id.includes('src/features/tenant')) {
              return 'tenant-feature';
            }
            // Propriétaire
            if (id.includes('src/features/owner')) {
              return 'owner-feature';
            }
            // Agence
            if (id.includes('src/features/agency')) {
              return 'agency-feature';
            }
            // Admin
            if (id.includes('src/features/admin')) {
              return 'admin-feature';
            }
            // Vérification
            if (id.includes('src/features/verification')) {
              return 'verification-feature';
            }
            // Litiges
            if (id.includes('src/features/dispute')) {
              return 'dispute-feature';
            }
          }

          // Shared chunks - code partagé
          if (id.includes('src/shared/')) {
            return 'shared';
          }

          // App chunk - code principal de l'application
          if (id.includes('src/app/')) {
            return 'app';
          }
        },
        // Optimisation des chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },
      },
    },
    // Réduire la limite d'avertissement pour les gros chunks
    chunkSizeWarningLimit: 1000,
    // Activer le tree-shaking agressif
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
  // Optimisation du serveur de développement
  server: {
    fs: {
      // Ignorer les gros fichiers dans le dev
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
  },
  // Configuration ESBuild
  esbuild: {
    // Supprimer le console.log en production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimiser les imports
    treeShaking: true,
    // Minifier les noms
    minify: true,
  },
});
