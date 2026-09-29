import React, { useContext, useMemo, useCallback } from 'react';
import { ClanManagerContext } from '../ClanManagerContext';
import {
  ScrollText, Plus, CheckCheck, Ban, RotateCcw, Zap
} from 'lucide-react';
import { ToggleSwitch } from '../ClanManager';

// Memoized single event row to avoid re-rendering all ~25 events and hundreds of option elements
const LogEventRow = React.memo(function LogEventRow({
  evKey,
  title,
  desc,
  isEnabled,
  channelId,
  defaultChName,
  textChannels,
  t,
  onToggle,
  onChannelChange
}) {
  const handleToggle = useCallback((val) => {
    onToggle(evKey, val);
  }, [evKey, onToggle]);

  const handleChange = useCallback((e) => {
    onChannelChange(evKey, e.target.value);
  }, [evKey, onChannelChange]);

  return (
    <div
      className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
        isEnabled ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-950/20 opacity-60'
      }`}
    >
      {/* Toggle + Title */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="pt-0.5 shrink-0">
          <ToggleSwitch
            checked={isEnabled}
            onChange={handleToggle}
            activeColor="blue"
            size="sm"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="md:w-64 shrink-0 pl-7 md:pl-0">
        <select
          value={channelId}
          onChange={handleChange}
          disabled={!isEnabled}
          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <option value="">
            {defaultChName ? `(${t('clan_by_default_prefix', 'По умолч.:')} #${defaultChName})` : `(${t('clan_by_default', 'По умолчанию')})`}
          </option>
          {textChannels.map(ch => (
            <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default function LogsTab() {
  const {
    t,
    config,
    autoSaveConfig,
    saveConfig,
    discordInfo,
    creatingLogChannel,
    handleCreateDiscordLogChannel,
    loggingEventGroups
  } = useContext(ClanManagerContext);

  const logCfg = useMemo(() => {
    try {
      if (config?.loggingConfigJson) {
        const parsed = typeof config.loggingConfigJson === 'string'
          ? JSON.parse(config.loggingConfigJson)
          : config.loggingConfigJson;
        if (!parsed.events) parsed.events = {};
        return parsed;
      }
    } catch {
      // ignore parse error, return fallback
    }
    return { enabled: false, defaultChannelId: '', events: {} };
  }, [config?.loggingConfigJson]);

  const isMasterEnabled = Boolean(logCfg.enabled);
  const defaultChId = logCfg.defaultChannelId || '';

  const textChannels = useMemo(() => {
    return (discordInfo?.channels || []).filter(c => c.type === 0);
  }, [discordInfo?.channels]);

  const defaultChName = useMemo(() => {
    const found = textChannels.find(c => c.id === defaultChId);
    return found ? found.name : '';
  }, [textChannels, defaultChId]);

  const handleMasterToggle = useCallback((val) => {
    const updated = { ...logCfg, enabled: val };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, autoSaveConfig, config]);

  const handleDefaultChannelChange = useCallback((val) => {
    const updated = { ...logCfg, defaultChannelId: val };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, autoSaveConfig, config]);

  const handleToggleEvent = useCallback((key, val) => {
    const events = { ...(logCfg.events || {}) };
    const cur = events[key] || { enabled: true, channelId: '' };
    events[key] = { ...cur, enabled: val };
    const updated = { ...logCfg, events };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, autoSaveConfig, config]);

  const handleEventChannelChange = useCallback((key, chId) => {
    const events = { ...(logCfg.events || {}) };
    const cur = events[key] || { enabled: true, channelId: '' };
    events[key] = { ...cur, channelId: chId };
    const updated = { ...logCfg, events };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, autoSaveConfig, config]);

  const handleEnableAll = useCallback(() => {
    const events = { ...(logCfg.events || {}) };
    (loggingEventGroups || []).forEach(g => {
      g.events.forEach(ev => {
        const cur = events[ev.key] || { channelId: '' };
        events[ev.key] = { ...cur, enabled: true };
      });
    });
    const updated = { ...logCfg, events, enabled: true };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, loggingEventGroups, autoSaveConfig, config]);

  const handleDisableAll = useCallback(() => {
    const events = { ...(logCfg.events || {}) };
    (loggingEventGroups || []).forEach(g => {
      g.events.forEach(ev => {
        const cur = events[ev.key] || { channelId: '' };
        events[ev.key] = { ...cur, enabled: false };
      });
    });
    const updated = { ...logCfg, events };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, loggingEventGroups, autoSaveConfig, config]);

  const handleResetChannelsToDefault = useCallback(() => {
    const events = { ...(logCfg.events || {}) };
    Object.keys(events).forEach(k => {
      events[k] = { ...events[k], channelId: '' };
    });
    const updated = { ...logCfg, events };
    autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
  }, [logCfg, autoSaveConfig, config]);

  return (
    <form onSubmit={saveConfig} noValidate className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-blue-500" />
          <span>{t('clan_logs_title')}</span>
        </h3>

        {/* Master Switch */}
        <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <ToggleSwitch
            checked={isMasterEnabled}
            onChange={handleMasterToggle}
            activeColor="blue"
          />
        </div>
      </div>

      <div className={`space-y-6 transition-opacity duration-200 ${!isMasterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Default Channel Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-800/60 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('clan_logs_default_channel')}:
            </span>
            {defaultChId ? (
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                #{defaultChName || defaultChId}
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                {t('clan_logs_channel_not_set') || 'Не задан'}
              </span>
            )}
          </div>

          <div className="flex flex-1 items-center gap-2 max-w-lg md:ml-auto">
            <select
              value={defaultChId}
              onChange={e => handleDefaultChannelChange(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs transition-all cursor-pointer"
            >
              <option value="">{t('clan_logs_select_channel_ph') || '-- Выберите канал --'}</option>
              {textChannels.map(ch => (
                <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCreateDiscordLogChannel}
              disabled={creatingLogChannel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {creatingLogChannel ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('clan_logs_creating_channel')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('clan_logs_create_channel_btn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-amber-50/20 to-slate-50 dark:from-slate-800/60 dark:via-slate-800/30 dark:to-slate-800/60 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500/30 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
              {t('clan_logs_quick_actions') || 'Быстрые действия:'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/70 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('clan_logs_enable_all')}</span>
            </button>
            <button
              type="button"
              onClick={handleDisableAll}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700/70 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Ban className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('clan_logs_disable_all')}</span>
            </button>
            <button
              type="button"
              onClick={handleResetChannelsToDefault}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700/70 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('clan_logs_reset_channels')}</span>
            </button>
          </div>
        </div>

        {/* Event Groups */}
        <div className="space-y-4">
          {(loggingEventGroups || []).map(group => {
            const GroupIcon = group.icon;
            const enabledCount = group.events.filter(ev => logCfg.events?.[ev.key]?.enabled !== false).length;
            return (
              <div key={group.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                {/* Group Header */}
                <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
                      <GroupIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t(`clan_logs_group_${group.id}`) || group.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {enabledCount} / {group.events.length}
                  </span>
                </div>

                {/* Events List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {group.events.map(ev => {
                    const evSettings = logCfg.events?.[ev.key] || { enabled: true, channelId: '' };
                    const isEvEnabled = evSettings.enabled !== false;
                    const evChannelId = evSettings.channelId || '';

                    return (
                      <LogEventRow
                        key={ev.key}
                        evKey={ev.key}
                        title={t(`clan_logs_event_${ev.key}`) || ev.title}
                        desc={t(`clan_logs_event_${ev.key}_desc`) || ev.desc}
                        isEnabled={isEvEnabled}
                        channelId={evChannelId}
                        defaultChName={defaultChName}
                        textChannels={textChannels}
                        t={t}
                        onToggle={handleToggleEvent}
                        onChannelChange={handleEventChannelChange}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
