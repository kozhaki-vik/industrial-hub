import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Monitor, Sun, Moon, ShieldCheck, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getConfigKey, setConfigKey } from '../services/store';
import FullKeyboard from '../components/FullKeyboard';
import { useGamma } from '../contexts/GammaContext';
import SupportTicketModal from '../components/SupportTicketModal';

const electron = window.electronAPI ? window.electronAPI : null;

export default function Gamma() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    gammaBind, setGammaBind,
    enableGamma, disableGamma,
    displays, selectedDisplay, setSelectedDisplay
  } = useGamma();
  const [showSuggestion, setShowSuggestion] = React.useState(!getConfigKey('gammaSuggestDismissed'));
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleKeyClick = (key) => {
    setGammaBind(key);
    setConfigKey('gammaBind', key);
  };

  const handleResetBind = () => {
    handleKeyClick('END');
  };

  return (
    <div className="space-y-6 animate-main-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('gamma_title')}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-slate-100">{t('gamma_subtitle')}</h2>
              <p className="text-sm text-slate-500">{t('gamma_title_desc')}</p>
            </div>
          </div>

          {displays.length >= 2 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('gamma_monitor_select')}</span>
              <div className="flex gap-2">
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400'}`}
                    >
                      {t('gamma_monitor_name')} {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>



        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-4 mb-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 overflow-hidden relative">
          <h3 className="text-slate-500 mb-4">{t('bind_key_hint')}</h3>
          <FullKeyboard binds={{ [gammaBind]: 'gamma' }} onKeyClick={handleKeyClick} />
          
          {showSuggestion && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md text-center animate-in fade-in zoom-in duration-300">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{t('gamma_suggest_title')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6" dangerouslySetInnerHTML={{ __html: t('gamma_suggest_desc') }}></p>
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

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center cursor-pointer hover:border-orange-500 transition-colors"
               onClick={disableGamma}>
            <Sun className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t('gamma_day_title')}</h3>
            <p className="text-xs text-slate-500">{t('gamma_day_desc')}</p>
          </div>
          <div className="flex-1 bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-200 dark:border-orange-800 text-center cursor-pointer hover:border-orange-500 transition-colors"
               onClick={enableGamma}>
            <Moon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-bold text-orange-700 dark:text-orange-200 mb-1">{t('gamma_night_title')}</h3>
            <p className="text-xs text-orange-500/70">{t('gamma_night_desc')}</p>
          </div>
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
      <SupportTicketModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </div>
  );
}
