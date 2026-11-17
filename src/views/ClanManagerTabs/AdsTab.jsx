import React, { useContext, useMemo, useCallback, useState, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Megaphone, Eye, EyeOff, RotateCcw, Trash2, CheckCircle2,
  Upload, Loader2, AlertCircle, HardDrive, ScrollText, ArrowRight
} from 'lucide-react';
import { DEFAULT_ADS_BANNER, normalizeImageUrl } from '../../utils/urlHelper';
import { uploadBanner, deleteBanner } from '../../services/uploadService';

export default function AdsTab() {
  const {
    t,
    config,
    queueAutoSave,
    saveConfig,
    isFullScreenWindow,
    showDiscordLivePreview,
    setShowDiscordLivePreview,
    currentActiveGuildId,
    guildId,
    adTicketsData,
    openAdTicketsCount,
    setActiveTab
  } = useContext(ClanManagerContext);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const effectiveGuildId = currentActiveGuildId || guildId || config?.guildId;

  const aConfig = useMemo(() => {
    const defaults = {
      title: t('clan_auto_169', t('clan_ads_buy', 'Покупка рекламы')),
      text: t('clan_auto_230', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
      banner: DEFAULT_ADS_BANNER,
      priceText: '',
      priceClicks: 0
    };
    try {
      if (config?.adConfigJson) {
        const parsed = typeof config.adConfigJson === 'string'
          ? JSON.parse(config.adConfigJson)
          : config.adConfigJson;
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaults,
            ...parsed,
            banner: parsed.banner !== undefined && parsed.banner !== null ? parsed.banner : DEFAULT_ADS_BANNER
          };
        }
      }
    } catch {}
    return defaults;
  }, [config?.adConfigJson, t]);

  const updateAConfig = useCallback((key, val, immediate = false) => {
    const newConfig = { ...aConfig, [key]: val };
    const updated = { ...config, adConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, immediate);
  }, [aConfig, config, queueAutoSave]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so user can upload the same file again if desired
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('clan_banner_err_size', 'Размер файла превышает лимит 2 МБ'));
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const res = await uploadBanner(file, 'ads', effectiveGuildId);
      if (res.success && res.url) {
        // Verify image fully loaded and valid on server
        await new Promise((resolve, reject) => {
          const img = new Image();
          const timer = setTimeout(() => {
            img.src = '';
            reject(new Error(t('clan_banner_verify_timeout', 'Таймаут проверки загруженного изображения')));
          }, 10000);
          img.onload = () => {
            clearTimeout(timer);
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              resolve();
            } else {
              reject(new Error(t('clan_banner_verify_corrupt', 'Файл изображения повреждён или пуст')));
            }
          };
          img.onerror = () => {
            clearTimeout(timer);
            reject(new Error(t('clan_banner_verify_failed', 'Не удалось загрузить и подтвердить целостность изображения с сервера')));
          };
          img.src = `${res.url}${res.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        });

        updateAConfig('banner', res.url, true);
      } else {
        setUploadError(res.error || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
      }
    } catch (err) {
      setUploadError(err.message || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
    } finally {
      setUploadingBanner ? setUploadingBanner(false) : setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    const currentBanner = aConfig.banner;
    setUploadError('');
    updateAConfig('banner', '', true);

    if (currentBanner && currentBanner.includes('/uploads/banners/')) {
      try {
        await deleteBanner('ads', effectiveGuildId);
      } catch (err) {
        console.warn('[AdsTab] Could not delete banner from server disk:', err.message);
      }
    }
  };

  const isServerHosted = Boolean(aConfig.banner && aConfig.banner.includes('/uploads/banners/'));

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6 w-full max-w-5xl 2xl:max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
          <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
          {t('clan_auto_65', 'Настройки панели рекламы')}
        </h3>
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('clan_ads_price_text_label', 'Текст прайс-листа и цены (кнопка «Узнать цену» в Discord)')}
            </label>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              {t('clan_ads_clicks_count', 'Кликов по цене')}: {aConfig.priceClicks || 0}
            </span>
          </div>
          <textarea 
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[90px] resize-none"
            value={aConfig.priceText || ''}
            onChange={e => updateAConfig('priceText', e.target.value, false)}
            onBlur={e => updateAConfig('priceText', e.target.value, true)}
            placeholder="📢 Реклама в общем чате: 300₽ / неделя&#10;📌 Закрепленное объявление: 700₽ / неделя&#10;🤝 Партнерство: бесплатно по согласованию"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t('clan_ads_price_text_hint', 'Этот текст высветится скрытым (ephemeral) сообщением пользователю при нажатии кнопки «Узнать цену» в Discord.')}
          </p>
        </div>
        
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('clan_ads_banner_label', 'Ссылка на баннер (изображение)')}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800/40 cursor-pointer disabled:opacity-50"
                title={t('clan_banner_upload_btn_hint', 'Загрузить изображение напрямую на наш сервер (до 2 МБ, 1 шт)')}
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>
                  {uploading
                    ? t('clan_banner_uploading', 'Загрузка...')
                    : t('clan_banner_upload_btn', 'Загрузить с ПК')}
                </span>
              </button>

              {aConfig.banner !== DEFAULT_ADS_BANNER && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadError('');
                    updateAConfig('banner', DEFAULT_ADS_BANNER, true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800/40 cursor-pointer"
                  title={t('clan_ads_banner_default_hint', 'Установить официальный баннер по умолчанию')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('clan_ads_banner_default_btn', 'По умолчанию')}</span>
                </button>
              )}

              {aConfig.banner && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-800/40 cursor-pointer"
                  title={t('clan_ads_banner_clear_hint', 'Убрать баннер (сообщение будет без картинки)')}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('clan_ads_banner_clear_btn', 'Убрать баннер')}</span>
                </button>
              )}
            </div>
          </div>

          <input 
            type="text" 
            className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow text-sm"
            value={aConfig.banner || ''}
            onChange={e => updateAConfig('banner', e.target.value, false)}
            onBlur={e => {
              const normalized = normalizeImageUrl(e.target.value);
              updateAConfig('banner', normalized, true);
            }}
            placeholder={DEFAULT_ADS_BANNER}
          />

          {uploadError && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
            {t('clan_ads_banner_hint', 'По умолчанию используется официальный баннер. Вы можете загрузить свой файл с ПК (до 2 МБ), указать ссылку или очистить поле, чтобы скрыть баннер.')}
          </p>

          {/* Mini preview & status inside tab */}
          {aConfig.banner ? (
            <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3">
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                <img 
                  src={normalizeImageUrl(aConfig.banner)} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  {isServerHosted ? (
                    <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span>
                    {isServerHosted
                      ? t('clan_banner_uploaded_server', 'Размещено на сервере Industrial Hub')
                      : aConfig.banner === DEFAULT_ADS_BANNER
                      ? t('clan_ads_banner_is_default', 'Установлен официальный баннер по умолчанию')
                      : t('clan_ads_banner_active', 'Установлен кастомный баннер')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {aConfig.banner}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 italic">
              {t('clan_ads_banner_disabled', 'Баннер отключен — Embed-сообщение в Discord будет опубликовано без изображения.')}
            </div>
          )}
        </div>
      </div>

      {/* Заявки на рекламу - Блок перехода в журнал */}
      <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <span>{t('clan_ads_tickets_block_title', 'Заявки на рекламу')}</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {Array.isArray(adTicketsData) ? adTicketsData.length : 0}
              </span>
              {openAdTicketsCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                  {openAdTicketsCount} {t('clan_status_pending_short', 'активно')}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('clan_ads_tickets_desc', 'Журнал обращений, заказов рекламы и предложений о сотрудничестве от участников Discord.')}
            </p>
          </div>
        </div>
        {setActiveTab && (
          <button
            type="button"
            onClick={() => {
              if (typeof setActiveTab === 'function') {
                setActiveTab('applications', 'ads');
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{t('clan_open_ad_tickets_btn', 'Открыть журнал заявок на рекламу')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
