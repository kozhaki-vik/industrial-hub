import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Trash2, RefreshCw, ScrollText, UserCheck, Check,
  Search, ExternalLink, X, ChevronLeft, ChevronRight,
  ClipboardList, AlertCircle, Archive, Megaphone, Lock, Hash
} from 'lucide-react';
import { ApplicationsTableSkeleton } from '../../components/Skeleton';
import { showConfirm } from '../../components/ConfirmModal';

// --- Memoized clan application row ---
const ApplicationRow = React.memo(function ApplicationRow({
  app,
  t,
  getSteamProfileUrl,
  openExternalUrl,
  handleViewTranscript,
  cachedMeta
}) {
  const steamUrl = getSteamProfileUrl ? getSteamProfileUrl(app.steamId) : null;
  const displaySteamId = steamUrl
    ? String(app.steamId).replace(/^https?:\/\/steamcommunity\.com\/(profiles|id)\//i, '').replace(/\/+$/, '')
    : null;

  const displayName = app.username || cachedMeta?.displayName || cachedMeta?.username || t('clan_candidate', 'Кандидат');
  const initials = (displayName || app.userId || 'К').slice(0, 2).toUpperCase();

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/60">
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-3">
          {app.avatar ? (
            <img
              src={app.avatar}
              alt=""
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs ${app.avatar ? 'hidden' : 'flex'}`}
          >
            {initials}
          </div>
          <div className="min-w-0 max-w-[200px]">
            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">{displayName}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">ID: {app.userId}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5">
        {!steamUrl ? (
          <span className="text-slate-400 text-xs">—</span>
        ) : (
          <button
            type="button"
            onClick={() => openExternalUrl(steamUrl)}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[11px] font-medium group max-w-[120px] cursor-pointer"
            title={steamUrl}
          >
            <svg className="w-3 h-3 fill-current shrink-0 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
              <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.86 10.3 9.08 11.63l2.84-4.14a4.42 4.42 0 0 1-.39-.14l-3.9 1.63a7.48 7.48 0 0 1-.84-3.77c0-2.3 1.05-4.36 2.7-5.74L8.7 7.7a7.52 7.52 0 0 1 7.02-1.74l2.45-3.57A12 12 0 0 0 12 0zm3.83 5.96a5.53 5.53 0 0 0-3.32 1.15l3.22 1.34a2.22 2.22 0 1 1-1.35 3.23l-3.26-1.36a5.53 5.53 0 1 0 4.71-4.36zm-6.2 8.65l2.67 1.11a3.02 3.02 0 0 0 1.25-.26l-1.92 2.8a3.03 3.03 0 0 1-2-3.65z"/>
            </svg>
            <span className="truncate">{displaySteamId}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
          </button>
        )}
      </td>
      <td className="px-3 py-3.5 font-medium text-slate-700 dark:text-slate-300 text-xs">
        {app.age ? `${app.age} ${t('clan_years', 'лет')}` : '—'}
      </td>
      <td className="px-3 py-3.5">
        <div className="flex items-center space-x-1 text-xs">
          <span className="font-medium text-slate-800 dark:text-slate-200">{app.hours || 0} {t('clan_hours_short', 'ч.')}</span>
          {app.verifiedHours !== null && app.verifiedHours !== undefined && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold" title={t('clan_auto_106', 'Верифицировано в Steam')}>
              ✓
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-3.5">
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
      <td className="px-3 py-3.5 max-w-[180px] truncate text-[11px]">
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
      <td className="px-3 py-3.5 text-center">
        <button
          type="button"
          onClick={() => handleViewTranscript(app)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all text-[11px] font-medium shadow-2xs group cursor-pointer"
          title={t('clan_recruitment_app_view_transcript') || 'Просмотр транскрипта'}
        >
          <ScrollText className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          <span>{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</span>
        </button>
      </td>
      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
});

// --- Memoized ad ticket row ---
const AdTicketRow = React.memo(function AdTicketRow({
  ticket,
  t,
  guildId,
  openExternalUrl,
  handleViewTranscript,
  onCloseTicket
}) {
  const user = ticket.user || {};
  const displayName = user.displayName || user.username || `User ${String(ticket.userId).slice(-4)}`;
  const initials = (displayName || 'Р').slice(0, 2).toUpperCase();
  const isOpen = ticket.status === 'OPEN';

  const channelUrl = guildId && ticket.channelId
    ? `discord://discord.com/channels/${guildId}/${ticket.channelId}`
    : null;
  const webChannelUrl = guildId && ticket.channelId
    ? `https://discord.com/channels/${guildId}/${ticket.channelId}`
    : null;

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/60">
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs ${user.avatar ? 'hidden' : 'flex'}`}
          >
            {initials}
          </div>
          <div className="min-w-0 max-w-[200px]">
            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">{displayName}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">ID: {ticket.userId}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
          📢 {t('clan_ad_ticket_type_ad', 'Реклама / Партнерство')}
        </span>
      </td>
      <td className="px-3 py-3.5">
        {channelUrl ? (
          <button
            type="button"
            onClick={() => {
              if (openExternalUrl) {
                openExternalUrl(channelUrl);
              } else {
                window.open(webChannelUrl, '_blank');
              }
            }}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-[11px] font-medium group cursor-pointer"
            title={`Открыть канал в Discord: #${ticket.channelId}`}
          >
            <Hash className="w-3 h-3 opacity-70 group-hover:opacity-100" />
            <span className="font-mono">#{String(ticket.channelId).slice(-6)}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
      <td className="px-3 py-3.5">
        {isOpen ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            {t('clan_ad_ticket_status_open', 'Открыт')}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            🔒 {t('clan_ad_ticket_status_closed', 'Закрыт')}
          </span>
        )}
      </td>
      <td className="px-3 py-3.5 text-center">
        <button
          type="button"
          onClick={() => handleViewTranscript({
            id: ticket.id,
            channelId: ticket.channelId,
            username: displayName,
            userId: ticket.userId,
            appliedAt: ticket.createdAt
          })}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all text-[11px] font-medium shadow-2xs group cursor-pointer"
          title={t('clan_recruitment_app_view_transcript') || 'Просмотр транскрипта'}
        >
          <ScrollText className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          <span>{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</span>
        </button>
      </td>
      <td className="px-3 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
      </td>
      <td className="px-4 py-3.5 text-right">
        {isOpen ? (
          <button
            type="button"
            onClick={() => onCloseTicket(ticket)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-[11px] font-medium cursor-pointer"
            title={t('clan_ad_ticket_close_btn', 'Закрыть тикет')}
          >
            <Lock className="w-3 h-3" />
            <span>{t('clan_ad_ticket_close_btn', 'Закрыть')}</span>
          </button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
    </tr>
  );
});

export default function ApplicationsTab() {
  const {
    applicationsData,
    loadingApps,
    appFilter,
    setAppFilter,
    appSearch,
    setAppSearch,
    fetchApplications,
    handleClearApplications,
    handleViewTranscript,
    getSteamProfileUrl,
    openExternalUrl,
    getCachedMemberMeta,
    t,
    adTicketsData,
    loadingAdTickets,
    fetchAdTickets,
    handleCloseAdTicket,
    openAdTicketsCount,
    pendingAppsCount,
    applicationsCategory,
    setApplicationsCategory,
    discordInfo,
    currentActiveGuildId,
    config
  } = useContext(ClanManagerContext);

  const guildId = currentActiveGuildId || discordInfo?.guild?.id || config?.guildId || '';

  // --- Category Switcher (Clan applications vs Ad tickets) ---
  const currentCategory = applicationsCategory || 'clan';

  // --- Clan Applications State ---
  const [appViewMode, setAppViewMode] = useState('active'); // 'active' | 'archive'
  const [archiveSubFilter, setArchiveSubFilter] = useState('ALL'); // 'ALL' | 'ACCEPTED' | 'REJECTED' | 'AUTO_REJECTED'

  // Debounced search for clan applications
  const [searchInput, setSearchInput] = useState(appSearch || '');
  const searchTimerRef = useRef(null);

  useEffect(() => {
    setSearchInput(appSearch || '');
  }, [appSearch]);

  const handleSearchChange = useCallback((val) => {
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setAppSearch(val);
    }, 250);
  }, [setAppSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setAppSearch('');
  }, [setAppSearch]);

  // --- Ad Tickets State ---
  const [adViewMode, setAdViewMode] = useState('active'); // 'active' | 'closed'
  const [adSearchInput, setAdSearchInput] = useState('');
  const [adDebouncedSearch, setAdDebouncedSearch] = useState('');
  const adSearchTimerRef = useRef(null);

  const handleAdSearchChange = useCallback((val) => {
    setAdSearchInput(val);
    if (adSearchTimerRef.current) clearTimeout(adSearchTimerRef.current);
    adSearchTimerRef.current = setTimeout(() => {
      setAdDebouncedSearch(val);
    }, 250);
  }, []);

  const handleClearAdSearch = useCallback(() => {
    setAdSearchInput('');
    if (adSearchTimerRef.current) clearTimeout(adSearchTimerRef.current);
    setAdDebouncedSearch('');
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (adSearchTimerRef.current) clearTimeout(adSearchTimerRef.current);
    };
  }, []);

  // --- Close ad ticket confirmation handler ---
  const handleConfirmCloseTicket = useCallback(async (ticket) => {
    const userLabel = ticket.user?.displayName || ticket.user?.username || ticket.userId;
    const confirmed = await showConfirm({
      title: t('clan_ad_ticket_close_confirm_title', 'Закрытие тикета'),
      message: `${t('clan_ad_ticket_close_confirm_msg', 'Вы действительно хотите закрыть заявку/тикет пользователя')} ${userLabel}? Канал в Discord будет архивирован.`
    });
    if (confirmed && handleCloseAdTicket) {
      handleCloseAdTicket(ticket.id, ticket.channelId);
    }
  }, [handleCloseAdTicket, t]);

  // --- Status counts for clan applications ---
  const clanStatusCounts = useMemo(() => {
    const list = applicationsData || [];
    return {
      ALL: list.length,
      PENDING: list.filter(a => a.status === 'PENDING').length,
      ACCEPTED: list.filter(a => a.status === 'ACCEPTED').length,
      REJECTED: list.filter(a => a.status === 'REJECTED').length,
      AUTO_REJECTED: list.filter(a => a.status === 'AUTO_REJECTED').length
    };
  }, [applicationsData]);

  // --- Filter and Search logic for clan applications ---
  const filteredApplications = useMemo(() => {
    let list = applicationsData || [];

    if (appViewMode === 'active') {
      list = list.filter(a => a.status === 'PENDING');
    } else {
      list = list.filter(a => a.status !== 'PENDING');
      if (archiveSubFilter && archiveSubFilter !== 'ALL') {
        list = list.filter(a => a.status === archiveSubFilter);
      }
    }

    if (appSearch && appSearch.trim()) {
      const q = appSearch.trim().toLowerCase();
      list = list.filter(a =>
        (a.username && a.username.toLowerCase().includes(q)) ||
        (a.userId && a.userId.includes(q)) ||
        (a.steamId && a.steamId.includes(q)) ||
        (a.experience && a.experience.toLowerCase().includes(q)) ||
        (a.rejectReason && a.rejectReason.toLowerCase().includes(q))
      );
    }
    return list;
  }, [applicationsData, appViewMode, archiveSubFilter, appSearch]);

  // --- Filter and Search logic for Ad Tickets ---
  const adTicketsCounts = useMemo(() => {
    const list = adTicketsData || [];
    return {
      ALL: list.length,
      OPEN: list.filter(t => t.status === 'OPEN').length,
      CLOSED: list.filter(t => t.status === 'CLOSED').length
    };
  }, [adTicketsData]);

  const filteredAdTickets = useMemo(() => {
    let list = adTicketsData || [];

    if (adViewMode === 'active') {
      list = list.filter(t => t.status === 'OPEN');
    } else {
      list = list.filter(t => t.status === 'CLOSED');
    }

    if (adDebouncedSearch && adDebouncedSearch.trim()) {
      const q = adDebouncedSearch.trim().toLowerCase();
      list = list.filter(t => {
        const username = t.user?.username?.toLowerCase() || '';
        const displayName = t.user?.displayName?.toLowerCase() || '';
        const uid = String(t.userId || '');
        const cid = String(t.channelId || '');
        return username.includes(q) || displayName.includes(q) || uid.includes(q) || cid.includes(q);
      });
    }
    return list;
  }, [adTicketsData, adViewMode, adDebouncedSearch]);

  // --- Client-side Pagination (Clan Apps) ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [appViewMode, archiveSubFilter, appSearch]);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // --- Client-side Pagination (Ad Tickets) ---
  const [adPage, setAdPage] = useState(1);
  const totalAdPages = Math.max(1, Math.ceil(filteredAdTickets.length / pageSize));

  useEffect(() => {
    setAdPage(1);
  }, [adViewMode, adDebouncedSearch]);

  const paginatedAdTickets = useMemo(() => {
    const start = (adPage - 1) * pageSize;
    return filteredAdTickets.slice(start, start + pageSize);
  }, [filteredAdTickets, adPage, pageSize]);

  return (
    <div className="w-full space-y-6 animate-main-fade-in">
      {/* Top Category Tabs: Заявки в клан vs Заявки на рекламу */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setApplicationsCategory && setApplicationsCategory('clan')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
            currentCategory === 'clan'
              ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>{t('clan_tab_applications', 'Заявки в клан')}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
            clanStatusCounts.PENDING > 0
              ? 'bg-orange-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {clanStatusCounts.PENDING > 0 ? clanStatusCounts.PENDING : clanStatusCounts.ALL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setApplicationsCategory && setApplicationsCategory('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
            currentCategory === 'ads'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{t('clan_tab_ad_tickets', 'Заявки на рекламу')}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
            adTicketsCounts.OPEN > 0
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {adTicketsCounts.OPEN > 0 ? adTicketsCounts.OPEN : adTicketsCounts.ALL}
          </span>
        </button>
      </div>

      {/* --- CATEGORY: CLAN APPLICATIONS --- */}
      {currentCategory === 'clan' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-orange-500" />
                <span>{t('clan_tab_applications', 'Заявки в клан')}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {clanStatusCounts.ALL}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('clan_recruitment_apps_desc') || 'История всех поступивших заявок: принятые, отклоненные руководством и отфильтрованные ботом.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchApplications}
                disabled={loadingApps}
                className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingApps ? 'animate-spin text-orange-500' : ''}`} />
                <span>{t('clan_recruitment_apps_refresh') || 'Обновить'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearApplications}
                disabled={loadingApps || clanStatusCounts.ALL === 0}
                className="px-3.5 py-2 text-xs font-semibold border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={t('clan_recruitment_apps_clear') || 'Очистить журнал'}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>{t('clan_recruitment_apps_clear') || 'Очистить журнал'}</span>
              </button>
            </div>
          </div>

          {/* View Mode & Filter Toolbar */}
          <div className="flex flex-col gap-3 p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Main Mode Toggle: Active vs Archive */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAppViewMode('active')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    appViewMode === 'active'
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>{t('clan_apps_mode_active', 'Активные заявки')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    appViewMode === 'active' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {clanStatusCounts.PENDING}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppViewMode('archive')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    appViewMode === 'archive'
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{t('clan_apps_mode_archive', 'Архив заявок')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    appViewMode === 'archive' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {clanStatusCounts.ACCEPTED + clanStatusCounts.REJECTED + clanStatusCounts.AUTO_REJECTED}
                  </span>
                </button>
              </div>

              {/* Debounced Search input */}
              <div className="relative md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('clan_recruitment_app_search_placeholder') || 'Поиск по нику, Discord ID, Steam...'}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={t('clan_auto_105', 'Очистить поиск')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-filters for Archive Mode */}
            {appViewMode === 'archive' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">
                  {t('clan_apps_archive_filter_label', 'Статус в архиве:')}
                </span>
                {[
                  { id: 'ALL', label: t('clan_recruitment_apps_filter_all') || 'Все', count: clanStatusCounts.ACCEPTED + clanStatusCounts.REJECTED + clanStatusCounts.AUTO_REJECTED },
                  { id: 'ACCEPTED', label: t('clan_recruitment_apps_filter_accepted') || 'Приняты', count: clanStatusCounts.ACCEPTED },
                  { id: 'REJECTED', label: t('clan_recruitment_apps_filter_rejected') || 'Отклонены', count: clanStatusCounts.REJECTED },
                  { id: 'AUTO_REJECTED', label: t('clan_recruitment_apps_filter_auto_rejected') || 'Авто-отказ', count: clanStatusCounts.AUTO_REJECTED }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setArchiveSubFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                      archiveSubFilter === f.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      archiveSubFilter === f.id ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loadingApps && (!applicationsData || applicationsData.length === 0) ? (
              <div className="p-6">
                <ApplicationsTableSkeleton rows={8} />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-16 border-dashed border-slate-200 dark:border-slate-800">
                <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {appSearch
                    ? (t('clan_search_not_found_title') || 'Ничего не найдено')
                    : (t('clan_recruitment_apps_empty') || 'Заявок в выбранной категории пока нет')}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  {appSearch
                    ? `${t('clan_apps_search_empty', 'По запросу «')}${appSearch}${t('clan_apps_search_empty2', '» заявок не найдено.')}`
                    : (t('clan_apps_empty_desc', 'Когда кандидаты заполнят форму заявки в Discord, их анкеты мгновенно появятся здесь.'))}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedApplications.map(app => (
                      <ApplicationRow
                        key={app.id}
                        app={app}
                        t={t}
                        getSteamProfileUrl={getSteamProfileUrl}
                        openExternalUrl={openExternalUrl}
                        handleViewTranscript={handleViewTranscript}
                        cachedMeta={getCachedMemberMeta ? getCachedMemberMeta(app.userId) : null}
                      />
                    ))}
                  </tbody>
                </table>

                {/* Pagination Toolbar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      {t('clan_pagination_showing', 'Показано')} {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredApplications.length)} {t('clan_pagination_of', 'из')} {filteredApplications.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{t('clan_pagination_prev', 'Назад')}</span>
                      </button>
                      <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                      >
                        <span>{t('clan_pagination_next', 'Вперед')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CATEGORY: AD TICKETS / APPLICATIONS --- */}
      {currentCategory === 'ads' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-500" />
                <span>{t('clan_ad_tickets_title', 'Заявки на рекламу и сотрудничество')}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {adTicketsCounts.ALL}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('clan_ad_tickets_desc', 'Все обращения по рекламе, партнерству и спонсорству, открытые пользователями Discord.')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchAdTickets}
                disabled={loadingAdTickets}
                className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAdTickets ? 'animate-spin text-blue-500' : ''}`} />
                <span>{t('clan_recruitment_apps_refresh') || 'Обновить'}</span>
              </button>
            </div>
          </div>

          {/* View Mode & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            {/* Mode Switcher: Active vs Closed */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setAdViewMode('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  adViewMode === 'active'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>{t('clan_ad_mode_active', 'Активные заявки')}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  adViewMode === 'active' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {adTicketsCounts.OPEN}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdViewMode('closed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  adViewMode === 'closed'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{t('clan_ad_mode_closed', 'Закрытые тикеты')}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  adViewMode === 'closed' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {adTicketsCounts.CLOSED}
                </span>
              </button>
            </div>

            {/* Debounced Search input */}
            <div className="relative md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={adSearchInput}
                onChange={(e) => handleAdSearchChange(e.target.value)}
                placeholder={t('clan_ad_ticket_search_placeholder', 'Поиск по нику, ID, каналу...')}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
              />
              {adSearchInput && (
                <button
                  type="button"
                  onClick={handleClearAdSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={t('clan_auto_105', 'Очистить поиск')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loadingAdTickets && (!adTicketsData || adTicketsData.length === 0) ? (
              <div className="p-6">
                <ApplicationsTableSkeleton rows={6} />
              </div>
            ) : filteredAdTickets.length === 0 ? (
              <div className="text-center py-16 border-dashed border-slate-200 dark:border-slate-800">
                <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {adDebouncedSearch
                    ? (t('clan_search_not_found_title') || 'Ничего не найдено')
                    : (t('clan_ad_tickets_empty', 'Заявок на рекламу в выбранной категории пока нет'))}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  {adDebouncedSearch
                    ? `${t('clan_apps_search_empty', 'По запросу «')}${adDebouncedSearch}${t('clan_apps_search_empty2', '» заявок не найдено.')}`
                    : (t('clan_ad_tickets_empty_desc', 'Когда пользователи нажмут кнопки заказа рекламы или партнерства в Discord, тикеты появятся здесь.'))}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
                    <tr>
                      <th className="px-4 py-3">{t('clan_ad_col_user', 'Пользователь')}</th>
                      <th className="px-3 py-3">{t('clan_ad_col_type', 'Категория')}</th>
                      <th className="px-3 py-3">{t('clan_ad_col_channel', 'Канал в Discord')}</th>
                      <th className="px-3 py-3">{t('clan_recruitment_app_col_status') || 'Статус'}</th>
                      <th className="px-3 py-3 text-center">{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</th>
                      <th className="px-3 py-3">{t('clan_recruitment_app_col_date') || 'Дата'}</th>
                      <th className="px-4 py-3 text-right">{t('clan_ad_col_actions', 'Действие')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedAdTickets.map(ticket => (
                      <AdTicketRow
                        key={ticket.id}
                        ticket={ticket}
                        t={t}
                        guildId={guildId}
                        openExternalUrl={openExternalUrl}
                        handleViewTranscript={handleViewTranscript}
                        onCloseTicket={handleConfirmCloseTicket}
                      />
                    ))}
                  </tbody>
                </table>

                {/* Pagination Toolbar */}
                {totalAdPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      {t('clan_pagination_showing', 'Показано')} {(adPage - 1) * pageSize + 1}–{Math.min(adPage * pageSize, filteredAdTickets.length)} {t('clan_pagination_of', 'из')} {filteredAdTickets.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={adPage <= 1}
                        onClick={() => setAdPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{t('clan_pagination_prev', 'Назад')}</span>
                      </button>
                      <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                        {adPage} / {totalAdPages}
                      </span>
                      <button
                        type="button"
                        disabled={adPage >= totalAdPages}
                        onClick={() => setAdPage(p => Math.min(totalAdPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-medium"
                      >
                        <span>{t('clan_pagination_next', 'Вперед')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
