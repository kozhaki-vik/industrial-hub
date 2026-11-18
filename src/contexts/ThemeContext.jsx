/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_CUSTOM_THEME, generateThemeCss } from '../utils/themeUtils';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [customTheme, setCustomTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('industrial-hub-custom-theme');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse custom theme from localStorage:', e);
    }
    return null;
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('industrial-hub-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'discord' || savedTheme === 'custom') {
      // If 'custom' is selected but no customTheme is saved yet, fallback to dark
      if (savedTheme === 'custom') {
        const hasSavedCustom = localStorage.getItem('industrial-hub-custom-theme');
        if (!hasSavedCustom) return 'dark';
      }
      return savedTheme;
    }
    return 'dark';
  });

  // Apply theme styles to document root
  const applyThemeToDOM = useCallback((activeTheme, activeCustomTheme) => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('theme-dark', 'theme-discord', 'theme-light', 'theme-custom');

    let customStyleTag = document.getElementById('industrial-hub-custom-theme');

    if (activeTheme === 'custom' && activeCustomTheme) {
      root.classList.add('dark');
      root.classList.add('theme-custom');

      if (!customStyleTag) {
        customStyleTag = document.createElement('style');
        customStyleTag.id = 'industrial-hub-custom-theme';
        document.head.appendChild(customStyleTag);
      }
      customStyleTag.textContent = generateThemeCss(activeCustomTheme);
    } else {
      if (customStyleTag) {
        customStyleTag.remove();
      }
      if (activeTheme === 'dark' || activeTheme === 'discord') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.classList.add(`theme-${activeTheme}`);
    }
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme, customTheme);
    localStorage.setItem('industrial-hub-theme', theme);
  }, [theme, customTheme, applyThemeToDOM]);

  const saveCustomTheme = (newCustomTheme) => {
    const themeToSave = newCustomTheme || DEFAULT_CUSTOM_THEME;
    setCustomTheme(themeToSave);
    localStorage.setItem('industrial-hub-custom-theme', JSON.stringify(themeToSave));
    setTheme('custom');
  };

  const deleteCustomTheme = () => {
    localStorage.removeItem('industrial-hub-custom-theme');
    setCustomTheme(null);
    const customStyleTag = document.getElementById('industrial-hub-custom-theme');
    if (customStyleTag) {
      customStyleTag.remove();
    }
    if (theme === 'custom') {
      setTheme('dark');
    }
  };

  // Preview custom theme live on the app without permanently saving
  const applyLivePreview = (previewThemeObj) => {
    applyThemeToDOM('custom', previewThemeObj);
  };

  // Restore the real active theme when exiting preview
  const restoreActiveTheme = () => {
    applyThemeToDOM(theme, customTheme);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'discord';
      if (prev === 'discord') {
        return customTheme ? 'custom' : 'light';
      }
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      customTheme, 
      hasCustomTheme: Boolean(customTheme),
      saveCustomTheme, 
      deleteCustomTheme,
      applyLivePreview,
      restoreActiveTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
