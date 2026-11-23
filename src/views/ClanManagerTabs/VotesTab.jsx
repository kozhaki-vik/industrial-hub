import React, { useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Vote, Eye, EyeOff, Trash2, Plus, ArrowLeftRight,
  Copy, ExternalLink, Check, Layers, Sparkles, Clock,
  Calendar, Server, Image as ImageIcon, Upload, Loader2,
  AlertCircle, AlertTriangle, CheckCircle2, HardDrive,
  RefreshCw, History, Send, X, Users, Lock, ChevronDown
} from 'lucide-react';
import { ToggleSwitch } from '../ClanManager';
import DiscordPanelChannelBar from '../../components/DiscordPanelChannelBar';
import { uploadBanner, deleteBanner } from '../../services/uploadService';
import { normalizeImageUrl } from '../../utils/urlHelper';
import { resolveDiscordEmoji } from '../../utils/discordEmojis';
import { showConfirm } from '../../components/ConfirmModal';
import { getPresetBanners } from '../../services/aiService';

function LocalEmoji({ name, fallback, className = "w-4 h-4 inline-block object-contain shrink-0" }) {
  const resolved = resolveDiscordEmoji(name);
  if (resolved && (resolved.type === 'local' || resolved.type === 'cdn')) {
    return <img src={resolved.url} alt={resolved.alt || ''} className={className} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
  }
  return <span>{resolved?.text || fallback || name}</span>;
}

