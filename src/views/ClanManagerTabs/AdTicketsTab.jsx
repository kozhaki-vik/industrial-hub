import React, { useContext, useState, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  Megaphone, RefreshCw, Trash2, Search, ExternalLink, X,
  ChevronLeft, ChevronRight, Hash, ScrollText, Lock, AlertCircle
} from 'lucide-react';
import { ApplicationsTableSkeleton } from '../../components/Skeleton';
import { showConfirm } from '../../components/ConfirmModal';

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
      <td className="px-3 py-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40 text-[11px]">
          📢 {t('clan_ad_ticket_type_ad', 'Реклама / Партнерство')}
        </span>
      </td>
      <td className="px-3 py-3.5">
        {ticket.channelId ? (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                if (channelUrl && openExternalUrl) {
                  openExternalUrl(channelUrl);
                  setTimeout(() => {
                    if (webChannelUrl) openExternalUrl(webChannelUrl);
                  }, 1200);
                }
              }}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors text-[11px] font-medium group cursor-pointer"
              title={`Открыть канал в Discord: #${ticket.channelId}`}
            >
              <Hash className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-500" />
              <span className="font-mono">#{String(ticket.channelId).slice(-6)}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60 group-hover:opacity-100" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>
      <td className="px-3 py-3.5">
        {isOpen ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            🟢 {t('clan_ad_ticket_status_open', 'Открыт')}
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
      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
      </td>
      <td className="px-4 py-3.5 text-right">
        {isOpen && (
          <button
            type="button"
            onClick={() => onCloseTicket(ticket)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-[11px] font-medium cursor-pointer"
            title={t('clan_ad_ticket_close_btn', 'Закрыть тикет')}
          >
            <Lock className="w-3 h-3" />
            <span>{t('clan_ad_ticket_close', 'Закрыть')}</span>
          </button>
        )}
      </td>
    </tr>
  );
});

