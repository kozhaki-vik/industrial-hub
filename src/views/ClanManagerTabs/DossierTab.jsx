import React, { useContext, useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  RefreshCw, AlertTriangle, Archive, X, Clock, Star, Search,
  ExternalLink, UserCheck, Shield, Check, LayoutGrid, List,
  Calendar, ChevronLeft, ChevronRight, UserX, AlertCircle
} from 'lucide-react';
import { DossierCardsSkeleton } from '../../components/Skeleton';

// --- Single Dossier Table Row (matching Roster 2.0 layout) ---
const DossierTableRow = React.memo(function DossierTableRow({
  index,
  dossier,
  onOpen,
  onOpenWarns,
  getSteamProfileUrl,
  openExternalUrl,
  cachedMeta,
  t
}) {
  const st = dossier.status || 'ACTIVE';
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

  // Name resolution from profile and persistent cache
  const displayName = dossier.lastSteamName || dossier.username || cachedMeta?.displayName || cachedMeta?.username || 'Участник';
  const username = dossier.username || cachedMeta?.username || 'unknown';
  const initials = (displayName || username).slice(0, 2).toUpperCase();

  // If user left, their avatar is hidden/null to save space and load, showing initials
  const hasAvatar = Boolean(dossier.avatar && st !== 'LEFT');

  // Steam URL
  const steamUrl = getSteamProfileUrl ? getSteamProfileUrl(dossier.steamId) : null;
  const displaySteamId = steamUrl
    ? String(dossier.steamId).replace(/^https?:\/\/steamcommunity\.com\/(profiles|id)\//i, '').replace(/\/+$/, '')
    : null;

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors group">
      {/* 1. № */}
      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 text-center w-12 shrink-0">
        {index + 1}
      </td>

      {/* 2. Пользователь (Никнейм + Аватарка / Стильные инициалы) */}
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
              title={st === 'LEFT' ? t('clan_member_avatar_cleared_on_leave', 'Аватарка удалена после выхода (текстовые данные сохранены)') : displayName}
            >
              {initials}
            </div>
          </div>
          <div className="min-w-0 max-w-[220px]">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-500 transition-colors">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
              ID: {dossier.userId}
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
          {dossier.leftAt && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {t('clan_left_at', 'Вышел')}: {new Date(dossier.leftAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </td>

      {/* 4. Steam профиль */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {!steamUrl ? (
          <span className="text-xs text-slate-400">—</span>
        ) : (
          <button
            type="button"
            onClick={() => openExternalUrl(steamUrl)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[11px] font-medium group max-w-[140px] cursor-pointer"
            title={steamUrl}
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
              <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.86 10.3 9.08 11.63l2.84-4.14a4.42 4.42 0 0 1-.39-.14l-3.9 1.63a7.48 7.48 0 0 1-.84-3.77c0-2.3 1.05-4.36 2.7-5.74L8.7 7.7a7.52 7.52 0 0 1 7.02-1.74l2.45-3.57A12 12 0 0 0 12 0zm3.83 5.96a5.53 5.53 0 0 0-3.32 1.15l3.22 1.34a2.22 2.22 0 1 1-1.35 3.23l-3.26-1.36a5.53 5.53 0 1 0 4.71-4.36zm-6.2 8.65l2.67 1.11a3.02 3.02 0 0 0 1.25-.26l-1.92 2.8a3.03 3.03 0 0 1-2-3.65z"/>
            </svg>
            <span className="truncate">{displaySteamId}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
          </button>
        )}
      </td>

      {/* 5. Часы в игре */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        {(dossier.verifiedHours || dossier.claimedHours) ? (
          <div className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            <span>{dossier.verifiedHours || dossier.claimedHours} {t('clan_hours_short', 'ч.')}</span>
            {dossier.verifiedHours && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold" title={t('clan_auto_106', 'Верифицировано в Steam')}>
                ✓
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* 6. Возраст */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {dossier.age ? `${dossier.age} ${t('clan_years', 'лет')}` : '—'}
      </td>

      {/* 7. Оценка */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        {Number(dossier.overallRating) > 0 ? (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900/50">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{dossier.overallRating}/5</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* 8. Нарушения */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        {(dossier.violationStatus === 'CONFIRMED' || dossier.cheaterStatus === 'CONFIRMED' || ((dossier.violationReport || dossier.cheaterReport) && !dossier.violationStatus && !dossier.cheaterStatus)) ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-800 shadow-2xs">
            <span>🚨</span>
            <span>{t('clan_dossier_badge_violator_confirmed', 'Нарушитель')}</span>
          </span>
        ) : (dossier.violationStatus === 'SUSPICION' || dossier.cheaterStatus === 'SUSPICION') ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 shadow-2xs">
            <span>⚠️</span>
            <span>{t('clan_dossier_badge_violator_suspicion', 'Подозрение')}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>

      {/* 9. Досье (Кнопка открытия личного дела) */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => onOpen(dossier)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white dark:bg-orange-950/40 dark:hover:bg-orange-500 dark:text-orange-300 dark:hover:text-white text-xs font-semibold border border-orange-200/80 dark:border-orange-800/60 transition-all cursor-pointer shadow-2xs group/btn"
          title={t('clan_dossier_open_btn') || 'Открыть карточку'}
        >
          <Archive className="w-3.5 h-3.5 opacity-80 group-hover/btn:opacity-100" />
          <span>{t('clan_roster_dossier_btn', 'Досье')}</span>
        </button>
      </td>

      {/* 10. Варны */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => onOpenWarns && onOpenWarns({ userId: dossier.userId, displayName, username, avatarUrl: dossier.avatar, warnCount: 0 })}
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

// --- Memoized dossier card for Cards View ---
const DossierCard = React.memo(function DossierCard({ dossier, onOpen, getCachedMemberMeta, t }) {
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

  const cachedMeta = getCachedMemberMeta ? getCachedMemberMeta(dossier.userId) : null;
  const displayName = dossier.lastSteamName || dossier.username || cachedMeta?.displayName || cachedMeta?.username || 'Участник';
  const hasAvatar = Boolean(dossier.avatar && st !== 'LEFT');
  const initials = (displayName).slice(0, 2).toUpperCase();

  return (
    <div
      className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
    >
      <div>
        {/* Card Top: Avatar & Name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {hasAvatar ? (
              <img
                src={dossier.avatar}
                alt=""
                className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {initials}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {displayName}
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
          {(dossier.verifiedHours || dossier.claimedHours) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200 dark:border-blue-900/50">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>{dossier.verifiedHours || dossier.claimedHours} {t('clan_hours_short', 'ч.')}</span>
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

          {(dossier.violationStatus === 'CONFIRMED' || dossier.cheaterStatus === 'CONFIRMED' || ((dossier.violationReport || dossier.cheaterReport) && !dossier.violationStatus && !dossier.cheaterStatus)) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>{t('clan_dossier_badge_violator_confirmed', 'Нарушитель')}</span>
            </span>
          )}
          {(dossier.violationStatus === 'SUSPICION' || dossier.cheaterStatus === 'SUSPICION') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>{t('clan_dossier_badge_violator_suspicion', 'Подозрение')}</span>
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
          onClick={() => onOpen(dossier)}
          className="w-full py-1.5 px-3 bg-slate-100 hover:bg-orange-500 text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-500 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{t('clan_dossier_open_btn') || 'Открыть карточку'}</span>
        </button>
      </div>
    </div>
  );
});

export default function DossierTab() {
  const {
    dossiersData,
    loadingDossiers,
    dossierFilter,
    setDossierFilter,
    dossierSearch,
    setDossierSearch,
    fetchDossiers,
    setSelectedProfileForDossier,
    openUserWarningsModal,
    getSteamProfileUrl,
    openExternalUrl,
    getCachedMemberMeta,
    t
  } = useContext(ClanManagerContext);

  // View mode: 'table' (default, matches Roster 2.0) vs 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // --- Debounced search ---
  const debounceTimerRef = useRef(null);
  const latestFilterRef = useRef(dossierFilter);
  latestFilterRef.current = dossierFilter;

  const debouncedFetchDossiers = useCallback((filter, search) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchDossiers(filter, search);
    }, 300);
  }, [fetchDossiers]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleOpenDossier = useCallback((dossier) => {
    setSelectedProfileForDossier(dossier);
  }, [setSelectedProfileForDossier]);

  const handleFilterChange = useCallback((filterId) => {
    setDossierFilter(filterId);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    fetchDossiers(filterId, dossierSearch);
  }, [setDossierFilter, fetchDossiers, dossierSearch]);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setDossierSearch(val);
    debouncedFetchDossiers(latestFilterRef.current, val);
  }, [setDossierSearch, debouncedFetchDossiers]);

  const handleSearchClear = useCallback(() => {
    setDossierSearch('');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    fetchDossiers(latestFilterRef.current, '');
  }, [setDossierSearch, fetchDossiers]);

  const filterPills = useMemo(() => [
    { id: 'ALL', label: t('clan_dossier_filter_all') || 'Все' },
    { id: 'ACTIVE', label: t('clan_dossier_filter_active') || 'В клане' },
    { id: 'LEFT', label: t('clan_dossier_filter_left') || 'Вышли' },
    { id: 'KICKED', label: t('clan_dossier_filter_kicked') || 'Исключены' },
    { id: 'BLACKLISTED', label: t('clan_dossier_filter_blacklisted') || 'ЧС' },
  ], [t]);

  // Client-side pagination for long lists
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const list = dossiersData || [];
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [dossierFilter, dossierSearch]);

  const paginatedDossiers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6 animate-main-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-orange-500" />
            <span>{t('clan_dossier_title') || 'Архив'}</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {list.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_dossier_desc') || 'База данных участников клана, оценки навыков, заметки офицеров и архив соклановцев'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title={t('clan_view_table', 'Таблица (как в Составе)')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title={t('clan_view_grid', 'Карточки')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Status filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterPills.map(f => {
            const isSel = dossierFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search input with debounce */}
        <div className="relative md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={dossierSearch}
            onChange={handleSearchChange}
            placeholder={t('clan_dossier_search_placeholder') || 'Поиск по нику, ID или Steam...'}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
          {dossierSearch && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loadingDossiers && (!dossiersData || dossiersData.length === 0) ? (
        <DossierCardsSkeleton count={6} />
      ) : !dossiersData || dossiersData.length === 0 ? (
        <div className="bg-slate-50/60 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center">
          <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('clan_dossier_empty_title') || 'Архив пуст'}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            {t('clan_dossier_empty_desc') || 'При принятии кандидатов их анкеты и данные автоматически сохраняются в архив. Вы также можете открыть карточку любого соклановца из вкладки "Состав".'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/70 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  <th className="px-4 py-3 text-center w-12 shrink-0">№</th>
                  <th className="px-4 py-3">{t('clan_roster_col_member', 'Боец')}</th>
                  <th className="px-4 py-3">{t('clan_dossier_col_status', 'Статус')}</th>
                  <th className="px-4 py-3">Steam</th>
                  <th className="px-4 py-3 text-center">{t('clan_dossier_col_hours', 'Часы в игре')}</th>
                  <th className="px-4 py-3 text-center">{t('clan_dossier_col_age', 'Возраст')}</th>
                  <th className="px-4 py-3 text-center">{t('clan_dossier_col_rating', 'Оценка')}</th>
                  <th className="px-4 py-3 text-center">{t('clan_dossier_col_violator', 'Нарушения')}</th>
                  <th className="px-4 py-3 text-center">{t('clan_roster_dossier_btn', 'Досье')}</th>
                  <th className="px-4 py-3 text-center">{t('clan_warns_btn', 'Варны')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedDossiers.map((dossier, idx) => (
                  <DossierTableRow
                    key={dossier.id || dossier.userId}
                    index={(currentPage - 1) * pageSize + idx}
                    dossier={dossier}
                    onOpen={handleOpenDossier}
                    onOpenWarns={openUserWarningsModal}
                    getSteamProfileUrl={getSteamProfileUrl}
                    openExternalUrl={openExternalUrl}
                    cachedMeta={getCachedMemberMeta ? getCachedMemberMeta(dossier.userId) : null}
                    t={t}
                  />
                ))}
              </tbody>
            </table>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  {t('clan_pagination_showing', 'Показано')} {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, list.length)} {t('clan_pagination_of', 'из')} {list.length}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDossiers.map(dossier => (
            <DossierCard
              key={dossier.id || dossier.userId}
              dossier={dossier}
              onOpen={handleOpenDossier}
              getCachedMemberMeta={getCachedMemberMeta}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
