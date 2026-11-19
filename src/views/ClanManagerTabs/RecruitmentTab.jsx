import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  RefreshCw, Sliders, Hash, UserPlus,
  UserCheck, Check, AlertTriangle, ScrollText, Bot, Clock,
  ExternalLink, Eye, EyeOff, X, ArrowRight,
  Upload, Loader2, CheckCircle2, HardDrive, Trash2,
  Sparkles, Image as ImageIcon, Info, ChevronDown, Palette
} from 'lucide-react';
import ChannelSelect from '../../components/ChannelSelect';
import { ToggleSwitch } from '../ClanManager';
import { normalizeImageUrl } from '../../utils/urlHelper';
import { uploadBanner, deleteBanner } from '../../services/uploadService';
import DiscordPanelChannelBar from '../../components/DiscordPanelChannelBar';
import { proofreadRecruitmentText, getPresetBanners } from '../../services/aiService';

export function HelpTooltip({ text, className = '' }) {
  if (!text) return null;
  return (
    <span className={`group relative inline-flex items-center align-middle ml-1.5 ${className}`}>
      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-600 dark:hover:text-orange-400 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-help transition-colors select-none">
        ?
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 sm:w-72 p-2.5 bg-slate-900/95 text-slate-100 text-[11px] rounded-xl shadow-xl border border-slate-700/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none leading-relaxed text-left font-normal normal-case backdrop-blur-xs">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700/60"></span>
      </span>
    </span>
  );
}

