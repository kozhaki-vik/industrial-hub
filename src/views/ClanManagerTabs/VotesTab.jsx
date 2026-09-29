import React, { useContext, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Vote, Eye, EyeOff, Trash2, Plus
} from 'lucide-react';
import { ToggleSwitch } from '../ClanManager';

// Memoized single vote template card
const VoteTemplateCard = React.memo(function VoteTemplateCard({
  tpl,
  index,
  t,
  onUpdate,
  onRemove
}) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30 relative">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
        title={t('clan_remove_template', 'Удалить шаблон')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_vote_title_label', 'Заголовок *')}
          </label>
          <input 
            type="text" 
            required 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            value={tpl.name || ''} 
            onChange={e => onUpdate(index, 'name', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'name', e.target.value, true)}
            placeholder={t('clan_vote_title_placeholder', 'Вайп на Растрории')} 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_auto_54', 'День вайпа')}
          </label>
          <select 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer" 
            value={tpl.day || t('clan_thursday', 'Четверг')} 
            onChange={e => onUpdate(index, 'day', e.target.value, true)}
          >
            <option value="Понедельник">{t('clan_auto_55', t('clan_monday', 'Понедельник'))}</option>
            <option value="Вторник">{t('clan_auto_56', t('clan_tuesday', 'Вторник'))}</option>
            <option value="Среда">{t('clan_auto_57', t('clan_wednesday', 'Среда'))}</option>
            <option value="Четверг">{t('clan_auto_58', t('clan_thursday', 'Четверг'))}</option>
            <option value="Пятница">{t('clan_auto_59', t('clan_friday', 'Пятница'))}</option>
            <option value="Суббота">{t('clan_auto_60', t('clan_saturday', 'Суббота'))}</option>
            <option value="Воскресенье">{t('clan_auto_61', t('clan_sunday', 'Воскресенье'))}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_auto_62', 'Время (МСК)')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            value={tpl.time || ''} 
            onChange={e => onUpdate(index, 'time', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'time', e.target.value, true)}
            placeholder="16:00" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_server_ip_label_opt', 'IP (connect ...) (опционально)')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            value={tpl.ip || ''} 
            onChange={e => onUpdate(index, 'ip', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'ip', e.target.value, true)}
            placeholder="connect 127.0.0.1:28015" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_auto_63', 'Ссылка на баннер')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            value={tpl.banner || ''} 
            onChange={e => onUpdate(index, 'banner', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'banner', e.target.value, true)}
            placeholder="https://i.imgur.com/..." 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('clan_vote_desc_label', 'Описание голосования')}
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            rows="3"
            value={tpl.description || ''}
            onChange={e => onUpdate(index, 'description', e.target.value, false)}
            onBlur={e => onUpdate(index, 'description', e.target.value, true)}
            placeholder={t('clan_vote_desc_placeholder', 'Например: Подключаемся на мейн сервер после 16:00. Всем быть в дискорде!')}
          />
        </div>
        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('clan_vote_anonymous_title', 'Анонимное голосование')}
            </label>
            <p className="text-xs text-slate-500">
              {t('clan_vote_anonymous_desc', 'Скрывает список проголосовавших, показывая только количество голосов.')}
            </p>
          </div>
          <ToggleSwitch 
            checked={tpl.isAnonymous === true} 
            onChange={() => onUpdate(index, 'isAnonymous', tpl.isAnonymous !== true, true)} 
          />
        </div>
      </div>
    </div>
  );
});

export default function VotesTab() {
  const {
    t,
    config,
    queueAutoSave,
    saveConfig,
    isFullScreenWindow,
    showDiscordLivePreview,
    setShowDiscordLivePreview
  } = useContext(ClanManagerContext);

  const wTemplates = useMemo(() => {
    try {
      if (config?.wipeTemplatesJson) {
        return typeof config.wipeTemplatesJson === 'string'
          ? JSON.parse(config.wipeTemplatesJson)
          : config.wipeTemplatesJson;
      }
    } catch {}
    return [];
  }, [config?.wipeTemplatesJson]);

  const updateTemplate = useCallback((index, key, val, immediate = false) => {
    const newTemplates = [...wTemplates];
    newTemplates[index] = { ...newTemplates[index], [key]: val };
    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
    queueAutoSave(updated, immediate);
  }, [wTemplates, config, queueAutoSave]);

  const addTemplate = useCallback(() => {
    const newTemplates = [
      ...wTemplates,
      {
        name: 'Вайп на Растрории',
        description: 'Отметьтесь, пожалуйста, о вашем присутствии на вайпе!',
        isAnonymous: false,
        day: t('clan_auto_232', t('clan_thursday', 'Четверг')),
        time: '16:00',
        ip: '',
        banner: ''
      }
    ];
    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
    queueAutoSave(updated, true);
  }, [wTemplates, config, queueAutoSave, t]);

  const removeTemplate = useCallback((index) => {
    const newTemplates = wTemplates.filter((_, i) => i !== index);
    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
    queueAutoSave(updated, true);
  }, [wTemplates, config, queueAutoSave]);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
          <Vote className="w-5 h-5 mr-2 text-blue-500" />
          {t('clan_auto_52', 'Шаблоны серверов для голосований')}
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
            title={showDiscordLivePreview ? t('clan_auto_v2_1030', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1031', 'Показать живой предпросмотр Discord')}
          >
            {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showDiscordLivePreview ? t('clan_auto_v2_1032', 'Превью Discord') : t('clan_auto_v2_1033', 'Включить превью')}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {wTemplates.map((tpl, index) => (
          <VoteTemplateCard
            key={index}
            tpl={tpl}
            index={index}
            t={t}
            onUpdate={updateTemplate}
            onRemove={removeTemplate}
          />
        ))}

        <button
          type="button"
          onClick={addTemplate}
          className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('clan_auto_64', 'Добавить шаблон сервера')}
        </button>
      </div>
    </form>
  );
}
