import React, { useContext, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import { Megaphone, Eye, EyeOff } from 'lucide-react';

export default function AdsTab() {
  const {
    t,
    config,
    queueAutoSave,
    saveConfig,
    isFullScreenWindow,
    showDiscordLivePreview,
    setShowDiscordLivePreview
  } = useContext(ClanManagerContext);

  const aConfig = useMemo(() => {
    const defaults = {
      title: t('clan_auto_169', t('clan_ads_buy', 'Покупка рекламы')),
      text: t('clan_auto_230', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
      banner: 'https://i.imgur.com/example.png',
      priceLink: 'https://telegra.ph/price',
    };
    try {
      if (config?.adConfigJson) {
        const parsed = typeof config.adConfigJson === 'string'
          ? JSON.parse(config.adConfigJson)
          : config.adConfigJson;
        return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  }, [config?.adConfigJson, t]);

  const updateAConfig = useCallback((key, val, immediate = false) => {
    const newConfig = { ...aConfig, [key]: val };
    const updated = { ...config, adConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, immediate);
  }, [aConfig, config, queueAutoSave]);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
          <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
          {t('clan_auto_65', 'Настройки панели рекламы')}
        </h3>
        {isFullScreenWindow && (
          <button
            type="button"
            onClick={() => setShowDiscordLivePreview(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              showDiscordLivePreview
                ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
            }`}
            title={showDiscordLivePreview ? t('clan_auto_v2_1034', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1035', 'Показать живой предпросмотр Discord')}
          >
            {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showDiscordLivePreview ? t('clan_auto_v2_1036', 'Превью Discord') : t('clan_auto_v2_1037', 'Включить превью')}</span>
          </button>
        )}
      </div>

      <div className="space-y-5 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('clan_auto_66', 'Заголовок Embed-сообщения *')}
          </label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
            value={aConfig.title || ''}
            onChange={e => updateAConfig('title', e.target.value, false)}
            onBlur={e => updateAConfig('title', e.target.value, true)}
            placeholder={t('clan_auto_111', t('clan_ads_buy', 'Покупка рекламы'))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('clan_auto_67', 'Текст *')}
          </label>
          <textarea 
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px] resize-none"
            value={aConfig.text || ''}
            onChange={e => updateAConfig('text', e.target.value, false)}
            onBlur={e => updateAConfig('text', e.target.value, true)}
            placeholder={t('clan_auto_112', 'Информация о рекламе...')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('clan_auto_68', 'Ссылка на Прайс-лист (Telegraph / Сайт)')}
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
            value={aConfig.priceLink || ''}
            onChange={e => updateAConfig('priceLink', e.target.value, false)}
            onBlur={e => updateAConfig('priceLink', e.target.value, true)}
            placeholder="https://telegra.ph/..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('clan_auto_69', 'Ссылка на баннер (Изображение)')}
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
            value={aConfig.banner || ''}
            onChange={e => updateAConfig('banner', e.target.value, false)}
            onBlur={e => updateAConfig('banner', e.target.value, true)}
            placeholder="https://i.imgur.com/..."
          />
        </div>
      </div>
    </form>
  );
}
