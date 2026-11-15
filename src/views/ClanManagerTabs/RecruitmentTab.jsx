import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  RefreshCw, Sliders, Hash, UserPlus,
  UserCheck, Check, AlertTriangle, ScrollText, Bot, Clock,
  ExternalLink, Eye, EyeOff, X, ArrowRight,
  Upload, Loader2, CheckCircle2, HardDrive, Trash2
} from 'lucide-react';
import ChannelSelect from '../../components/ChannelSelect';
import { ToggleSwitch } from '../ClanManager';
import { normalizeImageUrl } from '../../utils/urlHelper';
import { uploadBanner, deleteBanner } from '../../services/uploadService';

export default function RecruitmentTab() {
  const {
    config, discordInfo, rosterData, applicationsData,
    handleCreateRecruitmentInvite, creatingRecruitmentInvite,
    recruitmentInviteStatus, setRecruitmentInviteStatus,
    checkingRecruitmentInvite, verifyRecruitmentInvite,
    isFullScreenWindow, isCompanionWindowVisible, showDiscordLivePreview, setShowDiscordLivePreview,
    queueAutoSave, saveConfig, sendProxyAction, addLog,
    openExternalUrl, setActiveTab, t,
    currentActiveGuildId, guildId
  } = useContext(ClanManagerContext);

  const gridTwoCols = isCompanionWindowVisible
    ? "grid grid-cols-1 2xl:grid-cols-2 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  const effectiveGuildId = currentActiveGuildId || guildId || config?.guildId;
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadBannerError, setUploadBannerError] = useState('');
  const bannerFileInputRef = useRef(null);

  const [checkingPrefix, setCheckingPrefix] = useState(false);
  const [missingPrefixes, setMissingPrefixes] = useState([]);

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
      steamPrefixLogChannel: ''
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
      if (!rc.title || rc.title === t('clan_rec_gods', 'Набор в клан GODS') || rc.title === t('clan_rec_base', 'Набор в клан')) {
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

  const updateRConfig = useCallback((key, val, immediate = false) => {
    const newConfig = { ...rConfig, [key]: val };
    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, immediate);
  }, [rConfig, config, queueAutoSave]);

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

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
          {t('clan_auto_41', 'Настройки набора в клан')}
        </h3>
        <button
          type="button"
          onClick={() => setShowDiscordLivePreview(prev => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
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
        {/* 1. Основные параметры панели набора */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-500" />
            {t('clan_auto_42', 'Панель набора в Discord')}
          </h4>
          
          <div className={gridTwoCols}>
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
                        ? t('clan_banner_uploading', 'Загрузка...')
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
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('clan_ads_banner_active', 'Установлен кастомный баннер')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
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
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_49', 'Текст с требованиями (Markdown поддерживается) *')}</label>
            <textarea 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-xs min-h-[140px]"
              value={rConfig.text}
              onChange={e => updateRConfig('text', e.target.value, false)}
              onBlur={e => updateRConfig('text', e.target.value, true)}
              placeholder={t('clan_auto_110', 'Опишите требования...')}
            ></textarea>
          </div>
        </div>

        {/* 2. Автоматическое отклонение заявок (Auto-Reject) */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t('clan_recruitment_auto_reject_title') || 'Автоматическое отклонение заявок'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('clan_recruitment_auto_reject_desc') || 'Бот автоматически проверяет анкеты кандидатов при подаче и отклоняет неподходящие заявки.'}
                </p>
              </div>
            </div>
            
            <ToggleSwitch 
              checked={Boolean(rConfig.autoRejectEnabled)}
              onChange={val => updateRConfig('autoRejectEnabled', val, true)}
              activeColor="orange"
            />
          </div>

          <div className={`space-y-4 pt-2 transition-opacity ${rConfig.autoRejectEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className={gridTwoCols}>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  {t('clan_recruitment_min_age') || 'Минимальный возраст кандидата'}
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
                <p className="text-[11px] text-slate-400 mt-1">{t('clan_auto_50', 'Кандидаты младше этого возраста будут отклонены.')}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  {t('clan_recruitment_min_hours') || 'Минимальное количество часов в игре'}
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
                <p className="text-[11px] text-slate-400 mt-1">{t('clan_recruitment_min_hours_hint') || 'Проверяется строго по анкете. В карточке суммируются реальные часы всех указанных Steam аккаунтов.'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                  {t('clan_recruitment_reject_banned') || 'Автоматически отклонять игроков с VAC/Game блокировками'}
                </span>
                <ToggleSwitch
                  checked={rConfig.rejectBanned ?? true}
                  onChange={val => updateRConfig('rejectBanned', val, true)}
                  activeColor="orange"
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                  {t('clan_recruitment_strict_steam') || 'Строгая проверка Steam (профиль должен быть открыт для сверки часов)'}
                </span>
                <ToggleSwitch
                  checked={Boolean(rConfig.strictSteamCheck)}
                  onChange={val => updateRConfig('strictSteamCheck', val, true)}
                  activeColor="orange"
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                  {t('clan_recruitment_silent_reject') || 'Экономить лимит каналов (мгновенный отказ кандидату без создания тикета)'}
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('clan_recruitment_reject_msg') || 'Сообщение кандидату при автоматическом отклонении'}
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
              <div>
                <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-orange-500" />
                  {t('clan_recruitment_channels_title') || 'Куда отсылать отклоненные заявки'}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('clan_recruitment_channels_desc') || 'Выберите каналы Discord, в которые бот будет отправлять карточки отклоненных анкет.'}
                </p>
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
        </div>

        {/* 3. Журнал заявок вынесен в отдельный раздел */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {t('clan_tab_applications', 'Заявки в клан')}
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                  {Array.isArray(applicationsData) ? applicationsData.length : 0}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('clan_recruitment_apps_moved_desc', 'Журнал и история поступивших анкет теперь вынесены в отдельный раздел «Заявки в клан».')}
              </p>
            </div>
          </div>
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{t('clan_open_applications_btn', 'Открыть журнал заявок')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4. Steam Приписки (Tag Verification) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"/></svg>
                <span>{t('clan_steam_prefix_title', 'Steam Приписки')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('clan_steam_prefix_desc', 'Проверка наличия кланового тега в Steam нике участников')}
              </p>
            </div>
            <ToggleSwitch
              checked={Boolean(rConfig.steamPrefixCheck)}
              onChange={(val) => updateRConfig('steamPrefixCheck', val, true)}
              activeColor="blue"
            />
          </div>
          
          <div className={`space-y-5 transition-opacity ${!rConfig.steamPrefixCheck ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('clan_steam_prefix_label', 'Требуемая приписка')}
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={t('clan_recruitment_steam_prefix_placeholder', 'Например: [GODS]')}
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
        </div>
      </div>
    </form>
  );
}
