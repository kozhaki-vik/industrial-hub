import { ClanManagerContext } from './ClanManagerContext';
import { DEFAULT_ADS_BANNER } from '../utils/urlHelper';
import GeneralTab from './ClanManagerTabs/GeneralTab';
import RolesTab from './ClanManagerTabs/RolesTab';
import ChannelsTab from './ClanManagerTabs/ChannelsTab';
import PermissionsTab from './ClanManagerTabs/PermissionsTab';
import VoiceTab from './ClanManagerTabs/VoiceTab';
import RecruitmentTab from './ClanManagerTabs/RecruitmentTab';
import VotesTab from './ClanManagerTabs/VotesTab';
import AdsTab from './ClanManagerTabs/AdsTab';
import RosterTab from './ClanManagerTabs/RosterTab';
import DossierTab from './ClanManagerTabs/DossierTab';
import StatsTab from './ClanManagerTabs/StatsTab';
import LogsTab from './ClanManagerTabs/LogsTab';
import ModerationTab from './ClanManagerTabs/ModerationTab';
import ApplicationsTab from './ClanManagerTabs/ApplicationsTab';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../contexts/NetworkContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useDevMode } from './hooks/useDevMode';
import { useClanNetwork } from './hooks/useClanNetwork';
import SetupWizard from '../components/SetupWizard';
import RoleSelect from '../components/RoleSelect';
import ChannelSelect from '../components/ChannelSelect';
import MemberDossierModal from '../components/MemberDossierModal';
import TicketTranscriptModal from '../components/TicketTranscriptModal';
import { 
  Sparkles, Unlink, Volume2, Mic, MicOff, VolumeX, Trash2, UserX, RefreshCw, Sliders, Radio,
  Settings, Users, Hash, ShieldCheck, UserPlus, Vote, Megaphone, UserCheck, BarChart3, Plus, Check,
  RotateCcw, AlertTriangle, ScrollText, ShieldAlert, Zap, CheckCheck, Ban, X, Bot, Clock, Filter,
  BookOpen, Star, Search, ExternalLink, Archive, ArrowUp, ArrowLeft, Eye, EyeOff, Copy, ChevronDown, ChevronRight
} from 'lucide-react';
import { getConfigKey, setConfigKey } from '../services/store';
import DiscordMessagePreview from '../components/DiscordMessagePreview';
import { validateForm, scrollToAndHighlight } from '../utils/formValidation';
import { showConfirm } from '../components/ConfirmModal';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

const DiscordIcon = ({ className = 'w-5 h-5' }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.0777.0777 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
);
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
    } catch (e) { console.error('[Auto-caught Error]', e); }
  }
  if (!hasChannels && cfg.loggingConfigJson) {
    try {
      const lCfg = typeof cfg.loggingConfigJson === 'string' ? JSON.parse(cfg.loggingConfigJson) : cfg.loggingConfigJson;
      if (lCfg?.defaultChannelId) hasChannels = true;
    } catch (e) { console.error('[Auto-caught Error]', e); }
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
          version: '2.23.22',
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
    } catch (e) { console.error('[Auto-caught Error]', e); }
  }

  return sanitized;
};

export function SaveButton() {
  return null;
}

