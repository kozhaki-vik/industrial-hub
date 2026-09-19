/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('industrial-hub-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'discord') {
      return savedTheme;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Включаем темный режим для темной темы и темы Discord (для Tailwind dark: селекторов)
    if (theme === 'dark' || theme === 'discord') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Включаем специальный класс для палитры Discord
    if (theme === 'discord') {
      root.classList.add('theme-discord');
    } else {
      root.classList.remove('theme-discord');
    }

    localStorage.setItem('industrial-hub-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'discord';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
