import { createContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

const STORAGE_KEY = 'fta_theme';

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to persist theme', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

