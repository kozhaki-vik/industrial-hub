import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { useTranslation } from 'react-i18next';
import SetupWizard from '../components/SetupWizard';
import RoleSelect from '../components/RoleSelect';
import ChannelSelect from '../components/ChannelSelect';
import { 
  Sparkles, Unlink, Volume2, Mic, MicOff, VolumeX, Trash2, UserX, RefreshCw, Sliders, Radio,
  Settings, Users, Hash, ShieldCheck, UserPlus, Vote, Megaphone, UserCheck, BarChart3, Plus, Globe, Check,
  RotateCcw, AlertTriangle, ScrollText, ShieldAlert
} from 'lucide-react';
import { validateForm, scrollToAndHighlight } from '../utils/formValidation';

export const isBotConfigured = (cfg) => {
  if (!cfg) return false;

  const roleKeys = [
    'leaderRoleId',
    'deputyLeaderRoleId',
    'callerRoleId',
    'mainRosterRoleId',
    'trialRoleId',
    'farmerRoleId',
    'electricianRoleId',
    'builderRoleId',
    'pilotRoleId',
    'vipRoleId'
  ];
  const hasRoles = roleKeys.some(k => typeof cfg[k] === 'string' && cfg[k].trim().length > 0);

  let hasChannels = false;
  if (cfg.channelsConfigJson) {
    try {
      const ch = typeof cfg.channelsConfigJson === 'string' ? JSON.parse(cfg.channelsConfigJson) : cfg.channelsConfigJson;
      if (ch && typeof ch === 'object') {
        const channelKeys = ['ticketsCategory', 'logs', 'applications', 'leaderboard', 'news', 'votes', 'ads', 'roster', 'waitingRoom'];
        hasChannels = channelKeys.some(k => typeof ch[k] === 'string' && ch[k].trim().length > 0);
      }
    } catch (e) {}
  }
  if (!hasChannels && cfg.loggingConfigJson) {
    try {
      const lCfg = typeof cfg.loggingConfigJson === 'string' ? JSON.parse(cfg.loggingConfigJson) : cfg.loggingConfigJson;
      if (lCfg?.defaultChannelId) hasChannels = true;
    } catch (e) {}
  }

  return hasRoles || hasChannels;
};

const sanitizeClanConfig = (cfg) => {
  if (!cfg) return cfg;
  return {
    ...cfg,
    name: cfg.name ?? '',
    discordLink: cfg.discordLink ?? ''
  };
};

