import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  RefreshCw, Sliders, Hash, UserPlus,
  UserCheck, Check, AlertTriangle, AlertCircle, ScrollText, Bot, Clock,
  ExternalLink, Eye, EyeOff, X, ArrowRight, ArrowLeft,
  Upload, Loader2, CheckCircle2, HardDrive, Trash2,
  Sparkles, Image as ImageIcon, Info, ChevronDown, Palette,
  ArrowUp, ArrowDown, Plus, RotateCcw, Folder, Layers, Smile
} from 'lucide-react';
import ChannelSelect from '../../components/ChannelSelect';
import EmojiSuggestModal from '../../components/EmojiSuggestModal';
import EmojiPickerModal from '../../components/EmojiPickerModal';
import { POPULAR_WHITE_EMOJIS, setLeadingEmoji, renderTextWithDiscordEmojis } from '../../utils/discordEmojis';
import { ToggleSwitch } from '../ClanManager';
import { normalizeImageUrl } from '../../utils/urlHelper';
import { uploadBanner, deleteBanner } from '../../services/uploadService';
import DiscordPanelChannelBar from '../../components/DiscordPanelChannelBar';
import { proofreadRecruitmentText, getPresetBanners } from '../../services/aiService';
import {
  validateEmbedTitle,
  validateEmbedDescription,
  validateBannerImageUrl,
  validateDiscordInviteUrl,
  validateDiscordUserId,
  validateEmbedFooter,
  validateButtonLabel,
  validateAutoRejectMessage,
  validateModalTitle,
  validateModalFieldLabel,
  cleanDiscordText,
  DISCORD_LIMITS
} from '../../utils/discordValidation';

