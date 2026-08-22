import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap, Battery, ShieldAlert, Cpu, ExternalLink, Edit3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SupportTicketModal from '../components/SupportTicketModal';

const electron = window.electronAPI ? window.electronAPI : null;

import { getElectricityData } from '../data/electricityData';

export default function Electricity() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const schemesData = React.useMemo(() => getElectricityData(t), [t]);

  const handleSuggestCorrection = () => {
    setIsTicketModalOpen(true);
  };

  const openRustrician = (url) => {
    if (electron && electron.shell) {
      electron.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };
  if (selectedScheme) {
    return (
      <>
      <div className="space-y-6 animate-main-fade-in max-w-4xl mx-auto pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedScheme(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {selectedScheme.title}
            </h1>
          </div>
          <button 
            onClick={() => window.open(selectedScheme.rustricianUrl, '_blank')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl font-bold transition-all border border-indigo-200 dark:border-indigo-500/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">{t('elec_rustrician_btn')}</span>
            <span className="sm:hidden">Rustrician</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden p-5 sm:p-8">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-800/50">
              <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-500 mb-1 flex items-center gap-2"><Zap className="w-4 h-4"/> {t('elec_consumption')}</h3>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-400">{selectedScheme.power}</p>
            </div>
            <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-500 mb-1 flex items-center gap-2"><Battery className="w-4 h-4"/> {t('elec_battery_reserve')}</h3>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">{selectedScheme.reserve}</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('elec_desc_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {selectedScheme.description}
            </p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              {t('elec_components')}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 mb-8">
              {selectedScheme.components.map((comp, idx) => (
                <li key={idx} className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {comp}
                </li>
              ))}
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-5 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-indigo-800 dark:text-indigo-200 m-0 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: t('elec_note_important') + ' ' + selectedScheme.note}}>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl">
            <p className="text-sm font-medium text-slate-500">{t('elec_error_desc')}</p>
            <button 
              onClick={handleSuggestCorrection}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              {t('elec_propose_btn')}
            </button>
          </div>
        </div>
      </div>
      <SupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
      </>
    );
  }

  return (
    <div className="space-y-6 animate-main-fade-in pb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('electricity_title')}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemesData.map((item, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedScheme(item)}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all group flex flex-col transform hover:-translate-y-1"
          >
            <div className="h-40 w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800 relative">
              <Cpu className="w-16 h-16 text-blue-500/20 group-hover:text-blue-500/40 transition-colors mb-2" />
              <div className="flex items-center gap-2 mt-auto">
                <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {item.power}
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Battery className="w-3 h-3" /> {item.reserve}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-500 transition-colors">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1 leading-relaxed">
                {item.desc}
              </p>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                {t('elec_view_scheme')} &rarr;
              </div>
            </div>
          </div>
        ))}
      </div>
      <SupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
    </div>
  );
}
