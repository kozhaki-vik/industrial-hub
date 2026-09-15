import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Palette, Moon, Sun, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { setConfigKey } from '../services/store';

export default function InitialSetupModal({ isOpen, onComplete }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [selectedLang, setSelectedLang] = useState(() => i18n.language || 'ru');
  const [selectedTheme, setSelectedTheme] = useState(() => theme || 'dark');

  if (!isOpen) return null;

  const handleSelectLang = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
  };

  const handleSelectTheme = (th) => {
    setSelectedTheme(th);
    setTheme(th);
  };

  const handleConfirm = () => {
    // Save selections
    i18n.changeLanguage(selectedLang);
    setTheme(selectedTheme);
    localStorage.setItem('industrial-hub-lang', selectedLang);
    localStorage.setItem('industrial-hub-theme', selectedTheme);
    localStorage.setItem('industrial-hub-initial-setup', 'true');
    setConfigKey('language', selectedLang);
    setConfigKey('theme', selectedTheme);
    setConfigKey('initialSetupCompleted', true);

    if (onComplete) {
      onComplete();
    }
  };

  const languages = [
    { code: 'ru', name: 'Русский', native: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'ua', name: 'Українська', native: 'Українська', flag: '🇺🇦' }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t('initial_setup_title', 'Добро пожаловать в Industrial Hub!')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('initial_setup_desc', 'Выберите язык интерфейса и тему для начала комфортной работы.')}
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-500" />
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('initial_setup_lang_title', 'Язык интерфейса')}
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {languages.map((item) => {
              const isSelected = selectedLang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLang(item.code)}
                  className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl leading-none">{item.flag}</span>
                  <span className="text-xs font-semibold">{item.native}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-500" />
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('initial_setup_theme_title', 'Тема оформления')}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => handleSelectTheme('dark')}
              className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 text-left ${
                selectedTheme === 'dark'
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-orange-400 shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('initial_setup_theme_dark', 'Тёмная')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {t('initial_setup_theme_dark_desc', 'Для ночных рейдов')}
                </div>
              </div>
              {selectedTheme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Light Theme */}
            <button
              type="button"
              onClick={() => handleSelectTheme('light')}
              className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 text-left ${
                selectedTheme === 'light'
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('initial_setup_theme_light', 'Светлая')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {t('initial_setup_theme_light_desc', 'Классический стиль')}
                </div>
              </div>
              {selectedTheme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('initial_setup_continue', 'Применить и продолжить')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
