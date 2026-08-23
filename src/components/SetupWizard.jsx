import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { setConfigKey } from '../services/store';

export default function SetupWizard({ onComplete }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const [step, setStep] = useState(1); // 1: Language, 2: Theme

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ua', name: 'Українська', flag: '🇺🇦' }
  ];

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    setConfigKey('language', langCode);
    setTimeout(() => setStep(2), 300);
  };

  const handleThemeSelect = (themeName) => {
    setTheme(themeName);
    // Let the user see the theme change before advancing
  };

  const handleFinish = () => {
    setConfigKey('setupCompleted', true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500 animate-main-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-8 md:p-10 text-center relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-orange-500 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {step === 1 && (
          <div className="animate-main-fade-in">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Выберите язык</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Choose your preferred language / Оберіть мову</p>
            
            <div className="grid gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    i18n.language === lang.code 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`font-semibold ${i18n.language === lang.code ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {lang.name}
                    </span>
                  </div>
                  {i18n.language === lang.code && <CheckCircle className="w-5 h-5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-main-fade-in">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {theme === 'dark' ? <Moon className="w-8 h-8 text-purple-500" /> : <Sun className="w-8 h-8 text-orange-500" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('settings_theme_title') || 'Выберите тему'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t('settings_theme_desc') || 'Светлая или темная'}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleThemeSelect('light')}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                  theme === 'light' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-slate-100 hover:border-orange-300 bg-white'
                }`}
              >
                <Sun className={`w-10 h-10 mb-4 ${theme === 'light' ? 'text-orange-500' : 'text-slate-400'}`} />
                <span className={`font-bold ${theme === 'light' ? 'text-orange-700' : 'text-slate-600'}`}>Светлая</span>
              </button>
              
              <button
                onClick={() => handleThemeSelect('dark')}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'border-purple-500 bg-purple-900/20' 
                    : 'border-slate-800 hover:border-purple-700 bg-slate-900'
                }`}
              >
                <Moon className={`w-10 h-10 mb-4 ${theme === 'dark' ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className={`font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-slate-400'}`}>Темная</span>
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
            >
              Начать работу
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
