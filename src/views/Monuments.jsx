import DOMPurify from "dompurify";
import React, { useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowLeft, Search, AlertCircle, Map as MapIcon, Shield, PlayCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SupportTicketModal from '../components/SupportTicketModal';

import { getMonumentsData } from '../data/monumentsData';

export default function Monuments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMonument, setSelectedMonument] = useState(null);
  const monumentsData = useMemo(() => getMonumentsData(t), [t]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 1500);
  };

  const filteredMonuments = useMemo(() => {
    let result = monumentsData.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result;
  }, [searchQuery, monumentsData]);

  const handleSuggestCorrection = () => {
    setIsTicketModalOpen(true);
  };

  const renderCardBadge = (color) => {
    const colorMap = {
      'green': 'bg-emerald-500',
      'blue': 'bg-blue-500',
      'red': 'bg-red-500'
    };
    const labelMap = {
      'green': t('mon_card_green'),
      'blue': t('mon_card_blue'),
      'red': t('mon_card_red')
    };
    return (
      <span key={color} className={`${colorMap[color]} text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
        {labelMap[color]}
      </span>
    );
  };

  if (selectedMonument) {
    return (
      <>
      <div className="space-y-6 animate-main-fade-in max-w-4xl mx-auto pb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedMonument(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {selectedMonument.name}
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header Image */}
          <div className="h-48 sm:h-64 bg-slate-800 w-full relative">
            <img 
              src={selectedMonument.image} 
              alt={selectedMonument.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="flex gap-2">
                {selectedMonument.cards.map(renderCardBadge)}
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold text-sm">{t('mon_rad_title')} {selectedMonument.rads > 0 ? selectedMonument.rads : t('mon_rad_none')}</span>
              </div>
            </div>
          </div>
          
          <div className="p-5 sm:p-8">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('mon_desc_title')}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                {selectedMonument.description}
              </p>

              {selectedMonument.videoGuide && (
                <div className="mb-8">
                  <button 
                    onClick={() => window.open(selectedMonument.videoGuide, '_blank')}
                    className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm w-full sm:w-auto"
                  >
                    <PlayCircle className="w-6 h-6" />
                    <span>{t('mon_video_guide')}</span>
                  </button>
                </div>
              )}
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-indigo-500" />
                {t('mon_puzzle_title')}
              </h2>
              <ol className="mb-8 space-y-3 list-decimal pl-5 text-slate-700 dark:text-slate-300">
                {selectedMonument.puzzle.map((step, idx) => (
                  <li key={idx} className="pl-2 leading-relaxed">{step}</li>
                ))}
              </ol>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('mon_loot_title')}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 mb-8">
                {selectedMonument.loot.map((item, idx) => (
                  <li key={idx} className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-indigo-500">•</span> {item}
                  </li>
                ))}
              </ul>

              {selectedMonument.sections && selectedMonument.sections.map((section, idx) => (
                <div key={idx} className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{section.title}</h2>
                  {section.image && (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-950">
                      <img src={section.image} alt={section.title} className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                  )}
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}

              {selectedMonument.rads > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 p-4 rounded-r-lg my-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-orange-800 dark:text-orange-200 m-0 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(t('mon_note_rad').replace('Примечание о радиации:', '<strong>Примечание о радиации:</strong>').replace('Radiation Note:', '<strong>Radiation Note:</strong>').replace('Примітка щодо радіації:', '<strong>Примітка щодо радіації:</strong>'))}}>
                    </p>
                  </div>
                </div>
              )}

              {selectedMonument.cctv && selectedMonument.cctv.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-500" />
                    {t('mon_cctv_title')}
                  </h2>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex flex-wrap gap-2">
                    {selectedMonument.cctv.map((code) => {
                      const isCopied = copiedCode === code;
                      return (
                        <button
                          key={code}
                          onClick={() => handleCopyCode(code)}
                          title={t('mon_cctv_hint')}
                          className={`
                            relative px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all overflow-hidden
                            ${isCopied 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm border border-slate-200 dark:border-slate-700'
                            }
                          `}
                        >
                          <span className={`transition-opacity duration-200 ${isCopied ? 'opacity-0' : 'opacity-100'}`}>
                            {code}
                          </span>
                          <span className={`absolute inset-0 flex items-center justify-center font-sans font-bold transition-opacity duration-200 ${isCopied ? 'opacity-100' : 'opacity-0'}`}>
                            {t('mon_cctv_copied')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl">
              <p className="text-sm font-medium text-slate-500">{t('mon_error_desc')}</p>
              <button 
                onClick={handleSuggestCorrection}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-auto"
              >
                {t('suggest_correction')}
              </button>
              </div>
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
          {t('monuments_title')}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_monuments')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMonuments.length > 0 ? filteredMonuments.map((monument) => (
          <div 
            key={monument.id} 
            onClick={() => setSelectedMonument(monument)}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all group flex flex-col transform hover:-translate-y-1"
          >
            <div className="h-48 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img 
                src={monument.image} 
                alt={monument.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute top-3 right-3 flex gap-1">
                {monument.cards.map(renderCardBadge)}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-500 transition-colors">{monument.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                {monument.shortDesc}
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                {monument.facilities.map((fac, idx) => (
                  <span key={idx} className={fac.includes('🏆') ? 'text-indigo-500 font-bold' : ''}>{fac}</span>
                ))}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">{t('mon_not_found')}</p>
          </div>
        )}
      </div>
      <SupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
    </div>
  );
}
