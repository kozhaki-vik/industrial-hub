import React, { useContext, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Megaphone, Eye, EyeOff, RotateCcw, Trash2, CheckCircle2,
  Upload, Loader2, AlertCircle, HardDrive, ScrollText, ArrowRight, ArrowLeft,
  Palette, Sparkles, ShoppingBag, Handshake, DollarSign, HelpCircle, Bot,
  Lock, RefreshCw, MessageSquare, ShieldCheck, Check, Image as ImageIcon
} from 'lucide-react';
import { DEFAULT_ADS_BANNER, normalizeImageUrl } from '../../utils/urlHelper';
import { uploadBanner, deleteBanner } from '../../services/uploadService';
import { ToggleSwitch } from '../ClanManager';
import { getPresetBanners } from '../../services/aiService';
import DiscordPanelChannelBar from '../../components/DiscordPanelChannelBar';

const COLOR_SWATCHES = [
  { name: 'Emerald', value: '#2ecc71' },
  { name: 'Blurple', value: '#5865f2' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Dark', value: '#2b2d31' }
];

export default function AdsTab() {
  const {
    t,
    config,
    setConfig,
    discordInfo,
    sendProxyAction,
    queueAutoSave,
    saveConfig,
    showDiscordLivePreview,
    setShowDiscordLivePreview,
    currentActiveGuildId,
    guildId,
    adTicketsData,
    openAdTicketsCount,
    setActiveTab,
    adsSubTab,
    setAdsSubTab,
    adsSubTabs: contextAdsSubTabs,
    isDevAdminActive
  } = useContext(ClanManagerContext);

  const [localSubTab, setLocalSubTab] = useState('panel');
  const activeSubTab = adsSubTab || localSubTab;
  const setActiveSubTab = setAdsSubTab || setLocalSubTab;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [presetBanners, setPresetBanners] = useState([]);
  const fileInputRef = useRef(null);

  const effectiveGuildId = currentActiveGuildId || guildId || config?.guildId;

  useEffect(() => {
    let isMounted = true;
    getPresetBanners().then(data => {
      if (isMounted && Array.isArray(data)) {
        // Exclude 'rust_raid' preset in Ads section (clan raid is not appropriate as ready ad banner)
        const filtered = data.filter(p => p.id !== 'rust_raid' && !p.fileName?.toLowerCase().includes('rust_raid'));
        setPresetBanners(filtered);
      }
    }).catch(err => console.warn('[AdsTab] Error loading preset banners:', err.message));
    return () => { isMounted = false; };
  }, []);

  const aConfig = useMemo(() => {
    const defaults = {
      title: t('clan_auto_169', t('clan_ads_buy', 'Покупка рекламы')),
      text: t('clan_auto_230', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
      banner: DEFAULT_ADS_BANNER,
      priceText: '',
      priceClicks: 0,
      footerText: '',
      color: '#2ecc71',
      buyWelcome: '',
      partnerWelcome: '',
      partnerRequirements: '',
      questionWelcome: '',
      btnBuyEnabled: true,
      btnPartnerEnabled: true,
      btnPriceEnabled: true,
      btnQuestionEnabled: true
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
            banner: parsed.banner !== undefined && parsed.banner !== null ? parsed.banner : DEFAULT_ADS_BANNER,
            color: parsed.color || parsed.embedColor || defaults.color,
            btnBuyEnabled: parsed.btnBuyEnabled !== undefined ? Boolean(parsed.btnBuyEnabled) : true,
            btnPartnerEnabled: parsed.btnPartnerEnabled !== undefined ? Boolean(parsed.btnPartnerEnabled) : true,
            btnPriceEnabled: parsed.btnPriceEnabled !== undefined ? Boolean(parsed.btnPriceEnabled) : true,
            btnQuestionEnabled: parsed.btnQuestionEnabled !== undefined ? Boolean(parsed.btnQuestionEnabled) : true
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

  const handleSelectPresetBanner = useCallback((url) => {
    setUploadError('');
    updateAConfig('banner', url, true);
  }, [updateAConfig]);

  const handleResetPriceClicks = useCallback(async () => {
    updateAConfig('priceClicks', 0, true);
    if (typeof sendProxyAction === 'function') {
      try {
        await sendProxyAction('reset_ad_clicks', {});
      } catch (e) {
        console.warn('[AdsTab] reset_ad_clicks error:', e.message);
      }
    }
  }, [updateAConfig, sendProxyAction]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setUploading(false);
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

  const handlePublishOrMoveAds = useCallback(async (targetChannelId) => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('publish_or_move_panel', {
        panelType: 'ads',
        targetChannelId
      });
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          updateAConfig('channelId', targetChannelId, true);
        }
        return { success: true };
      }
      return { success: false, error: res?.error };
    }
    return { success: false, error: 'Proxy action not available' };
  }, [sendProxyAction, setConfig, updateAConfig]);

  const handleSyncAds = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      await sendProxyAction('sync_panel', { panelType: 'ads' });
    }
  }, [sendProxyAction]);

  const handleDeleteAds = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('delete_panel', { panelType: 'ads' });
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          const newAc = { ...aConfig, channelId: null, messageId: null };
          const updated = { ...config, adConfigJson: JSON.stringify(newAc) };
          queueAutoSave(updated, true);
        }
      }
    }
  }, [sendProxyAction, setConfig, aConfig, config, queueAutoSave]);

  const localSubTabsList = useMemo(() => {
    if (Array.isArray(contextAdsSubTabs) && contextAdsSubTabs.length > 0) {
      return contextAdsSubTabs;
    }
    return [
      { id: 'panel', label: t('clan_ads_sub_panel', 'Панель рекламы'), icon: Megaphone },
      { id: 'buy', label: t('clan_ads_sub_buy', 'Заказать рекламу'), icon: ShoppingBag },
      { id: 'partner', label: t('clan_ads_sub_partner', 'Партнерство'), icon: Handshake },
      { id: 'price', label: t('clan_ads_sub_price', 'Узнать цену'), icon: DollarSign },
      { id: 'question', label: t('clan_ads_sub_question', 'Вопросы'), icon: HelpCircle }
    ];
  }, [contextAdsSubTabs, t]);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6 w-full max-w-5xl 2xl:max-w-6xl animate-main-fade-in">
      {/* Discord Advertising Panel Channel Status & Manager */}
      <DiscordPanelChannelBar
        title={t('clan_ads_panel_title', 'Панель рекламы и партнерства')}
        channelId={aConfig?.channelId}
        messageId={aConfig?.messageId}
        discordChannels={discordInfo?.channels || []}
        onPublishOrMove={handlePublishOrMoveAds}
        onSync={handleSyncAds}
        onDelete={handleDeleteAds}
        activeDesc={t('clan_ads_panel_active_desc', 'Пользователи могут оставлять заявки на платную рекламу и взаимное партнерство.')}
        promptText={t('clan_ads_panel_prompt', 'Выберите канал для публикации панели рекламы и партнерства. При смене канала бот удалит старую панель.')}
        icon={Megaphone}
        accentColor="purple"
      />

      {/* Subtabs Switcher Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
        {localSubTabsList.map(sub => {
          const isSubActive = activeSubTab === sub.id;
          const SubIcon = sub.icon;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              className={`flex-1 min-w-[95px] sm:min-w-[110px] flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                isSubActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200/80 dark:border-slate-700'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Controls Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {activeSubTab === 'panel' && t('clan_ads_settings_desc', 'Настройте текст рекламного Embed-сообщения, цвет полосы, кнопки и баннер.')}
          {activeSubTab === 'buy' && 'Настройка параметров тикета при заказе платной рекламы.'}
          {activeSubTab === 'partner' && 'Настройка условий и приветствия при заключении взаимного партнерства.'}
          {activeSubTab === 'price' && 'Управление прайс-листом и статистика просмотров цен участниками Discord.'}
          {activeSubTab === 'question' && 'Настройка приветственного сообщения в тикетах обращений к руководству.'}
        </p>
      </div>

      {/* SUBTAB 1: PANEL (Внешний вид и публикация) */}
      {activeSubTab === 'panel' && (
        <div className="space-y-6">
          <div className="space-y-5 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('clan_auto_66', 'Заголовок Embed-сообщения *')}
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow text-sm"
                value={aConfig.title || ''}
                onChange={e => updateAConfig('title', e.target.value, false)}
                onBlur={e => updateAConfig('title', e.target.value, true)}
                placeholder={t('clan_auto_111', t('clan_ads_buy', 'Покупка рекламы'))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('clan_auto_67', 'Основной текст сообщения *')}
              </label>
              <textarea 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px] resize-none text-sm leading-relaxed"
                value={aConfig.text || ''}
                onChange={e => updateAConfig('text', e.target.value, false)}
                onBlur={e => updateAConfig('text', e.target.value, true)}
                placeholder={t('clan_auto_112', 'Информация о рекламе...')}
              />
            </div>

            {/* Color and Footer Customization Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Embed Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('clan_embed_color', 'Цвет полосы Embed')}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={aConfig.color?.startsWith('#') ? aConfig.color : '#2ecc71'}
                    onChange={e => updateAConfig('color', e.target.value, true)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                  />
                  <input
                    type="text"
                    value={aConfig.color || '#2ecc71'}
                    onChange={e => updateAConfig('color', e.target.value, false)}
                    onBlur={e => updateAConfig('color', e.target.value, true)}
                    placeholder="#2ecc71"
                    className="w-28 px-3 py-1.5 font-mono text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white uppercase"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {COLOR_SWATCHES.map(sw => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => updateAConfig('color', sw.value, true)}
                        className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.value }}
                        title={sw.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Embed Footer Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('clan_embed_footer', 'Текст футера Embed (подвал)')}</span>
                </label>
                <input
                  type="text"
                  value={aConfig.footerText || ''}
                  onChange={e => updateAConfig('footerText', e.target.value, false)}
                  onBlur={e => updateAConfig('footerText', e.target.value, true)}
                  placeholder={t('clan_embed_footer_placeholder', 'Например: Официальный рекламный раздел')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none"
                />
              </div>
            </div>

            {/* Banner Section */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('clan_ads_banner_label', 'Ссылка на баннер (изображение)')}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                  />

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

              {/* Готовые баннеры рекламы и Rust с сервера */}
              {presetBanners && presetBanners.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('clan_recruitment_presets_title', 'Готовые баннеры (с сервера):')}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t('clan_recruitment_presets_hint', 'Кликните по картинке для применения')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Default Banner Card */}
                    <button
                      type="button"
                      onClick={() => handleSelectPresetBanner(aConfig.banner === DEFAULT_ADS_BANNER ? '' : DEFAULT_ADS_BANNER)}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-slate-900 ${
                        aConfig.banner === DEFAULT_ADS_BANNER
                          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/40'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400/80 opacity-75 hover:opacity-100'
                      }`}
                      title="Официальный баннер рекламы по умолчанию"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden relative">
                        <img
                          src={DEFAULT_ADS_BANNER}
                          alt="Default Ads Banner"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {aConfig.banner === DEFAULT_ADS_BANNER && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white p-1 rounded-full shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                          По умолчанию
                        </span>
                      </div>
                    </button>

                    {presetBanners.map(preset => {
                      const isSelected = aConfig.banner === preset.fullUrl || (preset.fileName && aConfig.banner?.includes(preset.fileName));
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPresetBanner(isSelected ? '' : preset.fullUrl)}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-slate-900 ${
                            isSelected
                              ? 'border-blue-500 shadow-md ring-2 ring-blue-500/40'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400/80 opacity-75 hover:opacity-100'
                          }`}
                          title={`${preset.title}: ${preset.desc}`}
                        >
                          <div className="aspect-[16/9] w-full overflow-hidden relative">
                            <img
                              src={preset.previewUrl || preset.fullUrl}
                              alt={preset.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                if (e.target.src !== preset.fullUrl) {
                                  e.target.src = preset.fullUrl;
                                }
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white p-1 rounded-full shadow-md z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {preset.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Управление кнопками на панели рекламы в Discord */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Кнопки на панели рекламы в Discord</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Discord Components
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Включайте или отключайте нужные кнопки для участников сервера. Кнопка «Разработать Discord-бота» всегда активна и расположена в самом низу.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Заказать рекламу */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Заказать рекламу</span>
                    <span className="text-[11px] text-slate-400 block truncate">Создание тикета заказа рекламы</span>
                  </div>
                </div>
                <ToggleSwitch
                  checked={aConfig.btnBuyEnabled !== false}
                  onChange={val => updateAConfig('btnBuyEnabled', val, true)}
                  activeColor="blue"
                  size="sm"
                />
              </div>

              {/* 2. Заключить партнерство */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Заключить партнерство</span>
                    <span className="text-[11px] text-slate-400 block truncate">Тикет взаимного сотрудничества</span>
                  </div>
                </div>
                <ToggleSwitch
                  checked={aConfig.btnPartnerEnabled !== false}
                  onChange={val => updateAConfig('btnPartnerEnabled', val, true)}
                  activeColor="blue"
                  size="sm"
                />
              </div>

              {/* 3. Узнать цену */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Узнать цену</span>
                    <span className="text-[11px] text-slate-400 block truncate">Скрытый прайс-лист в Discord</span>
                  </div>
                </div>
                <ToggleSwitch
                  checked={aConfig.btnPriceEnabled !== false}
                  onChange={val => updateAConfig('btnPriceEnabled', val, true)}
                  activeColor="emerald"
                  size="sm"
                />
              </div>

              {/* 4. Вопрос администрации */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Вопрос администрации</span>
                    <span className="text-[11px] text-slate-400 block truncate">Приватный вопрос руководству</span>
                  </div>
                </div>
                <ToggleSwitch
                  checked={aConfig.btnQuestionEnabled !== false}
                  onChange={val => updateAConfig('btnQuestionEnabled', val, true)}
                  activeColor="purple"
                  size="sm"
                />
              </div>
            </div>

            {/* 5. Разработать Discord-бота (Всегда активна и всегда внизу) */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Разработать Discord-бота</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Всегда внизу
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Кнопка заказа Discord-бота от Industrial Studio. Всегда активна и размещается в самом низу панели.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/60 shadow-2xs shrink-0">
                <Lock className="w-3.5 h-3.5" />
                <span>Активна</span>
              </div>
            </div>
          </div>

          {/* Navigation to Next Subtab */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('buy')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Перейти к настройке кнопки «Заказать рекламу»</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BUY (Заказать рекламу) */}
      {activeSubTab === 'buy' && (
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Кнопка «Заказать рекламу»
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  При нажатии на эту кнопку участник Discord создает приватный тикет для покупки рекламы на вашем сервере.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Приветственное сообщение в тикете заказа рекламы
              </label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[110px] resize-none text-sm leading-relaxed"
                value={aConfig.buyWelcome || ''}
                onChange={e => updateAConfig('buyWelcome', e.target.value, false)}
                onBlur={e => updateAConfig('buyWelcome', e.target.value, true)}
                placeholder="Привет, {user}! Опишите, какую рекламу вы хотите заказать (срок, формат, ссылку на ресурс). Администрация ответит вам в ближайшее время."
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Используйте переменные <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-500 font-mono text-xs">{'{user}'}</code> для упоминания автора тикета.
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('panel')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к панели рекламы</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('partner')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Перейти к разделу «Партнерство»</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PARTNER (Заключить партнерство) */}
      {activeSubTab === 'partner' && (
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Кнопка «Заключить партнерство»
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Создает приватный тикет для обсуждения условий взаимного сотрудничества с другими серверами.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Условия и требования для партнерства
              </label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[90px] resize-none text-sm leading-relaxed"
                value={aConfig.partnerRequirements || ''}
                onChange={e => updateAConfig('partnerRequirements', e.target.value, false)}
                onBlur={e => updateAConfig('partnerRequirements', e.target.value, true)}
                placeholder="• От 200 реальных участников на сервере&#10;• Активный голосовой и текстовый онлайн&#10;• Взаимный анонс в закрепленном партнерском канале"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Кратко опишите, с какими серверами вы готовы сотрудничать.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Приветственное сообщение в тикете партнерства
              </label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px] resize-none text-sm leading-relaxed"
                value={aConfig.partnerWelcome || ''}
                onChange={e => updateAConfig('partnerWelcome', e.target.value, false)}
                onBlur={e => updateAConfig('partnerWelcome', e.target.value, true)}
                placeholder="Привет, {user}! Прикрепите ссылку на ваш сервер, укажите количество участников и предложите условия взаимного партнерства."
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Используйте переменную <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-500 font-mono text-xs">{'{user}'}</code>.
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('buy')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к заказу рекламы</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('price')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Перейти к разделу «Узнать цену»</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PRICE (Узнать цену) */}
      {activeSubTab === 'price' && (
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Кнопка «Узнать цену» (Прайс-лист)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Отправляет пользователю скрытое (ephemeral) сообщение в Discord с прайс-листом без создания тикета.
                  </p>
                </div>
              </div>

              {/* Live Click Counter & Reset */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Кликов по цене: <strong className="font-mono text-sm">{aConfig.priceClicks || 0}</strong>
                  </span>
                </div>
                {Number(aConfig.priceClicks) > 0 && (
                  <button
                    type="button"
                    onClick={handleResetPriceClicks}
                    className="p-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Сбросить счётчик кликов"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Текст прайс-листа и цены
              </label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[120px] resize-none text-sm leading-relaxed"
                value={aConfig.priceText || ''}
                onChange={e => updateAConfig('priceText', e.target.value, false)}
                onBlur={e => updateAConfig('priceText', e.target.value, true)}
                placeholder="📢 Реклама в общем чате: 300₽ / неделя&#10;📌 Закрепленное объявление: 700₽ / неделя&#10;🤝 Партнерство: бесплатно по согласованию"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Этот текст моментально открывается только нажавшему пользователю. Это экономит каналы сервера и избавляет от пустых тикетов «просто спросить цену».
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('partner')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к разделу «Партнерство»</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('question')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Перейти к разделу «Вопросы»</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 5: QUESTION (Вопрос к администрации) */}
      {activeSubTab === 'question' && (
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Кнопка «Вопрос администрации»
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Создает приватный тикет для вопросов участников руководству сервера.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Приветственное сообщение в тикете вопроса
              </label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[110px] resize-none text-sm leading-relaxed"
                value={aConfig.questionWelcome || ''}
                onChange={e => updateAConfig('questionWelcome', e.target.value, false)}
                onBlur={e => updateAConfig('questionWelcome', e.target.value, true)}
                placeholder="Привет, {user}! Задайте ваш вопрос администрации сервера. Мы ответим вам в ближайшее время."
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Используйте переменную <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-500 font-mono text-xs">{'{user}'}</code>.
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('price')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к прайс-листу</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('panel')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Вернуться к панели рекламы</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}



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
                setActiveTab('ad_tickets');
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{t('clan_open_ad_tickets_btn', 'Открыть журнал заявок на рекламу')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
