import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, ScrollText, Download, ExternalLink, RefreshCw, AlertCircle, 
  Copy, Check, Clock, CheckCircle2, XCircle, Bot
} from 'lucide-react';

export default function TicketTranscriptModal({
  isOpen,
  onClose,
  loading = false,
  html = null,
  app = null,
  error = null,
  onRefresh = null
}) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!app?.userId) return;
    navigator.clipboard.writeText(app.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownload = () => {
    if (!html) return;
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (app?.username || 'ticket').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `transcript-${safeName}-${app?.id || 'discord'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download transcript error:', e);
    }
  };

  const handleOpenNewWindow = () => {
    if (!html) return;
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error('Open transcript window error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 min-w-0">
            {app?.avatar ? (
              <img 
                src={app.avatar} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200 dark:border-orange-800/60">
                <ScrollText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {app?.username || t('clan_recruitment_app_transcript_title') || 'Транскрипт тикета'}
                </h3>
                {app?.status === 'ACCEPTED' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />{t('status_accepted', 'Принята')}</span>
                )}
                {app?.status === 'REJECTED' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                    <XCircle className="w-3 h-3 mr-1" />{t('status_rejected', 'Отклонена')}</span>
                )}
                {app?.status === 'AUTO_REJECTED' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                    <Bot className="w-3 h-3 mr-1" />{t('status_auto_reject', 'Авто-отказ')}</span>
                )}
                {app?.status === 'PENDING' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    <Clock className="w-3 h-3 mr-1" />{t('status_pending', 'Ожидает')}</span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {app?.userId && (
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center space-x-1 font-mono hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={t('copy_discord_id', 'Скопировать Discord ID')}
                  >
                    <span>ID: {app.userId}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>
                )}
                {app?.appliedAt && (
                  <span>• {new Date(app.appliedAt).toLocaleString()}</span>
                )}
                {app?.hours !== undefined && (
                  <span>• {app.hours} {t('time_hours_short', 'ч.')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            {html && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                  title={t('transcript_download', 'Скачать архив транскрипта .html')}
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">HTML</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewWindow}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                  title={t('clan_recruitment_app_transcript_open_browser') || 'Открыть в новом окне'}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{t('clan_recruitment_app_transcript_open_browser') || 'В окне'}</span>
                </button>
              </>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                title={t('transcript_refresh', 'Обновить транскрипт')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('transcript_close', 'Закрыть (Esc)')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 relative bg-[#313338] overflow-hidden flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center bg-[#313338]">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                {t('clan_recruitment_app_transcript_loading') || 'Загрузка транскрипта тикета...'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm">{t('transcript_fetching', 'Бот извлекает архив сообщений, вложений и действий модераторов из Discord.')}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center bg-[#313338] max-w-md">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">{t('transcript_error', 'Не удалось отобразить транскрипт')}</h4>
              <p className="text-xs text-slate-400">{error}</p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors mt-2"
                >
                  {t('common_retry', 'Попробовать снова')}
                </button>
              )}
            </div>
          ) : html ? (
            <iframe
              srcDoc={html}
              title="Discord Ticket Transcript"
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 bg-[#313338]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center bg-[#313338]">
              <ScrollText className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-400">
                {t('clan_recruitment_app_transcript_not_found') || 'Транскрипт тикета не найден или еще формируется.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
