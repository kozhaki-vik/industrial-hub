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

  // Border & badge accent styles
  const accentBorder = accentColor === 'orange'
    ? 'border-orange-200/90 dark:border-orange-900/60'
    : accentColor === 'purple'
    ? 'border-purple-200/90 dark:border-purple-900/60'
    : 'border-blue-200/90 dark:border-blue-900/60';

  const accentBg = accentColor === 'orange'
    ? 'from-orange-50/70 via-white to-orange-50/40 dark:from-orange-950/20 dark:via-slate-900/70 dark:to-orange-950/10'
    : accentColor === 'purple'
    ? 'from-purple-50/70 via-white to-purple-50/40 dark:from-purple-950/20 dark:via-slate-900/70 dark:to-purple-950/10'
    : 'from-blue-50/70 via-white to-blue-50/40 dark:from-blue-950/20 dark:via-slate-900/70 dark:to-blue-950/10';

  const iconBg = accentColor === 'orange'
    ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
    : accentColor === 'purple'
    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';

  return (
    <div className={`p-4 rounded-2xl border bg-gradient-to-r ${accentBg} ${accentBorder} shadow-xs transition-all mb-4`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon & Title & Active Channel */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {title}
              </span>

              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('clan_panel_status_live', 'Активно')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                  {t('clan_panel_status_draft', 'Неактивно')}
                </span>
              )}

              {isLive && activeChannel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-100/90 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70">
                  <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {activeChannel.name}
                </span>
              )}
              {isLive && !activeChannel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{channelId}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isEditing
                ? (channelId
                  ? t('clan_panel_edit_desc', `Выберите другой канал. Бот перенесет сообщение/карточки в новый канал, а старое сообщение в #${activeChannel?.name || 'текущем канале'} удалит.`)
                  : (promptText || t('clan_panel_prompt_default', 'Выберите канал Discord для публикации.')))
                : (isLive
                  ? (activeDesc || t('clan_panel_channel_active_default', 'Бот отслеживает и автоматически обновляет этот канал в реальном времени.'))
                  : (promptText || t('clan_panel_prompt_default', 'Сообщение еще не опубликовано в Discord сервере.')))}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons when NOT editing */}
        {!isEditing && isLive && (
          <div className="flex items-center gap-2 shrink-0 sm:self-center">
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={loadingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title={t('clan_panel_btn_change_channel_tip', 'Выбрать другой канал и перенести сообщение/состав')}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('clan_panel_btn_change_channel', 'Изменить канал')}</span>
            </button>

            {onSync && (
              <button
                type="button"
                onClick={handleSync}
                disabled={loadingAction !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title={t('clan_panel_btn_update_tip', 'Принудительно обновить сообщение/карточки в Discord')}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${loadingAction === 'sync' ? 'animate-spin' : ''}`} />
                <span>{loadingAction === 'sync' ? t('clan_auto_v2_1027', 'Обновление...') : t('clan_panel_btn_update', 'Обновить в Discord')}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loadingAction !== null}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title={t('clan_panel_btn_delete_tip', 'Удалить из Discord')}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline">{t('clan_panel_btn_delete', 'Удалить')}</span>
              </button>
            )}
          </div>
        )}

        {/* Action Button when NOT editing and NOT live yet */}
        {!isEditing && !isLive && (
          <div className="shrink-0 sm:self-center">
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('clan_panel_btn_publish', 'Выбрать канал и опубликовать')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editing / Channel Selector Form */}
      {isEditing && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {channelId ? t('clan_panel_select_new_channel', 'Выберите новый канал для переноса:') : t('clan_panel_select_channel', 'Выберите канал Discord:')}
            </label>
            <select
              value={selectedChannelId}
              onChange={e => setSelectedChannelId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            >
              <option value="">{t('clan_auto_20', '-- Выберите текстовый канал --')}</option>
              {textChannels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  #️⃣ {ch.name} {ch.id === channelId ? `(${t('clan_panel_current', 'текущий')})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:self-end">
            <button
              type="button"
              onClick={handleConfirmPublishOrMove}
              disabled={!selectedChannelId || loadingAction !== null}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
            >
              {loadingAction === 'publish' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{channelId ? t('clan_panel_btn_moving', 'Перенос...') : t('clan_panel_btn_publishing', 'Публикация...')}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{channelId ? t('clan_panel_btn_move', 'Перенести и удалить старое') : t('clan_panel_btn_publish', 'Опубликовать')}</span>
                </>
              )}
            </button>

            {channelId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loadingAction !== null}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('clan_panel_btn_cancel', 'Отмена')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
}
