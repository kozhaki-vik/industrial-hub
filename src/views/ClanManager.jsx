import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { useTranslation } from 'react-i18next';
import SetupWizard from '../components/SetupWizard';
import RoleSelect from '../components/RoleSelect';
import ChannelSelect from '../components/ChannelSelect';
import MemberDossierModal from '../components/MemberDossierModal';
import TicketTranscriptModal from '../components/TicketTranscriptModal';
import { 
  Sparkles, Unlink, Volume2, Mic, MicOff, VolumeX, Trash2, UserX, RefreshCw, Sliders, Radio,
  Settings, Users, Hash, ShieldCheck, UserPlus, Vote, Megaphone, UserCheck, BarChart3, Plus, Check,
  RotateCcw, AlertTriangle, ScrollText, ShieldAlert, Zap, CheckCheck, Ban, X, Bot, Clock, Filter,
  BookOpen, Star, Search, ExternalLink, Archive, ArrowUp, Eye, EyeOff
} from 'lucide-react';
import DiscordMessagePreview from '../components/DiscordMessagePreview';
import { validateForm, scrollToAndHighlight } from '../utils/formValidation';
import { 
  RosterSkeleton, 
  StatsTableSkeleton, 
  DossierCardsSkeleton, 
  ApplicationsTableSkeleton, 
  VoiceRoomsSkeleton, 
  SelectSkeleton 
} from '../components/Skeleton';

export const DEFAULT_BAD_WORDS = [
  'хохол', 'хохлы', 'хохлов', 'хохлу', 'хохлом', 'хохлам', 'хохлами', 'хохлах', 'хохляра', 'хохлят',
  'москаль', 'москали', 'москалей', 'москалям', 'москалями', 'москалях', 'москаляка',
  'кацап', 'кацапы', 'кацапов', 'кацапам', 'кацапами', 'кацапах',
  'русня', 'русни', 'русне', 'русню', 'русней',
  'свинорез', 'свинособака', 'свинособаки', 'чурка', 'чурки', 'чуркам', 'чурками',
  'укроп', 'укропы', 'укропов', 'ватник', 'ватники', 'ватников',
  'мать шлюха', 'мать шлюхи', 'сын шлюхи', 'дочь шлюхи', 'мать ебал', 'мать ебу', 'мать жива', 'мать проверял', 'мать сдохла', 'мамкоеб', 'мамкоебы'
];

export const isBotConfigured = (cfg) => {
  if (!cfg) return false;

  const roleKeys = [
    'leaderRoleId',
    'deputyLeaderRoleId',
    'callerRoleId',
    'recruiterRoleId',
    'mainRosterRoleId',
    'trialRoleId',
    'farmerRoleId',
    'plantFarmerRoleId',
    'electricianRoleId',
    'builderRoleId',
    'pilotRoleId',
    'sponsorRoleId',
    'vipRoleId'
  ];
  const hasRoles = roleKeys.some(k => typeof cfg[k] === 'string' && cfg[k].trim().length > 0);

  let hasChannels = false;
  if (cfg.channelsConfigJson) {
    try {
      const ch = typeof cfg.channelsConfigJson === 'string' ? JSON.parse(cfg.channelsConfigJson) : cfg.channelsConfigJson;
      if (ch && typeof ch === 'object') {
        const channelKeys = ['ticketsCategory', 'logs', 'applications', 'autoRejectedApplications', 'rejectedApplications', 'leaderboard', 'news', 'votes', 'ads', 'roster', 'waitingRoom'];
        hasChannels = channelKeys.some(k => typeof ch[k] === 'string' && ch[k].trim().length > 0);
      }
    } catch (e) {}
  }
  if (!hasChannels && cfg.loggingConfigJson) {
    try {
      const lCfg = typeof cfg.loggingConfigJson === 'string' ? JSON.parse(cfg.loggingConfigJson) : cfg.loggingConfigJson;
      if (lCfg?.defaultChannelId) hasChannels = true;
    } catch (e) {}
  }

  return hasRoles || hasChannels;
};

// --- Typo-tolerant Fuzzy Search Engine (Levenshtein distance) ---
export function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const prevRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  const currRow = new Array(s2.length + 1);

  for (let i = 0; i < s1.length; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < s2.length; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1,       // insertion
        prevRow[j + 1] + 1,   // deletion
        prevRow[j] + cost     // substitution
      );
    }
    for (let j = 0; j <= s2.length; j++) {
      prevRow[j] = currRow[j];
    }
  }
  return currRow[s2.length];
}

export function fuzzyMatchScore(query, target) {
  if (!query || !target) return 0;
  const q = String(query).toLowerCase().trim();
  const t = String(target).toLowerCase().trim();
  if (!q || !t) return 0;

  // Exact match gets top score
  if (t === q) return 100;
  if (t.includes(q)) return 80 + (q.length / t.length) * 15;

  // Word-by-word fuzzy comparison
  const qWords = q.split(/\s+/).filter(Boolean);
  const tWords = t.split(/[\s,./\\()_-]+/).filter(Boolean);

  let totalScore = 0;
  for (const qw of qWords) {
    let bestWordScore = 0;
    for (const tw of tWords) {
      if (tw === qw) {
        bestWordScore = Math.max(bestWordScore, 50);
      } else if (tw.startsWith(qw) || qw.startsWith(tw)) {
        bestWordScore = Math.max(bestWordScore, 40);
      } else if (tw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 35);
      } else {
        const maxLen = Math.max(qw.length, tw.length);
        if (maxLen >= 3) {
          const dist = levenshteinDistance(qw, tw);
          const allowedDist = maxLen >= 8 ? 3 : maxLen >= 5 ? 2 : 1;
          if (dist <= allowedDist) {
            const similarity = 1 - (dist / maxLen);
            bestWordScore = Math.max(bestWordScore, 20 + similarity * 20);
          }
        }
      }
    }
    totalScore += bestWordScore;
  }
  return totalScore;
}

export function getBotSettingSearchScore(item, query) {
  if (!query || !query.trim()) return 1;
  const q = query.trim();

  let score = 0;
  score += fuzzyMatchScore(q, item.title) * 2.0;
  score += fuzzyMatchScore(q, item.tabName) * 1.5;
  for (const kw of item.keywords || []) {
    score += fuzzyMatchScore(q, kw) * 2.2;
  }
  score += fuzzyMatchScore(q, item.desc) * 0.8;

  return score;
}

export const reportClanErrorToTelegram = (errorTitle, errorDetails) => {
  const fullErrorText = `🚨 [Clan Manager Error]\n${errorTitle}\n${errorDetails}`;
  if (window.electronAPI?.app?.reportError) {
    window.electronAPI.app.reportError(fullErrorText).catch(() => {});
  } else {
    try {
      fetch('https://industrial-hub.duckdns.org/api/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hwid: localStorage.getItem('hub_hwid') || 'UnknownClient',
          version: '2.7.57',
          errorStack: fullErrorText
        })
      }).catch(() => {});
    } catch {}
  }
};

const sanitizeClanConfig = (cfg) => {
  if (!cfg) return cfg;
  const sanitized = {
    ...cfg,
    name: cfg.name ?? '',
    discordLink: cfg.discordLink ?? ''
  };

  if (sanitized.roleNamesJson) {
    try {
      const roleNames = typeof sanitized.roleNamesJson === 'string' ? JSON.parse(sanitized.roleNamesJson) : { ...sanitized.roleNamesJson };
      let changed = false;
      for (const [k, v] of Object.entries(roleNames)) {
        if (typeof v === 'string' && (v.toLowerCase() === 'clan manager' || v.toLowerCase().includes('clan manager'))) {
          delete roleNames[k];
          changed = true;
        }
      }
      if (changed) {
        sanitized.roleNamesJson = JSON.stringify(roleNames);
      }
    } catch (e) {}
  }

  return sanitized;
};

function SaveButton() {
  return null;
}

