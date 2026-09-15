import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

const SetupWizard = ({ onClose, onConfirm, onManualSetup, initialClanName = '', channelCount = 0 }) => {
  const { t } = useTranslation();
  const [clanName, setClanName] = useState(initialClanName || '');
  const [nameError, setNameError] = useState(false);
  const [options, setOptions] = useState({
    createRoles: true,
    createCategory: true,
    createText: true,
    createVoice: true
  });

  const isEstablished = Number(channelCount) >= 6;

  const toggleOption = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const handleConfirm = () => {
    if (!clanName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    if (typeof onConfirm === 'function') {
      onConfirm({ ...options, clanName: clanName.trim() });
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleManual = () => {
    if (typeof onManualSetup === 'function') {
      onManualSetup(clanName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {t('clan_wizard_title')}
            </h2>
            <button
              onClick={() => onClose?.()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t('clan_wizard_desc')}
          </p>
        </div>
        
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
          {isEstablished && (
            <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/80 dark:border-amber-700/80 dark:bg-amber-950/40 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {t('clan_wizard_established_warning_title') || 'Сервер уже имеет каналы'}
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-1 leading-relaxed">
                    {t('clan_wizard_established_warning_desc', { count: channelCount }) || `На вашем сервере уже создано ${channelCount} каналов. Мастер автоматической настройки предназначен только для чистых Discord серверов (< 6 каналов). Использование автонастройки может продублировать каналы или нарушить структуру. Рекомендуется настроить роли и каналы вручную.`}
                  </p>
                </div>
              </div>
              {onManualSetup && (
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex justify-end">
                  <button
                    type="button"
                    onClick={handleManual}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    {t('clan_wizard_btn_manual_recommended') || 'Настроить вручную (Рекомендуется)'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`p-4 rounded-xl border transition-all ${
            nameError 
              ? 'border-red-400 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30' 
              : 'border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20'
          }`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t('clan_wizard_name_label') || 'Название вашего клана'} *</span>
              {nameError && (
                <span className="text-red-500 normal-case font-medium text-xs">
                  {t('clan_name_required') || 'Обязательное поле'}
                </span>
              )}
            </label>
            <input
              type="text"
              required
              data-required="true"
              value={clanName}
              onChange={e => {
                setClanName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              placeholder={t('clan_name_placeholder') || 'Например: TITAN'}
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t('clan_wizard_name_desc') || 'Укажите название клана. Оно будет синхронизировано в эмбедах набора, сообщениях бота и веб-панелях.'}
            </p>
          </div>
          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createRoles} onChange={() => toggleOption('createRoles')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{t('clan_wizard_roles', 'Базовые роли')}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {t('clan_wizard_roles_desc', 'Проверяет существующие роли и привязывает их, либо создает недостающие: Leader, Deputy Leader, Коллер, Рекрутер, Основной состав, Испытательный срок, VIP с базовыми цветами.')}
              </p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createCategory} onChange={() => toggleOption('createCategory')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{t('clan_wizard_category', 'Категория "КЛАН ХАБ"')}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('clan_wizard_category_desc', 'Проверяет существующую категорию клана или создает основную категорию "КЛАН ХАБ".')}</p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createText} onChange={() => toggleOption('createText')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{t('clan_wizard_text', 'Текстовые каналы')}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('clan_wizard_text_desc', 'Проверяет существующие каналы и привязывает их, либо создает недостающие: logs, заявки, leaderboard, состав...')}</p>
            </div>
          </label>

          <label className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={options.createVoice} onChange={() => toggleOption('createVoice')} />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{t('clan_wizard_voice', 'Голосовые каналы')}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('clan_wizard_voice_desc', 'Проверяет существующие или создает базовые голосовые каналы.')}</p>
            </div>
          </label>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/30">
          <div>
            {onManualSetup && (
              <button
                type="button"
                onClick={handleManual}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors cursor-pointer"
              >
                {t('clan_wizard_manual')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t('clan_wizard_cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-colors cursor-pointer ${
                isEstablished ? 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEstablished ? (t('clan_wizard_btn_continue_anyway') || 'Всё равно продолжить') : t('clan_wizard_submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
