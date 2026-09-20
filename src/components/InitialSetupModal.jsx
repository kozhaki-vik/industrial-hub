import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Palette, Check, ArrowRight, Sparkles, Power } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { setConfigKey } from '../services/store';
import ThemeSelector from './ThemeSelector';

export default function InitialSetupModal({ isOpen, onComplete }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [selectedLang, setSelectedLang] = useState(() => i18n.language || 'ru');
  const [selectedTheme, setSelectedTheme] = useState(() => theme || 'dark');
  const [autoStart, setAutoStart] = useState(true);

  useEffect(() => {
    if (window.electronAPI?.app?.getAutoStart) {
      window.electronAPI.app.getAutoStart().then((enabled) => {
        if (typeof enabled === 'boolean') {
          setAutoStart(enabled);
        }
      }).catch(() => {});
    }
  }, []);

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

    if (window.electronAPI?.app?.setAutoStart) {
      window.electronAPI.app.setAutoStart(autoStart);
    }

    if (onComplete) {
      onComplete();
    }
  };

  const languages = [
    { code: 'ru', name: 'Русский', native: 'Русский' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ua', name: 'Українська', native: 'Українська' }
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
          <ThemeSelector value={selectedTheme} onChange={handleSelectTheme} />
        </div>

        {/* AutoStart Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-orange-500" />
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('initial_setup_autostart_title', 'Автозапуск при старте Windows')}
            </label>
          </div>
          <div
            onClick={() => setAutoStart(!autoStart)}
            className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
              autoStart
                ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                autoStart 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                <Power className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('initial_setup_autostart_title', 'Автозапуск при старте Windows')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('initial_setup_autostart_desc', 'Запускать Industrial Hub в фоне при включении ПК (безопасно, без нагрузки)')}
                </div>
              </div>
            </div>

            {/* Switch slider */}
            <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
              autoStart ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                autoStart ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
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
