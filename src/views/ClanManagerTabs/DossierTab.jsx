import React, { useContext, useMemo, useRef, useCallback, useEffect } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  RefreshCw, AlertTriangle, Archive, X, Clock, Star, Search
} from 'lucide-react';
import { DossierCardsSkeleton } from '../../components/Skeleton';

// --- Memoized dossier card to prevent re-renders when sibling cards change ---
const DossierCard = React.memo(function DossierCard({ dossier, onOpen, t }) {
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
    dossiersData, loadingDossiers, dossierFilter, setDossierFilter,
    dossierSearch, setDossierSearch, fetchDossiers,
    setSelectedProfileForDossier, t
  } = useContext(ClanManagerContext);

  // --- Debounced search: wait 300ms after user stops typing before sending WS request ---
  const debounceTimerRef = useRef(null);
  const latestFilterRef = useRef(dossierFilter);
  latestFilterRef.current = dossierFilter;

  const debouncedFetchDossiers = useCallback((filter, search) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchDossiers(filter, search);
    }, 300);
  }, [fetchDossiers]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // --- Stable callback for opening dossier ---
  const handleOpenDossier = useCallback((dossier) => {
    setSelectedProfileForDossier(dossier);
  }, [setSelectedProfileForDossier]);

  // --- Filter change: fetch immediately (no debounce for filter pills) ---
  const handleFilterChange = useCallback((filterId) => {
    setDossierFilter(filterId);
    // Cancel any pending debounced search and fetch immediately with new filter
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    fetchDossiers(filterId, dossierSearch);
  }, [setDossierFilter, fetchDossiers, dossierSearch]);

  // --- Search input: debounce the API call ---
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

  return (
    <>
      <div className="w-full space-y-6">
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
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search input with debounce */}
          <div className="relative md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={dossierSearch}
              onChange={handleSearchChange}
              placeholder={t('clan_dossier_search_placeholder') || 'Поиск по нику, ID или Steam...'}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
            {dossiersData.map(dossier => (
              <DossierCard
                key={dossier.id || dossier.userId}
                dossier={dossier}
                onOpen={handleOpenDossier}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