// Single template card with image uploader, live validation, and template settings
const VoteTemplateCard = React.memo(function VoteTemplateCard({
  tpl,
  index,
  t,
  onUpdate,
  onRemove,
  onSelectForPreview,
  isSelectedForPreview,
  effectiveGuildId,
  sendProxyAction,
  isReadOnly
}) {
  const fileInputRef = useRef(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [presetBanners, setPresetBanners] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getPresetBanners().then(data => {
      if (isMounted && Array.isArray(data)) {
        setPresetBanners(data);
      }
    }).catch(err => console.warn('[VotesTab] Error loading preset banners:', err.message));
    return () => { isMounted = false; };
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('clan_banner_err_size', 'Размер файла превышает лимит 2 МБ'));
      return;
    }

    setUploadingBanner(true);
    setUploadError('');

    try {
      const res = await uploadBanner(file, 'votes', effectiveGuildId);
      if (res.success && res.url) {
        await new Promise((resolve, reject) => {
          const img = new Image();
          const timer = setTimeout(() => {
            img.src = '';
            reject(new Error(t('clan_banner_verify_timeout', 'Таймаут проверки загруженного изображения')));
          }, 10000);
          img.onload = () => {
            clearTimeout(timer);
            if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve();
            else reject(new Error(t('clan_banner_verify_corrupt', 'Файл изображения повреждён или пуст')));
          };
          img.onerror = () => {
            clearTimeout(timer);
            reject(new Error(t('clan_banner_verify_failed', 'Не удалось загрузить изображение с сервера')));
          };
          img.src = `${res.url}${res.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        });

        onUpdate(index, 'banner', res.url, true);
      } else {
        setUploadError(res.error || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
      }
    } catch (err) {
      setUploadError(err.message || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    const cur = tpl.banner;
    setUploadError('');
    onUpdate(index, 'banner', '', true);
    if (cur && cur.includes('/uploads/banners/')) {
      try {
        await deleteBanner('votes', effectiveGuildId);
      } catch (err) {
        console.warn('[VotesTab] Could not delete banner from server disk:', err.message);
      }
    }
  };

  return (
    <div
      onClickCapture={() => { if (!isSelectedForPreview) onSelectForPreview(index); }}
      onFocusCapture={() => { if (!isSelectedForPreview) onSelectForPreview(index); }}
      className={`p-5 border rounded-2xl transition-all relative ${
        isSelectedForPreview
          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
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
            disabled={isReadOnly}
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-40"
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
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-medium disabled:opacity-60"
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
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer font-medium disabled:opacity-60"
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
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-medium disabled:opacity-60"
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
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono disabled:opacity-60"
            value={tpl.ip || ''}
            onChange={e => onUpdate(index, 'ip', e.target.value, false)}
            onBlur={e => onUpdate(index, 'ip', e.target.value, true)}
            placeholder="connect 127.0.0.1:28015"
          />
        </div>

        {/* Banner Section with Upload from PC */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t('clan_banner_img_label', 'Баннер голосования (изображение)')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={isReadOnly}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingBanner || isReadOnly}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800/40 cursor-pointer disabled:opacity-50"
                title={t('clan_banner_upload_btn_hint', 'Загрузить изображение напрямую на наш сервер (до 2 МБ, 1 шт)')}
              >
                {uploadingBanner ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>
                  {uploadingBanner
                    ? t('clan_banner_uploading', 'Загрузка и проверка...')
                    : t('clan_banner_upload_btn', 'Загрузить с ПК')}
                </span>
              </button>
              {tpl.banner && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  disabled={isReadOnly}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-800/40 cursor-pointer disabled:opacity-50"
                  title={t('clan_ads_banner_clear_hint', 'Убрать баннер')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clan_ads_banner_clear_btn', 'Убрать баннер')}</span>
                </button>
              )}
            </div>
          </div>

          <input
            type="text"
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-[11px] disabled:opacity-60"
            value={tpl.banner || ''}
            onChange={e => onUpdate(index, 'banner', e.target.value, false)}
            onBlur={async e => {
              let normalized = normalizeImageUrl(e.target.value);
              if (normalized && /(?:cdn|media)\.discordapp\.(?:com|net)\/attachments\//i.test(normalized)) {
                if (typeof sendProxyAction === 'function') {
                  try {
                    const res = await sendProxyAction('refresh_attachment_urls', { urls: [normalized] });
                    if (res?.refreshedUrls && res.refreshedUrls.length > 0 && res.refreshedUrls[0].refreshed) {
                      normalized = res.refreshedUrls[0].refreshed;
                    }
                  } catch (err) {
                    console.warn('[VotesTab] Failed to refresh discord attachment url:', err);
                  }
                }
              }
              onUpdate(index, 'banner', normalized, true);
            }}
            placeholder="https://..."
          />

          {uploadError && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {tpl.banner && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              {tpl.banner.includes('/uploads/banners/') ? (
                <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{t('clan_banner_uploaded_server', 'Размещено на сервере Industrial Hub')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('clan_ads_banner_active', 'Установлен кастомный баннер')}</span>
                </div>
              )}
            </div>
          )}

          {/* Готовые баннеры голосований и серверов Rust с сервера */}
          {presetBanners && presetBanners.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('clan_recruitment_presets_title', 'Готовые баннеры (с сервера):')}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {t('clan_recruitment_presets_hint', 'Кликните по картинке для применения')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetBanners.map(preset => {
                  const isSelected = tpl.banner === preset.fullUrl || (preset.fileName && tpl.banner?.includes(preset.fileName));
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setUploadError('');
                        onUpdate(index, 'banner', isSelected ? '' : preset.fullUrl, true);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-slate-900 ${
                        isSelected
                          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/40'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400/80 opacity-75 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden relative">
                        <img
                          src={preset.fullUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 bg-white dark:bg-slate-900">
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('clan_vote_desc_label', 'Описание голосования')}
          </label>
          <textarea
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-medium leading-relaxed disabled:opacity-60"
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
            onChange={() => !isReadOnly && onUpdate(index, 'isAnonymous', tpl.isAnonymous !== true, true)}
          />
        </div>
      </div>
    </div>
  );
});

// Side-by-Side Template Comparison Widget
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

// Live Embed Preview Widget matching exact Discord styling
function LiveDiscordVoteEmbed({ template, clanName, t, onToggleAnonymous, durationHours }) {
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
      <div className="border-l-4 border-orange-500 bg-[#2b2d31] p-3.5 rounded-r-xl space-y-2.5">
        <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
          <LocalEmoji name="clipboard-text" fallback="🗳️" className="w-4 h-4 object-contain" />
          <span>{template.name || 'Опрос на вайп'}</span>
        </h5>

        {template.description && (
          <p className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
            {template.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-[#1e1f22] p-2 rounded-lg">
            <div className="text-[10px] text-[#949ba4] uppercase font-bold flex items-center gap-1">
              <LocalEmoji name="calendar-week" fallback="📅" className="w-3.5 h-3.5 object-contain" />
              <span>День</span>
            </div>
            <div className="font-semibold text-white mt-0.5">{template.day || 'Четверг'}</div>
          </div>
          <div className="bg-[#1e1f22] p-2 rounded-lg">
            <div className="text-[10px] text-[#949ba4] uppercase font-bold flex items-center gap-1">
              <LocalEmoji name="clock" fallback="⏰" className="w-3.5 h-3.5 object-contain" />
              <span>Время</span>
            </div>
            <div className="font-semibold text-white mt-0.5">{template.time || '16:00'} МСК</div>
          </div>
          {template.ip && (
            <div className="col-span-2 bg-[#1e1f22] p-2 rounded-lg">
              <div className="text-[10px] text-[#949ba4] uppercase font-bold flex items-center gap-1">
                <LocalEmoji name="device-desktop" fallback="🌐" className="w-3.5 h-3.5 object-contain" />
                <span>Сервер</span>
              </div>
              <div className="font-mono text-xs text-emerald-400 mt-0.5">{template.ip}</div>
            </div>
          )}
          {durationHours > 0 && (
            <div className="col-span-2 bg-[#1e1f22] p-2 rounded-lg">
              <div className="text-[10px] text-[#949ba4] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Срок действия</span>
              </div>
              <div className="text-xs text-blue-400 mt-0.5 font-medium">
                {durationHours} ч. (автоматическое закрытие по таймеру)
              </div>
            </div>
          )}
        </div>

        {template.banner && (
          <div className="rounded-lg overflow-hidden border border-[#1e1f22] mt-2">
            <img src={template.banner} alt="Banner" className="w-full max-h-40 object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#3f4147]">
          <span className="text-[11px] font-medium text-[#949ba4] flex items-center gap-1.5">
            <LocalEmoji name={template.isAnonymous ? "lock" : "users"} fallback={template.isAnonymous ? "🔒" : "👥"} className="w-3.5 h-3.5 object-contain" />
            <span>{template.isAnonymous ? 'Анонимное голосование' : 'Публичное голосование'}</span>
          </span>
          {onToggleAnonymous && (
            <ToggleSwitch
              checked={template.isAnonymous === true}
              onChange={onToggleAnonymous}
            />
          )}
        </div>
      </div>

      {/* Interactive Discord Reaction Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#248046] hover:bg-[#1a6334] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟢</span>
          <span>Буду вовремя (0)</span>
        </button>
        <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟡</span>
          <span>Опоздаю (0)</span>
        </button>
        <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#4e5058] hover:bg-[#3f4147] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
          <span>🟠</span>
          <span>Завтра (0)</span>
        </button>
        <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#da373c] hover:bg-[#a1282c] text-white text-xs font-semibold flex items-center gap-1.5 cursor-default transition-colors">
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
    sendProxyAction,
    discordInfo,
    guildId,
    currentActiveGuildId,
    isReadOnly,
    isFullScreenWindow,
    showDiscordLivePreview
  } = useContext(ClanManagerContext);

  const effectiveGuildId = guildId || currentActiveGuildId;

  // Sub-navigation: 'templates' | 'history' | 'schedule' | 'compare'
  const [activeSubTab, setActiveSubTab] = useState('templates');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [publishDuration, setPublishDuration] = useState(24); // default 24h

  // History state
  const [voteHistory, setVoteHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionInProgressVoteId, setActionInProgressVoteId] = useState(null);

  // Parse wipeTemplatesJson
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

  // Parse votingConfigJson
  const vConfig = useMemo(() => {
    try {
      if (config?.votingConfigJson) {
        return typeof config.votingConfigJson === 'string'
          ? JSON.parse(config.votingConfigJson)
          : config.votingConfigJson;
      }
    } catch {}
    return {};
  }, [config?.votingConfigJson]);

  // Parse channelsConfigJson
  const cConfig = useMemo(() => {
    try {
      if (config?.channelsConfigJson) {
        return typeof config.channelsConfigJson === 'string'
          ? JSON.parse(config.channelsConfigJson)
          : config.channelsConfigJson;
      }
    } catch {}
    return {};
  }, [config?.channelsConfigJson]);

  const activeVotesChannelId = vConfig.targetChannelId || cConfig.votes || '';

  // Auto-schedule rules from vConfig
  const autoScheduleRules = useMemo(() => {
    return Array.isArray(vConfig.autoSchedule) ? vConfig.autoSchedule : [];
  }, [vConfig.autoSchedule]);

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

  const sendProxyActionRef = useRef(sendProxyAction);
  useEffect(() => {
    sendProxyActionRef.current = sendProxyAction;
  }, [sendProxyAction]);

  // Fetch Vote History (stable reference to avoid re-triggering effects)
  const fetchVoteHistory = useCallback(async () => {
    if (typeof sendProxyActionRef.current !== 'function') return;
    setLoadingHistory(true);
    try {
      const res = await sendProxyActionRef.current('get_vote_history');
      if (res && res.success && Array.isArray(res.votes)) {
        setVoteHistory(res.votes);
      } else {
        setVoteHistory([]);
      }
    } catch (err) {
      console.warn('[VotesTab] Failed to fetch vote history:', err.message);
      setVoteHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchVoteHistory();
    }
  }, [activeSubTab, fetchVoteHistory]);

  // Publication handler via DiscordPanelChannelBar
  const handlePublishOrMoveVotes = useCallback(async (targetChannelId) => {
    if (typeof sendProxyAction !== 'function') {
      return { success: false, error: 'Proxy action not available' };
    }
    const currentTemplate = wTemplates[selectedPreviewIndex] || wTemplates[0];
    if (!currentTemplate) {
      return { success: false, error: 'Шаблон не выбран или список пуст' };
    }

    const res = await sendProxyAction('create_vote', {
      channelId: targetChannelId,
      voteData: currentTemplate,
      durationHours: Number(publishDuration) || 0,
      templateIndex: selectedPreviewIndex
    });

    if (res?.success) {
      const newVConfig = {
        ...vConfig,
        targetChannelId,
        lastVoteChannelId: targetChannelId
      };
      const newCConfig = {
        ...cConfig,
        votes: targetChannelId
      };
      const updated = {
        ...config,
        votingConfigJson: JSON.stringify(newVConfig),
        channelsConfigJson: JSON.stringify(newCConfig)
      };
      queueAutoSave(updated, true);
      fetchVoteHistory();
      return { success: true };
    }
    return { success: false, error: res?.error || 'Ошибка публикации голосования' };
  }, [sendProxyAction, wTemplates, selectedPreviewIndex, publishDuration, vConfig, cConfig, config, queueAutoSave, fetchVoteHistory]);

  // Early close vote handler
  const handleCloseVote = useCallback(async (voteId) => {
    if (typeof sendProxyAction !== 'function') return;
    const confirmed = await showConfirm({
      title: 'Завершение голосования',
      message: 'Вы уверены, что хотите досрочно завершить это голосование? Кнопки будут отключены в Discord.',
      confirmText: 'Завершить голосование',
      cancelText: 'Отмена',
      danger: true
    });
    if (!confirmed) return;

    setActionInProgressVoteId(voteId);
    try {
      const res = await sendProxyAction('close_vote', { voteId });
      if (res && res.success) {
        fetchVoteHistory();
      }
    } catch (err) {
      console.error('[VotesTab] Error closing vote:', err);
    } finally {
      setActionInProgressVoteId(null);
    }
  }, [sendProxyAction, fetchVoteHistory]);

  // Auto-schedule management
  const updateScheduleRule = useCallback((ruleIdx, field, val) => {
    const newRules = [...autoScheduleRules];
    newRules[ruleIdx] = { ...newRules[ruleIdx], [field]: val };
    const newVConfig = { ...vConfig, autoSchedule: newRules };
    const updated = { ...config, votingConfigJson: JSON.stringify(newVConfig) };
    queueAutoSave(updated, true);
  }, [autoScheduleRules, vConfig, config, queueAutoSave]);

  const addScheduleRule = useCallback(() => {
    const newRule = {
      id: `sched_${Date.now()}`,
      enabled: true,
      days: ['Четверг'],
      time: '12:00',
      templateIndex: 0,
      targetChannelId: activeVotesChannelId || (discordInfo?.channels?.[0]?.id || ''),
      durationHours: 24,
      lastRunDate: null
    };
    const newRules = [...autoScheduleRules, newRule];
    const newVConfig = { ...vConfig, autoSchedule: newRules };
    const updated = { ...config, votingConfigJson: JSON.stringify(newVConfig) };
    queueAutoSave(updated, true);
  }, [autoScheduleRules, activeVotesChannelId, discordInfo, vConfig, config, queueAutoSave]);

  const removeScheduleRule = useCallback((ruleIdx) => {
    const newRules = autoScheduleRules.filter((_, i) => i !== ruleIdx);
    const newVConfig = { ...vConfig, autoSchedule: newRules };
    const updated = { ...config, votingConfigJson: JSON.stringify(newVConfig) };
    queueAutoSave(updated, true);
  }, [autoScheduleRules, vConfig, config, queueAutoSave]);

  const activePreviewTemplate = wTemplates[selectedPreviewIndex] || wTemplates[0];
  const activeVotesCount = useMemo(() => {
    return voteHistory.filter(v => v.active).length;
  }, [voteHistory]);

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  return (
    <form onSubmit={saveConfig} noValidate className="w-full space-y-6 animate-main-fade-in">
      {/* 1. Discord Panel Channel Status & Manager */}
      <div className="space-y-3">
        <DiscordPanelChannelBar
          title={t('clan_votes_panel_title', 'Панель голосования в Discord')}
          channelId={activeVotesChannelId}
          discordChannels={discordInfo?.channels || []}
          onPublishOrMove={handlePublishOrMoveVotes}
          onSync={fetchVoteHistory}
          activeDesc={t('clan_votes_panel_active_desc', 'Опрос публикуется в Discord канале. Участники клана могут голосовать прямо в Discord.')}
          promptText={t('clan_votes_panel_prompt', 'Выберите канал для публикации голосования. Вы также можете настроить срок действия и расписание автопубликации.')}
          icon={Vote}
          accentColor="blue"
        />

        {/* Duration selector directly under channel bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Срок действия при публикации:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={publishDuration}
              onChange={e => setPublishDuration(Number(e.target.value))}
              disabled={isReadOnly}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/30 text-xs shadow-2xs"
            >
              <option value={0}>Бессрочно (до ручного закрытия)</option>
              <option value={2}>2 часа</option>
              <option value={6}>6 часов</option>
              <option value={12}>12 часов</option>
              <option value={24}>24 часа (1 день)</option>
              <option value={48}>48 часов (2 дня)</option>
              <option value={72}>3 дня (72 ч)</option>
              <option value={168}>7 дней (1 неделя)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-850/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSubTab('templates')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            activeSubTab === 'templates'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Шаблоны ({wTemplates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>История</span>
          {activeVotesCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-white animate-pulse">
              {activeVotesCount} акт.
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('schedule')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            activeSubTab === 'schedule'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Авторасписание</span>
          {autoScheduleRules.filter(r => r.enabled !== false).length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-purple-500 text-white">
              {autoScheduleRules.filter(r => r.enabled !== false).length}
            </span>
          )}
        </button>

        {wTemplates.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveSubTab('compare')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              activeSubTab === 'compare'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-slate-200/80 dark:border-slate-700'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 shrink-0" />
            <span>Сравнить</span>
          </button>
        )}
      </div>

      {/* 3. SUB-TAB: TEMPLATES (EDITOR) */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('clan_votes_desc', 'Быстрый визуальный конструктор голосований для клана с предпросмотром в реальном времени')}
            </p>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={addTemplate}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('clan_auto_64', 'Добавить шаблон')}</span>
            </button>
          </div>

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
                disabled={isReadOnly}
                onClick={addTemplate}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{t('clan_auto_64', 'Добавить шаблон сервера')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Template Select Dropdown */}
              {wTemplates.length > 1 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                    {t('clan_vote_select_preview_target', 'Редактируемый шаблон:')}
                  </label>
                  <select
                    value={selectedPreviewIndex}
                    onChange={e => setSelectedPreviewIndex(Number(e.target.value))}
                    className="w-full max-w-md px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer shadow-2xs"
                  >
                    {wTemplates.map((tpl, i) => (
                      <option key={i} value={i}>
                        Шаблон #{i + 1}: {tpl.name || 'Без названия'} ({tpl.day || '—'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="w-full flex-1 min-w-0 space-y-4">
                  {activePreviewTemplate && (
                    <VoteTemplateCard
                      tpl={activePreviewTemplate}
                      index={selectedPreviewIndex}
                      t={t}
                      onUpdate={updateTemplate}
                      onRemove={removeTemplate}
                      onSelectForPreview={setSelectedPreviewIndex}
                      isSelectedForPreview={true}
                      effectiveGuildId={effectiveGuildId}
                      sendProxyAction={sendProxyAction}
                      isReadOnly={isReadOnly}
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
                        durationHours={publishDuration}
                        onToggleAnonymous={() => !isReadOnly && updateTemplate(selectedPreviewIndex, 'isAnonymous', activePreviewTemplate.isAnonymous !== true, true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB: HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                <span>История и результаты голосований</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Просматривайте активные опросы, результаты явки и списки проголосовавших участников
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVoteHistory}
              disabled={loadingHistory}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>

          {loadingHistory && voteHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
              <span className="text-xs">Загрузка истории голосований...</span>
            </div>
          ) : voteHistory.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Vote className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                История голосований пуста
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Опубликуйте опрос в Discord, чтобы отслеживать явку и результаты голосования здесь.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {voteHistory.map((vote) => {
                const isActionLoading = actionInProgressVoteId === vote.id;
                const channel = (discordInfo?.channels || []).find(c => c.id === vote.channelId);

                return (
                  <div
                    key={vote.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      vote.active
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/15 border-emerald-500/40 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {vote.title || 'Опрос'}
                        </span>

                        {vote.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Активно
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Завершено
                          </span>
                        )}

                        {vote.isAnonymous && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <Lock className="w-3 h-3" />
                            Анонимный
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          {new Date(vote.createdAt).toLocaleString('ru-RU')}
                        </span>
                        {channel && (
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            #{channel.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {vote.active && (
                          <button
                            type="button"
                            disabled={isActionLoading || isReadOnly}
                            onClick={() => handleCloseVote(vote.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            <span>Завершить досрочно</span>
                          </button>
                        )}

                        {vote.messageId && vote.channelId && effectiveGuildId && (
                          <a
                            href={`https://discord.com/channels/${effectiveGuildId}/${vote.channelId}/${vote.messageId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Discord</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Results Progress Bars */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span>Всего голосов: {vote.totalVotes || 0}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(vote.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-800 dark:text-slate-200">{opt.label}</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {opt.votesCount} ({opt.percentage}%)
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>

                            {/* Voter avatars & names (if non-anonymous) */}
                            {!vote.isAnonymous && opt.voters && opt.voters.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {opt.voters.map((u, ui) => (
                                  <span
                                    key={ui}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                                  >
                                    {u.avatar ? (
                                      <img src={u.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[9px] font-bold">
                                        @
                                      </span>
                                    )}
                                    <span className="truncate max-w-[110px]">{u.username}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB: AUTO-SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Авторасписание периодической публикации</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Настройте точное время и дни недели (МСК) для автоматической публикации опросов на вайп или новости
              </p>
            </div>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={addScheduleRule}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить правило</span>
            </button>
          </div>

          {autoScheduleRules.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                Авторасписание еще не настроено
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Добавьте правила, например: публикация шаблона по четвергам в 10:00 и понедельникам в 12:00.
              </p>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={addScheduleRule}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Создать первое правило</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {autoScheduleRules.map((rule, rIdx) => {
                const isEnabled = rule.enabled !== false;
                const selectedDays = Array.isArray(rule.days) ? rule.days : [];

                return (
                  <div
                    key={rule.id || rIdx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-slate-900 border-purple-200/80 dark:border-purple-900/40 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                          {rIdx + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Правило #{rIdx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">
                            {isEnabled ? 'Активно' : 'Выключено'}
                          </span>
                          <ToggleSwitch
                            checked={isEnabled}
                            onChange={() => !isReadOnly && updateScheduleRule(rIdx, 'enabled', !isEnabled)}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => removeScheduleRule(rIdx)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-40"
                          title="Удалить правило"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Days of week chips */}
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Дни публикации:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {daysOfWeek.map((day) => {
                            const isSelected = selectedDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => {
                                  if (isReadOnly) return;
                                  const updated = isSelected
                                    ? selectedDays.filter(d => d !== day)
                                    : [...selectedDays, day];
                                  updateScheduleRule(rIdx, 'days', updated);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time (MSK) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Время публикации (МСК):
                        </label>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={rule.time || '10:00'}
                          onChange={e => updateScheduleRule(rIdx, 'time', e.target.value)}
                          placeholder="10:00"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                      </div>

                      {/* Template Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Шаблон для публикации:
                        </label>
                        <select
                          disabled={isReadOnly}
                          value={rule.templateIndex || 0}
                          onChange={e => updateScheduleRule(rIdx, 'templateIndex', Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                          {wTemplates.map((tpl, ti) => (
                            <option key={ti} value={ti}>
                              Шаблон #{ti + 1}: {tpl.name || 'Без названия'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Target Channel */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Канал Discord:
                        </label>
                        <select
                          disabled={isReadOnly}
                          value={rule.targetChannelId || activeVotesChannelId}
                          onChange={e => updateScheduleRule(rIdx, 'targetChannelId', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                          <option value="">-- Канал по умолчанию --</option>
                          {(discordInfo?.channels || []).filter(c => c.type === 0).map(ch => (
                            <option key={ch.id} value={ch.id}>
                              # {ch.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Auto-Close Duration */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Срок действия (Автозавершение):
                        </label>
                        <select
                          disabled={isReadOnly}
                          value={rule.durationHours !== undefined ? rule.durationHours : 24}
                          onChange={e => updateScheduleRule(rIdx, 'durationHours', Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                          <option value={0}>Бессрочно (до ручного закрытия)</option>
                          <option value={2}>2 часа</option>
                          <option value={6}>6 часов</option>
                          <option value={12}>12 часов</option>
                          <option value={24}>24 часа (1 день)</option>
                          <option value={48}>48 часов (2 дня)</option>
                          <option value={72}>3 дня</option>
                          <option value={168}>7 дней</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. SUB-TAB: COMPARE */}
      {activeSubTab === 'compare' && wTemplates.length > 1 && (
        <TemplateComparator templates={wTemplates} t={t} />
      )}
    </form>
  );
}
