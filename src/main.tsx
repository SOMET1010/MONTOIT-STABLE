import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query-config';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import App from './App.tsx';
import './index.css';
import './shared/styles/mobile-optimization.css';
import './shared/styles/breadcrumb.css';
import './shared/styles/premium-effects.css';
import './shared/styles/hero-spectacular.css';
import './shared/styles/header-footer-premium.css';

const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