export default function RecruitmentTab() {
  const {
    config, setConfig, discordInfo, rosterData, applicationsData, pendingAppsCount,
    handleCreateRecruitmentInvite, creatingRecruitmentInvite,
    recruitmentInviteStatus, setRecruitmentInviteStatus,
    checkingRecruitmentInvite, verifyRecruitmentInvite,
    isFullScreenWindow, isCompanionWindowVisible, showDiscordLivePreview, setShowDiscordLivePreview,
    queueAutoSave, saveConfig, sendProxyAction, addLog,
    openExternalUrl, setActiveTab, t,
    currentActiveGuildId, guildId,
    aiPreviewOverride, setAiPreviewOverride
  } = useContext(ClanManagerContext);

  const [isAiPreviewing, setIsAiPreviewing] = useState(false);

  const gridTwoCols = isCompanionWindowVisible
    ? "grid grid-cols-1 2xl:grid-cols-2 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  const effectiveGuildId = currentActiveGuildId || guildId || config?.guildId;
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadBannerError, setUploadBannerError] = useState('');
  const bannerFileInputRef = useRef(null);

  const [checkingPrefix, setCheckingPrefix] = useState(false);
  const [missingPrefixes, setMissingPrefixes] = useState([]);

  // --- AI Text Proofreading & Presets State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState('');
  const [presetBanners, setPresetBanners] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getPresetBanners().then(data => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setPresetBanners(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // --- Memoized Configurations ---
  const defaultRejectMsg = useMemo(() => {
    return t('clan_recruitment_reject_msg_ph') || 'К сожалению, ваша анкета не соответствует минимальным требованиям клана...';
  }, [t]);

  const rConfig = useMemo(() => {
    let rc = {
      link: config?.discordLink || '',
      banner: 'https://i.imgur.com/UaMfYMK.png',
      title: config?.name ? `Набор в клан ${config.name}` : t('clan_rec_base', 'Набор в клан'),
      text: t('clan_auto_v2_1023', 'Требования:\n\n**MAIN**\nВозраст: 20+\nЧасы: 5000+\nТребования: 8+ часов онлайна\nНавыки: Желательна универсальность\n\n**Билдер:**\nВозраст: 18+\nЧасы: 3000+\nТребования: 6+ часов онлайна\nНавыки: Умение быстро строить кастомные базы'),
      customLeaderId: '',
      autoRejectEnabled: false,
      minAge: 0,
      minHours: 0,
      rejectBanned: true,
      strictSteamCheck: false,
      silentAutoReject: true,
      autoRejectMessage: defaultRejectMsg,
      steamPrefixCheck: false,
      steamPrefix: '',
      steamPrefixLogChannel: '',
      markdownEnabled: true
    };
    try {
      if (config?.recruitmentConfigJson) {
        rc = { ...rc, ...JSON.parse(config.recruitmentConfigJson) };
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }

    if (!rc.autoRejectMessage || !rc.autoRejectMessage.trim()) {
      rc.autoRejectMessage = defaultRejectMsg;
    }

    if (config?.name) {
      if (!rc.title || rc.title === t('clan_rec_base', 'Набор в клан') || rc.title.includes('GODS')) {
        rc.title = `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}`;
      } else if (rc.title.includes('GODS')) {
        rc.title = rc.title.replace(/\bGODS\b/g, config.name);
      }
    }
    return rc;
  }, [config?.recruitmentConfigJson, config?.discordLink, config?.name, defaultRejectMsg, t]);

  const cConfig = useMemo(() => {
    let cc = {};
    try {
      if (config?.channelsConfigJson) {
        cc = JSON.parse(config.channelsConfigJson);
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }
    return cc;
  }, [config?.channelsConfigJson]);

  // --- Collapsible Sections with User Override Memory ---
  const [userAutoRejectExpanded, setUserAutoRejectExpanded] = useState(null);
  const isAutoRejectExpanded = userAutoRejectExpanded !== null
    ? userAutoRejectExpanded
    : Boolean(rConfig.autoRejectEnabled);

  const [userSteamPrefixExpanded, setUserSteamPrefixExpanded] = useState(null);
  const isSteamPrefixExpanded = userSteamPrefixExpanded !== null
    ? userSteamPrefixExpanded
    : Boolean(rConfig.steamPrefixCheck);

  const updateRConfig = useCallback((key, val, immediate = false) => {
    const newConfig = { ...rConfig, [key]: val };
    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, immediate);
  }, [rConfig, config, queueAutoSave]);

  const handleRunProofreading = useCallback(async () => {
    const textToAnalyze = rConfig.text;
    if (!textToAnalyze || !textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setAiError('');
    setAiSuggestion(null);

    try {
      const currentMd = rConfig.markdownEnabled !== false;
      const res = await proofreadRecruitmentText(textToAnalyze, currentMd);
      if (res.success && res.data) {
        setAiSuggestion({
          improvedText: res.data.improvedText,
          suggestedMarkdown: res.data.suggestedMarkdown,
          hasChanges: res.data.hasChanges,
          summary: res.data.summary,
          providerName: res.providerName || res.provider || 'AI'
        });
      } else {
        setAiError(res.error || t('clan_ai_err_general', 'Не удалось проанализировать текст'));
      }
    } catch (err) {
      setAiError(err.message || t('clan_ai_err_general', 'Не удалось проанализировать текст'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [rConfig.text, rConfig.markdownEnabled, t]);

  const handleApplyAiSuggestion = useCallback(() => {
    if (!aiSuggestion) return;
    const newConfig = {
      ...rConfig,
      text: aiSuggestion.improvedText
    };
    if (typeof aiSuggestion.suggestedMarkdown === 'boolean') {
      newConfig.markdownEnabled = aiSuggestion.suggestedMarkdown;
    }
    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, true);
    setAiSuggestion(null);
    setAiError('');
    setIsAiPreviewing(false);
    if (setAiPreviewOverride) setAiPreviewOverride(null);
  }, [aiSuggestion, rConfig, config, queueAutoSave, setAiPreviewOverride]);

  const handleDeclineAiSuggestion = useCallback(() => {
    setAiSuggestion(null);
    setAiError('');
    setIsAiPreviewing(false);
    if (setAiPreviewOverride) setAiPreviewOverride(null);
  }, [setAiPreviewOverride]);

  const handleToggleAiPreview = useCallback(() => {
    if (isAiPreviewing) {
      setIsAiPreviewing(false);
      if (setAiPreviewOverride) setAiPreviewOverride(null);
    } else if (aiSuggestion?.improvedText) {
      setIsAiPreviewing(true);
      if (setAiPreviewOverride) setAiPreviewOverride(aiSuggestion.improvedText);
      if (setShowDiscordLivePreview) setShowDiscordLivePreview(true);
    }
  }, [isAiPreviewing, aiSuggestion, setAiPreviewOverride, setShowDiscordLivePreview]);

  const handleSelectPresetBanner = useCallback((url) => {
    setUploadBannerError('');
    updateRConfig('banner', url, true);
  }, [updateRConfig]);

  const handleBannerFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      setUploadBannerError(t('clan_banner_err_size', 'Размер файла превышает лимит 2 МБ'));
      return;
    }

    setUploadingBanner(true);
    setUploadBannerError('');

    try {
      const res = await uploadBanner(file, 'recruitment', effectiveGuildId);
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

        updateRConfig('banner', res.url, true);
      } else {
        setUploadBannerError(res.error || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
      }
    } catch (err) {
      setUploadBannerError(err.message || t('clan_banner_upload_err', 'Ошибка загрузки изображения'));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveRecruitmentBanner = async () => {
    const cur = rConfig.banner;
    setUploadBannerError('');
    updateRConfig('banner', '', true);
    if (cur && cur.includes('/uploads/banners/')) {
      try {
        await deleteBanner('recruitment', effectiveGuildId);
      } catch (err) {
        console.warn('[RecruitmentTab] Could not delete banner from server disk:', err.message);
      }
    }
  };

  const updateChannelConfig = useCallback((key, val) => {
    const newCConfig = { ...cConfig, [key]: val };
    const updated = { ...config, channelsConfigJson: JSON.stringify(newCConfig) };
    queueAutoSave(updated, true);
  }, [cConfig, config, queueAutoSave]);

  const leaders = useMemo(() => {
    return rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
  }, [rosterData?.roster, config?.leaderRoleId]);

  const firstLeader = leaders[0];

  // --- Single-pass status counts calculation (O(N) instead of 5 filter loops) ---
  const statusCounts = useMemo(() => {
    const counts = { ALL: 0, PENDING: 0, ACCEPTED: 0, REJECTED: 0, AUTO_REJECTED: 0 };
    if (Array.isArray(applicationsData)) {
      counts.ALL = applicationsData.length;
      for (let i = 0; i < applicationsData.length; i++) {
        const st = applicationsData[i].status;
        if (counts[st] !== undefined) counts[st]++;
      }
    }
    return counts;
  }, [applicationsData]);

  const handlePublishOrMoveRecruitment = useCallback(async (targetChannelId) => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('publish_or_move_panel', {
        panelType: 'recruitment',
        targetChannelId
      });
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          updateRConfig('channelId', targetChannelId, true);
        }
        return { success: true };
      }
      return { success: false, error: res?.error };
    }
    return { success: false, error: 'Proxy action not available' };
  }, [sendProxyAction, setConfig, updateRConfig]);

  const handleSyncRecruitment = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      await sendProxyAction('sync_panel', { panelType: 'recruitment' });
    }
  }, [sendProxyAction]);

  const handleDeleteRecruitment = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('delete_panel', { panelType: 'recruitment' });
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          const newRc = { ...rConfig, channelId: null, messageId: null };
          const updated = { ...config, recruitmentConfigJson: JSON.stringify(newRc) };
          queueAutoSave(updated, true);
        }
      }
    }
  }, [sendProxyAction, setConfig, rConfig, config, queueAutoSave]);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6">
      {/* Discord Recruitment Panel Channel Status & Manager */}
      <DiscordPanelChannelBar
        title={t('clan_recruitment_panel_title', 'Панель набора в клан')}
        channelId={rConfig?.channelId}
        messageId={rConfig?.messageId}
        discordChannels={discordInfo?.channels || []}
        onPublishOrMove={handlePublishOrMoveRecruitment}
        onSync={handleSyncRecruitment}
        onDelete={handleDeleteRecruitment}
        activeDesc={t('clan_recruitment_panel_active_desc', 'Кандидаты видят эту панель и нажимают кнопку для подачи заявки в клан.')}
        promptText={t('clan_recruitment_panel_prompt', 'Выберите канал для публикации интерактивной панели набора в клан с кнопкой подачи заявки. При смене канала бот удалит старую панель.')}
        icon={UserPlus}
        accentColor="orange"
      />

      {/* Action / Preview Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('clan_recruitment_settings_desc', 'Настройте интерактивную панель набора, требования к кандидатам и фильтры Steam.')}
        </p>
        <button
          type="button"
          onClick={() => setShowDiscordLivePreview(prev => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer shrink-0 ${
            showDiscordLivePreview
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
          }`}
          title={showDiscordLivePreview ? t('clan_auto_v2_1026', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1027', 'Показать живой предпросмотр Discord')}
        >
          {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showDiscordLivePreview ? t('clan_auto_v2_1028', 'Превью Discord') : t('clan_auto_v2_1029', 'Включить превью')}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Быстрый переход: Журнал и статус заявок в клан */}
        <div className="p-4 sm:p-5 border border-orange-200/80 dark:border-orange-900/40 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/30 dark:via-amber-950/10 dark:to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20 shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('clan_tab_applications', 'Заявки в клан')}
                </h4>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-xs">
                  {pendingAppsCount > 0 ? `${pendingAppsCount} новых` : `${Array.isArray(applicationsData) ? applicationsData.length : 0} всего`}
                </span>
                {pendingAppsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Ожидают решения
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('clan_recruitment_apps_banner_desc', 'Просмотр анкет кандидатов, оперативное рассмотрение и архив тикетов.')}
              </p>
            </div>
          </div>
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{t('clan_open_applications_btn', 'Открыть журнал заявок')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1. Основные параметры панели набора */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-500" />
            {t('clan_auto_42', 'Панель набора в Discord')}
          </h4>
          
          {/* Ссылка на сервер для набора */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('clan_recruitment_server_link') || 'Ссылка на сервер для набора'}
              </label>
              <button
                type="button"
                onClick={handleCreateRecruitmentInvite}
                disabled={creatingRecruitmentInvite}
                title={t('clan_auto_101', 'Создать новую постоянную ссылку через бота и вставить в поле')}
                className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${creatingRecruitmentInvite ? 'animate-spin' : ''}`} />
                <span>{t('clan_recruitment_link_refresh_btn') || 'Сгенерировать ссылку'}</span>
              </button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                required
                className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-sm ${
                  recruitmentInviteStatus === 'invalid'
                    ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/40'
                    : recruitmentInviteStatus === 'valid'
                    ? 'border-emerald-400 dark:border-emerald-500/60 focus:ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
                }`}
                value={rConfig.link ?? (config?.discordLink ?? '')}
                onChange={e => updateRConfig('link', e.target.value, false)}
                onBlur={e => {
                  const val = e.target.value;
                  updateRConfig('link', val, true);
                  if (val.trim()) {
                    verifyRecruitmentInvite(val);
                  } else {
                    setRecruitmentInviteStatus(null);
                  }
                }}
                placeholder="https://discord.gg/..."
              />
              {checkingRecruitmentInvite && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {recruitmentInviteStatus === 'valid' && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{t('clan_recruitment_link_valid') || 'Ссылка активна'}</span>
              </div>
            )}
            {recruitmentInviteStatus === 'invalid' && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('clan_recruitment_link_invalid') || 'Ссылка недействительна или была удалена в Discord'}</span>
              </div>
            )}
          </div>

          {/* Лидер клана в embed */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                {t('clan_auto_44', 'Лидер клана (в embed-сообщении набора)')}
              </label>
              {rConfig.customLeaderId && (
                <button
                  type="button"
                  onClick={() => updateRConfig('customLeaderId', '', true)}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>{t('clan_auto_45', 'Стереть (вернуть авто-определение)')}</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('clan_leader_auto_desc', 'По умолчанию лидер определяется по назначенной роли Лидера в Discord:')}{' '}
              {leaders.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  {leaders.map((m, idx) => {
                    const leaderId = m.userId || m.id;
                    const leaderName = m.displayName || m.username;
                    return (
                      <span key={leaderId || idx} className="inline-flex items-center gap-1">
                        <strong className="text-slate-800 dark:text-slate-200">{leaderName}</strong>
                        {leaderId && (
                          <button
                            type="button"
                            onClick={() => updateRConfig('customLeaderId', leaderId, true)}
                            className="inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 hover:bg-orange-100 dark:bg-slate-700 dark:hover:bg-orange-950/60 text-slate-700 hover:text-orange-700 dark:text-slate-300 dark:hover:text-orange-300 transition-colors cursor-pointer"
                            title={t('clan_auto_102', 'Нажмите, чтобы вставить этот ID в поле')}
                          >
                            <span>(ID: {leaderId})</span>
                          </button>
                        )}
                        {idx < leaders.length - 1 ? ',' : ''}
                      </span>
                    );
                  })}
                </span>
              ) : (
                <strong className="text-slate-700 dark:text-slate-300">{t('clan_auto_46', 'Роль не выдана ни одному участнику')}</strong>
              )}
              {t('clan_leader_manual_desc', '. Вы можете принудительно указать Discord ID пользователя:')}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                placeholder={
                  firstLeader?.userId || firstLeader?.id
                    ? `${t('clan_leader_id_ex', 'ID лидера (например: ')}${firstLeader.userId || firstLeader.id})`
                    : t('clan_leader_id_placeholder', 'Укажите Discord ID пользователя (например: 718872288000000000)')
                }
                value={rConfig.customLeaderId || ''}
                onChange={e => updateRConfig('customLeaderId', e.target.value, false)}
                onBlur={e => updateRConfig('customLeaderId', e.target.value, true)}
              />
              {firstLeader && (!rConfig.customLeaderId || rConfig.customLeaderId !== (firstLeader.userId || firstLeader.id)) && (
                <button
                  type="button"
                  onClick={() => updateRConfig('customLeaderId', firstLeader.userId || firstLeader.id, true)}
                  className="px-3 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  title={t('clan_auto_103', 'Вставить ID лидера по умолчанию')}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t('clan_auto_47', 'Вставить ID')}</span>
                </button>
              )}
              {rConfig.customLeaderId && (
                <button
                  type="button"
                  onClick={() => updateRConfig('customLeaderId', '', true)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title={t('clan_auto_104', 'Стереть')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_48', 'Заголовок Embed-сообщения *')}</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
              value={rConfig.title}
              onChange={e => updateRConfig('title', e.target.value, false)}
              onBlur={e => updateRConfig('title', e.target.value, true)}
              placeholder={config?.name ? `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}` : t('clan_recruit_default_title', "Набор в клан")}
            />
          </div>
          
          {/* Текст с требованиями и переключатель Markdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('clan_auto_49', 'Текст с требованиями *')}
              </label>
              <div className="flex items-center gap-2.5">
                {/* Зелёная кнопка «Анализ и исправление» */}
                <button
                  type="button"
                  onClick={handleRunProofreading}
                  disabled={isAnalyzing || !rConfig.text?.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
                  title={t('clan_recruitment_ai_analyze_hint', 'Анализ и исправление текста (грамматика, оформление и Markdown с сохранением игрового сленга Rust)')}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isAnalyzing ? t('clan_recruitment_ai_analyzing', 'Анализ...') : t('clan_recruitment_ai_analyze_btn', 'Анализ и исправление')}</span>
                </button>

                <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('clan_markdown_supported', 'Markdown поддерживается')}
                  </span>
                  <ToggleSwitch
                    checked={rConfig.markdownEnabled !== false}
                    onChange={val => updateRConfig('markdownEnabled', val, true)}
                    activeColor="orange"
                  />
                </div>
              </div>
            </div>

            <textarea 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-xs min-h-[140px]"
              value={rConfig.text}
              onChange={e => updateRConfig('text', e.target.value, false)}
              onBlur={e => updateRConfig('text', e.target.value, true)}
              placeholder={t('clan_auto_110', 'Опишите требования...')}
            ></textarea>

            {/* Ошибка анализа */}
            {aiError && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{aiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiError('')}
                  className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Карточка предложения изменений (Анализ и исправление) */}
            {aiSuggestion && (
              <div className="mt-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('clan_ai_suggestion_title', 'Предложение по исправлению')} ({aiSuggestion.providerName})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeclineAiSuggestion}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={t('clan_ai_decline', 'Отказаться')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {aiSuggestion.summary && (
                  <div className="text-slate-600 dark:text-slate-300 italic text-[11px] leading-relaxed">
                    💡 {aiSuggestion.summary}
                  </div>
                )}

                {/* Подсказка о Markdown переключателе */}
                {typeof aiSuggestion.suggestedMarkdown === 'boolean' && aiSuggestion.suggestedMarkdown !== (rConfig.markdownEnabled !== false) && (
                  <div className="p-2.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 text-[11px] flex items-center gap-2 font-medium border border-emerald-200/60 dark:border-emerald-800/40">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {aiSuggestion.suggestedMarkdown
                        ? t('clan_ai_suggest_enable_md', 'В тексте обнаружена разметка списков или заголовков. При применении будет включен режим Markdown.')
                        : t('clan_ai_suggest_disable_md', 'Для данного текста разметка Markdown не требуется. При применении режим Markdown будет выключен.')}
                    </span>
                  </div>
                )}

                {/* Превью предложенного текста */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('clan_ai_our_variant', 'Наш вариант:')}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {aiSuggestion.hasChanges ? 'Внесены аккуратные правки' : 'Текст уже выглядит отлично'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 font-mono text-[11px] whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                    {aiSuggestion.improvedText}
                  </div>
                </div>

                {/* Кнопки Предпросмотр / Отказаться / Применить */}
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleAiPreview}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAiPreviewing
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                    title={isAiPreviewing ? 'Скрыть предложенный ИИ вариант в превью' : 'Показать предложенный вариант в окне превью Discord'}
                  >
                    {isAiPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isAiPreviewing ? t('clan_ai_preview_active_btn', 'Скрыть предпросмотр') : t('clan_ai_preview_btn', 'Предпросмотр')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineAiSuggestion}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium transition-colors cursor-pointer text-xs"
                  >
                    {t('clan_ai_btn_decline', 'Отказаться')}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAiSuggestion}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('clan_ai_btn_apply', 'Применить')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Кастомизация Embed и кнопок Discord */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-orange-500" />
                <span>{t('clan_recruitment_embed_custom_title', 'Оформление Embed и кнопок Discord')}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Embed Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span>{t('clan_embed_color', 'Цвет полосы Embed')}</span>
                  <HelpTooltip text="Цвет левой полосы карточки набора в Discord." />
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={rConfig.embedColor?.startsWith('#') ? rConfig.embedColor : '#5865f2'}
                    onChange={e => updateRConfig('embedColor', e.target.value, true)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                  />
                  <input
                    type="text"
                    value={rConfig.embedColor || '#5865f2'}
                    onChange={e => updateRConfig('embedColor', e.target.value, false)}
                    onBlur={e => updateRConfig('embedColor', e.target.value, true)}
                    placeholder="#5865f2"
                    className="w-28 px-3 py-1.5 font-mono text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white uppercase"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { name: 'Blurple', value: '#5865f2' },
                      { name: 'Emerald', value: '#10b981' },
                      { name: 'Amber', value: '#f59e0b' },
                      { name: 'Rose', value: '#ef4444' },
                      { name: 'Blue', value: '#3b82f6' },
                      { name: 'Purple', value: '#8b5cf6' }
                    ].map(sw => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => updateRConfig('embedColor', sw.value, true)}
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
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('clan_embed_footer', 'Текст футера Embed (подвал)')}</span>
                  <HelpTooltip text="Нижняя строчка мелким шрифтом в Embed карточке." />
                </label>
                <input
                  type="text"
                  value={rConfig.footerText || ''}
                  onChange={e => updateRConfig('footerText', e.target.value, false)}
                  onBlur={e => updateRConfig('footerText', e.target.value, true)}
                  placeholder={t('clan_embed_footer_placeholder', 'Например: Присоединяйтесь к сильнейшим!')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Button text (Open) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <span>{t('clan_button_label', 'Текст кнопки подачи заявки')}</span>
                  <HelpTooltip text="Текст на зеленой кнопке в сообщении набора Discord." />
                </label>
                <input
                  type="text"
                  value={rConfig.buttonText || ''}
                  onChange={e => updateRConfig('buttonText', e.target.value, false)}
                  onBlur={e => updateRConfig('buttonText', e.target.value, true)}
                  placeholder={t('clan_button_label_placeholder', 'Подать заявку')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              {/* Button text (Closed) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <span>{t('clan_button_closed_label', 'Текст кнопки при закрытом наборе')}</span>
                  <HelpTooltip text="Текст на неактивной кнопке, когда набор выключен." />
                </label>
                <input
                  type="text"
                  value={rConfig.closedButtonText || ''}
                  onChange={e => updateRConfig('closedButtonText', e.target.value, false)}
                  onBlur={e => updateRConfig('closedButtonText', e.target.value, true)}
                  placeholder={t('clan_button_closed_placeholder', 'Набор закрыт')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>
            </div>

            {/* Include metadata lines toggle */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('clan_recruitment_include_meta', 'Добавлять в конец описания контакты лидеров и ссылку')}
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {t('clan_recruitment_include_meta_hint', 'Если выключено, в Embed будет отображаться только ваш собственный текст выше.')}
                </p>
              </div>
              <ToggleSwitch
                checked={rConfig.includeMetadataLines !== false}
                onChange={val => updateRConfig('includeMetadataLines', val, true)}
                activeColor="orange"
              />
            </div>
          </div>

          {/* Ссылка на баннер (Изображение) - Расположена под требованиями на всю ширину */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('clan_auto_43', 'Ссылка на баннер (Изображение)')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  onChange={handleBannerFileSelect}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  disabled={uploadingBanner}
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
                {rConfig.banner && (
                  <button
                    type="button"
                    onClick={handleRemoveRecruitmentBanner}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-800/40 cursor-pointer"
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
              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
              value={rConfig.banner}
              onChange={e => updateRConfig('banner', e.target.value, false)}
              onBlur={e => {
                const normalized = normalizeImageUrl(e.target.value);
                updateRConfig('banner', normalized, true);
              }}
              placeholder="https://..."
            />
            {uploadBannerError && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadBannerError}</span>
              </div>
            )}
            {rConfig.banner && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                {rConfig.banner.includes('/uploads/banners/') ? (
                  <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{t('clan_banner_uploaded_server', 'Размещено на сервере Industrial Hub')}</span>
                  </div>
                ) : rConfig.banner.includes('/presets/banners/') ? (
                  <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('clan_banner_preset_server', 'Выбран готовый баннер Rust с сервера')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('clan_ads_banner_active', 'Установлен кастомный баннер')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Готовые баннеры Rust с сервера */}
            {presetBanners.length > 0 && (
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('clan_recruitment_presets_title', 'Готовые баннеры Rust (с сервера):')}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {t('clan_recruitment_presets_hint', 'Кликните по картинке для применения')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {presetBanners.map(preset => {
                    const isSelected = rConfig.banner === preset.fullUrl || (preset.fileName && rConfig.banner?.includes(preset.fileName));
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPresetBanner(preset.fullUrl)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-slate-900 ${
                          isSelected
                            ? 'border-orange-500 shadow-md ring-2 ring-orange-500/40'
                            : 'border-slate-200 dark:border-slate-700/80 hover:border-orange-400/80 opacity-75 hover:opacity-100'
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
                            <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white p-1 rounded-full shadow-md z-10">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 z-0">
                            <div className="text-[10px] font-semibold text-white truncate drop-shadow-sm">
                              {preset.title.split(' (')[0]}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Автоматическое отклонение заявок (Auto-Reject) */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('clan_recruitment_auto_reject_title') || 'Автоматическое отклонение заявок'}</span>
                  {!rConfig.autoRejectEnabled && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      Отключено
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('clan_recruitment_auto_reject_desc') || 'Бот автоматически проверяет анкеты кандидатов при подаче и отклоняет неподходящие заявки.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUserAutoRejectExpanded(!isAutoRejectExpanded)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{isAutoRejectExpanded ? 'Скрыть параметры' : 'Параметры фильтра'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAutoRejectExpanded ? 'rotate-180' : ''}`} />
              </button>

              <ToggleSwitch 
                checked={Boolean(rConfig.autoRejectEnabled)}
                onChange={val => updateRConfig('autoRejectEnabled', val, true)}
                activeColor="orange"
              />
            </div>
          </div>

          {isAutoRejectExpanded && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              {!rConfig.autoRejectEnabled && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Авто-отклонение выключено. Параметры ниже сохранены и начнут действовать после включения тумблера.</span>
                </div>
              )}

              <div className={gridTwoCols}>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('clan_recruitment_min_age') || 'Минимальный возраст кандидата'}</span>
                    <HelpTooltip text={t('clan_auto_50', 'Кандидаты младше этого возраста будут автоматически отклонены ботом при подаче анкеты.')} />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max="99"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                    value={rConfig.minAge || ''}
                    onChange={e => updateRConfig('minAge', e.target.value ? parseInt(e.target.value, 10) : 0, false)}
                    onBlur={e => updateRConfig('minAge', e.target.value ? parseInt(e.target.value, 10) : 0, true)}
                    placeholder={t('clan_recruitment_min_age_ph') || 'Например: 18 (0 — без ограничений)'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('clan_recruitment_min_hours') || 'Минимальное количество часов в игре'}</span>
                    <HelpTooltip text={t('clan_recruitment_min_hours_hint', 'Проверяется строго по анкете. В карточке суммируются реальные часы всех указанных Steam аккаунтов.')} />
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    step="100"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                    value={rConfig.minHours || ''}
                    onChange={e => updateRConfig('minHours', e.target.value ? parseInt(e.target.value, 10) : 0, false)}
                    onBlur={e => updateRConfig('minHours', e.target.value ? parseInt(e.target.value, 10) : 0, true)}
                    placeholder={t('clan_recruitment_min_hours_ph') || 'Например: 2000 (0 — без ограничений)'}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none flex items-center">
                    <span>{t('clan_recruitment_reject_banned') || 'Автоматически отклонять игроков с VAC/Game блокировками'}</span>
                    <HelpTooltip text="Бот сверяет Steam ID кандидата с базой Valve и отклоняет анкеты с активными банами." />
                  </span>
                  <ToggleSwitch
                    checked={rConfig.rejectBanned ?? true}
                    onChange={val => updateRConfig('rejectBanned', val, true)}
                    activeColor="orange"
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none flex items-center">
                    <span>{t('clan_recruitment_strict_steam') || 'Строгая проверка Steam'}</span>
                    <HelpTooltip text="Профиль Steam кандидата должен быть открыт в настройках приватности для сверки реальных игровых часов." />
                  </span>
                  <ToggleSwitch
                    checked={Boolean(rConfig.strictSteamCheck)}
                    onChange={val => updateRConfig('strictSteamCheck', val, true)}
                    activeColor="orange"
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none flex items-center">
                    <span>{t('clan_recruitment_silent_reject') || 'Экономить лимит каналов'}</span>
                    <HelpTooltip text="Мгновенный отказ кандидату во всплывающем окне Discord без создания отдельного текстового тикет-канала (Discord ограничивает сервер 500 каналами)." />
                  </span>
                  <ToggleSwitch
                    checked={rConfig.silentAutoReject !== false}
                    onChange={val => updateRConfig('silentAutoReject', val, true)}
                    activeColor="orange"
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span>{t('clan_recruitment_reject_msg') || 'Сообщение кандидату при автоматическом отклонении'}</span>
                  <HelpTooltip text="Текст, который кандидат увидит в личном уведомлении при несоответствии минимальным требованиям клана." />
                </label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-xs min-h-[60px]"
                  value={rConfig.autoRejectMessage ?? defaultRejectMsg}
                  onChange={e => updateRConfig('autoRejectMessage', e.target.value, false)}
                  onBlur={e => updateRConfig('autoRejectMessage', e.target.value, true)}
                  placeholder={defaultRejectMsg}
                ></textarea>
              </div>

              {/* Выбор каналов для отправки отклоненных заявок */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('clan_recruitment_channels_title') || 'Куда отсылать отклоненные заявки'}</span>
                  </h5>
                  <HelpTooltip text="Каналы Discord, в которые бот отправляет информационные карточки отсеянных и отклоненных анкет." />
                </div>

                <div className={isCompanionWindowVisible ? "grid grid-cols-1 2xl:grid-cols-2 gap-3 pt-1" : "grid grid-cols-1 md:grid-cols-2 gap-3 pt-1"}>
                  <div>
                    <ChannelSelect
                      label={t('clan_recruitment_channel_auto') || 'Отклоненные ботом заявки'}
                      description={t('clan_auto_113', 'Канал для карточек авто-отказа (нехватка часов, возраст, VAC-баны)')}
                      value={cConfig.autoRejectedApplications || ''}
                      onChange={val => updateChannelConfig('autoRejectedApplications', val)}
                      discordChannels={discordInfo?.channels || []}
                      typeFilter={[0, 2]}
                      isLoading={!discordInfo}
                    />
                  </div>
                  <div>
                    <ChannelSelect
                      label={t('clan_recruitment_channel_admin') || 'Отклоненные админами заявки'}
                      description={t('clan_auto_114', 'Канал для карточек заявок, отклоненных рекрутерами вручную')}
                      value={cConfig.rejectedApplications || ''}
                      onChange={val => updateChannelConfig('rejectedApplications', val)}
                      discordChannels={discordInfo?.channels || []}
                      typeFilter={[0, 2]}
                      isLoading={!discordInfo}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Steam Приписки (Tag Verification) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-4 flex-wrap">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"/></svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>{t('clan_steam_prefix_title', 'Steam Приписки')}</span>
                  {!rConfig.steamPrefixCheck && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      Отключено
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('clan_steam_prefix_desc', 'Проверка наличия кланового тега в Steam нике участников')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUserSteamPrefixExpanded(!isSteamPrefixExpanded)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{isSteamPrefixExpanded ? 'Скрыть параметры' : 'Параметры проверки'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSteamPrefixExpanded ? 'rotate-180' : ''}`} />
              </button>

              <ToggleSwitch
                checked={Boolean(rConfig.steamPrefixCheck)}
                onChange={(val) => updateRConfig('steamPrefixCheck', val, true)}
                activeColor="blue"
              />
            </div>
          </div>
          
          {isSteamPrefixExpanded && (
            <div className="space-y-5 pt-2 animate-in fade-in duration-200">
              {!rConfig.steamPrefixCheck && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>Проверка приписок выключена. Настройки сохранены и активируются при включении тумблера.</span>
                </div>
              )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <span>{t('clan_steam_prefix_label', 'Требуемая приписка')}</span>
                  <HelpTooltip text="Клановый тег, который бот проверяет в никах Steam участников (например: [CLAN])." />
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={t('clan_recruitment_steam_prefix_placeholder', 'Например: [CLAN]')}
                  value={rConfig.steamPrefix || ''}
                  onChange={e => updateRConfig('steamPrefix', e.target.value, false)}
                  onBlur={e => updateRConfig('steamPrefix', e.target.value, true)}
                />
              </div>
              <div>
                <ChannelSelect
                  label={t('clan_steam_prefix_log_label', 'Канал для логов снятия')}
                  description={t('clan_steam_prefix_log_desc', 'Куда отправлять оповещения при смене ника')}
                  discordChannels={discordInfo?.channels || []}
                  value={rConfig.steamPrefixLogChannel || ''}
                  onChange={(val) => updateRConfig('steamPrefixLogChannel', val)}
                  typeFilter={[0, 2]}
                  isLoading={!discordInfo}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('clan_steam_prefix_missing_title', 'Участники без приписки')}
                  {missingPrefixes.length > 0 && ` (${missingPrefixes.length})`}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={checkingPrefix}
                    onClick={async () => {
                      setCheckingPrefix(true);
                      try {
                        const res = await sendProxyAction('get_missing_steam_prefix');
                        if (res && res.success) {
                          setMissingPrefixes(res.missing || []);
                        }
                      } finally {
                        setCheckingPrefix(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingPrefix ? 'animate-spin' : ''}`} />
                    <span>{t('clan_auto_81', 'Обновить')}</span>
                  </button>
                  <button
                    type="button"
                    disabled={missingPrefixes.length === 0}
                    onClick={async () => {
                      const res = await sendProxyAction('remind_steam_prefix', { userIds: missingPrefixes?.map(m => m.userId) || [] });
                      if (res && res.success) addLog(`Отправлено ${res.sentCount} напоминаний в ЛС!`);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('clan_steam_prefix_remind_all', 'Напомнить всем')}
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase select-none sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Discord</th>
                      <th className="px-4 py-2.5">Steam</th>
                      <th className="px-4 py-2.5 text-right">{t('clan_auto_88', 'Действие')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                    {(missingPrefixes || []).length > 0 ? (
                      missingPrefixes.map(m => (
                        <tr key={m.userId} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{m.username}</td>
                          <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                            <a href={m.steamUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              {m.steamName}
                            </a>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await sendProxyAction('remind_steam_prefix', { userId: m.userId });
                                if (res && res.success) addLog(`Напоминание отправлено ${m.username} в ЛС!`);
                              }}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              {t('clan_steam_prefix_remind_btn', 'Напомнить')}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-slate-400 italic">
                          {t('clan_steam_prefix_empty', 'Нажмите "Обновить" для проверки ников участников')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </form>
  );
}
