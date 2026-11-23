import React, { useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  UserCheck, Volume2, RefreshCw, Search, X, Archive,
  AlertTriangle, Check, Shield, Crown, Target, Users,
  SlidersHorizontal, ChevronUp, ChevronDown, Sparkles,
  RotateCcw, Calendar, Vote, History, MoreHorizontal, Clock, Trash2
} from 'lucide-react';
import { RosterSkeleton } from '../../components/Skeleton';
import { showConfirm } from '../../components/ConfirmModal';
import DiscordPanelChannelBar from '../../components/DiscordPanelChannelBar';

const ROLE_KEYS = [
  'leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'recruiterRoleId',
  'mainRosterRoleId', 'trialRoleId', 'farmerRoleId', 'plantFarmerRoleId',
  'electricianRoleId', 'builderRoleId', 'pilotRoleId', 'sponsorRoleId', 'vipRoleId'
];

const ROLE_EMOJIS = {
  leader: '👑',
  deputyleader: '🛡️',
  caller: '🎯',
  recruiter: '📢',
  mainroster: '⚔️',
  trial: '⏳',
  farmer: '🌾',
  plantfarmer: '🌿',
  electrician: '⚡',
  builder: '🔨',
  pilot: '🚁',
  sponsor: '💎',
  vip: '⭐'
};

const discordColorToHex = (colorInt) => {
  if (!colorInt || colorInt === 0) return null;
  return `#${colorInt.toString(16).padStart(6, '0')}`;
};

const formatVoiceTime = (seconds, t) => {
  if (!seconds || seconds <= 0) return `0${t('clan_h_short', 'ч')} 00${t('clan_m_short', 'м')}`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}${t('clan_h_short', 'ч')} ${minutes < 10 ? '0' : ''}${minutes}${t('clan_m_short', 'м')}`;
};

const formatLastSeen = (timestamp, t) => {
  if (!timestamp) return t('clan_roster_offline', 'Не в сети');
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return String(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `${t('clan_roster_today_at', 'Сегодня')}, ${timeStr}`;
    }
    const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${timeStr} | ${dateStr}`;
  } catch {
    return String(timestamp);
  }
};

