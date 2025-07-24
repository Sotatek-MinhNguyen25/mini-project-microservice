import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// Hook to manage theme
const useTheme = (defaultTheme: Theme = 'light') => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      return (storedTheme as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return { theme, toggleTheme, setSpecificTheme };
};

export default useTheme;