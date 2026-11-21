import DOMPurify from "dompurify";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Monitor, Sun, Moon, ShieldCheck, MessageCircle, Keyboard, RotateCcw, X, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getConfigKey, setConfigKey } from '../services/store';
import FullKeyboard from '../components/FullKeyboard';
import { useGamma } from '../contexts/GammaContext';
import { formatBindDisplay, isCombination, parseKeyEvent } from '../utils/keyboardMap';
import SupportTicketModal from '../components/SupportTicketModal';

export default function Gamma() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    gammaBind, setGammaBind,
    isNightVision,
    enableGamma, disableGamma,
    displays, selectedDisplay, setSelectedDisplay
  } = useGamma();
  const [showSuggestion, setShowSuggestion] = useState(!getConfigKey('gammaSuggestDismissed'));
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  // Shortcut recording modal state
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [recordedShortcut, setRecordedShortcut] = useState(null);
  const [recordingError, setRecordingError] = useState(null);
  const recorderRef = useRef(null);

  const handleKeyClick = (key) => {
    setGammaBind(key);
    setConfigKey('gammaBind', key);
  };

  const handleResetBind = () => {
    handleKeyClick('END');
  };

  // Keyboard capture when recording modal is open
  useEffect(() => {
    if (!isShortcutModalOpen) return;

    const handleKeyDown = (e) => {
      // Allow closing with Escape if no modifiers
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        setIsShortcutModalOpen(false);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const parsed = parseKeyEvent(e);
      if (parsed.requiresModifier) {
        setRecordingError(t('gamma_requires_modifier_tip'));
        setRecordedShortcut(null);
        return;
      }

      setRecordingError(null);
      if (parsed.isComplete) {
        setRecordedShortcut({
          bind: parsed.shortcutString,
          parts: parsed.displayParts
        });
      } else if (parsed.isModifierOnly) {
        setRecordedShortcut({
          bind: null,
          parts: parsed.displayParts,
          isHoldingModifiers: true
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShortcutModalOpen, t]);

  const handleSaveRecorded = () => {
    if (recordedShortcut?.bind) {
      handleKeyClick(recordedShortcut.bind);
      setIsShortcutModalOpen(false);
      setRecordedShortcut(null);
      setRecordingError(null);
    }
  };

  const handleClearBind = () => {
    handleKeyClick('');
    setIsShortcutModalOpen(false);
    setRecordedShortcut(null);
    setRecordingError(null);
  };

  const bindBadges = formatBindDisplay(gammaBind);
  const isMultiKey = isCombination(gammaBind);

  return (
    <div className="space-y-6 animate-main-fade-in">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/')} 
          className="group p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-orange-400/60 dark:hover:border-orange-500/50 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
          title={t('back', 'Назад')}
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:-translate-x-1 transition-all duration-200" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('gamma_title')}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('gamma_subtitle')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('gamma_title_desc')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {displays.length >= 2 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">{t('gamma_monitor_name')}:</span>
                {displays.map((disp, i) => {
                  const isSelected = selectedDisplay === disp;
                  const match = disp.match(/DISPLAY(\d+)/i);
                  const num = match ? match[1] : i + 1;
                  return (
                    <button 
                      key={disp}
                      onClick={() => {
                        if (disp !== selectedDisplay) {
                          setSelectedDisplay(disp);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-white dark:bg-slate-700 text-orange-500 dark:text-orange-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                      #{num}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Button 1: Day (Disable) */}
            <button
              onClick={disableGamma}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                !isNightVision
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600/50 ring-2 ring-amber-500/20 shadow-amber-500/10'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
              title={t('gamma_day_title')}
            >
              <Sun className={`w-4 h-4 shrink-0 ${!isNightVision ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{t('gamma_btn_day')}</span>
            </button>

            {/* Button 2: Night (Enable) */}
            <button
              onClick={enableGamma}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                isNightVision
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-500/30'
                  : 'bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700/60'
              }`}
              title={t('gamma_night_title')}
            >
              <Moon className={`w-4 h-4 shrink-0 ${isNightVision ? 'text-white' : 'text-orange-500'}`} />
              <span>{t('gamma_btn_night')}</span>
            </button>
          </div>
        </div>

        {/* --- Active Hotkey Control Bar --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('gamma_current_bind')}
            </span>

            {bindBadges.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {bindBadges.map((badge, idx) => (
                  <React.Fragment key={badge + idx}>
                    {idx > 0 && <span className="text-slate-400 font-bold text-xs">+</span>}
                    <kbd className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50 rounded-lg text-xs font-mono font-bold shadow-xs">
                      {badge}
                    </kbd>
                  </React.Fragment>
                ))}
                <span className="ml-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {isMultiKey ? t('gamma_combination_badge') : t('gamma_single_badge')}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('gamma_not_assigned')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Separate button for key combination assignment */}
            <button
              onClick={() => {
                setRecordedShortcut(null);
                setRecordingError(null);
                setIsShortcutModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>{t('gamma_btn_set_combination')}</span>
            </button>

            {/* Quick reset to standard End key */}
            <button
              onClick={() => handleKeyClick('END')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title={t('gamma_preset_end_hint')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('gamma_preset_end')}</span>
            </button>
          </div>
        </div>

        {/* --- Virtual Keyboard Section --- */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-4 mb-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 overflow-hidden relative">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">
            {t('gamma_single_click_hint')}
          </p>
          <FullKeyboard 
            binds={!isMultiKey && gammaBind ? { [gammaBind]: 'gamma' } : {}} 
            gammaBind={!isMultiKey ? gammaBind : ''}
            onKeyClick={handleKeyClick} 
          />
          
          {showSuggestion && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md text-center animate-in fade-in zoom-in duration-300">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{t('gamma_suggest_title')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(t('gamma_suggest_desc'))}}></p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => {
                      handleKeyClick('END');
                      setShowSuggestion(false);
                      setConfigKey('gammaSuggestDismissed', true);
                    }} 
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                  >
                    {t('gamma_suggest_accept')}
                  </button>
                  <button 
                    onClick={() => {
                      setShowSuggestion(false);
                      setConfigKey('gammaSuggestDismissed', true);
                    }} 
                    className="px-5 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    {t('gamma_suggest_reject')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {t('gamma_safety_note')}
          </p>
        </div>

        <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setIsSupportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-400 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {t('support_button')}
          </button>
          
          <button 
            className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            onClick={handleResetBind}
          >
            {t('reset_defaults')}
          </button>
        </div>
      </div>

      {/* --- Shortcut / Combination Recording Modal --- */}
      {isShortcutModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            ref={recorderRef}
            tabIndex={0}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full space-y-6 focus:outline-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t('gamma_modal_title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('gamma_single_badge')} / {t('gamma_combination_badge')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShortcutModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('gamma_modal_desc')}
            </p>

            {/* Interactive Recording Box */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-orange-400/60 dark:border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col items-center justify-center min-h-[110px] text-center gap-3 transition-all">
              {recordedShortcut?.parts && recordedShortcut.parts.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap justify-center animate-in zoom-in-95 duration-150">
                  {recordedShortcut.parts.map((p, idx) => (
                    <React.Fragment key={p + idx}>
                      {idx > 0 && <span className="text-orange-500 font-bold text-sm">+</span>}
                      <kbd className="px-3.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold shadow-md ring-2 ring-orange-500/20">
                        {p}
                      </kbd>
                    </React.Fragment>
                  ))}
                  {recordedShortcut.bind && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ml-1 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>{t('gamma_modal_press_hint')}</span>
                </div>
              )}

              {recordingError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{recordingError}</span>
                </div>
              )}
            </div>

            {/* Security notice */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal">
              {t('gamma_security_notice')}
            </p>

            {/* Modal actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearBind}
                className="px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                {t('gamma_modal_clear')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsShortcutModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t('gamma_modal_cancel')}
                </button>

                <button
                  type="button"
                  disabled={!recordedShortcut?.bind}
                  onClick={handleSaveRecorded}
                  className="px-5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  {t('gamma_modal_save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SupportTicketModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </div>
  );
}
