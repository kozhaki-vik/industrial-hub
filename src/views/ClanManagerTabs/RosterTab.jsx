import React, { useContext, useMemo, useState, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  UserCheck, Volume2, RefreshCw, Search, X, Archive,
  AlertTriangle, Check, Shield, Crown, Target, Users,
  SlidersHorizontal, ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import { RosterSkeleton } from '../../components/Skeleton';

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

export default function RosterTab() {
  const {
    config,
    rosterData,
    setRosterData,
    dossiersData,
    statsData,
    clanWarnings,
    discordInfo,
    dynamicVoiceData,
    setSelectedProfileForDossier,
    openUserWarningsModal,
    t
  } = useContext(ClanManagerContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_VOICE' | 'OFFLINE'
  const [sortField, setSortField] = useState('roleHierarchy'); // 'roleHierarchy' | 'name' | 'today' | 'month' | 'warns'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const rosterList = Array.isArray(rosterData?.roster) ? rosterData.roster : [];

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

  return (
    <div className="w-full space-y-5 animate-main-fade-in">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-500" />
            <span>{t('clan_tab_roster', 'Состав клана')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_roster_private_desc', 'Приватный штаб управления бойцами клана (данные видны только руководству)')}
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('clan_stats_members', 'Бойцов')}: <strong className="text-slate-900 dark:text-white font-mono">{statsSummary.total}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('clan_roster_in_voice', 'В войсе')}: <strong className="font-mono">{statsSummary.inVoiceCount}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Volume2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('clan_roster_total_hours', 'За месяц')}: <strong className="font-mono">{statsSummary.totalMonthHours} {t('clan_h_short', 'ч')}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setRosterData(null)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
            title={t('clan_auto_71', 'Обновить')}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('clan_auto_71', 'Обновить')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('clan_roster_search_placeholder', 'Поиск по никнейму, роли или тегу...')}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('clan_roster_filter_all_status', 'Все статусы')}</option>
            <option value="IN_VOICE">🟢 {t('clan_roster_filter_in_voice', 'Только в войсе')}</option>
            <option value="OFFLINE">⚪ {t('clan_roster_filter_offline', 'Не в сети')}</option>
          </select>

          {/* Reset Filters button if any active */}
          {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('clan_roster_reset_filters', 'Сбросить фильтры')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Roster Table */}
      {!rosterData ? (
        <RosterSkeleton count={8} columns="grid-cols-1" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/80 dark:bg-slate-850/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                {/* 1. № */}
                <th scope="col" className="px-4 py-3.5 text-center w-12 shrink-0">
                  #
                </th>

                {/* 2. Боец */}
                <th
                  scope="col"
                  onClick={() => handleSort('name')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
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

                {/* 3. Роль (Отдельная колонка после ника) */}
                <th
                  scope="col"
                  onClick={() => handleSort('roleHierarchy')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
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

                {/* 4. Сегодня */}
                <th
                  scope="col"
                  onClick={() => handleSort('today')}
                  className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
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

                {/* 5. За 30 дней */}
                <th
                  scope="col"
                  onClick={() => handleSort('month')}
                  className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
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

                {/* 6. Статус в Discord */}
                <th scope="col" className="px-4 py-3.5">
                  <span>{t('clan_roster_col_status', 'Статус в Discord')}</span>
                </th>



                {/* 8. Варны (Отдельная колонка) */}
                <th
                  scope="col"
                  onClick={() => handleSort('warns')}
                  className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
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
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>{t('clan_auto_72', 'Участники не найдены. Убедитесь, что роли настроены правильно.')}</div>
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
      )}
    </div>
  );
}
