import React, { useState, useEffect } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { useTranslation } from 'react-i18next';

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
          }
        } else if (data.type === 'clan_link_res') {
          if (data.success) {
            setStatus('linked');
            setGuildId(data.guildId);
            fetchConfig();
          } else {
            setError(data.error || 'Failed to link');
          }
        } else if (data.type === 'clan_unlink_res') {
          setStatus('unlinked');
          setGuildId(null);
          setConfig(null);
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'get_config') {
          setLoadingConfig(false);
          if (data.error) setError(data.error);
          else setConfig(data.data.config);
        } else if (data.type === 'clan_proxy_res' && data.reqId === 'update_config') {
          if (data.error) {
            setError(data.error);
            setSaveStatus('error');
          } else {
            setSaveStatus('success');
            setConfig(data.data.config);
            setTimeout(() => setSaveStatus(null), 3000);
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
    addLog(`Sending link code request: ${linkCode}`);
    ws.send(JSON.stringify({ type: 'clan', action: 'link', code: linkCode }));
  };

  const handleUnlink = () => {
    if (window.confirm('Are you sure you want to unlink your Clan Manager?')) {
      addLog('Sending unlink request');
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
    { id: 'recruitment', label: 'Наборы' },
    { id: 'votes', label: 'Голосования' },
    { id: 'ads', label: 'Реклама' },
    { id: 'roster', label: 'Состав' },
    { id: 'stats', label: 'Статистика' },
  ];

  const SaveButton = () => (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
      <button 
        type="submit" 
        disabled={saveStatus === 'saving'}
        className={`flex items-center justify-center font-medium py-2.5 px-4 rounded-xl w-full transition-all shadow-sm focus:ring-4 ${
          saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500/20' :
          saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/20' :
          'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
        } ${saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {saveStatus === 'saving' ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Сохранение...</>
        ) : saveStatus === 'success' ? (
          <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Успешно</>
        ) : saveStatus === 'error' ? (
          <><svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Ошибка</>
        ) : (
          "Сохранить настройки"
        )}
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('clan_manager_title')}</h2>
        </div>
        <button onClick={handleUnlink} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {t('clan_unlink_btn')}
        </button>
      </div>
      
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
                          <label className="text-xs font-medium text-slate-500 mt-2">ID роли (в Discord)</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors font-mono" 
                            value={config[r.dbKey] || ''} 
                            onChange={e => handleIdChange(r.dbKey, e.target.value)} 
                            placeholder="Например: 1109033285741002752" 
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
                  Настройки каналов (ID)
                </h3>
                
                {(() => {
                  let cConfig = {};
                  try {
                    if (config.channelsConfigJson) {
                      cConfig = JSON.parse(config.channelsConfigJson);
                    }
                  } catch(e) {}
                  
                  const updateCConfig = (key, val) => {
                    const newConfig = { ...cConfig, [key]: val.replace(/\D/g, '').slice(0, 20) };
                    setConfig({ ...config, channelsConfigJson: JSON.stringify(newConfig) });
                  };
                  
                  const channels = [
                    { key: 'logs', label: 'Канал для логов', desc: 'Сюда бот будет отправлять логи действий, предупреждений, входов/выходов.' },
                    { key: 'ticketsCategory', label: 'Категория тикетов', desc: 'ID категории, в которой будут создаваться приватные каналы тикетов.' },
                    { key: 'applications', label: 'Канал для одобренных заявок', desc: 'Сюда будут пересылаться одобренные заявки из тикетов.' },
                    { key: 'leaderboard', label: 'Канал для Лидерборда', desc: 'Канал, где будет публиковаться и обновляться статистика (топ по часам и т.д.).' },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {channels.map(c => (
                         <div key={c.key} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
                           <div className="flex flex-col gap-2">
                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.label}</label>
                             <p className="text-[10px] text-slate-500 leading-tight mb-1 h-6">{c.desc}</p>
                             <input 
                               type="text" 
                               className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors font-mono" 
                               value={cConfig[c.key] || ''} 
                               onChange={e => updateCConfig(c.key, e.target.value)} 
                               placeholder="ID Канала/Категории" 
                             />
                           </div>
                         </div>
                      ))}
                    </div>
                  );
                })()}
                
                <SaveButton />
              </form>
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Состав клана</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Раздел состава находится в стадии активной разработки. В будущем здесь будет отображаться список всех подтвержденных участников.
                </p>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Статистика</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Статистика голосований, времени в войсе и сообщений будет доступна в следующем обновлении.
                </p>
              </div>
            )}
            
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium border border-red-100 dark:border-red-900/50">
          {t('clan_failed')}
        </div>
      )}
    </div>
  );
}
