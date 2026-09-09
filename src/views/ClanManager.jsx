import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { useTranslation } from 'react-i18next';
import SetupWizard from '../components/SetupWizard';
import RoleSelect from '../components/RoleSelect';
import ChannelSelect from '../components/ChannelSelect';

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

  return hasRoles || hasChannels;
};

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
  const hasPromptedRef = useRef(false);

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
            setConfig(fetchedConfig);
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
            setConfig(data.data.config);
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'auto_setup') {
          if (data.error || (data.data && data.data.error)) {
            setError(data.error || data.data.error);
            setSaveStatus(`error: ${data.error || data.data.error}`);
          } else {
            setSaveStatus('success');
            if (data.data.discordInfo) setDiscordInfo(data.data.discordInfo);
            if (data.data.config) setConfig(data.data.config);
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
        }
      } catch (err) {}
    };

    ws.addEventListener('message', handleMessage);
    ws.send(JSON.stringify({ type: 'clan', action: 'get_status' }));
    
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, wsStatus]);

  const handleLink = (e) => {
    e.preventDefault();
    if (!linkCode.trim()) return;
    
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
  
  const saveConfig = (e) => {
    e.preventDefault();
    
    setSaveStatus('saving');
    ws.send(JSON.stringify({ 
      type: 'clan', 
      action: 'proxy', 
      reqId: 'update_config', 
      payload: {
        action: 'update_config',
        updates: config
      }
    }));
    addLog('Saving config...');
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') return;
    if (activeTab === 'roster' && !rosterData) {
      addLog('Fetching roster via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_roster', payload: { action: 'get_roster' } }));
    } else if (activeTab === 'stats' && !statsData) {
      addLog('Fetching stats via proxy');
      ws.send(JSON.stringify({ type: 'clan', action: 'proxy', reqId: 'get_stats', payload: { action: 'get_stats' } }));
    } else if ((activeTab === 'roles' || activeTab === 'channels' || activeTab === 'permissions') && !discordInfo) {
      fetchDiscordInfo();
    }
  }, [activeTab, ws, wsStatus, rosterData, statsData, discordInfo]);

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
          
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <input 
                type="text" 
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
    { id: 'general', label: 'Основное' },
    { id: 'roles', label: 'Роли' },
    { id: 'channels', label: 'Каналы' },
    { id: 'permissions', label: 'Права Доступа' },
    { id: 'recruitment', label: 'Наборы' },
    { id: 'votes', label: 'Голосования' },
    { id: 'ads', label: 'Реклама' },
    { id: 'roster', label: 'Состав' },
    { id: 'stats', label: 'Статистика' },
  ];

  const SaveButton = () => {
    const isError = saveStatus && saveStatus.startsWith('error');
    const isLoading = saveStatus === 'saving' || saveStatus === 'loading';
    return (
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
        <button 
          type="submit" 
          disabled={isLoading}
          className={`flex items-center justify-center font-medium py-2.5 px-4 rounded-xl w-full transition-all shadow-sm focus:ring-4 ${
            saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500/20' :
            isError ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/20' :
            'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
          } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> {saveStatus === 'loading' ? 'Обработка...' : 'Сохранение...'}</>
          ) : saveStatus === 'success' ? (
            <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Успешно</>
          ) : isError ? (
            <><svg className="w-5 h-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> <span className="truncate">{saveStatus.replace('error:', 'Ошибка:')}</span></>
          ) : (
            "Сохранить настройки"
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('clan_manager_title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('clan_manager_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSetupWizard(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            {t('clan_wizard_btn')}
          </button>
          <button onClick={handleUnlink} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {t('clan_unlink_btn')}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            
            {activeTab === 'general' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Основные настройки
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Название клана</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                    value={config.name || ''}
                    onChange={e => setConfig({...config, name: e.target.value})}
                    placeholder="Например: GODS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Основная ссылка на Discord</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                    value={config.discordLink || ''}
                    onChange={e => setConfig({...config, discordLink: e.target.value})}
                    placeholder="https://discord.gg/..."
                  />
                </div>
                
                <div className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <input 
                    type="checkbox" 
                    id="recruitmentOpen"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3"
                    checked={config.recruitmentOpen}
                    onChange={e => setConfig({...config, recruitmentOpen: e.target.checked})}
                  />
                  <label htmlFor="recruitmentOpen" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                    Набор в клан открыт (Позволяет создавать тикеты заявок)
                  </label>
                </div>
                
                <SaveButton />
              </form>
            )}

            {activeTab === 'roles' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Настройки ролей
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Вы можете переименовать роли для отображения в панелях и привязать их к реальным ID ролей в Discord.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    let roleNames = {};
                    try {
                      roleNames = config.roleNamesJson ? JSON.parse(config.roleNamesJson) : {};
                    } catch(e) {}
                    
                    const updateRoleName = (key, val) => {
                      const newNames = { ...roleNames, [key]: val };
                      setConfig({ ...config, roleNamesJson: JSON.stringify(newNames) });
                    };
                    
                    const handleIdChange = (key, val) => {
                      setConfig({ ...config, [key]: val.replace(/\D/g, '').slice(0, 20) });
                    };
                    
                    const roles = [
                      { key: 'leader', dbKey: 'leaderRoleId', defaultName: 'Лидер' },
                      { key: 'deputy', dbKey: 'deputyLeaderRoleId', defaultName: 'Зам. Лидера' },
                      { key: 'caller', dbKey: 'callerRoleId', defaultName: 'Коллер' },
                      { key: 'main', dbKey: 'mainRosterRoleId', defaultName: 'Main Состав' },
                      { key: 'trial', dbKey: 'trialRoleId', defaultName: 'Испытательный' },
                      { key: 'farmer', dbKey: 'farmerRoleId', defaultName: 'Фармер' },
                      { key: 'electrician', dbKey: 'electricianRoleId', defaultName: 'Электрик' },
                      { key: 'builder', dbKey: 'builderRoleId', defaultName: 'Билдер' },
                      { key: 'pilot', dbKey: 'pilotRoleId', defaultName: 'Пилот' },
                      { key: 'vip', dbKey: 'vipRoleId', defaultName: 'VIP' },
                    ];
                    
                    return roles.map(r => (
                      <div key={r.key} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-slate-500">Название роли (в боте)</label>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-colors"
                            value={roleNames[r.key] !== undefined ? roleNames[r.key] : r.defaultName}
                            onChange={e => updateRoleName(r.key, e.target.value)}
                            placeholder={r.defaultName}
                          />
                          <RoleSelect
                            label="Роль в Discord"
                            description=""
                            value={config[r.dbKey] || ''}
                            onChange={val => handleIdChange(r.dbKey, val)}
                            discordRoles={discordInfo?.roles || []}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                
                <SaveButton />
              </form>
            )}

            {activeTab === 'channels' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-4xl">
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
                    setConfig({ ...config, channelsConfigJson: JSON.stringify(newConfig) });
                  };
                  
                  const channelsList = [
                    { key: 'ticketsCategory', label: 'Категория для тикетов', desc: 'Здесь бот будет создавать приватные каналы тикетов заявок.', typeFilter: 4 },
                    { key: 'logs', label: 'Канал логов', desc: 'Сюда бот будет отправлять логи действий, выходов, ошибок.', typeFilter: [0, 2] },
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
                
                <SaveButton />
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
                    const channelId = cConfig[channelKey];
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
                    setConfig({ ...config, channelsConfigJson: JSON.stringify(newConfig) });
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
                                  const cId = cConfig[cKey];
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
                  <SaveButton />
                </div>
              </div>
            )}

            {activeTab === 'recruitment' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-2xl">
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
                  
                  const updateRConfig = (key, val) => {
                    const newConfig = { ...rConfig, [key]: val };
                    setConfig({ ...config, recruitmentConfigJson: JSON.stringify(newConfig) });
                  };
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на Discord сервер (для набора)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.link}
                          onChange={e => updateRConfig('link', e.target.value)}
                          placeholder="https://discord.gg/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на баннер (Изображение)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.banner}
                          onChange={e => updateRConfig('banner', e.target.value)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Заголовок Embed-сообщения</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={rConfig.title}
                          onChange={e => updateRConfig('title', e.target.value)}
                          placeholder="Набор в клан GODS"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст с требованиями (Markdown поддерживается)</label>
                        <textarea 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[200px]"
                          value={rConfig.text}
                          onChange={e => updateRConfig('text', e.target.value)}
                          placeholder="Опишите требования..."
                        ></textarea>
                      </div>
                    </>
                  );
                })()}
                
                <SaveButton />
              </form>
            )}

            {activeTab === 'votes' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-4xl">
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
                  
                  const updateTemplate = (index, key, val) => {
                    const newTemplates = [...wTemplates];
                    newTemplates[index] = { ...newTemplates[index], [key]: val };
                    setConfig({ ...config, wipeTemplatesJson: JSON.stringify(newTemplates) });
                  };

                  const addTemplate = () => {
                    const newTemplates = [...wTemplates, { name: '', day: 'Четверг', time: '16:00', ip: '', banner: '' }];
                    setConfig({ ...config, wipeTemplatesJson: JSON.stringify(newTemplates) });
                  };

                  const removeTemplate = (index) => {
                    const newTemplates = wTemplates.filter((_, i) => i !== index);
                    setConfig({ ...config, wipeTemplatesJson: JSON.stringify(newTemplates) });
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
                              <label className="block text-xs font-medium text-slate-500 mb-1">Название сервера</label>
                              <input type="text" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={tpl.name || ''} onChange={e => updateTemplate(index, 'name', e.target.value)} placeholder="Rustoria Main" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">День вайпа</label>
                              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={tpl.day || 'Четверг'} onChange={e => updateTemplate(index, 'day', e.target.value)}>
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
                              <input type="text" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={tpl.time || ''} onChange={e => updateTemplate(index, 'time', e.target.value)} placeholder="16:00" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">IP (connect ...)</label>
                              <input type="text" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={tpl.ip || ''} onChange={e => updateTemplate(index, 'ip', e.target.value)} placeholder="connect 127.0.0.1:28015" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-500 mb-1">Ссылка на баннер</label>
                              <input type="text" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={tpl.banner || ''} onChange={e => updateTemplate(index, 'banner', e.target.value)} placeholder="https://i.imgur.com/..." />
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
                
                <SaveButton />
              </form>
            )}

            {activeTab === 'ads' && (
              <form onSubmit={saveConfig} className="space-y-6 max-w-2xl">
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
                  
                  const updateAConfig = (key, val) => {
                    const newConfig = { ...aConfig, [key]: val };
                    setConfig({ ...config, adConfigJson: JSON.stringify(newConfig) });
                  };
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Заголовок Embed-сообщения</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.title}
                          onChange={e => updateAConfig('title', e.target.value)}
                          placeholder="Покупка рекламы"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Текст</label>
                        <textarea 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow min-h-[100px]"
                          value={aConfig.text}
                          onChange={e => updateAConfig('text', e.target.value)}
                          placeholder="Информация о рекламе..."
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на Прайс-лист (Telegraph / Сайт)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.priceLink}
                          onChange={e => updateAConfig('priceLink', e.target.value)}
                          placeholder="https://telegra.ph/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ссылка на баннер (Изображение)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                          value={aConfig.banner}
                          onChange={e => updateAConfig('banner', e.target.value)}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>
                    </>
                  );
                })()}
                
                <SaveButton />
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
    </div>
  );
}