export function HelpTooltip({ text, className = '' }) {
  if (!text) return null;
  return (
    <span className={`group relative inline-flex items-center align-middle ml-1.5 ${className}`}>
      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-600 dark:hover:text-orange-400 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-default transition-colors select-none">
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
    queueAutoSave, saveConfig, sendProxyAction, addLog, latestConfigRef,
    openExternalUrl, setActiveTab, t,
    currentActiveGuildId, guildId,
    aiPreviewOverride, setAiPreviewOverride,
    recruitmentSubTab, setRecruitmentSubTab
  } = useContext(ClanManagerContext);

  const [localSubTab, setLocalSubTab] = useState('message');
  const activeSubTab = recruitmentSubTab || localSubTab;
  const setActiveSubTab = setRecruitmentSubTab || setLocalSubTab;

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

    if (rc.autoRejectMessage === undefined) {
      rc.autoRejectMessage = defaultRejectMsg;
    }

    if (config?.name) {
      if (rc.title === undefined || rc.title === t('clan_rec_base', 'Набор в клан') || rc.title.includes('GODS')) {
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

  // --- Collapsible Sections (Default collapsed on entry to minimize clutter) ---
  const [userAutoRejectExpanded, setUserAutoRejectExpanded] = useState(false);
  const isAutoRejectExpanded = Boolean(userAutoRejectExpanded);

  const [userSteamPrefixExpanded, setUserSteamPrefixExpanded] = useState(false);
  const isSteamPrefixExpanded = Boolean(userSteamPrefixExpanded);

  const [userMetaExpanded, setUserMetaExpanded] = useState(false);
  const isMetaExpanded = Boolean(userMetaExpanded);

  // When switching sub-tabs or re-entering the page, collapse parameter accordions
  useEffect(() => {
    setUserAutoRejectExpanded(false);
    setUserSteamPrefixExpanded(false);
    setUserMetaExpanded(false);
  }, [activeSubTab]);

  const isMetaActive = rConfig.includeMetadataLines !== false;

  // --- Discord Validations ---
  const titleValidation = useMemo(() => validateEmbedTitle(rConfig.title), [rConfig.title]);
  const descValidation = useMemo(
    () => validateEmbedDescription(rConfig.text, isMetaActive, 80),
    [rConfig.text, isMetaActive]
  );
  const bannerValidation = useMemo(() => validateBannerImageUrl(rConfig.banner), [rConfig.banner]);
  const inviteValidation = useMemo(
    () => validateDiscordInviteUrl(rConfig.link ?? (config?.discordLink ?? '')),
    [rConfig.link, config?.discordLink]
  );
  const leaderIdValidation = useMemo(
    () => validateDiscordUserId(rConfig.customLeaderId),
    [rConfig.customLeaderId]
  );
  const footerValidation = useMemo(() => validateEmbedFooter(rConfig.footerText), [rConfig.footerText]);
  const buttonValidation = useMemo(() => validateButtonLabel(rConfig.buttonText), [rConfig.buttonText]);
  const closedButtonValidation = useMemo(() => validateButtonLabel(rConfig.closedButtonText), [rConfig.closedButtonText]);
  const autoRejectMsgValidation = useMemo(
    () => validateAutoRejectMessage(rConfig.autoRejectMessage),
    [rConfig.autoRejectMessage]
  );

  // --- Modal Form Configuration State & Hooks ---
  const [isFormBuilderExpanded, setIsFormBuilderExpanded] = useState(true);
  const [isEmojiSuggestOpen, setIsEmojiSuggestOpen] = useState(false);
  const [emojiPickerTarget, setEmojiPickerTarget] = useState(null);
  const [activeVarPickerIdx, setActiveVarPickerIdx] = useState(null);

  const ROLE_PRESETS = useMemo(() => ({
    name: { label: 'Ваше имя / Никнейм', placeholder: 'Иван / Alex_Rust', style: 'short' },
    age: { label: 'Ваш возраст', placeholder: '18', style: 'short' },
    hours: { label: 'Часы в игре', placeholder: '3500ч', style: 'short' },
    steam: { label: 'Ссылка на Steam / Battlemetrics', placeholder: 'https://steamcommunity.com/id/...', style: 'short' },
    clan_history: { label: 'Предыдущие кланы / История', placeholder: 'Играл в кланах ..., причины ухода...', style: 'paragraph' },
    skills: { label: 'Роль в команде / Навыки', placeholder: 'ПВП, фармер, билдер, электрик...', style: 'short' },
    device: { label: 'Характеристики ПК / FPS в игре', placeholder: 'i7 13700k, RTX 4070, 140 fps', style: 'short' },
    activity: { label: 'Прайм-тайм / Онлайн в день', placeholder: '18:00 - 02:00 МСК (6+ часов)', style: 'short' },
    timezone: { label: 'Город / Часовой пояс', placeholder: 'Москва (МСК +0)', style: 'short' },
    experience: { label: 'О себе / Дополнительно', placeholder: 'Расскажите немного о себе...', style: 'paragraph' },
    custom: { label: 'Вопрос кандидату', placeholder: 'Ваш ответ...', style: 'short' }
  }), []);

  const defaultFormFields = useMemo(() => [
    { id: 'f_name', role: 'name', label: 'Ваше имя', placeholder: 'Иван', required: true, style: 'short' },
    { id: 'f_age', role: 'age', label: 'Ваш возраст', placeholder: '18', required: true, style: 'short' },
    { id: 'f_hours', role: 'hours', label: 'Часы в Rust (со всех аккаунтов)', placeholder: '3500ч', required: true, style: 'short' },
    { id: 'f_steam', role: 'steam', label: 'Ссылка на Steam (на котором играете)', placeholder: 'https://steamcommunity.com/id/...', required: true, style: 'short' },
    { id: 'f_exp', role: 'experience', label: 'Опыт игры / предыдущие кланы', placeholder: 'Играл в кланах ..., позиция фармер/пвп', required: false, style: 'paragraph' }
  ], []);

  const formConfig = useMemo(() => {
    return {
      title: rConfig.formConfig?.title !== undefined ? rConfig.formConfig.title : 'Подача заявки в клан',
      fields: (Array.isArray(rConfig.formConfig?.fields) && rConfig.formConfig.fields.length > 0)
        ? rConfig.formConfig.fields
        : defaultFormFields
    };
  }, [rConfig.formConfig, defaultFormFields]);

  const defaultTicketCardFields = useMemo(() => [
    { id: 'tcf_1', name: '<:usercircle:1571506569705824367> Имя', value: '{Имя}', inline: true },
    { id: 'tcf_2', name: '<:hourglassempty:1571506480337915914> Возраст', value: '{Возраст} лет', inline: true },
    { id: 'tcf_3', name: '<:devicedesktop:1571506456048566354> Игровые часы', value: '{Часы}', inline: true },
    { id: 'tcf_4', name: '<:link:1571506483718258850> Steam профиль', value: '{Steam}', inline: false },
    { id: 'tcf_5', name: '<:filedescription:1571506468723761233> Информация о кандидате', value: '{Опыт}', inline: false }
  ], []);

  const ticketCardConfig = useMemo(() => {
    if (Array.isArray(rConfig.ticketCardConfig?.fields) && rConfig.ticketCardConfig.fields.length > 0) {
      // Auto-migrate legacy default icons to our custom white application emojis
      const migratedFields = rConfig.ticketCardConfig.fields.map(f => {
        let name = f.name;
        if (name === '<:calendarweek:1571506435991543818> Возраст') {
          name = '<:hourglassempty:1571506480337915914> Возраст';
        } else if (name === '<:clock:1571506445999017984> Игровые часы') {
          name = '<:devicedesktop:1571506456048566354> Игровые часы';
        } else if (name === '<:listdetails:1571506487929606224> Информация о кандидате') {
          name = '<:filedescription:1571506468723761233> Информация о кандидате';
        }
        return name !== f.name ? { ...f, name } : f;
      });
      return { fields: migratedFields };
    }
    return {
      fields: defaultTicketCardFields
    };
  }, [rConfig.ticketCardConfig, defaultTicketCardFields]);

  const availableVariables = useMemo(() => {
    const list = [
      { tag: '{Имя}', label: 'Имя / Ник' },
      { tag: '{Возраст}', label: 'Возраст' },
      { tag: '{Часы}', label: 'Часы Rust' },
      { tag: '{Steam}', label: 'Steam ссылка' },
      { tag: '{Кланы}', label: 'История кланов' },
      { tag: '{Навыки}', label: 'Навыки / Роль' },
      { tag: '{ПК}', label: 'Характеристики ПК' },
      { tag: '{Онлайн}', label: 'Прайм-тайм / Онлайн' },
      { tag: '{Город}', label: 'Город / Пояс' },
      { tag: '{Опыт}', label: 'О себе / Опыт' }
    ];
    (formConfig.fields || []).forEach(f => {
      if (f.label && !list.some(item => item.tag.toLowerCase() === `{${f.label.toLowerCase()}}`)) {
        list.push({ tag: `{${f.label}}`, label: f.label });
      }
    });
    return list;
  }, [formConfig.fields]);

  const modalTitleValidation = useMemo(
    () => validateModalTitle(formConfig.title),
    [formConfig.title]
  );

  const categoryChannels = useMemo(() => {
    if (!discordInfo?.channels) return [];
    return discordInfo.channels.filter(c => c.type === 4);
  }, [discordInfo?.channels]);

  const updateRConfig = useCallback((key, val, immediate = false) => {
    let cleaned = val;
    if (typeof val === 'string' && (key === 'title' || key === 'text' || key === 'footerText' || key === 'buttonText' || key === 'closedButtonText' || key === 'autoRejectMessage')) {
      cleaned = cleanDiscordText(val);
    }
    const baseConfig = (latestConfigRef && latestConfigRef.current) ? latestConfigRef.current : config;
    let baseRConfig = rConfig;
    try {
      if (baseConfig?.recruitmentConfigJson) {
        baseRConfig = typeof baseConfig.recruitmentConfigJson === 'string'
          ? JSON.parse(baseConfig.recruitmentConfigJson)
          : baseConfig.recruitmentConfigJson;
      }
    } catch (e) {
      baseRConfig = rConfig;
    }
    const newConfig = { ...baseRConfig, [key]: cleaned };
    const updated = { ...baseConfig, recruitmentConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, immediate);
  }, [rConfig, config, queueAutoSave, latestConfigRef]);

  const updateFormField = useCallback((idx, key, val, immediate = false) => {
    const currentFields = [...formConfig.fields];
    if (!currentFields[idx]) return;
    let cleaned = val;
    if (key === 'label') cleaned = String(val).slice(0, 100);
    if (key === 'placeholder') cleaned = String(val).slice(0, 200);
    currentFields[idx] = { ...currentFields[idx], [key]: cleaned };
    updateRConfig('formConfig', { ...formConfig, fields: currentFields }, immediate);
  }, [formConfig, updateRConfig]);

  const handleRoleChange = useCallback((idx, newRole) => {
    const currentFields = [...formConfig.fields];
    const current = currentFields[idx];
    if (!current) return;
    const preset = ROLE_PRESETS[newRole];
    
    // Auto-fill label and placeholder if they are empty or match any default preset label
    const isPresetLabel = !current.label || Object.values(ROLE_PRESETS).some(p => p.label === current.label);
    const updated = {
      ...current,
      role: newRole,
      label: isPresetLabel && preset ? preset.label : current.label,
      placeholder: isPresetLabel && preset ? preset.placeholder : current.placeholder,
      style: isPresetLabel && preset ? preset.style : current.style
    };
    currentFields[idx] = updated;
    updateRConfig('formConfig', { ...formConfig, fields: currentFields }, true);
  }, [formConfig, updateRConfig, ROLE_PRESETS]);

  const moveFormField = useCallback((idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= formConfig.fields.length) return;
    const currentFields = [...formConfig.fields];
    const item = currentFields.splice(idx, 1)[0];
    currentFields.splice(newIdx, 0, item);
    updateRConfig('formConfig', { ...formConfig, fields: currentFields }, true);
  }, [formConfig, updateRConfig]);

  const removeFormField = useCallback((idx) => {
    if (formConfig.fields.length <= 1) return;
    const currentFields = formConfig.fields.filter((_, i) => i !== idx);
    updateRConfig('formConfig', { ...formConfig, fields: currentFields }, true);
  }, [formConfig, updateRConfig]);

  const addFormField = useCallback(() => {
    if (formConfig.fields.length >= 5) return;
    const newField = {
      id: `f_${Date.now()}`,
      role: 'custom',
      label: `Вопрос ${formConfig.fields.length + 1}`,
      placeholder: 'Ваш ответ...',
      required: false,
      style: 'short'
    };
    updateRConfig('formConfig', { ...formConfig, fields: [...formConfig.fields, newField] }, true);
  }, [formConfig, updateRConfig]);

  const resetFormFields = useCallback(() => {
    updateRConfig('formConfig', {
      title: 'Подача заявки в клан',
      fields: defaultFormFields
    }, true);
  }, [defaultFormFields, updateRConfig]);

  const updateTicketCardField = useCallback((idx, key, val, immediate = false) => {
    const currentFields = [...ticketCardConfig.fields];
    if (!currentFields[idx]) return;
    let cleaned = val;
    if (key === 'name') cleaned = String(val).slice(0, 256);
    if (key === 'value') cleaned = String(val).slice(0, 1024);
    currentFields[idx] = { ...currentFields[idx], [key]: cleaned };
    updateRConfig('ticketCardConfig', { ...ticketCardConfig, fields: currentFields }, immediate);
  }, [ticketCardConfig, updateRConfig]);

  const addTicketCardField = useCallback(() => {
    if (ticketCardConfig.fields.length >= 10) return;
    const newField = {
      id: `tcf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: 'Новое поле',
      value: '{Имя}',
      inline: false
    };
    updateRConfig('ticketCardConfig', { ...ticketCardConfig, fields: [...ticketCardConfig.fields, newField] }, true);
  }, [ticketCardConfig, updateRConfig]);

  const removeTicketCardField = useCallback((idx) => {
    if (ticketCardConfig.fields.length <= 1) return;
    const newFields = ticketCardConfig.fields.filter((_, i) => i !== idx);
    updateRConfig('ticketCardConfig', { ...ticketCardConfig, fields: newFields }, true);
  }, [ticketCardConfig, updateRConfig]);

  const moveTicketCardField = useCallback((idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= ticketCardConfig.fields.length) return;
    const newFields = [...ticketCardConfig.fields];
    const item = newFields.splice(idx, 1)[0];
    newFields.splice(newIdx, 0, item);
    updateRConfig('ticketCardConfig', { ...ticketCardConfig, fields: newFields }, true);
  }, [ticketCardConfig, updateRConfig]);

  const resetTicketCardConfig = useCallback(() => {
    updateRConfig('ticketCardConfig', { fields: defaultTicketCardFields }, true);
  }, [defaultTicketCardFields, updateRConfig]);

  const handleSelectTicketCardEmoji = useCallback((emojiTag) => {
    if (!emojiPickerTarget) return;
    const { idx, fieldKey } = emojiPickerTarget;
    const currentFields = [...ticketCardConfig.fields];
    const field = currentFields[idx];
    if (!field) return;

    if (fieldKey === 'name') {
      const updatedName = setLeadingEmoji(field.name || '', emojiTag);
      updateTicketCardField(idx, 'name', updatedName, true);
    } else if (fieldKey === 'value') {
      const curVal = field.value || '';
      const separator = (curVal.length > 0 && !curVal.endsWith(' ')) ? ' ' : '';
      updateTicketCardField(idx, 'value', `${curVal}${separator}${emojiTag}`, true);
    }
    setEmojiPickerTarget(null);
  }, [emojiPickerTarget, ticketCardConfig.fields, updateTicketCardField]);

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
    const baseConfig = (latestConfigRef && latestConfigRef.current) ? latestConfigRef.current : config;
    let baseCConfig = cConfig;
    try {
      if (baseConfig?.channelsConfigJson) {
        baseCConfig = typeof baseConfig.channelsConfigJson === 'string'
          ? JSON.parse(baseConfig.channelsConfigJson)
          : baseConfig.channelsConfigJson;
      }
    } catch (e) {
      baseCConfig = cConfig;
    }
    const newCConfig = { ...baseCConfig, [key]: val };
    const updated = { ...baseConfig, channelsConfigJson: JSON.stringify(newCConfig) };
    queueAutoSave(updated, true);
  }, [cConfig, config, queueAutoSave, latestConfigRef]);

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
      {/* 3 Sub-tabs Navigation: Панель набора / Форма заявки / Отправленный тикет */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-850/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('message')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-colors duration-150 cursor-pointer ${
            activeSubTab === 'message'
              ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>{t('clan_rec_sub_message', 'Панель набора')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('form')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-colors duration-150 cursor-pointer ${
            activeSubTab === 'form'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>{t('clan_rec_sub_form', 'Форма заявки')}</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            {formConfig.fields.length}/5
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ticket')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-colors duration-150 cursor-pointer ${
            activeSubTab === 'ticket'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200/80 dark:border-slate-700'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span>{t('clan_rec_sub_ticket', 'Отправленный тикет')}</span>
        </button>
      </div>

      {/* ПОДРАЗДЕЛ 1: Панель набора в Discord */}
      {activeSubTab === 'message' && (
        <div className="space-y-6">
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

          {/* Быстрый переход: Журнал и статус заявок в клан (только если есть активные заявки) */}
          {pendingAppsCount > 0 && (
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
                      {pendingAppsCount === 1 ? '1 активная заявка' : `${pendingAppsCount} активных заявок`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Ожидают решения
                    </span>
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
          )}

        {/* 1. Основные параметры панели набора */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-500" />
            {t('clan_auto_42', 'Панель набора в Discord')}
          </h4>

          {/* 1.1 Заголовок Embed-сообщения */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('clan_auto_48', 'Заголовок Embed-сообщения *')}
              </label>
              <span className={`text-[11px] font-mono ${titleValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                {titleValidation.length} / {DISCORD_LIMITS.TITLE_MAX}
              </span>
            </div>
            <input 
              type="text" 
              required
              maxLength={DISCORD_LIMITS.TITLE_MAX + 50}
              className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-sm ${
                !titleValidation.isValid
                  ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
              }`}
              value={rConfig.title}
              onChange={e => updateRConfig('title', e.target.value, false)}
              onBlur={e => updateRConfig('title', e.target.value, true)}
              placeholder={config?.name ? `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}` : t('clan_recruit_default_title', "Набор в клан")}
            />
            {!titleValidation.isValid && (
              <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{titleValidation.error}</span>
              </p>
            )}
          </div>

          {/* 1.2 Содержимое сообщения (Текст с требованиями) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('clan_auto_49', 'Текст с требованиями *')}
              </label>
              <div className="flex items-center gap-3">
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

                {/* Лимит символов на правом краю */}
                <span className={`text-xs font-mono font-medium ${descValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                  {descValidation.totalLength} / {DISCORD_LIMITS.DESCRIPTION_MAX}
                </span>
              </div>
            </div>

            <textarea 
              required
              className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-xs min-h-[140px] ${
                !descValidation.isValid
                  ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
              }`}
              value={rConfig.text}
              onChange={e => updateRConfig('text', e.target.value, false)}
              onBlur={e => updateRConfig('text', e.target.value, true)}
              placeholder={t('clan_auto_110', 'Опишите требования...')}
            ></textarea>

            {!descValidation.isValid && (
              <div className="mt-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{descValidation.error}</span>
              </div>
            )}

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

          {/* 1.3 Контакты лидеров и ссылка на этот сервер */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t('clan_recruitment_include_meta', 'Добавлять в конец описания контакты лидеров и ссылку')}</span>
                    {!isMetaActive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                        Отключено
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('clan_recruitment_include_meta_hint', 'Если выключено, в Embed будет отображаться только ваш собственный текст выше.')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUserMetaExpanded(!isMetaExpanded)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <span>{isMetaExpanded ? 'Скрыть параметры' : 'Параметры контактов'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMetaExpanded ? 'rotate-180' : ''}`} />
                </button>

                <ToggleSwitch
                  checked={isMetaActive}
                  onChange={val => {
                    updateRConfig('includeMetadataLines', val, true);
                    if (val && !isMetaExpanded) {
                      setUserMetaExpanded(true);
                    }
                  }}
                  activeColor="orange"
                />
              </div>
            </div>

            {isMetaExpanded && (
              <div className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 animate-in fade-in duration-200">
                {!isMetaActive && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Добавление контактов и ссылки отключено. В сообщении Discord будет отображаться только ваш собственный текст выше.</span>
                  </div>
                )}

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
                      className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-sm ${
                        recruitmentInviteStatus === 'invalid'
                          ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/40'
                          : recruitmentInviteStatus === 'valid'
                          ? 'border-emerald-400 dark:border-emerald-500/60 focus:ring-emerald-500/40'
                          : !inviteValidation.isValid && isMetaActive
                          ? 'border-amber-400 dark:border-amber-500/60 focus:ring-amber-500/40'
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
                  {!inviteValidation.isValid && isMetaActive && !recruitmentInviteStatus && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{inviteValidation.error}</span>
                    </div>
                  )}
                </div>

                {/* Лидер клана в embed */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
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
                      className={`flex-1 px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50 font-mono ${
                        !leaderIdValidation.isValid
                          ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
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
                  {!leaderIdValidation.isValid && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{leaderIdValidation.error}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 1.4 Ссылка на баннер (Изображение) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-sm ${
                bannerValidation.error
                  ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                  : bannerValidation.warning
                  ? 'border-amber-400 dark:border-amber-500/60 focus:ring-amber-500/40'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
              }`}
              value={rConfig.banner}
              onChange={e => updateRConfig('banner', e.target.value, false)}
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
                      console.warn('[RecruitmentTab] Failed to refresh discord attachment url:', err);
                    }
                  }
                }
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

            {bannerValidation.error && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{bannerValidation.error}</span>
                </div>
              </div>
            )}

            {bannerValidation.warning && !bannerValidation.error && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{bannerValidation.warning}</span>
                </div>
              </div>
            )}

            {rConfig.banner && !bannerValidation.error && (
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

            {/* 1.5 Готовые баннеры Rust с сервера */}
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

          {/* 1.6 Оформление Embed и кнопок Discord (лишь в самом низу) */}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('clan_embed_footer', 'Текст футера Embed (подвал)')}</span>
                    <HelpTooltip text="Нижняя строчка мелким шрифтом в Embed карточке." />
                  </label>
                  <span className={`text-[11px] font-mono ${footerValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                    {footerValidation.length} / {DISCORD_LIMITS.FOOTER_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={DISCORD_LIMITS.FOOTER_MAX + 10}
                  value={rConfig.footerText || ''}
                  onChange={e => updateRConfig('footerText', e.target.value, false)}
                  onBlur={e => updateRConfig('footerText', e.target.value, true)}
                  placeholder={t('clan_embed_footer_placeholder', 'Например: Присоединяйтесь к сильнейшим!')}
                  className={`w-full px-3 py-1.5 text-xs border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none ${
                    !footerValidation.isValid
                      ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/30'
                  }`}
                />
                {!footerValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{footerValidation.error}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Button text (Open) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{t('clan_button_label', 'Текст кнопки подачи заявки')}</span>
                    <HelpTooltip text="Текст на зеленой кнопке в сообщении набора Discord." />
                  </label>
                  <span className={`text-[11px] font-mono ${buttonValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                    {buttonValidation.length} / {DISCORD_LIMITS.BUTTON_LABEL_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={DISCORD_LIMITS.BUTTON_LABEL_MAX + 10}
                  value={rConfig.buttonText || ''}
                  onChange={e => updateRConfig('buttonText', e.target.value, false)}
                  onBlur={e => updateRConfig('buttonText', e.target.value, true)}
                  placeholder={t('clan_button_label_placeholder', 'Подать заявку')}
                  className={`w-full px-3 py-1.5 text-xs border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none ${
                    !buttonValidation.isValid
                      ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/30'
                  }`}
                />
                {!buttonValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{buttonValidation.error}</span>
                  </p>
                )}
              </div>

              {/* Button text (Closed) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{t('clan_button_closed_label', 'Текст кнопки при закрытом наборе')}</span>
                    <HelpTooltip text="Текст на неактивной кнопке, когда набор выключен." />
                  </label>
                  <span className={`text-[11px] font-mono ${closedButtonValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                    {closedButtonValidation.length} / {DISCORD_LIMITS.BUTTON_LABEL_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={DISCORD_LIMITS.BUTTON_LABEL_MAX + 10}
                  value={rConfig.closedButtonText || ''}
                  onChange={e => updateRConfig('closedButtonText', e.target.value, false)}
                  onBlur={e => updateRConfig('closedButtonText', e.target.value, true)}
                  placeholder={t('clan_button_closed_placeholder', 'Набор закрыт')}
                  className={`w-full px-3 py-1.5 text-xs border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none ${
                    !closedButtonValidation.isValid
                      ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/30'
                  }`}
                />
                {!closedButtonValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{closedButtonValidation.error}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation to next step */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Шаг 1 из 3:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Панель для набора</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('form')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Перейти к форме заявки</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        </div>
      )}

      {/* ПОДРАЗДЕЛ 2: Конструктор формы подачи заявки (Discord Modal) */}
      {activeSubTab === 'form' && (
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Конструктор формы заявки (Discord Modal)</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-mono">
                    {formConfig.fields.length} / 5 полей
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Настройка всплывающего окна при клике на «Подать заявку». Максимум 5 полей (лимит Discord API).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEmojiSuggestOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200/60 dark:border-orange-800/40 transition-colors cursor-pointer shadow-2xs"
                title="Предложить новый эмодзи разработчику для добавления в стандартный набор"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Предложить свой эмодзи</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFormBuilderExpanded(!isFormBuilderExpanded)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{isFormBuilderExpanded ? 'Скрыть форму' : 'Настроить форму'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFormBuilderExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isFormBuilderExpanded && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              {/* Modal Window Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Заголовок модального окна в Discord</span>
                    <HelpTooltip text="Отображается в верхней строке всплывающего окна при подаче заявки. Лимит Discord: до 45 символов." />
                  </label>
                  <span className={`text-[11px] font-mono ${modalTitleValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                    {modalTitleValidation.length} / {DISCORD_LIMITS.MODAL_TITLE_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={DISCORD_LIMITS.MODAL_TITLE_MAX + 50}
                  value={formConfig.title ?? ''}
                  onChange={(e) => {
                    const cleaned = cleanDiscordText(e.target.value);
                    updateRConfig('formConfig', { ...formConfig, title: cleaned }, false);
                  }}
                  onBlur={(e) => {
                    const cleaned = cleanDiscordText(e.target.value);
                    updateRConfig('formConfig', { ...formConfig, title: cleaned }, true);
                  }}
                  placeholder="Подача заявки в клан"
                  className={`w-full px-3.5 py-2 text-xs border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none ${
                    !modalTitleValidation.isValid
                      ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                  }`}
                />
              </div>

              {/* Form Fields List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Поля формы (до 5 пунктов)
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    Кандидат увидит их в Discord именно в этом порядке
                  </span>
                </div>

                {formConfig.fields.map((field, idx) => {
                  const labelLength = (field.label || '').length;
                  const isLabelValid = labelLength <= DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX && labelLength > 0;

                  return (
                    <div
                      key={field.id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 transition-all hover:border-indigo-400/50"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Поле #{idx + 1}
                          </span>
                          {field.required !== false ? (
                            <span className="text-[10px] text-rose-500 font-bold">*Обязательное</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Необязательное</span>
                          )}
                        </div>

                        {/* Order and Delete buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveFormField(idx, -1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            title="Переместить выше"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === formConfig.fields.length - 1}
                            onClick={() => moveFormField(idx, 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            title="Переместить ниже"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={formConfig.fields.length <= 1}
                            onClick={() => removeFormField(idx)}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-1"
                            title="Удалить поле"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Field config inputs: 1. Название (слева), 2. Назначение, 3. Тип, 4. Обязательно */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        {/* 1. Field Label (слева) */}
                        <div className="sm:col-span-5">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              Название поля в форме
                            </label>
                            <span className={`text-[10px] font-mono ${isLabelValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                              {labelLength} / {DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX}
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX + 50}
                            value={field.label || ''}
                            onChange={(e) => updateFormField(idx, 'label', e.target.value, false)}
                            onBlur={(e) => updateFormField(idx, 'label', e.target.value, true)}
                            placeholder="Название поля..."
                            className={`w-full px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 outline-none ${
                              !isLabelValid
                                ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                                : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40'
                            }`}
                          />
                        </div>

                        {/* 2. Semantic Role (компактная колонка, адаптированная под самый длинный текст) */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Назначение поля (роль)
                          </label>
                          <select
                            value={field.role || 'custom'}
                            onChange={(e) => handleRoleChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none truncate"
                          >
                            <option value="name">👤 Имя игрока / Никнейм</option>
                            <option value="age">🎂 Возраст</option>
                            <option value="hours">⏱️ Часы в игре (Rust)</option>
                            <option value="steam">🔗 Ссылка на Steam</option>
                            <option value="clan_history">🛡️ Предыдущие кланы / История</option>
                            <option value="skills">🎯 Роль / Навыки (ПВП, фарм, билдинг)</option>
                            <option value="device">🖥️ Характеристики ПК / Девайсы</option>
                            <option value="activity">🕒 Прайм-тайм / Онлайн в день</option>
                            <option value="timezone">🌍 Город / Часовой пояс</option>
                            <option value="experience">📝 О себе / Дополнительно</option>
                            <option value="custom">📌 Произвольный вопрос</option>
                          </select>
                        </div>

                        {/* 3. Type */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Тип поля
                          </label>
                          <select
                            value={field.style || 'short'}
                            onChange={(e) => updateFormField(idx, 'style', e.target.value, true)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none"
                          >
                            <option value="short">Короткий</option>
                            <option value="paragraph">Длинный</option>
                          </select>
                        </div>

                        {/* 4. Required Toggle */}
                        <div className="sm:col-span-1 pb-2 flex items-center justify-center">
                          <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300 font-medium select-none" title="Обязательно ли заполнять это поле при отправке">
                            <input
                              type="checkbox"
                              checked={field.required !== false}
                              onChange={(e) => updateFormField(idx, 'required', e.target.checked, true)}
                              className="rounded text-orange-600 focus:ring-orange-500"
                            />
                            <span>Обяз.</span>
                          </label>
                        </div>
                      </div>

                      {/* Placeholder row */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-medium text-slate-500">
                            Текст-подсказка (placeholder)
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {(field.placeholder || '').length} / {DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX}
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX + 50}
                          value={field.placeholder || ''}
                          onChange={(e) => updateFormField(idx, 'placeholder', e.target.value, false)}
                          onBlur={(e) => updateFormField(idx, 'placeholder', e.target.value, true)}
                          placeholder="Пример ответа, который увидит кандидат..."
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800/60 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Action Buttons Bar */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={formConfig.fields.length >= 5}
                  onClick={addFormField}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить поле ({formConfig.fields.length}/5)</span>
                </button>

                <button
                  type="button"
                  onClick={resetFormFields}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Восстановить стандартные 5 полей</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation between steps */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('message')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к панели набора</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('ticket')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Перейти к отправленному тикету</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        </div>
      )}

      {/* ПОДРАЗДЕЛ 3: Отправленный тикет, авто-отказ и проверка профиля */}
      {activeSubTab === 'ticket' && (
        <div className="space-y-6">
          {/* Информационный баннер о жизненном цикле тикета в Discord */}
          <div className="p-4 sm:p-5 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/30 dark:via-indigo-950/10 dark:to-transparent flex items-start gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Обработка отправленного тикета в Discord
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                После заполнения формы бот создаёт приватный текстовый канал тикета в Discord. Если кандидат не проходит минимальные требования (возраст, часы), бот публикует причину отказа и автоматически удаляет канал через 10 минут. Если анкета одобрена, рекрутеры принимают решение кнопками в тикете.
              </p>
            </div>
          </div>

          {/* Конструктор карточки заявки в созданном тикете */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Конструктор карточки заявки в тикете</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Discord Embed
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Настройте вид и структуру карточки: объединяйте поля через переменные <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{'{Имя}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{'{Возраст}'}</code>, настраивайте до 3 полей в одной строке и меняйте порядок
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetTicketCardConfig}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Восстановить стандартное расположение"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>По умолчанию</span>
                </button>
                <button
                  type="button"
                  disabled={ticketCardConfig.fields.length >= 10}
                  onClick={addTicketCardField}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить поле ({ticketCardConfig.fields.length}/10)</span>
                </button>
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3.5 pt-1">
              {ticketCardConfig.fields.map((field, idx) => {
                return (
                  <div
                    key={field.id || idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 transition-all hover:border-indigo-400/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          {renderTextWithDiscordEmojis(field.name || `Поле #${idx + 1}`)}
                        </span>
                        {field.inline ? (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">В одну строку</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">На всю ширину</span>
                        )}
                      </div>

                      {/* Reorder and Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveTicketCardField(idx, -1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          title="Переместить выше"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === ticketCardConfig.fields.length - 1}
                          onClick={() => moveTicketCardField(idx, 1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          title="Переместить ниже"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={ticketCardConfig.fields.length <= 1}
                          onClick={() => removeTicketCardField(idx)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-1"
                          title="Удалить поле"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {/* 1. Header Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Заголовок блока в тикете
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            maxLength={256}
                            value={field.name || ''}
                            onChange={(e) => updateTicketCardField(idx, 'name', e.target.value, false)}
                            onBlur={(e) => updateTicketCardField(idx, 'name', e.target.value, true)}
                            placeholder="Например: <:usercircle:1571506569705824367> Имя"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none pr-8 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setEmojiPickerTarget({ idx, fieldKey: 'name' })}
                            className="absolute right-1.5 p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded cursor-pointer transition-colors"
                            title="Открыть выбор эмодзи Discord для заголовка"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Value Template */}
                      <div className="sm:col-span-5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            Шаблон содержимого
                          </label>
                          <button
                            type="button"
                            onClick={() => setActiveVarPickerIdx(activeVarPickerIdx === idx ? null : idx)}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              activeVarPickerIdx === idx
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                                : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Показать / скрыть переменные данных"
                          >
                            <span className="font-mono text-[10px]">{'{ }'}</span>
                            <span>Переменные</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${activeVarPickerIdx === idx ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            maxLength={1024}
                            value={field.value || ''}
                            onChange={(e) => updateTicketCardField(idx, 'value', e.target.value, false)}
                            onBlur={(e) => updateTicketCardField(idx, 'value', e.target.value, true)}
                            placeholder="Например: {Имя}, {Возраст} лет"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none font-mono pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setEmojiPickerTarget({ idx, fieldKey: 'value' })}
                            className="absolute right-1.5 p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded cursor-pointer transition-colors"
                            title="Открыть выбор эмодзи Discord для шаблона"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 3. Inline Toggle */}
                      <div className="sm:col-span-2 pt-6 flex items-center justify-end">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300 font-medium select-none" title="Отображать в одну строку (Discord размещает до 3 полей в ряд)">
                          <input
                            type="checkbox"
                            checked={field.inline !== false}
                            onChange={(e) => updateTicketCardField(idx, 'inline', e.target.checked, true)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>В 1 строку</span>
                        </label>
                      </div>
                    </div>

                    {/* Expandable Variable Chips (only shown when user clicks '{ } Переменные') */}
                    {activeVarPickerIdx === idx && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 pb-1 px-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-lg border border-indigo-200/60 dark:border-indigo-900/50 animate-in fade-in duration-100">
                        <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold mr-1">Вставить переменную:</span>
                        {availableVariables.map(v => (
                          <button
                            key={v.tag}
                            type="button"
                            onClick={() => {
                              const curVal = field.value || '';
                              const separator = (curVal.length > 0 && !curVal.endsWith(' ') && !curVal.endsWith(',')) ? ' ' : '';
                              updateTicketCardField(idx, 'value', `${curVal}${separator}${v.tag}`, true);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                            title={`Вставить ${v.label}`}
                          >
                            + {v.tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Автоматическое отклонение заявок (Auto-Reject) */}
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
                  {t('clan_recruitment_auto_reject_desc', 'Бот автоматически отклоняет неподходящие анкеты кандидатов')}
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
                    <span>{t('clan_recruitment_notify_reject_reason') || 'Сообщать кандидату причину отказа'}</span>
                    <HelpTooltip text="Если включено, бот укажет кандидату в тикете, почему анкета была отклонена. Если выключено — кандидат увидит лишь общий статус отклонения, но в логах администраторов полная причина отказа будет сохранена всегда." />
                  </span>
                  <ToggleSwitch
                    checked={rConfig.notifyRejectReason !== false}
                    onChange={val => updateRConfig('notifyRejectReason', val, true)}
                    activeColor="orange"
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{t('clan_recruitment_reject_msg') || 'Сообщение кандидату при автоматическом отклонении'}</span>
                    <HelpTooltip text="Текст, который кандидат увидит в личном уведомлении при несоответствии минимальным требованиям клана." />
                  </label>
                  <span className={`text-[11px] font-mono ${autoRejectMsgValidation.isValid ? 'text-slate-400' : 'text-rose-500 font-bold'}`}>
                    {autoRejectMsgValidation.length} / {DISCORD_LIMITS.DM_MESSAGE_MAX}
                  </span>
                </div>
                <textarea 
                  className={`w-full px-4 py-2 border rounded-xl dark:bg-slate-800/50 dark:text-white focus:ring-2 outline-none transition-shadow text-xs min-h-[60px] ${
                    !autoRejectMsgValidation.isValid
                      ? 'border-rose-400 dark:border-rose-500/60 focus:ring-rose-500/40'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/50'
                  }`}
                  value={rConfig.autoRejectMessage ?? defaultRejectMsg}
                  onChange={e => updateRConfig('autoRejectMessage', e.target.value, false)}
                  onBlur={e => updateRConfig('autoRejectMessage', e.target.value, true)}
                  placeholder={defaultRejectMsg}
                ></textarea>
                {!autoRejectMsgValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{autoRejectMsgValidation.error}</span>
                  </p>
                )}
              </div>

              {/* Категория для создания тикетов заявок в Discord */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-orange-500" />
                    <span>Куда создавать каналы тикетов заявок</span>
                    <HelpTooltip text="Укажите, в какую категорию каналов бот будет открывать текстовые каналы тикетов (заявка-xxx / отказ-xxx). Если выбрано «Сверху сервера», тикеты создаются вне категорий в самом верху списка каналов." />
                  </label>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {rConfig.ticketCategory === 'top' || !rConfig.ticketCategory ? 'Вверху сервера' : 'В выбранной категории'}
                  </span>
                </div>
                <select
                  value={rConfig.ticketCategory || 'top'}
                  onChange={(e) => updateRConfig('ticketCategory', e.target.value, true)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/40 outline-none cursor-pointer"
                >
                  <option value="top">📌 Сверху Discord (без категории — в самом верху сервера)</option>
                  {categoryChannels.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Выбор каналов для отправки результатов заявок */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('clan_recruitment_channels_title') || 'Куда отсылать результаты заявок'}</span>
                  </h5>
                  <HelpTooltip text="Каналы Discord, в которые бот отправляет информационные карточки по итогам рассмотрения анкет (принятые, отклоненные и закрытые при выходе с сервера)." />
                </div>

                <div className={isCompanionWindowVisible ? "grid grid-cols-1 2xl:grid-cols-2 gap-3 pt-1" : "grid grid-cols-1 md:grid-cols-2 gap-3 pt-1"}>
                  <div>
                    <ChannelSelect
                      label={t('clan_recruitment_channel_accepted') || 'Принятые заявки'}
                      description={t('clan_recruitment_channel_accepted_desc') || 'Канал для карточек одобренных анкет и принятых кандидатов'}
                      value={cConfig.acceptedApplications || cConfig.applications || ''}
                      onChange={val => {
                        updateChannelConfig('acceptedApplications', val);
                        updateChannelConfig('applications', val);
                      }}
                      discordChannels={discordInfo?.channels || []}
                      typeFilter={[0, 2]}
                      isLoading={!discordInfo}
                    />
                  </div>
                  <div>
                    <ChannelSelect
                      label={t('clan_recruitment_channel_abandoned') || 'Закрытые без решения (вышел с сервера)'}
                      description={t('clan_recruitment_channel_abandoned_desc') || 'Канал для карточек анкет, закрытых из-за того, что кандидат покинул сервер'}
                      value={cConfig.abandonedApplications || ''}
                      onChange={val => updateChannelConfig('abandonedApplications', val)}
                      discordChannels={discordInfo?.channels || []}
                      typeFilter={[0, 2]}
                      isLoading={!discordInfo}
                    />
                  </div>
                  <div>
                    <ChannelSelect
                      label={t('clan_recruitment_channel_auto') || 'Отклоненные ботом заявки'}
                      description={t('clan_auto_113', 'Канал для карточек авто-отказа (нехватка часов, возраст)')}
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

        {/* Navigation back */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('form')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад к форме заявки</span>
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Шаг 3 из 3:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Отправленный тикет</span>
          </div>
        </div>
      </div>
      </div>
    )}
    <EmojiSuggestModal isOpen={isEmojiSuggestOpen} onClose={() => setIsEmojiSuggestOpen(false)} />
    <EmojiPickerModal
      isOpen={Boolean(emojiPickerTarget)}
      onClose={() => setEmojiPickerTarget(null)}
      onSelect={handleSelectTicketCardEmoji}
      mode="discord_tag"
      title={emojiPickerTarget?.fieldKey === 'name' ? 'Выбор иконки Discord для заголовка' : 'Выбор эмодзи Discord'}
    />
    </form>
  );
}