function SaveButton({ saveStatus, onManualSave }) {
  const isError = saveStatus && saveStatus.startsWith('error');
  const isLoading = saveStatus === 'saving' || saveStatus === 'loading';
  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs">
        {isLoading ? (
          <span className="text-blue-500 font-medium flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Синхронизация с сервером...
          </span>
        ) : isError ? (
          <span className="text-red-500 font-medium flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full border border-red-200/60 dark:border-red-800/60">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{saveStatus.replace('error:', 'Ошибка:')}</span>
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Все изменения сохраняются автоматически
          </span>
        )}
      </div>

      <button 
        type="button" 
        onClick={onManualSave}
        disabled={isLoading}
        className={`flex items-center justify-center font-medium py-2 px-4 rounded-xl text-xs transition-all shadow-sm focus:ring-2 cursor-pointer shrink-0 ${
          saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/20' :
          isError ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20' :
          'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <><div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin mr-1.5"></div> Обработка...</>
        ) : saveStatus === 'success' ? (
          <><Check className="w-3.5 h-3.5 mr-1 text-white" /> Сохранено</>
        ) : (
          "Сохранить сейчас"
        )}
      </button>
    </div>
  );
}

const loggingEventGroups = [
  {
    id: 'members',
    title: 'Участники сервера',
    icon: Users,
    events: [
      { key: 'member_join', title: 'Вход участника', desc: 'Оповещение о входе нового участника на сервер' },
      { key: 'member_leave', title: 'Выход участника', desc: 'Участник покинул сервер по собственному желанию' },
      { key: 'member_kick', title: 'Кик участника', desc: 'Участник был кикнут модератором (с указанием автора и причины)' },
      { key: 'member_ban', title: 'Бан участника', desc: 'Блокировка участника на сервере' },
      { key: 'member_unban', title: 'Разбан участника', desc: 'Снятие бана с участника' },
      { key: 'nickname_change', title: 'Смена никнейма', desc: 'Изменение локального никнейма участника на сервере' },
    ]
  },
  {
    id: 'messages',
    title: 'Сообщения',
    icon: Hash,
    events: [
      { key: 'message_delete', title: 'Удаление сообщения', desc: 'Логирование удаленного текста, автора и канала' },
      { key: 'message_edit', title: 'Редактирование сообщения', desc: 'Логирование старого и нового текста сообщения' },
    ]
  },
  {
    id: 'roles',
    title: 'Роли',
    icon: ShieldCheck,
    events: [
      { key: 'member_role_update', title: 'Выдача и снятие ролей', desc: 'Логирование изменений ролей у участников' },
      { key: 'role_create', title: 'Создание роли', desc: 'Создание новой роли на сервере' },
      { key: 'role_update', title: 'Изменение роли', desc: 'Изменение названия, цвета или разрешений роли' },
      { key: 'role_delete', title: 'Удаление роли', desc: 'Удаление роли с сервера' },
    ]
  },
  {
    id: 'channels',
    title: 'Каналы',
    icon: Sliders,
    events: [
      { key: 'channel_create', title: 'Создание канала', desc: 'Создание текстового/голосового канала или категории' },
      { key: 'channel_update', title: 'Изменение канала', desc: 'Изменение названия, темы или прав доступа канала' },
      { key: 'channel_delete', title: 'Удаление канала', desc: 'Удаление канала или категории' },
    ]
  },
  {
    id: 'voice',
    title: 'Голосовые каналы',
    icon: Volume2,
    events: [
      { key: 'voice_join', title: 'Вход в голосовой канал', desc: 'Участник подключился к голосовому каналу' },
      { key: 'voice_leave', title: 'Выход из голосового канала', desc: 'Участник отключился от голосового канала' },
      { key: 'voice_move', title: 'Перемещение между войсами', desc: 'Переход участника из одного голосового канала в другой' },
      { key: 'voice_mute_deaf', title: 'Серверный мут / глушение', desc: 'Включение/отключение серверного мута микрофона или наушников' },
    ]
  }
];

export default function ClanManager() {
  const { t } = useTranslation();
  const { ws, status: wsStatus } = useNetwork();
  const [status, setStatus] = useState('checking');
  const [guildId, setGuildId] = useState(null);
  const [linkCode, setLinkCode] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['Initializing Clan Manager...']);
  const [lastLinkAttempt, setLastLinkAttempt] = useState(0);
  
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [rosterData, setRosterData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [discordInfo, setDiscordInfo] = useState(null);
  const [activeVotes, setActiveVotes] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [dynamicVoiceData, setDynamicVoiceData] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [voiceActionLoading, setVoiceActionLoading] = useState(false);
  const [creatingRoleKey, setCreatingRoleKey] = useState(null);
  const [creatingLogChannel, setCreatingLogChannel] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSections, setResetSections] = useState([
    'roles', 'channels', 'permissions', 'voice', 'recruitment', 'ads', 'logging', 'moderation', 'general'
  ]);
  const [isResetting, setIsResetting] = useState(false);
  const [syncModalData, setSyncModalData] = useState(null);
  const hasPromptedRef = useRef(false);

  // --- Centralized Debounced & Throttled Auto-Save Engine ---
  const latestConfigRef = useRef(config);
  latestConfigRef.current = config;
  const saveTimerRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const pendingConfigRef = useRef(null);

  const latestVoiceConfigRef = useRef(dynamicVoiceData?.config);
  latestVoiceConfigRef.current = dynamicVoiceData?.config;
  const voiceSaveTimerRef = useRef(null);
  const lastVoiceSaveTimeRef = useRef(0);
  const pendingVoiceConfigRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
    };
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') {
      addLog(t('clan_waiting'));
      return;
    }
    
    addLog('Sending initial get_status request');
    
    const handleMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type && data.type.startsWith('clan_')) {
          addLog(`Received: ${JSON.stringify(data)}`);
        }
        
        if (data.type === 'clan_status_res') {
          setStatus(data.linked ? 'linked' : 'unlinked');
          if (data.linked) {
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          }
        } else if (data.type === 'clan_link_res') {
          if (data.success) {
            setStatus('linked');
            setGuildId(data.guildId);
            fetchConfig();
            fetchDiscordInfo();
          } else {
            setError(data.error || 'Failed to link');
          }
        } else if (data.type === 'clan_unlink_res') {
          setStatus('unlinked');
          setGuildId(null);
          setConfig(null);
          hasPromptedRef.current = false;
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_config') {
          setLoadingConfig(false);
          if (data.error) {
            setError(data.error);
          } else {
            const fetchedConfig = data.data.config;
            setConfig(sanitizeClanConfig(fetchedConfig));
            if (!hasPromptedRef.current && !isBotConfigured(fetchedConfig)) {
              hasPromptedRef.current = true;
              setShowSetupWizard(true);
            }
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'update_config') {
          if (data.error) {
            setError(data.error);
            setSaveStatus(`error: ${data.error}`);
          } else {
            setSaveStatus('success');
            setConfig(sanitizeClanConfig(data.data.config));
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'auto_setup') {
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
            setSaveStatus(`error: ${data.error || data.data.error}`);
          } else {
            setSaveStatus('success');
            if (data.data.discordInfo) setDiscordInfo(data.data.discordInfo);
            if (data.data.config) setConfig(sanitizeClanConfig(data.data.config));
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'sync_permissions') {
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
            setSaveStatus(`error: ${data.error || data.data.error}`);
          } else {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_roster') {
          if (!data.error && data.data && data.data.success) {
            setRosterData(data.data);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_stats') {
          if (!data.error && data.data && data.data.success) {
            setStatsData(data.data.stats);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_discord_info') {
          if (!data.error && data.data && data.data.success) {
            setDiscordInfo({ roles: data.data.roles, channels: data.data.channels });
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_active_votes') {
          if (!data.error && data.data && data.data.success) {
            setActiveVotes(data.data.votes);
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'create_vote' || data.reqId === 'close_vote')) {
          if (!data.error && data.data && data.data.success) {
            addLog(`Vote action success`);
            ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_active_votes', payload: { action: 'get_active_votes' } }));
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_dynamic_voice') {
          setLoadingVoice(false);
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData({
              config: data.data.config || { enabled: false, categoryId: '', generatorChannelId: '', template: '🔊 Пати {user}', defaultLimit: 0 },
              activeRooms: data.data.activeRooms || [],
              channels: data.data.channels || []
            });
            if (data.data.channels && data.data.channels.length > 0) {
              setDiscordInfo(prev => ({
                roles: prev?.roles || [],
                channels: data.data.channels
              }));
            }
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'update_dynamic_voice') {
          setSaveStatus(data.error ? `error: ${data.error}` : 'success');
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData(prev => ({
              ...prev,
              config: data.data.config
            }));
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'auto_setup_dynamic_voice') {
          setVoiceActionLoading(false);
          setSaveStatus(data.error ? `error: ${data.error}` : 'success');
          if (!data.error && data.data && data.data.success) {
            setDynamicVoiceData(prev => ({
              ...prev,
              config: data.data.config,
              channels: data.data.channels || prev?.channels || []
            }));
            fetchDiscordInfo();
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'manage_dynamic_room') {
          setVoiceActionLoading(false);
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
          } else {
            fetchDynamicVoice();
          }
        } else if (data.type === 'clan_proxy_res' && (data.reqId === 'rename_discord_role' || data.reqId === 'delete_discord_role')) {
          if (!data.error && data.data && data.data.success) {
            if (data.data.roles) {
              setDiscordInfo(prev => ({ roles: data.data.roles, channels: prev?.channels || [] }));
            }
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_single_role') {
          setCreatingRoleKey(null);
          if (!data.error && data.data && data.data.success) {
            if (data.data.roles) {
              setDiscordInfo(prev => ({ roles: data.data.roles, channels: prev?.channels || [] }));
            }
            if (data.data.config) {
              setConfig(sanitizeClanConfig(data.data.config));
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 2500);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'factory_reset') {
          setIsResetting(false);
          setShowResetModal(false);
          if (!data.error && data.data && data.data.success) {
            if (data.data.config) {
              setConfig(sanitizeClanConfig(data.data.config));
            }
            fetchDiscordInfo();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'create_log_channel') {
          setCreatingLogChannel(false);
          if (!data.error && data.data && data.data.success) {
            if (data.data.channels) {
              setDiscordInfo(prev => ({ roles: prev?.roles || [], channels: data.data.channels }));
            }
            if (data.data.channel) {
              const newChannelId = data.data.channel.id;
              setConfig(prev => {
                if (!prev) return prev;
                let logCfg = {};
                try {
                  if (prev.loggingConfigJson) {
                    logCfg = typeof prev.loggingConfigJson === 'string' ? JSON.parse(prev.loggingConfigJson) : prev.loggingConfigJson;
                  }
                } catch (e) {}
                logCfg.defaultChannelId = newChannelId;
                if (logCfg.enabled === undefined) logCfg.enabled = true;
                const updatedConfig = {
                  ...prev,
                  loggingConfigJson: JSON.stringify(logCfg)
                };
                autoSaveConfig(updatedConfig);
                return updatedConfig;
              });
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
          } else {
            setError(data.error || (data.data && data.data.error));
          }
        }
      } catch (err) {}
    };

    ws.addEventListener('message', handleMessage);
    ws.send(JSON.stringify({ type: 'clan', action: 'get_status' }));
    
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, wsStatus]);

  const handleLink = (e) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      setError(t('clan_setup_placeholder') || 'Введите 6-значный код');
      const inputEl = e?.target?.querySelector('input');
      if (inputEl) scrollToAndHighlight(inputEl);
      return;
    }
    
    const now = Date.now();
    if (now - lastLinkAttempt < 5000) {
      setError(t('clan_antispam_wait') || 'Please wait 5 seconds before trying again.');
      return;
    }
    setLastLinkAttempt(now);
    
    setError('');
    hasPromptedRef.current = false;
    addLog(`Sending link code request: ${linkCode}`);
    ws.send(JSON.stringify({ type: 'clan', action: 'link', code: linkCode }));
  };

  const handleUnlink = () => {
    if (window.confirm('Are you sure you want to unlink your Clan Manager?')) {
      addLog('Sending unlink request');
      hasPromptedRef.current = false;
      ws.send(JSON.stringify({ type: 'clan', action: 'unlink' }));
    }
  };

  const fetchConfig = () => {
    setLoadingConfig(true);
    addLog('Fetching config via proxy');
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_config', 
      payload: { action: 'get_config' } 
    }));
  };

  const fetchDiscordInfo = () => {
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_discord_info', 
      payload: { action: 'get_discord_info' } 
    }));
  };

  const startAutoSetup = (options) => {
    setShowSetupWizard(false);
    setSaveStatus('saving');
    addLog('Запрос автоматической настройки сервера...');
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'auto_setup',
      payload: {
        action: 'auto_setup',
        currentConfig: config,
        setupOptions: options
      }
    }));
  };

  const syncPermissions = () => {
    setSaveStatus('saving');
    let channelsConfig = {};
    try { if (config.channelsConfigJson) channelsConfig = JSON.parse(config.channelsConfigJson); } catch (e) {}
    
    // permissions structure stored in channelsConfig.permissions
    const permissions = channelsConfig.permissions || {};
    
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'sync_permissions',
      payload: {
        action: 'sync_permissions',
        permissions
      }
    }));
    addLog('Синхронизация прав доступа с Discord...');
  };
  
  const flushSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const cfgToSend = pendingConfigRef.current || latestConfigRef.current;
    if (!cfgToSend || !ws || wsStatus !== 'online') return;

    pendingConfigRef.current = null;
    lastSaveTimeRef.current = Date.now();
    setSaveStatus('saving');

    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'update_config', 
      payload: {
        action: 'update_config',
        updates: cfgToSend
      }
    }));
    addLog('Auto-saving config (batched)...');
  };

  const queueAutoSave = (newConfig, immediate = false) => {
    setConfig(newConfig);
    latestConfigRef.current = newConfig;
    pendingConfigRef.current = newConfig;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    if (immediate) {
      if (timeSinceLastSave >= 1000) {
        flushSave();
      } else {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const delay = Math.max(50, 1000 - timeSinceLastSave);
        saveTimerRef.current = setTimeout(() => {
          flushSave();
        }, delay);
      }
    } else {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const delay = Math.max(1000, 1000 - timeSinceLastSave);
      saveTimerRef.current = setTimeout(() => {
        flushSave();
      }, delay);
    }
  };

  const autoSaveConfig = (updatedConfig, immediate = true) => {
    queueAutoSave(updatedConfig, immediate);
  };

  const saveConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    flushSave();
  };

  const standardRoles = [
    { key: 'leader', dbKey: 'leaderRoleId', defaultRu: 'Лидер', defaultEn: 'Leader' },
    { key: 'deputy', dbKey: 'deputyLeaderRoleId', defaultRu: 'Зам. Лидера', defaultEn: 'Co-Leader' },
    { key: 'caller', dbKey: 'callerRoleId', defaultRu: 'Коллер', defaultEn: 'Caller' },
    { key: 'main', dbKey: 'mainRosterRoleId', defaultRu: 'Main Состав', defaultEn: 'Main Roster' },
    { key: 'trial', dbKey: 'trialRoleId', defaultRu: 'Испытательный', defaultEn: 'Trial' },
    { key: 'farmer', dbKey: 'farmerRoleId', defaultRu: 'Фармер', defaultEn: 'Farmer' },
    { key: 'electrician', dbKey: 'electricianRoleId', defaultRu: 'Электрик', defaultEn: 'Electrician' },
    { key: 'builder', dbKey: 'builderRoleId', defaultRu: 'Билдер', defaultEn: 'Builder' },
    { key: 'pilot', dbKey: 'pilotRoleId', defaultRu: 'Пилот', defaultEn: 'Pilot' },
    { key: 'vip', dbKey: 'vipRoleId', defaultRu: 'VIP', defaultEn: 'VIP' },
  ];

  const handleApplyTemplateLang = (lang) => {
    if (!config) return;
    let roleNames = {};
    try {
      if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
    } catch (e) {}

    standardRoles.forEach(r => {
      roleNames[r.key] = lang === 'en' ? r.defaultEn : r.defaultRu;
    });

    const updatedConfig = {
      ...config,
      roleNamesJson: JSON.stringify(roleNames)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleRoleNameChange = (key, val, isCustom, customId) => {
    if (!config) return;
    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].name = val;
        setConfig({ ...config, customRolesJson: JSON.stringify(customRoles) });
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      roleNames[key] = val;
      setConfig({ ...config, roleNamesJson: JSON.stringify(roleNames) });
    }
  };

  const handleRoleNameBlur = (key, dbKey, currentName, isCustom, customId) => {
    if (!config) return;
    let updatedConfig = { ...config };
    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].name = currentName;
        updatedConfig.customRolesJson = JSON.stringify(customRoles);
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      roleNames[key] = currentName;
      updatedConfig.roleNamesJson = JSON.stringify(roleNames);
    }

    autoSaveConfig(updatedConfig);

    const roleId = isCustom
      ? (() => {
          try {
            const list = updatedConfig.customRolesJson ? JSON.parse(updatedConfig.customRolesJson) : [];
            return list.find(r => r.id === customId)?.roleId;
          } catch (e) {
            return null;
          }
        })()
      : updatedConfig[dbKey];

    if (roleId && currentName && currentName.trim().length > 0) {
      ws.send(JSON.stringify({
        type: 'clan',
        action: 'proxy',
        reqId: 'rename_discord_role',
        payload: {
          action: 'rename_discord_role',
          roleId,
          newName: currentName.trim()
        }
      }));
    }
  };

  const handleSelectDiscordRole = (key, dbKey, selectedRoleId, isCustom, customId) => {
    if (!config) return;
    const foundDiscordRole = discordInfo?.roles?.find(r => r.id === selectedRoleId);
    const newDiscordName = foundDiscordRole?.name;

    if (isCustom) {
      let customRoles = [];
      try {
        if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
      } catch (e) {}
      const idx = customRoles.findIndex(r => r.id === customId);
      if (idx !== -1) {
        customRoles[idx].roleId = selectedRoleId;
        if (newDiscordName) {
          customRoles[idx].name = newDiscordName;
        }
        const updatedConfig = {
          ...config,
          customRolesJson: JSON.stringify(customRoles)
        };
        autoSaveConfig(updatedConfig);
      }
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      if (newDiscordName) {
        roleNames[key] = newDiscordName;
      }
      const updatedConfig = {
        ...config,
        [dbKey]: selectedRoleId,
        ...(newDiscordName ? { roleNamesJson: JSON.stringify(roleNames) } : {})
      };
      autoSaveConfig(updatedConfig);
    }
  };

  const handleCreateRoleInDiscord = (r, isCustom = false) => {
    if (!ws || wsStatus !== 'online') return;
    const roleIdentifier = isCustom ? r.id : r.key;
    setCreatingRoleKey(roleIdentifier);
    
    let roleName = '';
    if (isCustom) {
      roleName = r.name || 'Новая роль';
    } else {
      let roleNames = {};
      try {
        if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
      } catch (e) {}
      roleName = roleNames[r.key] || r.defaultRu;
    }

    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_single_role',
      payload: {
        action: 'create_single_role',
        name: roleName,
        color: '#3b82f6',
        roleKey: isCustom ? null : r.dbKey,
        isCustom,
        customRoleId: isCustom ? r.id : null
      }
    }));
  };

  const handleAddCustomRole = () => {
    if (!config) return;
    let customRoles = [];
    try {
      if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
    } catch (e) {}
    
    const newId = `custom_${Date.now()}`;
    const newRole = {
      id: newId,
      key: newId,
      name: 'Новая роль',
      roleId: ''
    };
    customRoles.push(newRole);
    
    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(customRoles)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleDeleteCustomRole = (customId) => {
    if (!config) return;
    if (!window.confirm(t('clan_roles_delete_confirm') || 'Удалить этот шаблон роли? Привязка к Discord роли будет снята.')) return;
    
    let customRoles = [];
    try {
      if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
    } catch (e) {}
    
    const filtered = customRoles.filter(r => r.id !== customId);
    const updatedConfig = {
      ...config,
      customRolesJson: JSON.stringify(filtered)
    };
    autoSaveConfig(updatedConfig);
  };

  const handleDeleteStandardRole = (roleKey, dbKey) => {
    if (!config) return;
    if (!window.confirm(t('clan_role_delete_std_confirm') || 'Удалить эту стандартную роль из конфигурации? Привязка к Discord роли будет снята.')) return;

    let deletedRoles = [];
    try {
      if (config.deletedRolesJson) {
        deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
      }
    } catch (e) {}

    if (!deletedRoles.includes(roleKey)) {
      deletedRoles.push(roleKey);
    }

    const updatedConfig = {
      ...config,
      deletedRolesJson: JSON.stringify(deletedRoles),
      [dbKey]: ''
    };
    autoSaveConfig(updatedConfig);
  };

  const handleRestoreStandardRoles = () => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      deletedRolesJson: '[]'
    };
    autoSaveConfig(updatedConfig);
  };

  const handleSwitchBotLanguage = async (targetLang) => {
    if (!config || (config.language || 'ru') === targetLang) return;
    if (!ws || wsStatus !== 'online') return;

    let currentRoleNames = {};
    try {
      if (config.roleNamesJson) currentRoleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
    } catch (e) {}

    const newRoleNames = { ...currentRoleNames };
    standardRoles.forEach(r => {
      newRoleNames[r.key] = targetLang === 'en' ? r.defaultEn : r.defaultRu;
    });

    const boundRolesToRename = standardRoles.filter(r => {
      const boundId = config[r.dbKey];
      return boundId && boundId.trim().length > 0;
    });

    const updatedConfig = {
      ...config,
      language: targetLang,
      roleNamesJson: JSON.stringify(newRoleNames)
    };

    if (boundRolesToRename.length === 0) {
      autoSaveConfig(updatedConfig);
      return;
    }

    setSyncModalData({
      isOpen: true,
      currentStep: 0,
      totalSteps: boundRolesToRename.length,
      currentRoleName: '',
      isFailed: false,
      errorText: '',
      failedRoleName: ''
    });

    let anyFailed = false;

    for (let i = 0; i < boundRolesToRename.length; i++) {
      const roleItem = boundRolesToRename[i];
      const targetRoleName = targetLang === 'en' ? roleItem.defaultEn : roleItem.defaultRu;

      setSyncModalData(prev => ({
        ...prev,
        currentStep: i + 1,
        currentRoleName: targetRoleName
      }));

      const result = await new Promise((resolve) => {
        const reqId = `sync_role_${Date.now()}_${i}`;
        const timeout = setTimeout(() => {
          cleanup();
          resolve({ success: false, error: 'Timeout waiting for Discord response' });
        }, 15000);

        const onMsg = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'clan_proxy_res' && msg.reqId === reqId) {
              cleanup();
              resolve(msg.data || msg);
            }
          } catch (e) {}
        };

        const cleanup = () => {
          clearTimeout(timeout);
          ws.removeEventListener('message', onMsg);
        };

        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({
          type: 'clan',
          action: 'proxy',
          reqId,
          payload: {
            action: 'sync_single_role_verified',
            roleId: config[roleItem.dbKey],
            newName: targetRoleName,
            roleKey: roleItem.key
          }
        }));
      });

      if (!result.success) {
        anyFailed = true;
        const errDesc = result.error || 'Failed to rename role';
        if (window.electronAPI?.app?.reportError) {
          window.electronAPI.app.reportError(`[RoleSync Error] Failed to rename role "${targetRoleName}" (${config[roleItem.dbKey]}): ${errDesc}`);
        }
        setSyncModalData(prev => ({
          ...prev,
          isFailed: true,
          failedRoleName: targetRoleName,
          errorText: errDesc
        }));
        break;
      } else {
        if (result.roles) {
          setDiscordInfo(prev => ({ roles: result.roles, channels: prev?.channels || [] }));
        }
      }
    }

    autoSaveConfig(updatedConfig);
    fetchDiscordInfo();

    if (!anyFailed) {
      setTimeout(() => {
        setSyncModalData(null);
      }, 1200);
    }
  };

  const handleExecuteFactoryReset = () => {
    if (!resetSections || resetSections.length === 0) return;
    if (!window.confirm(t('clan_reset_confirm_prompt') || 'Вы уверены, что хотите сбросить выбранные разделы к заводским настройкам?')) return;

    setIsResetting(true);
    addLog(`Запуск выборочного сброса к заводским настройкам: ${resetSections.join(', ')}`);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'factory_reset',
      payload: {
        action: 'factory_reset',
        sections: resetSections
      }
    }));
  };

  const fetchDynamicVoice = () => {
    setLoadingVoice(true);
    addLog('Fetching dynamic voice config via proxy');
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'get_dynamic_voice', 
      payload: { action: 'get_dynamic_voice' } 
    }));
  };

  const flushVoiceSave = () => {
    if (voiceSaveTimerRef.current) {
      clearTimeout(voiceSaveTimerRef.current);
      voiceSaveTimerRef.current = null;
    }

    const cfgToSend = pendingVoiceConfigRef.current || latestVoiceConfigRef.current;
    if (!cfgToSend || !ws || wsStatus !== 'online') return;

    pendingVoiceConfigRef.current = null;
    lastVoiceSaveTimeRef.current = Date.now();
    setSaveStatus('saving');

    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'update_dynamic_voice', 
      payload: {
        action: 'update_dynamic_voice',
        config: cfgToSend
      }
    }));
    addLog('Auto-saving dynamic voice config...');
  };

  const queueAutoSaveVoice = (newVoiceConfig, immediate = false) => {
    setDynamicVoiceData(prev => ({
      ...prev,
      config: newVoiceConfig
    }));
    latestVoiceConfigRef.current = newVoiceConfig;
    pendingVoiceConfigRef.current = newVoiceConfig;

    const now = Date.now();
    const timeSinceLastSave = now - lastVoiceSaveTimeRef.current;

    if (immediate) {
      if (timeSinceLastSave >= 1000) {
        flushVoiceSave();
      } else {
        if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
        const delay = Math.max(50, 1000 - timeSinceLastSave);
        voiceSaveTimerRef.current = setTimeout(() => {
          flushVoiceSave();
        }, delay);
      }
    } else {
      if (voiceSaveTimerRef.current) clearTimeout(voiceSaveTimerRef.current);
      const delay = Math.max(1000, 1000 - timeSinceLastSave);
      voiceSaveTimerRef.current = setTimeout(() => {
        flushVoiceSave();
      }, delay);
    }
  };

  const saveDynamicVoiceConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    flushVoiceSave();
  };

  const handleAutoSetupDynamicVoice = () => {
    setVoiceActionLoading(true);
    addLog('Запрос автоматической настройки динамических войсов...');
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'auto_setup_dynamic_voice',
      payload: { action: 'auto_setup_dynamic_voice' }
    }));
  };

  const handleManageDynamicRoom = (subAction, channelId, options = {}) => {
    setVoiceActionLoading(true);
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'manage_dynamic_room',
      payload: {
        action: 'manage_dynamic_room',
        subAction,
        channelId,
        ...options
      }
    }));
    addLog(`Manage dynamic room: ${subAction} on ${channelId}`);
  };

  const handleCreateDiscordLogChannel = () => {
    if (!ws || wsStatus !== 'online') return;
    setCreatingLogChannel(true);
    addLog('Создание канала логов в Discord...');
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'create_log_channel',
      payload: {
        action: 'create_log_channel',
        name: '📜・логи-сервера'
      }
    }));
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') return;
    if (activeTab === 'roster' && !rosterData) {
      addLog('Fetching roster via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_roster', payload: { action: 'get_roster' } }));
    } else if (activeTab === 'stats' && !statsData) {
      addLog('Fetching stats via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
    } else if (activeTab === 'voice' && !dynamicVoiceData) {
      fetchDynamicVoice();
    } else if ((activeTab === 'roles' || activeTab === 'channels' || activeTab === 'permissions' || activeTab === 'logs' || activeTab === 'moderation') && !discordInfo) {
      fetchDiscordInfo();
    }
  }, [activeTab, ws, wsStatus, rosterData, statsData, discordInfo, dynamicVoiceData]);

  const DebugLogs = () => (
    <div className="mt-8 bg-slate-900 text-green-400 p-4 rounded-xl shadow-inner text-xs font-mono max-h-64 overflow-y-auto border border-slate-800">
      <div className="mb-2 font-bold text-white border-b border-slate-700 pb-2 flex items-center justify-between">
        <span>Debug Logs</span>
        <span className="text-[10px] text-slate-500 font-normal">Auto-scrolling</span>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="opacity-90">{log}</div>
        ))}
      </div>
    </div>
  );

  if (status === 'checking') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">{t('clan_connecting')}</div>
        </div>
        <DebugLogs />
      </div>
    );
  }

  if (status === 'unlinked') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            {t('clan_setup_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {t('clan_setup_desc')}
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">1</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">{t('clan_setup_step1')}</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">2</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">
                {t('clan_setup_step2').split('/hub_link').map((part, i, arr) => 
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono text-sm mx-1">/hub_link</code>}
                  </React.Fragment>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">3</div>
              <div className="text-slate-700 dark:text-slate-300 pt-1">{t('clan_setup_step3')}</div>
            </div>
          </div>
          
          <form onSubmit={handleLink} noValidate className="space-y-4">
            <div>
              <input 
                type="text" 
                required
                placeholder={t('clan_setup_placeholder')} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-[0.5em] font-mono shadow-inner transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans placeholder:text-base dark:placeholder:text-slate-600"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
                maxLength={6}
              />
            </div>
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm">
              {t('clan_setup_btn')}
            </button>
          </form>
        </div>
        <DebugLogs />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Основное', icon: Settings },
    { id: 'roles', label: 'Роли', icon: Users },
    { id: 'channels', label: 'Каналы', icon: Hash },
    { id: 'permissions', label: 'Права Доступа', icon: ShieldCheck },
    { id: 'voice', label: t('clan_tab_voice') || 'Динамические войсы', icon: Volume2 },
    { id: 'logs', label: t('clan_tab_logs') || 'Логирование', icon: ScrollText },
    { id: 'moderation', label: t('clan_tab_moderation') || 'Модерация', icon: ShieldAlert },
    { id: 'recruitment', label: 'Наборы', icon: UserPlus },
    { id: 'votes', label: 'Голосования', icon: Vote },
    { id: 'ads', label: 'Реклама', icon: Megaphone },
    { id: 'roster', label: 'Состав', icon: UserCheck },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
  ];


  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('clan_manager_title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('clan_manager_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSetupWizard(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{t('clan_wizard_btn')}</span>
          </button>
          <button 
            onClick={() => setShowResetModal(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('clan_reset_btn') || 'Сброс настроек'}</span>
          </button>
          <button 
            onClick={handleUnlink} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Unlink className="w-4 h-4 text-red-500 shrink-0" />
            <span>{t('clan_unlink_btn')}</span>
          </button>
        </div>
      </div>
      
      {config && !isBotConfigured(config) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                {t('clan_unconfigured_title')}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                {t('clan_unconfigured_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowSetupWizard(true)}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {t('clan_wizard_btn')}
            </button>
          </div>
        </div>
      )}
      
      {loadingConfig ? (
        <div className="text-slate-500 font-medium">{t('clan_loading')}</div>
      ) : config ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[660px]">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-950/40 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto scrollbar-hide">
            <div className="hidden md:flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('clan_nav_sections') || 'Разделы'}
              </span>
              {saveStatus && (
                <span className={`text-[11px] font-medium ${saveStatus === 'success' ? 'text-green-500' : saveStatus.startsWith('error') ? 'text-red-500' : 'text-blue-500 animate-pulse'}`}>
                  {saveStatus === 'success' ? '✓ Сохранено' : saveStatus === 'saving' ? 'Синхронизация...' : 'Ошибка'}
                </span>
              )}
            </div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            
            {activeTab === 'general' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Основные настройки
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Название клана *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800/50 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                    value={config?.name ?? ''}
                    onChange={e => {
                      const updated = { ...config, name: e.target.value };
                      queueAutoSave(updated, false);
                    }}
                    onBlur={e => {
                      const updated = { ...config, name: e.target.value };
                      queueAutoSave(updated, true);
                    }}
                    placeholder="Например: GODS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Основная ссылка на Discord</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800/50 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                    value={config?.discordLink ?? ''}
                    onChange={e => {
                      const updated = { ...config, discordLink: e.target.value };
                      queueAutoSave(updated, false);
                    }}
                    onBlur={e => {
                      const updated = { ...config, discordLink: e.target.value };
                      queueAutoSave(updated, true);
                    }}
                    placeholder="https://discord.gg/..."
                  />
                </div>
                
                {/* Bot Language Card */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {t('clan_general_bot_lang_title') || 'Язык Discord бота'}
                      </span>
                    </div>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                      {(config.language || 'ru').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('clan_general_bot_lang_desc') || 'Переключает язык сообщений, кнопок и тикетов бота в Discord, а также последовательно синхронизирует и верифицирует названия ролей на сервере.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchBotLanguage('ru')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        (config.language || 'ru') === 'ru'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇷🇺 Русский (RU)</span>
                      {(config.language || 'ru') === 'ru' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchBotLanguage('en')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        config.language === 'en'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇬🇧 English (EN)</span>
                      {config.language === 'en' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <input 
                    type="checkbox" 
                    id="recruitmentOpen"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3 cursor-pointer"
                    checked={!!config.recruitmentOpen}
                    onChange={e => {
                      const updated = { ...config, recruitmentOpen: e.target.checked };
                      queueAutoSave(updated, true);
                    }}
                  />
                  <label htmlFor="recruitmentOpen" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                    Набор в клан открыт (Позволяет создавать тикеты заявок)
                  </label>
                </div>

                {/* Factory Reset Section */}
                <div className="p-4 border border-amber-200 dark:border-amber-800/60 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-amber-500" />
                      {t('clan_reset_btn') || 'Сброс настроек бота'}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      {t('clan_reset_general_card_desc') || 'Выборочно вернуть роли, каналы, права или весь бот к исходному заводскому состоянию.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    {t('clan_reset_btn') || 'Сбросить...'}
                  </button>
                </div>
                
                <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
              </form>
            )}

            {activeTab === 'roles' && (() => {
              let roleNames = {};
              try {
                if (config.roleNamesJson) roleNames = typeof config.roleNamesJson === 'string' ? JSON.parse(config.roleNamesJson) : config.roleNamesJson;
              } catch (e) {}

              let customRoles = [];
              try {
                if (config.customRolesJson) customRoles = typeof config.customRolesJson === 'string' ? JSON.parse(config.customRolesJson) : config.customRolesJson;
              } catch (e) {}

              let deletedRoles = [];
              try {
                if (config.deletedRolesJson) deletedRoles = typeof config.deletedRolesJson === 'string' ? JSON.parse(config.deletedRolesJson) : config.deletedRolesJson;
              } catch (e) {}

              const visibleStandardRoles = standardRoles.filter(r => !deletedRoles.includes(r.key));

              return (
                <div className="space-y-6 max-w-5xl">
                  {/* Roles Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        {t('clan_roles_config') || 'Настройки ролей'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_roles_desc') || 'Привязывайте роли из Discord к боту или создавайте их в один клик. Изменения синхронизируются мгновенно.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Restore Standard Roles Button if any deleted */}
                      {deletedRoles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          title={t('clan_roles_restore_std') || 'Восстановить удаленные стандартные роли'}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('clan_roles_restore_std') || `Восстановить роли (${deletedRoles.length})`}</span>
                        </button>
                      )}

                      {/* Add Custom Role */}
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Всего ролей: {visibleStandardRoles.length + customRoles.length}
                    </span>
                    <div className="flex items-center gap-2">
                      {saveStatus === 'saving' ? (
                        <span className="text-blue-500 font-medium flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                          {t('clan_roles_syncing') || 'Синхронизация...'}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          {t('clan_roles_auto_saved') || 'Все изменения сохранены'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standard Roles Section */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Стандартные роли ({visibleStandardRoles.length})
                    </div>
                    {visibleStandardRoles.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-950/20">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                          Все стандартные роли были скрыты или удалены
                        </p>
                        <button
                          type="button"
                          onClick={handleRestoreStandardRoles}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('clan_roles_restore_std') || 'Восстановить роли'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleStandardRoles.map(r => {
                          const currentName = roleNames[r.key] !== undefined ? roleNames[r.key] : r.defaultRu;
                          const boundRoleId = config[r.dbKey] || '';
                          const isCreatingThis = creatingRoleKey === r.key;

                          return (
                            <div 
                              key={r.key} 
                              className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all shadow-sm flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                      {r.key}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {boundRoleId ? (
                                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Привязано
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                        Не привязано
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStandardRole(r.key, r.dbKey)}
                                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                      title={t('clan_roles_delete_std') || 'Удалить стандартную роль'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  Название роли (в боте)
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                  value={currentName}
                                  onChange={e => handleRoleNameChange(r.key, e.target.value, false)}
                                  onBlur={e => handleRoleNameBlur(r.key, r.dbKey, e.target.value, false)}
                                  placeholder={r.defaultRu}
                                />
                              </div>

                              <div>
                                <RoleSelect
                                  label="Роль в Discord"
                                  description=""
                                  value={boundRoleId}
                                  onChange={val => handleSelectDiscordRole(r.key, r.dbKey, val, false)}
                                  discordRoles={discordInfo?.roles || []}
                                  rightAction={
                                    <button
                                      type="button"
                                      onClick={() => handleCreateRoleInDiscord(r, false)}
                                      disabled={isCreatingThis || creatingRoleKey !== null}
                                      className="px-2.5 py-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-300 dark:border-slate-700 hover:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                      title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                    >
                                      {isCreatingThis ? (
                                        <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                      )}
                                      <span className="hidden sm:inline">Создать</span>
                                    </button>
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                  {/* Custom Roles Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        Кастомные роли ({customRoles.length})
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('clan_roles_add_custom') || 'Добавить роль'}</span>
                      </button>
                    </div>

                    {customRoles.length === 0 ? (
                      <div 
                        onClick={handleAddCustomRole}
                        className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 group"
                      >
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Нет дополнительных ролей
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Нажмите сюда, чтобы добавить кастомную роль (например: Медик, Снайпер, Гость)
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customRoles.map(cr => {
                          const isCreatingThis = creatingRoleKey === cr.id;
                          return (
                            <div 
                              key={cr.id} 
                              className="bg-amber-50/20 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-sm flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                      Кастомная роль
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {cr.roleId ? (
                                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Привязано
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                        Не привязано
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomRole(cr.id)}
                                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                                      title={t('clan_roles_delete_template') || 'Удалить шаблон роли'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    Название роли (в боте)
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                    value={cr.name || ''}
                                    onChange={e => handleRoleNameChange(cr.key, e.target.value, true, cr.id)}
                                    onBlur={e => handleRoleNameBlur(cr.key, null, e.target.value, true, cr.id)}
                                    placeholder="Новая роль"
                                  />
                                </div>

                                <div>
                                  <RoleSelect
                                    label="Роль в Discord"
                                    description=""
                                    value={cr.roleId || ''}
                                    onChange={val => handleSelectDiscordRole(cr.key, null, val, true, cr.id)}
                                    discordRoles={discordInfo?.roles || []}
                                    rightAction={
                                      <button
                                        type="button"
                                        onClick={() => handleCreateRoleInDiscord(cr, true)}
                                        disabled={isCreatingThis || creatingRoleKey !== null}
                                        className="px-2.5 py-2 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                        title={t('clan_roles_create_in_discord') || 'Создать роль на Discord сервере и привязать'}
                                      >
                                        {isCreatingThis ? (
                                          <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <Plus className="w-3.5 h-3.5" />
                                        )}
                                        <span className="hidden sm:inline">Создать</span>
                                      </button>
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'channels' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                  Настройки каналов
                </h3>
                
                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  
                  const updateCConfig = (key, val) => {
                    const newConfig = { ...cConfig, [key]: val };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, true);
                  };
                  
                  const channelsList = [
                    { key: 'ticketsCategory', label: 'Категория для тикетов', desc: 'Здесь бот будет создавать приватные каналы тикетов заявок.', typeFilter: 4 },
                    { key: 'applications', label: 'Одобренные заявки', desc: 'Сюда будут пересылаться одобренные заявки из тикетов.', typeFilter: [0, 2] },
                    { key: 'leaderboard', label: 'Статистика (Leaderboard)', desc: 'Канал, где публикуется статистика по вайпам и топам.', typeFilter: [0, 2] },
                    { key: 'news', label: 'Новости клана', desc: 'Канал для публикации объявлений и новостей бота.', typeFilter: [0, 2] },
                    { key: 'votes', label: 'Голосования', desc: 'Канал для создания голосований. Может быть тем же, что и новости.', typeFilter: [0, 2] },
                    { key: 'ads', label: 'Реклама и альянсы', desc: 'Сюда бот отправляет информацию об оплаченной рекламе.', typeFilter: [0, 2] },
                    { key: 'roster', label: 'Состав клана (Roster)', desc: 'Здесь выводится динамический список всех участников.', typeFilter: [0, 2] }
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {channelsList.map(c => (
                         <div key={c.key} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
                           <ChannelSelect
                             label={c.label}
                             description={c.desc}
                             value={cConfig[c.key] || ''}
                             onChange={val => updateCConfig(c.key, val)}
                             discordChannels={discordInfo?.channels || []}
                             typeFilter={c.typeFilter}
                           />
                         </div>
                      ))}
                    </div>
                  );
                })()}
                
                <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
              </form>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6 max-w-6xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Права Доступа (Матрица ролей и каналов)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
                      Выберите каналы, к которым каждая роль должна иметь доступ.
                      <br/>
                      <span className="text-blue-500 font-medium">💡 Совет:</span> Сначала настройте каналы для низших ролей. Более высокие роли автоматически унаследуют эти доступы, и вам останется только добавить им их уникальные административные каналы.
                    </p>
                  </div>
                  <button onClick={syncPermissions} disabled={saveStatus === 'saving'} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 flex items-center shrink-0">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Синхронизировать с Discord
                  </button>
                </div>

                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) cConfig = JSON.parse(config.channelsConfigJson);
                  } catch(e) {}
                  
                  let permissions = cConfig.permissions || {};
                  let defaultLogChannelId = null;
                  try {
                    const l = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
                    defaultLogChannelId = l?.defaultChannelId || null;
                  } catch(e) {}
                  
                  const channelKeys = ['logs', 'applications', 'leaderboard', 'news', 'votes', 'ads', 'roster'];
                  const roleKeys = ['trial', 'main', 'caller', 'deputyLeader', 'leader'];
                  const sideRoles = ['farmer', 'electrician', 'builder', 'pilot', 'vip'];
                  const allRoles = [...roleKeys, ...sideRoles];
                  
                  // Helper mapping to actual discord role IDs
                  const roleIdMap = {};
                  allRoles.forEach(r => roleIdMap[r] = config[r + 'RoleId']);
                  
                  const togglePermission = (roleKey, channelKey) => {
                    const roleId = roleIdMap[roleKey];
                    if (!roleId) return; // role not configured
                    const channelId = cConfig[channelKey] || (channelKey === 'logs' ? defaultLogChannelId : null);
                    if (!channelId) return;

                    const newPermissions = { ...permissions };
                    const currentSet = new Set(newPermissions[roleId] || []);
                    const isGranting = !currentSet.has(channelId);

                    if (isGranting) {
                      currentSet.add(channelId);
                      
                      // Auto-inherit for higher roles
                      const roleIndex = roleKeys.indexOf(roleKey);
                      if (roleIndex !== -1) {
                        for (let i = roleIndex + 1; i < roleKeys.length; i++) {
                          const higherRoleId = roleIdMap[roleKeys[i]];
                          if (higherRoleId) {
                            if (!newPermissions[higherRoleId]) newPermissions[higherRoleId] = [];
                            const hSet = new Set(newPermissions[higherRoleId]);
                            hSet.add(channelId);
                            newPermissions[higherRoleId] = Array.from(hSet);
                          }
                        }
                      }
                    } else {
                      currentSet.delete(channelId);
                    }
                    
                    newPermissions[roleId] = Array.from(currentSet);
                    
                    const newConfig = { ...cConfig, permissions: newPermissions };
                    const updated = { ...config, channelsConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, true);
                  };

                  return (
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Роль</th>
                            {channelKeys.map(cKey => (
                              <th key={cKey} className="px-2 py-3 text-center font-medium text-slate-600 dark:text-slate-400 capitalize">
                                <div className="writing-mode-vertical sm:writing-mode-horizontal truncate max-w-[80px]" title={cKey}>
                                  {cKey}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {allRoles.map((rKey, idx) => {
                            const rId = roleIdMap[rKey];
                            const isConfigured = !!rId;
                            
                            // Find name from roleNamesJson
                            let rName = rKey;
                            try {
                              if (config.roleNamesJson) {
                                const names = JSON.parse(config.roleNamesJson);
                                if (names[rKey]) rName = names[rKey];
                              }
                            } catch(e) {}
                            
                            return (
                              <tr key={rKey} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${idx === roleKeys.length ? 'border-t-2 border-slate-200 dark:border-slate-700' : ''}`}>
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 flex items-center">
                                  {!isConfigured && <span className="w-2 h-2 rounded-full bg-red-400 mr-2" title="Роль не привязана к Discord"></span>}
                                  {isConfigured && <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>}
                                  {rName}
                                </td>
                                {channelKeys.map(cKey => {
                                  const cId = cConfig[cKey] || (cKey === 'logs' ? defaultLogChannelId : null);
                                  const isAllowed = isConfigured && cId && permissions[rId]?.includes(cId);
                                  return (
                                    <td key={cKey} className="px-2 py-3 text-center">
                                      <input 
                                        type="checkbox"
                                        disabled={!isConfigured || !cId}
                                        checked={isAllowed}
                                        onChange={() => togglePermission(rKey, cKey)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
                
                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-8 max-w-5xl">
                {/* Header banner / info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 shrink-0 mt-0.5">
                      <Volume2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t('clan_voice_title')}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {t('clan_voice_desc')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSetupDynamicVoice}
                    disabled={voiceActionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{voiceActionLoading ? 'Создание...' : t('clan_voice_auto_setup_btn')}</span>
                  </button>
                </div>

                {/* Section 1: Settings Form */}
                {loadingVoice || !dynamicVoiceData ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={saveDynamicVoiceConfig} noValidate className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                            Настройки системы Join-to-Create
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Настройте категорию и канал для автоматического создания пати
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!dynamicVoiceData.config?.enabled}
                            onChange={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), enabled: e.target.checked };
                              queueAutoSaveVoice(updated, true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                          <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                            {dynamicVoiceData.config?.enabled ? 'Включено' : 'Выключено'}
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChannelSelect
                          label={t('clan_voice_category_label')}
                          description={t('clan_voice_category_desc')}
                          value={dynamicVoiceData.config?.categoryId || ''}
                          onChange={(val) => {
                            const updated = { ...(dynamicVoiceData.config || {}), categoryId: val };
                            queueAutoSaveVoice(updated, true);
                          }}
                          discordChannels={dynamicVoiceData?.channels || discordInfo?.channels || []}
                          typeFilter={4}
                        />

                        <ChannelSelect
                          label={t('clan_voice_generator_label')}
                          description={t('clan_voice_generator_desc')}
                          value={dynamicVoiceData.config?.generatorChannelId || ''}
                          onChange={(val) => {
                            const updated = { ...(dynamicVoiceData.config || {}), generatorChannelId: val };
                            queueAutoSaveVoice(updated, true);
                          }}
                          discordChannels={dynamicVoiceData?.channels || discordInfo?.channels || []}
                          typeFilter={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_voice_template_label')}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {t('clan_voice_template_desc')}
                          </p>
                          <input
                            type="text"
                            value={dynamicVoiceData.config?.template || ''}
                            onChange={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), template: e.target.value };
                              queueAutoSaveVoice(updated, false);
                            }}
                            onBlur={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), template: e.target.value };
                              queueAutoSaveVoice(updated, true);
                            }}
                            placeholder="🔊 Пати {user}"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_voice_limit_label')}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {t('clan_voice_limit_desc')}
                          </p>
                          <select
                            value={dynamicVoiceData.config?.defaultLimit ?? 0}
                            onChange={(e) => {
                              const updated = { ...(dynamicVoiceData.config || {}), defaultLimit: parseInt(e.target.value, 10) || 0 };
                              queueAutoSaveVoice(updated, true);
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow"
                          >
                            <option value={0}>0 — {t('clan_voice_unlimited')}</option>
                            <option value={2}>2 места (Дуо)</option>
                            <option value={3}>3 места (Трио)</option>
                            <option value={4}>4 места (Квадро)</option>
                            <option value={5}>5 мест (Пятерка)</option>
                            <option value={6}>6 мест</option>
                            <option value={8}>8 мест</option>
                            <option value={10}>10 мест</option>
                            <option value={12}>12 мест</option>
                            <option value={16}>16 мест</option>
                          </select>
                        </div>
                      </div>

                      <SaveButton saveStatus={saveStatus} onManualSave={() => flushVoiceSave()} />
                    </form>

                    {/* Section 2: Active Temporary Rooms Monitoring */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                            {t('clan_voice_active_title')}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                            {dynamicVoiceData.activeRooms?.length || 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={fetchDynamicVoice}
                          disabled={loadingVoice || voiceActionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingVoice ? 'animate-spin' : ''}`} />
                          <span>{t('clan_voice_refresh_btn')}</span>
                        </button>
                      </div>

                      {(!dynamicVoiceData.activeRooms || dynamicVoiceData.activeRooms.length === 0) ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {t('clan_voice_no_rooms')}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dynamicVoiceData.activeRooms.map(room => (
                            <div
                              key={room.channelId}
                              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-orange-500 shrink-0" />
                                    <h5 className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[220px]" title={room.name}>
                                      {room.name}
                                    </h5>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {t('clan_voice_owner')} <span className="font-medium text-slate-700 dark:text-slate-300">{room.ownerName || 'Unknown'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newLimit = window.prompt('Новый лимит мест (0 = без лимита):', room.userLimit || 0);
                                      if (newLimit !== null) {
                                        handleManageDynamicRoom('set_limit', room.channelId, { limit: parseInt(newLimit, 10) || 0 });
                                      }
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Изменить лимит мест"
                                  >
                                    <Sliders className="w-3 h-3" />
                                    <span>{room.userLimit > 0 ? room.userLimit : '∞'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Удалить комнату "${room.name}"? Все участники будут отключены.`)) {
                                        handleManageDynamicRoom('delete_room', room.channelId);
                                      }
                                    }}
                                    className="p-1.5 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                    title={t('clan_voice_delete_room_btn')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Members list */}
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex justify-between">
                                  <span>Участники ({room.members?.length || 0}{room.userLimit > 0 ? ` / ${room.userLimit}` : ''}):</span>
                                </div>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {room.members?.map(m => (
                                    <div
                                      key={m.id}
                                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <img
                                          src={m.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                          alt=""
                                          className="w-5 h-5 rounded-full shrink-0"
                                        />
                                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium max-w-[130px]" title={m.displayName}>
                                          {m.displayName}
                                        </span>
                                        {m.isMuted && (
                                          <MicOff className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_muted')} />
                                        )}
                                        {m.isDeaf && (
                                          <VolumeX className="w-3 h-3 text-red-500 shrink-0" title={t('clan_voice_deafened')} />
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleManageDynamicRoom('kick_member', room.channelId, { userId: m.id })}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                        title="Отключить из голосового канала"
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'recruitment' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Настройки набора в клан
                </h3>
                
                {(() => {
                  let rConfig = {
                    link: 'https://discord.gg/vPEAxjCBRC',
                    banner: 'https://i.imgur.com/UaMfYMK.png',
                    title: `Набор в клан ${config.name || 'GODS'}`,
                    text: "Требования:\n\n**MAIN**\nВозраст: 20+\nЧасы: 5000+\nТребования: 8+ часов онлайна\nНавыки: Желательна универсальность\n\n**Билдер:**\nВозраст: 18+\nЧасы: 3000+\nТребования: 6+ часов онлайна\nНавыки: Умение быстро строить кастомные базы",
                  };
                  try {
                    if (config.recruitmentConfigJson) {
                      rConfig = { ...rConfig, ...JSON.parse(config.recruitmentConfigJson) };
                    }
                  } catch(e) {}
                  
                  const updateRConfig = (key, val, immediate = false) => {
                    const newConfig = { ...rConfig, [key]: val };
                    const updated = { ...config, recruitmentConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на Discord сервер (для набора) *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.link}
                          onChange={e => updateRConfig('link', e.target.value, false)}
                          onBlur={e => updateRConfig('link', e.target.value, true)}
                          placeholder="https://discord.gg/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на баннер (Изображение)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.banner}
                          onChange={e => updateRConfig('banner', e.target.value, false)}
                          onBlur={e => updateRConfig('banner', e.target.value, true)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Заголовок Embed-сообщения *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.title}
                          onChange={e => updateRConfig('title', e.target.value, false)}
                          onBlur={e => updateRConfig('title', e.target.value, true)}
                          placeholder="Набор в клан GODS"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст с требованиями (Markdown поддерживается) *</label>
                        <textarea 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[200px]"
                          value={rConfig.text}
                          onChange={e => updateRConfig('text', e.target.value, false)}
                          onBlur={e => updateRConfig('text', e.target.value, true)}
                          placeholder="Опишите требования..."
                        ></textarea>
                      </div>
                    </>
                  );
                })()}
                
                <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
              </form>
            )}

            {activeTab === 'votes' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  Шаблоны серверов для голосований
                </h3>
                
                {(() => {
                  let wTemplates = [];
                  try {
                    if (config.wipeTemplatesJson) {
                      wTemplates = JSON.parse(config.wipeTemplatesJson);
                    }
                  } catch(e) {}
                  
                  const updateTemplate = (index, key, val, immediate = false) => {
                    const newTemplates = [...wTemplates];
                    newTemplates[index] = { ...newTemplates[index], [key]: val };
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, immediate);
                  };

                  const addTemplate = () => {
                    const newTemplates = [...wTemplates, { name: '', day: 'Четверг', time: '16:00', ip: '', banner: '' }];
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };

                  const removeTemplate = (index) => {
                    const newTemplates = wTemplates.filter((_, i) => i !== index);
                    const updated = { ...config, wipeTemplatesJson: JSON.stringify(newTemplates) };
                    queueAutoSave(updated, true);
                  };
                  
                  return (
                    <div className="space-y-4">
                      {wTemplates.map((tpl, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30 relative">
                          <button type="button" onClick={() => removeTemplate(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Название сервера *</label>
                              <input 
                                type="text" 
                                required 
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                value={tpl.name || ''} 
                                onChange={e => updateTemplate(index, 'name', e.target.value, false)} 
                                onBlur={e => updateTemplate(index, 'name', e.target.value, true)}
                                placeholder="Rustoria Main" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">День вайпа</label>
                              <select 
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                value={tpl.day || 'Четверг'} 
                                onChange={e => updateTemplate(index, 'day', e.target.value, true)}
                              >
                                <option value="Понедельник">Понедельник</option>
                                <option value="Вторник">Вторник</option>
                                <option value="Среда">Среда</option>
                                <option value="Четверг">Четверг</option>
                                <option value="Пятница">Пятница</option>
                                <option value="Суббота">Суббота</option>
                                <option value="Воскресенье">Воскресенье</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Время (МСК)</label>
                              <input 
                                type="text" 
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                value={tpl.time || ''} 
                                onChange={e => updateTemplate(index, 'time', e.target.value, false)} 
                                onBlur={e => updateTemplate(index, 'time', e.target.value, true)}
                                placeholder="16:00" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">IP (connect ...) *</label>
                              <input 
                                type="text" 
                                required 
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                value={tpl.ip || ''} 
                                onChange={e => updateTemplate(index, 'ip', e.target.value, false)} 
                                onBlur={e => updateTemplate(index, 'ip', e.target.value, true)}
                                placeholder="connect 127.0.0.1:28015" 
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-500 mb-1">Ссылка на баннер</label>
                              <input 
                                type="text" 
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                                value={tpl.banner || ''} 
                                onChange={e => updateTemplate(index, 'banner', e.target.value, false)} 
                                onBlur={e => updateTemplate(index, 'banner', e.target.value, true)}
                                placeholder="https://i.imgur.com/..." 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button type="button" onClick={addTemplate} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Добавить шаблон сервера
                      </button>
                    </div>
                  );
                })()}
                
                <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
              </form>
            )}

            {activeTab === 'ads' && (
              <form onSubmit={saveConfig} noValidate className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                  Настройки панели рекламы
                </h3>
                
                {(() => {
                  let aConfig = {
                    title: 'Покупка рекламы',
                    text: 'Здесь вы можете приобрести рекламу или обсудить партнерство.',
                    banner: 'https://i.imgur.com/example.png',
                    priceLink: 'https://telegra.ph/price',
                  };
                  try {
                    if (config.adConfigJson) {
                      aConfig = { ...aConfig, ...JSON.parse(config.adConfigJson) };
                    }
                  } catch(e) {}
                  
                  const updateAConfig = (key, val, immediate = false) => {
                    const newConfig = { ...aConfig, [key]: val };
                    const updated = { ...config, adConfigJson: JSON.stringify(newConfig) };
                    queueAutoSave(updated, immediate);
                  };
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Заголовок Embed-сообщения *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.title}
                          onChange={e => updateAConfig('title', e.target.value, false)}
                          onBlur={e => updateAConfig('title', e.target.value, true)}
                          placeholder="Покупка рекламы"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст *</label>
                        <textarea 
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px]"
                          value={aConfig.text}
                          onChange={e => updateAConfig('text', e.target.value, false)}
                          onBlur={e => updateAConfig('text', e.target.value, true)}
                          placeholder="Информация о рекламе..."
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на Прайс-лист (Telegraph / Сайт)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.priceLink}
                          onChange={e => updateAConfig('priceLink', e.target.value, false)}
                          onBlur={e => updateAConfig('priceLink', e.target.value, true)}
                          placeholder="https://telegra.ph/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на баннер (Изображение)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.banner}
                          onChange={e => updateAConfig('banner', e.target.value, false)}
                          onBlur={e => updateAConfig('banner', e.target.value, true)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                    </>
                  );
                })()}
                
                <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
              </form>
            )}

            {activeTab === 'roster' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Состав клана
                  </h3>
                  <button onClick={() => setRosterData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Обновить
                  </button>
                </div>
                
                {!rosterData ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rosterData.roster.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                        Участники не найдены. Убедитесь, что роли настроены правильно.
                      </div>
                    ) : (
                      rosterData.roster.map(member => {
                        let roleNamesMap = {};
                        try {
                          if (rosterData.roleNamesJson) roleNamesMap = JSON.parse(rosterData.roleNamesJson);
                        } catch(e) {}
                        
                        return (
                          <div key={member.userId} className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                            <img src={member.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="w-12 h-12 rounded-full mr-4 shadow-sm" />
                            <div className="flex-1 overflow-hidden">
                              <div className="font-medium text-slate-900 dark:text-white truncate">{member.displayName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{member.username}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.roles.map(rId => {
                                  // Find internal role key matching this ID
                                  const roleKey = ['leaderRoleId', 'deputyLeaderRoleId', 'callerRoleId', 'mainRosterRoleId', 'trialRoleId', 'farmerRoleId', 'electricianRoleId', 'builderRoleId', 'pilotRoleId', 'vipRoleId'].find(k => config[k] === rId);
                                  if (roleKey) {
                                    const shortKey = roleKey.replace('RoleId', ''); // e.g. leader
                                    const roleName = roleNamesMap[shortKey] || shortKey;
                                    return <span key={rId} className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md">{roleName}</span>
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Статистика участников
                  </h3>
                  <button onClick={() => setStatsData(null)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Обновить
                  </button>
                </div>
                
                {!statsData ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th scope="col" className="px-6 py-3">Участник</th>
                          <th scope="col" className="px-6 py-3 text-center">Время в Voice</th>
                          <th scope="col" className="px-6 py-3 text-center">Сообщения</th>
                          <th scope="col" className="px-6 py-3 text-center">Вайпы</th>
                          <th scope="col" className="px-6 py-3 text-center">Голосования</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsData.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center">Нет данных для отображения.</td>
                          </tr>
                        ) : (
                          statsData.sort((a, b) => b.voiceTime - a.voiceTime).map(stat => (
                            <tr key={stat.userId} className="bg-white border-b dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                              <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white flex items-center">
                                <img src={stat.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="w-8 h-8 rounded-full mr-3" />
                                <div>
                                  <div className={!stat.isMember ? "text-slate-400 line-through" : ""}>{stat.displayName}</div>
                                  <div className="text-[10px] text-slate-500">@{stat.username}</div>
                                </div>
                              </th>
                              <td className="px-6 py-4 text-center font-mono">
                                {Math.floor(stat.voiceTime / 3600)}ч {Math.floor((stat.voiceTime % 3600) / 60)}м
                              </td>
                              <td className="px-6 py-4 text-center font-mono">
                                {stat.messageCount}
                              </td>
                              <td className="px-6 py-4 text-center font-mono">
                                {stat.wipesPlayed}
                              </td>
                              <td className="px-6 py-4 text-center font-mono">
                                {stat.votesCast}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (() => {
              let logCfg = { enabled: true, defaultChannelId: '', events: {} };
              try {
                if (config?.loggingConfigJson) {
                  logCfg = typeof config.loggingConfigJson === 'string' ? JSON.parse(config.loggingConfigJson) : config.loggingConfigJson;
                  if (!logCfg.events) logCfg.events = {};
                }
              } catch (e) {}

              const isMasterEnabled = logCfg.enabled !== false;
              const defaultChId = logCfg.defaultChannelId || '';
              const textChannels = (discordInfo?.channels || []).filter(c => c.type === 0);
              const defaultChObj = textChannels.find(c => c.id === defaultChId);
              const defaultChName = defaultChObj ? defaultChObj.name : '';

              const handleMasterToggle = (val) => {
                const updated = { ...logCfg, enabled: val };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleDefaultChannelChange = (val) => {
                const updated = { ...logCfg, defaultChannelId: val };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleToggleEvent = (key, val) => {
                const events = { ...(logCfg.events || {}) };
                const cur = events[key] || { enabled: true, channelId: '' };
                events[key] = { ...cur, enabled: val };
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleEventChannelChange = (key, chId) => {
                const events = { ...(logCfg.events || {}) };
                const cur = events[key] || { enabled: true, channelId: '' };
                events[key] = { ...cur, channelId: chId };
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleEnableAll = () => {
                const events = { ...(logCfg.events || {}) };
                loggingEventGroups.forEach(g => {
                  g.events.forEach(ev => {
                    const cur = events[ev.key] || { channelId: '' };
                    events[ev.key] = { ...cur, enabled: true };
                  });
                });
                const updated = { ...logCfg, events, enabled: true };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleDisableAll = () => {
                const events = { ...(logCfg.events || {}) };
                loggingEventGroups.forEach(g => {
                  g.events.forEach(ev => {
                    const cur = events[ev.key] || { channelId: '' };
                    events[ev.key] = { ...cur, enabled: false };
                  });
                });
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              const handleResetChannelsToDefault = () => {
                const events = { ...(logCfg.events || {}) };
                Object.keys(events).forEach(k => {
                  events[k] = { ...events[k], channelId: '' };
                });
                const updated = { ...logCfg, events };
                autoSaveConfig({ ...config, loggingConfigJson: JSON.stringify(updated) });
              };

              return (
                <form onSubmit={saveConfig} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-blue-500" />
                        <span>{t('clan_logs_title')}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('clan_logs_desc')}
                      </p>
                    </div>

                    {/* Master Switch */}
                    <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={isMasterEnabled}
                        onChange={e => handleMasterToggle(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {t('clan_logs_enable_master')}
                      </span>
                    </label>
                  </div>

                  {/* Default Channel Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-800/60 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/80 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{t('clan_logs_default_channel')}</span>
                          {defaultChId ? (
                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              #{defaultChName || defaultChId}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                              Не задан
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_logs_default_channel_desc')}
                        </p>
                      </div>

                      {/* 1-click Create Log Channel Button */}
                      <button
                        type="button"
                        onClick={handleCreateDiscordLogChannel}
                        disabled={creatingLogChannel}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {creatingLogChannel ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('clan_logs_creating_channel')}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>{t('clan_logs_create_channel_btn')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="max-w-md">
                      <select
                        value={defaultChId}
                        onChange={e => handleDefaultChannelChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                      >
                        <option value="">-- Выберите основной канал для логов --</option>
                        {textChannels.map(ch => (
                          <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Быстрые действия:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEnableAll}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                      >
                        {t('clan_logs_enable_all')}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisableAll}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                      >
                        {t('clan_logs_disable_all')}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetChannelsToDefault}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                      >
                        {t('clan_logs_reset_channels')}
                      </button>
                    </div>
                  </div>

                  {/* Event Groups */}
                  <div className="space-y-4">
                    {loggingEventGroups.map(group => {
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
                                <div
                                  key={ev.key}
                                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                    isEvEnabled ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-950/20 opacity-60'
                                  }`}
                                >
                                  {/* Toggle + Title */}
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isEvEnabled}
                                      onChange={e => handleToggleEvent(ev.key, e.target.checked)}
                                      className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 cursor-pointer shrink-0"
                                    />
                                    <div>
                                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{t(`clan_logs_event_${ev.key}`) || ev.title}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        {t(`clan_logs_event_${ev.key}_desc`) || ev.desc}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Channel Selector */}
                                  <div className="md:w-64 shrink-0 pl-7 md:pl-0">
                                    <select
                                      value={evChannelId}
                                      onChange={e => handleEventChannelChange(ev.key, e.target.value)}
                                      disabled={!isEvEnabled}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <option value="">
                                        {defaultChName ? `(По умолч.: #${defaultChName})` : '(По умолчанию)'}
                                      </option>
                                      {textChannels.map(ch => (
                                        <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
                </form>
              );
            })()}

            {activeTab === 'moderation' && (() => {
              let modCfg = {
                logChannelId: '',
                antiMention: {
                  enabled: true,
                  maxMentions: 5,
                  timeWindowSeconds: 10,
                  countUsers: true,
                  countRoles: true,
                  countEveryone: true,
                  action: 'timeout',
                  durationMinutes: 10,
                  autoDelete: true,
                  warnMessage: 'Массовые упоминания запрещены на этом сервере!',
                  ignoreRoles: [],
                  ignoreChannels: []
                }
              };
              try {
                if (config?.moderationConfigJson) {
                  const parsed = typeof config.moderationConfigJson === 'string' ? JSON.parse(config.moderationConfigJson) : config.moderationConfigJson;
                  modCfg = {
                    ...modCfg,
                    ...parsed,
                    antiMention: {
                      ...modCfg.antiMention,
                      ...(parsed.antiMention || {})
                    }
                  };
                }
              } catch (e) {}

              const am = modCfg.antiMention;
              const textChannels = (discordInfo?.channels || []).filter(c => c.type === 0);
              const allRoles = discordInfo?.roles || [];

              const handleUpdateAM = (field, val, immediate = true) => {
                const updated = {
                  ...modCfg,
                  antiMention: {
                    ...am,
                    [field]: val
                  }
                };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleUpdateModRoot = (field, val, immediate = true) => {
                const updated = { ...modCfg, [field]: val };
                queueAutoSave({ ...config, moderationConfigJson: JSON.stringify(updated) }, immediate);
              };

              const handleToggleRoleWhitelist = (roleId) => {
                const current = Array.isArray(am.ignoreRoles) ? [...am.ignoreRoles] : [];
                const idx = current.indexOf(roleId);
                if (idx === -1) current.push(roleId);
                else current.splice(idx, 1);
                handleUpdateAM('ignoreRoles', current, true);
              };

              const handleToggleChannelWhitelist = (chId) => {
                const current = Array.isArray(am.ignoreChannels) ? [...am.ignoreChannels] : [];
                const idx = current.indexOf(chId);
                if (idx === -1) current.push(chId);
                else current.splice(idx, 1);
                handleUpdateAM('ignoreChannels', current, true);
              };

              return (
                <form onSubmit={saveConfig} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      <span>{t('clan_mod_title')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('clan_mod_desc')}
                    </p>
                  </div>

                  {/* Anti-Mass-Mention Main Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{t('clan_mod_anti_mention_title')}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('clan_mod_anti_mention_desc')}
                        </p>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <input
                          type="checkbox"
                          checked={am.enabled !== false}
                          onChange={e => handleUpdateAM('enabled', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t('clan_mod_enable')}
                        </span>
                      </label>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_max_mentions')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_max_mentions_hint')}
                        </p>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={am.maxMentions || 5}
                          onChange={e => handleUpdateAM('maxMentions', parseInt(e.target.value, 10) || 5, false)}
                          onBlur={e => handleUpdateAM('maxMentions', parseInt(e.target.value, 10) || 5, true)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_time_window')}
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {t('clan_mod_time_window_hint')}
                        </p>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={am.timeWindowSeconds || 10}
                          onChange={e => handleUpdateAM('timeWindowSeconds', parseInt(e.target.value, 10) || 10, false)}
                          onBlur={e => handleUpdateAM('timeWindowSeconds', parseInt(e.target.value, 10) || 10, true)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* What to count checkboxes */}
                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Что учитывать при подсчете:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countUsers !== false}
                            onChange={e => handleUpdateAM('countUsers', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_users')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countRoles !== false}
                            onChange={e => handleUpdateAM('countRoles', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_roles')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={am.countEveryone !== false}
                            onChange={e => handleUpdateAM('countEveryone', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700"
                          />
                          <span>{t('clan_mod_count_everyone')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Action & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('clan_mod_action')}
                        </label>
                        <select
                          value={am.action || 'timeout'}
                          onChange={e => handleUpdateAM('action', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="warn">⚠️ {t('clan_mod_action_warn')}</option>
                          <option value="timeout">🔇 {t('clan_mod_action_timeout')}</option>
                          <option value="kick">👢 {t('clan_mod_action_kick')}</option>
                          <option value="ban">🔨 {t('clan_mod_action_ban')}</option>
                        </select>
                      </div>

                      {am.action === 'timeout' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('clan_mod_timeout_duration')}
                          </label>
                          <select
                            value={am.durationMinutes || 10}
                            onChange={e => handleUpdateAM('durationMinutes', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>{t('clan_mod_timeout_1m')}</option>
                            <option value={5}>{t('clan_mod_timeout_5m')}</option>
                            <option value={10}>{t('clan_mod_timeout_10m')}</option>
                            <option value={30}>{t('clan_mod_timeout_30m')}</option>
                            <option value={60}>{t('clan_mod_timeout_1h')}</option>
                            <option value={360}>{t('clan_mod_timeout_6h')}</option>
                            <option value={1440}>{t('clan_mod_timeout_1d')}</option>
                            <option value={10080}>{t('clan_mod_timeout_1w')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Auto-delete toggle */}
                    <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        id="amAutoDelete"
                        checked={am.autoDelete !== false}
                        onChange={e => handleUpdateAM('autoDelete', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 mr-3 cursor-pointer"
                      />
                      <label htmlFor="amAutoDelete" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                        {t('clan_mod_auto_delete')}
                      </label>
                    </div>

                    {/* Warning text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('clan_mod_warn_msg')}
                      </label>
                      <input
                        type="text"
                        value={am.warnMessage || ''}
                        placeholder={t('clan_mod_warn_msg_default')}
                        onChange={e => handleUpdateAM('warnMessage', e.target.value, false)}
                        onBlur={e => handleUpdateAM('warnMessage', e.target.value, true)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Moderation Log Channel Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('clan_mod_log_channel')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('clan_mod_log_channel_hint')}
                    </p>
                    <div className="max-w-md">
                      <select
                        value={modCfg.logChannelId || ''}
                        onChange={e => handleUpdateModRoot('logChannelId', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">(По умолчанию: основной канал логов)</option>
                        {textChannels.map(ch => (
                          <option key={ch.id} value={ch.id}>#️⃣ {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Whitelists Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Исключения (Белый список)
                    </h4>

                    {/* Roles Whitelist */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_roles')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_roles_desc')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allRoles.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Роли не загружены</span>
                        ) : (
                          allRoles.map(r => {
                            const isIgnored = Array.isArray(am.ignoreRoles) && am.ignoreRoles.includes(r.id);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => handleToggleRoleWhitelist(r.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: r.color && r.color !== '#000000' ? r.color : '#94a3b8' }}
                                ></span>
                                <span>{r.name}</span>
                                {isIgnored && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Channels Whitelist */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('clan_mod_whitelist_channels')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('clan_mod_whitelist_channels_desc')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {textChannels.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Каналы не загружены</span>
                        ) : (
                          textChannels.map(ch => {
                            const isIgnored = Array.isArray(am.ignoreChannels) && am.ignoreChannels.includes(ch.id);
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => handleToggleChannelWhitelist(ch.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isIgnored
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>#️⃣ {ch.name}</span>
                                {isIgnored && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <SaveButton saveStatus={saveStatus} onManualSave={() => flushSave()} />
                </form>
              );
            })()}
            
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium border border-red-100 dark:border-red-900/50">
          {t('clan_failed')}
        </div>
      )}
      
      {showSetupWizard && (
        <SetupWizard 
          onClose={() => setShowSetupWizard(false)}
          onConfirm={startAutoSetup}
          onManualSetup={() => {
            setShowSetupWizard(false);
            setActiveTab('roles');
          }}
        />
      )}

      {/* Role Sync Progress / Verification Modal */}
      {syncModalData && syncModalData.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              {syncModalData.isFailed ? (
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {syncModalData.isFailed 
                    ? (t('clan_sync_failed_title') || 'Ошибка синхронизации роли')
                    : (t('clan_sync_in_progress') || 'Синхронизация языка ролей...')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {syncModalData.isFailed
                    ? (t('clan_sync_failed_desc') || 'Не удалось применить новое название роли в Discord.')
                    : `${t('clan_sync_step') || 'Обработка'}: ${syncModalData.currentStep} / ${syncModalData.totalSteps}`}
                </p>
              </div>
            </div>

            {!syncModalData.isFailed ? (
              <div className="space-y-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((syncModalData.currentStep / Math.max(syncModalData.totalSteps, 1)) * 100)}%` }}
                  ></div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{t('clan_sync_current_role') || 'Роль'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{syncModalData.currentRoleName}</span>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  {t('clan_sync_verifying_hint') || 'Бот меняет имя, верифицирует изменения и в случае ошибки выполняет повторную попытку.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1.5">
                  <div className="font-semibold">{syncModalData.failedRoleName}</div>
                  <div className="font-mono text-[11px] opacity-90">{syncModalData.errorText}</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{t('clan_sync_telegram_reported') || 'Отчет об ошибке автоматически отправлен в Telegram разработчикам.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncModalData(null)}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {t('clan_sync_close') || 'Закрыть'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selective Factory Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('clan_reset_modal_title') || 'Сброс к заводским настройкам'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('clan_reset_modal_desc') || 'Выберите разделы, которые требуется сбросить'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('clan_reset_select_sections') || 'Разделы для сброса:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResetSections(['roles', 'channels', 'permissions', 'voice', 'recruitment', 'ads', 'logging', 'moderation', 'general'])}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  {t('clan_reset_select_all') || 'Выбрать все'}
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setResetSections([])}
                  className="text-slate-500 dark:text-slate-400 hover:underline font-medium cursor-pointer"
                >
                  {t('clan_reset_deselect_all') || 'Снять все'}
                </button>
              </div>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2 mb-6">
              {[
                { id: 'roles', title: t('clan_reset_sec_roles_title') || 'Роли', desc: t('clan_reset_sec_roles_desc') || 'Сброс названий, удаление кастомных ролей, восстановление стандартных ролей, снятие ID' },
                { id: 'channels', title: t('clan_reset_sec_channels_title') || 'Каналы', desc: t('clan_reset_sec_channels_desc') || 'Сброс привязок категорий и каналов' },
                { id: 'permissions', title: t('clan_reset_sec_permissions_title') || 'Права доступа', desc: t('clan_reset_sec_permissions_desc') || 'Сброс сохраненных конфигураций прав каналов' },
                { id: 'voice', title: t('clan_reset_sec_voice_title') || 'Динамический голос', desc: t('clan_reset_sec_voice_desc') || 'Отключение автокомнат, очистка ID генератора и категории' },
                { id: 'logging', title: t('clan_reset_sec_logging_title') || 'Логирование', desc: t('clan_reset_sec_logging_desc') || 'Сброс всех настроек каналов и событий аудита' },
                { id: 'moderation', title: t('clan_reset_sec_moderation_title') || 'Модерация', desc: t('clan_reset_sec_moderation_desc') || 'Сброс правил анти-спама и белых списков' },
                { id: 'recruitment', title: t('clan_reset_sec_recruitment_title') || 'Набор в клан', desc: t('clan_reset_sec_recruitment_desc') || 'Сброс вопросов анкеты и требований' },
                { id: 'ads', title: t('clan_reset_sec_ads_title') || 'Объявления', desc: t('clan_reset_sec_ads_desc') || 'Сброс настроек периодических объявлений' },
                { id: 'general', title: t('clan_reset_sec_general_title') || 'Основные данные', desc: t('clan_reset_sec_general_desc') || 'Сброс названия клана и Discord ссылки' },
              ].map(sec => {
                const isChecked = resetSections.includes(sec.id);
                return (
                  <label
                    key={sec.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                        : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) {
                          setResetSections(prev => [...prev, sec.id]);
                        } else {
                          setResetSections(prev => prev.filter(x => x !== sec.id));
                        }
                      }}
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{sec.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{sec.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {t('clan_reset_cancel') || 'Отмена'}
              </button>
              <button
                type="button"
                onClick={handleExecuteFactoryReset}
                disabled={isResetting || resetSections.length === 0}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('clan_reset_processing') || 'Сброс...'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('clan_reset_submit') || 'Сбросить выбранное'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
