import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'mt-theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeClass = (resolved: 'light' | 'dark') => {
  const root = document.documentElement;
  const method = resolved === 'dark' ? 'add' : 'remove';
  root.classList[method]('dark');
  root.classList[method]('dark-mode'); // compatibilité avec AccessibilityPanel existant
  root.setAttribute('data-theme', resolved);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');

  const resolvedTheme = useMemo(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  }, [theme]);

  useEffect(() => {
    // Initialisation au montage du composant
    if (typeof window !== 'undefined' && !isInitialized) {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme = stored || 'system';
      setThemeState(initialTheme);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyThemeClass(e.matches ? 'dark' : 'light');
      }
    };

    if (isInitialized) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', handleSystemChange);
      return () => mql.removeEventListener('change', handleSystemChange);
    }
  }, [theme, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      applyThemeClass(resolvedTheme);
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, resolvedTheme, isInitialized]);

  const setTheme = (value: Theme) => {
    setThemeState(value);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  // Éviter le flash de thème au chargement
  if (!isInitialized) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
