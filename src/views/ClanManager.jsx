import React, { useState, useEffect } from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export default function ClanManager() {
  const { ws, status: wsStatus } = useNetwork();
  const [status, setStatus] = useState('checking'); // checking, unlinked, linked
  const [guildId, setGuildId] = useState(null);
  const [linkCode, setLinkCode] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['Initializing Clan Manager...']);
  
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (!ws || wsStatus !== 'online') {
      addLog('Waiting for active WebSocket connection...');
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
          if (data.error) setError(data.error);
          else {
            alert('Settings saved successfully!');
            setConfig(data.data.config);
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
    setError('');
    addLog(`Sending link code request: ${linkCode}`);
    ws.send(JSON.stringify({ type: 'clan', action: 'link', code: linkCode }));
  };

  const handleUnlink = () => {
    if (confirm('Are you sure you want to unlink your Clan Manager?')) {
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
    addLog('Saving config via proxy');
    ws.send(JSON.stringify({
      type: 'clan',
      action: 'proxy',
      reqId: 'update_config',
      payload: { action: 'update_config', updates: config }
    }));
  };

  const DebugLogs = () => (
    <div className="mt-8 bg-black/90 text-green-400 p-4 rounded text-xs font-mono max-h-64 overflow-y-auto">
      <div className="mb-2 font-bold text-white border-b border-gray-700 pb-1">Debug Logs</div>
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );

  if (status === 'checking') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center text-slate-500 mb-8">Connecting to server...</div>
        <DebugLogs />
      </div>
    );
  }

  if (status === 'unlinked') {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Clan Manager Setup</h2>
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          To manage your clan, you need to link this app to your Discord server.
        </p>
        <ol className="list-decimal pl-5 mb-6 text-slate-600 dark:text-slate-300 space-y-2">
          <li>Invite the Industrial Hub Bot to your Discord Server.</li>
          <li>Type <code>/hub_link</code> in any channel on your server.</li>
          <li>Enter the 6-digit code below.</li>
        </ol>
        
        <form onSubmit={handleLink} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              className="w-full px-4 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              maxLength={6}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">
            Link Server
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Clan Manager</h2>
        <button onClick={handleUnlink} className="text-red-500 hover:text-red-600 text-sm font-medium">Unlink Server</button>
      </div>
      
      {loadingConfig ? (
        <div className="text-slate-500">Loading clan settings...</div>
      ) : config ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">General Settings</h3>
            <form onSubmit={saveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clan Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={config.name || ''}
                  onChange={e => setConfig({...config, name: e.target.value})}
                  placeholder="My Rust Clan"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="recruitmentOpen"
                  className="mr-2"
                  checked={config.recruitmentOpen}
                  onChange={e => setConfig({...config, recruitmentOpen: e.target.checked})}
                />
                <label htmlFor="recruitmentOpen" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Recruitment Open
                </label>
              </div>
              
              <h4 className="font-semibold text-slate-800 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-700">Role IDs Configuration</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Enable Developer Mode in Discord to copy role IDs.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Leader Role ID</label>
                  <input type="text" className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={config.leaderRoleId || ''} onChange={e => setConfig({...config, leaderRoleId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Main Roster Role ID</label>
                  <input type="text" className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={config.mainRosterRoleId || ''} onChange={e => setConfig({...config, mainRosterRoleId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Farmer Role ID</label>
                  <input type="text" className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={config.farmerRoleId || ''} onChange={e => setConfig({...config, farmerRoleId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Builder Role ID</label>
                  <input type="text" className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={config.builderRoleId || ''} onChange={e => setConfig({...config, builderRoleId: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Clan Statistics</h3>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Coming soon: Overview of voice activity, member stats, and tickets.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-red-500">Failed to load configuration.</div>
      )}
    </div>
  );
}
