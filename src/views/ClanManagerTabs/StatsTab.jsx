import React, { useContext, useState, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  BarChart3, RefreshCw, AlertTriangle, Check,
  Search, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { StatsTableSkeleton } from '../../components/Skeleton';

// Memoized single member stat row to avoid re-rendering untouched rows
const StatRow = React.memo(function StatRow({ stat, t, onOpenWarns }) {
  const voiceHours = Math.floor((stat.voiceTime || 0) / 3600);
  const voiceMinutes = Math.floor(((stat.voiceTime || 0) % 3600) / 60);
  const warnCount = stat.warnCount || 0;

  return (
    <tr className="bg-white border-b dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
      <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white flex items-center">
        <img
          src={stat.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
          alt="avatar"
          loading="lazy"
          className="w-8 h-8 rounded-full mr-3 shrink-0 object-cover bg-slate-100 dark:bg-slate-800"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
          }}
        />
        <div className="min-w-0">
          <div className={`truncate max-w-[180px] sm:max-w-xs ${!stat.isMember ? 'text-slate-400 line-through' : ''}`}>
            {stat.displayName || stat.username || '—'}
          </div>
          <div className="text-[10px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
            @{stat.username || 'unknown'}
          </div>
        </div>
      </th>
      <td className="px-6 py-4 text-center font-mono whitespace-nowrap">
        {voiceHours}{t('clan_h_short', 'ч')} {voiceMinutes}{t('clan_m_short', 'м')}
      </td>
      <td className="px-6 py-4 text-center font-mono">
        {stat.messageCount || 0}
      </td>
      <td className="px-6 py-4 text-center font-mono">
        {stat.wipesPlayed || 0}
      </td>
      <td className="px-6 py-4 text-center font-mono">
        {stat.votesCast || 0}
      </td>
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          onClick={() => onOpenWarns(stat)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            warnCount > 0
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 border border-transparent'
          }`}
          title={t('clan_stats_warns_tooltip') || 'Нажмите для управления предупреждениями'}
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

const ITEMS_PER_PAGE = 20;

export default function StatsTab() {
  const {
    t,
    statsData,
    setStatsData,
    statsSortField,
    setStatsSortField,
    statsSortOrder,
    setStatsSortOrder,
    openUserWarningsModal
  } = useContext(ClanManagerContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleStatsSort = useCallback((field) => {
    if (statsSortField === field) {
      setStatsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setStatsSortField(field);
      setStatsSortOrder(field === 'displayName' ? 'asc' : 'desc');
    }
  }, [statsSortField, setStatsSortField, setStatsSortOrder]);

  // Memoized sort
  const sortedStats = useMemo(() => {
    if (!statsData || !Array.isArray(statsData)) return [];
    return [...statsData].sort((a, b) => {
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
  }, [statsData, statsSortField, statsSortOrder]);

  // Filtered by search
  const filteredStats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedStats;
    return sortedStats.filter(stat => {
      const dName = (stat.displayName || '').toLowerCase();
      const uName = (stat.username || '').toLowerCase();
      return dName.includes(q) || uName.includes(q);
    });
  }, [sortedStats, searchQuery]);

  // Reset page when search or sort changes
  const totalPages = Math.max(1, Math.ceil(filteredStats.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedStats = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredStats.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStats, validPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleRefresh = useCallback(() => {
    setStatsData(null);
  }, [setStatsData]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            {t('clan_stats_title') || 'Статистика участников'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_stats_sort_tip')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('clan_search_member', 'Поиск по нику...')}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center shrink-0 cursor-pointer"
            title={t('clan_auto_73', 'Обновить')}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {t('clan_auto_73', 'Обновить')}
          </button>
        </div>
      </div>

      {!statsData ? (
        <StatsTableSkeleton rows={8} />
      ) : (
        <div className="space-y-3">
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
                {paginatedStats.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      {searchQuery
                        ? (t('clan_no_search_results', 'По вашему запросу ничего не найдено.'))
                        : (t('clan_auto_74', 'Нет данных для отображения.'))}
                    </td>
                  </tr>
                ) : (
                  paginatedStats.map(stat => (
                    <StatRow
                      key={stat.userId}
                      stat={stat}
                      t={t}
                      onOpenWarns={openUserWarningsModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredStats.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
              <div>
                {t('clan_showing_range', 'Показано {from}-{to} из {total}')
                  .replace('{from}', (validPage - 1) * ITEMS_PER_PAGE + 1)
                  .replace('{to}', Math.min(validPage * ITEMS_PER_PAGE, filteredStats.length))
                  .replace('{total}', filteredStats.length)}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validPage <= 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-0.5 font-medium">
                  {validPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validPage >= totalPages}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