// --- Single Roster Row (Table row) ---
const RosterTableRow = React.memo(function RosterTableRow({
  index,
  member,
  topRole,
  voiceToday,
  voice30Days,
  voiceChannelName,
  isInVoice,
  lastSeenTime,
  dossierInfo,
  warnCount,
  onOpenDossier,
  onOpenWarns,
  t
}) {
  const mId = member.userId || member.id;
  const roleColorHex = topRole?.color ? discordColorToHex(topRole.color) : null;
  const roleEmoji = topRole?.shortKey ? ROLE_EMOJIS[topRole.shortKey.toLowerCase()] || '🏷️' : '🏷️';

  return (
    <tr onClick={() => onOpenDossier(mId, member)} className="cursor-pointer border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors group">
      {/* 1. № */}
      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 text-center w-12 shrink-0">
        {index + 1}
      </td>

      {/* 2. Боец (Никнейм) */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={member.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200/50 dark:ring-slate-700/50"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
              }}
            />
            {isInVoice && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" title={t('clan_roster_in_voice_now', 'Сейчас в голосовом канале')} />
            )}
          </div>
          <div className="min-w-0 max-w-[220px]">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {member.displayName || member.username || '—'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              @{member.username || 'unknown'}
            </div>
          </div>
        </div>
      </td>

      {/* 3. Роль (Отдельная колонка после ника) */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {topRole ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs border"
            style={{
              backgroundColor: roleColorHex ? `${roleColorHex}18` : undefined,
              borderColor: roleColorHex ? `${roleColorHex}40` : undefined,
              color: roleColorHex || undefined
            }}
            className={!roleColorHex ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40' : ''}
          >
            <span>{roleEmoji}</span>
            <span className="truncate max-w-[140px]">{topRole.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        )}
      </td>

      {/* 4. Сегодня */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-xs text-slate-700 dark:text-slate-300">
        <span className={voiceToday > 0 ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
          {formatVoiceTime(voiceToday, t)}
        </span>
      </td>

      {/* 5. За 30 дней */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-xs text-slate-700 dark:text-slate-300">
        <span className={voice30Days > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>
          {formatVoiceTime(voice30Days, t)}
        </span>
      </td>

      {/* 6. Статус в Discord */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isInVoice ? (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Volume2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[200px]" title={voiceChannelName}>
              {voiceChannelName || t('clan_voice_active', 'В голосовом канале')}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
            <span>{lastSeenTime ? `${t('clan_roster_last_seen', 'Был в сети')}: ${formatLastSeen(lastSeenTime, t)}` : t('clan_roster_offline', 'Не в сети')}</span>
          </div>
        )}
      </td>



      {/* 8. Варны (Отдельная колонка) */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenWarns({ userId: mId, displayName: member.displayName || member.username, username: member.username, avatarUrl: member.avatarUrl, warnCount }); }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border shadow-2xs ${
            warnCount > 0
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border-slate-200 dark:border-slate-700/60'
          }`}
          title={t('clan_stats_warns_tooltip', 'Нажмите для управления предупреждениями')}
        >
          {warnCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{warnCount}</span>
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
  );
});

// --- Single History / Archive Row ---
const HistoryTableRow = React.memo(function HistoryTableRow({
  index,
  dossier,
  onOpenDossier,
  onOpenWarns,
  votesCount,
  getSteamProfileUrl,
  openExternalUrl,
  cachedMeta,
  t
}) {
  const st = dossier.status || 'LEFT';
  const statusColor =
    st === 'ACTIVE'
      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
      : st === 'LEFT'
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        : st === 'KICKED'
          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
          : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';

  const statusLabel =
    st === 'ACTIVE' ? (t('clan_dossier_status_active') || 'В клане') :
    st === 'LEFT' ? (t('clan_dossier_status_left') || 'Вышел') :
    st === 'KICKED' ? (t('clan_dossier_status_kicked') || 'Исключен') :
    (t('clan_dossier_status_blacklisted') || 'В черном списке');

  const displayName = dossier.lastSteamName || dossier.username || cachedMeta?.displayName || cachedMeta?.username || 'Участник';
  const username = dossier.username || cachedMeta?.username || 'unknown';
  const initials = (displayName || username).slice(0, 2).toUpperCase();
  const hasAvatar = Boolean(dossier.avatar && st !== 'LEFT');

  const steamUrl = getSteamProfileUrl ? getSteamProfileUrl(dossier.steamId) : null;
  const displaySteamId = steamUrl
    ? String(dossier.steamId).replace(/^https?:\/\/steamcommunity\.com\/(profiles|id)\//i, '').replace(/\/+$/, '')
    : null;

  return (
    <tr
      onClick={() => onOpenDossier(dossier.userId, { ...dossier, displayName, username })}
      className="cursor-pointer border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors group"
    >
      {/* 1. № */}
      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 text-center w-12 shrink-0">
        {index + 1}
      </td>

      {/* 2. Боец (Никнейм + Steam) */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {hasAvatar ? (
              <img
                src={dossier.avatar}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200/50 dark:ring-slate-700/50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`w-9 h-9 rounded-full bg-linear-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-slate-300/40 dark:ring-slate-700/40 shadow-xs ${hasAvatar ? 'hidden' : 'flex'}`}
            >
              {initials}
            </div>
          </div>
          <div className="min-w-0 max-w-[220px]">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-500 transition-colors">
              {displayName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                @{username}
              </span>
              {displaySteamId && (
                <span className="text-[10px] text-blue-500/80 font-mono truncate">
                  Steam: {displaySteamId}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 3. Статус в архиве */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex flex-col items-start gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${statusColor}`} title={dossier.statusReason || ''}>
            <span>{st === 'ACTIVE' ? '🟢' : st === 'LEFT' ? '⚪' : st === 'KICKED' ? '🔴' : '🟣'}</span>
            <span>{statusLabel}</span>
          </span>
          {dossier.statusReason && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]" title={dossier.statusReason}>
              {dossier.statusReason}
            </span>
          )}
        </div>
      </td>

      {/* 4. Вступил в клан */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-mono">
        {dossier.joinedAt ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{new Date(dossier.joinedAt).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* 5. Покинул клан */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-mono">
        {dossier.leftAt ? (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span>{new Date(dossier.leftAt).toLocaleDateString()}</span>
          </div>
        ) : st === 'ACTIVE' ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('clan_still_in_clan', 'В составе')}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* 6. Часы Rust */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        {(dossier.verifiedHours || dossier.claimedHours) ? (
          <div className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            <span>{dossier.verifiedHours || dossier.claimedHours} {t('clan_hours_short', 'ч.')}</span>
            {dossier.verifiedHours ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold" title={t('clan_auto_106', 'Верифицировано в Steam')}>✓</span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* 7. Голосования в вайпах */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-xs">
        {votesCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900/40">
            <Vote className="w-3 h-3 text-blue-500" />
            <span>{votesCount}</span>
          </span>
        ) : (
          <span className="text-slate-400">0</span>
        )}
      </td>

      {/* 8. Личное дело (Досье) */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenDossier(dossier.userId, { ...dossier, displayName, username }); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white dark:bg-orange-950/40 dark:hover:bg-orange-500 dark:text-orange-300 dark:hover:text-white text-xs font-semibold border border-orange-200/80 dark:border-orange-800/60 transition-all cursor-pointer shadow-2xs group/btn"
          title={t('clan_dossier_open_btn') || 'Открыть карточку'}
        >
          <Archive className="w-3.5 h-3.5 opacity-80 group-hover/btn:opacity-100" />
          <span>{t('clan_roster_dossier_btn', 'Досье')}</span>
        </button>
      </td>

      {/* 9. Варны */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenWarns && onOpenWarns({ userId: dossier.userId, displayName, username, avatarUrl: dossier.avatar, warnCount: 0 }); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer shadow-2xs"
          title={t('clan_stats_warns_tooltip', 'Нажмите для управления предупреждениями')}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('clan_warns_btn', 'Варны')}</span>
        </button>
      </td>
    </tr>
  );
});

export default function RosterTab() {
  const {
    config,
    setConfig,
    autoSaveConfig,
    rosterData,
    setRosterData,
    dossiersData,
    fetchDossiers,
    activeVotes,
    statsData,
    clanWarnings,
    discordInfo,
    dynamicVoiceData,
    setSelectedProfileForDossier,
    openUserWarningsModal,
    sendProxyAction,
    getSteamProfileUrl,
    openExternalUrl,
    getCachedMemberMeta,
    t
  } = useContext(ClanManagerContext);

  const rosterChannelId = useMemo(() => {
    try {
      if (config?.channelsConfigJson) {
        const parsed = typeof config.channelsConfigJson === 'string'
          ? JSON.parse(config.channelsConfigJson)
          : config.channelsConfigJson;
        return parsed.roster || parsed.dynamicRosterChannel || null;
      }
    } catch {}
    return null;
  }, [config?.channelsConfigJson]);

  const handlePublishOrMoveRoster = useCallback(async (targetChannelId) => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('publish_or_move_roster', { targetChannelId });
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          let chCfg = {};
          try {
            if (config?.channelsConfigJson) {
              chCfg = typeof config.channelsConfigJson === 'string'
                ? JSON.parse(config.channelsConfigJson)
                : config.channelsConfigJson;
            }
          } catch {}
          chCfg.roster = targetChannelId;
          chCfg.dynamicRosterChannel = targetChannelId;
          const updated = { ...config, channelsConfigJson: JSON.stringify(chCfg) };
          if (typeof autoSaveConfig === 'function') autoSaveConfig(updated);
        }
        return { success: true };
      }
      return { success: false, error: res?.error };
    }
    return { success: false, error: 'Proxy not available' };
  }, [sendProxyAction, config, setConfig, autoSaveConfig]);

  const handleSyncRoster = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      await sendProxyAction('sync_panel', { panelType: 'roster' });
    }
  }, [sendProxyAction]);

  const handleDeleteRoster = useCallback(async () => {
    if (typeof sendProxyAction === 'function') {
      const res = await sendProxyAction('delete_roster');
      if (res?.success) {
        if (res.config && typeof setConfig === 'function') {
          setConfig(res.config);
        } else {
          let chCfg = {};
          try {
            if (config?.channelsConfigJson) {
              chCfg = typeof config.channelsConfigJson === 'string'
                ? JSON.parse(config.channelsConfigJson)
                : config.channelsConfigJson;
            }
          } catch {}
          delete chCfg.roster;
          delete chCfg.dynamicRosterChannel;
          const updated = { ...config, channelsConfigJson: JSON.stringify(chCfg) };
          if (typeof autoSaveConfig === 'function') autoSaveConfig(updated);
        }
      }
    }
  }, [sendProxyAction, config, setConfig, autoSaveConfig]);

  const [rosterViewMode, setRosterViewMode] = useState('active'); // 'active' | 'archive'
  const [archiveFilter, setArchiveFilter] = useState('ALL'); // 'ALL' | 'LEFT' | 'KICKED' | 'BLACKLISTED' | 'ACTIVE'
  const [isResettingVoice, setIsResettingVoice] = useState(false);
  const [voiceResetDone, setVoiceResetDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_VOICE' | 'OFFLINE'
  const [sortField, setSortField] = useState('roleHierarchy'); // 'roleHierarchy' | 'name' | 'today' | 'month' | 'warns'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const rosterList = Array.isArray(rosterData?.roster) ? rosterData.roster : [];

  // --- Precompute user votes count from activeVotes ---
  const userVotesCountMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(activeVotes)) {
      for (const v of activeVotes) {
        try {
          const voters = v.votersJson ? (typeof v.votersJson === 'string' ? JSON.parse(v.votersJson) : v.votersJson) : [];
          for (const vt of voters) {
            const uid = typeof vt === 'string' ? vt : vt.userId;
            if (uid) map.set(uid, (map.get(uid) || 0) + 1);
          }
        } catch (e) {}
      }
    }
    return map;
  }, [activeVotes]);

  // --- Precompute roleNamesMap ---
  const roleNamesMap = useMemo(() => {
    try {
      if (!rosterData?.roleNamesJson) return {};
      return typeof rosterData.roleNamesJson === 'string'
        ? JSON.parse(rosterData.roleNamesJson)
        : rosterData.roleNamesJson;
    } catch { return {}; }
  }, [rosterData?.roleNamesJson]);

  // --- Precompute roleId → shortKey Map ---
  const roleIdToKey = useMemo(() => {
    const map = new Map();
    if (config) {
      for (const k of ROLE_KEYS) {
        if (config[k]) map.set(config[k], k.replace('RoleId', ''));
      }
    }
    return map;
  }, [config]);

  // --- Precompute Discord roles lookup Map by roleId ---
  const discordRolesMap = useMemo(() => {
    const map = new Map();
    if (discordInfo?.roles && Array.isArray(discordInfo.roles)) {
      for (const r of discordInfo.roles) {
        map.set(r.id, r);
      }
    }
    return map;
  }, [discordInfo?.roles]);

  // --- Precompute stats lookup Map by userId ---
  const statsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(statsData)) {
      for (const s of statsData) {
        const uid = s.userId || s.id;
        if (uid) map.set(uid, s);
      }
    }
    return map;
  }, [statsData]);

  // --- Precompute warnings count Map by userId ---
  const warningsCountMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(clanWarnings)) {
      for (const w of clanWarnings) {
        if (w.userId) {
          map.set(w.userId, (map.get(w.userId) || 0) + 1);
        }
      }
    }
    return map;
  }, [clanWarnings]);

  // --- Precompute dynamic voice presence Map (userId -> channelName) ---
  const voicePresenceMap = useMemo(() => {
    const map = new Map();
    if (dynamicVoiceData?.activeRooms && Array.isArray(dynamicVoiceData.activeRooms)) {
      for (const room of dynamicVoiceData.activeRooms) {
        if (Array.isArray(room.members)) {
          for (const m of room.members) {
            const uid = m.id || m.userId;
            if (uid) map.set(uid, room.name || '🔊 Войс-комната');
          }
        }
      }
    }
    return map;
  }, [dynamicVoiceData?.activeRooms]);

  // --- Precompute dossier lookup Map ---
  const dossierMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(dossiersData)) {
      for (const d of dossiersData) {
        if (d.userId) map.set(d.userId, d);
      }
    }
    return map;
  }, [dossiersData]);

  // --- Calculate top role & enriched member data ---
  const enrichedMembers = useMemo(() => {
    const ROLE_PRIORITY_KEYS = [
      'leader', 'deputyleader', 'caller', 'recruiter',
      'mainroster', 'trial', 'farmer', 'plantfarmer',
      'electrician', 'builder', 'pilot', 'sponsor', 'vip'
    ];

    return rosterList.filter(m => !m.bot && (!m.user || !m.user.bot)).map(member => {
      const mId = member.userId || member.id;
      const mRoles = member.roles || [];

      // Determine highest clan/discord role
      let bestRole = null;
      let highestPosition = -1;

      for (const rId of mRoles) {
        const dRole = discordRolesMap.get(rId);
        const shortKey = roleIdToKey.get(rId);
        const roleName = dRole?.name || (shortKey ? (roleNamesMap[shortKey] || shortKey) : null);

        // Discord role position if available
        let pos = dRole?.position ?? -1;
        if (pos === -1 && shortKey) {
          const idx = ROLE_PRIORITY_KEYS.indexOf(shortKey.toLowerCase());
          pos = idx !== -1 ? (100 - idx) : 10;
        }

        if (pos > highestPosition && roleName) {
          highestPosition = pos;
          bestRole = {
            id: rId,
            name: roleName,
            color: dRole?.color || null,
            position: pos,
            shortKey: shortKey || null
          };
        }
      }

      const stat = statsMap.get(mId);
      const voiceToday = stat?.voiceTimeToday || member.voiceToday || member.voiceTimeToday || 0;
      const voice30Days = stat?.voiceTime || member.voiceTime || 0;
      const inDynamicVoice = voicePresenceMap.get(mId);
      const isInVoice = Boolean(inDynamicVoice || member.inVoice || member.voiceChannel);
      const voiceChannelName = inDynamicVoice || member.voiceChannel || member.channelName || (isInVoice ? '🔊 Discord Voice' : null);
      const lastSeenTime = stat?.lastSeen || member.lastSeen || dossierMap.get(mId)?.lastActive || null;
      const warnCount = warningsCountMap.get(mId) ?? stat?.warnCount ?? 0;

      return {
        member,
        mId,
        displayName: member.displayName || member.username || '',
        username: member.username || '',
        topRole: bestRole,
        voiceToday,
        voice30Days,
        isInVoice,
        voiceChannelName,
        lastSeenTime,
        dossierInfo: dossierMap.get(mId) || null,
        warnCount
      };
    });
  }, [rosterList, discordRolesMap, roleIdToKey, roleNamesMap, statsMap, voicePresenceMap, dossierMap, warningsCountMap]);

  // --- Filter and Sort ---
  const processedMembers = useMemo(() => {
    let result = [...enrichedMembers];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        return (
          item.displayName.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          (item.topRole?.name && item.topRole.name.toLowerCase().includes(q))
        );
      });
    }

    // Filter by role
    if (roleFilter !== 'ALL') {
      result = result.filter(item => {
        return item.topRole?.shortKey?.toLowerCase() === roleFilter.toLowerCase();
      });
    }

    // Filter by status
    if (statusFilter === 'IN_VOICE') {
      result = result.filter(item => item.isInVoice);
    } else if (statusFilter === 'OFFLINE') {
      result = result.filter(item => !item.isInVoice);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'roleHierarchy') {
        const posA = a.topRole?.position ?? -1;
        const posB = b.topRole?.position ?? -1;
        cmp = posB - posA; // Higher position first
        if (cmp === 0) {
          cmp = a.displayName.localeCompare(b.displayName);
        }
      } else if (sortField === 'name') {
        cmp = a.displayName.localeCompare(b.displayName);
      } else if (sortField === 'today') {
        cmp = (a.voiceToday || 0) - (b.voiceToday || 0);
      } else if (sortField === 'month') {
        cmp = (a.voice30Days || 0) - (b.voice30Days || 0);
      } else if (sortField === 'warns') {
        cmp = (a.warnCount || 0) - (b.warnCount || 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [enrichedMembers, searchQuery, roleFilter, statusFilter, sortField, sortOrder]);

  // --- Summary metrics ---
  const statsSummary = useMemo(() => {
    const total = enrichedMembers.length;
    const inVoiceCount = enrichedMembers.filter(m => m.isInVoice).length;
    const totalMonthSeconds = enrichedMembers.reduce((acc, m) => acc + (m.voice30Days || 0), 0);
    const totalMonthHours = Math.floor(totalMonthSeconds / 3600);
    const withWarnsCount = enrichedMembers.filter(m => m.warnCount > 0).length;

    return { total, inVoiceCount, totalMonthHours, withWarnsCount };
  }, [enrichedMembers]);

  // --- Handlers ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'roleHierarchy' || field === 'today' || field === 'month' || field === 'warns' ? 'desc' : 'asc');
    }
  };

  const handleOpenDossier = useCallback((mId, member) => {
    const existing = dossierMap.get(mId);
    const profileToOpen = existing || {
      userId: mId,
      username: member.displayName || member.username,
      avatar: member.avatarUrl,
      status: 'ACTIVE'
    };
    setSelectedProfileForDossier(profileToOpen);
  }, [dossierMap, setSelectedProfileForDossier]);

  const handleOpenWarns = useCallback((statPayload) => {
    if (typeof openUserWarningsModal === 'function') {
      openUserWarningsModal(statPayload);
    }
  }, [openUserWarningsModal]);

  // --- Archive Members Computation ---
  const archiveList = useMemo(() => {
    if (!Array.isArray(dossiersData)) return [];
    return dossiersData;
  }, [dossiersData]);

  const archiveCounts = useMemo(() => {
    const list = archiveList;
    const leftCount = list.filter(d => d.status === 'LEFT').length;
    const kickedCount = list.filter(d => d.status === 'KICKED').length;
    const blCount = list.filter(d => d.status === 'BLACKLISTED' || d.isBlacklisted).length;
    const activeCount = list.filter(d => d.status === 'ACTIVE').length;
    return {
      ALL: list.length,
      EXITED: leftCount + kickedCount + blCount,
      LEFT: leftCount,
      KICKED: kickedCount,
      BLACKLISTED: blCount,
      ACTIVE: activeCount
    };
  }, [archiveList]);

  const processedArchiveMembers = useMemo(() => {
    let list = [...archiveList];

    if (archiveFilter === 'EXITED') {
      list = list.filter(d => d.status === 'LEFT' || d.status === 'KICKED' || d.status === 'BLACKLISTED' || d.isBlacklisted);
    } else if (archiveFilter === 'BLACKLISTED') {
      list = list.filter(d => d.status === 'BLACKLISTED' || d.isBlacklisted);
    } else if (archiveFilter !== 'ALL') {
      list = list.filter(d => d.status === archiveFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d => {
        const dName = (d.lastSteamName || d.username || '').toLowerCase();
        const uId = (d.userId || '').toLowerCase();
        const sId = (d.steamId || '').toLowerCase();
        const reason = (d.statusReason || '').toLowerCase();
        const notes = (d.notes || '').toLowerCase();
        return dName.includes(q) || uId.includes(q) || sId.includes(q) || reason.includes(q) || notes.includes(q);
      });
    }

    list.sort((a, b) => {
      const dateA = new Date(a.leftAt || a.joinedAt || 0).getTime();
      const dateB = new Date(b.leftAt || b.joinedAt || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [archiveList, archiveFilter, searchQuery]);

  // --- Voice Time Reset Handler (Manual Leader Action) ---
  const handleResetVoiceTime = async () => {
    const confirmed = await showConfirm({
      title: t('clan_reset_voice_confirm_title', 'Сброс времени в голосовом чате'),
      message: t('clan_reset_voice_confirm_desc', 'Вы действительно хотите сбросить накопленное время в голосовом чате для всех участников клана? Это действие обнулит счетчики за сегодня и за все время (до момента сброса).'),
      confirmText: t('clan_reset_voice_btn', 'Сбросить время'),
      danger: true
    });
    if (!confirmed) return;

    setIsResettingVoice(true);
    try {
      if (typeof sendProxyAction === 'function') {
        const res = await sendProxyAction('reset_voice_time');
        if (res && res.success) {
          setVoiceResetDone(true);
          setTimeout(() => setVoiceResetDone(false), 4000);
          setRosterData(null);
        }
      }
    } catch (err) {
      console.error('[RosterTab] Voice reset error:', err);
    } finally {
      setIsResettingVoice(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-main-fade-in">
      {/* Discord Dynamic Roster Channel Status & Manager */}
      <DiscordPanelChannelBar
        title={t('clan_roster_channel_title', 'Канал динамического состава')}
        channelId={rosterChannelId}
        discordChannels={discordInfo?.channels || []}
        onPublishOrMove={handlePublishOrMoveRoster}
        onSync={handleSyncRoster}
        onDelete={handleDeleteRoster}
        activeDesc={t('clan_roster_channel_active_desc', 'Бот автоматически обновляет карточки активных участников клана в реальном времени.')}
        promptText={t('clan_roster_channel_prompt', 'Выберите канал, в котором бот будет публиковать и обновлять карточки участников клана. При смене канала бот автоматически удалит карточки из прежнего канала.')}
        deleteConfirmDesc={t('clan_roster_delete_confirm_desc', 'Вы уверены, что хотите удалить карточки состава из Discord? Сообщения участников будут удалены из канала.')}
        icon={UserCheck}
        accentColor="blue"
      />

      {/* Action Controls & Mode Switcher Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Active vs Archive View Mode Switch */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setRosterViewMode('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              rosterViewMode === 'active'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('clan_roster_mode_active', 'Активный состав')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              rosterViewMode === 'active' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {statsSummary.total}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRosterViewMode('archive');
              if (typeof fetchDossiers === 'function') fetchDossiers();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              rosterViewMode === 'archive'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{t('clan_roster_mode_archive', 'История / Архив')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              rosterViewMode === 'archive' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {archiveCounts.ALL}
            </span>
          </button>
        </div>

        {/* Action Group: 1 Main Primary Action + Context Menu (⋯) */}
        <div className="flex items-center gap-2">
          {/* Main Primary Button */}
          <button
            type="button"
            onClick={() => {
              if (rosterViewMode === 'active') {
                setRosterData(null);
              } else {
                if (typeof fetchDossiers === 'function') fetchDossiers();
              }
            }}
            className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={t('clan_auto_71', 'Обновить')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('clan_auto_71', 'Обновить')}</span>
          </button>

          {/* Context Dropdown Menu: Rare / secondary actions */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-slate-200 dark:bg-slate-750 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
              title="Дополнительные действия"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 p-1.5 z-30 animate-main-fade-in text-xs">
                {rosterChannelId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSyncRoster();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Синхронизировать в Discord</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleResetVoiceTime();
                  }}
                  disabled={isResettingVoice}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-amber-500 shrink-0 ${isResettingVoice ? 'animate-spin' : ''}`} />
                  <span>{t('clan_reset_voice_btn', 'Сбросить время войса')}</span>
                </button>

                {rosterChannelId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDeleteRoster();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Удалить карточки из Discord</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three Compact Statistics Cards */}
      {rosterViewMode === 'active' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-850/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('clan_stats_members', 'Всего бойцов')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {statsSummary.total}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('clan_roster_in_voice', 'В голосовом')}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                {statsSummary.inVoiceCount}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                {t('clan_roster_total_hours', 'За 30 дней')}
              </div>
              <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-0.5">
                {statsSummary.totalMonthHours} {t('clan_h_short', 'ч')}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-850/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('clan_archive_total_joined', 'Всего вступало')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {archiveCounts.ALL}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {t('clan_archive_exited', 'Покинуло клан')}
              </div>
              <div className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300 mt-0.5">
                {archiveCounts.LEFT + archiveCounts.KICKED}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-100/70 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                {t('clan_archive_blacklisted', 'В черном списке')}
              </div>
              <div className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
                {archiveCounts.BLACKLISTED}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Unified Toolbar) */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={rosterViewMode === 'active'
              ? (t('clan_roster_search_placeholder', 'Поиск по никнейму, роли или тегу...'))
              : (t('clan_archive_search_placeholder', 'Поиск по никнейму, Steam, Discord ID...'))}
            className="w-full pl-8.5 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {rosterViewMode === 'active' ? (
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border-0 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">🌐 {t('clan_roster_filter_all_status', 'Все статусы')}</option>
              <option value="IN_VOICE">🟢 {t('clan_roster_filter_in_voice', 'В войсе')}</option>
              <option value="OFFLINE">⚪ {t('clan_roster_filter_offline', 'Не в сети')}</option>
            </select>

            {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('clan_roster_reset_filters', 'Сбросить фильтры')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {[
              { id: 'EXITED', label: t('clan_archive_filter_exited', 'Выбывшие'), count: archiveCounts.EXITED },
              { id: 'LEFT', label: t('clan_dossier_status_left', 'Покинули'), count: archiveCounts.LEFT },
              { id: 'KICKED', label: t('clan_dossier_status_kicked', 'Исключены'), count: archiveCounts.KICKED },
              { id: 'BLACKLISTED', label: t('clan_dossier_status_blacklisted', 'ЧС'), count: archiveCounts.BLACKLISTED },
              { id: 'ALL', label: t('clan_archive_filter_all', 'Все'), count: archiveCounts.ALL }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setArchiveFilter(f.id)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  archiveFilter === f.id
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-2xs'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] font-mono ${archiveFilter === f.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Table: Active Roster vs History/Archive */}
      {rosterViewMode === 'active' ? (
        !rosterData ? (
          <RosterSkeleton count={8} columns="grid-cols-1" />
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-800/60">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50/60 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800/60 select-none">
                <tr>
                  <th scope="col" className="px-4 py-3 text-center w-12 shrink-0">#</th>
                  <th
                    scope="col"
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('clan_roster_col_member', 'Боец (Никнейм)')}</span>
                      {sortField === 'name' ? (
                        <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">↕</span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('roleHierarchy')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('clan_roster_col_role', 'Роль')}</span>
                      {sortField === 'roleHierarchy' ? (
                        <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">↕</span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('today')}
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('clan_roster_col_today', 'Сегодня')}</span>
                      {sortField === 'today' ? (
                        <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">↕</span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('month')}
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('clan_roster_col_month', 'За 30 дней')}</span>
                      {sortField === 'month' ? (
                        <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">↕</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span>{t('clan_roster_col_status', 'Статус в Discord')}</span>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('warns')}
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('clan_roster_col_warns', 'Варны')}</span>
                      {sortField === 'warns' ? (
                        <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">↕</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-7 text-center text-slate-400 dark:text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-1.5">
                        <Users className="w-4 h-4 opacity-70" />
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('clan_auto_72', 'Участники не найдены')}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? t('clan_filters_no_match', 'Попробуйте изменить параметры поиска или фильтров')
                          : t('clan_roster_check_roles_hint', 'Убедитесь, что роли клана настроены в разделе «Роли»')}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedMembers.map((item, index) => (
                    <RosterTableRow
                      key={item.mId}
                      index={index}
                      member={item.member}
                      topRole={item.topRole}
                      voiceToday={item.voiceToday}
                      voice30Days={item.voice30Days}
                      voiceChannelName={item.voiceChannelName}
                      isInVoice={item.isInVoice}
                      lastSeenTime={item.lastSeenTime}
                      dossierInfo={item.dossierInfo}
                      warnCount={item.warnCount}
                      onOpenDossier={handleOpenDossier}
                      onOpenWarns={handleOpenWarns}
                      t={t}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Archive / History Table */
        <div className="overflow-x-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/60 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800/60 select-none">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-12 shrink-0">#</th>
                <th scope="col" className="px-4 py-3">{t('clan_archive_col_user', 'Боец (Никнейм / Steam)')}</th>
                <th scope="col" className="px-4 py-3">{t('clan_archive_col_status', 'Статус в архиве')}</th>
                <th scope="col" className="px-4 py-3">{t('clan_archive_col_joined', 'Вступил в клан')}</th>
                <th scope="col" className="px-4 py-3">{t('clan_archive_col_left', 'Покинул / В составе')}</th>
                <th scope="col" className="px-4 py-3 text-center">{t('clan_archive_col_hours', 'Часы Rust')}</th>
                <th scope="col" className="px-4 py-3 text-center">{t('clan_archive_col_votes', 'Голосования')}</th>
                <th scope="col" className="px-4 py-3 text-center">{t('clan_roster_dossier_btn', 'Досье')}</th>
                <th scope="col" className="px-4 py-3 text-center">{t('clan_warns_btn', 'Варны')}</th>
              </tr>
            </thead>
            <tbody>
              {processedArchiveMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-7 text-center text-slate-400 dark:text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-1.5">
                      <History className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t('clan_archive_empty', 'В выбранной категории архива пока нет записей')}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {searchQuery ? t('clan_filters_no_match', 'По вашему запросу ничего не найдено') : t('clan_archive_empty_desc', 'Здесь появится история участников при выходе или исключении')}
                    </div>
                  </td>
                </tr>
              ) : (
                processedArchiveMembers.map((dossier, index) => (
                  <HistoryTableRow
                    key={dossier.userId || index}
                    index={index}
                    dossier={dossier}
                    onOpenDossier={handleOpenDossier}
                    onOpenWarns={handleOpenWarns}
                    votesCount={userVotesCountMap.get(dossier.userId) || 0}
                    getSteamProfileUrl={getSteamProfileUrl}
                    openExternalUrl={openExternalUrl}
                    cachedMeta={getCachedMemberMeta ? getCachedMemberMeta(dossier.userId) : null}
                    t={t}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
