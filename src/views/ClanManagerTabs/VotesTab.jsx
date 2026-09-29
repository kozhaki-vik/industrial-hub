import React, { useContext, useMemo, useState, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Vote, Eye, EyeOff, Trash2, Plus, ArrowLeftRight,
  Copy, ExternalLink, Check, Layers, Sparkles, Clock,
  Calendar, Server, Image as ImageIcon
} from 'lucide-react';
import { ToggleSwitch } from '../ClanManager';

// Memoized single vote template card
const VoteTemplateCard = React.memo(function VoteTemplateCard({
  tpl,
  index,
  t,
  onUpdate,
  onRemove,
  onSelectForPreview,
  isSelectedForPreview
}) {
  return (
    <div onClickCapture={() => { if (!isSelectedForPreview) onSelectForPreview(index); }} onFocusCapture={() => { if (!isSelectedForPreview) onSelectForPreview(index); }} className={`p-5 border rounded-2xl transition-all relative ${
      isSelectedForPreview
        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-sm'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {tpl.name || `${t('clan_vote_template_title', 'Шаблон')} #${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            title={t('clan_remove_template', 'Удалить шаблон')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_vote_title_label', 'Заголовок *')}
          </label>
          <input 
            type="text" 
            required 
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-medium" 
            value={tpl.name || ''} 
            onChange={e => onUpdate(index, 'name', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'name', e.target.value, true)}
            placeholder={t('clan_vote_title_placeholder', 'Вайп на Растрории')} 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_auto_54', 'День вайпа')}
          </label>
          <select 
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer font-medium" 
            value={tpl.day || t('clan_thursday', 'Четверг')} 
            onChange={e => onUpdate(index, 'day', e.target.value, true)}
          >
            <option value="Понедельник">{t('clan_monday', 'Понедельник')}</option>
            <option value="Вторник">{t('clan_tuesday', 'Вторник')}</option>
            <option value="Среда">{t('clan_wednesday', 'Среда')}</option>
            <option value="Четверг">{t('clan_thursday', 'Четверг')}</option>
            <option value="Пятница">{t('clan_friday', 'Пятница')}</option>
            <option value="Суббота">{t('clan_saturday', 'Суббота')}</option>
            <option value="Воскресенье">{t('clan_sunday', 'Воскресенье')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_auto_62', 'Время (МСК)')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-medium" 
            value={tpl.time || ''} 
            onChange={e => onUpdate(index, 'time', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'time', e.target.value, true)}
            placeholder="16:00" 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_server_ip_label_opt', 'IP (connect ...) (опционально)')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono" 
            value={tpl.ip || ''} 
            onChange={e => onUpdate(index, 'ip', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'ip', e.target.value, true)}
            placeholder="connect 127.0.0.1:28015" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_auto_63', 'Ссылка на баннер')}
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-[11px]" 
            value={tpl.banner || ''} 
            onChange={e => onUpdate(index, 'banner', e.target.value, false)} 
            onBlur={e => onUpdate(index, 'banner', e.target.value, true)}
            placeholder="https://i.imgur.com/..." 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_vote_desc_label', 'Описание голосования')}
          </label>
          <textarea
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-medium leading-relaxed"
            rows="2"
            value={tpl.description || ''}
            onChange={e => onUpdate(index, 'description', e.target.value, false)}
            onBlur={e => onUpdate(index, 'description', e.target.value, true)}
            placeholder={t('clan_vote_desc_placeholder', 'Например: Подключаемся на мейн сервер после 16:00. Всем быть в дискорде!')}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t('clan_vote_anonymous_title', 'Анонимное голосование')}
            </label>
            <p className="text-[11px] text-slate-400">
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

// --- Side-by-Side Template Comparison Widget ---
function TemplateComparator({ templates, t }) {
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(templates.length > 1 ? 1 : 0);

  const tplA = templates[indexA] || {};
  const tplB = templates[indexB] || {};

  const diffHighlight = (valA, valB) => {
    return String(valA || '').trim() !== String(valB || '').trim();
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-blue-500" />
          <span>{t('clan_vote_compare_title', 'Сравнение шаблонов серверов')}</span>
        </h4>
        <span className="text-[11px] text-slate-400">
          {t('clan_vote_compare_hint', 'Жёлтая рамка подсвечивает отличия')}
        </span>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {t('clan_vote_compare_select_a', 'Шаблон А:')}
          </label>
          <select
            value={indexA}
            onChange={e => setIndexA(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {templates.map((tpl, i) => (
              <option key={i} value={i}>
                #{i + 1}: {tpl.name || 'Без названия'} ({tpl.day || '—'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {t('clan_vote_compare_select_b', 'Шаблон B:')}
          </label>
          <select
            value={indexB}
            onChange={e => setIndexB(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {templates.map((tpl, i) => (
              <option key={i} value={i}>
                #{i + 1}: {tpl.name || 'Без названия'} ({tpl.day || '—'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Card A */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750 space-y-3">
          <div className="font-bold text-sm text-blue-600 dark:text-blue-400 pb-2 border-b border-slate-200 dark:border-slate-700">
            {tplA.name || 'Шаблон А'}
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.day, tplB.day) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_auto_54', 'День вайпа')}</span>
            <span className="text-slate-800 dark:text-slate-200">{tplA.day || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.time, tplB.time) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_auto_62', 'Время (МСК)')}</span>
            <span className="text-slate-800 dark:text-slate-200">{tplA.time || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.ip, tplB.ip) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">IP</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{tplA.ip || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.isAnonymous, tplB.isAnonymous) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_vote_anonymous_title', 'Анонимность')}</span>
            <span>{tplA.isAnonymous ? '🔒 Анонимное' : '👥 Открытое'}</span>
          </div>

          {tplA.banner && (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 max-h-32">
              <img src={tplA.banner} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.description, tplB.description) ? 'bg-amber-500/10 border border-amber-500/30' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_vote_desc_label', 'Описание')}</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">{tplA.description || '—'}</p>
          </div>
        </div>

        {/* Card B */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750 space-y-3">
          <div className="font-bold text-sm text-purple-600 dark:text-purple-400 pb-2 border-b border-slate-200 dark:border-slate-700">
            {tplB.name || 'Шаблон B'}
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.day, tplB.day) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_auto_54', 'День вайпа')}</span>
            <span className="text-slate-800 dark:text-slate-200">{tplB.day || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.time, tplB.time) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_auto_62', 'Время (МСК)')}</span>
            <span className="text-slate-800 dark:text-slate-200">{tplB.time || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.ip, tplB.ip) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">IP</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{tplB.ip || '—'}</span>
          </div>

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.isAnonymous, tplB.isAnonymous) ? 'bg-amber-500/10 border border-amber-500/30 font-semibold' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_vote_anonymous_title', 'Анонимность')}</span>
            <span>{tplB.isAnonymous ? '🔒 Анонимное' : '👥 Открытое'}</span>
          </div>

          {tplB.banner && (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 max-h-32">
              <img src={tplB.banner} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}

          <div className={`p-2 rounded-lg text-xs ${diffHighlight(tplA.description, tplB.description) ? 'bg-amber-500/10 border border-amber-500/30' : ''}`}>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('clan_vote_desc_label', 'Описание')}</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">{tplB.description || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Live Embed Preview Widget ---
function LiveDiscordVoteEmbed({ template, clanName, t }) {
  if (!template) return null;

  return (
    <div className="p-4 bg-[#313338] text-[#dbdee1] rounded-2xl border border-[#1e1f22] space-y-3 font-sans shadow-lg max-w-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-[#3f4147]">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
          🤖
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-white">{clanName || 'Industrial Hub Bot'}</span>
            <span className="px-1 py-0.2 bg-[#5865f2] text-white text-[9px] font-bold rounded">BOT</span>
          </div>
          <div className="text-[10px] text-[#949ba4]">Сегодня, в 12:00</div>
        </div>
      </div>

      {/* Embed Box */}
      <div className="border-l-4 border-blue-500 bg-[#2b2d31] p-3.5 rounded-r-xl space-y-2.5">
        <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
          <span>🗳️</span>
          <span>{template.name || 'Опрос на вайп'}</span>
        </h5>

        {template.description && (
          <p className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
            {template.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-[#1e1f22] p-2 rounded-lg">
            <div className="text-[10px] text-[#949ba4] uppercase font-bold">📅 День</div>
            <div className="font-semibold text-white">{template.day || 'Четверг'}</div>
          </div>
          <div className="bg-[#1e1f22] p-2 rounded-lg">
            <div className="text-[10px] text-[#949ba4] uppercase font-bold">⏰ Время</div>
            <div className="font-semibold text-white">{template.time || '16:00'} МСК</div>
          </div>
          {template.ip && (
            <div className="col-span-2 bg-[#1e1f22] p-2 rounded-lg">
              <div className="text-[10px] text-[#949ba4] uppercase font-bold">🌐 Сервер</div>
              <div className="font-mono text-xs text-emerald-400">{template.ip}</div>
            </div>
          )}
        </div>

        {template.banner && (
          <div className="rounded-lg overflow-hidden border border-[#1e1f22] mt-2">
            <img src={template.banner} alt="Banner" className="w-full max-h-40 object-cover" />
          </div>
        )}

        <div className="text-[10px] text-[#949ba4] pt-1">
          {template.isAnonymous ? '🔒 Анонимное голосование' : '👥 Публичное голосование'}
        </div>
      </div>

      {/* Interactive Discord Reaction Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" className="px-3 py-1.5 rounded-md bg-[#248046] hover:bg-[#1a6334] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟢</span>
          <span>Буду (0)</span>
        </button>
        <button type="button" className="px-3 py-1.5 rounded-md bg-[#ca8a04] hover:bg-[#a16207] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟡</span>
          <span>Опоздаю (0)</span>
        </button>
        <button type="button" className="px-3 py-1.5 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟠</span>
          <span>Завтра (0)</span>
        </button>
        <button type="button" className="px-3 py-1.5 rounded-md bg-[#da373c] hover:bg-[#a1282c] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🔴</span>
          <span>Не буду (0)</span>
        </button>
      </div>
    </div>
  );
}

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

  const [activeTabMode, setActiveTabMode] = useState('list'); // 'list' | 'compare' | 'preview'
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

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
        day: t('clan_thursday', 'Четверг'),
        time: '16:00',
        ip: '',
        banner: ''
      }
    ];
    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
    queueAutoSave(updated, true);
    setSelectedPreviewIndex(newTemplates.length - 1);
  }, [wTemplates, config, queueAutoSave, t]);

  const removeTemplate = useCallback((index) => {
    const newTemplates = wTemplates.filter((_, i) => i !== index);
    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
    queueAutoSave(updated, true);
    if (selectedPreviewIndex >= newTemplates.length) {
      setSelectedPreviewIndex(Math.max(0, newTemplates.length - 1));
    }
  }, [wTemplates, config, queueAutoSave, selectedPreviewIndex]);

  const activePreviewTemplate = wTemplates[selectedPreviewIndex] || wTemplates[0];

  return (
    <form onSubmit={saveConfig} noValidate className="w-full space-y-6 animate-main-fade-in">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Vote className="w-6 h-6 text-blue-500" />
            <span>{t('clan_auto_52', 'Шаблоны голосований и вайпов')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_votes_desc', 'Быстрый визуальный конструктор голосований для клана с предпросмотром в реальном времени')}
          </p>
        </div>

        {/* View Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTabMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('clan_vote_mode_list', 'Шаблоны')} ({wTemplates.length})</span>
            </button>

            {wTemplates.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveTabMode('compare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'compare'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{t('clan_vote_mode_compare', 'Сравнить')}</span>
              </button>
            )}
            {!(isFullScreenWindow && showDiscordLivePreview) && (

            <button
              type="button"
              onClick={() => setActiveTabMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('clan_vote_mode_preview', 'Предпросмотр')}</span>
            </button>
            )}
          </div>

          <button
            type="button"
            onClick={addTemplate}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('clan_auto_64', 'Добавить шаблон')}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Compare Templates Side-by-Side */}
      {activeTabMode === 'compare' && wTemplates.length > 1 && (
        <TemplateComparator templates={wTemplates} t={t} />
      )}

      {/* Mode 2: Live Embed Preview */}
      {activeTabMode === 'preview' && (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="w-full flex-1 min-w-0 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                {t('clan_vote_select_preview_target', 'Выберите шаблон для живого предпросмотра:')}
              </label>
              <select
                value={selectedPreviewIndex}
                onChange={e => setSelectedPreviewIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {wTemplates.map((tpl, i) => (
                  <option key={i} value={i}>
                    #{i + 1}: {tpl.name || 'Без названия'} ({tpl.day || '—'})
                  </option>
                ))}
              </select>
            </div>

            {activePreviewTemplate && (
              <VoteTemplateCard
                tpl={activePreviewTemplate}
                index={selectedPreviewIndex}
                t={t}
                onUpdate={updateTemplate}
                onRemove={removeTemplate}
                onSelectForPreview={setSelectedPreviewIndex}
                isSelectedForPreview={true}
              />
            )}
          </div>
          {!(isFullScreenWindow && showDiscordLivePreview) && (

          <div className="w-full flex-1 min-w-0">
            <div className="sticky top-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('clan_vote_live_embed_title', 'Как это выглядит в Discord канале:')}
              </h4>
              <LiveDiscordVoteEmbed
                template={activePreviewTemplate}
                clanName={config?.clanName}
                t={t}
              />
            </div>
          </div>
          )}
        </div>
      )}

      {/* Mode 3: Default List of Templates */}
      {activeTabMode === 'list' && (
        <div className="space-y-4">
          {wTemplates.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Vote className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                {t('clan_vote_no_templates', 'Шаблоны еще не добавлены')}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                {t('clan_vote_no_templates_desc', 'Создайте готовые шаблоны для четверга, понедельника или других дней, чтобы запускать опросы в один клик.')}
              </p>
              <button
                type="button"
                onClick={addTemplate}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('clan_auto_64', 'Добавить шаблон сервера')}</span>
              </button>
            </div>
          ) : (
            wTemplates.map((tpl, index) => (
              <VoteTemplateCard
                key={index}
                tpl={tpl}
                index={index}
                t={t}
                onUpdate={updateTemplate}
                onRemove={removeTemplate}
                onSelectForPreview={(i) => {
                  setSelectedPreviewIndex(i);
                  setActiveTabMode('preview');
                }}
                isSelectedForPreview={index === selectedPreviewIndex}
              />
            ))
          )}
        </div>
      )}
    </form>
  );
}
