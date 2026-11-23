import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Palette, Check, ArrowRight, ArrowLeft, Sparkles, Power, Minimize2, Bell, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { setConfigKey } from '../services/store';
import ThemeSelector from './ThemeSelector';

export default function InitialSetupModal({ isOpen, onComplete }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [step, setStep] = useState(1);

  const [selectedLang, setSelectedLang] = useState(() => i18n.language || 'ru');
  const [selectedTheme, setSelectedTheme] = useState(() => theme || 'dark');
  const [autoStart, setAutoStart] = useState(true);
  
  const [startMinimized, setStartMinimized] = useState(() => {
    return localStorage.getItem('industrial-hub-start-minimized') === 'true' || false;
  });
  
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => {
    const val = localStorage.getItem('industrial-hub-show-release-notes');
    return val === null ? true : val === 'true';
  });

  const [telemetryEnabled, setTelemetryEnabled] = useState(() => {
    return localStorage.getItem('hub_telemetry_enabled') !== 'false';
  });

  useEffect(() => {
    if (window.electronAPI?.app?.getAutoStart) {
      window.electronAPI.app.getAutoStart().then((enabled) => {
        if (typeof enabled === 'boolean') {
          setAutoStart(enabled);
        }
      }).catch(() => {});
    }
    if (window.electronAPI?.app?.getStartMinimizedToTray) {
      window.electronAPI.app.getStartMinimizedToTray().then((enabled) => {
        if (typeof enabled === 'boolean') {
          setStartMinimized(enabled);
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

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirm = () => {
    // Save selections
    i18n.changeLanguage(selectedLang);
    setTheme(selectedTheme);
    localStorage.setItem('industrial-hub-lang', selectedLang);
    localStorage.setItem('industrial-hub-theme', selectedTheme);
    localStorage.setItem('industrial-hub-initial-setup', 'true');
    localStorage.setItem('industrial-hub-start-minimized', startMinimized);
    localStorage.setItem('industrial-hub-show-release-notes', showReleaseNotes);
    localStorage.setItem('hub_telemetry_enabled', telemetryEnabled ? 'true' : 'false');
    setConfigKey('language', selectedLang);
    setConfigKey('theme', selectedTheme);
    setConfigKey('initialSetupCompleted', true);

    if (window.electronAPI?.app?.setAutoStart) {
      window.electronAPI.app.setAutoStart(autoStart);
    }
    if (window.electronAPI?.app?.setStartMinimizedToTray) {
      window.electronAPI.app.setStartMinimizedToTray(startMinimized);
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

  const getStepTitle = () => {
    switch(step) {
      case 1: return t('initial_setup_lang_title', 'Язык интерфейса');
      case 2: return t('initial_setup_theme_title', 'Тема оформления');
      case 3: return t('initial_setup_settings_title', 'Настройки запуска');
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
        
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
              {getStepTitle()} ({step}/3)
            </p>
          </div>
        </div>

        {/* Step 1: Language */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {languages.map((item) => {
                const isSelected = selectedLang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLang(item.code)}
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Globe className={`w-7 h-7 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold">{item.native}</span>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
            <ThemeSelector 
              value={selectedTheme} 
              onChange={handleSelectTheme} 
              gridClassName="grid-cols-1 sm:grid-cols-2 gap-4"
            />
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-3.5 animate-in slide-in-from-right-4 fade-in">
            {/* AutoStart */}
            <div
              onClick={() => setAutoStart(!autoStart)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                autoStart
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  autoStart ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('initial_setup_autostart_title', 'Автозапуск при старте Windows')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('initial_setup_autostart_desc', 'Запускать Industrial Hub в фоне при включении ПК')}
                  </div>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
                autoStart ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  autoStart ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Start Minimized */}
            <div
              onClick={() => setStartMinimized(!startMinimized)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                startMinimized
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  startMinimized ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Minimize2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('settings_start_minimized_title', 'Запускать свернутой в трей')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('settings_start_minimized_desc', 'Не показывать окно программы при запуске')}
                  </div>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
                startMinimized ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  startMinimized ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Show Release Notes */}
            <div
              onClick={() => setShowReleaseNotes(!showReleaseNotes)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                showReleaseNotes
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  showReleaseNotes ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('settings_show_release_notes_title', 'Показывать обновления')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('settings_show_release_notes_desc', 'Окно с изменениями после обновления')}
                  </div>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
                showReleaseNotes ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  showReleaseNotes ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Anonymous Diagnostic Telemetry */}
            <div
              onClick={() => setTelemetryEnabled(!telemetryEnabled)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                telemetryEnabled
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  telemetryEnabled ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('initial_setup_telemetry_title', 'Анонимная диагностическая телеметрия')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('initial_setup_telemetry_desc', 'Отправка базовых характеристик ПК для улучшения стабильности')}
                  </div>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 shrink-0 ${
                telemetryEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  telemetryEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy & License Notice */}
        <div className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1 leading-relaxed">
          {t('initial_setup_legal_prefix', 'Продолжая, вы соглашаетесь с')}{' '}
          <a
            href="https://github.com/kozhaki-vik/industrial-hub/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (window.electronAPI?.app?.openExternal) {
                e.preventDefault();
                window.electronAPI.app.openExternal('https://github.com/kozhaki-vik/industrial-hub/blob/main/LICENSE');
              }
            }}
            className="text-orange-500 hover:underline font-medium"
          >
            {t('initial_setup_license_link', 'Лицензией MIT')}
          </a>{' '}
          {t('initial_setup_and', 'и')}{' '}
          <a
            href="https://github.com/kozhaki-vik/industrial-hub/blob/main/PRIVACY.md"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (window.electronAPI?.app?.openExternal) {
                e.preventDefault();
                window.electronAPI.app.openExternal('https://github.com/kozhaki-vik/industrial-hub/blob/main/PRIVACY.md');
              }
            }}
            className="text-orange-500 hover:underline font-medium"
          >
            {t('initial_setup_privacy_link', 'Политикой конфиденциальности')}
          </a>.
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back', 'Назад')}</span>
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('next', 'Далее')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-7 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('initial_setup_finish', 'Завершить')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