function ToggleSwitch({ 
  checked, 
  onChange, 
  label, 
  disabled = false, 
  size = 'md', 
  activeColor = 'blue',
  title
}) {
  const { t } = useTranslation();
  const onText = t('common_on') || 'Вкл';
  const offText = t('common_off') || 'Выкл';
  const displayLabel = label !== undefined ? label : (checked ? onText : offText);

  const isSmall = size === 'sm';
  const activeBg = activeColor === 'orange' ? 'peer-checked:bg-orange-500' : 'peer-checked:bg-blue-600';
  const activeText = activeColor === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';

  return (
    <label 
      title={title}
      className={`relative inline-flex items-center gap-2 select-none shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={e => {
          if (!disabled && onChange) {
            onChange(e.target.checked);
          }
        }}
        disabled={disabled}
        className="sr-only peer"
      />
      <div 
        className={`${
          isSmall ? 'w-9 h-5 after:h-4 after:w-4' : 'w-11 h-6 after:h-5 after:w-5'
        } bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:transition-all after:duration-200 transition-colors duration-200 shadow-inner ${activeBg}`}
      ></div>
      {displayLabel !== null && (
        <span className={`text-xs font-semibold select-none transition-colors ${
          checked ? activeText : 'text-slate-400 dark:text-slate-500'
        }`}>
          {displayLabel}
        </span>
      )}
    </label>
  );
}

const getLoggingEventGroups = (t) => [
  {
    id: 'members',
    title: () => t('members_title'),
    icon: Users,
    events: [
      { key: 'member_join', title: () => t('member_join'), desc: t('clan_auto_170', 'Оповещение о входе нового участника на сервер') },
      { key: 'member_leave', title: t('log_ev_member_leave_title', 'Выход участника'), desc: t('log_ev_member_leave_desc', 'Участник покинул сервер по собственному желанию') },
      { key: 'member_kick', title: t('log_ev_member_kick_title', 'Кик участника'), desc: t('log_ev_member_kick_desc', 'Участник был кикнут модератором (с указанием автора и причины)') },
      { key: 'member_ban', title: t('log_ev_member_ban_title', 'Бан участника'), desc: t('log_ev_member_ban_desc', 'Блокировка участника на сервере') },
      { key: 'member_unban', title: t('log_ev_member_unban_title', 'Разбан участника'), desc: t('log_ev_member_unban_desc', 'Снятие бана с участника') },
      { key: 'nickname_change', title: t('log_ev_nickname_change_title', 'Смена никнейма'), desc: t('log_ev_nickname_change_desc', 'Изменение локального никнейма участника на сервере') },
    ]
  },
  {
    id: 'messages',
    title: t('log_ev_messages_cat', 'Сообщения'),
    icon: Hash,
    events: [
      { key: 'message_delete', title: t('log_ev_message_delete_title', 'Удаление сообщения'), desc: t('log_ev_message_delete_desc', 'Логирование удаленного текста, автора и канала') },
      { key: 'message_edit', title: t('log_ev_message_edit_title', 'Редактирование сообщения'), desc: t('log_ev_message_edit_desc', 'Логирование старого и нового текста сообщения') },
    ]
  },
  {
    id: 'roles',
    title: t('clan_auto_115', 'Роли'),
    icon: ShieldCheck,
    events: [
      { key: 'member_role_update', title: t('log_ev_member_role_update_title', 'Выдача и снятие ролей'), desc: t('log_ev_member_role_update_desc', 'Логирование изменений ролей у участников') },
      { key: 'role_create', title: t('log_ev_role_create_title', 'Создание роли'), desc: t('log_ev_role_create_desc', 'Создание новой роли на сервере') },
      { key: 'role_update', title: t('log_ev_role_update_title', 'Изменение роли'), desc: t('log_ev_role_update_desc', 'Изменение названия, цвета или разрешений роли') },
      { key: 'role_delete', title: t('log_ev_role_delete_title', 'Удаление роли'), desc: t('log_ev_role_delete_desc', 'Удаление роли с сервера') },
    ]
  },
  {
    id: 'channels',
    title: t('clan_auto_116', 'Каналы'),
    icon: Sliders,
    events: [
      { key: 'channel_create', title: t('log_ev_channel_create_title', 'Создание канала'), desc: t('log_ev_channel_create_desc', 'Создание текстового/голосового канала или категории') },
      { key: 'channel_update', title: t('log_ev_channel_update_title', 'Изменение канала'), desc: t('log_ev_channel_update_desc', 'Изменение названия, темы или прав доступа канала') },
      { key: 'channel_delete', title: t('log_ev_channel_delete_title', 'Удаление канала'), desc: t('log_ev_channel_delete_desc', 'Удаление канала или категории') },
    ]
  },
  {
    id: 'voice',
    title: t('log_ev_voice_cat', 'Голосовые каналы'),
    icon: Volume2,
    events: [
      { key: 'voice_join', title: t('log_ev_voice_join_title', 'Вход в голосовой канал'), desc: t('log_ev_voice_join_desc', 'Участник подключился к голосовому каналу') },
      { key: 'voice_leave', title: t('log_ev_voice_leave_title', 'Выход из голосового канала'), desc: t('log_ev_voice_leave_desc', 'Участник отключился от голосового канала') },
      { key: 'voice_move', title: t('log_ev_voice_move_title', 'Перемещение между войсами'), desc: t('log_ev_voice_move_desc', 'Переход участника из одного голосового канала в другой') },
      { key: 'voice_mute_deaf', title: t('log_ev_voice_mute_deaf_title', 'Серверный мут / глушение'), desc: t('log_ev_voice_mute_deaf_desc', 'Включение/отключение серверного мута микрофона или наушников') },
    ]
  }
];

function InitialClanNameModal({ isOpen, onClose, onSave, onOpenWizard, t }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(false);
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t('clan_modal_close') || 'Закрыть'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('clan_initial_name_title') || 'Укажите название клана'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('clan_initial_name_subtitle') || 'Синхронизация с ботом в Discord'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          {t('clan_initial_name_desc') || 'Для корректной работы всех модулей, набора и эмбедов бота в Discord, пожалуйста, укажите название вашего клана:'}
        </p>

        <form 
          onSubmit={e => {
            e.preventDefault();
            if (!name.trim()) {
              setError(true);
              inputRef.current?.focus();
              return;
            }
            setError(false);
            onSave(name.trim());
          }} 
          noValidate 
          className="space-y-4"
        >
          <div>
            <input
              ref={inputRef}
              type="text"
              required
              data-required="true"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.trim()) setError(false);
              }}
              placeholder={t('clan_name_placeholder') || 'Например: TITAN'}
              className={`w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                error ? 'border-red-400 dark:border-red-800 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">
                {t('clan_name_required') || 'Пожалуйста, введите название клана'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t('clan_initial_name_submit') || 'Сохранить и синхронизировать'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenWizard}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('clan_wizard_btn') || 'Мастер настройки'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <span>{t('clan_modal_later') || 'Позже'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClanManager() {
  const { t } = useTranslation();
  const loggingEventGroups = getLoggingEventGroups(t);
  const { ws, status: wsStatus } = useNetwork();
  const [status, setStatus] = useState('checking');
  const [guildId, setGuildId] = useState(null);
  const [linkCode, setLinkCode] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['Initializing Clan Manager...']);
  const [lastLinkAttempt, setLastLinkAttempt] = useState(0);
  
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [rosterData, setRosterData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [discordInfo, setDiscordInfo] = useState(null);
  const [activeVotes, setActiveVotes] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [dynamicVoiceData, setDynamicVoiceData] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [voiceActionLoading, setVoiceActionLoading] = useState(false);
  const [creatingRoleKey, setCreatingRoleKey] = useState(null);
  const [creatingLogChannel, setCreatingLogChannel] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSections, setResetSections] = useState([
    'roles', 'channels', 'permissions', 'voice', 'recruitment', 'applications', 'ads', 'logging', 'moderation', 'general'
  ]);
  const [isResetting, setIsResetting] = useState(false);
  const [syncModalData, setSyncModalData] = useState(null);
  const [editingRoomLimit, setEditingRoomLimit] = useState(null); // { channelId, name, limit }
  const [initialNameDismissed, setInitialNameDismissed] = useState(false);
  const hasPromptedRef = useRef(false);

  const isInitialNameModalOpen = Boolean(config && (!config.name || !config.name.trim()) && !showSetupWizard && !initialNameDismissed);

  // Invite link verification & creation state
  const [inviteStatus, setInviteStatus] = useState(null); // 'checking' | 'valid' | 'invalid' | null
  const [inviteDetails, setInviteDetails] = useState(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const lastVerifiedLinkRef = useRef('');
  const lastVerifiedRecruitmentLinkRef = useRef('');
  const lastSavedConfigRef = useRef(null);

  // Auto-setup progress modal state
  const [autoSetupModalData, setAutoSetupModalData] = useState(null); // { isOpen, status: 'loading' | 'success' | 'error', currentStep, error, clanName }

  // Stats interactive sorting state
  const [statsSortField, setStatsSortField] = useState('voiceTime');
  const [statsSortOrder, setStatsSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Bad words input state
  const [newBadWordInput, setNewBadWordInput] = useState('');

  // Applications state (recruitment tab)
  const [applicationsData, setApplicationsData] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appFilter, setAppFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'AUTO_REJECTED'
  const [appSearch, setAppSearch] = useState('');
  const [transcriptModal, setTranscriptModal] = useState({ isOpen: false, loading: false, html: null, app: null, error: null });

  // Warning System state
  const [selectedUserForWarns, setSelectedUserForWarns] = useState(null);
  const [userWarningsList, setUserWarningsList] = useState([]);
  const [loadingUserWarnings, setLoadingUserWarnings] = useState(false);
  const [newWarnReason, setNewWarnReason] = useState('');
  const [warnModerator, setWarnModerator] = useState(() => localStorage.getItem('clan_warn_moderator') || '');
  const [warnActionLoading, setWarnActionLoading] = useState(false);
  const [clanWarnings, setClanWarnings] = useState([]);
  const [loadingClanWarnings, setLoadingClanWarnings] = useState(false);

  // Member Dossier & Archive state
  const [dossiersData, setDossiersData] = useState([]);
  const [loadingDossiers, setLoadingDossiers] = useState(false);
  const [dossierFilter, setDossierFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'LEFT' | 'KICKED' | 'BLACKLISTED'
  const [dossierSearch, setDossierSearch] = useState('');
  const [selectedProfileForDossier, setSelectedProfileForDossier] = useState(null);

  // Recruitment Invite verification & creation state
  const [recruitmentInviteStatus, setRecruitmentInviteStatus] = useState(null); // 'checking' | 'valid' | 'invalid' | null
  const [recruitmentInviteDetails, setRecruitmentInviteDetails] = useState(null);
  const [creatingRecruitmentInvite, setCreatingRecruitmentInvite] = useState(false);
  const [checkingRecruitmentInvite, setCheckingRecruitmentInvite] = useState(false);
  const [movingRoles, setMovingRoles] = useState(false);

  // Live Discord Embed Preview state (active by default on wide/fullscreen display)
  const checkIsFullScreen = () => {
    if (typeof window === 'undefined') return false;
    const isDocFs = Boolean(document.fullscreenElement);
    const isMaximized = Boolean(
      window.innerWidth >= 1350 || 
      (window.screen && window.outerWidth >= (window.screen.availWidth - 40))
    );
    return isDocFs || isMaximized;
  };
  const [isFullScreenWindow, setIsFullScreenWindow] = useState(checkIsFullScreen);
  const [showDiscordLivePreview, setShowDiscordLivePreview] = useState(true);
  const [previewVoteIndex, setPreviewVoteIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsFullScreenWindow(checkIsFullScreen());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bot Settings Search state
  const [botSearchQuery, setBotSearchQuery] = useState('');
  const prevTabBeforeSearch = useRef('general');

  const handleBotSearchChange = (query) => {
    setBotSearchQuery(query);
    if (query.trim().length > 0) {
      if (activeTab !== 'search') {
        prevTabBeforeSearch.current = activeTab;
        setActiveTab('search');
      }
    } else {
      if (activeTab === 'search') {
        setActiveTab(prevTabBeforeSearch.current || 'general');
      }
    }
  };

  const handleBotSearchClear = () => {
    setBotSearchQuery('');
    if (activeTab === 'search') {
      setActiveTab(prevTabBeforeSearch.current || 'general');
    }
  };

  // --- Centralized Debounced & Throttled Auto-Save Engine ---
  const latestConfigRef = useRef(config);
  latestConfigRef.current = config;
  const saveTimerRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const pendingConfigRef = useRef(null);

  const latestVoiceConfigRef = useRef(dynamicVoiceData?.config);
  latestVoiceConfigRef.current = dynamicVoiceData?.config;
  const voiceSaveTimerRef = useRef(null);
  const lastVoiceSaveTimeRef = useRef(0);
  const pendingVoiceConfigRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoSetupModalData || autoSetupModalData.status !== 'loading') return;
    const interval = setInterval(() => {
      setAutoSetupModalData(prev => {
        if (!prev || prev.status !== 'loading') return prev;
        const nextStep = prev.currentStep < 4 ? prev.currentStep + 1 : 4;
        return { ...prev, currentStep: nextStep };
      });
    }, 1100);
    return () => clearInterval(interval);
  }, [autoSetupModalData?.status]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const sendProxyAction = (action, payload = {}) => {
    return new Promise((resolve) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        resolve({ success: false, error: 'WebSocket not connected' });
        return;
      }
      const reqId = `${action}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const timeout = setTimeout(() => {
        cleanup();
        resolve({ success: false, error: t('msg_timeout_bot', 'Таймаут ожидания ответа бота') });
      }, 15000);

      const onMsg = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'clan_proxy_res' && msg.reqId === reqId) {
            cleanup();
            resolve(msg.data || msg);
          }
        } catch (e) {}
      };

      const cleanup = () => {
        clearTimeout(timeout);
        ws.removeEventListener('message', onMsg);
      };

      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({
        type: 'clan',
        action: 'proxy',
        reqId,
        payload: {
          action,
          ...payload
        }
      }));
    });
  };

  const fetchUserWarnings = async (userId) => {
    if (!userId) return;
    setLoadingUserWarnings(true);
    const res = await sendProxyAction('get_warnings', { userId });
    setLoadingUserWarnings(false);
    if (res && res.success && Array.isArray(res.warnings)) {
      setUserWarningsList(res.warnings);
    }
  };

  const fetchClanWarnings = async () => {
    setLoadingClanWarnings(true);
    const res = await sendProxyAction('get_warnings', { limit: 100 });
    setLoadingClanWarnings(false);
    if (res && res.success && Array.isArray(res.warnings)) {
      setClanWarnings(res.warnings);
    }
  };

  const getDefaultModeratorName = () => {
    const saved = localStorage.getItem('clan_warn_moderator');
    if (saved && saved.trim()) return saved.trim();
    if (rosterData?.roster && config?.leaderRoleId) {
      const leader = rosterData.roster.find(m => m.roles?.includes(config.leaderRoleId));
      if (leader) return leader.displayName || leader.username;
    }
    return '';
  };

  const handleAddWarn = async () => {
    if (!selectedUserForWarns || !newWarnReason.trim()) return;
    setWarnActionLoading(true);
    const modTag = (warnModerator || '').trim() || getDefaultModeratorName() || t('clan_mod_admin', 'Администратор');
    localStorage.setItem('clan_warn_moderator', modTag);

    let modMember = null;
    if (rosterData?.roster) {
      modMember = rosterData.roster.find(m => 
        (m.displayName && m.displayName.toLowerCase() === modTag.toLowerCase()) ||
        (m.username && m.username.toLowerCase() === modTag.toLowerCase())
      );
    }

    const res = await sendProxyAction('add_warning', {
      userId: selectedUserForWarns.userId,
      userName: selectedUserForWarns.displayName || selectedUserForWarns.username,
      reason: newWarnReason.trim(),
      moderatorTag: modTag,
      moderatorId: modMember?.userId || modMember?.id || 'DESKTOP_CLIENT'
    });
    setWarnActionLoading(false);
    if (res && res.success) {
      setNewWarnReason('');
      await fetchUserWarnings(selectedUserForWarns.userId);
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
      if (activeTab === 'moderation') fetchClanWarnings();
    } else {
      setError(res?.error || t('msg_warn_issue_failed', 'Не удалось выдать предупреждение'));
    }
  };

  const handleRemoveWarn = async (warningId) => {
    if (!warningId) return;
    setWarnActionLoading(true);
    const modTag = (warnModerator || '').trim() || getDefaultModeratorName() || t('clan_mod_admin', 'Администратор');
    const res = await sendProxyAction('remove_warning', { 
      warningId,
      moderatorTag: modTag
    });
    setWarnActionLoading(false);
    if (res && res.success) {
      if (selectedUserForWarns) {
        await fetchUserWarnings(selectedUserForWarns.userId);
      }
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
      if (activeTab === 'moderation') fetchClanWarnings();
    } else {
      setError(res?.error || t('msg_warn_remove_failed', 'Не удалось снять предупреждение'));
    }
  };

  const handleClearUserWarns = async (userId) => {
    if (!userId) return;
    if (!window.confirm(t('msg_warn_clear_confirm', 'Снять все активные предупреждения с данного пользователя?'))) return;
    setWarnActionLoading(true);
    const modTag = (warnModerator || '').trim() || getDefaultModeratorName() || t('clan_mod_admin', 'Администратор');
    const res = await sendProxyAction('clear_warnings', { 
      userId,
      moderatorTag: modTag
    });
    setWarnActionLoading(false);
    if (res && res.success) {
      if (selectedUserForWarns) {
        await fetchUserWarnings(selectedUserForWarns.userId);
      }
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
      if (activeTab === 'moderation') fetchClanWarnings();
    } else {
      setError(res?.error || t('msg_warn_clear_failed', 'Не удалось очистить предупреждения'));
    }
  };

  const openUserWarningsModal = (stat) => {
    setSelectedUserForWarns(stat);
    setUserWarningsList([]);
    setNewWarnReason('');
    const defMod = getDefaultModeratorName();
    if (defMod && !warnModerator) {
      setWarnModerator(defMod);
    }
    fetchUserWarnings(stat.userId);
  };

  const fetchDossiers = (filterStatus = 'ALL', search = '') => {
    if (!ws || wsStatus !== 'online') return;
    setLoadingDossiers(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'get_member_dossiers',
      payload: {
        action: 'get_member_dossiers',
        status: filterStatus || 'ALL',
        search: search || ''
      }
    }));
  };

  const handleSaveDossier = (userId, updates) => {
    return sendProxyAction('update_member_dossier', {
      action: 'update_member_dossier',
      userId,
      updates
    }).then(res => {
      if (res && res.success && res.dossier) {
        setDossiersData(prev => {
          const idx = prev.findIndex(d => d.userId === res.dossier.userId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = res.dossier;
            return copy;
          }
          return [res.dossier, ...prev];
        });
        setSelectedProfileForDossier(res.dossier);
      }
      return res;
    });
  };

  const handleGlobalSearchDossier = (query) => {
    return sendProxyAction('search_member_history', {
      action: 'search_member_history',
      query
    });
  };

  const handleSendCrossClanMessage = (targetUserId, toGuildId, content) => {
    return sendProxyAction('send_cross_clan_message', {
      action: 'send_cross_clan_message',
      targetUserId,
      toGuildId,
      content
    });
  };

  const verifyRecruitmentInvite = (link) => {
    const trimmed = (link || '').trim();
    if (!trimmed || !ws || wsStatus !== 'online') {
      setRecruitmentInviteStatus(null);
      setRecruitmentInviteDetails(null);
      lastVerifiedRecruitmentLinkRef.current = '';
      return;
    }
    // If main invite was already verified for this exact link, sync immediately
    if (lastVerifiedLinkRef.current === trimmed && inviteStatus) {
      setRecruitmentInviteStatus(inviteStatus);
      setRecruitmentInviteDetails(inviteDetails);
      lastVerifiedRecruitmentLinkRef.current = trimmed;
      return;
    }
    if (lastVerifiedRecruitmentLinkRef.current === trimmed && recruitmentInviteStatus) {
      return;
    }
    lastVerifiedRecruitmentLinkRef.current = trimmed;
    setCheckingRecruitmentInvite(true);
    setRecruitmentInviteStatus('checking');
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'check_recruitment_invite',
      payload: {
        action: 'check_discord_invite',
        inviteUrl: trimmed
      }
    }));
  };

  const handleCreateRecruitmentInvite = () => {
    if (!ws || wsStatus !== 'online' || creatingRecruitmentInvite) return;
    setCreatingRecruitmentInvite(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_recruitment_invite',
      payload: {
        action: 'create_discord_invite'
      }
    }));
    addLog('Generating recruitment Discord invite...');
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') {
      addLog(t('clan_waiting'));
      return;
    }
    
    addLog('Sending initial get_status request');
    
    const handleMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type && data.type.startsWith('clan_')) {
          addLog(`Received: ${JSON.stringify(data)}`);
        }
        
        if (data.type === 'clan_status_res') {
          setStatus(data.linked ? 'linked' : 'unlinked');
          if (data.linked) {
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          }
        } else if (data.type === 'clan_link_res') {
          if (data.success) {
            setStatus('linked');
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          } else {
            setError(data.error || 'Failed to link');
          }
        } else if (data.type === 'clan_unlink_res') {
          setStatus('unlinked');
          setGuildId(null);
          setConfig(null);
          hasPromptedRef.current = false;
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_config') {
          setLoadingConfig(false);
          const configError = data.error || (data.data && !data.data.success ? data.data.error : null);
          const fetchedConfig = data.data?.config;

          if (configError) {
            setError(configError);
            reportClanErrorToTelegram('Failed to load clan configuration', `Error: ${configError}\nGuild ID: ${guildId || 'Unknown'}`);
          } else if (!fetchedConfig) {
            const emptyError = 'Empty or invalid configuration returned from bot/server';
            setError(emptyError);
            reportClanErrorToTelegram('Failed to load clan configuration', `Error: ${emptyError}\nGuild ID: ${guildId || 'Unknown'}`);
          } else {
            setError(null);
            const sanitized = sanitizeClanConfig(fetchedConfig);
            setConfig(sanitized);
            lastSavedConfigRef.current = JSON.parse(JSON.stringify(sanitized));
            if (!hasPromptedRef.current && (!isBotConfigured(fetchedConfig) || !fetchedConfig?.name?.trim())) {
              hasPromptedRef.current = true;
              setShowSetupWizard(true);
            }
            if (sanitized?.discordLink && sanitized.discordLink.trim()) {
              setCheckingInvite(true);
              setInviteStatus('checking');
              lastVerifiedLinkRef.current = sanitized.discordLink.trim();
              ws.send(JSON.stringify({
                type: 'clan',
                action: 'proxy',
                reqId: 'check_discord_invite',
                payload: {
                  action: 'check_discord_invite',
                  inviteUrl: sanitized.discordLink.trim()
                }
              }));
            }
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'update_config') {
          if (data.error) {
            setError(data.error);
            setSaveStatus(`error: ${data.error}`);
          } else {
            setSaveStatus('success');
            const sanitized = sanitizeClanConfig(data.data.config);
            setConfig(sanitized);
            lastSavedConfigRef.current = JSON.parse(JSON.stringify(sanitized));
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'auto_setup') {
          if (data.error || (data.data && data.data.error)) {
            const err = data.error || data.data.error;
            setError(err);
            setSaveStatus(`error: ${err}`);
            setAutoSetupModalData(prev => prev ? { ...prev, status: 'error', error: err } : null);
          } else {
            setSaveStatus('success');
            if (data.data.discordInfo) setDiscordInfo(data.data.discordInfo);
            if (data.data.config) {
              const sanitized = sanitizeClanConfig(data.data.config);
              setConfig(sanitized);
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(sanitized));
            }
            setAutoSetupModalData(prev => prev ? { ...prev, status: 'success', currentStep: 4 } : null);
            setTimeout(() => {
              setAutoSetupModalData(null);
              setSaveStatus(null);
            }, 2500);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'sync_permissions') {
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
            setSaveStatus(`error: ${data.error || data.data.error}`);
          } else {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_roster') {
          if (!data.error && data.data && data.data.success) {
            setRosterData(data.data);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_applications') {
          setLoadingApps(false);
          if (!data.error && data.data && data.data.success) {
            setApplicationsData(data.data.applications || []);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_ticket_transcript') {
          setTranscriptModal(prev => ({
            ...prev,
            loading: false,
            html: data.data?.transcriptHtml || null,
            error: data.error || (data.data && !data.data.success ? (data.data.error || t('msg_transcript_error', 'Ошибка загрузки транскрипта')) : (!data.data?.transcriptHtml ? t('msg_transcript_not_found', 'Транскрипт не найден или еще формируется') : null))
          }));
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_stats') {
          if (!data.error && data.data && data.data.success) {
            setStatsData(data.data.stats);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_discord_info') {
          if (!data.error && data.data && data.data.success) {
            setDiscordInfo({ roles: data.data.roles, channels: data.data.channels });
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_active_votes') {
          if (!data.error && data.data && data.data.success) {
            setActiveVotes(data.data.votes);
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'create_vote' || data.reqId === 'close_vote')) {
          if (!data.error && data.data && data.data.success) {
            addLog(`Vote action success`);
            ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_active_votes', payload: { action: 'get_active_votes' } }));
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_dynamic_voice') {
          setLoadingVoice(false);
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData({
              config: data.data.config || { enabled: false, categoryId: '', generatorChannelId: '', template: `🔊 ${t('clan_voice_party_tpl', 'Пати')} {user}`, defaultLimit: 0 },
              activeRooms: data.data.activeRooms || [],
              channels: data.data.channels || []
            });
            if (data.data.channels && data.data.channels.length > 0) {
              setDiscordInfo(prev => ({
                roles: prev?.roles || [],
                channels: data.data.channels
              }));
            }
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'update_dynamic_voice') {
          setSaveStatus(data.error ? `error: ${data.error}` : 'success');
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData(prev => ({
              ...prev,
              config: data.data.config
            }));
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'auto_setup_dynamic_voice') {
          setVoiceActionLoading(false);
          setSaveStatus(data.error ? `error: ${data.error}` : 'success');
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData(prev => ({
              ...prev,
              config: data.data.config,
              channels: data.data.channels || prev?.channels || []
            }));
            fetchDiscordInfo();
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'manage_dynamic_room') {
          setVoiceActionLoading(false);
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
          } else {
            fetchDynamicVoice();
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'rename_discord_role' || data.reqId === 'delete_discord_role')) {
          if (!data.error && data.data && data.data.success) {
            if (data.data.roles) {
              setDiscordInfo(prev => ({ roles: data.data.roles, channels: prev?.channels || [] }));
            }
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_single_role') {
          setCreatingRoleKey(null);
          if (!data.error && data.data && data.data.success) {
            if (data.data.roles) {
              setDiscordInfo(prev => ({ roles: data.data.roles, channels: prev?.channels || [] }));
            }
            if (data.data.config) {
              setConfig(sanitizeClanConfig(data.data.config));
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 2500);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'factory_reset') {
          setIsResetting(false);
          setShowResetModal(false);
          if (!data.error && data.data && data.data.success) {
            if (data.data.config) {
              setConfig(sanitizeClanConfig(data.data.config));
            }
            const resetSecs = data.data.resetSections || [];
            if (resetSecs.length === 0 || resetSecs.includes('general')) {
              setInitialNameDismissed(false);
            }
            if (resetSecs.length === 0 || resetSecs.includes('recruitment') || resetSecs.includes('applications')) {
              setApplicationsData([]);
              fetchApplications();
            }
            if (resetSecs.length === 0 || resetSecs.includes('roles')) {
              fetchRoster();
              fetchDossiers();
            }
            fetchDiscordInfo();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'clear_applications') {
          setLoadingApps(false);
          if (!data.error && data.data && data.data.success) {
            setApplicationsData([]);
            addLog(t('clan_recruitment_apps_cleared_log') || 'Журнал заявок в клан успешно очищен');
          } else {
            setError(data.error || (data.data && data.data.error) || t('msg_logs_clear_error', 'Ошибка очистки журнала заявок'));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'move_roles_up') {
          setMovingRoles(false);
          if (!data.error && data.data && data.data.success) {
            addLog(`${t('log_roles_moved_success', 'Успешно перемещено ролей вверх в Discord: ')}${data.data.movedCount}`);
            if (data.data.roles) {
              setDiscordInfo(prev => ({ ...(prev || {}), roles: data.data.roles }));
            }
          } else {
            setError(data.error || (data.data && data.data.error) || t('msg_roles_move_error', 'Ошибка перемещения ролей в Discord'));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_log_channel') {
          setCreatingLogChannel(false);
          if (!data.error && data.data && data.data.success) {
            if (data.data.channels) {
              setDiscordInfo(prev => ({ roles: prev?.roles || [], channels: data.data.channels }));
            }
            if (data.data.channel) {
              const newChannelId = data.data.channel.id;
              setConfig(prev => {
                if (!prev) return prev;
                let logCfg = {};
                try {
                  if (prev.loggingConfigJson) {
                    logCfg = typeof prev.loggingConfigJson === 'string' ? JSON.parse(prev.loggingConfigJson) : prev.loggingConfigJson;
                  }
                } catch (e) {}
                logCfg.defaultChannelId = newChannelId;
                if (logCfg.enabled === undefined) logCfg.enabled = true;
                const updatedConfig = {
                  ...prev,
                  loggingConfigJson: JSON.stringify(logCfg)
                };
                autoSaveConfig(updatedConfig);
                return updatedConfig;
              });
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_discord_invite') {
          setCreatingInvite(false);
          if (!data.error && data.data && data.data.success && data.data.inviteUrl) {
            const newUrl = data.data.inviteUrl;
            setConfig(prev => {
              if (!prev) return prev;
              const updated = { ...prev, discordLink: newUrl };
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(updated));
              return updated;
            });
            setInviteStatus('valid');
            setInviteDetails(data.data.invite || null);
            lastVerifiedLinkRef.current = newUrl;
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
            addLog(`Permanent invite created: ${newUrl}`);
          } else {
            setError(data.error || (data.data && data.data.error) || 'Failed to create invite');
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'check_discord_invite') {
          setCheckingInvite(false);
          if (!data.error && data.data) {
            const isValid = Boolean(data.data.valid);
            const status = isValid ? 'valid' : 'invalid';
            const details = data.data.invite || data.data || null;
            setInviteStatus(status);
            setInviteDetails(isValid ? details : null);

            const curCfg = latestConfigRef.current;
            let rcLink = '';
            try { if (curCfg?.recruitmentConfigJson) rcLink = JSON.parse(curCfg.recruitmentConfigJson)?.link; } catch(e) {}
            const currentRecLink = (rcLink || curCfg?.discordLink || '').trim();
            if (currentRecLink && currentRecLink === lastVerifiedLinkRef.current) {
              setRecruitmentInviteStatus(status);
              setRecruitmentInviteDetails(isValid ? details : null);
              lastVerifiedRecruitmentLinkRef.current = lastVerifiedLinkRef.current;
            }
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_member_dossiers') {
          setLoadingDossiers(false);
          if (!data.error && data.data && data.data.success) {
            setDossiersData(data.data.dossiers || []);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_recruitment_invite') {
          setCreatingRecruitmentInvite(false);
          if (!data.error && data.data && data.data.success) {
            const newUrl = data.data.inviteUrl;
            setConfig(prev => {
              if (!prev) return prev;
              let currentRConfig = {};
              try { if (prev.recruitmentConfigJson) currentRConfig = JSON.parse(prev.recruitmentConfigJson); } catch(e) {}
              const newRConfig = { ...currentRConfig, link: newUrl };
              const updated = { ...prev, recruitmentConfigJson: JSON.stringify(newRConfig) };
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(updated));
              return updated;
            });
            setRecruitmentInviteStatus('valid');
            setRecruitmentInviteDetails(data.data.invite || data.data || null);
            lastVerifiedRecruitmentLinkRef.current = newUrl;
            addLog(`Recruitment invite created: ${newUrl}`);
          } else {
            setError(data.error || (data.data && data.data.error) || 'Failed to create recruitment invite');
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'check_recruitment_invite') {
          setCheckingRecruitmentInvite(false);
          if (!data.error && data.data) {
            const isValid = Boolean(data.data.valid);
            const status = isValid ? 'valid' : 'invalid';
            const details = data.data.invite || data.data || null;
            setRecruitmentInviteStatus(status);
            setRecruitmentInviteDetails(isValid ? details : null);

            const mainLink = (latestConfigRef.current?.discordLink || '').trim();
            if (mainLink && mainLink === lastVerifiedRecruitmentLinkRef.current) {
              setInviteStatus(status);
              setInviteDetails(isValid ? details : null);
              lastVerifiedLinkRef.current = lastVerifiedRecruitmentLinkRef.current;
            }
          }
        } else if (data.type === 'clan_event') {
          if (data.event === 'roles_updated' && data.data?.roles) {
            setDiscordInfo(prev => ({
              ...(prev || {}),
              roles: data.data.roles
            }));
            addLog('Discord roles auto-updated from server');
          }
        }
      } catch (err) {}
    };

    ws.addEventListener('message', handleMessage);
    ws.send(JSON.stringify({ type: 'clan', action: 'get_status' }));
    
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, wsStatus]);

  const handleLink = (e) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      setError(t('clan_setup_placeholder') || 'Введите 6-значный код');
      const inputEl = e?.target?.querySelector('input');
      if (inputEl) scrollToAndHighlight(inputEl);
      return;
    }
    
    const now = Date.now();
    if (now - lastLinkAttempt < 5000) {
      setError(t('clan_antispam_wait') || 'Please wait 5 seconds before trying again.');
      return;
    }
    setLastLinkAttempt(now);
    
    setError('');
    hasPromptedRef.current = false;
    addLog(`Sending link code request: ${linkCode}`);
    ws.send(JSON.stringify({ type: 'clan', action: 'link', code: linkCode }));
  };

  const handleUnlink = () => {
    if (window.confirm(t('clan_unlink_confirm') || 'Are you sure you want to unlink your Clan Manager?')) {
      addLog('Sending unlink request');
      hasPromptedRef.current = false;
      ws.send(JSON.stringify({ type: 'clan', action: 'unlink' }));
    }
  };

  const fetchConfig = () => {
    if (!ws || wsStatus !== 'online') {
      setError(t('clan_connecting') || 'Подключение к серверу...');
      setLoadingConfig(false);
      return;
    }
    setLoadingConfig(true);
    setError(null);
    addLog('Fetching config via proxy');
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_config', 
      payload: { action: 'get_config' } 
    }));
  };

  const fetchDiscordInfo = () => {
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_discord_info', 
      payload: { action: 'get_discord_info' } 
    }));
  };

  const verifyInvite = (link) => {
    const trimmed = (link || '').trim();
    if (!trimmed || !ws || wsStatus !== 'online') {
      setInviteStatus(null);
      setInviteDetails(null);
      lastVerifiedLinkRef.current = '';
      return;
    }
    // If recruitment invite was already verified for this exact link, sync immediately
    if (lastVerifiedRecruitmentLinkRef.current === trimmed && recruitmentInviteStatus) {
      setInviteStatus(recruitmentInviteStatus);
      setInviteDetails(recruitmentInviteDetails);
      lastVerifiedLinkRef.current = trimmed;
      return;
    }
    if (lastVerifiedLinkRef.current === trimmed && inviteStatus) {
      return;
    }
    setCheckingInvite(true);
    setInviteStatus('checking');
    lastVerifiedLinkRef.current = trimmed;
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'check_discord_invite',
      payload: {
        action: 'check_discord_invite',
        inviteUrl: trimmed
      }
    }));
  };

  const handleCreatePermanentInvite = () => {
    if (!ws || wsStatus !== 'online' || creatingInvite) return;
    setCreatingInvite(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_discord_invite',
      payload: {
        action: 'create_discord_invite'
      }
    }));
    addLog('Generating permanent Discord invite...');
  };

  const handleClanNameChange = (newName, immediate = false) => {
    let updatedRecruitment = config?.recruitmentConfigJson;
    try {
      let r = {};
      if (config?.recruitmentConfigJson) {
        r = JSON.parse(config.recruitmentConfigJson);
      }
      const oldName = config?.name || '';
      // If recruitment title was not customized, or was using old name, or was GODS, update it to match new name
      if (!r.title || r.title === t('clan_rec_gods', 'Набор в клан GODS') || r.title === t('clan_rec_base', 'Набор в клан') || (oldName && r.title === `Набор в клан ${oldName}`) || r.title.includes('GODS')) {
        r.title = newName ? `Набор в клан ${newName}` : t('clan_rec_base', 'Набор в клан');
        updatedRecruitment = JSON.stringify(r);
      }
    } catch (e) {}

    const updated = {
      ...config,
      name: newName,
      recruitmentConfigJson: updatedRecruitment
    };
    setConfig(updated);
    queueAutoSave(updated, immediate);
  };

  const startAutoSetup = (options) => {
    setShowSetupWizard(false);
    setAutoSetupModalData({
      isOpen: true,
      status: 'loading',
      currentStep: 1,
      clanName: options?.clanName || config?.name || '',
      error: null
    });
    setSaveStatus('saving');
    addLog(t('log_auto_setup_server', 'Запрос автоматической настройки сервера...'));

    let updatedConfig = { ...config };
    if (options?.clanName && options.clanName.trim()) {
      const clanName = options.clanName.trim();
      updatedConfig.name = clanName;
      let r = {};
      try {
        if (updatedConfig.recruitmentConfigJson) r = JSON.parse(updatedConfig.recruitmentConfigJson);
      } catch (e) {}
      if (!r.title || r.title === t('clan_rec_gods', 'Набор в клан GODS') || r.title === t('clan_rec_base', 'Набор в клан') || r.title.includes('GODS')) {
        r.title = `${t('clan_recruit_title_prefix', 'Набор в клан')} ${clanName}`;
        updatedConfig.recruitmentConfigJson = JSON.stringify(r);
      }
      setConfig(updatedConfig);
      queueAutoSave(updatedConfig, true);
    }

    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'auto_setup',
      payload: {
        action: 'auto_setup',
        currentConfig: updatedConfig,
        setupOptions: options
      }
    }));
  };

  const syncPermissions = () => {
    setSaveStatus('saving');
    let channelsConfig = {};
    try { if (config.channelsConfigJson) channelsConfig = JSON.parse(config.channelsConfigJson); } catch (e) {}
    
    // permissions structure stored in channelsConfig.permissions
    const permissions = { ...(channelsConfig.permissions || {}) };

    let defaultLogChannelId = null;
    try {
      const l = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
      defaultLogChannelId = l?.defaultChannelId || null;
    } catch (e) {}

    const getChannelId = (cKey) => channelsConfig[cKey] || (cKey === 'logs' ? defaultLogChannelId : null);

    const defaultRoleChannelKeys = {
      leader: ['ticketsCategory', 'applications', 'logs', 'leaderboard', 'news', 'votes', 'ads', 'roster'],
      deputy: ['ticketsCategory', 'applications', 'logs', 'leaderboard', 'news', 'votes', 'ads', 'roster'],
      caller: ['news', 'votes'],
      recruiter: ['ticketsCategory', 'applications']
    };

    const roleMap = {
      leader: config.leaderRoleId,
      deputy: config.deputyLeaderRoleId,
      caller: config.callerRoleId,
      recruiter: config.recruiterRoleId
    };

    for (const [rKey, rId] of Object.entries(roleMap)) {
      if (rId && permissions[rId] === undefined) {
        const defKeys = defaultRoleChannelKeys[rKey] || [];
        permissions[rId] = defKeys.map(getChannelId).filter(Boolean);
      }
    }

    channelsConfig.permissions = permissions;
    const updated = { ...config, channelsConfigJson: JSON.stringify(channelsConfig) };
    queueAutoSave(updated, true);
    
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'sync_permissions',
      payload: {
        action: 'sync_permissions',
        permissions
      }
    }));
    addLog(t('log_sync_perms', 'Синхронизация прав доступа с Discord...'));
  };
  
  const flushSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const cfgToSend = pendingConfigRef.current || latestConfigRef.current;
    if (!cfgToSend || !ws || wsStatus !== 'online') return;

    // No-op guard: if the configuration hasn't changed compared to lastSavedConfigRef, skip sending
    if (lastSavedConfigRef.current && JSON.stringify(cfgToSend) === JSON.stringify(lastSavedConfigRef.current)) {
      pendingConfigRef.current = null;
      return;
    }

    pendingConfigRef.current = null;
    lastSaveTimeRef.current = Date.now();
    lastSavedConfigRef.current = JSON.parse(JSON.stringify(cfgToSend));
    setSaveStatus('saving');

    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'update_config', 
      payload: {
        action: 'update_config',
        updates: cfgToSend
      }
    }));
    addLog('Auto-saving config (batched)...');
  };

  const queueAutoSave = (newConfig, immediate = false) => {
    setConfig(newConfig);
    latestConfigRef.current = newConfig;
    pendingConfigRef.current = newConfig;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    if (immediate) {
      if (timeSinceLastSave >= 1000) {
        flushSave();
      } else {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const delay = Math.max(50, 1000 - timeSinceLastSave);
        saveTimerRef.current = setTimeout(() => {
          flushSave();
        }, delay);
      }
    } else {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const delay = Math.max(1000, 1000 - timeSinceLastSave);
      saveTimerRef.current = setTimeout(() => {
        flushSave();
      }, delay);
    }
  };

  const autoSaveConfig = (updatedConfig, immediate = true) => {
    queueAutoSave(updatedConfig, immediate);
  };

  const saveConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    flushSave();
  };

  const standardRoles = [
    { key: 'leader', dbKey: 'leaderRoleId', defaultName: 'Leader', defaultRu: 'Leader', defaultEn: 'Leader', defaultUa: 'Leader' },
    { key: 'deputy', dbKey: 'deputyLeaderRoleId', defaultName: 'Deputy Leader', defaultRu: 'Deputy Leader', defaultEn: 'Deputy Leader', defaultUa: 'Deputy Leader' },
    { key: 'caller', dbKey: 'callerRoleId', defaultName: t('clan_role_caller', 'Коллер'), defaultRu: 'Коллер', defaultEn: 'Caller', defaultUa: 'Колер' },
    { key: 'recruiter', dbKey: 'recruiterRoleId', defaultName: t('clan_role_recruiter', 'Рекрутер'), defaultRu: 'Рекрутер', defaultEn: 'Recruiter', defaultUa: 'Рекрутер' },
    { key: 'main', dbKey: 'mainRosterRoleId', defaultName: t('clan_role_main', 'Основной состав'), defaultRu: 'Основной состав', defaultEn: 'Main Roster', defaultUa: 'Основний склад' },
    { key: 'trial', dbKey: 'trialRoleId', defaultName: t('clan_role_trial', 'Испытательный срок'), defaultRu: 'Испытательный срок', defaultEn: 'Trial', defaultUa: 'Випробувальний термін' },
    { key: 'farmer', dbKey: 'farmerRoleId', defaultName: t('clan_role_farmer', 'Фармер'), defaultRu: 'Фармер', defaultEn: 'Miner / Farmer', defaultUa: 'Фармер' },
    { key: 'plantFarmer', dbKey: 'plantFarmerRoleId', defaultName: t('clan_role_plant_farmer', 'Фермер'), defaultRu: 'Фермер', defaultEn: 'Plant Farmer', defaultUa: 'Фермер' },
    { key: 'electrician', dbKey: 'electricianRoleId', defaultName: t('clan_role_electrician', 'Электрик'), defaultRu: 'Электрик', defaultEn: 'Electrician', defaultUa: 'Електрик' },
    { key: 'builder', dbKey: 'builderRoleId', defaultName: t('clan_role_builder', 'Билдер'), defaultRu: 'Билдер', defaultEn: 'Builder', defaultUa: 'Білдер' },
    { key: 'pilot', dbKey: 'pilotRoleId', defaultName: t('clan_role_pilot', 'Пилот'), defaultRu: 'Пилот', defaultEn: 'Pilot', defaultUa: 'Пілот' },
    { key: 'sponsor', dbKey: 'sponsorRoleId', defaultName: t('clan_role_sponsor', 'Спонсор'), defaultRu: 'Спонсор', defaultEn: 'Sponsor', defaultUa: 'Спонсор' },
    { key: 'vip', dbKey: 'vipRoleId', defaultName: 'VIP', defaultRu: 'VIP', defaultEn: 'VIP', defaultUa: 'VIP' },
  ];

  const handleRoleNameChange = (key, val, isCustom, customId) => {
    if (!config) return;
    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].name = val;
        setConfig({ ...config, customRolesJson: JSON.stringify(customRoles) });
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      roleNames[key] = val;
      setConfig({ ...config, roleNamesJson: JSON.stringify(roleNames) });
    }
  };

  const handleRoleNameBlur = (key, dbKey, currentName, isCustom, customId) => {
    if (!config) return;
    const trimmed = (currentName || '').trim();

    let updatedConfig = { ...config };
    let roleId = null;

    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].name = currentName;
        updatedConfig.customRolesJson = JSON.stringify(customRoles);
        roleId = customRoles[idx].roleId;
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      roleNames[key] = currentName;
      updatedConfig.roleNamesJson = JSON.stringify(roleNames);
      roleId = updatedConfig[dbKey];
    }

    autoSaveConfig(updatedConfig);

    if (roleId && trimmed.length > 0) {
      const discordRole = discordInfo?.roles?.find(r => r.id === roleId);
      if (discordRole && discordRole.name === trimmed) {
        return;
      }

      addLog(`${t('log_role_sync_name', 'Синхронизация названия роли в Discord: ')}${trimmed}...`);
      ws.send(JSON.stringify({
        type: 'clan',
        action: 'proxy',
        reqId: 'rename_discord_role',
        payload: {
          action: 'rename_discord_role',
          roleId,
          newName: trimmed
        }
      }));
    }
  };

  const handleSelectDiscordRole = (key, dbKey, selectedRoleId, isCustom, customId) => {
    if (!config) return;
    const foundDiscordRole = discordInfo?.roles?.find(r => r.id === selectedRoleId);
    const newDiscordName = foundDiscordRole?.name;

    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].roleId = selectedRoleId;
        if (newDiscordName) {
          customRoles[idx].name = newDiscordName;
        }
        const updatedConfig = {
          ...config,
          customRolesJson: JSON.stringify(customRoles)
        };
        autoSaveConfig(updatedConfig);
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      if (newDiscordName) {
        roleNames[key] = newDiscordName;
      }
      const updatedConfig = {
        ...config,
        [dbKey]: selectedRoleId,
        ...(newDiscordName ? { roleNamesJson: JSON.stringify(roleNames) } : {})
      };
      autoSaveConfig(updatedConfig);
    }
  };

  const handleCreateRoleInDiscord = (r, isCustom = false, nameOverride = '') => {
    if (!ws || wsStatus !== 'online') return;
    const roleIdentifier = isCustom ? r.id : r.key;
    setCreatingRoleKey(roleIdentifier);
    
    let roleName = (nameOverride || '').trim();
    if (!roleName) {
      if (isCustom) {
        roleName = (r.name || '').trim() || t('role_new_default', 'Новая роль');
      } else {
        let roleNames = {};
        try {
          if (config?.roleNamesJson) {
            roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
          }
        } catch (e) {}
        const fromConfig = roleNames[r.key];
        roleName = (fromConfig !== undefined && !fromConfig.toLowerCase().includes('clan manager') ? fromConfig : (r.defaultName || r.defaultRu || '')).trim() || t('role_new_default', 'Новая роль');
      }
    }

    const roleColors = {
      leaderRoleId: '#ef4444',
      deputyLeaderRoleId: '#f97316',
      callerRoleId: '#eab308',
      recruiterRoleId: '#8b5cf6',
      mainRosterRoleId: '#22c55e',
      trialRoleId: '#06b6d4',
      vipRoleId: '#a855f7',
      farmerRoleId: '#84cc16',
      plantFarmerRoleId: '#10b981',
      electricianRoleId: '#3b82f6',
      builderRoleId: '#6366f1',
      pilotRoleId: '#0ea5e9',
      sponsorRoleId: '#ec4899'
    };
    const roleColor = isCustom ? '#3b82f6' : (roleColors[r.dbKey] || '#3b82f6');

    addLog(`${t('log_role_create', 'Создание роли в Discord: ')}"${roleName}"...`);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_single_role',
      payload: {
        action: 'create_single_role',
        name: roleName,
        color: roleColor,
        roleKey: isCustom ? null : r.dbKey,
        roleShortKey: isCustom ? null : r.key,
        isCustom,
        customRoleId: isCustom ? r.id : null
      }
    }));
  };

  const handleAddCustomRole = () => {
    if (!config) return;
    let customRoles = [];
    try {
      if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
    } catch (e) {}
    
    const newId = `custom_${Date.now()}`;
    const newRole = {
      id: newId,
      key: newId,
      name: t('role_new_default', 'Новая роль'),
      roleId: ''
    };
    customRoles.push(newRole);
    
    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(customRoles)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleDeleteCustomRole = (customId) => {
    if (!config) return;
    if (!window.confirm(t('clan_roles_delete_confirm') || 'Удалить этот шаблон роли? Привязка к Discord роли будет снята.')) return;
    
    let customRoles = [];
    try {
      if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
    } catch (e) {}
    
    const filtered = customRoles.filter(r => r.id !== customId);
    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(filtered)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleDeleteStandardRole = (roleKey, dbKey) => {
    if (!config) return;
    if (!window.confirm(t('clan_role_delete_std_confirm') || 'Удалить эту стандартную роль из конфигурации? Привязка к Discord роли будет снята.')) return;

    let deletedRoles = [];
    try {
      if (config.deletedRolesJson) {
        deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
      }
    } catch (e) {}

    if (!deletedRoles.includes(roleKey)) {
      deletedRoles.push(roleKey);
    }

    const updatedConfig = {
      ...config,
      deletedRolesJson: JSON.stringify(deletedRoles),
      [dbKey]: ''
    };
    autoSaveConfig(updatedConfig);
  };

  const handleRestoreStandardRoles = () => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      deletedRolesJson: '[]'
    };
    autoSaveConfig(updatedConfig);
  };

  const handleSyncDiscordRoles = () => {
    if (!config || !discordInfo?.roles) {
      if (ws && wsStatus === 'online') fetchDiscordInfo();
      return;
    }

    const standardRoleKeys = [
      'leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'recruiterRoleId',
      'mainRosterRoleId', 'trialRoleId', 'farmerRoleId', 'plantFarmerRoleId',
      'electricianRoleId', 'builderRoleId', 'pilotRoleId', 'sponsorRoleId', 'vipRoleId'
    ];
    const boundStandardIds = new Set(standardRoleKeys.map(k => config[k]).filter(Boolean));

    let customRoles = [];
    try {
      if (config.customRolesJson) {
        customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      }
    } catch (e) {}
    if (!Array.isArray(customRoles)) customRoles = [];

    const customRoleByRoleId = new Map();
    customRoles.forEach((cr, index) => {
      if (cr.roleId) customRoleByRoleId.set(cr.roleId, index);
    });

    let newRolesCount = 0;
    let updatedCount = 0;

    for (const dRole of discordInfo.roles) {
      if (boundStandardIds.has(dRole.id)) continue;

      if (customRoleByRoleId.has(dRole.id)) {
        const idx = customRoleByRoleId.get(dRole.id);
        if (customRoles[idx].name !== dRole.name) {
          customRoles[idx].name = dRole.name;
          updatedCount++;
        }
        if (dRole.color && customRoles[idx].color !== dRole.color) {
          customRoles[idx].color = dRole.color;
        }
      } else {
        const matchByNameIdx = customRoles.findIndex(cr => !cr.roleId && cr.name?.toLowerCase().trim() === dRole.name.toLowerCase().trim());
        if (matchByNameIdx !== -1) {
          customRoles[matchByNameIdx].roleId = dRole.id;
          customRoles[matchByNameIdx].name = dRole.name;
          if (dRole.color) customRoles[matchByNameIdx].color = dRole.color;
          customRoleByRoleId.set(dRole.id, matchByNameIdx);
          updatedCount++;
        } else {
          const newId = `custom_${dRole.id}`;
          customRoles.push({
            id: newId,
            key: newId,
            name: dRole.name,
            roleId: dRole.id,
            color: dRole.color || '#3b82f6'
          });
          customRoleByRoleId.set(dRole.id, customRoles.length - 1);
          newRolesCount++;
        }
      }
    }

    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(customRoles)
    };
    autoSaveConfig(updatedConfig, true);

    if (newRolesCount > 0 || updatedCount > 0) {
      addLog(`${t('log_roles_synced', 'Синхронизировано ролей с Discord: +')}${newRolesCount} ${t('log_roles_synced_new', 'новых, ')}${updatedCount} ${t('log_roles_synced_updated', 'обновлено')}`);
    } else {
      addLog(t('log_roles_all_synced', 'Все роли из Discord уже синхронизированы в кастомные роли'));
    }
  };

  const handleMoveRolesUp = () => {
    if (!ws || wsStatus !== 'online') return;
    setMovingRoles(true);
    addLog(t('log_roles_move_up', 'Перемещение созданных и клановых ролей вверх в Discord...'));
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'move_roles_up',
      payload: { action: 'move_roles_up' }
    }));
  };

  const handleExecuteFactoryReset = () => {
    if (!resetSections || resetSections.length === 0) return;
    if (!window.confirm(t('clan_reset_confirm_prompt') || 'Вы уверены, что хотите сбросить выбранные разделы к заводским настройкам?')) return;

    setIsResetting(true);
    addLog(`${t('log_reset_start', 'Запуск выборочного сброса к заводским настройкам: ')}${resetSections.join(', ')}`);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'factory_reset',
      payload: {
        action: 'factory_reset',
        sections: resetSections
      }
    }));
  };

  const fetchDynamicVoice = () => {
    setLoadingVoice(true);
    addLog('Fetching dynamic voice config via proxy');
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_dynamic_voice', 
      payload: { action: 'get_dynamic_voice' } 
    }));
  };

  const flushVoiceSave = () => {
    if (voiceSaveTimerRef.current) {
      clearTimeout(voiceSaveTimerRef.current);
      voiceSaveTimerRef.current = null;
    }

    const cfgToSend = pendingVoiceConfigRef.current || latestVoiceConfigRef.current;
    if (!cfgToSend || !ws || wsStatus !== 'online') return;

    pendingVoiceConfigRef.current = null;
    lastVoiceSaveTimeRef.current = Date.now();
    setSaveStatus('saving');

    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'update_dynamic_voice', 
      payload: {
        action: 'update_dynamic_voice',
        config: cfgToSend
      }
    }));
    addLog('Auto-saving dynamic voice config...');
  };

  const queueAutoSaveVoice = (newVoiceConfig, immediate = false) => {
    setDynamicVoiceData(prev => ({
      ...prev,
      config: newVoiceConfig
    }));
    latestVoiceConfigRef.current = newVoiceConfig;
    pendingVoiceConfigRef.current = newVoiceConfig;

    const now = Date.now();
    const timeSinceLastSave = now - lastVoiceSaveTimeRef.current;

    if (immediate) {
      if (timeSinceLastSave >= 1000) {
        flushVoiceSave();
      } else {
        if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
        const delay = Math.max(50, 1000 - timeSinceLastSave);
        voiceSaveTimerRef.current = setTimeout(() => {
          flushVoiceSave();
        }, delay);
      }
    } else {
      if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
      const delay = Math.max(1000, 1000 - timeSinceLastSave);
      voiceSaveTimerRef.current = setTimeout(() => {
        flushVoiceSave();
      }, delay);
    }
  };

  const saveDynamicVoiceConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    flushVoiceSave();
  };

  const handleAutoSetupDynamicVoice = () => {
    setVoiceActionLoading(true);
    addLog(t('log_auto_setup_voices', 'Запрос автоматической настройки динамических войсов...'));
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'auto_setup_dynamic_voice',
      payload: { action: 'auto_setup_dynamic_voice' }
    }));
  };

  const handleManageDynamicRoom = (subAction, channelId, options = {}) => {
    setVoiceActionLoading(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'manage_dynamic_room',
      payload: {
        action: 'manage_dynamic_room',
        subAction,
        channelId,
        ...options
      }
    }));
    addLog(`Manage dynamic room: ${subAction} on ${channelId}`);
  };

  const handleCreateDiscordLogChannel = () => {
    if (!ws || wsStatus !== 'online') return;
    setCreatingLogChannel(true);
    addLog(t('log_create_log_channel', 'Создание канала логов в Discord...'));
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_log_channel',
      payload: {
        action: 'create_log_channel',
        name: t('clan_default_log_channel_name', '📜・логи-сервера')
      }
    }));
  };

  const fetchApplications = () => {
    if (!ws || wsStatus !== 'online') return;
    setLoadingApps(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'get_applications',
      payload: { action: 'get_applications', limit: 100 }
    }));
  };

  const handleClearApplications = () => {
    if (!ws || wsStatus !== 'online') return;
    if (!window.confirm(t('clan_recruitment_apps_clear_confirm') || 'Вы действительно хотите полностью очистить весь журнал заявок в клан? Все записи будут безвозвратно удалены.')) return;
    setLoadingApps(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'clear_applications',
      payload: { action: 'clear_applications' }
    }));
  };

  const handleViewTranscript = (app) => {
    if (!ws || wsStatus !== 'online' || !app) return;
    setTranscriptModal({
      isOpen: true,
      loading: true,
      html: null,
      app: app,
      error: null
    });
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'get_ticket_transcript',
      payload: {
        action: 'get_ticket_transcript',
        applicationId: app.id,
        channelId: app.channelId
      }
    }));
  };

  const openExternalUrl = (url) => {
    if (!url) return;
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const getSteamProfileUrl = (steamId) => {
    if (!steamId) return null;
    const raw = String(steamId).trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (/^\d{17}$/.test(raw)) return `https://steamcommunity.com/profiles/${raw}`;
    if (/^[a-zA-Z0-9_-]+$/.test(raw)) return `https://steamcommunity.com/id/${raw}`;
    return `https://steamcommunity.com/profiles/${raw}`;
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') return;
    if (activeTab === 'general' && config?.discordLink) {
      if (config.discordLink.trim() && config.discordLink.trim() !== lastVerifiedLinkRef.current) {
        verifyInvite(config.discordLink);
      }
    } else if (activeTab === 'recruitment') {
      fetchApplications();
      if (config?.recruitmentConfigJson) {
        try {
          const rc = JSON.parse(config.recruitmentConfigJson);
          const linkToCheck = rc.link || config.discordLink;
          if (linkToCheck) verifyRecruitmentInvite(linkToCheck);
        } catch (e) {}
      } else if (config?.discordLink) {
        verifyRecruitmentInvite(config.discordLink);
      }
      if (!rosterData) {
        ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_roster', payload: { action: 'get_roster' } }));
      }
    } else if (activeTab === 'dossier') {
      fetchDossiers(dossierFilter, dossierSearch);
    } else if (activeTab === 'roster' && !rosterData) {
      addLog('Fetching roster via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_roster', payload: { action: 'get_roster' } }));
    } else if (activeTab === 'stats' && !statsData) {
      addLog('Fetching stats via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
    } else if (activeTab === 'voice' && !dynamicVoiceData) {
      fetchDynamicVoice();
    } else if (activeTab === 'moderation') {
      if (!discordInfo) fetchDiscordInfo();
      fetchClanWarnings();
    } else if ((activeTab === 'roles' || activeTab === 'channels' || activeTab === 'permissions' || activeTab === 'logs' || activeTab === 'recruitment' || activeTab === 'votes' || activeTab === 'ads') && !discordInfo) {
      fetchDiscordInfo();
    }
  }, [activeTab, ws, wsStatus, rosterData, statsData, discordInfo, dynamicVoiceData, config?.discordLink]);

  const DebugLogs = () => (
    <div className="mt-8 bg-slate-900 text-green-400 p-4 rounded-xl shadow-inner text-xs font-mono max-h-64 overflow-y-auto border border-slate-800">
      <div className="mb-2 font-bold text-white border-b border-slate-700 pb-2 flex items-center justify-between">
        <span>Debug Logs</span>
        <span className="text-[10px] text-slate-500 font-normal">Auto-scrolling</span>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="opacity-90">{log}</div>
        ))}
      </div>
    </div>
  );

  if (status === 'checking') {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <div className="text-slate-700 dark:text-slate-300 font-medium text-sm">{t('clan_connecting')}</div>
        </div>
        <RosterSkeleton count={6} columns="grid-cols-1 md:grid-cols-2" />
        <DebugLogs />
      </div>
    );
  }

  if (status === 'unlinked') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            {t('clan_setup_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {t('clan_setup_desc')}
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">1</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">{t('clan_setup_step1')}</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">2</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">
                {t('clan_setup_step2').split('/hub_link').map((part, i, arr) => 
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono text-sm mx-1">/hub_link</code>}
                  </React.Fragment>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">3</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">{t('clan_setup_step3')}</div>
            </div>
          </div>
          
          <form onSubmit={handleLink} noValidate className="space-y-4">
            <div>
              <input 
                type="text" 
                required
                placeholder={t('clan_setup_placeholder')} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-[0.5em] font-mono shadow-inner transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans placeholder:text-base dark:placeholder:text-slate-600"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
                maxLength={6}
              />
            </div>
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm">
              {t('clan_setup_btn')}
            </button>
          </form>
        </div>
        <DebugLogs />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: t('clan_tab_general', 'Основное'), icon: Settings },
    { id: 'roles', label: t('clan_tab_roles', 'Роли'), icon: Users },
    { id: 'channels', label: t('clan_tab_channels', 'Каналы'), icon: Hash },
    { id: 'recruitment', label: t('clan_tab_recruitment', 'Наборы'), icon: UserPlus },
    { id: 'votes', label: t('clan_tab_votes', 'Голосования'), icon: Vote },
    { id: 'logs', label: t('clan_tab_logs') || 'Логирование', icon: ScrollText },
    { id: 'moderation', label: t('clan_tab_moderation') || 'Модерация', icon: ShieldAlert },
    { id: 'permissions', label: t('clan_tab_permissions', 'Права Доступа'), icon: ShieldCheck },
    { id: 'roster', label: t('clan_tab_roster', 'Состав'), icon: UserCheck },
    { id: 'dossier', label: t('clan_tab_archive') || 'Архив', icon: Archive },
    { id: 'stats', label: t('clan_tab_stats', 'Статистика'), icon: BarChart3 },
    { id: 'ads', label: t('clan_tab_ads', 'Реклама'), icon: Megaphone },
    { id: 'voice', label: t('clan_tab_voice') || 'Динамические войсы', icon: Volume2 },
  ];

  const botSearchIndex = [
    // General
    {
      id: 'clan_name',
      tabId: 'general',
      tabName: t('clan_tab_general') || 'Основное',
      tabIcon: Settings,
      title: t('clan_name_label') || 'Название клана',
      desc: t('sidx_clan_name_desc', 'Отображение названия клана в эмбедах, логах, карточках и приветствиях бота'),
      keywords: ['название', 'имя', 'клан', 'тег', 'name', 'clan', 'title', 'tag']
    },
    {
      id: 'recruitment_open',
      tabId: 'general',
      tabName: t('clan_tab_general') || 'Основное',
      tabIcon: Settings,
      title: t('clan_recruitment_open_title') || 'Набор в клан открыт',
      desc: t('sidx_recruitment_open_desc', 'Быстрый переключатель статуса приема новых заявок в клан'),
      keywords: ['набор', 'статус', 'прием', 'открыт', 'закрыт', 'recruitment', 'open', 'status']
    },
    {
      id: 'discord_link',
      tabId: 'general',
      tabName: t('clan_tab_general') || 'Основное',
      tabIcon: Settings,
      title: t('clan_discord_link_title') || 'Ссылка-приглашение Discord',
      desc: t('sidx_invite_url_desc', 'Постоянная ссылка для приглашения участников на Discord сервер клана'),
      keywords: ['инвайт', 'ссылка', 'дискорд', 'приглашение', 'invite', 'discord', 'url', 'link']
    },
    {
      id: 'setup_wizard',
      tabId: 'general',
      tabName: t('clan_tab_general') || 'Основное',
      tabIcon: Settings,
      title: t('sidx_setup_wizard_title', 'Мастер быстрой настройки (Setup Wizard)'),
      desc: t('sidx_setup_wizard_desc', 'Пошаговый мастер первичной привязки обязательных ролей и каналов'),
      keywords: ['мастер', 'визард', 'настройка', 'быстрая', 'wizard', 'setup', 'помощник', 'автонастройка']
    },
    {
      id: 'reset_config',
      tabId: 'general',
      tabName: t('clan_tab_general') || 'Основное',
      tabIcon: Settings,
      title: t('sidx_reset_bot_title', 'Сброс настроек бота'),
      desc: t('sidx_reset_bot_desc', 'Выборочный или полный сброс сохраненной конфигурации бота'),
      keywords: ['сброс', 'очистить', 'удалить', 'reset', 'clear', 'default']
    },

    // Roles
    {
      id: 'role_leader',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_leader_title', 'Роль: Лидер клана (Leader)'),
      desc: t('sidx_role_leader_desc', 'Главная административная роль главы клана с максимальными правами и иммунитетом'),
      keywords: ['лидер', 'глава', 'leader', 'основатель', 'роль', 'главный', 'руководитель']
    },
    {
      id: 'role_deputy',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_deputy_title', 'Роль: Заместитель лидера (Deputy Leader)'),
      desc: t('sidx_role_deputy_desc', 'Роль соруководителя и правой руки лидера клана'),
      keywords: ['заместитель', 'зам', 'deputy', 'соруководитель', 'помощник']
    },
    {
      id: 'role_caller',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_caller_title', 'Роль: Коллер (Coller / Caller)'),
      desc: t('sidx_role_caller_desc', 'Командующий рейдами, тактическими операциями и боевыми вылазками'),
      keywords: ['коллер', 'рейд', 'caller', 'coller', 'координатор', 'тактик']
    },
    {
      id: 'role_main_roster',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_main_title', 'Роль: Основной состав (Main Roster)'),
      desc: t('sidx_role_main_desc', 'Полноправные и постоянные участники клана'),
      keywords: ['состав', 'основа', 'основной', 'main', 'roster', 'мембер']
    },
    {
      id: 'role_trial',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_trial_title', 'Роль: Испытательный срок / Новобранец (Trial)'),
      desc: t('sidx_role_trial_desc', 'Временный статус для новичков, недавно принятых в клан'),
      keywords: ['новобранец', 'испытательный', 'триал', 'новичок', 'trial', 'recruit']
    },
    {
      id: 'role_farmer',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_farmer_title', 'Роль: Фармер ресурсов (Miner / Farmer)'),
      desc: t('sidx_role_farmer_desc', 'Добытчик серы, камня, металла и древесины'),
      keywords: ['фармер', 'руда', 'сера', 'камень', 'дерево', 'miner', 'farmer', 'ресурсы']
    },
    {
      id: 'role_plant_farmer',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('sidx_role_plant_title', 'Роль: Фермер урожая (Farmer Crops/Plants)'),
      desc: t('sidx_role_plant_desc', 'Специалист по фермам конопли, ягод, клонированию и чаю'),
      keywords: ['фермер', 'трава', 'конопля', 'ягоды', 'чай', 'урожай', 'растения', 'клоны', 'plant']
    },
    {
      id: 'role_electrician',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_117', 'Роль: Электрик / Промышленник (Electrician)'),
      desc: t('clan_auto_171', 'Инженер по автоматизации, конвейерам и электросхемам'),
      keywords: ['электрик', 'электрика', 'схемы', 'конвейер', 'инженер', 'electrician']
    },
    {
      id: 'role_builder',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_118', 'Роль: Строитель / Билдер (Builder)'),
      desc: t('clan_auto_172', 'Проектировщик клановых баз, бункеров и турельных вышек'),
      keywords: ['строитель', 'билдер', 'база', 'бункер', 'постройка', 'builder']
    },
    {
      id: 'role_pilot',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_119', 'Роль: Пилот (Pilot)'),
      desc: t('clan_auto_173', 'Управление коптерами, транспортировка команды и лута'),
      keywords: ['пилот', 'коптер', 'вертолет', 'полеты', 'pilot']
    },
    {
      id: 'role_sponsor',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_120', 'Роль: Спонсор (Sponsor)'),
      desc: t('clan_auto_174', 'Участники, поддерживающие развитие клана и клановые ресурсы'),
      keywords: ['спонсор', 'донат', 'поддержка', 'sponsor', 'vip']
    },
    {
      id: 'role_vip',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_121', 'Роль: VIP участник'),
      desc: t('clan_auto_175', 'Особый статус привилегированного участника сервера'),
      keywords: ['вип', 'vip', 'привилегия', 'особый']
    },
    {
      id: 'role_templates',
      tabId: 'roles',
      tabName: t('clan_tab_roles', 'Роли'),
      tabIcon: Users,
      title: t('clan_auto_122', 'Шаблоны ролей и создание в Discord'),
      desc: t('clan_auto_176', 'Автоматическое создание недостающих ролей с готовыми цветами и правами'),
      keywords: ['создать роль', 'шаблон', 'автосоздание', 'цвет', 'create role', 'template']
    },

    // Channels
    {
      id: 'channel_tickets_category',
      tabId: 'channels',
      tabName: t('clan_auto_236', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_123', 'Категория для тикетов заявок'),
      desc: t('clan_auto_177', 'Discord категория, в которой бот автоматически создает приватные каналы тикетов'),
      keywords: ['тикеты', 'категория', 'заявки', 'tickets', 'category', 'приватные']
    },
    {
      id: 'channel_logs',
      tabId: 'channels',
      tabName: t('clan_auto_237', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_124', 'Канал системных логов и аудита'),
      desc: t('clan_auto_178', 'Канал для отправки всех событий сервера, модерации и клана'),
      keywords: ['логи', 'аудит', 'журнал', 'logs', 'audit', 'события', 'канал логов']
    },
    {
      id: 'channel_applications',
      tabId: 'channels',
      tabName: t('clan_auto_238', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_125', 'Канал входящих анкет кандидатов'),
      desc: t('clan_auto_179', 'Канал, куда бот присылает новые анкеты кандидатов'),
      keywords: ['анкеты', 'заявки', 'кандидаты', 'applications', 'форма']
    },
    {
      id: 'channel_auto_rejected',
      tabId: 'channels',
      tabName: t('clan_auto_239', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_126', 'Канал скрытых авто-отказов (Silent Reject)'),
      desc: t('clan_auto_180', 'Лог отклоненных заявок при включенном режиме тихого отказа'),
      keywords: ['автоотказ', 'скрытый', 'отклонено', 'auto rejected', 'тихий отказ']
    },
    {
      id: 'channel_rejected',
      tabId: 'channels',
      tabName: t('clan_auto_240', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_127', 'Канал отклоненных заявок'),
      desc: t('clan_auto_181', 'Архив всех отклоненных анкет с указанием причины отказа'),
      keywords: ['отклоненные', 'отказ', 'rejected', 'архив заявок']
    },
    {
      id: 'channel_transcripts',
      tabId: 'channels',
      tabName: t('clan_auto_241', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_128', 'Канал HTML-транскриптов тикетов'),
      desc: t('clan_auto_182', 'Куда бот отправляет интерактивные HTML-истории закрытых тикетов'),
      keywords: ['транскрипт', 'история тикета', 'html', 'transcripts', 'архив тикетов']
    },
    {
      id: 'channel_leaderboard',
      tabId: 'channels',
      tabName: t('clan_auto_242', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_129', 'Канал таблицы лидеров клана'),
      desc: t('clan_auto_183', 'Канал для автоматической публикации топа активности бойцов'),
      keywords: ['таблица лидеров', 'топ', 'рейтинг', 'лидерборд', 'leaderboard', 'активность']
    },
    {
      id: 'channel_news',
      tabId: 'channels',
      tabName: t('clan_auto_243', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_130', 'Канал новостей клана'),
      desc: t('clan_auto_184', 'Канал для публикации важных клановых объявлений и новостей'),
      keywords: ['новости', 'объявления', 'анонсы', 'news', 'инфо']
    },
    {
      id: 'channel_votes',
      tabId: 'channels',
      tabName: t('clan_auto_244', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_131', 'Канал клановых голосований'),
      desc: t('clan_auto_185', 'Канал для проведения голосований и принятия коллективных решений'),
      keywords: ['голосование', 'опрос', 'выборы', 'votes', 'poll']
    },
    {
      id: 'channel_ads',
      tabId: 'channels',
      tabName: t('clan_auto_245', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_132', 'Канал рекламы и серверов'),
      desc: t('clan_auto_186', 'Канал для публикации анонсов вайпов серверов и рекламы'),
      keywords: [t('clan_default_ads_ch', 'реклама'), 'анонсы', 'вайп', 'ads', 'промо']
    },
    {
      id: 'channel_roster',
      tabId: 'channels',
      tabName: t('clan_auto_246', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_133', 'Канал состава клана (Roster)'),
      desc: t('clan_auto_187', 'Канал с авто-обновляемым эмбедом всех бойцов и их ролей'),
      keywords: ['состав', 'ростер', 'список бойцов', 'roster', 'мемберы']
    },
    {
      id: 'channel_waiting_room',
      tabId: 'channels',
      tabName: t('clan_auto_247', 'Каналы'),
      tabIcon: Hash,
      title: t('clan_auto_134', 'Комната ожидания собеседования (Waiting Room)'),
      desc: t('clan_auto_188', 'Голосовой канал, в котором кандидаты ожидают офицеров'),
      keywords: ['комната ожидания', 'ожидание', 'собеседование', 'waiting room', 'интервью']
    },

    // Recruitment
    {
      id: 'recruitment_min_age',
      tabId: 'recruitment',
      tabName: t('clan_auto_248', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_135', 'Минимальный возраст кандидата'),
      desc: t('clan_auto_189', 'Автоматическая проверка возраста кандидата по анкете с авто-отклонением'),
      keywords: ['возраст', 'лет', 'минимальный возраст', 'age', 'min age', 'критерии']
    },
    {
      id: 'recruitment_min_hours',
      tabId: 'recruitment',
      tabName: t('clan_auto_249', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_136', 'Минимальные часы в Rust'),
      desc: t('clan_auto_190', 'Порог часов в игре, авто-суммирование со всех указанных профилей Steam'),
      keywords: ['часы', 'опыт', 'наиграно', 'hours', 'min hours', 'раст', 'rust hours']
    },
    {
      id: 'recruitment_silent_reject',
      tabId: 'recruitment',
      tabName: t('clan_auto_250', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_137', 'Тихий авто-отказ (Silent Auto-Reject)'),
      desc: t('clan_auto_191', 'Не создавать тикет при отказе по критериям, отправляя карточку офицерам в лог'),
      keywords: ['тихий отказ', 'скрытый отказ', 'silent reject', 'автоотказ', 'тикет']
    },
    {
      id: 'recruitment_steam_check',
      tabId: 'recruitment',
      tabName: t('clan_auto_251', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_138', 'Проверка Steam API и VAC-банов'),
      desc: t('clan_auto_192', 'Автоматическая валидация профилей кандидатов через Steam Web API'),
      keywords: ['стим', 'steam', 'vac', 'бан', 'вак', 'блокировка', 'steamid']
    },
    {
      id: 'recruitment_battlemetrics',
      tabId: 'recruitment',
      tabName: t('clan_auto_252', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_139', 'Интеграция с Battlemetrics'),
      desc: t('clan_auto_193', 'Проверка активности игрока на серверах Rust через Battlemetrics API'),
      keywords: ['баттлметрикс', 'батлметрикс', 'battlemetrics', 'сервера', 'bm']
    },
    {
      id: 'recruitment_vac_days',
      tabId: 'recruitment',
      tabName: t('clan_auto_253', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_140', 'Максимум дней с последнего VAC-бана'),
      desc: t('clan_auto_194', 'Порог давности игровых блокировок Steam для допуска кандидатов'),
      keywords: ['vac дни', 'дней с бана', 'давность бана', 'читер', 'vac days']
    },

    // Permissions
    {
      id: 'perm_roster',
      tabId: 'permissions',
      tabName: t('clan_auto_254', 'Права Доступа'),
      tabIcon: ShieldCheck,
      title: t('clan_auto_141', 'Права: Просмотр состава клана'),
      desc: t('clan_auto_195', 'Настройка ролей, которым разрешен просмотр закрытого списка бойцов'),
      keywords: ['права состав', 'доступ', 'permissions', 'roster perm']
    },
    {
      id: 'perm_votes',
      tabId: 'permissions',
      tabName: t('clan_auto_255', 'Права Доступа'),
      tabIcon: ShieldCheck,
      title: t('clan_auto_142', 'Права: Запуск голосований'),
      desc: t('clan_auto_196', 'Роли, имеющие право инициировать новые опросы и голосования'),
      keywords: ['права голосование', 'создание опросов', 'poll perm', 'vote perm']
    },
    {
      id: 'perm_ads',
      tabId: 'permissions',
      tabName: t('clan_auto_256', 'Права Доступа'),
      tabIcon: ShieldCheck,
      title: t('clan_auto_143', 'Права: Рассылка рекламы'),
      desc: t('clan_auto_197', 'Роли, которым разрешено отправлять и настраивать рекламные анонсы'),
      keywords: ['права реклама', 'анонсы', 'ads perm']
    },
    {
      id: 'perm_voice',
      tabId: 'permissions',
      tabName: t('clan_auto_257', 'Права Доступа'),
      tabIcon: ShieldCheck,
      title: t('clan_auto_144', 'Права: Управление войсами'),
      desc: t('clan_auto_198', 'Права на блокировку, переименование и кик из комнат динамических войсов'),
      keywords: ['права войс', 'управление комнатой', 'voice perm']
    },
    {
      id: 'perm_moderation',
      tabId: 'permissions',
      tabName: t('clan_auto_258', 'Права Доступа'),
      tabIcon: ShieldCheck,
      title: t('clan_auto_145', 'Права: Выдача варнов и модерация'),
      desc: t('clan_auto_199', 'Роли, уполномоченные выдавать предупреждения и модерировать участников'),
      keywords: ['права модерация', 'варны', 'наказания', 'warn perm']
    },

    // Roster
    {
      id: 'roster_view',
      tabId: 'roster',
      tabName: t('clan_auto_259', 'Состав'),
      tabIcon: UserCheck,
      title: t('clan_auto_146', 'Состав клана и управление бойцами'),
      desc: t('clan_auto_200', 'Таблица участников клана с указанием Discord-ролей и никнеймов'),
      keywords: ['состав', 'список', 'участники', 'бойцы', 'ростер', 'roster']
    },
    {
      id: 'roster_sync_btn',
      tabId: 'roster',
      tabName: t('clan_auto_260', 'Состав'),
      tabIcon: UserCheck,
      title: t('clan_auto_147', 'Синхронизация состава с сервером Discord'),
      desc: t('clan_auto_201', 'Принудительное обновление актуального списка участников клана'),
      keywords: ['синхронизация', 'обновить', 'sync', 'roster sync']
    },

    // Dossier
    {
      id: 'dossier_members',
      tabId: 'dossier',
      tabName: t('clan_tab_archive') || 'Архив',
      tabIcon: Archive,
      title: t('clan_auto_148', 'Архив и личные карточки бойцов'),
      desc: t('clan_auto_202', 'Персональные карточки бойцов с историей, заметками офицеров и статусом'),
      keywords: ['досье', 'карточка', 'заметки', 'характеристика', 'dossier', 'боец', 'архив']
    },
    {
      id: 'dossier_blacklist',
      tabId: 'dossier',
      tabName: t('clan_tab_archive') || 'Архив',
      tabIcon: Archive,
      title: t('clan_auto_149', 'Черный список игроков (Blacklist)'),
      desc: t('clan_auto_203', 'Внесение недобросовестных игроков, читеров или нарушителей в клановый бан-лист'),
      keywords: ['черный список', 'чс', 'банлист', 'предатели', 'blacklist']
    },

    // Stats
    {
      id: 'stats_voice_time',
      tabId: 'stats',
      tabName: t('clan_auto_261', 'Статистика'),
      tabIcon: BarChart3,
      title: t('clan_auto_150', 'Голосовая активность участников (Voice Time)'),
      desc: t('clan_auto_204', 'Счетчик времени участников в голосовых каналах Discord'),
      keywords: ['войс статистика', 'время в войсе', 'онлайн', 'voice time', 'стата']
    },
    {
      id: 'stats_messages_count',
      tabId: 'stats',
      tabName: t('clan_auto_262', 'Статистика'),
      tabIcon: BarChart3,
      title: t('clan_auto_151', 'Текстовая активность (Сообщения)'),
      desc: t('clan_auto_205', 'Количество сообщений, отправленных каждым участником на сервере'),
      keywords: ['сообщения', 'активность чата', 'текст', 'messages', 'chat']
    },
    {
      id: 'stats_warns_status',
      tabId: 'stats',
      tabName: t('clan_auto_263', 'Статистика'),
      tabIcon: BarChart3,
      title: t('clan_auto_152', 'Статус предупреждений (Варны в статистике)'),
      desc: t('clan_auto_206', 'Быстрый просмотр и управление варнами конкретного участника из таблицы'),
      keywords: ['варны в статистике', 'просмотр варнов', 'warn modal']
    },

    // Moderation
    {
      id: 'mod_warn_system',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_153', 'Клановая система предупреждений (Clan Warnings)'),
      desc: t('clan_auto_207', 'Выдача, снятие и прозрачный журнал варнов с фиксацией модератора'),
      keywords: ['варн', 'предупреждение', 'warn', 'система варнов', 'наказание', 'штраф']
    },
    {
      id: 'mod_warn_limit_val',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_154', 'Порог предупреждений до наказания (3, 4 или 5)'),
      desc: t('clan_auto_208', 'Количество варнов, при достижении которого бот автоматически наказывает нарушителя'),
      keywords: ['порог варнов', 'лимит', '3 варна', 'threshold', 'warn limit']
    },
    {
      id: 'mod_auto_action',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_155', 'Автоматическое наказание (Таймаут, Кик, Бан)'),
      desc: t('clan_auto_209', 'Выбор санкции при превышении лимита варнов: Таймаут (1ч, 1д, 1нед), Кик или Бан'),
      keywords: ['таймаут', 'кик', 'бан', 'действие', 'action', 'timeout', 'kick', 'ban']
    },
    {
      id: 'mod_bad_words_list',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_156', 'Черный список слов (Bad Words Blacklist)'),
      desc: t('clan_auto_210', 'Автоматическое удаление нецензурной лексики, оскорблений и запрещенных фраз'),
      keywords: ['мат', 'слова', 'запрещенные слова', 'фильтр мата', 'черный список', 'bad words', 'цензура']
    },
    {
      id: 'mod_anti_mention_prot',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_157', 'Защита от спама упоминаниями (Anti-Mention)'),
      desc: t('clan_auto_211', 'Предотвращение массового спама @everyone, @here и пинга ролей'),
      keywords: ['упоминания', 'спам', 'анти-спам', 'everyone', 'here', 'anti mention', 'пинг']
    },
    {
      id: 'mod_exempt_roles_list',
      tabId: 'moderation',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_158', 'Белый список исключений из модерации (Exempt)'),
      desc: t('clan_auto_212', 'Роли, на которые не распространяются автоматические фильтры и санкции'),
      keywords: ['белый список', 'исключения', 'иммунитет', 'exempt', 'whitelist']
    },

    // Logs
    {
      id: 'logs_mod_events',
      tabId: 'logs',
      tabName: t('clan_tab_logs') || 'Логирование',
      tabIcon: ScrollText,
      title: t('clan_auto_159', 'Логи модерации и наказаний'),
      desc: t('clan_auto_213', 'Аудит выдачи варнов, таймаутов, мутов, киков и банов'),
      keywords: ['логи модерации', 'журнал наказаний', 'warn logs']
    },
    {
      id: 'logs_voice_events',
      tabId: 'logs',
      tabName: t('clan_tab_logs') || 'Логирование',
      tabIcon: ScrollText,
      title: t('clan_auto_160', 'Логи голосовых каналов'),
      desc: t('clan_auto_214', 'Отслеживание подключений, выходов, перемещений и серверных мутов'),
      keywords: ['логи войса', 'кто заходил', 'voice logs']
    },
    {
      id: 'logs_message_events',
      tabId: 'logs',
      tabName: t('clan_tab_logs') || 'Логирование',
      tabIcon: ScrollText,
      title: t('clan_auto_161', 'Логи сообщений'),
      desc: t('clan_auto_215', 'Запись удаленных и отредактированных сообщений на сервере'),
      keywords: ['логи сообщений', 'удаленные сообщения', 'message logs']
    },
    {
      id: 'logs_antiraid_events',
      tabId: 'logs',
      tabName: t('clan_tab_logs') || 'Логирование',
      tabIcon: ScrollText,
      title: t('clan_auto_162', 'Anti-Raid мониторинг'),
      desc: t('clan_auto_216', 'Оповещения при подозрительных массовых входах и рейдах на Discord сервер'),
      keywords: ['антирейд', 'рейд', 'anti-raid', 'атака', 'защита']
    },

    // Dynamic Voice
    {
      id: 'voice_master_channel',
      tabId: 'voice',
      tabName: t('clan_tab_voice') || 'Динамические войсы',
      tabIcon: Volume2,
      title: t('clan_auto_163', 'Мастер-канал создания войсов («Нажми для создания»)'),
      desc: t('clan_auto_217', 'Голосовой канал, при заходе в который бот мгновенно создает новую комнату'),
      keywords: ['динамические войсы', 'создание войса', 'нажми для создания', 'voice create', 'комната']
    },
    {
      id: 'voice_room_limits',
      tabId: 'voice',
      tabName: t('clan_tab_voice') || 'Динамические войсы',
      tabIcon: Volume2,
      title: t('clan_auto_164', 'Настройка лимита участников комнат'),
      desc: t('clan_auto_218', 'Установка ограничения слотов пользователей для динамических каналов'),
      keywords: ['лимит войса', 'ограничение людей', 'слоты', 'room limit']
    },
    {
      id: 'voice_active_rooms',
      tabId: 'voice',
      tabName: t('clan_tab_voice') || 'Динамические войсы',
      tabIcon: Volume2,
      title: t('clan_auto_165', 'Активные голосовые комнаты'),
      desc: t('clan_auto_219', 'Управление текущими комнатами: мут, кик, переименование, закрытие'),
      keywords: ['активные комнаты', 'управление войсом', 'кикнуть из войса', 'lock room']
    },

    // Ads
    {
      id: 'ads_publication',
      tabId: 'ads',
      tabName: t('clan_auto_264', 'Реклама'),
      tabIcon: Megaphone,
      title: t('clan_auto_166', 'Автоматическая публикация рекламы'),
      desc: t('clan_auto_220', 'Периодическая рассылка анонсов вайпов серверов и наборов в клан'),
      keywords: [t('clan_default_ads_ch', 'реклама'), 'авторассылка', 'анонсы', 'ads', 'промо']
    },

    // Votes
    {
      id: 'votes_manager',
      tabId: 'votes',
      tabName: t('clan_auto_265', 'Голосования'),
      tabIcon: Vote,
      title: t('clan_auto_167', 'Клановые голосования и опросы'),
      desc: t('clan_auto_221', 'Создание голосований с таймерами и автоматическим подведением итогов'),
      keywords: ['голосование', 'опрос', 'выборы', 'votes', 'poll']
    }
  ];

  const filteredBotSettings = !botSearchQuery.trim()
    ? botSearchIndex
    : botSearchIndex
        .map(item => ({ item, score: getBotSettingSearchScore(item, botSearchQuery) }))
        .filter(x => x.score >= 20)
        .sort((a, b) => b.score - a.score)
        .map(x => x.item);


  const getLivePreviewData = () => {
    if (!config) return null;
    let cConfig = {};
    try {
      if (config.channelsConfigJson) {
        cConfig = JSON.parse(config.channelsConfigJson);
      }
    } catch (e) {}

    if (activeTab === 'recruitment') {
      let rConfig = {
        link: config?.discordLink || '',
        banner: 'https://i.imgur.com/UaMfYMK.png',
        title: config?.name ? `Набор в клан ${config.name}` : t('clan_rec_base', 'Набор в клан'),
        text: t('clan_auto_v2_1022', 'Требования:\n\n**MAIN**\nВозраст: 20+\nЧасы: 5000+\nТребования: 8+ часов онлайна\nНавыки: Желательна универсальность\n\n**Билдер:**\nВозраст: 18+\nЧасы: 3000+\nТребования: 6+ часов онлайна\nНавыки: Умение быстро строить кастомные базы'),
        customLeaderId: ''
      };
      try {
        if (config.recruitmentConfigJson) {
          rConfig = { ...rConfig, ...JSON.parse(config.recruitmentConfigJson) };
        }
      } catch (e) {}

      if (config?.name) {
        if (!rConfig.title || rConfig.title === t('clan_rec_gods', 'Набор в клан GODS') || rConfig.title === t('clan_rec_base', 'Набор в клан')) {
          rConfig.title = `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}`;
        } else if (rConfig.title.includes('GODS')) {
          rConfig.title = rConfig.title.replace(/\bGODS\b/g, config.name);
        }
      }

      const inviteLink = rConfig.link || config?.discordLink || 'https://discord.gg/clan';
      const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
      const firstLeader = leaders[0];
      const leaderDisplay = rConfig.customLeaderId 
        ? `<@${rConfig.customLeaderId}>` 
        : (firstLeader ? `@${firstLeader.displayName || firstLeader.username}` : `@${t('clan_role_leader', 'Лидер')}`);

      const appChannel = discordInfo?.channels?.find(c => c.id === cConfig.applications);
      const channelName = appChannel ? appChannel.name : t('clan_default_rec_ch', 'набор-в-клан');

      return {
        tabTitle: t('clan_auto_v2_1018', t('clan_rec_base', 'Набор в клан')),
        channelName,
        embed: {
          title: `${t('clan_ds_link_prefix', 'ССЫЛКА НА ДС ->')} ${inviteLink}`,
          color: '#5865f2',
          description: `\`\`\`ansi\n${rConfig.title || t('clan_rec_base', 'Набор в клан')}\n\n${rConfig.text || 'Требования...'}\n\`\`\`\n# Лидер: ${leaderDisplay}`,
          banner: rConfig.banner
        },
        buttons: [
          { label: t('clan_auto_v2_1001', 'Подать заявку'), emoji: '📝', style: 'success' }
        ]
      };
    }

    if (activeTab === 'votes') {
      let wTemplates = [];
      try {
        if (config.wipeTemplatesJson) {
          wTemplates = JSON.parse(config.wipeTemplatesJson);
        }
      } catch (e) {}

      const voteChannel = discordInfo?.channels?.find(c => c.id === cConfig.votes);
      const channelName = voteChannel ? voteChannel.name : t('clan_default_vote_ch', 'голосования');

      const safeIdx = Math.min(previewVoteIndex, Math.max(0, wTemplates.length - 1));
      const activeTpl = wTemplates[safeIdx] || { 
        name: 'Rust Server #1', 
        day: t('clan_auto_231', t('clan_thursday', 'Четверг')), 
        time: '16:00', 
        ip: 'connect 127.0.0.1:28015', 
        banner: '' 
      };

      return {
        tabTitle: t('clan_auto_v2_1019', 'Голосование за вайп'),
        channelName,
        templates: wTemplates,
        activeTemplateIndex: safeIdx,
        embed: {
          title: `🔥 ВАЙП | ${activeTpl.name || t('clan_srv_default', 'Сервер')}`,
          color: '#e67e22',
          description: `**Сервер:** ${activeTpl.name || t('clan_tba', 'TBA')}\n**День:** ${activeTpl.day || t('clan_thursday', 'Четверг')}\n**Время:** ${activeTpl.time || '16:00'}\n**Подключение (IP):** \`${activeTpl.ip || 'connect 127.0.0.1:28015'}\`\n\nОтметьтесь, пожалуйста, о вашем присутствии на вайпе!`,
          banner: activeTpl.banner,
          fields: [
            { name: t('clan_poll_opt_on_time', '🟢 Буду вовремя'), value: t('clan_poll_votes_zero', '0 голосов'), inline: true },
            { name: t('clan_poll_opt_late', '🟡 Опоздаю'), value: t('clan_poll_votes_zero', '0 голосов'), inline: true },
            { name: t('clan_poll_opt_tomorrow', '🟠 Завтра'), value: t('clan_poll_votes_zero', '0 голосов'), inline: true },
            { name: t('clan_poll_opt_absent', '🔴 Не буду'), value: t('clan_poll_votes_zero', '0 голосов'), inline: true }
          ],
          footer: t('clan_auto_v2_1021', 'Голосование за вайп')
        },
        buttons: [
          { label: t('clan_auto_v2_1002', 'Буду вовремя'), emoji: '🟢', style: 'success' },
          { label: t('clan_auto_v2_1003', 'Опоздаю'), emoji: '🟡', style: 'primary' },
          { label: t('clan_auto_v2_1004', 'Завтра'), emoji: '🟠', style: 'secondary' },
          { label: t('clan_auto_v2_1005', 'Не буду'), emoji: '🔴', style: 'danger' }
        ]
      };
    }

    if (activeTab === 'ads') {
      let aConfig = {
        title: t('clan_auto_168', t('clan_ads_buy', 'Покупка рекламы')),
        text: t('clan_auto_229', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
        banner: 'https://i.imgur.com/example.png',
        priceLink: 'https://telegra.ph/price',
      };
      try {
        if (config.adConfigJson) {
          aConfig = { ...aConfig, ...JSON.parse(config.adConfigJson) };
        }
      } catch (e) {}

      const adsChannel = discordInfo?.channels?.find(c => c.id === cConfig.ads);
      const channelName = adsChannel ? adsChannel.name : t('clan_default_ads_ch', 'реклама');

      return {
        tabTitle: t('clan_auto_v2_1020', 'Панель рекламы'),
        channelName,
        embed: {
          title: aConfig.title || t('clan_ads_buy', 'Покупка рекламы'),
          color: '#2ecc71',
          description: aConfig.text ? `**${aConfig.text}**` : `**${t('clan_ads_default_text', 'Размещение рекламы/партнерства на платных/взаимных условиях, актуальная информация по кнопкам ниже.')}**`,
          banner: aConfig.banner
        },
        buttons: [
          { label: t('clan_auto_v2_1006', 'Заказать рекламу'), emoji: '📢', style: 'primary' },
          { label: t('clan_auto_v2_1007', 'Заключить партнерство'), emoji: '🤝', style: 'primary' },
          aConfig.priceLink
            ? { label: t('clan_auto_v2_1008', 'Узнать цену'), emoji: '💰', style: 'link' }
            : { label: t('clan_auto_v2_1009', 'Узнать цену'), emoji: '💰', style: 'primary' },
          { label: t('clan_auto_v2_1010', 'Разработка бота'), emoji: '⚙️', style: 'secondary' },
          { label: t('clan_auto_v2_1011', 'Вопрос администрации'), emoji: '❓', style: 'secondary' }
        ]
      };
    }

    return null;
  };

  const previewData = getLivePreviewData();
  const isCompanionWindowVisible = isFullScreenWindow && showDiscordLivePreview && Boolean(previewData);

  return (
    <div className={`flex items-start justify-center gap-6 h-[calc(100vh-8rem)] w-full mx-auto animate-main-fade-in ${isCompanionWindowVisible ? 'max-w-[1780px]' : 'max-w-6xl'}`}>
      {loadingConfig ? (
        <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2.5 text-orange-500" />
          <span className="font-medium text-sm">{t('clan_loading')}</span>
        </div>
      ) : config ? (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row flex-1 min-h-0 min-w-0 max-w-6xl w-full">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/70 dark:bg-slate-950/40 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-hidden h-full">
            <div className="hidden md:flex items-center justify-between px-3 py-1.5 mb-1 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('clan_nav_sections') || 'Разделы'}
              </span>
              {saveStatus && (
                <span className={`text-[10px] font-medium ${saveStatus === 'success' ? 'text-green-500' : saveStatus.startsWith('error') ? 'text-red-500' : 'text-blue-500 animate-pulse'}`}>
                  {saveStatus === 'success' ? `✓ ${t('clan_saved_success') || 'Сохранено'}` : saveStatus === 'saving' ? (t('clan_roles_syncing') || 'Синхронизация...') : (t('clan_error') || 'Ошибка')}
                </span>
              )}
            </div>

            {/* Search Input above tabs */}
            <div className="mb-1.5 px-1 shrink-0 w-44 md:w-auto">
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${activeTab === 'search' ? 'text-blue-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={botSearchQuery}
                  onChange={e => handleBotSearchChange(e.target.value)}
                  onFocus={() => {
                    if (botSearchQuery.trim() && activeTab !== 'search') {
                      prevTabBeforeSearch.current = activeTab;
                      setActiveTab('search');
                    }
                  }}
                  placeholder={t('clan_search_placeholder') || 'Поиск настроек...'}
                  className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border transition-all ${
                    activeTab === 'search'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  } placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                />
                {botSearchQuery && (
                  <button
                    type="button"
                    onClick={handleBotSearchClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title={t('clan_search_clear') || 'Очистить'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {config && !isBotConfigured(config) && (
              <button 
                type="button"
                onClick={() => setShowSetupWizard(true)} 
                className="hidden md:flex items-center justify-center gap-1.5 px-2.5 py-1.5 mb-2 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-sm animate-pulse shrink-0"
                title={t('clan_unconfigured_desc') || 'Для работы бота необходимо привязать роли и каналы в Discord. Нажмите, чтобы открыть мастер настройки.'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{t('clan_unconfigured_title') || 'Бот еще не настроен'}</span>
              </button>
            )}
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isUnconfigured = (tab.id === 'roles' || tab.id === 'channels') && config && !isBotConfigured(config);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                      : isUnconfigured
                        ? 'text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isUnconfigured ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />}
                  <span className="truncate">{tab.label}</span>
                  {isUnconfigured && (
                    <span className={`ml-auto w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto h-full scrollbar-thin">
            
            {activeTab === 'search' && (
              <div className="space-y-6 max-w-4xl animate-main-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-500" />
                      {t('clan_search_results_title') || 'Результаты поиска настроек'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {filteredBotSettings.length > 0 
                        ? `${t('clan_search_found') || 'Найдено настроек'}: ${filteredBotSettings.length} ${botSearchQuery ? `по запросу «${botSearchQuery}»` : ''}`
                        : (t('clan_search_no_results') || 'Ничего не найдено')}
                    </p>
                  </div>
                  {botSearchQuery && (
                    <button
                      type="button"
                      onClick={handleBotSearchClear}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    >
                      {t('clan_search_clear') || 'Очистить поиск'}
                    </button>
                  )}
                </div>

                {!botSearchQuery.trim() ? (
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('clan_search_hint_title') || 'Введите запрос для быстрого поиска'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {t('clan_search_hint_desc') || 'Ищите по ролям (лидер, коллер, фармер), каналам (логи, тикеты), модерации (варны, спам, мат), войсам и правам.'}
                    </p>
                  </div>
                ) : filteredBotSettings.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Filter className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('clan_search_not_found_title') || 'По вашему запросу ничего не найдено'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {t('clan_search_not_found_desc') || 'Попробуйте изменить формулировку, например: «роли», «варн», «стим», «канал», «войс» или «логи».'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredBotSettings.map((item) => {
                      const TabIcon = item.tabIcon;
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <TabIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </span>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                  {item.tabName}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab(item.tabId);
                            }}
                            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                          >
                            <span>{t('clan_search_open_tab') || 'Перейти к разделу'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'general' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {t('clan_auto_1', 'Основные настройки')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('clan_name_label') || 'Название клана'} *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800/50 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                      value={config?.name ?? ''}
                      onChange={e => handleClanNameChange(e.target.value, false)}
                      onBlur={e => handleClanNameChange(e.target.value, true)}
                      placeholder={t('clan_name_placeholder') || 'Например: TITAN'}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 h-[42px]">
                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                      {t('clan_recruitment_open_title') || 'Набор в клан открыт'}
                    </span>
                    <ToggleSwitch
                      checked={!!config.recruitmentOpen}
                      onChange={val => {
                        const updated = { ...config, recruitmentOpen: val };
                        queueAutoSave(updated, true);
                      }}
                      activeColor="blue"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('clan_discord_link_title') || 'Основная ссылка на Discord'}
                    </label>
                    <button
                      type="button"
                      onClick={handleCreatePermanentInvite}
                      disabled={creatingInvite}
                      className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                    >
                      {creatingInvite ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('clan_discord_link_generating') || 'Создание ссылки...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t('clan_discord_link_generate') || 'Создать вечную ссылку'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2 border rounded-xl bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 outline-none transition-shadow ${
                        inviteStatus === 'invalid' 
                          ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/40' 
                          : inviteStatus === 'valid'
                          ? 'border-emerald-400 dark:border-emerald-500/60 focus:ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/50'
                      }`}
                      value={config?.discordLink ?? ''}
                      onChange={e => {
                        const updated = { ...config, discordLink: e.target.value };
                        queueAutoSave(updated, false);
                      }}
                      onBlur={e => {
                        const val = e.target.value;
                        if (val !== (config?.discordLink ?? '')) {
                          const updated = { ...config, discordLink: val };
                          queueAutoSave(updated, true);
                        }
                        if (val.trim() && val.trim() !== lastVerifiedLinkRef.current) {
                          verifyInvite(val);
                        } else if (!val.trim()) {
                          setInviteStatus(null);
                          setInviteDetails(null);
                        }
                      }}
                      placeholder="https://discord.gg/..."
                    />

                    {checkingInvite && (
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Verification Status Badge / Alert */}
                  {inviteStatus === 'valid' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {t('clan_discord_link_valid') || 'Ссылка активна'}
                        {inviteDetails?.serverName ? ` (${inviteDetails.serverName}${inviteDetails.memberCount ? ` • ${inviteDetails.memberCount} ${t('clan_members_short', 'уч.')}` : ''})` : ''}
                      </span>
                    </div>
                  )}

                  {inviteStatus === 'invalid' && (
                    <div className="mt-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('clan_discord_link_invalid') || 'Ссылка недействительна или была удалена'}</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        {t('clan_discord_link_invalid_hint') || 'Приглашение устарело или было удалено в Discord. Сгенерируйте новую ссылку кнопкой выше.'}
                      </p>
                    </div>
                  )}
                </div>



                {/* Actions: Setup Wizard, Unlink Server, & Factory Reset in 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Master / Wizard Setup Card */}
                  <div className="p-4 border border-blue-200 dark:border-blue-800/60 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{t('clan_wizard_btn') || 'Мастер настройки'}</span>
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1 leading-relaxed">
                        {t('clan_wizard_card_desc') || 'Пошаговый мастер автоматической инициализации ролей, каналов и базовых правил бота.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSetupWizard(true)}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_wizard_btn') || 'Мастер настройки'}</span>
                    </button>
                  </div>

                  {/* Unlink Server Card */}
                  <div className="p-4 border border-red-200 dark:border-red-800/60 rounded-xl bg-red-50/40 dark:bg-red-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                        <Unlink className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{t('clan_unlink_btn') || 'Отвязать сервер'}</span>
                      </h4>
                      <p className="text-xs text-red-700 dark:text-red-300/80 mt-1 leading-relaxed">
                        {t('clan_unlink_card_desc') || 'Отвязать бота от текущего Discord сервера и сбросить привязку.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUnlink}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Unlink className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_unlink_btn') || 'Отвязать...'}</span>
                    </button>
                  </div>

                  {/* Factory Reset Card */}
                  <div className="p-4 border border-amber-200 dark:border-amber-800/60 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{t('clan_reset_btn') || 'Сброс настроек'}</span>
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                        {t('clan_reset_general_card_desc') || 'Выборочно вернуть роли, каналы, права или весь бот к исходному заводскому состоянию.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('clan_reset_btn') || 'Сбросить...'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'roles' && (() => {
              let roleNames = {};
              try {
                if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
              } catch (e) {}

              let customRoles = [];
              try {
                if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
              } catch (e) {}

              let deletedRoles = [];
              try {
                if (config.deletedRolesJson) deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
              } catch (e) {}

              const visibleStandardRoles = standardRoles.filter(r => !deletedRoles.includes(r.key));

              return (
                <div className="space-y-6 max-w-5xl">
                  {/* Roles Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        {t('clan_roles_config') || 'Настройки ролей'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_roles_desc') || 'Привязывайте роли из Discord к боту или создавайте их в один клик. Изменения синхронизируются мгновенно.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Restore Standard Roles Button if any deleted */}
                      {deletedRoles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          title={t('clan_roles_restore_std') || 'Восстановить удаленные стандартные роли'}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('clan_roles_restore_std') || `Восстановить роли (${deletedRoles.length})`}</span>
                        </button>
                      )}

                      {/* Sync Discord Roles into Custom Roles */}
                      <button
                        type="button"
                        onClick={handleSyncDiscordRoles}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                        title={t('clan_auto_96', 'Подтянуть все роли из Discord и привязать их как кастомные, сохраняя текущие настройки')}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t('clan_auto_2', 'Синхронизировать с Discord')}</span>
                      </button>

                      {/* Move Roles Up in Discord Hierarchy */}
                      <button
                        type="button"
                        onClick={handleMoveRolesUp}
                        disabled={movingRoles}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                        title={t('clan_auto_97', 'Переместить созданные и клановые роли вверх в иерархии Discord (под роль бота)')}
                      >
                        <ArrowUp className={`w-3.5 h-3.5 ${movingRoles ? 'animate-bounce' : ''}`} />
                        <span>{movingRoles ? t('clan_auto_v2_1024', 'Перемещение...') : t('clan_auto_v2_1025', 'Переместить роли вверх')}</span>
                      </button>

                      {/* Add Custom Role */}
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Standard Roles Section */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      {t('clan_standard_roles_count', 'Стандартные роли')} ({visibleStandardRoles.length})
                    </div>
                    {visibleStandardRoles.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-950/20">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                          {t('clan_auto_3', 'Все стандартные роли были скрыты или удалены')}
                        </p>
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('clan_roles_restore_std') || 'Восстановить роли'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleStandardRoles.map(r => {
                          const rawName = roleNames[r.key];
                          const currentName = (rawName !== undefined && !rawName.toLowerCase().includes('clan manager')) ? rawName : (r.defaultName || r.defaultRu);
                          const boundRoleId = config[r.dbKey] || '';
                          const isCreatingThis = creatingRoleKey === r.key;

                          return (
                            <div 
                              key={r.key} 
                              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              {/* Role name in bot */}
                              <div className="w-full md:w-60 lg:w-72 shrink-0">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_4', 'Название роли (в боте)')}
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                  value={currentName}
                                  onChange={e => handleRoleNameChange(r.key, e.target.value, false)}
                                  onBlur={e => handleRoleNameBlur(r.key, r.dbKey, e.target.value, false)}
                                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                  placeholder={r.defaultName || r.defaultRu}
                                />
                              </div>

                              {/* Role in Discord (dropdown + create button) */}
                              <div className="flex-1 min-w-[220px]">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_5', 'Роль в Discord')}
                                </label>
                                <div className="flex items-center gap-2">
                                  {!discordInfo ? (
                                    <div className="flex-1 h-9.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                                  ) : (
                                    <select
                                      value={boundRoleId}
                                      onChange={e => handleSelectDiscordRole(r.key, r.dbKey, e.target.value, false)}
                                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer truncate"
                                    >
                                      <option value="">{t('clan_auto_6', '-- Выберите роль --')}</option>
                                      {(discordInfo?.roles || []).map(dRole => (
                                        <option key={dRole.id} value={dRole.id}>
                                          {dRole.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCreateRoleInDiscord(r, false, currentName)}
                                    disabled={isCreatingThis || creatingRoleKey !== null}
                                    className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-300 dark:border-slate-700 hover:border-blue-400 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                  >
                                    {isCreatingThis ? (
                                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">{t('clan_auto_7', 'Создать')}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Status & Unlink/Delete button */}
                              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-5 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="w-28 flex justify-center">
                                  {boundRoleId ? (
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {t('clan_auto_8', 'Привязано')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                      {t('clan_auto_9', 'Не привязано')}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStandardRole(r.key, r.dbKey)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer"
                                  title={t('clan_roles_delete_std') || 'Удалить стандартную роль'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  )}
                </div>

                  {/* Custom Roles Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        {t('clan_custom_roles_count', 'Кастомные роли')} ({customRoles.length})
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>

                    {customRoles.length === 0 ? (
                      <div 
                        onClick={handleAddCustomRole}
                        className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 group"
                      >
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t('clan_auto_10', 'Нет дополнительных ролей')}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {t('clan_auto_11', 'Нажмите сюда, чтобы добавить кастомную роль (например: Медик, Снайпер, Гость)')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customRoles.map(cr => {
                          const isCreatingThis = creatingRoleKey === cr.id;
                          return (
                            <div 
                              key={cr.id} 
                              className="bg-amber-50/20 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              {/* Role name in bot */}
                              <div className="w-full md:w-60 lg:w-72 shrink-0">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                  {cr.color && (
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: cr.color }}></span>
                                  )}
                                  <span>{t('clan_auto_12', 'Название роли (в боте)')}</span>
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                  value={cr.name || ''}
                                  onChange={e => handleRoleNameChange(cr.key, e.target.value, true, cr.id)}
                                  onBlur={e => handleRoleNameBlur(cr.key, null, e.target.value, true, cr.id)}
                                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                  placeholder={t('clan_auto_108', 'Новая роль')}
                                />
                              </div>

                              {/* Role in Discord (dropdown + create button) */}
                              <div className="flex-1 min-w-[220px]">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  {t('clan_auto_13', 'Роль в Discord')}
                                </label>
                                <div className="flex items-center gap-2">
                                  {!discordInfo ? (
                                    <div className="flex-1 h-9.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                                  ) : (
                                    <select
                                      value={cr.roleId || ''}
                                      onChange={e => handleSelectDiscordRole(cr.key, null, e.target.value, true, cr.id)}
                                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer truncate"
                                    >
                                      <option value="">{t('clan_auto_14', '-- Выберите роль --')}</option>
                                      {(discordInfo?.roles || []).map(dRole => (
                                        <option key={dRole.id} value={dRole.id}>
                                          {dRole.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCreateRoleInDiscord(cr, true, cr.name)}
                                    disabled={isCreatingThis || creatingRoleKey !== null}
                                    className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                  >
                                    {isCreatingThis ? (
                                      <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">{t('clan_auto_15', 'Создать')}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Status & Delete button */}
                              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-5 border-t md:border-t-0 border-amber-200/50 dark:border-amber-800/40 shrink-0">
                                <div className="w-28 flex justify-center">
                                  {cr.roleId ? (
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {t('clan_auto_16', 'Привязано')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                      {t('clan_auto_17', 'Не привязано')}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomRole(cr.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                                  title={t('clan_roles_delete_template') || 'Удалить шаблон роли'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'channels' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-5xl">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    {t('clan_auto_18', 'Настройки каналов')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('clan_auto_19', 'Привяжите каналы Discord сервера для автоматической работы функций бота')}
                  </p>
                </div>
                
                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  
                  const updateCConfig = (key, val) => {
                    const newConfig = { ...cConfig, [key]: val };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, true);
                  };
                  
                  const channelsList = [
                    { key: 'ticketsCategory', label: t('clan_auto_v2_1012', 'Категория для тикетов'), desc: t('clan_auto_222', 'Здесь бот будет создавать приватные каналы тикетов заявок.'), typeFilter: 4, badge: 'Категория' },
                    { key: 'applications', label: t('clan_auto_v2_1013', 'Одобренные заявки'), desc: t('clan_auto_223', 'Сюда будут пересылаться одобренные заявки из тикетов.'), typeFilter: [0, 2] },
                    { key: 'autoRejectedApplications', label: t('clan_channel_auto_rejected_app') || 'Отклоненные ботом заявки', desc: t('clan_channel_auto_rejected_app_desc') || 'Канал для автоматических отказов кандидатам (нехватка часов, возраст, блокировки VAC/Game).', typeFilter: [0, 2] },
                    { key: 'rejectedApplications', label: t('clan_channel_rejected_app') || 'Отклоненные админами заявки', desc: t('clan_channel_rejected_app_desc') || 'Канал для заявок, отклоненных вручную модераторами/рекрутерами с указанием причины.', typeFilter: [0, 2] },
                    { key: 'leaderboard', label: t('clan_auto_v2_1014', 'Leaderboard (Статистика)'), desc: t('clan_auto_224', 'Канал, где публикуется статистика по вайпам и топам.'), typeFilter: [0, 2] },
                    { key: 'news', label: t('clan_auto_v2_1015', 'Новости клана'), desc: t('clan_auto_225', 'Канал для публикации объявлений и новостей бота.'), typeFilter: [0, 2] },
                    { key: 'votes', label: t('clan_tab_votes', 'Голосования'), desc: t('clan_auto_226', 'Канал для создания голосований. Может быть тем же, что и новости.'), typeFilter: [0, 2] },
                    { key: 'ads', label: t('clan_auto_v2_1016', 'Реклама и альянсы'), desc: t('clan_auto_227', 'Сюда бот отправляет информацию об оплаченной рекламе.'), typeFilter: [0, 2] },
                    { key: 'roster', label: t('clan_auto_v2_1017', 'Состав клана'), desc: t('clan_auto_228', 'Здесь выводится динамический список всех участников.'), typeFilter: [0, 2] }
                  ];

                  return (
                    <div className="space-y-3">
                      {channelsList.map(c => (
                         <div key={c.key} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all">
                           <div className="flex-1 min-w-0 pr-2">
                             <div className="flex items-center gap-2">
                               <span className="font-semibold text-sm text-slate-900 dark:text-white">{c.label}</span>
                               {c.badge && (
                                 <span className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                                   {c.badge}
                                 </span>
                               )}
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                               {c.desc}
                             </p>
                           </div>
                           <div className="w-full md:w-80 shrink-0">
                             {!discordInfo ? (
                               <div className="w-full h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
                             ) : (
                               <select
                                 value={cConfig[c.key] || ''}
                                 onChange={e => updateCConfig(c.key, e.target.value)}
                                 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                               >
                                 <option value="">{t('clan_auto_20', '-- Не выбрано --')}</option>
                                 {(discordInfo?.channels || [])
                                   .filter(ch => c.typeFilter === null || ch.type === c.typeFilter || (Array.isArray(c.typeFilter) && c.typeFilter.includes(ch.type)))
                                   .map(ch => {
                                     let prefix = ch.type === 4 ? '📁 ' : ch.type === 2 ? '🔊 ' : '#️⃣ ';
                                     return <option key={ch.id} value={ch.id}>{prefix}{ch.name}</option>;
                                   })}
                               </select>
                             )}
                           </div>
                         </div>
                      ))}
                    </div>
                  );
                })()}
              </form>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6 max-w-6xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      {t('clan_auto_21', 'Права Доступа (Матрица ролей и каналов)')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
                      {t('clan_auto_22', 'Выберите каналы, к которым каждая роль должна иметь доступ.')}
                      <br/>
                      <span className="text-blue-500 font-medium">{t('clan_auto_23', '💡 Совет:')}</span> {t('clan_auto_24', 'Сначала настройте каналы для низших ролей. Более высокие роли автоматически унаследуют эти доступы, и вам останется только добавить им их уникальные административные каналы.')}
                    </p>
                  </div>
                  <button onClick={syncPermissions} disabled={saveStatus === 'saving'} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 flex items-center shrink-0">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    {t('clan_auto_25', 'Синхронизировать с Discord')}
                  </button>
                </div>

                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) cConfig = JSON.parse(config.channelsConfigJson);
                  } catch(e) {}
                  
                  let permissions = cConfig.permissions || {};
                  let defaultLogChannelId = null;
                  try {
                    const l = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
                    defaultLogChannelId = l?.defaultChannelId || null;
                  } catch(e) {}
                  
                  const channelKeys = ['ticketsCategory', 'applications', 'logs', 'leaderboard', 'news', 'votes', 'ads', 'roster'];
                  
                  const channelLabels = {
                    ticketsCategory: t('clan_perm_tickets', 'Тикеты'),
                    applications: t('clan_perm_applications', 'Заявки'),
                    logs: 'logs',
                    leaderboard: 'leaderboard',
                    news: t('clan_perm_news', 'Новости'),
                    votes: t('clan_perm_votes', 'Голосования'),
                    ads: t('clan_perm_ads', 'Реклама'),
                    roster: t('clan_perm_roster', 'Состав')
                  };

                  const matrixHierarchyRoles = [
                    { key: 'leader', dbKey: 'leaderRoleId', nameKey: 'leader', defaultName: 'Leader' },
                    { key: 'deputy', dbKey: 'deputyLeaderRoleId', nameKey: 'deputy', defaultName: 'Deputy Leader' },
                    { key: 'caller', dbKey: 'callerRoleId', nameKey: 'caller', defaultName: t('clan_role_caller', 'Коллер') },
                    { key: 'recruiter', dbKey: 'recruiterRoleId', nameKey: 'recruiter', defaultName: t('clan_role_recruiter', 'Рекрутер') },
                    { key: 'main', dbKey: 'mainRosterRoleId', nameKey: 'main', defaultName: t('clan_role_main', 'Основной состав') },
                    { key: 'trial', dbKey: 'trialRoleId', nameKey: 'trial', defaultName: t('clan_role_trial', 'Испытательный срок') }
                  ];

                  const matrixSideRoles = [
                    { key: 'vip', dbKey: 'vipRoleId', nameKey: 'vip', defaultName: 'VIP' },
                    { key: 'builder', dbKey: 'builderRoleId', nameKey: 'builder', defaultName: t('clan_role_builder', 'Билдер') },
                    { key: 'electrician', dbKey: 'electricianRoleId', nameKey: 'electrician', defaultName: t('clan_role_electrician', 'Электрик') },
                    { key: 'pilot', dbKey: 'pilotRoleId', nameKey: 'pilot', defaultName: t('clan_role_pilot', 'Пилот') },
                    { key: 'plantFarmer', dbKey: 'plantFarmerRoleId', nameKey: 'plantFarmer', defaultName: t('clan_role_plant_farmer', 'Фермер') },
                    { key: 'farmer', dbKey: 'farmerRoleId', nameKey: 'farmer', defaultName: t('clan_role_farmer', 'Фармер') },
                    { key: 'sponsor', dbKey: 'sponsorRoleId', nameKey: 'sponsor', defaultName: t('clan_role_sponsor', 'Спонсор') }
                  ];

                  let customRoles = [];
                  try {
                    if (config.customRolesJson) {
                      customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
                    }
                  } catch (e) {}
                  if (!Array.isArray(customRoles)) customRoles = [];

                  const matrixCustomRoles = customRoles.map(cr => ({
                    key: cr.key || cr.id,
                    dbKey: null,
                    roleId: cr.roleId,
                    nameKey: cr.key || cr.id,
                    defaultName: cr.name || t('clan_custom_role_default', 'Кастомная роль'),
                    isCustom: true,
                    color: cr.color
                  }));

                  const allMatrixRoles = [...matrixHierarchyRoles, ...matrixSideRoles, ...matrixCustomRoles];
                  
                  // Helper mapping to actual discord role IDs
                  const roleIdMap = {};
                  allMatrixRoles.forEach(r => {
                    roleIdMap[r.key] = r.isCustom ? r.roleId : config[r.dbKey];
                  });

                  const getChannelId = (cKey) => {
                    return cConfig[cKey] || (cKey === 'logs' ? defaultLogChannelId : null);
                  };

                  const defaultRoleChannels = {
                    leader: ['ticketsCategory', 'applications', 'logs', 'leaderboard', 'news', 'votes', 'ads', 'roster'],
                    deputy: ['ticketsCategory', 'applications', 'logs', 'leaderboard', 'news', 'votes', 'ads', 'roster'],
                    caller: ['news', 'votes'],
                    recruiter: ['ticketsCategory', 'applications']
                  };

                  const getRoleEffectiveAllowedIds = (rKey, rId) => {
                    if (!rId) return [];
                    if (Array.isArray(permissions[rId])) {
                      return permissions[rId];
                    }
                    const defKeys = defaultRoleChannels[rKey] || [];
                    return defKeys.map(getChannelId).filter(Boolean);
                  };
                  
                  const togglePermission = (roleKey, channelKey) => {
                    const roleId = roleIdMap[roleKey];
                    if (!roleId) return; // role not configured
                    const channelId = getChannelId(channelKey);
                    if (!channelId) return;

                    const effectiveIds = getRoleEffectiveAllowedIds(roleKey, roleId);
                    const currentSet = new Set(effectiveIds);
                    const isGranting = !currentSet.has(channelId);

                    if (isGranting) {
                      currentSet.add(channelId);
                    } else {
                      currentSet.delete(channelId);
                    }

                    const newPermissions = { ...permissions };
                    newPermissions[roleId] = Array.from(currentSet);
                    
                    const newConfig = { ...cConfig, permissions: newPermissions };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, true);
                  };

                  const renderRoleRow = (rDef) => {
                    const rKey = rDef.key;
                    const rId = roleIdMap[rKey];
                    const isConfigured = !!rId;
                    
                    let rName = rDef.defaultName;
                    if (!rDef.isCustom) {
                      try {
                        if (config.roleNamesJson) {
                          const names = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
                          if (names[rDef.nameKey]) rName = names[rDef.nameKey];
                          else if (names[rKey]) rName = names[rKey];
                        }
                      } catch(e) {}
                    }
                    
                    const roleEffectiveIds = getRoleEffectiveAllowedIds(rKey, rId);

                    return (
                      <tr key={rKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {!isConfigured && <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" title={t('clan_auto_98', 'Роль не привязана к Discord')}></span>}
                          {isConfigured && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title={t('clan_auto_99', 'Роль привязана к Discord')}></span>}
                          {rDef.color && (
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: rDef.color }}></span>
                          )}
                          <span className="truncate">{rName}</span>
                          {rDef.isCustom && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
                              {t('clan_auto_26', 'кастом')}
                            </span>
                          )}
                        </td>
                        {channelKeys.map(cKey => {
                          const cId = getChannelId(cKey);
                          const isAllowed = isConfigured && cId && roleEffectiveIds.includes(cId);
                          return (
                            <td key={cKey} className="px-2 py-3 text-center">
                              <input 
                                type="checkbox"
                                disabled={!isConfigured || !cId}
                                checked={Boolean(isAllowed)}
                                onChange={() => togglePermission(rKey, cKey)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  };

                  return (
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{t('clan_auto_27', 'Роль')}</th>
                            {channelKeys.map(cKey => (
                              <th key={cKey} className="px-2 py-3 text-center font-medium text-slate-600 dark:text-slate-400">
                                <div className="truncate max-w-[85px] mx-auto text-xs" title={channelLabels[cKey] || cKey}>
                                  {channelLabels[cKey] || cKey}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {matrixHierarchyRoles.length > 0 && (
                            <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <td colSpan={channelKeys.length + 1} className="px-4 py-1.5">
                                {t('clan_auto_28', 'Иерархические роли')}
                              </td>
                            </tr>
                          )}
                          {matrixHierarchyRoles.map(renderRoleRow)}

                          {matrixSideRoles.length > 0 && (
                            <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <td colSpan={channelKeys.length + 1} className="px-4 py-1.5 border-t border-slate-200 dark:border-slate-700">
                                {t('clan_auto_29', 'Специальные роли')}
                              </td>
                            </tr>
                          )}
                          {matrixSideRoles.map(renderRoleRow)}

                          {matrixCustomRoles.length > 0 && (
                            <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <td colSpan={channelKeys.length + 1} className="px-4 py-1.5 border-t border-slate-200 dark:border-slate-700">
                                {t('clan_custom_roles_count', 'Кастомные роли')} ({matrixCustomRoles.length})
                              </td>
                            </tr>
                          )}
                          {matrixCustomRoles.map(renderRoleRow)}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6 max-w-5xl">
                {loadingVoice || !dynamicVoiceData ? (
                  <VoiceRoomsSkeleton />
                ) : (
                  <>
                    {/* Section 1: Settings Form (Join-to-Create) */}
                    <form onSubmit={saveDynamicVoiceConfig} noValidate className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                            {t('clan_auto_30', 'Настройки системы Join-to-Create')}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('clan_auto_31', 'Настройте категорию и канал для автоматического создания пати')}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={!!dynamicVoiceData.config?.enabled}
                          onChange={val => {
                            const updated = { ...(dynamicVoiceData.config || {}), enabled: val };
                            queueAutoSaveVoice(updated, true);
                          }}
                          activeColor="orange"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChannelSelect
                          label={t('clan_voice_category_label')}
                          description={t('clan_voice_category_desc')}
                          value={dynamicVoiceData.config?.categoryId || ''}
                          onChange={(val) => {
                            const updated = { ...(dynamicVoiceData.config || {}), categoryId: val };
                            queueAutoSaveVoice(updated, true);
                          }}
                          discordChannels={dynamicVoiceData?.channels || discordInfo?.channels || []}
                          typeFilter={4}
                        />

                        <ChannelSelect
                          label={t('clan_voice_generator_label')}
                          description={t('clan_voice_generator_desc')}
                          value={dynamicVoiceData.config?.generatorChannelId || ''}
                          onChange={(val) => {
                            const updated = { ...(dynamicVoiceData.config || {}), generatorChannelId: val };
                            queueAutoSaveVoice(updated, true);
                          }}
                          discordChannels={dynamicVoiceData?.channels || discordInfo?.channels || []}
                          typeFilter={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_voice_template_label')}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {t('clan_voice_template_desc')}
                          </p>
                          <input
                            type="text"
                            value={dynamicVoiceData.config?.template || ''}
                            onChange={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), template: e.target.value };
                              queueAutoSaveVoice(updated, false);
                            }}
                            onBlur={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), template: e.target.value };
                              queueAutoSaveVoice(updated, true);
                            }}
                            placeholder={t('clan_auto_109', '🔊 Пати {user}')}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_voice_limit_label')}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {t('clan_voice_limit_desc')}
                          </p>
                          <select
                            value={dynamicVoiceData.config?.defaultLimit ?? 0}
                            onChange={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), defaultLimit: parseInt(e.target.value, 10) || 0 };
                              queueAutoSaveVoice(updated, true);
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                          >
                            <option value={0}>0 — {t('clan_voice_unlimited')}</option>
                            <option value={2}>{t('clan_auto_32', '2 места (Дуо)')}</option>
                            <option value={3}>{t('clan_auto_33', '3 места (Трио)')}</option>
                            <option value={4}>{t('clan_auto_34', '4 места (Квадро)')}</option>
                            <option value={5}>{t('clan_auto_35', '5 мест (Пятерка)')}</option>
                            <option value={6}>{t('clan_auto_36', '6 мест')}</option>
                            <option value={8}>{t('clan_auto_37', '8 мест')}</option>
                            <option value={10}>{t('clan_auto_38', '10 мест')}</option>
                            <option value={12}>{t('clan_auto_39', '12 мест')}</option>
                            <option value={16}>{t('clan_auto_40', '16 мест')}</option>
                          </select>
                        </div>
                      </div>
                    </form>

                    {/* Section 2: Banner with Auto-setup & Title with ? tooltip */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200 dark:border-orange-900/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 shrink-0">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {t('clan_voice_title')}
                          </h3>
                          <div className="group relative inline-flex">
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold cursor-default text-slate-600 dark:text-slate-300 select-none">
                              ?
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-slate-800 text-slate-100 text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none leading-relaxed">
                              {t('clan_voice_desc')}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoSetupDynamicVoice}
                        disabled={voiceActionLoading}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>{voiceActionLoading ? 'Создание...' : t('clan_voice_auto_setup_btn')}</span>
                      </button>
                    </div>

                    {/* Section 2: Active Temporary Rooms Monitoring */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                            {t('clan_voice_active_title')}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                            {dynamicVoiceData.activeRooms?.length || 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={fetchDynamicVoice}
                          disabled={loadingVoice || voiceActionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingVoice ? 'animate-spin' : ''}`} />
                          <span>{t('clan_voice_refresh_btn')}</span>
                        </button>
                      </div>

                      {(!dynamicVoiceData.activeRooms || dynamicVoiceData.activeRooms.length === 0) ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {t('clan_voice_no_rooms')}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dynamicVoiceData.activeRooms.map(room => (
                            <div
                              key={room.channelId}
                              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-orange-500 shrink-0" />
                                    <h5 className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[220px]" title={room.name}>
                                      {room.name}
                                    </h5>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {t('clan_voice_owner')} <span className="font-medium text-slate-700 dark:text-slate-300">{room.ownerName || 'Unknown'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingRoomLimit({
                                        channelId: room.channelId,
                                        name: room.name,
                                        limit: room.userLimit || 0
                                      });
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                                    title={t('clan_voice_change_limit_title') || 'Изменить лимит мест'}
                                  >
                                    <Sliders className="w-3 h-3" />
                                    <span>{room.userLimit > 0 ? room.userLimit : '∞'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`${t('clan_voice_delete_confirm', 'Удалить комнату')} "${room.name}"? ${t('clan_voice_delete_confirm2', 'Все участники будут отключены.')}`)) {
                                        handleManageDynamicRoom('delete_room', room.channelId);
                                      }
                                    }}
                                    className="p-1.5 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                    title={t('clan_voice_delete_room_btn')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Members list */}
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex justify-between">
                                  <span>{t('clan_room_members', 'Участники')} ({room.members?.length || 0}{room.userLimit > 0 ? ` / ${room.userLimit}` : ''}):</span>
                                </div>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {room.members?.map(m => (
                                    <div
                                      key={m.id}
                                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <img
                                          src={m.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                          alt=""
                                          className="w-5 h-5 rounded-full shrink-0"
                                        />
                                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium max-w-[130px]" title={m.displayName}>
                                          {m.displayName}
                                        </span>
                                        {m.isMuted && (
                                          <MicOff className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_muted')} />
                                        )}
                                        {m.isDeaf && (
                                          <VolumeX className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_deafened')} />
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleManageDynamicRoom('kick_member', room.channelId, { userId: m.id })}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                        title={t('clan_auto_100', 'Отключить из голосового канала')}
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'recruitment' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                    {t('clan_auto_41', 'Настройки набора в клан')}
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
                      title={showDiscordLivePreview ? t('clan_auto_v2_1026', 'Скрыть живой предпросмотр Discord') : t('clan_auto_v2_1027', 'Показать живой предпросмотр Discord')}
                    >
                      {showDiscordLivePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showDiscordLivePreview ? t('clan_auto_v2_1028', 'Превью Discord') : t('clan_auto_v2_1029', 'Включить превью')}</span>
                    </button>
                  )}
                </div>
                
                {(() => {
                  const defaultRejectMsg = t('clan_recruitment_reject_msg_ph') || 'К сожалению, ваша анкета не соответствует минимальным требованиям клана...';
                  let rConfig = {
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
                    autoRejectMessage: defaultRejectMsg
                  };
                  try {
                    if (config.recruitmentConfigJson) {
                      rConfig = { ...rConfig, ...JSON.parse(config.recruitmentConfigJson) };
                    }
                  } catch(e) {}

                  // If autoRejectMessage is empty or not set, pre-fill with defaultRejectMsg so it's ready to edit in the field
                  if (!rConfig.autoRejectMessage || !rConfig.autoRejectMessage.trim()) {
                    rConfig.autoRejectMessage = defaultRejectMsg;
                  }

                  // Keep title synchronized with actual clan name if title was old default / GODS
                  if (config?.name) {
                    if (!rConfig.title || rConfig.title === t('clan_rec_gods', 'Набор в клан GODS') || rConfig.title === t('clan_rec_base', 'Набор в клан')) {
                      rConfig.title = `${t('clan_recruit_title_prefix', 'Набор в клан')} ${config.name}`;
                    } else if (rConfig.title.includes('GODS')) {
                      rConfig.title = rConfig.title.replace(/\bGODS\b/g, config.name);
                    }
                  }
                  
                  const updateRConfig = (key, val, immediate = false) => {
                    const newConfig = { ...rConfig, [key]: val };
                    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}

                  const updateChannelConfig = (key, val) => {
                    const newCConfig = { ...cConfig, [key]: val };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newCConfig) };
                    queueAutoSave(updated, true);
                  };
                  
                  const inviteLink = rConfig.link || config?.discordLink || 'https://discord.gg/clan';
                  const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                  const firstLeader = leaders[0];
                  const leaderDisplay = rConfig.customLeaderId 
                    ? `<@${rConfig.customLeaderId}>` 
                    : (firstLeader ? `@${firstLeader.displayName || firstLeader.username}` : `@${t('clan_role_leader', 'Лидер')}`);

                  const appChannel = discordInfo?.channels?.find(c => c.id === cConfig.applications);
                  const channelName = appChannel ? appChannel.name : t('clan_default_rec_ch', 'набор-в-клан');

                  return (
                    <div className="space-y-6">
                      {/* Основные параметры панели набора */}
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-orange-500" />
                          {t('clan_auto_42', 'Панель набора в Discord')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('clan_auto_43', 'Ссылка на баннер (Изображение)')}</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-shadow text-sm"
                              value={rConfig.banner}
                              onChange={e => updateRConfig('banner', e.target.value, false)}
                              onBlur={e => updateRConfig('banner', e.target.value, true)}
                              placeholder="https://i.imgur.com/..."
                            />
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
                            {(() => {
                              const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                              if (leaders.length > 0) {
                                return (
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
                                );
                              }
                              return <strong className="text-slate-700 dark:text-slate-300">{t('clan_auto_46', 'Роль не выдана ни одному участнику')}</strong>;
                            })()}
                            {t('clan_leader_manual_desc', '. Вы можете принудительно указать Discord ID пользователя:')}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                              placeholder={
                                (() => {
                                  const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                                  const firstId = leaders[0]?.userId || leaders[0]?.id;
                                  return firstId 
                                    ? `${t('clan_leader_id_ex', 'ID лидера (например: ')}${firstId})` 
                                    : t('clan_leader_id_placeholder', 'Укажите Discord ID пользователя (например: 718872288000000000)');
                                })()
                              }
                              value={rConfig.customLeaderId || ''}
                              onChange={e => updateRConfig('customLeaderId', e.target.value, false)}
                              onBlur={e => updateRConfig('customLeaderId', e.target.value, true)}
                            />
                            {(() => {
                              const leaders = rosterData?.roster?.filter(m => m.roles?.includes(config?.leaderRoleId)) || [];
                              const firstId = leaders[0]?.userId || leaders[0]?.id;
                              if (firstId && (!rConfig.customLeaderId || rConfig.customLeaderId !== firstId)) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => updateRConfig('customLeaderId', firstId, true)}
                                    className="px-3 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                    title={t('clan_auto_103', 'Вставить ID лидера по умолчанию')}
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{t('clan_auto_47', 'Вставить ID')}</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
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

                      {/* Автоматическое отклонение заявок (Auto-Reject) */}
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
                          
                          {/* Toggle Switch */}
                          <ToggleSwitch 
                            checked={!!rConfig.autoRejectEnabled}
                            onChange={val => updateRConfig('autoRejectEnabled', val, true)}
                            activeColor="orange"
                          />
                        </div>

                        {/* Settings Container */}
                        <div className={`space-y-4 pt-2 transition-opacity ${rConfig.autoRejectEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {t('clan_recruitment_min_hours') || 'Минимальное количество часов в Rust'}
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
                                checked={!!rConfig.strictSteamCheck}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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

                      {/* Журнал и история заявок в клан */}
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                              <ScrollText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                {t('clan_recruitment_apps_title') || 'Журнал заявок в клан'}
                                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {applicationsData.length}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('clan_recruitment_apps_desc') || 'История всех поступивших заявок: принятые, отклоненные руководством и отфильтрованные ботом.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={fetchApplications}
                              disabled={loadingApps}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${loadingApps ? 'animate-spin text-orange-500' : ''}`} />
                              <span>{t('clan_recruitment_apps_refresh') || 'Обновить'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleClearApplications}
                              disabled={loadingApps || applicationsData.length === 0}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              title={t('clan_recruitment_apps_clear') || 'Очистить журнал'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>{t('clan_recruitment_apps_clear') || 'Очистить журнал'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                          {/* Search input */}
                          <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={appSearch}
                              onChange={(e) => setAppSearch(e.target.value)}
                              placeholder={t('clan_recruitment_app_search_placeholder') || 'Поиск по нику, Discord ID, Steam...'}
                              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
                            />
                            {appSearch && (
                              <button
                                type="button"
                                onClick={() => setAppSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title={t('clan_auto_105', 'Очистить поиск')}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Filter Pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            {[
                              { id: 'ALL', label: t('clan_recruitment_apps_filter_all') || 'Все', count: applicationsData.length },
                              { id: 'PENDING', label: t('clan_recruitment_apps_filter_pending') || 'Ожидают', count: applicationsData.filter(a => a.status === 'PENDING').length },
                              { id: 'ACCEPTED', label: t('clan_recruitment_apps_filter_accepted') || 'Приняты', count: applicationsData.filter(a => a.status === 'ACCEPTED').length },
                              { id: 'REJECTED', label: t('clan_recruitment_apps_filter_rejected') || 'Отклонены', count: applicationsData.filter(a => a.status === 'REJECTED').length },
                              { id: 'AUTO_REJECTED', label: t('clan_recruitment_apps_filter_auto_rejected') || 'Авто-отказ', count: applicationsData.filter(a => a.status === 'AUTO_REJECTED').length }
                            ].map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setAppFilter(f.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                                  appFilter === f.id
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>{f.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  appFilter === f.id ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {f.count}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Table or Empty state */}
                        {(() => {
                          const query = (appSearch || '').trim().toLowerCase();
                          const filtered = applicationsData.filter(a => {
                            const matchesStatus = appFilter === 'ALL' || a.status === appFilter;
                            if (!matchesStatus) return false;
                            if (!query) return true;
                            const username = (a.username || '').toLowerCase();
                            const userId = (a.userId || '').toLowerCase();
                            const steamId = (a.steamId || '').toLowerCase();
                            const reviewedBy = (a.reviewedBy || '').toLowerCase();
                            const rejectReason = (a.rejectReason || '').toLowerCase();
                            const experience = (a.experience || '').toLowerCase();
                            return username.includes(query) ||
                                   userId.includes(query) ||
                                   steamId.includes(query) ||
                                   reviewedBy.includes(query) ||
                                   rejectReason.includes(query) ||
                                   experience.includes(query);
                          });

                          if (loadingApps && (!applicationsData || applicationsData.length === 0)) {
                            return <ApplicationsTableSkeleton rows={5} />;
                          }

                          if (filtered.length === 0) {
                            return (
                              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {query 
                                    ? `${t('clan_apps_search_empty', 'По запросу «')}${appSearch}${t('clan_apps_search_empty2', '» заявок не найдено.')}` 
                                    : (t('clan_recruitment_apps_empty') || 'Заявок в выбранной категории пока нет.')
                                  }
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/70 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                  <tr>
                                    <th className="px-4 py-3">{t('clan_recruitment_app_col_candidate') || t('clan_candidate', 'Кандидат')}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_steam') || 'Steam'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_age') || 'Возраст'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_hours') || 'Часы'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_status') || 'Статус'}</th>
                                    <th className="px-3 py-3">{t('clan_recruitment_app_col_details') || 'Детали'}</th>
                                    <th className="px-3 py-3 text-center">{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</th>
                                    <th className="px-4 py-3 text-right">{t('clan_recruitment_app_col_date') || 'Дата'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center space-x-2.5">
                                          {app.avatar ? (
                                            <img src={app.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                          ) : (
                                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                                              {(app.username || app.userId).slice(0, 2).toUpperCase()}
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{app.username || t('clan_candidate', 'Кандидат')}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{app.userId}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3">
                                        {(() => {
                                          const steamUrl = getSteamProfileUrl(app.steamId);
                                          if (!steamUrl) return <span className="text-slate-400">—</span>;
                                          const displayId = String(app.steamId).replace(/^https?:\/\/steamcommunity\.com\/(profiles|id)\//i, '').replace(/\/+$/, '');
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => openExternalUrl(steamUrl)}
                                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[11px] font-medium group max-w-[120px]"
                                              title={steamUrl}
                                            >
                                              <svg className="w-3 h-3 fill-current shrink-0 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
                                                <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.86 10.3 9.08 11.63l2.84-4.14a4.42 4.42 0 0 1-.39-.14l-3.9 1.63a7.48 7.48 0 0 1-.84-3.77c0-2.3 1.05-4.36 2.7-5.74L8.7 7.7a7.52 7.52 0 0 1 7.02-1.74l2.45-3.57A12 12 0 0 0 12 0zm3.83 5.96a5.53 5.53 0 0 0-3.32 1.15l3.22 1.34a2.22 2.22 0 1 1-1.35 3.23l-3.26-1.36a5.53 5.53 0 1 0 4.71-4.36zm-6.2 8.65l2.67 1.11a3.02 3.02 0 0 0 1.25-.26l-1.92 2.8a3.03 3.03 0 0 1-2-3.65z"/>
                                              </svg>
                                              <span className="truncate">{displayId}</span>
                                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
                                            </button>
                                          );
                                        })()}
                                      </td>
                                      <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                                        {app.age ? `${app.age} ${t('clan_years', 'лет')}` : '—'}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div className="flex items-center space-x-1">
                                          <span className="font-medium text-slate-800 dark:text-slate-200">{app.hours || 0} {t('clan_hours_short', 'ч.')}</span>
                                          {app.verifiedHours !== null && app.verifiedHours !== undefined && (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold" title={t('clan_auto_106', 'Верифицировано в Steam')}>
                                              ✓
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-3 py-3">
                                        {app.status === 'PENDING' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                                            ⏳ {t('clan_recruitment_app_status_pending') || 'Ожидает'}
                                          </span>
                                        )}
                                        {app.status === 'ACCEPTED' && (
                                          <span 
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs" 
                                            title={t('clan_recruitment_app_status_accepted') || 'Принята'}
                                          >
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                          </span>
                                        )}
                                        {app.status === 'REJECTED' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                                            ❌ {t('clan_recruitment_app_status_rejected') || 'Отклонена'}
                                          </span>
                                        )}
                                        {app.status === 'AUTO_REJECTED' && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                                            🤖 {t('clan_recruitment_app_status_auto_rejected') || 'Авто-отказ'}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 max-w-[180px] truncate text-[11px]">
                                        {app.rejectReason ? (
                                          <span className="text-rose-600 dark:text-rose-400" title={app.rejectReason}>
                                            {app.rejectReason}
                                          </span>
                                        ) : app.reviewedBy ? (
                                          <span className="text-slate-500">
                                            {t('clan_auto_51', 'Рассмотрел:')} <span className="font-medium text-slate-700 dark:text-slate-300">{app.reviewedBy}</span>
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleViewTranscript(app)}
                                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all text-[11px] font-medium shadow-2xs group"
                                          title={t('clan_recruitment_app_view_transcript') || 'Просмотр транскрипта'}
                                        >
                                          <ScrollText className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                          <span>{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</span>
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
              </form>
            )}

            {activeTab === 'votes' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6">
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
                
                {(() => {
                  let wTemplates = [];
                  try {
                    if (config.wipeTemplatesJson) {
                      wTemplates = JSON.parse(config.wipeTemplatesJson);
                    }
                  } catch(e) {}
                  
                  const updateTemplate = (index, key, val, immediate = false) => {
                    const newTemplates = [...wTemplates];
                    newTemplates[index] = { ...newTemplates[index], [key]: val };
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, immediate);
                  };

                  const addTemplate = () => {
                    const newTemplates = [...wTemplates, { name: '', day: t('clan_auto_232', t('clan_thursday', 'Четверг')), time: '16:00', ip: '', banner: '' }];
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };

                  const removeTemplate = (index) => {
                    const newTemplates = wTemplates.filter((_, i) => i !== index);
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  const voteChannel = discordInfo?.channels?.find(c => c.id === cConfig.votes);
                  const channelName = voteChannel ? voteChannel.name : t('clan_default_vote_ch', 'голосования');

                  const safeIdx = Math.min(previewVoteIndex, Math.max(0, wTemplates.length - 1));
                  const activeTpl = wTemplates[safeIdx] || { 
                    name: 'Rustoria Main', 
                    day: t('clan_auto_233', t('clan_thursday', 'Четверг')), 
                    time: '16:00', 
                    ip: 'connect 127.0.0.1:28015', 
                    banner: '' 
                  };
                  
                  return (
                    <div className="space-y-4">
                      {wTemplates.map((tpl, index) => (
                          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30 relative">
                            <button type="button" onClick={() => removeTemplate(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_53', 'Название сервера *')}</label>
                                <input 
                                  type="text" 
                                  required 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.name || ''} 
                                  onChange={e => updateTemplate(index, 'name', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'name', e.target.value, true)}
                                  placeholder="Rustoria Main" 
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_54', 'День вайпа')}</label>
                                <select 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.day || t('clan_thursday', 'Четверг')} 
                                  onChange={e => updateTemplate(index, 'day', e.target.value, true)}
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
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_62', 'Время (МСК)')}</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.time || ''} 
                                  onChange={e => updateTemplate(index, 'time', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'time', e.target.value, true)}
                                  placeholder="16:00" 
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">IP (connect ...) *</label>
                                <input 
                                  type="text" 
                                  required 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.ip || ''} 
                                  onChange={e => updateTemplate(index, 'ip', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'ip', e.target.value, true)}
                                  placeholder="connect 127.0.0.1:28015" 
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('clan_auto_63', 'Ссылка на баннер')}</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                  value={tpl.banner || ''} 
                                  onChange={e => updateTemplate(index, 'banner', e.target.value, false)} 
                                  onBlur={e => updateTemplate(index, 'banner', e.target.value, true)}
                                  placeholder="https://i.imgur.com/..." 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button type="button" onClick={addTemplate} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center font-medium">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          {t('clan_auto_64', 'Добавить шаблон сервера')}
                        </button>
                      </div>
                  );
                })()}
              </form>
            )}

            {activeTab === 'ads' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6">
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
                
                {(() => {
                  let aConfig = {
                    title: t('clan_auto_169', t('clan_ads_buy', 'Покупка рекламы')),
                    text: t('clan_auto_230', 'Здесь вы можете приобрести рекламу или обсудить партнерство.'),
                    banner: 'https://i.imgur.com/example.png',
                    priceLink: 'https://telegra.ph/price',
                  };
                  try {
                    if (config.adConfigJson) {
                      aConfig = { ...aConfig, ...JSON.parse(config.adConfigJson) };
                    }
                  } catch(e) {}
                  
                  const updateAConfig = (key, val, immediate = false) => {
                    const newConfig = { ...aConfig, [key]: val };
                    const updated = { ...config, adConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };

                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  const adsChannel = discordInfo?.channels?.find(c => c.id === cConfig.ads);
                  const channelName = adsChannel ? adsChannel.name : t('clan_default_ads_ch', 'реклама');
                  
                  return (
                    <div className="space-y-5 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_66', 'Заголовок Embed-сообщения *')}</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.title}
                          onChange={e => updateAConfig('title', e.target.value, false)}
                          onBlur={e => updateAConfig('title', e.target.value, true)}
                          placeholder={t('clan_auto_111', t('clan_ads_buy', 'Покупка рекламы'))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_67', 'Текст *')}</label>
                        <textarea 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px]"
                          value={aConfig.text}
                          onChange={e => updateAConfig('text', e.target.value, false)}
                          onBlur={e => updateAConfig('text', e.target.value, true)}
                          placeholder={t('clan_auto_112', 'Информация о рекламе...')}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_68', 'Ссылка на Прайс-лист (Telegraph / Сайт)')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.priceLink}
                          onChange={e => updateAConfig('priceLink', e.target.value, false)}
                          onBlur={e => updateAConfig('priceLink', e.target.value, true)}
                          placeholder="https://telegra.ph/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('clan_auto_69', 'Ссылка на баннер (Изображение)')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.banner}
                          onChange={e => updateAConfig('banner', e.target.value, false)}
                          onBlur={e => updateAConfig('banner', e.target.value, true)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                    </div>
                  );
                })()}
              </form>
            )}

            {activeTab === 'roster' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    {t('clan_auto_70', 'Состав клана')}
                  </h3>
                  <button onClick={() => setRosterData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    {t('clan_auto_71', 'Обновить')}
                  </button>
                </div>
                
                {!rosterData ? (
                  <RosterSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rosterData.roster.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                        {t('clan_auto_72', 'Участники не найдены. Убедитесь, что роли настроены правильно.')}
                      </div>
                    ) : (
                      rosterData.roster.map(member => {
                        let roleNamesMap = {};
                        try {
                          if (rosterData.roleNamesJson) roleNamesMap = JSON.parse(rosterData.roleNamesJson);
                        } catch(e) {}
                        
                        const mId = member.userId || member.id;
                        return (
                          <div key={mId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 gap-3">
                            <div className="flex items-center overflow-hidden flex-1">
                              <img src={member.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="w-12 h-12 rounded-full mr-4 shadow-sm shrink-0 object-cover" />
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium text-slate-900 dark:text-white truncate">{member.displayName}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{member.username}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.roles.map(rId => {
                                    // Find internal role key matching this ID
                                    const roleKey = ['leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'recruiterRoleId', 'mainRosterRoleId', 'trialRoleId', 'farmerRoleId', 'plantFarmerRoleId', 'electricianRoleId', 'builderRoleId', 'pilotRoleId', 'sponsorRoleId', 'vipRoleId'].find(k => config[k] === rId);
                                    if (roleKey) {
                                      const shortKey = roleKey.replace('RoleId', ''); // e.g. leader
                                      const roleName = roleNamesMap[shortKey] || shortKey;
                                      return <span key={rId} className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md">{roleName}</span>
                                    }
                                    return null;
                                  })}
                                  {(() => {
                                    const dos = dossiersData?.find(d => d.userId === mId);
                                    if (!dos) return null;
                                    if (dos.cheaterStatus === 'CONFIRMED' || (dos.cheaterReport && !dos.cheaterStatus)) {
                                      return (
                                        <span key="cheater" className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
                                          🚨 {t('clan_dossier_badge_cheater_confirmed') || 'Читер'}
                                        </span>
                                      );
                                    }
                                    if (dos.cheaterStatus === 'SUSPICION') {
                                      return (
                                        <span key="suspicion" className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                                          ⚠️ {t('clan_dossier_badge_cheater_suspicion') || 'Подозрение'}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const existing = dossiersData?.find(d => d.userId === mId);
                                const profileToOpen = existing || {
                                  userId: mId,
                                  username: member.displayName || member.username,
                                  avatar: member.avatarUrl,
                                  status: 'ACTIVE'
                                };
                                setSelectedProfileForDossier(profileToOpen);
                              }}
                              className="p-2 text-slate-400 hover:text-orange-500 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                              title={t('clan_auto_107', 'Открыть личное дело / Архив')}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dossier' && (
              <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Archive className="w-5 h-5 text-orange-500" />
                      <span>{t('clan_dossier_title') || 'Архив'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('clan_dossier_desc') || 'База данных участников клана, оценки навыков, заметки офицеров и архив соклановцев'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fetchDossiers(dossierFilter, dossierSearch)}
                      className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingDossiers ? 'animate-spin text-orange-500' : ''}`} />
                      <span>{t('common_refresh') || 'Обновить'}</span>
                    </button>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl">
                  {/* Status filter pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {[
                      { id: 'ALL', label: t('clan_dossier_filter_all') || 'Все' },
                      { id: 'ACTIVE', label: t('clan_dossier_filter_active') || 'В клане' },
                      { id: 'LEFT', label: t('clan_dossier_filter_left') || 'Вышли' },
                      { id: 'KICKED', label: t('clan_dossier_filter_kicked') || 'Исключены' },
                      { id: 'BLACKLISTED', label: t('clan_dossier_filter_blacklisted') || 'ЧС' },
                    ].map(f => {
                      const isSel = dossierFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setDossierFilter(f.id);
                            fetchDossiers(f.id, dossierSearch);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            isSel
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search input */}
                  <div className="relative md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={dossierSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setDossierSearch(val);
                        fetchDossiers(dossierFilter, val);
                      }}
                      placeholder={t('clan_dossier_search_placeholder') || 'Поиск по нику, ID или Steam...'}
                      className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    {dossierSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setDossierSearch('');
                          fetchDossiers(dossierFilter, '');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dossier Cards Grid */}
                {loadingDossiers && (!dossiersData || dossiersData.length === 0) ? (
                  <DossierCardsSkeleton count={6} />
                ) : !dossiersData || dossiersData.length === 0 ? (
                  <div className="bg-slate-50/60 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                    <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('clan_dossier_empty_title') || 'Архив пуст'}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                      {t('clan_dossier_empty_desc') || 'При принятии кандидатов их анкеты и данные автоматически сохраняются в архив. Вы также можете открыть карточку любого соклановца из вкладки "Состав".'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dossiersData.map(dossier => {
                      const st = dossier.status || 'ACTIVE';
                      const statusColor = 
                        st === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800' 
                          : st === 'LEFT' 
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
                            : st === 'KICKED' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' 
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                      const statusLabel = 
                        st === 'ACTIVE' ? (t('clan_dossier_status_active') || 'В клане') : 
                        st === 'LEFT' ? (t('clan_dossier_status_left') || 'Вышел') : 
                        st === 'KICKED' ? (t('clan_dossier_status_kicked') || 'Исключен') : 
                        (t('clan_dossier_status_blacklisted') || 'В черном списке');

                      return (
                        <div 
                          key={dossier.id || dossier.userId} 
                          className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div>
                            {/* Card Top: Avatar & Name */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <img 
                                  src={dossier.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                  alt="" 
                                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm" 
                                />
                                <div className="overflow-hidden">
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                    {dossier.username || dossier.userId}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono truncate">
                                    ID: {dossier.userId}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider shrink-0 ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>

                            {/* Tags & Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                              {(dossier.verifiedHours || dossier.hoursInRust) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200 dark:border-blue-900/50">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  <span>{dossier.verifiedHours ? `${dossier.verifiedHours} ${t('clan_hours_short', 'ч.')}` : `${dossier.hoursInRust} ${t('clan_hours_short', 'ч.')}`}</span>
                                </span>
                              )}

                              {dossier.age && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                  {dossier.age} {t('clan_years', 'лет')}
                                </span>
                              )}

                              {Number(dossier.overallRating) > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-900/50">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{dossier.overallRating}/5</span>
                                </span>
                              )}

                              {(dossier.cheaterStatus === 'CONFIRMED' || (dossier.cheaterReport && !dossier.cheaterStatus)) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-200 dark:border-red-800">
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                  <span>{t('clan_dossier_badge_cheater_confirmed') || 'Читер'}</span>
                                </span>
                              )}
                              {dossier.cheaterStatus === 'SUSPICION' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  <span>{t('clan_dossier_badge_cheater_suspicion') || 'Подозрение'}</span>
                                </span>
                              )}
                            </div>

                            {/* Notes preview */}
                            {dossier.notes && (
                              <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                "{dossier.notes}"
                              </p>
                            )}
                          </div>

                          {/* Action button */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedProfileForDossier(dossier)}
                              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-orange-500 text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-500 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>{t('clan_dossier_open_btn') || 'Открыть карточку'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (() => {
              const handleStatsSort = (field) => {
                if (statsSortField === field) {
                  setStatsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setStatsSortField(field);
                  setStatsSortOrder(field === 'displayName' ? 'asc' : 'desc');
                }
              };

              const sortedStats = !statsData || !Array.isArray(statsData) ? [] : [...statsData].sort((a, b) => {
                let cmp = 0;
                if (statsSortField === 'displayName') {
                  const nameA = (a.displayName || a.username || '').toLowerCase();
                  const nameB = (b.displayName || b.username || '').toLowerCase();
                  cmp = nameA.localeCompare(nameB);
                } else {
                  const valA = Number(a[statsSortField]) || 0;
                  const valB = Number(b[statsSortField]) || 0;
                  cmp = valA - valB;
                }
                return statsSortOrder === 'asc' ? cmp : -cmp;
              });

              return (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        {t('clan_stats_title') || 'Статистика участников'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_stats_sort_tip')}
                      </p>
                    </div>
                    <button onClick={() => setStatsData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center self-start sm:self-auto cursor-pointer">
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      {t('clan_auto_73', 'Обновить')}
                    </button>
                  </div>
                  
                  {!statsData ? (
                    <StatsTableSkeleton rows={8} />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/60 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 select-none">
                          <tr>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('displayName')} 
                              className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{t('clan_stats_col_member') || 'Участник'}</span>
                                {statsSortField === 'displayName' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('voiceTime')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_voice') || 'Время в Voice'}</span>
                                {statsSortField === 'voiceTime' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('messageCount')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_messages') || 'Сообщения'}</span>
                                {statsSortField === 'messageCount' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('wipesPlayed')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_wipes') || 'Вайпы'}</span>
                                {statsSortField === 'wipesPlayed' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('votesCast')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_votes') || 'Голосования'}</span>
                                {statsSortField === 'votesCast' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              onClick={() => handleStatsSort('warnCount')} 
                              className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{t('clan_stats_col_warns') || 'Варны'}</span>
                                {statsSortField === 'warnCount' ? (
                                  <span className="text-blue-500 font-bold">{statsSortOrder === 'asc' ? '↑' : '↓'}</span>
                                ) : (
                                  <span className="text-slate-400/60 text-[10px]">↕</span>
                                )}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStats.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-8 text-center">{t('clan_auto_74', 'Нет данных для отображения.')}</td>
                            </tr>
                          ) : (
                            sortedStats.map(stat => (
                              <tr key={stat.userId} className="bg-white border-b dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white flex items-center">
                                  <img src={stat.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="w-8 h-8 rounded-full mr-3" />
                                  <div>
                                    <div className={!stat.isMember ? "text-slate-400 line-through" : ""}>{stat.displayName}</div>
                                    <div className="text-[10px] text-slate-500">@{stat.username}</div>
                                  </div>
                                </th>
                                <td className="px-6 py-4 text-center font-mono">
                                  {Math.floor(stat.voiceTime / 3600)}{t('clan_h_short', 'ч')} {Math.floor((stat.voiceTime % 3600) / 60)}{t('clan_m_short', 'м')}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.messageCount}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.wipesPlayed}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {stat.votesCast}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => openUserWarningsModal(stat)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                      (stat.warnCount || 0) > 0
                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border border-transparent'
                                    }`}
                                    title={t('clan_stats_warns_tooltip') || 'Нажмите для управления предупреждениями'}
                                  >
                                    {(stat.warnCount || 0) > 0 ? (
                                      <>
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>{stat.warnCount}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                        <span>0</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === 'logs' && (() => {
              let logCfg = { enabled: false, defaultChannelId: '', events: {} };
              try {
                if (config?.loggingConfigJson) {
                  logCfg = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
                  if (!logCfg.events) logCfg.events = {};
                }
              } catch (e) {}

              const isMasterEnabled = Boolean(logCfg.enabled);
              const defaultChId = logCfg.defaultChannelId || '';
              const textChannels = (discordInfo?.channels || []).filter(c => c.type === 0);
              const defaultChObj = textChannels.find(c => c.id === defaultChId);
              const defaultChName = defaultChObj ? defaultChObj.name : '';

              const handleMasterToggle = (val) => {
                const updated = { ...logCfg, enabled: val };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleDefaultChannelChange = (val) => {
                const updated = { ...logCfg, defaultChannelId: val };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleToggleEvent = (key, val) => {
                const events = { ...(logCfg.events || {}) };
                const cur = events[key] || { enabled: true, channelId: '' };
                events[key] = { ...cur, enabled: val };
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleEventChannelChange = (key, chId) => {
                const events = { ...(logCfg.events || {}) };
                const cur = events[key] || { enabled: true, channelId: '' };
                events[key] = { ...cur, channelId: chId };
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleEnableAll = () => {
                const events = { ...(logCfg.events || {}) };
                loggingEventGroups.forEach(g => {
                  g.events.forEach(ev => {
                    const cur = events[ev.key] || { channelId: '' };
                    events[ev.key] = { ...cur, enabled: true };
                  });
                });
                const updated = { ...logCfg, events, enabled: true };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleDisableAll = () => {
                const events = { ...(logCfg.events || {}) };
                loggingEventGroups.forEach(g => {
                  g.events.forEach(ev => {
                    const cur = events[ev.key] || { channelId: '' };
                    events[ev.key] = { ...cur, enabled: false };
                  });
                });
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleResetChannelsToDefault = () => {
                const events = { ...(logCfg.events || {}) };
                Object.keys(events).forEach(k => {
                  events[k] = { ...events[k], channelId: '' };
                });
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              return (
                <form onSubmit={saveConfig} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ScrollText className="w-5 h-5 text-blue-500" />
                      <span>{t('clan_logs_title')}</span>
                    </h3>

                    {/* Master Switch */}
                    <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                      <ToggleSwitch
                        checked={isMasterEnabled}
                        onChange={handleMasterToggle}
                        activeColor="blue"
                      />
                    </div>
                  </div>

                  {/* Default Channel Card - Compact & Tautology-free */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-800/60 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t('clan_logs_default_channel')}:
                      </span>
                      {defaultChId ? (
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          #{defaultChName || defaultChId}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          {t('clan_logs_channel_not_set') || 'Не задан'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 items-center gap-2 max-w-lg md:ml-auto">
                      <select
                        value={defaultChId}
                        onChange={e => handleDefaultChannelChange(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs transition-all"
                      >
                        <option value="">{t('clan_logs_select_channel_ph') || '-- Выберите канал --'}</option>
                        {textChannels.map(ch => (
                          <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleCreateDiscordLogChannel}
                        disabled={creatingLogChannel}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {creatingLogChannel ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('clan_logs_creating_channel')}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('clan_logs_create_channel_btn')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-amber-50/20 to-slate-50 dark:from-slate-800/60 dark:via-slate-800/30 dark:to-slate-800/60 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
                        <Zap className="w-4 h-4 fill-amber-500/30 text-amber-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                        {t('clan_logs_quick_actions') || 'Быстрые действия:'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEnableAll}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/70 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('clan_logs_enable_all')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDisableAll}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700/70 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-500" />
                        <span>{t('clan_logs_disable_all')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetChannelsToDefault}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/70 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t('clan_logs_reset_channels')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Event Groups */}
                  <div className="space-y-4">
                    {loggingEventGroups.map(group => {
                      const GroupIcon = group.icon;
                      const enabledCount = group.events.filter(ev => logCfg.events?.[ev.key]?.enabled !== false).length;
                      return (
                        <div key={group.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                          {/* Group Header */}
                          <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
                                <GroupIcon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {t(`clan_logs_group_${group.id}`) || group.title}
                              </span>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {enabledCount} / {group.events.length}
                            </span>
                          </div>

                          {/* Events List */}
                          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {group.events.map(ev => {
                              const evSettings = logCfg.events?.[ev.key] || { enabled: true, channelId: '' };
                              const isEvEnabled = evSettings.enabled !== false;
                              const evChannelId = evSettings.channelId || '';

                              return (
                                <div
                                  key={ev.key}
                                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                    isEvEnabled ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-950/20 opacity-60'
                                  }`}
                                >
                                  {/* Toggle + Title */}
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="pt-0.5 shrink-0">
                                      <ToggleSwitch
                                        checked={isEvEnabled}
                                        onChange={val => handleToggleEvent(ev.key, val)}
                                        activeColor="blue"
                                        size="sm"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{t(`clan_logs_event_${ev.key}`) || ev.title}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        {t(`clan_logs_event_${ev.key}_desc`) || ev.desc}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Channel Selector */}
                                  <div className="md:w-64 shrink-0 pl-7 md:pl-0">
                                    <select
                                      value={evChannelId}
                                      onChange={e => handleEventChannelChange(ev.key, e.target.value)}
                                      disabled={!isEvEnabled}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <option value="">
                                        {defaultChName ? `(${t('clan_by_default_prefix', 'По умолч.:')} #${defaultChName})` : `(${t('clan_by_default', 'По умолчанию')})`}
                                      </option>
                                      {textChannels.map(ch => (
                                        <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </form>
              );
            })()}

            {activeTab === 'moderation' && (() => {
              let modCfg = {
                logChannelId: '',
                antiMention: {
                  enabled: false,
                  maxMentions: 5,
                  timeWindowSeconds: 10,
                  countUsers: true,
                  countRoles: true,
                  countEveryone: true,
                  action: 'timeout',
                  durationMinutes: 10,
                  autoDelete: true,
                  warnMessage: t('clan_auto_234', 'Массовые упоминания запрещены на этом сервере!'),
                  ignoreRoles: [],
                  ignoreChannels: []
                },
                badWords: {
                  enabled: false,
                  words: [...DEFAULT_BAD_WORDS],
                  action: 'timeout',
                  durationMinutes: 10,
                  autoDelete: true,
                  warnMessage: t('clan_auto_235', 'Использование запретных выражений недопустимо на нашем сервере!'),
                  ignoreRoles: [],
                  ignoreChannels: []
                },
                warnings: {
                  enabled: true,
                  threshold: 3,
                  action: 'timeout',
                  durationMinutes: 60,
                  ignoreRoles: []
                }
              };
              try {
                if (config?.moderationConfigJson) {
                  const parsed = typeof config.moderationConfigJson === 'string' ? JSON.parse(config.moderationConfigJson) : config.moderationConfigJson;
                  modCfg = {
                    ...modCfg,
                    ...parsed,
                    antiMention: {
                      ...modCfg.antiMention,
                      ...(parsed.antiMention || {})
                    },
                    badWords: {
                      ...modCfg.badWords,
                      ...(parsed.badWords || {})
                    },
                    warnings: {
                      ...modCfg.warnings,
                      ...(parsed.warnings || {})
                    }
                  };
                }
              } catch (e) {}

              const am = modCfg.antiMention;
              const bw = modCfg.badWords;
              const warns = modCfg.warnings;
              const textChannels = (discordInfo?.channels || []).filter(c => c.type === 0);
              const allRoles = discordInfo?.roles || [];

              const isLeadershipRole = (roleId) => {
                return Boolean(
                  roleId && (
                    roleId === config?.leaderRoleId ||
                    roleId === config?.deputyLeaderRoleId
                  )
                );
              };

              const handleUpdateAM = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  antiMention: {
                    ...am,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleUpdateBW = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  badWords: {
                    ...bw,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleUpdateWarn = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  warnings: {
                    ...warns,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleAddBadWord = (word) => {
                const clean = (word || '').trim().toLowerCase();
                if (!clean) return;
                const currentWords = Array.isArray(bw.words) ? [...bw.words] : [];
                if (!currentWords.includes(clean)) {
                  currentWords.push(clean);
                  handleUpdateBW('words', currentWords, true);
                }
                setNewBadWordInput('');
              };

              const handleRemoveBadWord = (wordToRemove) => {
                const currentWords = Array.isArray(bw.words) ? [...bw.words] : [];
                const filtered = currentWords.filter(w => w !== wordToRemove);
                handleUpdateBW('words', filtered, true);
              };

              const handleResetBadWords = () => {
                handleUpdateBW('words', [...DEFAULT_BAD_WORDS], true);
              };

              const handleClearBadWords = () => {
                handleUpdateBW('words', [], true);
              };

              const handleUpdateModRoot = (field, val, immediate = true) => {
                const updated = { ...modCfg, [field]: val };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleToggleRoleWhitelist = (roleId) => {
                const current = Array.isArray(am.ignoreRoles) ? [...am.ignoreRoles] : [];
                const idx = current.indexOf(roleId);
                if (idx === -1) current.push(roleId);
                else current.splice(idx, 1);
                const updated = {
                  ...modCfg,
                  antiMention: { ...am, ignoreRoles: current },
                  badWords: { ...bw, ignoreRoles: current }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, true);
              };

              const handleToggleChannelWhitelist = (chId) => {
                const current = Array.isArray(am.ignoreChannels) ? [...am.ignoreChannels] : [];
                const idx = current.indexOf(chId);
                if (idx === -1) current.push(chId);
                else current.splice(idx, 1);
                const updated = {
                  ...modCfg,
                  antiMention: { ...am, ignoreChannels: current },
                  badWords: { ...bw, ignoreChannels: current }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, true);
              };

              return (
                <form onSubmit={saveConfig} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      <span>{t('clan_mod_title')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('clan_mod_desc')}
                    </p>
                  </div>

                  {/* Anti-Mass-Mention Main Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{t('clan_mod_anti_mention_title')}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_mod_anti_mention_desc')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <ToggleSwitch
                          checked={Boolean(am.enabled)}
                          onChange={val => handleUpdateAM('enabled', val)}
                          activeColor="blue"
                        />
                      </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_max_mentions')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_max_mentions_hint')}
                        </p>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={am.maxMentions || 5}
                          onChange={e => handleUpdateAM('maxMentions', parseInt(e.target.value, 10) || 5, false)}
                          onBlur={e => {
                            const val = parseInt(e.target.value, 10) || 5;
                            if (val !== am.maxMentions) handleUpdateAM('maxMentions', val, true);
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_time_window')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_time_window_hint')}
                        </p>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={am.timeWindowSeconds || 10}
                          onChange={e => handleUpdateAM('timeWindowSeconds', parseInt(e.target.value, 10) || 10, false)}
                          onBlur={e => {
                            const val = parseInt(e.target.value, 10) || 10;
                            if (val !== am.timeWindowSeconds) handleUpdateAM('timeWindowSeconds', val, true);
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* What to count checkboxes */}
                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('clan_auto_75', 'Что учитывать при подсчете:')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countUsers !== false}
                            onChange={e => handleUpdateAM('countUsers', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_users')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countRoles !== false}
                            onChange={e => handleUpdateAM('countRoles', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_roles')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countEveryone !== false}
                            onChange={e => handleUpdateAM('countEveryone', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_everyone')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Action & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_action')}
                        </label>
                        <select
                          value={am.action || 'timeout'}
                          onChange={e => handleUpdateAM('action', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="warn">⚠️ {t('clan_mod_action_warn')}</option>
                          <option value="timeout">🔇 {t('clan_mod_action_timeout')}</option>
                          <option value="kick">👢 {t('clan_mod_action_kick')}</option>
                          <option value="ban">🔨 {t('clan_mod_action_ban')}</option>
                        </select>
                      </div>

                      {am.action === 'timeout' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_mod_timeout_duration')}
                          </label>
                          <select
                            value={am.durationMinutes || 10}
                            onChange={e => handleUpdateAM('durationMinutes', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>{t('clan_mod_timeout_1m')}</option>
                            <option value={5}>{t('clan_mod_timeout_5m')}</option>
                            <option value={10}>{t('clan_mod_timeout_10m')}</option>
                            <option value={30}>{t('clan_mod_timeout_30m')}</option>
                            <option value={60}>{t('clan_mod_timeout_1h')}</option>
                            <option value={360}>{t('clan_mod_timeout_6h')}</option>
                            <option value={1440}>{t('clan_mod_timeout_1d')}</option>
                            <option value={10080}>{t('clan_mod_timeout_1w')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Auto-delete toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 select-none">
                        {t('clan_mod_auto_delete')}
                      </span>
                      <ToggleSwitch
                        checked={am.autoDelete !== false}
                        onChange={val => handleUpdateAM('autoDelete', val)}
                        activeColor="blue"
                        size="sm"
                      />
                    </div>

                    {/* Warning text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('clan_mod_warn_msg')}
                      </label>
                      <input
                        type="text"
                        value={am.warnMessage || ''}
                        placeholder={t('clan_mod_warn_msg_default')}
                        onChange={e => handleUpdateAM('warnMessage', e.target.value, false)}
                        onBlur={e => {
                          if (e.target.value !== (am.warnMessage || '')) {
                            handleUpdateAM('warnMessage', e.target.value, true);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Bad Words Filter Main Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          <span>{t('clan_mod_badwords_title')}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_mod_badwords_desc')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <ToggleSwitch
                          checked={Boolean(bw.enabled)}
                          onChange={val => handleUpdateBW('enabled', val)}
                          activeColor="blue"
                        />
                      </div>
                    </div>

                    {/* Action & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_action')}
                        </label>
                        <select
                          value={bw.action || 'timeout'}
                          onChange={e => handleUpdateBW('action', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="delete_only">🗑️ {t('clan_mod_action_delete_only')}</option>
                          <option value="warn">⚠️ {t('clan_mod_action_warn')}</option>
                          <option value="timeout">🔇 {t('clan_mod_action_timeout')}</option>
                          <option value="kick">👢 {t('clan_mod_action_kick')}</option>
                          <option value="ban">🔨 {t('clan_mod_action_ban')}</option>
                        </select>
                      </div>

                      {bw.action === 'timeout' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_mod_timeout_duration')}
                          </label>
                          <select
                            value={bw.durationMinutes || 10}
                            onChange={e => handleUpdateBW('durationMinutes', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>{t('clan_mod_timeout_1m')}</option>
                            <option value={5}>{t('clan_mod_timeout_5m')}</option>
                            <option value={10}>{t('clan_mod_timeout_10m')}</option>
                            <option value={30}>{t('clan_mod_timeout_30m')}</option>
                            <option value={60}>{t('clan_mod_timeout_1h')}</option>
                            <option value={360}>{t('clan_mod_timeout_6h')}</option>
                            <option value={1440}>{t('clan_mod_timeout_1d')}</option>
                            <option value={10080}>{t('clan_mod_timeout_1w')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Auto-delete toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 select-none">
                        {t('clan_mod_auto_delete')}
                      </span>
                      <ToggleSwitch
                        checked={bw.autoDelete !== false}
                        onChange={val => handleUpdateBW('autoDelete', val)}
                        activeColor="blue"
                        size="sm"
                      />
                    </div>

                    {/* Warning text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('clan_mod_warn_msg')}
                      </label>
                      <input
                        type="text"
                        value={bw.warnMessage || ''}
                        placeholder={t('clan_mod_badwords_warn_default')}
                        onChange={e => handleUpdateBW('warnMessage', e.target.value, false)}
                        onBlur={e => {
                          if (e.target.value !== (bw.warnMessage || '')) {
                            handleUpdateBW('warnMessage', e.target.value, true);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Words List Header and Controls */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t('clan_mod_badwords_list_title')}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {(bw.words || []).length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetBadWords}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t('clan_mod_badwords_reset_btn')}</span>
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            type="button"
                            onClick={handleClearBadWords}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t('clan_mod_badwords_clear_btn')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Add Word Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBadWordInput}
                          onChange={e => setNewBadWordInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBadWord(newBadWordInput);
                            }
                          }}
                          placeholder={t('clan_mod_badwords_add_ph')}
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddBadWord(newBadWordInput)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('clan_mod_badwords_add_btn')}</span>
                        </button>
                      </div>

                      {/* Word Pills */}
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 bg-slate-50/60 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        {(!bw.words || bw.words.length === 0) ? (
                          <span className="text-xs text-slate-400 italic py-2 px-1">{t('clan_auto_76', 'Список пуст')}</span>
                        ) : (
                          bw.words.map((word, idx) => (
                            <span
                              key={`${word}-${idx}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs group"
                            >
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBadWord(word)}
                                className="text-slate-400 hover:text-red-500 rounded p-0.5 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Moderation Log Channel Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('clan_mod_log_channel')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('clan_mod_log_channel_hint')}
                    </p>
                    <div className="max-w-md">
                      <select
                        value={modCfg.logChannelId || ''}
                        onChange={e => handleUpdateModRoot('logChannelId', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t('clan_auto_77', '(По умолчанию: основной канал логов)')}</option>
                        {textChannels.map(ch => (
                          <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Whitelists Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('clan_auto_78', 'Исключения (Белый список)')}
                    </h4>

                    {/* Roles Whitelist */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_roles')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_roles_desc')}
                        <span className="block mt-0.5 text-amber-600 dark:text-amber-400 font-medium">
                          • {t('clan_mod_auto_exempt_hint')}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allRoles.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">{t('clan_auto_79', 'Роли не загружены')}</span>
                        ) : (
                          allRoles.map(r => {
                            const isAuto = isLeadershipRole(r.id);
                            const isIgnored = isAuto || (Array.isArray(am.ignoreRoles) && am.ignoreRoles.includes(r.id));
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  if (isAuto) return;
                                  handleToggleRoleWhitelist(r.id);
                                }}
                                title={isAuto ? t('clan_mod_auto_exempt_hint') : undefined}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                  isAuto
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 cursor-default'
                                    : isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm cursor-pointer'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: r.color && r.color !== '#000000' ? r.color : '#94a3b8' }}
                                ></span>
                                <span>{r.name}</span>
                                {isAuto ? (
                                  <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                                    {t('clan_mod_auto_exempt_badge') || 'Авто'}
                                  </span>
                                ) : isIgnored ? (
                                  <Check className="w-3 h-3" />
                                ) : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Channels Whitelist */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_channels')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_channels_desc')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {textChannels.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">{t('clan_auto_80', 'Каналы не загружены')}</span>
                        ) : (
                          textChannels.map(ch => {
                            const isIgnored = Array.isArray(am.ignoreChannels) && am.ignoreChannels.includes(ch.id);
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => handleToggleChannelWhitelist(ch.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>#️⃣ {ch.name}</span>
                                {isIgnored && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning System (Warns) Settings Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('clan_warn_settings_title') || 'Система предупреждений (Варны)'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {t('clan_warn_settings_desc') || 'Автоматический учет нарушений и применение санкций при превышении лимита.'}
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={warns?.enabled !== false}
                        onChange={val => handleUpdateWarn('enabled', val, true)}
                        activeColor="orange"
                      />
                    </div>

                    {warns?.enabled !== false && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              {t('clan_warn_threshold') || 'Порог срабатывания (варнов)'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={warns?.threshold || 3}
                              onChange={e => handleUpdateWarn('threshold', Math.max(1, parseInt(e.target.value, 10) || 1), false)}
                              onBlur={e => handleUpdateWarn('threshold', Math.max(1, parseInt(e.target.value, 10) || 1), true)}
                              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/50 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/50 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              {t('clan_warn_action') || 'Наказание при превышении'}
                            </label>
                            <select
                              value={
                                warns?.action === 'kick' ? 'kick' :
                                warns?.action === 'ban' ? 'ban' :
                                warns?.durationMinutes === 1440 ? 'timeout_1440' :
                                warns?.durationMinutes === 10080 ? 'timeout_10080' :
                                'timeout_60'
                              }
                              onChange={e => {
                                const val = e.target.value;
                                if (val === 'kick') {
                                  handleUpdateWarn('action', 'kick', true);
                                } else if (val === 'ban') {
                                  handleUpdateWarn('action', 'ban', true);
                                } else if (val === 'timeout_1440') {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 1440, true);
                                } else if (val === 'timeout_10080') {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 10080, true);
                                } else {
                                  handleUpdateWarn('action', 'timeout', false);
                                  handleUpdateWarn('durationMinutes', 60, true);
                                }
                              }}
                              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800/50 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/50 outline-none cursor-pointer"
                            >
                              <option value="timeout_60">{t('clan_warn_action_timeout_60') || 'Таймаут (Мут) на 1 час'}</option>
                              <option value="timeout_1440">{t('clan_warn_action_timeout_1440') || 'Таймаут (Мут) на 1 день'}</option>
                              <option value="timeout_10080">{t('clan_warn_action_timeout_10080') || 'Таймаут (Мут) на 1 неделю'}</option>
                              <option value="kick">{t('clan_warn_action_kick') || 'Кик с сервера'}</option>
                              <option value="ban">{t('clan_warn_action_ban') || 'Бан на сервере'}</option>
                            </select>
                          </div>
                        </div>

                        {/* Clan Warnings Log */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {t('clan_warn_log_title') || 'Журнал предупреждений клана'}
                            </h5>
                            <button
                              type="button"
                              onClick={fetchClanWarnings}
                              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${loadingClanWarnings ? 'animate-spin' : ''}`} />
                              <span>{t('clan_auto_81', 'Обновить')}</span>
                            </button>
                          </div>

                          {clanWarnings.length === 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-center text-xs text-slate-400">
                              {t('clan_auto_82', 'Предупреждений нет или они не загружены.')}
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase select-none border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                    <th className="px-4 py-2.5">{t('clan_auto_83', 'Участник')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_84', 'Причина')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_85', 'Модератор')}</th>
                                    <th className="px-4 py-2.5">{t('clan_auto_86', 'Дата')}</th>
                                    <th className="px-4 py-2.5 text-center">{t('clan_auto_87', 'Статус')}</th>
                                    <th className="px-4 py-2.5 text-right">{t('clan_auto_88', 'Действие')}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {clanWarnings.map(w => (
                                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                                        {w.userName || w.userId}
                                      </td>
                                      <td className="px-4 py-2.5 font-mono text-[11px] max-w-xs truncate" title={w.reason}>
                                        {w.reason}
                                      </td>
                                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                                        {w.moderatorTag || t('clan_system', 'Система')}
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-400">
                                        {new Date(w.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        {w.active ? (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            {t('clan_auto_89', t('clan_warn_active', 'Активен'))}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            {t('clan_auto_90', t('clan_warn_removed', 'Снят'))}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        {w.active && (
                                          <button
                                            type="button"
                                            disabled={warnActionLoading}
                                            onClick={() => handleRemoveWarn(w.id)}
                                            className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium disabled:opacity-50"
                                          >
                                            {t('clan_auto_v2_1040', t('clan_warn_remove', 'Снять'))}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              );
            })()}
            
          </div>
        </div>

        {/* Discord Companion Window (Real Discord Desktop Dimensions) */}
        {isCompanionWindowVisible && previewData && (
          <aside className="w-[580px] 2xl:w-[600px] shrink-0 h-full flex flex-col min-h-0">
            <DiscordMessagePreview
              channelName={previewData.channelName}
              botName={config?.name ? `Clan Manager (${config.name})` : 'Clan Manager'}
              embed={previewData.embed}
              buttons={previewData.buttons}
              templates={previewData.templates}
              activeTemplateIndex={previewData.activeTemplateIndex}
              onSelectTemplate={(idx) => setPreviewVoteIndex(idx)}
              onClose={() => setShowDiscordLivePreview(false)}
              tabTitle={previewData.tabTitle}
            />
          </aside>
        )}
      </>
    ) : (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl font-medium border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center text-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-red-700 dark:text-red-300">
              {t('clan_failed')}
            </h3>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400/80 font-mono max-w-md">
                {error === 'Not linked or bot offline' 
                  ? (t('clan_err_bot_offline') || 'Бот не в сети или сервер не привязан. Убедитесь, что бот запущен.')
                  : error}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchConfig();
              fetchDiscordInfo();
            }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('clan_retry') || 'Повторить попытку'}</span>
          </button>
        </div>
      )}
      
      {showSetupWizard && (
        <SetupWizard 
          initialClanName={config?.name || ''}
          channelCount={(discordInfo?.channels || []).filter(c => c.type === 0 || c.type === 2).length}
          onClose={() => setShowSetupWizard(false)}
          onConfirm={startAutoSetup}
          onManualSetup={(enteredName) => {
            setShowSetupWizard(false);
            if (enteredName && enteredName.trim()) {
              handleClanNameChange(enteredName.trim(), true);
            }
            setActiveTab('roles');
          }}
        />
      )}

      {/* Initial Clan Name Prompt Modal if no clan name is set yet */}
      <InitialClanNameModal
        isOpen={isInitialNameModalOpen}
        onClose={() => setInitialNameDismissed(true)}
        onSave={(newName) => {
          handleClanNameChange(newName, true);
          setInitialNameDismissed(true);
        }}
        onOpenWizard={() => {
          setInitialNameDismissed(true);
          setShowSetupWizard(true);
        }}
        t={t}
      />

      {/* Role Sync Progress / Verification Modal */}
      {syncModalData && syncModalData.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              {syncModalData.isFailed ? (
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {syncModalData.isFailed 
                    ? (t('clan_sync_failed_title') || 'Ошибка синхронизации роли')
                    : (t('clan_sync_in_progress') || 'Синхронизация языка ролей...')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {syncModalData.isFailed
                    ? (t('clan_sync_failed_desc') || 'Не удалось применить новое название роли в Discord.')
                    : `${t('clan_sync_step') || 'Обработка'}: ${syncModalData.currentStep} / ${syncModalData.totalSteps}`}
                </p>
              </div>
            </div>

            {!syncModalData.isFailed ? (
              <div className="space-y-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((syncModalData.currentStep / Math.max(syncModalData.totalSteps, 1)) * 100)}%` }}
                  ></div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{t('clan_sync_current_role') || 'Роль'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{syncModalData.currentRoleName}</span>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  {t('clan_sync_verifying_hint') || 'Бот меняет имя, верифицирует изменения и в случае ошибки выполняет повторную попытку.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1.5">
                  <div className="font-semibold">{syncModalData.failedRoleName}</div>
                  <div className="font-mono text-[11px] opacity-90">{syncModalData.errorText}</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{t('clan_sync_telegram_reported') || 'Отчет об ошибке автоматически отправлен в Telegram разработчикам.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncModalData(null)}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {t('clan_sync_close') || 'Закрыть'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-setup Progress Modal */}
      {autoSetupModalData && autoSetupModalData.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              {autoSetupModalData.status === 'loading' && (
                <div className="relative w-16 h-16 mx-auto mb-3.5 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin"></div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-500/30 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
                  </div>
                </div>
              )}
              {autoSetupModalData.status === 'success' && (
                <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Check className="w-8 h-8" />
                </div>
              )}
              {autoSetupModalData.status === 'error' && (
                <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {autoSetupModalData.status === 'loading' && t('clan_wizard_progress_title', 'Автоматическая настройка сервера...')}
                {autoSetupModalData.status === 'success' && t('clan_wizard_success_title', 'Настройка успешно завершена!')}
                {autoSetupModalData.status === 'error' && t('clan_wizard_error_title', 'Ошибка настройки сервера')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {autoSetupModalData.status === 'loading' && t('clan_wizard_progress_desc', 'Бот проверяет существующие роли и каналы, связывает похожие и настраивает сервер. Пожалуйста, подождите...')}
                {autoSetupModalData.status === 'success' && t('clan_wizard_success_desc', 'Все роли, категории и каналы успешно проверены, привязаны и настроены.')}
                {autoSetupModalData.status === 'error' && (autoSetupModalData.error || t('clan_wizard_error_desc', 'Не удалось завершить автоматическую настройку.'))}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              {[
                { num: 1, label: t('clan_wizard_step_init', 'Синхронизация профиля и названия клана') },
                { num: 2, label: t('clan_wizard_step_roles', 'Проверка и привязка ролей клана') },
                { num: 3, label: t('clan_wizard_step_channels', 'Проверка и привязка категорий и каналов') },
                { num: 4, label: t('clan_wizard_step_perms', 'Настройка прав доступа к каналам') }
              ].map(s => {
                const isDone = autoSetupModalData.status === 'success' || (autoSetupModalData.status === 'loading' && s.num < autoSetupModalData.currentStep);
                const isCurrent = autoSetupModalData.status === 'loading' && s.num === autoSetupModalData.currentStep;
                return (
                  <div 
                    key={s.num}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all ${
                      isDone 
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium'
                        : isCurrent
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">
                          {s.num}
                        </div>
                      )}
                    </div>
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {autoSetupModalData.status === 'error' && (
              <button
                type="button"
                onClick={() => setAutoSetupModalData(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {t('common_close', 'Закрыть')}
              </button>
            )}
            {autoSetupModalData.status === 'success' && (
              <button
                type="button"
                onClick={() => setAutoSetupModalData(null)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {t('common_done', 'Готово')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selective Factory Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('clan_reset_modal_title') || 'Сброс к заводским настройкам'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('clan_reset_modal_desc') || 'Выберите разделы, которые требуется сбросить'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between mb-2.5 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('clan_reset_select_sections') || 'Разделы для сброса:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResetSections(['roles', 'channels', 'permissions', 'voice', 'recruitment', 'applications', 'ads', 'logging', 'moderation', 'general'])}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  {t('clan_reset_select_all') || 'Выбрать все'}
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setResetSections([])}
                  className="text-slate-500 dark:text-slate-400 hover:underline font-medium cursor-pointer"
                >
                  {t('clan_reset_deselect_all') || 'Снять все'}
                </button>
              </div>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2 mb-4 overflow-y-auto flex-1 min-h-0 pr-1.5 scrollbar-thin">
              {[
                { id: 'roles', title: t('clan_reset_sec_roles_title') || 'Роли', desc: t('clan_reset_sec_roles_desc') || 'Восстановление стандартных ролей, удаление кастомных ролей и отвязка ID ролей Discord' },
                { id: 'channels', title: t('clan_reset_sec_channels_title') || 'Каналы', desc: t('clan_reset_sec_channels_desc') || 'Сброс привязок категорий и текстовых каналов (тикеты, заявки, логи)' },
                { id: 'permissions', title: t('clan_reset_sec_permissions_title') || 'Права доступа', desc: t('clan_reset_sec_permissions_desc') || 'Сброс всех настроек разрешений и правил приватности каналов' },
                { id: 'voice', title: t('clan_reset_sec_voice_title') || 'Динамические войсы', desc: t('clan_reset_sec_voice_desc') || 'Отключение Join-to-Create, сброс триггер-канала и категории временных комнат' },
                { id: 'logging', title: t('clan_reset_sec_logging_title') || 'Логирование', desc: t('clan_reset_sec_logging_desc') || 'Сброс настроек каналов логирования и отключение отслеживаемых событий аудита' },
                { id: 'moderation', title: t('clan_reset_sec_moderation_title') || 'Модерация', desc: t('clan_reset_sec_moderation_desc') || 'Сброс правил анти-спама, фильтрации упоминаний и белых списков' },
                { id: 'recruitment', title: t('clan_reset_sec_recruitment_title') || t('clan_rec_base', 'Набор в клан'), desc: t('clan_reset_sec_recruitment_desc') || 'Сброс требований к возрасту и часам в Rust, параметров авто-отклонений, тикетов и очистка заявок' },
                { id: 'applications', title: t('clan_reset_sec_applications_title') || 'Журнал заявок', desc: t('clan_reset_sec_applications_desc') || 'Очистка всех поданных анкет, истории рассмотрения заявок и архива тикетов' },
                { id: 'ads', title: t('clan_reset_sec_ads_title') || 'Реклама и партнерство', desc: t('clan_reset_sec_ads_desc') || 'Сброс текста авто-объявлений, интервалов рассылки и привязанных каналов' },
                { id: 'general', title: t('clan_reset_sec_general_title') || 'Основные настройки', desc: t('clan_reset_sec_general_desc') || 'Сброс названия клана, ссылки Discord и закрытие набора в клан' },
              ].map(sec => {
                const isChecked = resetSections.includes(sec.id);
                return (
                  <label
                    key={sec.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                        : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) {
                          setResetSections(prev => [...prev, sec.id]);
                        } else {
                          setResetSections(prev => prev.filter(x => x !== sec.id));
                        }
                      }}
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{sec.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{sec.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {t('clan_reset_cancel') || 'Отмена'}
              </button>
              <button
                type="button"
                onClick={handleExecuteFactoryReset}
                disabled={isResetting || resetSections.length === 0}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('clan_reset_processing') || 'Сброс...'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('clan_reset_submit') || 'Сбросить выбранное'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Warnings Details & Management Modal */}
      {selectedUserForWarns && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForWarns.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedUserForWarns.displayName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      ⚠️ {userWarningsList.filter(w => w.active).length} {t('clan_active_warns_count', 'активных')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">@{selectedUserForWarns.username} • ID: {selectedUserForWarns.userId}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForWarns(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-4 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
              {/* Add Warn Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {t('clan_warn_moderator_label') || 'Модератор'}
                    </label>
                    <input
                      type="text"
                      value={warnModerator}
                      onChange={e => setWarnModerator(e.target.value)}
                      placeholder={t('clan_warn_moderator_ph') || 'Ваш ник / Модератор...'}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  {(() => {
                    const leaders = rosterData?.roster?.filter(m => 
                      m.roles?.includes(config?.leaderRoleId) || 
                      m.roles?.includes(config?.deputyLeaderRoleId) ||
                      m.roles?.includes(config?.callerRoleId)
                    ) || [];
                    if (leaders.length === 0) return null;
                    return (
                      <div className="sm:self-end pb-0.5">
                        <div className="text-[10px] text-slate-400 mb-1">{t('clan_auto_91', 'Выбрать лидера:')}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {leaders.slice(0, 3).map(m => {
                            const name = m.displayName || m.username;
                            return (
                              <button
                                key={m.userId || m.id}
                                type="button"
                                onClick={() => setWarnModerator(name)}
                                className="px-2 py-1 rounded-md bg-slate-200/80 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-[10px] font-medium cursor-pointer"
                                title={`${t('clan_specify', 'Указать')} ${name}`}
                              >
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t('clan_warn_reason_ph') || 'Причина предупреждения'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newWarnReason}
                      onChange={e => setNewWarnReason(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddWarn(); } }}
                      placeholder={t('clan_warn_reason_ph') || 'Укажите причину предупреждения...'}
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <button
                      type="button"
                      disabled={warnActionLoading || !newWarnReason.trim()}
                      onClick={handleAddWarn}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      {warnActionLoading ? '...' : (t('clan_warn_add_btn') || 'Выдать')}
                    </button>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t('clan_warns_history_title', 'История варнов')} ({userWarningsList.length})
                  </span>
                  {userWarningsList.some(w => w.active) && (
                    <button
                      type="button"
                      disabled={warnActionLoading}
                      onClick={() => handleClearUserWarns(selectedUserForWarns.userId)}
                      className="text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium disabled:opacity-50"
                    >
                      {t('clan_warn_clear_all') || 'Очистить все варны'}
                    </button>
                  )}
                </div>

                {loadingUserWarnings ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('clan_auto_92', 'Загрузка предупреждений...')}</span>
                  </div>
                ) : userWarningsList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                    {t('clan_auto_93', 'У пользователя нет предупреждений.')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userWarningsList.map(w => (
                      <div
                        key={w.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                          w.active
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60'
                            : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{w.reason}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              w.active ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {w.active ? t('clan_auto_v2_1038', t('clan_warn_active', 'Активен')) : t('clan_auto_v2_1039', t('clan_warn_removed', 'Снят'))}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t('clan_auto_94', 'Модератор:')} <span className="font-semibold text-slate-800 dark:text-slate-200">{w.moderatorTag || t('clan_system', 'Система')}</span> • {new Date(w.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {w.active && (
                          <button
                            type="button"
                            disabled={warnActionLoading}
                            onClick={() => handleRemoveWarn(w.id)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer shrink-0 transition-all"
                          >
                            {t('clan_auto_v2_1041', t('clan_warn_remove', 'Снять'))}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserForWarns(null);
                  setActiveTab('moderation');
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('clan_warn_go_to_mod') || 'Настройки в Модерации'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserForWarns(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                {t('clan_sync_close') || 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Voice Room Limit Modal */}
      {editingRoomLimit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('clan_voice_limit_modal_title') || 'Лимит мест в комнате'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoomLimit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('clan_voice_limit_modal_desc') || 'Укажите количество мест для комнаты'} <span className="font-semibold text-slate-700 dark:text-slate-300">"{editingRoomLimit.name}"</span> {t('clan_auto_95', '(0 — без ограничений, максимум 99):')}
              </p>
              <div>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={editingRoomLimit.limit}
                  onChange={e => {
                    const parsed = parseInt(e.target.value, 10);
                    const val = isNaN(parsed) ? 0 : Math.max(0, Math.min(99, parsed));
                    setEditingRoomLimit(prev => ({ ...prev, limit: val }));
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManageDynamicRoom('set_limit', editingRoomLimit.channelId, { limit: editingRoomLimit.limit });
                      setEditingRoomLimit(null);
                    }
                  }}
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEditingRoomLimit(null)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {t('clan_reset_cancel') || 'Отмена'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleManageDynamicRoom('set_limit', editingRoomLimit.channelId, { limit: editingRoomLimit.limit });
                  setEditingRoomLimit(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                {t('clan_voice_limit_apply') || 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProfileForDossier && (
        <MemberDossierModal
          isOpen={Boolean(selectedProfileForDossier)}
          onClose={() => setSelectedProfileForDossier(null)}
          profile={selectedProfileForDossier}
          onSave={handleSaveDossier}
          onSearchGlobal={handleGlobalSearchDossier}
          onSendCrossClanMessage={handleSendCrossClanMessage}
          userApplications={(applicationsData || []).filter(a => a.userId === selectedProfileForDossier?.userId || a.applicantId === selectedProfileForDossier?.userId)}
          userVotes={(activeVotes || []).filter(v => {
            try {
              const voters = v.votersJson ? JSON.parse(v.votersJson) : [];
              return voters.some(vt => (typeof vt === 'string' ? vt : vt.userId) === selectedProfileForDossier?.userId);
            } catch(e) { return false; }
          })}
          userWarnings={(clanWarnings || []).filter(w => w.userId === selectedProfileForDossier?.userId)}
          onViewTranscript={handleViewTranscript}
          canEdit={true}
        />
      )}

      {transcriptModal.isOpen && (
        <TicketTranscriptModal
          isOpen={transcriptModal.isOpen}
          onClose={() => setTranscriptModal(prev => ({ ...prev, isOpen: false, html: null, app: null, error: null }))}
          loading={transcriptModal.loading}
          html={transcriptModal.html}
          app={transcriptModal.app}
          error={transcriptModal.error}
          onRefresh={() => transcriptModal.app && handleViewTranscript(transcriptModal.app)}
        />
      )}
    </div>
  );
}
