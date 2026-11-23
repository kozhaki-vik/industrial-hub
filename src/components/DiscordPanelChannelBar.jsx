import React, { useState, useMemo } from 'react';
import {
  Hash, RefreshCw, Trash2, ArrowRightLeft, Check,
  AlertCircle, Send, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showConfirm } from './ConfirmModal';

export default function DiscordPanelChannelBar({
  title,
  channelId,
  discordChannels = [],
  onPublishOrMove,
  onSync,
  onDelete,
  activeDesc,
  promptText,
  deleteConfirmDesc,
  icon: Icon = Hash,
  accentColor = 'blue'
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'publish' | 'sync' | 'delete' | null
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  // Only show text channels (type 0)
  const textChannels = useMemo(() => {
    return (discordChannels || []).filter(c => c.type === 0);
  }, [discordChannels]);

  const activeChannel = useMemo(() => {
    if (!channelId) return null;
    return textChannels.find(c => c.id === channelId) || (discordChannels || []).find(c => c.id === channelId);
  }, [channelId, textChannels, discordChannels]);

  const handleStartEdit = () => {
    setSelectedChannelId(channelId || (textChannels[0]?.id || ''));
    setIsEditing(true);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedChannelId('');
    setFeedback(null);
  };

  const handleConfirmPublishOrMove = async () => {
    if (!selectedChannelId) return;
    setLoadingAction('publish');
    setFeedback(null);
    try {
      const res = await onPublishOrMove(selectedChannelId);
      if (res?.success !== false) {
        setIsEditing(false);
        setFeedback({
          type: 'success',
          text: channelId
            ? t('clan_panel_msg_moved', 'Успешно перенесено в новый канал!')
            : t('clan_panel_msg_published', 'Успешно опубликовано в канале!')
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', text: res?.error || t('clan_error', 'Ошибка публикации') });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || t('clan_error', 'Ошибка публикации') });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSync = async () => {
    if (!onSync || loadingAction) return;
    setLoadingAction('sync');
    setFeedback(null);
    try {
      await onSync();
      setFeedback({ type: 'success', text: t('clan_panel_msg_synced', 'Синхронизировано в Discord!') });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || t('clan_error', 'Ошибка синхронизации') });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || loadingAction) return;
    const confirmed = await showConfirm({
      title: t('clan_panel_delete_confirm_title', 'Удаление из Discord'),
      message: deleteConfirmDesc || t('clan_panel_delete_confirm_desc', 'Вы уверены, что хотите удалить сообщение из Discord канала?'),
      confirmText: t('clan_panel_btn_delete', 'Удалить из Discord'),
      cancelText: t('clan_panel_btn_cancel', 'Отмена'),
      danger: true
    });
    if (!confirmed) return;

    setLoadingAction('delete');
    setFeedback(null);
    try {
      await onDelete();
      setIsEditing(false);
      setFeedback({ type: 'success', text: t('clan_panel_msg_deleted', 'Успешно удалено из Discord') });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || t('clan_error', 'Ошибка удаления') });
    } finally {
      setLoadingAction(null);
    }
  };

  const isLive = Boolean(channelId);

  return (
    <div className="p-3 sm:px-4 sm:py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 transition-all mb-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Icon & Title & Active Channel */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {title}
            </span>

            {isLive ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeChannel ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
                    <Hash className="w-3 h-3 text-blue-500" />
                    {activeChannel.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono text-slate-500 bg-white dark:bg-slate-800 shadow-2xs">
                    #{channelId}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{t('clan_panel_status_draft', 'Не настроено')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions when NOT editing */}
        {!isEditing && isLive && (
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {onSync && (
              <button
                type="button"
                onClick={handleSync}
                disabled={loadingAction !== null}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                title={t('clan_panel_btn_update_tip', 'Принудительно обновить карточки в Discord')}
              >
                <RefreshCw className={`w-3 h-3 text-blue-500 ${loadingAction === 'sync' ? 'animate-spin' : ''}`} />
                <span>{loadingAction === 'sync' ? t('clan_auto_v2_1027', 'Обновление...') : t('clan_panel_btn_update', 'Обновить')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStartEdit}
              disabled={loadingAction !== null}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              title={t('clan_panel_btn_change_channel_tip', 'Выбрать другой канал')}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('clan_panel_btn_change_channel', 'Сменить')}</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loadingAction !== null}
                className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title={t('clan_panel_btn_delete_tip', 'Удалить из Discord')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Action Button when NOT editing and NOT live yet */}
        {!isEditing && !isLive && (
          <div className="shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{t('clan_panel_btn_publish', 'Выбрать канал')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editing / Channel Selector Form */}
      {isEditing && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex-1 max-w-md">
            <select
              value={selectedChannelId}
              onChange={e => setSelectedChannelId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="">{t('clan_auto_20', '-- Выберите канал --')}</option>
              {textChannels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  #{ch.name} {ch.id === channelId ? `(${t('clan_panel_current', 'текущий')})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleConfirmPublishOrMove}
              disabled={!selectedChannelId || loadingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              {loadingAction === 'publish' ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{channelId ? t('clan_panel_btn_moving', 'Перенос...') : t('clan_panel_btn_publishing', 'Публикация...')}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{channelId ? t('clan_panel_btn_move', 'Перенести') : t('clan_panel_btn_publish', 'Опубликовать')}</span>
                </>
              )}
            </button>

            {channelId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loadingAction !== null}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>{t('clan_panel_btn_cancel', 'Отмена')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
        }`}>
          {feedback.type === 'success' ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
}
