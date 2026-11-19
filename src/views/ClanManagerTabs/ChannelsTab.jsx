import React, { useContext, useState, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import { Hash, RefreshCw } from 'lucide-react';

const ChannelRow = React.memo(function ChannelRow({
  c,
  selectedId,
  discordChannels,
  discordLoaded,
  t,
  onChange
}) {
  const filteredChannels = useMemo(() => {
    return discordChannels.filter(ch =>
      c.typeFilter === null ||
      ch.type === c.typeFilter ||
      (Array.isArray(c.typeFilter) && c.typeFilter.includes(ch.type))
    );
  }, [discordChannels, c.typeFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{c.label}</span>
          {c.badge && (
            <span className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
              {c.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {c.desc}
        </p>
      </div>
      <div className="w-full md:w-80 shrink-0">
        {!discordLoaded ? (
          <div className="w-full h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse border border-slate-200 dark:border-slate-700" />
        ) : (
          <select
            value={selectedId || ''}
            onChange={e => onChange(c.key, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
          >
            <option value="">{t('clan_auto_20', '-- Не выбрано --')}</option>
            {filteredChannels.map(ch => {
              const prefix = ch.type === 4 ? '📁 ' : ch.type === 2 ? '🔊 ' : '#️⃣ ';
              return <option key={ch.id} value={ch.id}>{prefix}{ch.name}</option>;
            })}
          </select>
        )}
      </div>
    </div>
  );
});

export default function ChannelsTab() {
  const {
    t,
    config,
    queueAutoSave,
    saveConfig,
    discordInfo,
    fetchDiscordInfo,
    fetchDynamicVoice,
    sendProxyAction
  } = useContext(ClanManagerContext);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshChannels = useCallback(() => {
    setIsRefreshing(true);
    if (typeof fetchDiscordInfo === 'function') fetchDiscordInfo();
    if (typeof fetchDynamicVoice === 'function') fetchDynamicVoice();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [fetchDiscordInfo, fetchDynamicVoice]);

  const cConfig = useMemo(() => {
    try {
      if (config?.channelsConfigJson) {
        return typeof config.channelsConfigJson === 'string'
          ? JSON.parse(config.channelsConfigJson)
          : config.channelsConfigJson;
      }
    } catch {}
    return {};
  }, [config?.channelsConfigJson]);

  const updateCConfig = useCallback((key, val) => {
    const newConfig = { ...cConfig, [key]: val };
    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
    queueAutoSave(updated, true);

    if (key === 'roster' && typeof sendProxyAction === 'function') {
      if (val) {
        sendProxyAction('publish_or_move_roster', { targetChannelId: val }).catch(() => {});
      } else {
        sendProxyAction('delete_roster').catch(() => {});
      }
    }
  }, [cConfig, config, queueAutoSave, sendProxyAction]);

  const channelsList = useMemo(() => [
    { key: 'ticketsCategory', label: t('clan_auto_v2_1012', 'Категория для тикетов'), desc: t('clan_auto_222', 'Здесь бот будет создавать приватные каналы тикетов заявок.'), typeFilter: 4, badge: 'Категория' },
    { key: 'applications', label: t('clan_auto_v2_1013', 'Одобренные заявки'), desc: t('clan_auto_223', 'Сюда будут пересылаться одобренные заявки из тикетов.'), typeFilter: [0, 2] },
    { key: 'autoRejectedApplications', label: t('clan_channel_auto_rejected_app') || 'Отклоненные ботом заявки', desc: t('clan_channel_auto_rejected_app_desc') || 'Канал для автоматических отказов кандидатам (нехватка часов, возраст, блокировки VAC/Game).', typeFilter: [0, 2] },
    { key: 'rejectedApplications', label: t('clan_channel_rejected_app') || 'Отклоненные админами заявки', desc: t('clan_channel_rejected_app_desc') || 'Канал для заявок, отклоненных вручную модераторами/рекрутерами с указанием причины.', typeFilter: [0, 2] },
    { key: 'leaderboard', label: t('clan_auto_v2_1014', 'Leaderboard (Статистика)'), desc: t('clan_auto_224', 'Канал, где публикуется статистика по вайпам и топам.'), typeFilter: [0, 2] },
    { key: 'news', label: t('clan_auto_v2_1015', 'Новости клана'), desc: t('clan_auto_225', 'Канал для публикации объявлений и новостей бота.'), typeFilter: [0, 2] },
    { key: 'votes', label: t('clan_tab_votes', 'Голосования'), desc: t('clan_auto_226', 'Канал для создания голосований. Может быть тем же, что и новости.'), typeFilter: [0, 2] },
    { key: 'ads', label: t('clan_auto_v2_1016', 'Реклама и альянсы'), desc: t('clan_auto_227', 'Сюда бот отправляет информацию об оплаченной рекламе.'), typeFilter: [0, 2] },
    { key: 'roster', label: t('clan_channel_dynamic_roster', 'Динамический состав клана'), desc: t('clan_channel_dynamic_roster_desc', 'Канал, в котором бот автоматически публикует и обновляет карточки активных бойцов клана.'), typeFilter: [0, 2] }
  ], [t]);

  const discordChannels = useMemo(() => {
    return discordInfo?.channels || [];
  }, [discordInfo?.channels]);

  const isDiscordLoaded = Boolean(discordInfo);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6 w-full max-w-5xl 2xl:max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-500" />
            {t('clan_auto_18', 'Настройки каналов')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('clan_auto_19', 'Привяжите каналы Discord сервера для автоматической работы функций бота')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshChannels}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            title={t('clan_refresh_channels_tooltip') || 'Обновить список каналов, категорий и голосовых комнат из Discord'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (t('clan_auto_v2_1027', 'Обновление...')) : (t('common_refresh', 'Обновить'))}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {channelsList.map(c => (
          <ChannelRow
            key={c.key}
            c={c}
            selectedId={cConfig[c.key]}
            discordChannels={discordChannels}
            discordLoaded={isDiscordLoaded}
            t={t}
            onChange={updateCConfig}
          />
        ))}
      </div>
    </form>
  );
}