export function ToggleSwitch({ 
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

export default function ClanManager() {
  const { t } = useTranslation();
  const loggingEventGroups = getLoggingEventGroups(t);
  const { ws: rawWs, status: wsStatus } = useNetwork();
  const [status, setStatus] = useState('checking');
  const [guildId, setGuildId] = useState(null);
  const guildIdRef = useRef(guildId);
  useEffect(() => {
    guildIdRef.current = guildId;
  }, [guildId]);

  // Developer Mode / Superadmin States
  const {
    devAdminMode,
    setDevAdminMode,
    isDevAdminActive,
    activeDevGuildIdRef,
    isDevAuthenticated,
    setIsDevAuthenticated,
    devGuilds,
    setDevGuilds,
    devShowServerGrid,
    setDevShowServerGrid,
    isGuildDropdownOpen,
    setIsGuildDropdownOpen,
    guildSearchQuery,
    setGuildSearchQuery,
    loadingDevGuilds,
    setLoadingDevGuilds
  } = useDevMode();

  // Transparent WebSocket wrapper that ensures all proxy calls carry the active Discord guild ID
  const ws = useClanNetwork(rawWs, isDevAdminActive, activeDevGuildIdRef, guildIdRef);

  const [linkCode, setLinkCode] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['Initializing Clan Manager...']);
  const [lastLinkAttempt, setLastLinkAttempt] = useState(0);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [copiedCommand, setCopiedCommand] = useState(false);

  // AFK Inactivity Tracker (5 minutes) & Tab Session Lifecycle
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const trackedEvents = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    trackedEvents.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    const afkTimer = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 5 * 60 * 1000) {
        if (rawWs && rawWs.readyState === WebSocket.OPEN) {
          try {
            rawWs.send(JSON.stringify({ type: 'clan', action: 'session_leave' }));
          } catch (e) { console.error('[Auto-caught Error]', e); }
        }
        addNotification(
          t('clan_afk_timeout', 'Сессия управления кланом закрыта из-за 5 минут неактивности. Вы перенаправлены на главную страницу.'),
          'info',
          10000,
          'AFK System'
        );
        navigate('/');
      }
    }, 5000);

    return () => {
      trackedEvents.forEach(evt => window.removeEventListener(evt, updateActivity));
      clearInterval(afkTimer);
      if (rawWs && rawWs.readyState === WebSocket.OPEN) {
        try {
          rawWs.send(JSON.stringify({ type: 'clan', action: 'session_leave' }));
        } catch (e) { console.error('[Auto-caught Error]', e); }
      }
    };
  }, [rawWs, navigate, addNotification, t]);


  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [viewMode, setViewMode] = useState('clan'); // 'clan' (Daily Clan operations) | 'botConfig' (Technical Bot & Server setup)
  const [activeTab, setActiveTabRaw] = useState('roster');
  const [modSubTab, setModSubTab] = useState('antiMention');
  const [isModExpanded, setIsModExpanded] = useState(true);
  const [rosterData, setRosterData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [activityStatsData, setActivityStatsData] = useState(null);
  const [loadingActivityStats, setLoadingActivityStats] = useState(false);
  const [discordInfo, setDiscordInfo] = useState(null);
  const [activeVotes, setActiveVotes] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const hasPromptedRef = useRef(false);
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

  // Advertising Tickets state
  const [adTicketsData, setAdTicketsData] = useState([]);
  const [loadingAdTickets, setLoadingAdTickets] = useState(false);
  const [applicationsCategory, setApplicationsCategory] = useState('clan'); // 'clan' | 'ads'

  const setActiveTab = useCallback((tab, subCategory) => {
    setActiveTabRaw(tab);
    if (tab === 'applications' && subCategory) {
      setApplicationsCategory(subCategory);
    }
  }, []);

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
      window.innerWidth >= 1200 || 
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
        } catch (e) { console.error('[Auto-caught Error]', e); }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        ws.removeEventListener('message', onMsg);
      };

      ws.addEventListener('message', onMsg);
      const clanSecret = localStorage.getItem('hub_clan_secret') || undefined;
      ws.send(JSON.stringify({
        type: 'clan',
        action: 'proxy',
        reqId,
        clan_secret: clanSecret,
        targetGuildId: (isDevAdminActive && activeDevGuildIdRef.current) ? activeDevGuildIdRef.current : undefined,
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
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_stats_${Date.now()}`, payload: { action: 'get_stats' } }));
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
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_stats_${Date.now()}`, payload: { action: 'get_stats' } }));
      if (activeTab === 'moderation') fetchClanWarnings();
    } else {
      setError(res?.error || t('msg_warn_remove_failed', 'Не удалось снять предупреждение'));
    }
  };

  const handleClearUserWarns = async (userId) => {
    if (!userId) return;
    const confirmed = await showConfirm({
      title: t('msg_warn_clear_title', 'Снятие предупреждений'),
      message: t('msg_warn_clear_confirm', 'Снять все активные предупреждения с данного пользователя?'),
      confirmText: t('confirm_btn', 'Снять'),
      danger: true
    });
    if (!confirmed) return;
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
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_stats_${Date.now()}`, payload: { action: 'get_stats' } }));
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

  const fetchActivityStats = useCallback(() => {
    if (!ws || wsStatus !== 'online') return;
    setLoadingActivityStats(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: `get_clan_activity_stats_${Date.now()}`,
      payload: { action: 'get_clan_activity_stats' }
    }));
  }, [ws, wsStatus]);

  // Persistent text-only cache of members' display names, usernames, and roles (so nicknames survive after member leaves)
  const currentActiveGuildId = (isDevAdminActive && activeDevGuildIdRef.current) || guildId || 'global';

  const getCachedMemberMeta = useCallback((userId) => {
    if (!userId) return null;
    try {
      const stored = localStorage.getItem(`ih_clan_members_meta_${currentActiveGuildId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[userId] || null;
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }
    return null;
  }, [currentActiveGuildId]);

  const saveCachedMembersMeta = useCallback((membersList) => {
    if (!Array.isArray(membersList) || membersList.length === 0) return;
    try {
      const key = `ih_clan_members_meta_${currentActiveGuildId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      let changed = false;
      membersList.forEach(m => {
        const uid = m.userId || m.id;
        if (uid) {
          const uName = m.username || m.user?.username || m.userName;
          const dName = m.displayName || m.lastSteamName;
          if (!existing[uid] || (uName && existing[uid].username !== uName) || (dName && existing[uid].displayName !== dName)) {
            existing[uid] = {
              userId: uid,
              username: uName || existing[uid]?.username || 'Участник',
              displayName: dName || existing[uid]?.displayName || uName || 'Участник',
              steamId: m.steamId || existing[uid]?.steamId || null,
              lastSeen: m.lastSeen || existing[uid]?.lastSeen || Date.now()
            };
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }
  }, [currentActiveGuildId]);

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
          const arr = prev || [];
          const idx = arr.findIndex(d => d.userId === res.dossier.userId);
          if (idx !== -1) {
            const copy = [...arr];
            copy[idx] = res.dossier;
            return copy;
          }
          return [res.dossier, ...arr];
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
    
    const handleMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type && data.type.startsWith('clan_')) {
          addLog(`Received: ${JSON.stringify(data)}`);
        }
        
        if (data.type === 'clan_dev_challenge') {
          (async () => {
            let deviceId = 'dev_client';
            try {
              if (window.electronAPI?.ipcRenderer) {
                deviceId = await (window.electronAPI.ipcRenderer.invoke('network:get-device-id').catch(() => window.electronAPI.ipcRenderer.invoke('network:get-hwid')));
              } else {
                deviceId = localStorage.getItem('hub_device_id') || localStorage.getItem('hub_hwid') || 'dev_client';
              }
            } catch (err) { console.error('[Auto-caught Error]', err); }

            if (window.electronAPI?.dev) {
              const signRes = await window.electronAPI.dev.signChallenge({
                nonce: data.nonce,
                timestamp: data.timestamp,
                hwid: deviceId
              });
              if (signRes && signRes.success && signRes.signature) {
                ws.send(JSON.stringify({
                  type: 'clan',
                  action: 'dev_auth_verify',
                  signature: signRes.signature,
                  timestamp: data.timestamp
                }));
                return;
              } else {
                const signErr = signRes?.error || 'Мастер-ключ не сохранен';
                setIsDevAuthenticated(false);
                setLoadingDevGuilds(false);
                setError(`Ошибка подписи ключа разработчика: ${signErr}. Укажите DEV_MASTER_KEY в Настройки -> Разработчик.`);
                addLog(`Dev challenge sign failed: ${signErr}`);
              }
            } else {
              setIsDevAuthenticated(false);
              setLoadingDevGuilds(false);
              setError('Режим разработчика доступен только в настольном приложении Electron.');
            }
          })();
        } else if (data.type === 'clan_dev_auth_res') {
          if (data.success) {
            setIsDevAuthenticated(true);
            setError(null);
            addLog('Developer session authenticated!');
            setLoadingDevGuilds(true);
            ws.send(JSON.stringify({ type: 'clan', action: 'dev_get_guilds' }));
          } else {
            setIsDevAuthenticated(false);
            setLoadingDevGuilds(false);
            const errMsg = data.error || 'Ошибка авторизации';
            setError(`Ошибка авторизации разработчика: ${errMsg}`);
            addLog(`Dev auth rejected: ${errMsg}`);
          }
        } else if (data.type === 'clan_dev_guilds_res') {
          setLoadingDevGuilds(false);
          if (data.success && Array.isArray(data.guilds)) {
            setError(null);
            setDevGuilds(data.guilds);
            const savedGuildId = getConfigKey('devActiveGuildId');
            const target = data.guilds.find(g => g.id === savedGuildId);
            if (target) {
              activeDevGuildIdRef.current = target.id;
              setGuildId(target.id);
              setStatus('linked');
              setDevShowServerGrid(false);
              fetchConfig(target.id);
              fetchDiscordInfo(target.id);
            } else if (data.guilds.length === 1) {
              const onlyGuild = data.guilds[0];
              activeDevGuildIdRef.current = onlyGuild.id;
              setGuildId(onlyGuild.id);
              setStatus('linked');
              setDevShowServerGrid(false);
              fetchConfig(onlyGuild.id);
              fetchDiscordInfo(onlyGuild.id);
            } else {
              setStatus('unlinked');
              setDevShowServerGrid(true);
            }
          } else {
            addLog(`Failed to fetch dev guilds: ${data.error}`);
            setError(data.error || 'Не удалось получить список серверов Discord от бота');
            setStatus('unlinked');
            setDevShowServerGrid(true);
          }
        } else if (data.type === 'clan_status_res') {
          setStatus(data.linked ? 'linked' : 'unlinked');
          if (data.clan_secret) {
            localStorage.setItem('hub_clan_secret', data.clan_secret);
          } else if (!data.linked) {
            localStorage.removeItem('hub_clan_secret');
          }
          if (data.linked) {
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          }
        } else if (data.type === 'clan_link_res') {
          if (data.success) {
            if (data.clan_secret) {
              localStorage.setItem('hub_clan_secret', data.clan_secret);
            }
            setStatus('linked');
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          } else {
            setError(data.error || 'Failed to link');
          }
        } else if (data.type === 'clan_unlink_res') {
          localStorage.removeItem('hub_clan_secret');
          setStatus('unlinked');
          setGuildId(null);
          setConfig(null);
          hasPromptedRef.current = false;
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_config') {
          setLoadingConfig(false);
          const configError = data.error || (data.data && !data.data.success ? data.data.error : null);
          const fetchedConfig = data.data?.config;

          if (configError || !fetchedConfig) {
            if (isDevAdminActive && guildId) {
              const currentG = devGuilds.find(g => g.id === guildId);
              const fallbackConfig = sanitizeClanConfig({
                guildId,
                name: currentG?.name || 'Discord Server',
                clanTag: '',
                leaderRoleId: null
              });
              setConfig(fallbackConfig);
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(fallbackConfig));
              setError(null);
            } else {
              const err = configError || 'Empty or invalid configuration returned from bot/server';
              setError(err);
              if (!err.includes('Слишком много запросов') && !err.includes('429')) {
                reportClanErrorToTelegram('Failed to load clan configuration', `Error: ${err}\nGuild ID: ${guildId || 'Unknown'}`);
              }
            }
          } else {
            setError(null);
            const sanitized = sanitizeClanConfig(fetchedConfig);
            setConfig(sanitized);
            lastSavedConfigRef.current = JSON.parse(JSON.stringify(sanitized));
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
            setTimeout(() => setSaveStatus(null), 5000);
          } else {
            setSaveStatus('success');
            const sanitized = sanitizeClanConfig(data.data?.config || data.data);
            if (sanitized) {
              setConfig(sanitized);
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(sanitized));
            }
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
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'get_roster' || (typeof data.reqId === 'string' && data.reqId.startsWith('get_roster_')))) {
          if (!data.error && data.data && data.data.success) {
            setRosterData(data.data);
            if (data.data.roster && Array.isArray(data.data.roster)) {
              saveCachedMembersMeta(data.data.roster);
            }
            if (data.data.dossiers && Array.isArray(data.data.dossiers)) {
              setDossiersData(data.data.dossiers);
              saveCachedMembersMeta(data.data.dossiers);
            }
          } else {
            setRosterData(prev => prev || { roster: [], roleNamesJson: '{}', customRolesJson: '[]' });
            if (data.error || (data.data && data.data.error)) {
              setError(data.error || data.data.error);
            }
          }
        } else if (data.type === 'clan_proxy_res' && (typeof data.reqId === 'string' && data.reqId.startsWith('get_member_dossier_'))) {
          if (!data.error && data.data?.success && data.data?.dossier) {
            const fetchedDos = data.data.dossier;
            saveCachedMembersMeta([fetchedDos]);
            setSelectedProfileForDossier(prev => (prev?.userId === fetchedDos.userId ? { ...prev, ...fetchedDos } : prev));
            setDossiersData(prev => {
              const arr = prev || [];
              const idx = arr.findIndex(d => d.userId === fetchedDos.userId);
              if (idx !== -1) {
                const copy = [...arr];
                copy[idx] = fetchedDos;
                return copy;
              }
              return [fetchedDos, ...arr];
            });
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_applications') {
          setLoadingApps(false);
          if (!data.error && data.data && data.data.success) {
            setApplicationsData(data.data.applications || []);
            saveCachedMembersMeta(data.data.applications || []);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_ad_tickets') {
          setLoadingAdTickets(false);
          if (!data.error && data.data && data.data.success) {
            setAdTicketsData(data.data.tickets || []);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'close_ad_ticket') {
          fetchAdTickets();
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_ticket_transcript') {
          setTranscriptModal(prev => ({
            ...prev,
            loading: false,
            html: data.data?.transcriptHtml || null,
            error: data.error || (data.data && !data.data.success ? (data.data.error || t('msg_transcript_error', 'Ошибка загрузки транскрипта')) : (!data.data?.transcriptHtml ? t('msg_transcript_not_found', 'Транскрипт не найден или еще формируется') : null))
          }));
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'get_stats' || (typeof data.reqId === 'string' && data.reqId.startsWith('get_stats_')))) {
          if (!data.error && data.data && data.data.success) {
            setStatsData(data.data.stats || []);
            saveCachedMembersMeta(data.data.stats || []);
            if (data.data.activityStats) {
              setActivityStatsData(data.data.activityStats);
            }
          } else {
            setStatsData(prev => prev || []);
            if (data.error || (data.data && data.data.error)) {
              setError(data.error || data.data.error);
            }
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'get_clan_activity_stats' || (typeof data.reqId === 'string' && data.reqId.startsWith('get_clan_activity_stats_')))) {
          setLoadingActivityStats(false);
          if (!data.error && data.data && data.data.success && data.data.activityStats) {
            setActivityStatsData(data.data.activityStats);
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'get_discord_info' || (typeof data.reqId === 'string' && data.reqId.startsWith('get_discord_info_')))) {
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
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'get_dynamic_voice' || (typeof data.reqId === 'string' && data.reqId.startsWith('get_dynamic_voice')))) {
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
            setDynamicVoiceData(prev => prev || {
              config: { enabled: false, categoryId: '', generatorChannelId: '', template: `🔊 ${t('clan_voice_party_tpl', 'Пати')} {user}`, defaultLimit: 0 },
              activeRooms: [],
              channels: discordInfo?.channels || []
            });
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
                } catch (e) { console.error('[Auto-caught Error]', e); }
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
            const curCfg = latestConfigRef.current;
            let currentRConfig = {};
            try { if (curCfg?.recruitmentConfigJson) currentRConfig = JSON.parse(curCfg.recruitmentConfigJson); } catch (e) { console.error('[Auto-caught Error]', e); }
            const isRecLinkEmpty = !currentRConfig.link || !currentRConfig.link.trim();

            setConfig(prev => {
              if (!prev) return prev;
              let rConf = {};
              try { if (prev.recruitmentConfigJson) rConf = JSON.parse(prev.recruitmentConfigJson); } catch (e) { console.error('[Auto-caught Error]', e); }
              const shouldUpdateRConfig = !rConf.link || !rConf.link.trim();
              const updated = {
                ...prev,
                discordLink: newUrl,
                ...(shouldUpdateRConfig ? { recruitmentConfigJson: JSON.stringify({ ...rConf, link: newUrl }) } : {})
              };
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(updated));
              autoSaveConfig(updated, true);
              return updated;
            });
            setInviteStatus('valid');
            setInviteDetails(data.data.invite || null);
            lastVerifiedLinkRef.current = newUrl;
            if (isRecLinkEmpty) {
              setRecruitmentInviteStatus('valid');
              setRecruitmentInviteDetails(data.data.invite || data.data || null);
              lastVerifiedRecruitmentLinkRef.current = newUrl;
            }
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
            try { if (curCfg?.recruitmentConfigJson) rcLink = JSON.parse(curCfg.recruitmentConfigJson)?.link; } catch (e) { console.error('[Auto-caught Error]', e); }
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
            const curCfg = latestConfigRef.current;
            const isMainLinkEmpty = !curCfg?.discordLink || !curCfg?.discordLink.trim();

            setConfig(prev => {
              if (!prev) return prev;
              let currentRConfig = {};
              try { if (prev.recruitmentConfigJson) currentRConfig = JSON.parse(prev.recruitmentConfigJson); } catch (e) { console.error('[Auto-caught Error]', e); }
              const newRConfig = { ...currentRConfig, link: newUrl };
              const shouldUpdateMainLink = !prev.discordLink || !prev.discordLink.trim();
              const updated = {
                ...prev,
                recruitmentConfigJson: JSON.stringify(newRConfig),
                ...(shouldUpdateMainLink ? { discordLink: newUrl } : {})
              };
              lastSavedConfigRef.current = JSON.parse(JSON.stringify(updated));
              autoSaveConfig(updated, true);
              return updated;
            });
            setRecruitmentInviteStatus('valid');
            setRecruitmentInviteDetails(data.data.invite || data.data || null);
            lastVerifiedRecruitmentLinkRef.current = newUrl;
            if (isMainLinkEmpty) {
              setInviteStatus('valid');
              setInviteDetails(data.data.invite || null);
              lastVerifiedLinkRef.current = newUrl;
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
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
          } else if (data.event === 'channels_updated' && data.data?.channels) {
            setDiscordInfo(prev => ({
              ...(prev || {}),
              channels: data.data.channels
            }));
            addLog('Discord channels auto-updated from server');
          }
        }
      } catch (err) { console.error('[Auto-caught Error]', err); }
    };

    ws.addEventListener('message', handleMessage);

    if (isDevAdminActive) {
      addLog('Initiating developer handshake...');
      (async () => {
        let deviceId = 'dev_client';
        try {
          if (window.electronAPI?.ipcRenderer) {
            deviceId = await (window.electronAPI.ipcRenderer.invoke('network:get-device-id').catch(() => window.electronAPI.ipcRenderer.invoke('network:get-hwid')));
          } else {
            deviceId = localStorage.getItem('hub_device_id') || localStorage.getItem('hub_hwid') || 'dev_client';
          }
        } catch (err) { console.error('[Auto-caught Error]', err); }
        ws.send(JSON.stringify({ type: 'clan', action: 'dev_auth_init', hwid: deviceId }));
      })();
    } else {
      addLog('Sending initial get_status request');
      const clanSecret = localStorage.getItem('hub_clan_secret') || undefined;
      ws.send(JSON.stringify({ type: 'clan', action: 'get_status', clan_secret: clanSecret }));
    }
    
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, wsStatus, isDevAdminActive]);

  const handleSelectDevGuild = (guild) => {
    setIsGuildDropdownOpen(false);
    setDevShowServerGrid(false);
    if (!guild) return;
    activeDevGuildIdRef.current = guild.id;
    if (guildIdRef) guildIdRef.current = guild.id;
    setConfigKey('devActiveGuildId', guild.id);
    setGuildId(guild.id);
    setStatus('linked');
    setConfig(null);
    setRosterData(null);
    setStatsData(null);
    setDynamicVoiceData(null);
    setApplicationsData([]);
    setClanWarnings([]);
    setDiscordInfo(null);
    setSaveStatus(null);
    setError(null);
    fetchConfig(guild.id);
    fetchDiscordInfo(guild.id);
  };

  const handleRefreshDevGuilds = () => {
    if (ws && wsStatus === 'online') {
      setLoadingDevGuilds(true);
      setError(null);
      if (!isDevAuthenticated) {
        addLog('Not dev authenticated yet. Initiating dev handshake...');
        (async () => {
          let deviceId = 'dev_client';
          try {
            if (window.electronAPI?.ipcRenderer) {
              deviceId = await (window.electronAPI.ipcRenderer.invoke('network:get-device-id').catch(() => window.electronAPI.ipcRenderer.invoke('network:get-hwid')));
            } else {
              deviceId = localStorage.getItem('hub_device_id') || localStorage.getItem('hub_hwid') || 'dev_client';
            }
          } catch (err) { console.error('[Auto-caught Error]', err); }
          ws.send(JSON.stringify({ type: 'clan', action: 'dev_auth_init', hwid: deviceId }));
        })();
      } else {
        addLog('Refreshing Discord guilds list...');
        ws.send(JSON.stringify({ type: 'clan', action: 'dev_get_guilds' }));
      }
    }
  };

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

  const handleUnlink = async () => {
    const confirmed = await showConfirm({
      title: t('clan_unlink_btn', 'Отвязать сервер'),
      message: t('clan_unlink_confirm', 'Вы уверены, что хотите отвязать Clan Manager от текущего Discord сервера?'),
      confirmText: t('clan_unlink_btn', 'Отвязать сервер'),
      danger: true
    });
    if (confirmed) {
      addLog('Sending unlink request');
      hasPromptedRef.current = false;
      const clanSecret = localStorage.getItem('hub_clan_secret') || undefined;
      ws.send(JSON.stringify({ type: 'clan', action: 'unlink', clan_secret: clanSecret }));
    }
  };

  const fetchConfig = (overrideGuildId) => {
    if (!ws || wsStatus !== 'online') {
      setError(t('clan_connecting') || 'Подключение к серверу...');
      setLoadingConfig(false);
      return;
    }
    const targetGid = overrideGuildId || (isDevAdminActive ? activeDevGuildIdRef.current : undefined);
    setLoadingConfig(true);
    setError(null);
    addLog('Fetching config via proxy');
    const clanSecret = localStorage.getItem('hub_clan_secret') || undefined;
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_config', 
      clan_secret: clanSecret,
      targetGuildId: targetGid,
      payload: { action: 'get_config' } 
    }));
  };

  const fetchDiscordInfo = (overrideGuildId) => {
    const targetGid = overrideGuildId || (isDevAdminActive ? activeDevGuildIdRef.current : undefined);
    const clanSecret = localStorage.getItem('hub_clan_secret') || undefined;
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_discord_info', 
      clan_secret: clanSecret,
      targetGuildId: targetGid,
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
      if (!r.title || r.title === t('clan_rec_gods', 'Набор в клан GODS') || r.title === t('clan_rec_base', 'Набор в клан') || (oldName && r.title === `${t('clan_recruit_title_prefix', 'Набор в клан')} ${oldName}`) || r.title.includes('GODS')) {
        r.title = newName ? `${t('clan_recruit_title_prefix', 'Набор в клан')} ${newName}` : t('clan_rec_base', 'Набор в клан');
        updatedRecruitment = JSON.stringify(r);
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }

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
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
    try { if (config.channelsConfigJson) channelsConfig = JSON.parse(config.channelsConfigJson); } catch (e) { console.error('[Auto-caught Error]', e); }
    
    // permissions structure stored in channelsConfig.permissions
    const permissions = { ...(channelsConfig.permissions || {}) };

    let defaultLogChannelId = null;
    try {
      const l = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
      defaultLogChannelId = l?.defaultChannelId || null;
    } catch (e) { console.error('[Auto-caught Error]', e); }

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
      } catch (e) { console.error('[Auto-caught Error]', e); }
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].name = val;
        setConfig({ ...config, customRolesJson: JSON.stringify(customRoles) });
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
      } catch (e) { console.error('[Auto-caught Error]', e); }
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
        } catch (e) { console.error('[Auto-caught Error]', e); }
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
    } catch (e) { console.error('[Auto-caught Error]', e); }
    
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

  const handleDeleteCustomRole = async (customId) => {
    if (!config) return;
    const confirmed = await showConfirm({
      title: t('clan_roles_delete_title', 'Удаление роли'),
      message: t('clan_roles_delete_confirm', 'Удалить этот шаблон роли? Привязка к Discord роли будет снята.'),
      confirmText: t('confirm_btn', 'Удалить'),
      danger: true
    });
    if (!confirmed) return;
    
    let customRoles = [];
    try {
      if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
    } catch (e) { console.error('[Auto-caught Error]', e); }
    
    const filtered = customRoles.filter(r => r.id !== customId);
    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(filtered)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleDeleteStandardRole = async (roleKey, dbKey) => {
    if (!config) return;
    const confirmed = await showConfirm({
      title: t('clan_roles_delete_title', 'Удаление роли'),
      message: t('clan_role_delete_std_confirm', 'Удалить эту стандартную роль из конфигурации? Привязка к Discord роли будет снята.'),
      confirmText: t('confirm_btn', 'Удалить'),
      danger: true
    });
    if (!confirmed) return;

    let deletedRoles = [];
    try {
      if (config.deletedRolesJson) {
        deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
      }
    } catch (e) { console.error('[Auto-caught Error]', e); }

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
    } catch (e) { console.error('[Auto-caught Error]', e); }
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

  const handleExecuteFactoryReset = async () => {
    if (!resetSections || resetSections.length === 0) return;
    const confirmed = await showConfirm({
      title: t('clan_reset_sections_title', 'Сброс разделов настроек'),
      message: t('clan_reset_confirm_prompt') || 'Вы уверены, что хотите сбросить выбранные разделы к заводским настройкам?',
      confirmText: t('confirm_btn', 'Сбросить'),
      danger: true
    });
    if (!confirmed) return;

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
      reqId: `get_dynamic_voice_${Date.now()}`, 
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

  const fetchAdTickets = () => {
    if (!ws || wsStatus !== 'online') return;
    setLoadingAdTickets(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'get_ad_tickets',
      payload: { action: 'get_ad_tickets', limit: 100 }
    }));
  };

  const handleCloseAdTicket = (ticketId, channelId) => {
    if (!ws || wsStatus !== 'online') return;
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'close_ad_ticket',
      payload: { action: 'close_ad_ticket', ticketId, channelId }
    }));
    setAdTicketsData(prev => prev.map(t => (t.id === ticketId || t.channelId === channelId) ? { ...t, status: 'CLOSED' } : t));
  };

  const handleClearApplications = async () => {
    if (!ws || wsStatus !== 'online') return;
    const confirmed = await showConfirm({
      title: t('clan_recruitment_apps_clear_title', 'Очистка журнала заявок'),
      message: t('clan_recruitment_apps_clear_confirm') || 'Вы действительно хотите полностью очистить весь журнал заявок в клан? Все записи будут безвозвратно удалены.',
      confirmText: t('confirm_btn', 'Очистить'),
      danger: true
    });
    if (!confirmed) return;
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
    } else if (activeTab === 'applications') {
      fetchApplications();
      fetchAdTickets();
    } else if (activeTab === 'ads') {
      fetchAdTickets();
    } else if (activeTab === 'recruitment') {
      fetchApplications();
      if (config?.recruitmentConfigJson) {
        try {
          const rc = JSON.parse(config.recruitmentConfigJson);
          const linkToCheck = rc.link || config.discordLink;
          if (linkToCheck) verifyRecruitmentInvite(linkToCheck);
        } catch (e) { console.error('[Auto-caught Error]', e); }
      } else if (config?.discordLink) {
        verifyRecruitmentInvite(config.discordLink);
      }
      if (!rosterData) {
        ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_roster_${Date.now()}`, payload: { action: 'get_roster' } }));
      }
    } else if (activeTab === 'dossier') {
      fetchDossiers(dossierFilter, dossierSearch);
      fetchClanWarnings();
    } else if (activeTab === 'roster') {
      if (!rosterData) {
        addLog('Fetching roster via proxy');
        ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_roster_${Date.now()}`, payload: { action: 'get_roster' } }));
      }
      if (!dossiersData || dossiersData.length === 0) {
        fetchDossiers();
      }
      if (!statsData) {
        ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_stats_${Date.now()}`, payload: { action: 'get_stats' } }));
      }
      if (!discordInfo) {
        fetchDiscordInfo();
      }
      if (!dynamicVoiceData) {
        fetchDynamicVoice();
      }
      fetchClanWarnings();
    } else if (activeTab === 'stats') {
      if (!statsData) {
        addLog('Fetching stats via proxy');
        ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: `get_stats_${Date.now()}`, payload: { action: 'get_stats' } }));
      }
      fetchActivityStats();
    } else if (activeTab === 'voice' && !dynamicVoiceData) {
      fetchDynamicVoice();
    } else if (activeTab === 'moderation') {
      if (!discordInfo) fetchDiscordInfo();
      fetchClanWarnings();
    } else if ((activeTab === 'roles' || activeTab === 'channels' || activeTab === 'permissions' || activeTab === 'logs' || activeTab === 'recruitment' || activeTab === 'applications' || activeTab === 'votes' || activeTab === 'ads') && !discordInfo) {
      fetchDiscordInfo();
    }
  }, [activeTab, ws, wsStatus, rosterData, statsData, discordInfo, dynamicVoiceData, config?.discordLink]);

  const handleCloseDossier = useCallback(() => {
    setSelectedProfileForDossier(null);
  }, []);

  const selectedUserApplications = useMemo(() => {
    if (!selectedProfileForDossier?.userId || !Array.isArray(applicationsData)) return [];
    const uid = selectedProfileForDossier.userId;
    return applicationsData.filter(a => a.userId === uid || a.applicantId === uid);
  }, [applicationsData, selectedProfileForDossier?.userId]);

  const selectedUserVotes = useMemo(() => {
    if (!selectedProfileForDossier?.userId || !Array.isArray(activeVotes)) return [];
    const uid = selectedProfileForDossier.userId;
    return activeVotes.filter(v => {
      try {
        const voters = v.votersJson ? JSON.parse(v.votersJson) : [];
        return voters.some(vt => (typeof vt === 'string' ? vt : vt.userId) === uid);
      } catch(e) { return false; }
    });
  }, [activeVotes, selectedProfileForDossier?.userId]);

  const selectedUserWarnings = useMemo(() => {
    if (!selectedProfileForDossier?.userId || !Array.isArray(clanWarnings)) return [];
    const uid = selectedProfileForDossier.userId;
    return clanWarnings.filter(w => w.userId === uid);
  }, [clanWarnings, selectedProfileForDossier?.userId]);

  const pendingAppsCount = useMemo(() => {
    return Array.isArray(applicationsData)
      ? applicationsData.filter(a => a.status === 'PENDING').length
      : 0;
  }, [applicationsData]);

  const openAdTicketsCount = useMemo(() => {
    return Array.isArray(adTicketsData)
      ? adTicketsData.filter(t => t.status === 'OPEN').length
      : 0;
  }, [adTicketsData]);

  useEffect(() => {
    if (!selectedProfileForDossier?.userId || !ws || wsStatus !== 'online') return;
    if (selectedProfileForDossier.shootingRating === undefined && selectedProfileForDossier.claimedHours === undefined) {
      ws.send(JSON.stringify({
        type: 'clan',
        action: 'proxy',
        reqId: `get_member_dossier_${selectedProfileForDossier.userId}`,
        payload: {
          action: 'get_member_dossier',
          userId: selectedProfileForDossier.userId
        }
      }));
    }
  }, [selectedProfileForDossier?.userId, selectedProfileForDossier?.shootingRating, selectedProfileForDossier?.claimedHours, ws, wsStatus]);

  // Lock background scrolling safely whenever inline modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(selectedUserForWarns || editingRoomLimit);
    if (!isAnyModalOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [selectedUserForWarns, editingRoomLimit]);

  if (status === 'checking') {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <div className="text-slate-700 dark:text-slate-300 font-medium text-sm">{t('clan_connecting')}</div>
        </div>
        <RosterSkeleton count={6} columns="grid-cols-1 md:grid-cols-2" />
      </div>
    );
  }

  const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1545095227440631808&permissions=8&scope=bot%20applications.commands';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('/hub_link');
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  if (status === 'unlinked' || (isDevAdminActive && devShowServerGrid)) {
    const filteredDevGuilds = devGuilds.filter(g => 
      !guildSearchQuery.trim() || 
      (g.name && g.name.toLowerCase().includes(guildSearchQuery.toLowerCase())) ||
      (g.id && g.id.includes(guildSearchQuery.trim()))
    );

    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        {isDevAdminActive ? (
          <div className="space-y-6">
            {/* Developer Mode Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-500/30">
                      Developer Admin Mode
                    </span>
                    {isDevAuthenticated ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium text-xs border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {t('dev_session_active', 'Сессия активна')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-medium text-xs border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {t('dev_not_auth', 'Не авторизован')}
                      </span>
                    )}
                    {guildId && (
                      <button
                        type="button"
                        onClick={() => {
                          setDevShowServerGrid(false);
                          setStatus('linked');
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        {t('dev_return_curr_guild', 'Вернуться к текущему серверу →')}
                      </button>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {t('dev_guilds_mgmt_title', 'Управление Discord-серверами')}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {t('dev_guilds_mgmt_desc', 'Прямой доступ ко всем серверам, на которых авторизован бот. Выберите любой сервер из списка ниже для детальной настройки ролей, каналов, динамических войсов и участников.')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRefreshDevGuilds}
                    disabled={loadingDevGuilds}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDevGuilds ? 'animate-spin' : ''}`} />
                    <span>{loadingDevGuilds ? t('loading', 'Загрузка...') : t('dev_refresh_list', 'Обновить список')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openExternalUrl(BOT_INVITE_URL)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>{t('dev_invite_bot', 'Пригласить бота')}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {t('dev_to_settings', 'В Настройки')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-200 cursor-pointer p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Search Bar and Counter */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={guildSearchQuery}
                    onChange={(e) => setGuildSearchQuery(e.target.value)}
                    placeholder={t('dev_search_guild_placeholder', 'Поиск по названию или ID сервера...')}
                    className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                  />
                  {guildSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGuildSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-auto">
                  <span>{t('dev_guilds_found', 'Обнаружено серверов:')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {devGuilds.length}
                  </span>
                </div>
              </div>

              {/* Grid of Servers or Loading / Empty States */}
              {loadingDevGuilds ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs animate-pulse space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : devGuilds.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('dev_guilds_empty_title', 'Список серверов пока пуст')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('dev_guilds_empty_desc', 'Бот подключен к серверу, но пока не добавлен ни на один Discord-сервер, либо список ещё загружается. Добавьте бота на сервер или нажмите обновить.')}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleRefreshDevGuilds}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      {t('dev_refresh_guilds_btn', 'Обновить список серверов')}
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternalUrl(BOT_INVITE_URL)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('dev_invite_bot_btn', 'Пригласить бота в Discord')}
                    </button>
                  </div>
                </div>
              ) : filteredDevGuilds.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
                  {t('dev_no_guilds_matched', 'По запросу «{{query}}» серверов не найдено.', { query: guildSearchQuery })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDevGuilds.map((g) => {
                    const isSelected = g.id === guildId;
                    return (
                      <div
                        key={g.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md group ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/15 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {g.icon ? (
                                <img
                                  src={g.icon}
                                  alt=""
                                  className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-2xs">
                                  {g.name ? g.name.charAt(0).toUpperCase() : '#'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {g.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                                  <span>ID: {g.id}</span>
                                </div>
                              </div>
                            </div>
                            
                            {g.isConfigured ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                                {t('dev_guild_configured', 'Настроен')}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium border border-slate-200 dark:border-slate-700 shrink-0">
                                {t('dev_guild_new', 'Новый')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t('dev_guild_members_count', '{{count}} участников', { count: g.memberCount })}</span>
                            </div>
                            {isSelected && (
                              <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-[11px] ml-auto">
                                {t('dev_guild_curr_choice', '● Текущий выбор')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectDevGuild(g)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span>{t('dev_guild_manage_btn', 'Управлять сервером')}</span>
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsible Standard Link Section */}
            <details className="group border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 transition-all">
              <summary className="cursor-pointer font-bold text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between select-none">
                <span>{t('dev_standard_link_summary', 'Стандартная привязка клана по коду (/hub_link)')}</span>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
              </summary>
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {t('clan_feature_recruit_title', 'Легкий и детальный набор')}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('clan_feature_recruit_desc', 'Удобные анкеты кандидатов с авто-проверкой часов в игре, подробными досье, фильтром по возрасту/блокировкам и приватными тикетами для собеседований.')}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {t('clan_feature_voice_title', 'Динамические войсы')}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('clan_feature_voice_desc', 'Автоматическое создание комнат для пати при входе и их мгновенное удаление, когда они освобождаются.')}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                          <ScrollText className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {t('clan_feature_logging_title', 'Логирование и модерация')}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('clan_feature_logging_desc', 'Детальный журнал всех событий клана, авто-модерация чата, система предупреждений (варнов) и прозрачный контроль прав.')}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {t('clan_feature_player_history_title', 'История игрока в кланах')}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('clan_feature_player_history_desc', 'Единая база досье: привязанные Steam-аккаунты, история прошлых кланов, причины кика или ухода, черные списки.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700/80 p-6 space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t('clan_quick_link_title', 'Привязка в 3 шага')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('clan_quick_link_desc', 'Займет не более 1 минуты')}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t('clan_step1_label', 'Пригласите бота на ваш сервер')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openExternalUrl(BOT_INVITE_URL)}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/15 transition-all cursor-pointer group"
                      >
                        <DiscordIcon className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
                        <span>{t('clan_invite_btn', 'Пригласить бота в Discord')}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t('clan_step2_label', 'Напишите в любом канале сервера:')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <code className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 px-2 select-all">
                          /hub_link
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyCommand}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600 shadow-2xs transition-all cursor-pointer"
                        >
                          {copiedCommand ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">{t('copied', 'Скопировано!')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{t('copy', 'Копировать')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t('clan_step3_label', 'Введите полученный 6-значный код:')}
                        </span>
                      </div>
                      <form onSubmit={handleLink} className="space-y-3">
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="000000" 
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-[0.5em] font-mono shadow-inner transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-lg"
                            value={linkCode}
                            onChange={(e) => setLinkCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            maxLength={6}
                          />
                        </div>
                        {error && <div className="text-red-500 text-xs font-medium text-center">{error}</div>}
                        <button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-blue-200" />
                          <span>{t('clan_setup_btn', 'Привязать сервер')}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        ) : (
          /* Standard Unlinked View for Regular Users */
          <>
            {/* Top Header Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('clan_setup_title', 'Настройка Clan Manager')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
                {t('clan_setup_desc_modern', 'Свяжите приложение с вашим Discord-сервером для детального набора кандидатов, аналитики состава, динамических войсов и полной защиты клана.')}
              </p>
            </div>

            {/* 2-Column Grid: Left = Benefits, Right = 3-Step Interactive Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Why use the bot (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Feature 1: Fast & Detailed Recruitment */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_recruit_title', 'Легкий и детальный набор')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_recruit_desc', 'Удобные анкеты кандидатов с авто-проверкой часов в игре, подробными досье, фильтром по возрасту/блокировкам и приватными тикетами для собеседований.')}
                    </p>
                  </div>

                  {/* Feature 2: Dynamic Voice */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_voice_title', 'Динамические войсы')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_voice_desc', 'Автоматическое создание комнат для пати при входе и их мгновенное удаление, когда они освобождаются.')}
                    </p>
                  </div>

                  {/* Feature 3: Logging & Moderation */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_logging_title', 'Логирование и модерация')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_logging_desc', 'Детальный журнал всех событий клана, авто-модерация чата, система предупреждений (варнов) и прозрачный контроль прав.')}
                    </p>
                  </div>

                  {/* Feature 4: Player Cross-Clan History */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_player_history_title', 'История игрока в кланах')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_player_history_desc', 'Единая база досье: привязанные Steam-аккаунты, история прошлых кланов, причины кика или ухода, черные списки.')}
                    </p>
                  </div>

                  {/* Feature 5: Transparent Votes */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50">
                      <Vote className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_votes_title', 'Удобные голосования')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_votes_desc', 'Голосования с открытыми результатами в реальном времени: сразу видно, кто именно из бойцов и за какой вариант проголосовал.')}
                    </p>
                  </div>

                  {/* Feature 6: Clan Stats */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('clan_feature_stats_title', 'Статистика клана')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('clan_feature_stats_desc', 'Глубокая аналитика состава: активность в голосовых каналах, посещаемость вайпов, сообщения и вклад каждого участника.')}
                    </p>
                  </div>

                </div>
              </div>

              {/* Right Column: 3-Step Interactive Form (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('clan_quick_link_title', 'Привязка в 3 шага')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('clan_quick_link_desc', 'Займет не более 1 минуты')}
                  </p>
                </div>

                {/* Step 1 */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t('clan_step1_label', 'Пригласите бота на ваш сервер')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openExternalUrl(BOT_INVITE_URL)}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/15 transition-all cursor-pointer group"
                  >
                    <DiscordIcon className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
                    <span>{t('clan_invite_btn', 'Пригласить бота в Discord')}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t('clan_step2_label', 'Напишите в любом канале сервера:')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <code className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 px-2 select-all">
                      /hub_link
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyCommand}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedCommand ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">{t('copied', 'Скопировано!')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t('copy', 'Копировать')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t('clan_step3_label', 'Введите полученный 6-значный код:')}
                    </span>
                  </div>
                  <form onSubmit={handleLink} className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="000000" 
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-[0.5em] font-mono shadow-inner transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-lg"
                        value={linkCode}
                        onChange={(e) => setLinkCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    {error && <div className="text-red-500 text-xs font-medium text-center">{error}</div>}
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>{t('clan_setup_btn', 'Привязать сервер')}</span>
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const clanTabs = [
    { id: 'roster', label: t('clan_tab_roster', 'Состав'), icon: UserCheck },
    { id: 'votes', label: t('clan_tab_votes', 'Голосования'), icon: Vote },
    { id: 'recruitment', label: t('clan_tab_recruitment', 'Наборы'), icon: UserPlus },
    { id: 'applications', label: t('clan_tab_applications', 'Заявки в клан'), icon: ScrollText },
    { id: 'stats', label: t('clan_tab_stats', 'Статистика'), icon: BarChart3 },
    { id: 'ads', label: t('clan_tab_ads', 'Реклама'), icon: Megaphone },
  ];

  const botConfigGroups = [
    {
      title: t('clan_cfg_group_structure', 'Сервер и роли'),
      tabs: [
        { id: 'general', label: t('clan_tab_general', 'Основное'), icon: Settings },
        { id: 'roles', label: t('clan_tab_roles', 'Роли'), icon: Users },
        { id: 'channels', label: t('clan_tab_channels', 'Каналы'), icon: Hash },
        { id: 'permissions', label: t('clan_tab_permissions', 'Права Доступа'), icon: ShieldCheck },
      ]
    },
    {
      title: t('clan_cfg_group_security', 'Модерация и логи'),
      tabs: [
        { id: 'moderation', label: t('clan_tab_moderation') || 'Модерация', icon: ShieldAlert },
        { id: 'logs', label: t('clan_tab_logs') || 'Логирование', icon: ScrollText },
      ]
    },
    {
      title: t('clan_cfg_group_automation', 'Автоматизация'),
      tabs: [
        { id: 'voice', label: t('clan_tab_voice') || 'Динамические войсы', icon: Volume2 },
      ]
    }
  ];

  const tabs = [
    ...clanTabs,
    ...botConfigGroups.flatMap(g => g.tabs)
  ];

  const modSubTabs = [
    { id: 'antiMention', label: t('clan_mod_sub_anti_mention', 'Массовые упоминания'), icon: Users },
    { id: 'badWords', label: t('clan_mod_sub_bad_words', 'Фильтр слов'), icon: Ban },
    { id: 'warnings', label: t('clan_mod_sub_warnings', 'Система варнов'), icon: AlertTriangle },
    { id: 'whitelist', label: t('clan_mod_sub_whitelist', 'Исключения и логи'), icon: ShieldCheck }
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
      title: t('clan_auto_136', 'Минимальные часы в игре'),
      desc: t('clan_auto_190', 'Порог часов в игре, авто-суммирование со всех указанных профилей Steam'),
      keywords: ['часы', 'опыт', 'наиграно', 'hours', 'min hours']
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
      desc: t('clan_auto_193', 'Проверка активности игрока на игровых серверах через Battlemetrics API'),
      keywords: ['баттлметрикс', 'батлметрикс', 'battlemetrics', 'сервера', 'bm']
    },
    {
      id: 'recruitment_vac_days',
      tabId: 'recruitment',
      tabName: t('clan_auto_253', 'Наборы'),
      tabIcon: UserPlus,
      title: t('clan_auto_140', 'Максимум дней с последнего VAC-бана'),
      desc: t('clan_auto_194', 'Порог давности игровых блокировок Steam для допуска кандидатов'),
      keywords: ['vac дни', 'дней с бана', 'давность бана', 'нарушитель', 'vac days']
    },

    // Applications
    {
      id: 'applications_journal',
      tabId: 'applications',
      tabName: t('clan_tab_applications', 'Заявки в клан'),
      tabIcon: ScrollText,
      title: t('sidx_applications_title', 'Журнал заявок в клан'),
      desc: t('sidx_applications_desc', 'Список всех поданных анкет кандидатов, статус тикетов и стенограммы собеседований'),
      keywords: ['заявки', 'анкеты', 'кандидаты', 'журнал', 'тикеты', 'applications', 'tickets', 'transcripts']
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

    // Dossier / Archive in Roster
    {
      id: 'dossier_members',
      tabId: 'roster',
      tabName: t('clan_tab_roster', 'Состав') + ' (' + (t('clan_tab_archive') || 'Архив') + ')',
      tabIcon: Archive,
      title: t('clan_auto_148', 'Архив и личные карточки бойцов'),
      desc: t('clan_auto_202', 'Персональные карточки бойцов с историей, заметками офицеров и статусом'),
      keywords: ['досье', 'карточка', 'заметки', 'характеристика', 'dossier', 'боец', 'архив']
    },
    {
      id: 'dossier_blacklist',
      tabId: 'roster',
      tabName: t('clan_tab_roster', 'Состав') + ' (' + (t('clan_tab_archive') || 'Архив') + ')',
      tabIcon: Archive,
      title: t('clan_auto_149', 'Черный список игроков (Blacklist)'),
      desc: t('clan_auto_203', 'Внесение недобросовестных игроков или нарушителей правил в клановый бан-лист'),
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
      modSubTab: 'warnings',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_153', 'Клановая система предупреждений (Clan Warnings)'),
      desc: t('clan_auto_207', 'Выдача, снятие и прозрачный журнал варнов с фиксацией модератора'),
      keywords: ['варн', 'предупреждение', 'warn', 'система варнов', 'наказание', 'штраф']
    },
    {
      id: 'mod_warn_limit_val',
      tabId: 'moderation',
      modSubTab: 'warnings',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_154', 'Порог предупреждений до наказания (3, 4 или 5)'),
      desc: t('clan_auto_208', 'Количество варнов, при достижении которого бот автоматически наказывает нарушителя'),
      keywords: ['порог варнов', 'лимит', '3 варна', 'threshold', 'warn limit']
    },
    {
      id: 'mod_auto_action',
      tabId: 'moderation',
      modSubTab: 'warnings',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_155', 'Автоматическое наказание (Таймаут, Кик, Бан)'),
      desc: t('clan_auto_209', 'Выбор санкции при превышении лимита варнов: Таймаут (1ч, 1д, 1нед), Кик или Бан'),
      keywords: ['таймаут', 'кик', 'бан', 'действие', 'action', 'timeout', 'kick', 'ban']
    },
    {
      id: 'mod_bad_words_list',
      tabId: 'moderation',
      modSubTab: 'badWords',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_156', 'Черный список слов (Bad Words Blacklist)'),
      desc: t('clan_auto_210', 'Автоматическое удаление нецензурной лексики, оскорблений и запрещенных фраз'),
      keywords: ['мат', 'слова', 'запрещенные слова', 'фильтр мата', 'черный список', 'bad words', 'цензура']
    },
    {
      id: 'mod_anti_mention_prot',
      tabId: 'moderation',
      modSubTab: 'antiMention',
      tabName: t('clan_tab_moderation') || 'Модерация',
      tabIcon: ShieldAlert,
      title: t('clan_auto_157', 'Защита от спама упоминаниями (Anti-Mention)'),
      desc: t('clan_auto_211', 'Предотвращение массового спама @everyone, @here и пинга ролей'),
      keywords: ['упоминания', 'спам', 'анти-спам', 'everyone', 'here', 'anti mention', 'пинг']
    },
    {
      id: 'mod_exempt_roles_list',
      tabId: 'moderation',
      modSubTab: 'whitelist',
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
    } catch (e) { console.error('[Auto-caught Error]', e); }

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
      } catch (e) { console.error('[Auto-caught Error]', e); }

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
      } catch (e) { console.error('[Auto-caught Error]', e); }

      const voteChannel = discordInfo?.channels?.find(c => c.id === cConfig.votes);
      const channelName = voteChannel ? voteChannel.name : t('clan_default_vote_ch', 'голосования');

      const safeIdx = Math.min(previewVoteIndex, Math.max(0, wTemplates.length - 1));
      const activeTpl = wTemplates[safeIdx] || { 
        name: 'Вайп на Растрории', 
        day: t('clan_auto_233', t('clan_thursday', 'Четверг')), 
        time: '16:00', 
        ip: 'connect 127.0.0.1:28015', 
        description: 'Отметьтесь, пожалуйста, о вашем присутствии на вайпе!',
        banner: '' 
      };

      const isAnon = activeTpl.isAnonymous === true;
      let descParts = [];
      if (activeTpl.description) descParts.push(`${activeTpl.description}\n`);
      if (activeTpl.day || activeTpl.time) {
          const dt = [activeTpl.day, activeTpl.time].filter(Boolean).join(' ');
          if (dt) descParts.push(`**Время:** ${dt}`);
      }
      if (activeTpl.ip) descParts.push(`**Подключение (IP):** \`${activeTpl.ip}\``);
      const fullDesc = descParts.join('\n');

      return {
        tabTitle: t('clan_auto_v2_1019', 'Голосование за вайп'),
        channelName,
        templates: wTemplates,
        activeTemplateIndex: safeIdx,
        embed: {
          title: activeTpl.name || 'Голосование',
          color: '#e67e22',
          description: fullDesc,
          banner: activeTpl.banner,
          fields: isAnon ? [
            { name: t('clan_poll_opt_on_time', '🟢 Буду вовремя'), value: '6 голосов', inline: true },
            { name: t('clan_poll_opt_late', '🟡 Опоздаю'), value: '2 голоса', inline: true },
            { name: t('clan_poll_opt_tomorrow', '🟠 Завтра'), value: '1 голос', inline: true },
            { name: t('clan_poll_opt_absent', '🔴 Не буду'), value: '3 голоса', inline: true }
          ] : [
            { name: t('clan_poll_opt_on_time', '🟢 Буду вовремя'), value: '6 голосов\n@Alex @Steve @Edgar @Tim @John @Mark', inline: true },
            { name: t('clan_poll_opt_late', '🟡 Опоздаю'), value: '2 голоса\n@Leo @Paul', inline: true },
            { name: t('clan_poll_opt_tomorrow', '🟠 Завтра'), value: '1 голос\n@Luke', inline: true },
            { name: t('clan_poll_opt_absent', '🔴 Не буду'), value: '3 голоса\n@Dave @Carl @Bob', inline: true }
          ]
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
        banner: DEFAULT_ADS_BANNER,
        priceLink: 'https://telegra.ph/price',
      };
      try {
        if (config.adConfigJson) {
          const parsed = JSON.parse(config.adConfigJson);
          aConfig = {
            ...aConfig,
            ...parsed,
            banner: parsed.banner !== undefined && parsed.banner !== null ? parsed.banner : DEFAULT_ADS_BANNER
          };
        }
      } catch (e) { console.error('[Auto-caught Error]', e); }

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
          { label: t('clan_auto_v2_1006', 'Заказать рекламу'), emoji: '<:speakerphone:1571506556254552156>', style: 'primary' },
          { label: t('clan_auto_v2_1007', 'Заключить партнерство'), emoji: '🤝', style: 'primary' },
          { label: t('clan_auto_v2_1009', 'Узнать цену'), emoji: '<:cash:1571506385412423851>', style: 'success' },
          { label: t('clan_auto_v2_1010', 'Разработка бота'), emoji: '<:adjustmentshorizontal:1571506352935932066>', style: 'secondary' },
          { label: t('clan_auto_v2_1011', 'Вопрос администрации'), emoji: '<:infocircle:1571506482585927770>', style: 'secondary' }
        ]
      };
    }

    return null;
  };

  const previewData = getLivePreviewData();
  const isCompanionWindowVisible = isFullScreenWindow && showDiscordLivePreview && Boolean(previewData);

const contextValue = {
  BOT_INVITE_URL: typeof BOT_INVITE_URL !== "undefined" ? BOT_INVITE_URL : undefined,
  ClanManager: typeof ClanManager !== "undefined" ? ClanManager : undefined,
  aConfig: typeof aConfig !== "undefined" ? aConfig : undefined,
  activeDevGuildIdRef: typeof activeDevGuildIdRef !== "undefined" ? activeDevGuildIdRef : undefined,
  currentActiveGuildId: typeof currentActiveGuildId !== "undefined" ? currentActiveGuildId : undefined,
  activeTab: typeof activeTab !== "undefined" ? activeTab : undefined,
  activeTpl: typeof activeTpl !== "undefined" ? activeTpl : undefined,
  activeVotes: typeof activeVotes !== "undefined" ? activeVotes : undefined,
  addLog: typeof addLog !== "undefined" ? addLog : undefined,
  adsChannel: typeof adsChannel !== "undefined" ? adsChannel : undefined,
  afkTimer: typeof afkTimer !== "undefined" ? afkTimer : undefined,
  appChannel: typeof appChannel !== "undefined" ? appChannel : undefined,
  appFilter: typeof appFilter !== "undefined" ? appFilter : undefined,
  appSearch: typeof appSearch !== "undefined" ? appSearch : undefined,
  applicationsData: typeof applicationsData !== "undefined" ? applicationsData : undefined,
  autoSaveConfig: typeof autoSaveConfig !== "undefined" ? autoSaveConfig : undefined,
  autoSetupModalData: typeof autoSetupModalData !== "undefined" ? autoSetupModalData : undefined,
  botSearchIndex: typeof botSearchIndex !== "undefined" ? botSearchIndex : undefined,
  botSearchQuery: typeof botSearchQuery !== "undefined" ? botSearchQuery : undefined,
  boundStandardIds: typeof boundStandardIds !== "undefined" ? boundStandardIds : undefined,
  cConfig: typeof cConfig !== "undefined" ? cConfig : undefined,
  cfgToSend: typeof cfgToSend !== "undefined" ? cfgToSend : undefined,
  channelName: typeof channelName !== "undefined" ? channelName : undefined,
  channelsConfig: typeof channelsConfig !== "undefined" ? channelsConfig : undefined,
  checkDevMode: typeof checkDevMode !== "undefined" ? checkDevMode : undefined,
  checkIsFullScreen: typeof checkIsFullScreen !== "undefined" ? checkIsFullScreen : undefined,
  checkingInvite: typeof checkingInvite !== "undefined" ? checkingInvite : undefined,
  checkingRecruitmentInvite: typeof checkingRecruitmentInvite !== "undefined" ? checkingRecruitmentInvite : undefined,
  clanName: typeof clanName !== "undefined" ? clanName : undefined,
  clanWarnings: typeof clanWarnings !== "undefined" ? clanWarnings : undefined,
  cleanup: typeof cleanup !== "undefined" ? cleanup : undefined,
  config: typeof config !== "undefined" ? config : undefined,
  configError: typeof configError !== "undefined" ? configError : undefined,
  confirmed: typeof confirmed !== "undefined" ? confirmed : undefined,
  copiedCommand: typeof copiedCommand !== "undefined" ? copiedCommand : undefined,
  copy: typeof copy !== "undefined" ? copy : undefined,
  creatingInvite: typeof creatingInvite !== "undefined" ? creatingInvite : undefined,
  creatingLogChannel: typeof creatingLogChannel !== "undefined" ? creatingLogChannel : undefined,
  creatingRecruitmentInvite: typeof creatingRecruitmentInvite !== "undefined" ? creatingRecruitmentInvite : undefined,
  creatingRoleKey: typeof creatingRoleKey !== "undefined" ? creatingRoleKey : undefined,
  curCfg: typeof curCfg !== "undefined" ? curCfg : undefined,
  currentG: typeof currentG !== "undefined" ? currentG : undefined,
  currentRConfig: typeof currentRConfig !== "undefined" ? currentRConfig : undefined,
  currentRecLink: typeof currentRecLink !== "undefined" ? currentRecLink : undefined,
  customRoleByRoleId: typeof customRoleByRoleId !== "undefined" ? customRoleByRoleId : undefined,
  data: typeof data !== "undefined" ? data : undefined,
  defKeys: typeof defKeys !== "undefined" ? defKeys : undefined,
  defMod: typeof defMod !== "undefined" ? defMod : undefined,
  defaultLogChannelId: typeof defaultLogChannelId !== "undefined" ? defaultLogChannelId : undefined,
  defaultRoleChannelKeys: typeof defaultRoleChannelKeys !== "undefined" ? defaultRoleChannelKeys : undefined,
  delay: typeof delay !== "undefined" ? delay : undefined,
  details: typeof details !== "undefined" ? details : undefined,
  devAdminMode: typeof devAdminMode !== "undefined" ? devAdminMode : undefined,
  devGuilds: typeof devGuilds !== "undefined" ? devGuilds : undefined,
  devShowServerGrid: typeof devShowServerGrid !== "undefined" ? devShowServerGrid : undefined,
  discordInfo: typeof discordInfo !== "undefined" ? discordInfo : undefined,
  discordRole: typeof discordRole !== "undefined" ? discordRole : undefined,
  dossierFilter: typeof dossierFilter !== "undefined" ? dossierFilter : undefined,
  dossierSearch: typeof dossierSearch !== "undefined" ? dossierSearch : undefined,
  dossiersData: typeof dossiersData !== "undefined" ? dossiersData : undefined,
  dynamicVoiceData: typeof dynamicVoiceData !== "undefined" ? dynamicVoiceData : undefined,
  editingRoomLimit: typeof editingRoomLimit !== "undefined" ? editingRoomLimit : undefined,
  elapsed: typeof elapsed !== "undefined" ? elapsed : undefined,
  enabled: typeof enabled !== "undefined" ? enabled : undefined,
  err: typeof err !== "undefined" ? err : undefined,
  error: typeof error !== "undefined" ? error : undefined,
  fallbackConfig: typeof fallbackConfig !== "undefined" ? fallbackConfig : undefined,
  fetchApplications: typeof fetchApplications !== "undefined" ? fetchApplications : undefined,
  fetchClanWarnings: typeof fetchClanWarnings !== "undefined" ? fetchClanWarnings : undefined,
  fetchConfig: typeof fetchConfig !== "undefined" ? fetchConfig : undefined,
  fetchDiscordInfo: typeof fetchDiscordInfo !== "undefined" ? fetchDiscordInfo : undefined,
  fetchDossiers: typeof fetchDossiers !== "undefined" ? fetchDossiers : undefined,
  fetchDynamicVoice: typeof fetchDynamicVoice !== "undefined" ? fetchDynamicVoice : undefined,
  fetchUserWarnings: typeof fetchUserWarnings !== "undefined" ? fetchUserWarnings : undefined,
  fetchedConfig: typeof fetchedConfig !== "undefined" ? fetchedConfig : undefined,
  filtered: typeof filtered !== "undefined" ? filtered : undefined,
  filteredBotSettings: typeof filteredBotSettings !== "undefined" ? filteredBotSettings : undefined,
  filteredDevGuilds: typeof filteredDevGuilds !== "undefined" ? filteredDevGuilds : undefined,
  firstLeader: typeof firstLeader !== "undefined" ? firstLeader : undefined,
  flushSave: typeof flushSave !== "undefined" ? flushSave : undefined,
  flushVoiceSave: typeof flushVoiceSave !== "undefined" ? flushVoiceSave : undefined,
  foundDiscordRole: typeof foundDiscordRole !== "undefined" ? foundDiscordRole : undefined,
  fromConfig: typeof fromConfig !== "undefined" ? fromConfig : undefined,
  getChannelId: typeof getChannelId !== "undefined" ? getChannelId : undefined,
  getDefaultModeratorName: typeof getDefaultModeratorName !== "undefined" ? getDefaultModeratorName : undefined,
  getLivePreviewData: typeof getLivePreviewData !== "undefined" ? getLivePreviewData : undefined,
  getSteamProfileUrl: typeof getSteamProfileUrl !== "undefined" ? getSteamProfileUrl : undefined,
  guildId: typeof guildId !== "undefined" ? guildId : undefined,
  guildIdRef: typeof guildIdRef !== "undefined" ? guildIdRef : undefined,
  guildSearchQuery: typeof guildSearchQuery !== "undefined" ? guildSearchQuery : undefined,
  handleAddCustomRole: typeof handleAddCustomRole !== "undefined" ? handleAddCustomRole : undefined,
  handleAddWarn: typeof handleAddWarn !== "undefined" ? handleAddWarn : undefined,
  handleAutoSetupDynamicVoice: typeof handleAutoSetupDynamicVoice !== "undefined" ? handleAutoSetupDynamicVoice : undefined,
  handleBotSearchChange: typeof handleBotSearchChange !== "undefined" ? handleBotSearchChange : undefined,
  handleBotSearchClear: typeof handleBotSearchClear !== "undefined" ? handleBotSearchClear : undefined,
  handleClanNameChange: typeof handleClanNameChange !== "undefined" ? handleClanNameChange : undefined,
  handleClearApplications: typeof handleClearApplications !== "undefined" ? handleClearApplications : undefined,
  handleClearUserWarns: typeof handleClearUserWarns !== "undefined" ? handleClearUserWarns : undefined,
  handleCopyCommand: typeof handleCopyCommand !== "undefined" ? handleCopyCommand : undefined,
  handleCreateDiscordLogChannel: typeof handleCreateDiscordLogChannel !== "undefined" ? handleCreateDiscordLogChannel : undefined,
  handleCreatePermanentInvite: typeof handleCreatePermanentInvite !== "undefined" ? handleCreatePermanentInvite : undefined,
  handleCreateRecruitmentInvite: typeof handleCreateRecruitmentInvite !== "undefined" ? handleCreateRecruitmentInvite : undefined,
  handleCreateRoleInDiscord: typeof handleCreateRoleInDiscord !== "undefined" ? handleCreateRoleInDiscord : undefined,
  handleDeleteCustomRole: typeof handleDeleteCustomRole !== "undefined" ? handleDeleteCustomRole : undefined,
  handleDeleteStandardRole: typeof handleDeleteStandardRole !== "undefined" ? handleDeleteStandardRole : undefined,
  handleExecuteFactoryReset: typeof handleExecuteFactoryReset !== "undefined" ? handleExecuteFactoryReset : undefined,
  handleGlobalSearchDossier: typeof handleGlobalSearchDossier !== "undefined" ? handleGlobalSearchDossier : undefined,
  handleLink: typeof handleLink !== "undefined" ? handleLink : undefined,
  handleManageDynamicRoom: typeof handleManageDynamicRoom !== "undefined" ? handleManageDynamicRoom : undefined,
  handleMessage: typeof handleMessage !== "undefined" ? handleMessage : undefined,
  handleMoveRolesUp: typeof handleMoveRolesUp !== "undefined" ? handleMoveRolesUp : undefined,
  handleRefreshDevGuilds: typeof handleRefreshDevGuilds !== "undefined" ? handleRefreshDevGuilds : undefined,
  handleRemoveWarn: typeof handleRemoveWarn !== "undefined" ? handleRemoveWarn : undefined,
  handleResize: typeof handleResize !== "undefined" ? handleResize : undefined,
  handleRestoreStandardRoles: typeof handleRestoreStandardRoles !== "undefined" ? handleRestoreStandardRoles : undefined,
  handleRoleNameBlur: typeof handleRoleNameBlur !== "undefined" ? handleRoleNameBlur : undefined,
  handleRoleNameChange: typeof handleRoleNameChange !== "undefined" ? handleRoleNameChange : undefined,
  handleSaveDossier: typeof handleSaveDossier !== "undefined" ? handleSaveDossier : undefined,
  handleSelectDevGuild: typeof handleSelectDevGuild !== "undefined" ? handleSelectDevGuild : undefined,
  handleSelectDiscordRole: typeof handleSelectDiscordRole !== "undefined" ? handleSelectDiscordRole : undefined,
  handleSendCrossClanMessage: typeof handleSendCrossClanMessage !== "undefined" ? handleSendCrossClanMessage : undefined,
  handleSyncDiscordRoles: typeof handleSyncDiscordRoles !== "undefined" ? handleSyncDiscordRoles : undefined,
  handleUnlink: typeof handleUnlink !== "undefined" ? handleUnlink : undefined,
  handleViewTranscript: typeof handleViewTranscript !== "undefined" ? handleViewTranscript : undefined,
  hasPromptedRef: typeof hasPromptedRef !== "undefined" ? hasPromptedRef : undefined,
  hwid: typeof hwid !== "undefined" ? hwid : undefined,
  idx: typeof idx !== "undefined" ? idx : undefined,
  inputEl: typeof inputEl !== "undefined" ? inputEl : undefined,
  interval: typeof interval !== "undefined" ? interval : undefined,
  inviteDetails: typeof inviteDetails !== "undefined" ? inviteDetails : undefined,
  inviteLink: typeof inviteLink !== "undefined" ? inviteLink : undefined,
  inviteStatus: typeof inviteStatus !== "undefined" ? inviteStatus : undefined,
  isCompanionWindowVisible: typeof isCompanionWindowVisible !== "undefined" ? isCompanionWindowVisible : undefined,
  isDevAdminActive: typeof isDevAdminActive !== "undefined" ? isDevAdminActive : undefined,
  isDevAuthenticated: typeof isDevAuthenticated !== "undefined" ? isDevAuthenticated : undefined,
  isDocFs: typeof isDocFs !== "undefined" ? isDocFs : undefined,
  isFullScreenWindow: typeof isFullScreenWindow !== "undefined" ? isFullScreenWindow : undefined,
  isGuildDropdownOpen: typeof isGuildDropdownOpen !== "undefined" ? isGuildDropdownOpen : undefined,
  isMaximized: typeof isMaximized !== "undefined" ? isMaximized : undefined,
  isResetting: typeof isResetting !== "undefined" ? isResetting : undefined,
  isSelected: typeof isSelected !== "undefined" ? isSelected : undefined,
  isValid: typeof isValid !== "undefined" ? isValid : undefined,
  l: typeof l !== "undefined" ? l : undefined,
  lastActivityRef: typeof lastActivityRef !== "undefined" ? lastActivityRef : undefined,
  lastLinkAttempt: typeof lastLinkAttempt !== "undefined" ? lastLinkAttempt : undefined,
  lastSaveTimeRef: typeof lastSaveTimeRef !== "undefined" ? lastSaveTimeRef : undefined,
  lastSavedConfigRef: typeof lastSavedConfigRef !== "undefined" ? lastSavedConfigRef : undefined,
  lastVerifiedLinkRef: typeof lastVerifiedLinkRef !== "undefined" ? lastVerifiedLinkRef : undefined,
  lastVerifiedRecruitmentLinkRef: typeof lastVerifiedRecruitmentLinkRef !== "undefined" ? lastVerifiedRecruitmentLinkRef : undefined,
  lastVoiceSaveTimeRef: typeof lastVoiceSaveTimeRef !== "undefined" ? lastVoiceSaveTimeRef : undefined,
  latestConfigRef: typeof latestConfigRef !== "undefined" ? latestConfigRef : undefined,
  latestVoiceConfigRef: typeof latestVoiceConfigRef !== "undefined" ? latestVoiceConfigRef : undefined,
  leader: typeof leader !== "undefined" ? leader : undefined,
  leaderDisplay: typeof leaderDisplay !== "undefined" ? leaderDisplay : undefined,
  leaders: typeof leaders !== "undefined" ? leaders : undefined,
  linkCode: typeof linkCode !== "undefined" ? linkCode : undefined,
  linkToCheck: typeof linkToCheck !== "undefined" ? linkToCheck : undefined,
  loadingApps: typeof loadingApps !== "undefined" ? loadingApps : undefined,
  loadingClanWarnings: typeof loadingClanWarnings !== "undefined" ? loadingClanWarnings : undefined,
  loadingConfig: typeof loadingConfig !== "undefined" ? loadingConfig : undefined,
  loadingDevGuilds: typeof loadingDevGuilds !== "undefined" ? loadingDevGuilds : undefined,
  loadingDossiers: typeof loadingDossiers !== "undefined" ? loadingDossiers : undefined,
  loadingUserWarnings: typeof loadingUserWarnings !== "undefined" ? loadingUserWarnings : undefined,
  loadingVoice: typeof loadingVoice !== "undefined" ? loadingVoice : undefined,
  loggingEventGroups: typeof loggingEventGroups !== "undefined" ? loggingEventGroups : undefined,
  logs: typeof logs !== "undefined" ? logs : undefined,
  mainLink: typeof mainLink !== "undefined" ? mainLink : undefined,
  matchByNameIdx: typeof matchByNameIdx !== "undefined" ? matchByNameIdx : undefined,
  modMember: typeof modMember !== "undefined" ? modMember : undefined,
  modSubTab: typeof modSubTab !== "undefined" ? modSubTab : undefined,
  setModSubTab: typeof setModSubTab !== "undefined" ? setModSubTab : undefined,
  isModExpanded: typeof isModExpanded !== "undefined" ? isModExpanded : undefined,
  setIsModExpanded: typeof setIsModExpanded !== "undefined" ? setIsModExpanded : undefined,
  modSubTabs: typeof modSubTabs !== "undefined" ? modSubTabs : undefined,
  modTag: typeof modTag !== "undefined" ? modTag : undefined,
  movingRoles: typeof movingRoles !== "undefined" ? movingRoles : undefined,
  msg: typeof msg !== "undefined" ? msg : undefined,
  navigate: typeof navigate !== "undefined" ? navigate : undefined,
  newBadWordInput: typeof newBadWordInput !== "undefined" ? newBadWordInput : undefined,
  newChannelId: typeof newChannelId !== "undefined" ? newChannelId : undefined,
  newDiscordName: typeof newDiscordName !== "undefined" ? newDiscordName : undefined,
  newId: typeof newId !== "undefined" ? newId : undefined,
  newRConfig: typeof newRConfig !== "undefined" ? newRConfig : undefined,
  newRole: typeof newRole !== "undefined" ? newRole : undefined,
  newRolesCount: typeof newRolesCount !== "undefined" ? newRolesCount : undefined,
  newUrl: typeof newUrl !== "undefined" ? newUrl : undefined,
  newWarnReason: typeof newWarnReason !== "undefined" ? newWarnReason : undefined,
  nextStep: typeof nextStep !== "undefined" ? nextStep : undefined,
  now: typeof now !== "undefined" ? now : undefined,
  oldName: typeof oldName !== "undefined" ? oldName : undefined,
  onMsg: typeof onMsg !== "undefined" ? onMsg : undefined,
  onlyGuild: typeof onlyGuild !== "undefined" ? onlyGuild : undefined,
  openExternalUrl: typeof openExternalUrl !== "undefined" ? openExternalUrl : undefined,
  openUserWarningsModal: typeof openUserWarningsModal !== "undefined" ? openUserWarningsModal : undefined,
  parsed: typeof parsed !== "undefined" ? parsed : undefined,
  pendingConfigRef: typeof pendingConfigRef !== "undefined" ? pendingConfigRef : undefined,
  pendingVoiceConfigRef: typeof pendingVoiceConfigRef !== "undefined" ? pendingVoiceConfigRef : undefined,
  permissions: typeof permissions !== "undefined" ? permissions : undefined,
  prevTabBeforeSearch: typeof prevTabBeforeSearch !== "undefined" ? prevTabBeforeSearch : undefined,
  previewData: typeof previewData !== "undefined" ? previewData : undefined,
  previewVoteIndex: typeof previewVoteIndex !== "undefined" ? previewVoteIndex : undefined,
  queueAutoSave: typeof queueAutoSave !== "undefined" ? queueAutoSave : undefined,
  queueAutoSaveVoice: typeof queueAutoSaveVoice !== "undefined" ? queueAutoSaveVoice : undefined,
  r: typeof r !== "undefined" ? r : undefined,
  rConfig: typeof rConfig !== "undefined" ? rConfig : undefined,
  raw: typeof raw !== "undefined" ? raw : undefined,
  rc: typeof rc !== "undefined" ? rc : undefined,
  rcLink: typeof rcLink !== "undefined" ? rcLink : undefined,
  recruitmentInviteDetails: typeof recruitmentInviteDetails !== "undefined" ? recruitmentInviteDetails : undefined,
  recruitmentInviteStatus: typeof recruitmentInviteStatus !== "undefined" ? recruitmentInviteStatus : undefined,
  reqId: typeof reqId !== "undefined" ? reqId : undefined,
  res: typeof res !== "undefined" ? res : undefined,
  resetSecs: typeof resetSecs !== "undefined" ? resetSecs : undefined,
  resetSections: typeof resetSections !== "undefined" ? resetSections : undefined,
  roleColor: typeof roleColor !== "undefined" ? roleColor : undefined,
  roleColors: typeof roleColors !== "undefined" ? roleColors : undefined,
  roleId: typeof roleId !== "undefined" ? roleId : undefined,
  roleIdentifier: typeof roleIdentifier !== "undefined" ? roleIdentifier : undefined,
  roleMap: typeof roleMap !== "undefined" ? roleMap : undefined,
  roleName: typeof roleName !== "undefined" ? roleName : undefined,
  rosterData: typeof rosterData !== "undefined" ? rosterData : undefined,
  safeIdx: typeof safeIdx !== "undefined" ? safeIdx : undefined,
  sanitized: typeof sanitized !== "undefined" ? sanitized : undefined,
  saveConfig: typeof saveConfig !== "undefined" ? saveConfig : undefined,
  saveDynamicVoiceConfig: typeof saveDynamicVoiceConfig !== "undefined" ? saveDynamicVoiceConfig : undefined,
  saveStatus: typeof saveStatus !== "undefined" ? saveStatus : undefined,
  saveTimerRef: typeof saveTimerRef !== "undefined" ? saveTimerRef : undefined,
  saved: typeof saved !== "undefined" ? saved : undefined,
  savedGuildId: typeof savedGuildId !== "undefined" ? savedGuildId : undefined,
  selectedProfileForDossier: typeof selectedProfileForDossier !== "undefined" ? selectedProfileForDossier : undefined,
  selectedUserForWarns: typeof selectedUserForWarns !== "undefined" ? selectedUserForWarns : undefined,
  sendProxyAction: typeof sendProxyAction !== "undefined" ? sendProxyAction : undefined,
  setActiveTab: typeof setActiveTab !== "undefined" ? setActiveTab : undefined,
  setActiveVotes: typeof setActiveVotes !== "undefined" ? setActiveVotes : undefined,
  setAppFilter: typeof setAppFilter !== "undefined" ? setAppFilter : undefined,
  setAppSearch: typeof setAppSearch !== "undefined" ? setAppSearch : undefined,
  setApplicationsData: typeof setApplicationsData !== "undefined" ? setApplicationsData : undefined,
  setAutoSetupModalData: typeof setAutoSetupModalData !== "undefined" ? setAutoSetupModalData : undefined,
  setBotSearchQuery: typeof setBotSearchQuery !== "undefined" ? setBotSearchQuery : undefined,
  setCheckingInvite: typeof setCheckingInvite !== "undefined" ? setCheckingInvite : undefined,
  setCheckingRecruitmentInvite: typeof setCheckingRecruitmentInvite !== "undefined" ? setCheckingRecruitmentInvite : undefined,
  setClanWarnings: typeof setClanWarnings !== "undefined" ? setClanWarnings : undefined,
  setConfig: typeof setConfig !== "undefined" ? setConfig : undefined,
  setCopiedCommand: typeof setCopiedCommand !== "undefined" ? setCopiedCommand : undefined,
  setCreatingInvite: typeof setCreatingInvite !== "undefined" ? setCreatingInvite : undefined,
  setCreatingLogChannel: typeof setCreatingLogChannel !== "undefined" ? setCreatingLogChannel : undefined,
  setCreatingRecruitmentInvite: typeof setCreatingRecruitmentInvite !== "undefined" ? setCreatingRecruitmentInvite : undefined,
  setCreatingRoleKey: typeof setCreatingRoleKey !== "undefined" ? setCreatingRoleKey : undefined,
  setDevAdminMode: typeof setDevAdminMode !== "undefined" ? setDevAdminMode : undefined,
  setDevGuilds: typeof setDevGuilds !== "undefined" ? setDevGuilds : undefined,
  setDevShowServerGrid: typeof setDevShowServerGrid !== "undefined" ? setDevShowServerGrid : undefined,
  setDiscordInfo: typeof setDiscordInfo !== "undefined" ? setDiscordInfo : undefined,
  setDossierFilter: typeof setDossierFilter !== "undefined" ? setDossierFilter : undefined,
  setDossierSearch: typeof setDossierSearch !== "undefined" ? setDossierSearch : undefined,
  setDossiersData: typeof setDossiersData !== "undefined" ? setDossiersData : undefined,
  setDynamicVoiceData: typeof setDynamicVoiceData !== "undefined" ? setDynamicVoiceData : undefined,
  setEditingRoomLimit: typeof setEditingRoomLimit !== "undefined" ? setEditingRoomLimit : undefined,
  setError: typeof setError !== "undefined" ? setError : undefined,
  setGuildId: typeof setGuildId !== "undefined" ? setGuildId : undefined,
  setGuildSearchQuery: typeof setGuildSearchQuery !== "undefined" ? setGuildSearchQuery : undefined,
  setInviteDetails: typeof setInviteDetails !== "undefined" ? setInviteDetails : undefined,
  setInviteStatus: typeof setInviteStatus !== "undefined" ? setInviteStatus : undefined,
  setIsDevAuthenticated: typeof setIsDevAuthenticated !== "undefined" ? setIsDevAuthenticated : undefined,
  setIsFullScreenWindow: typeof setIsFullScreenWindow !== "undefined" ? setIsFullScreenWindow : undefined,
  setIsGuildDropdownOpen: typeof setIsGuildDropdownOpen !== "undefined" ? setIsGuildDropdownOpen : undefined,
  setIsResetting: typeof setIsResetting !== "undefined" ? setIsResetting : undefined,
  setLastLinkAttempt: typeof setLastLinkAttempt !== "undefined" ? setLastLinkAttempt : undefined,
  setLinkCode: typeof setLinkCode !== "undefined" ? setLinkCode : undefined,
  setLoadingApps: typeof setLoadingApps !== "undefined" ? setLoadingApps : undefined,
  setLoadingClanWarnings: typeof setLoadingClanWarnings !== "undefined" ? setLoadingClanWarnings : undefined,
  setLoadingConfig: typeof setLoadingConfig !== "undefined" ? setLoadingConfig : undefined,
  setLoadingDevGuilds: typeof setLoadingDevGuilds !== "undefined" ? setLoadingDevGuilds : undefined,
  setLoadingDossiers: typeof setLoadingDossiers !== "undefined" ? setLoadingDossiers : undefined,
  setLoadingUserWarnings: typeof setLoadingUserWarnings !== "undefined" ? setLoadingUserWarnings : undefined,
  setLoadingVoice: typeof setLoadingVoice !== "undefined" ? setLoadingVoice : undefined,
  setLogs: typeof setLogs !== "undefined" ? setLogs : undefined,
  setMovingRoles: typeof setMovingRoles !== "undefined" ? setMovingRoles : undefined,
  setNewBadWordInput: typeof setNewBadWordInput !== "undefined" ? setNewBadWordInput : undefined,
  setNewWarnReason: typeof setNewWarnReason !== "undefined" ? setNewWarnReason : undefined,
  setPreviewVoteIndex: typeof setPreviewVoteIndex !== "undefined" ? setPreviewVoteIndex : undefined,
  setRecruitmentInviteDetails: typeof setRecruitmentInviteDetails !== "undefined" ? setRecruitmentInviteDetails : undefined,
  setRecruitmentInviteStatus: typeof setRecruitmentInviteStatus !== "undefined" ? setRecruitmentInviteStatus : undefined,
  setResetSections: typeof setResetSections !== "undefined" ? setResetSections : undefined,
  setRosterData: typeof setRosterData !== "undefined" ? setRosterData : undefined,
  setSaveStatus: typeof setSaveStatus !== "undefined" ? setSaveStatus : undefined,
  setSelectedProfileForDossier: typeof setSelectedProfileForDossier !== "undefined" ? setSelectedProfileForDossier : undefined,
  setSelectedUserForWarns: typeof setSelectedUserForWarns !== "undefined" ? setSelectedUserForWarns : undefined,
  setShowDiscordLivePreview: typeof setShowDiscordLivePreview !== "undefined" ? setShowDiscordLivePreview : undefined,
  setShowResetModal: typeof setShowResetModal !== "undefined" ? setShowResetModal : undefined,
  setShowSetupWizard: typeof setShowSetupWizard !== "undefined" ? setShowSetupWizard : undefined,
  setStatsData: typeof setStatsData !== "undefined" ? setStatsData : undefined,
  setStatsSortField: typeof setStatsSortField !== "undefined" ? setStatsSortField : undefined,
  setStatsSortOrder: typeof setStatsSortOrder !== "undefined" ? setStatsSortOrder : undefined,
  setStatus: typeof setStatus !== "undefined" ? setStatus : undefined,
  setSyncModalData: typeof setSyncModalData !== "undefined" ? setSyncModalData : undefined,
  setTranscriptModal: typeof setTranscriptModal !== "undefined" ? setTranscriptModal : undefined,
  setUserWarningsList: typeof setUserWarningsList !== "undefined" ? setUserWarningsList : undefined,
  setVoiceActionLoading: typeof setVoiceActionLoading !== "undefined" ? setVoiceActionLoading : undefined,
  setWarnActionLoading: typeof setWarnActionLoading !== "undefined" ? setWarnActionLoading : undefined,
  setWarnModerator: typeof setWarnModerator !== "undefined" ? setWarnModerator : undefined,
  showDiscordLivePreview: typeof showDiscordLivePreview !== "undefined" ? showDiscordLivePreview : undefined,
  showResetModal: typeof showResetModal !== "undefined" ? showResetModal : undefined,
  showSetupWizard: typeof showSetupWizard !== "undefined" ? showSetupWizard : undefined,
  signRes: typeof signRes !== "undefined" ? signRes : undefined,
  standardRoleKeys: typeof standardRoleKeys !== "undefined" ? standardRoleKeys : undefined,
  standardRoles: typeof standardRoles !== "undefined" ? standardRoles : undefined,
  startAutoSetup: typeof startAutoSetup !== "undefined" ? startAutoSetup : undefined,
  statsData: typeof statsData !== "undefined" ? statsData : undefined,
  statsSortField: typeof statsSortField !== "undefined" ? statsSortField : undefined,
  statsSortOrder: typeof statsSortOrder !== "undefined" ? statsSortOrder : undefined,
  status: typeof status !== "undefined" ? status : undefined,
  syncModalData: typeof syncModalData !== "undefined" ? syncModalData : undefined,
  syncPermissions: typeof syncPermissions !== "undefined" ? syncPermissions : undefined,
  t: typeof t !== "undefined" ? t : undefined,
  tabs: typeof tabs !== "undefined" ? tabs : undefined,
  target: typeof target !== "undefined" ? target : undefined,
  targetGid: typeof targetGid !== "undefined" ? targetGid : undefined,
  timeSinceLastSave: typeof timeSinceLastSave !== "undefined" ? timeSinceLastSave : undefined,
  timeout: typeof timeout !== "undefined" ? timeout : undefined,
  trackedEvents: typeof trackedEvents !== "undefined" ? trackedEvents : undefined,
  transcriptModal: typeof transcriptModal !== "undefined" ? transcriptModal : undefined,
  trimmed: typeof trimmed !== "undefined" ? trimmed : undefined,
  updateActivity: typeof updateActivity !== "undefined" ? updateActivity : undefined,
  updated: typeof updated !== "undefined" ? updated : undefined,
  updatedConfig: typeof updatedConfig !== "undefined" ? updatedConfig : undefined,
  updatedCount: typeof updatedCount !== "undefined" ? updatedCount : undefined,
  updatedRecruitment: typeof updatedRecruitment !== "undefined" ? updatedRecruitment : undefined,
  userWarningsList: typeof userWarningsList !== "undefined" ? userWarningsList : undefined,
  val: typeof val !== "undefined" ? val : undefined,
  verifyInvite: typeof verifyInvite !== "undefined" ? verifyInvite : undefined,
  verifyRecruitmentInvite: typeof verifyRecruitmentInvite !== "undefined" ? verifyRecruitmentInvite : undefined,
  voiceActionLoading: typeof voiceActionLoading !== "undefined" ? voiceActionLoading : undefined,
  voiceSaveTimerRef: typeof voiceSaveTimerRef !== "undefined" ? voiceSaveTimerRef : undefined,
  voteChannel: typeof voteChannel !== "undefined" ? voteChannel : undefined,
  wTemplates: typeof wTemplates !== "undefined" ? wTemplates : undefined,
  warnActionLoading: typeof warnActionLoading !== "undefined" ? warnActionLoading : undefined,
  warnModerator: typeof warnModerator !== "undefined" ? warnModerator : undefined,
  ws: typeof ws !== "undefined" ? ws : undefined,
  viewMode: typeof viewMode !== "undefined" ? viewMode : undefined,
  setViewMode: typeof setViewMode !== "undefined" ? setViewMode : undefined,
  clanTabs: typeof clanTabs !== "undefined" ? clanTabs : undefined,
  botConfigGroups: typeof botConfigGroups !== "undefined" ? botConfigGroups : undefined,
  activityStatsData: typeof activityStatsData !== "undefined" ? activityStatsData : undefined,
  loadingActivityStats: typeof loadingActivityStats !== "undefined" ? loadingActivityStats : undefined,
  fetchActivityStats: typeof fetchActivityStats !== "undefined" ? fetchActivityStats : undefined,
  getCachedMemberMeta: typeof getCachedMemberMeta !== "undefined" ? getCachedMemberMeta : undefined,
  saveCachedMembersMeta: typeof saveCachedMembersMeta !== "undefined" ? saveCachedMembersMeta : undefined,
  adTicketsData: typeof adTicketsData !== "undefined" ? adTicketsData : undefined,
  loadingAdTickets: typeof loadingAdTickets !== "undefined" ? loadingAdTickets : undefined,
  fetchAdTickets: typeof fetchAdTickets !== "undefined" ? fetchAdTickets : undefined,
  handleCloseAdTicket: typeof handleCloseAdTicket !== "undefined" ? handleCloseAdTicket : undefined,
  openAdTicketsCount: typeof openAdTicketsCount !== "undefined" ? openAdTicketsCount : undefined,
  pendingAppsCount: typeof pendingAppsCount !== "undefined" ? pendingAppsCount : undefined,
  applicationsCategory: typeof applicationsCategory !== "undefined" ? applicationsCategory : undefined,
  setApplicationsCategory: typeof setApplicationsCategory !== "undefined" ? setApplicationsCategory : undefined
};

  return (
    <ClanManagerContext.Provider value={contextValue}>
      <div className="flex items-start justify-center gap-4 xl:gap-6 h-full min-h-0 w-full mx-auto animate-main-fade-in max-w-full">
      {loadingConfig ? (
        <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2.5 text-orange-500" />
          <span className="font-medium text-sm">{t('clan_loading')}</span>
        </div>
      ) : config ? (
        <>
          <div className="clan-manager-container bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row flex-1 h-full min-h-0 min-w-0 w-full">
          {/* Left Sidebar Navigation */}
          <div className="clan-manager-sidebar w-full md:w-56 xl:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between overflow-y-auto scrollbar-thin h-full">
            {/* Dev Admin Mode Server Selector */}
            {isDevAdminActive && (
              <div className="mb-2 shrink-0 p-2 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50 border border-indigo-500/30">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Admin Mode
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {devGuilds.length} серв.
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGuildDropdownOpen(!isGuildDropdownOpen)}
                    className="w-full flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/40 text-left transition-colors cursor-pointer"
                  >
                    {(() => {
                      const currentG = devGuilds.find(g => g.id === guildId);
                      return (
                        <div className="flex items-center gap-2 min-w-0">
                          {currentG?.icon ? (
                            <img src={currentG.icon} alt="" className="w-5 h-5 rounded-full shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {currentG?.name ? currentG.name.charAt(0).toUpperCase() : '#'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {currentG?.name || (guildId ? `ID: ${guildId}` : 'Выберите сервер...')}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">
                              {currentG?.memberCount !== undefined ? `${currentG.memberCount} ${t('clan_stats_members_short', 'уч.')}` : 'Discord Guild'}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isGuildDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isGuildDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 rounded-xl shadow-2xl border border-indigo-500/40 p-2 max-h-72 flex flex-col min-w-[220px]">
                      <div className="relative mb-2">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={guildSearchQuery}
                          onChange={(e) => setGuildSearchQuery(e.target.value)}
                          placeholder={t('dev_search_guild_short_placeholder', 'Поиск сервера...')}
                          autoFocus
                          className="w-full pl-7 pr-2 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="overflow-y-auto space-y-1 scrollbar-thin flex-1 max-h-48">
                        {devGuilds
                          .filter(g => !guildSearchQuery.trim() || g.name.toLowerCase().includes(guildSearchQuery.toLowerCase()) || g.id.includes(guildSearchQuery))
                          .map((g) => {
                            const isSelected = g.id === guildId;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => handleSelectDevGuild(g)}
                                className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white font-semibold'
                                    : 'text-slate-300 hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {g.icon ? (
                                    <img src={g.icon} alt="" className="w-5 h-5 rounded-full shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                      {g.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="truncate text-xs">{g.name}</div>
                                    <div className="text-[10px] opacity-70">{t('dev_guild_members_count', '{{count}} участников', { count: g.memberCount })}</div>
                                  </div>
                                </div>
                                {g.isConfigured && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {t('db_badge', 'БД')}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>

                      <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleRefreshDevGuilds}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${loadingDevGuilds ? 'animate-spin' : ''}`} />
                          {t('refresh', 'Обновить')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsGuildDropdownOpen(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer"
                        >
                          {t('close', 'Закрыть')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setDevShowServerGrid(true)}
                  className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-[10px] font-bold transition-all cursor-pointer"
                >
                  <span>← {t('dev_all_servers_btn', 'Все серверы ({{count}})', { count: devGuilds.length })}</span>
                </button>
              </div>
            )}

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

            {viewMode === 'clan' ? (
              <div className="flex flex-col flex-1 min-h-0 justify-between">
                <div className="space-y-1">
                  <div className="hidden md:flex items-center justify-between px-3 py-1.5 mb-1 shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {t('clan_nav_clan_operations', 'Управление кланом')}
                    </span>
                  </div>

                  {clanTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />}
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.id === 'roster' && rosterData?.roster?.length > 0 && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            {rosterData.roster.length}
                          </span>
                        )}
                        {tab.id === 'applications' && (
                          pendingAppsCount > 0 ? (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-amber-500 text-white shadow-xs">
                              {pendingAppsCount}
                            </span>
                          ) : applicationsData?.length > 0 ? (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {applicationsData.length}
                            </span>
                          ) : null
                        )}
                        {tab.id === 'ads' && (
                          openAdTicketsCount > 0 ? (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-blue-500 text-white shadow-xs">
                              {openAdTicketsCount}
                            </span>
                          ) : adTicketsData?.length > 0 ? (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {adTicketsData.length}
                            </span>
                          ) : null
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom button: switch to bot configuration */}
                <div className="pt-3 mt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('botConfig');
                      if (!['general', 'roles', 'channels', 'permissions', 'moderation', 'logs', 'voice'].includes(activeTab)) {
                        setActiveTab('general');
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-all shadow-2xs group cursor-pointer"
                    title={t('clan_btn_bot_config_tooltip', 'Перейти к технической настройке бота и сервера')}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t('clan_btn_bot_config', 'Настройки бота')}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{t('clan_btn_bot_config_desc', 'Роли, каналы, защита')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 space-y-2">
                {/* Back to Clan Button */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('clan');
                    if (!['roster', 'votes', 'recruitment', 'applications', 'stats', 'ads'].includes(activeTab)) {
                      setActiveTab('roster');
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 mb-1 rounded-xl bg-blue-50 hover:bg-blue-100/90 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900/50 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>{t('clan_btn_back_to_clan', '← Назад к клану')}</span>
                </button>

                {/* Grouped Tabs */}
                <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin flex-1">
                  {botConfigGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <div className="px-3 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {group.title}
                      </div>
                      {group.tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isModeration = tab.id === 'moderation';
                        const showModSub = isModeration && isModExpanded;

                        return (
                          <React.Fragment key={tab.id}>
                            <button
                              type="button"
                              onClick={() => {
                                if (isModeration) {
                                  if (activeTab === 'moderation') {
                                    setIsModExpanded(prev => !prev);
                                  } else {
                                    setActiveTab('moderation');
                                    setIsModExpanded(true);
                                  }
                                } else {
                                  setActiveTab(tab.id);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />}
                                <span className="truncate">{tab.label}</span>
                              </div>
                              {isModeration && (
                                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${showModSub ? 'rotate-180' : ''} ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                              )}
                            </button>

                            {/* Moderation Sub-Variations under Moderation tab */}
                            {showModSub && (
                              <div className="pl-3 pr-1 py-0.5 space-y-1 flex flex-col transition-all">
                                {modSubTabs.map(sub => {
                                  const isSubActive = activeTab === 'moderation' && modSubTab === sub.id;
                                  const SubIcon = sub.icon;
                                  return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTab('moderation');
                                        setModSubTab(sub.id);
                                      }}
                                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                                        isSubActive
                                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500 pl-2 shadow-2xs'
                                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                      }`}
                                    >
                                      {SubIcon && <SubIcon className={`w-3 h-3 shrink-0 ${isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}
                                      <span className="truncate">{sub.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto h-full scrollbar-thin min-h-0">
            
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
                              const isBotTab = ['general', 'roles', 'channels', 'permissions', 'moderation', 'logs', 'voice'].includes(item.tabId);
                              if (isBotTab) {
                                setViewMode('botConfig');
                              } else {
                                setViewMode('clan');
                              }
                              if (item.tabId === 'moderation') {
                                setIsModExpanded(true);
                                if (item.modSubTab) setModSubTab(item.modSubTab);
                              }
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

            {activeTab === 'general' && <GeneralTab />}

            {activeTab === 'roles' && <RolesTab />}

            {activeTab === 'channels' && <ChannelsTab />}

            {activeTab === 'permissions' && <PermissionsTab />}

            {activeTab === 'voice' && <VoiceTab />}

            {activeTab === 'recruitment' && <RecruitmentTab />}

            {activeTab === 'applications' && <ApplicationsTab />}

            {activeTab === 'votes' && <VotesTab />}

            {activeTab === 'ads' && <AdsTab />}

            {activeTab === 'roster' && <RosterTab />}

            {activeTab === 'dossier' && <DossierTab />}

            {activeTab === 'stats' && <StatsTab />}

            {activeTab === 'logs' && <LogsTab />}

            {activeTab === 'moderation' && <ModerationTab />}
            
          </div>
        </div>

        {/* Discord Companion Window (Real Discord Desktop Dimensions) */}
        {isCompanionWindowVisible && previewData && (
          <aside className="w-[360px] lg:w-[390px] xl:w-[420px] 2xl:w-[450px] shrink-0 h-full flex flex-col min-h-0 transition-all duration-200">
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
    ) : isDevAdminActive && devGuilds.length > 0 ? (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 max-w-xl w-full text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {t('dev_admin_active_title', 'Режим администратора активен')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {t('dev_admin_active_desc', 'Бот подключен к {{count}} серверам. Выберите любой сервер из списка ниже, чтобы открыть панель управления:', { count: devGuilds.length })}
        </p>
        <div className="w-full space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {devGuilds.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelectDevGuild(g)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/40 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {g.icon ? (
                  <img src={g.icon} alt="" className="w-9 h-9 rounded-xl shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {g.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dev_guild_members_count', '{{count}} участников', { count: g.memberCount })} • ID: {g.id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {g.isConfigured ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    {t('dev_guild_configured', 'Настроен')}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {t('dev_guild_new', 'Новый')}
                  </span>
                )}
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  {t('dev_guild_manage_arrow', 'Управлять →')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
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
                { id: 'recruitment', title: t('clan_reset_sec_recruitment_title') || t('clan_rec_base', 'Набор в клан'), desc: t('clan_reset_sec_recruitment_desc') || 'Сброс требований к возрасту и часам в игре, параметров авто-отклонений, тикетов и очистка заявок' },
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
        <div 
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden animate-in fade-in"
          onWheel={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-[90vw] max-w-4xl h-[85vh] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
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
                  setModSubTab('warnings');
                  setIsModExpanded(true);
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
          onClose={handleCloseDossier}
          profile={selectedProfileForDossier}
          onSave={handleSaveDossier}
          onSearchGlobal={handleGlobalSearchDossier}
          onSendCrossClanMessage={handleSendCrossClanMessage}
          userApplications={selectedUserApplications}
          userVotes={selectedUserVotes}
          userWarnings={selectedUserWarnings}
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
      </ClanManagerContext.Provider>
  );
}