export default function AdTicketsTab() {
  const {
    t,
    adTicketsData,
    loadingAdTickets,
    fetchAdTickets,
    openExternalUrl,
    handleViewTranscript,
    transcriptModalData,
    handleCloseTranscript,
    handleCopyTranscript,
    handleOpenTranscriptInBrowser,
    guildId,
    config,
    handleCloseAdTicket,
    sendClanProxy
  } = useContext(ClanManagerContext);

  const [adViewMode, setAdViewMode] = useState('ALL'); // 'ALL' | 'OPEN' | 'CLOSED'
  const [adSearch, setAdSearch] = useState('');
  const [adPage, setAdPage] = useState(1);
  const pageSize = 15;

  const effectiveGuildId = guildId || config?.guildId;

  const adTicketsCounts = useMemo(() => {
    const list = Array.isArray(adTicketsData) ? adTicketsData : [];
    return {
      ALL: list.length,
      OPEN: list.filter(t => t.status === 'OPEN').length,
      CLOSED: list.filter(t => t.status !== 'OPEN').length
    };
  }, [adTicketsData]);

  const filteredAdTickets = useMemo(() => {
    let list = Array.isArray(adTicketsData) ? adTicketsData : [];
    if (adViewMode === 'OPEN') {
      list = list.filter(t => t.status === 'OPEN');
    } else if (adViewMode === 'CLOSED') {
      list = list.filter(t => t.status !== 'OPEN');
    }
    if (adSearch.trim()) {
      const q = adSearch.trim().toLowerCase();
      list = list.filter(t => {
        const u = t.user || {};
        return (
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.displayName && u.displayName.toLowerCase().includes(q)) ||
          (t.userId && String(t.userId).includes(q)) ||
          (t.channelId && String(t.channelId).includes(q))
        );
      });
    }
    return list;
  }, [adTicketsData, adViewMode, adSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredAdTickets.length / pageSize));

  const paginatedAdTickets = useMemo(() => {
    const start = (adPage - 1) * pageSize;
    return filteredAdTickets.slice(start, start + pageSize);
  }, [filteredAdTickets, adPage, pageSize]);

  const handleClearAdTicketsConfirm = () => {
    showConfirm({
      title: t('clan_ad_tickets_clear', 'Очистить тикеты'),
      message: t('clan_ad_tickets_clear_confirm', 'Вы действительно хотите удалить все тикеты заявок на рекламу из журнала?'),
      confirmText: t('clan_delete', 'Удалить'),
      type: 'danger',
      onConfirm: () => {
        if (typeof sendClanProxy === 'function') {
          sendClanProxy('clear_ad_tickets', { action: 'clear_ad_tickets' });
        }
      }
    });
  };

  const handleCloseTicketWithConfirm = useCallback((ticket) => {
    showConfirm({
      title: t('clan_ad_ticket_close_title', 'Закрытие тикета'),
      message: t('clan_ad_tickets_close_confirm', 'Вы уверены, что хотите закрыть этот тикет рекламы?'),
      confirmText: t('clan_close', 'Закрыть'),
      type: 'warning',
      onConfirm: () => {
        if (typeof handleCloseAdTicket === 'function') {
          handleCloseAdTicket(ticket.id, ticket.channelId);
        }
      }
    });
  }, [handleCloseAdTicket, t]);

  return (
    <div className="w-full space-y-5 animate-main-fade-in">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('clan_ad_tickets_desc', 'Журнал и история поступивших запросов на покупку рекламы и сотрудничество.')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchAdTickets}
            disabled={loadingAdTickets}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAdTickets ? 'animate-spin text-blue-500' : ''}`} />
            <span>{t('clan_recruitment_apps_refresh') || 'Обновить'}</span>
          </button>
          <button
            type="button"
            onClick={handleClearAdTicketsConfirm}
            disabled={loadingAdTickets || adTicketsCounts.ALL === 0}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title={t('clan_ad_tickets_clear', 'Очистить тикеты')}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('clan_ad_tickets_clear', 'Очистить')}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => { setAdViewMode('ALL'); setAdPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              adViewMode === 'ALL'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('clan_ad_tickets_filter_all', 'Все тикеты')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${adViewMode === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {adTicketsCounts.ALL}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setAdViewMode('OPEN'); setAdPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              adViewMode === 'OPEN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🟢 {t('clan_ad_tickets_filter_open', 'Открытые')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${adViewMode === 'OPEN' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {adTicketsCounts.OPEN}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setAdViewMode('CLOSED'); setAdPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              adViewMode === 'CLOSED'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🔒 {t('clan_ad_tickets_filter_closed', 'Закрытые')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${adViewMode === 'CLOSED' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {adTicketsCounts.CLOSED}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={adSearch}
            onChange={(e) => { setAdSearch(e.target.value); setAdPage(1); }}
            placeholder={t('clan_ad_ticket_search_placeholder', 'Поиск по нику, ID, каналу...')}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {adSearch && (
            <button
              type="button"
              onClick={() => { setAdSearch(''); setAdPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loadingAdTickets ? (
          <div className="p-6">
            <ApplicationsTableSkeleton />
          </div>
        ) : filteredAdTickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Megaphone className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              {adSearch ? t('clan_search_no_results', 'Ничего не найдено') : t('clan_ad_tickets_empty', 'Заявок на рекламу пока нет')}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {adSearch
                ? t('clan_search_change_filter', 'Попробуйте изменить поисковый запрос.')
                : t('clan_ad_tickets_empty_desc', 'Когда пользователи нажмут кнопки на панели рекламы, их тикеты и запросы появятся здесь.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">{t('clan_recruitment_app_col_candidate') || 'Пользователь'}</th>
                  <th className="px-3 py-3">{t('clan_ad_ticket_col_type', 'Тематика')}</th>
                  <th className="px-3 py-3">{t('clan_ad_ticket_col_channel', 'Канал тикета')}</th>
                  <th className="px-3 py-3">{t('clan_recruitment_app_col_status') || 'Статус'}</th>
                  <th className="px-3 py-3 text-center">{t('clan_recruitment_app_col_transcript') || 'Транскрипт'}</th>
                  <th className="px-4 py-3">{t('clan_recruitment_app_col_date') || 'Дата'}</th>
                  <th className="px-4 py-3 text-right">{t('clan_col_actions', 'Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedAdTickets.map((ticket) => (
                  <AdTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    t={t}
                    guildId={effectiveGuildId}
                    openExternalUrl={openExternalUrl}
                    handleViewTranscript={handleViewTranscript}
                    onCloseTicket={handleCloseTicketWithConfirm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredAdTickets.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <span>
              {t('clan_pagination_showing', 'Показано {{from}}–{{to}} из {{total}}', {
                from: (adPage - 1) * pageSize + 1,
                to: Math.min(adPage * pageSize, filteredAdTickets.length),
                total: filteredAdTickets.length
              })}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={adPage === 1}
                onClick={() => setAdPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-2 font-semibold text-slate-700 dark:text-slate-300">
                {adPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={adPage >= totalPages}
                onClick={() => setAdPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {transcriptModalData?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <ScrollText className="w-4 h-4 text-blue-500 shrink-0" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                  {t('clan_recruitment_app_transcript_title') || 'Транскрипт тикета'}
                  {transcriptModalData.username && ` — ${transcriptModalData.username}`}
                </h3>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {transcriptModalData.content && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {t('copy', 'Копировать')}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenTranscriptInBrowser}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{t('clan_recruitment_app_transcript_open_browser') || 'В браузере'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCloseTranscript}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 min-h-[300px]">
              {transcriptModalData.loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <p className="text-xs text-slate-400">
                    {t('clan_recruitment_app_transcript_loading') || 'Загрузка транскрипта тикета...'}
                  </p>
                </div>
              ) : transcriptModalData.content ? (
                <div
                  className="prose prose-xs dark:prose-invert max-w-none font-mono text-xs leading-relaxed whitespace-pre-wrap select-text"
                  dangerouslySetInnerHTML={{ __html: transcriptModalData.content }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 opacity-60" />
                  <p className="text-xs text-slate-400">
                    {t('clan_recruitment_app_transcript_not_found') || 'Транскрипт тикета не найден или еще формируется.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
