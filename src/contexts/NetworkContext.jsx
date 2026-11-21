/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkUpdates } from '../utils/SmartPatcher';
import { compareSemver } from '../utils/semver';
import { useNotification } from './NotificationContext';

const NetworkContext = createContext(null);
const electron = window.electronAPI ? window.electronAPI : null;
const SERVER_ENDPOINTS = import.meta.env.DEV
  ? ['wss://industrial-hub.duckdns.org', 'ws://127.0.0.1:8080']
  : ['wss://industrial-hub.duckdns.org'];

export const NetworkProvider = ({ children }) => {
  const { addNotification } = useNotification();
  const [status, setStatus] = useState('offline'); // connecting, online, offline
  const [hwid, setHwid] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [serverVersion, setServerVersion] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);
  const [updateLogs, setUpdateLogs] = useState([]);
  const [deferredUpdatePayload, setDeferredUpdatePayload] = useState(null);

  const addLog = (msg) => {
    if (import.meta.env.DEV) {
      console.log("[UpdateLog]", msg);
    }
    setUpdateLogs(prev => [...prev, `${new Date().toLocaleTimeString('ru-RU')}: ${msg}`]);
  };
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const currentEndpointIdxRef = useRef(0);

  useEffect(() => {
    let cleanupIpc = null;
    if (window.electronAPI && window.electronAPI.ipcRenderer && window.electronAPI.ipcRenderer.onUpdateProgress) {
      cleanupIpc = window.electronAPI.ipcRenderer.onUpdateProgress((data) => {
        setUpdateProgress(data);
      });
    }
    return () => {
      if (cleanupIpc) cleanupIpc();
    };
  }, []);

  const getDeviceId = async () => {
    if (hwid) return hwid;
    if (electron) {
      try {
        const id = await (electron.ipcRenderer.invoke('network:get-device-id').catch(() => electron.ipcRenderer.invoke('network:get-hwid')));
        setHwid(id);
        return id;
      } catch (err) {
        console.error('Failed to get installation ID via IPC', err);
      }
    }
    // Fallback for browser
    let stored = localStorage.getItem('hub_device_id') || localStorage.getItem('hub_hwid');
    if (!stored) {
      stored = crypto.randomUUID ? crypto.randomUUID() : 'browser_' + Date.now();
      localStorage.setItem('hub_device_id', stored);
    }
    setHwid(stored);
    return stored;
  };
  const getHwid = getDeviceId;

  const triggerUpdateCheck = useCallback(async () => {
    if (!electron) return;
    try {
      addLog("Starting manual triggerUpdateCheck...");
      // Fetch version from GitHub Releases API
      try {
        const { getConfigKey } = await import('../services/store');
        const channel = getConfigKey('updateChannel') || 'main';
        const repos = ['kozhaki-vik/industrial-hub', 'kozhaki-vik/industrial-hub-releases'];
        let foundVersion = null;

        for (const repo of repos) {
          const ghApiUrl = channel === 'main' 
            ? `https://api.github.com/repos/${repo}/releases/latest?t=${Date.now()}`
            : `https://api.github.com/repos/${repo}/releases?per_page=10&t=${Date.now()}`;
          const res = await fetch(ghApiUrl, { cache: 'no-store' });
          if (res.ok) {
            let data = await res.json();
            if (channel === 'test' && Array.isArray(data)) {
              const nonDrafts = data.filter(r => r && !r.draft);
              nonDrafts.sort((a, b) => {
                const va = (a.tag_name || '').replace(/^v/, '');
                const vb = (b.tag_name || '').replace(/^v/, '');
                return compareSemver(vb, va);
              });
              if (nonDrafts.length > 0 && nonDrafts[0].tag_name) {
                foundVersion = nonDrafts[0].tag_name.replace(/^v/, '');
                break;
              }
            } else if (data && !data.draft && data.tag_name) {
              foundVersion = data.tag_name.replace(/^v/, '');
              break;
            }
          }
        }
        if (foundVersion) {
          setServerVersion(foundVersion);
        }
      } catch (e) {
        addLog(`Failed fetch GitHub API: ${e.message}`);
      }
      
      addLog("Calling checkUpdates()...");
      const res = await checkUpdates(addLog);
      addLog(`checkUpdates() finished. res = ${JSON.stringify(res)}`);
      
      if (res && res.success) {
        if (res.deferredRestart) {
          setDeferredUpdatePayload(res.restartPayload);
          if (window.electronAPI && window.electronAPI.shell && window.electronAPI.shell.beep) {
            window.electronAPI.shell.beep();
          }
          setUpdateProgress({ status: 'deferred' });
        } else {
          setUpdateProgress(prev => ({ ...prev, status: 'success' }));
        }
      }
    } catch (e) {
      addLog(`triggerUpdateCheck catch: ${e.message}`);
      console.error('Update check failed:', e);
      setUpdateProgress({ status: 'error', currentFile: e.message });
    }
  }, []);

  const triggerForceUpdate = useCallback(async () => {
    if (!electron) return { success: false, error: 'Not running in Electron' };
    try {
      addLog("Starting manual triggerForceUpdate (force download & reinstall)...");
      setUpdateProgress({
        status: 'downloading',
        downloadedBytes: 0,
        totalBytes: 100,
        currentFile: 'Поиск последнего релиза...'
      });

      const res = await checkUpdates(addLog, true);
      addLog(`triggerForceUpdate() finished. res = ${JSON.stringify(res)}`);

      if (res && res.success) {
        if (res.deferredRestart) {
          setDeferredUpdatePayload(res.restartPayload);
          if (window.electronAPI && window.electronAPI.shell && window.electronAPI.shell.beep) {
            window.electronAPI.shell.beep();
          }
          setUpdateProgress({ status: 'deferred' });
        } else {
          setUpdateProgress(prev => ({ ...prev, status: 'success' }));
        }
      } else if (res && !res.success) {
        setUpdateProgress({ status: 'error', currentFile: res.error || 'Ошибка принудительного обновления' });
      }
      return res;
    } catch (e) {
      addLog(`triggerForceUpdate catch: ${e.message}`);
      console.error('Force update failed:', e);
      setUpdateProgress({ status: 'error', currentFile: e.message });
      return { success: false, error: e.message };
    }
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    const endpoint = SERVER_ENDPOINTS[currentEndpointIdxRef.current % SERVER_ENDPOINTS.length];
    const ws = new WebSocket(endpoint);
    wsRef.current = ws;

    ws.onopen = async () => {
      // Don't set status to online yet, wait for auth_success
      reconnectAttempts.current = 0;
      const currentHwid = await getHwid();
      
      let clientVersion = "unknown";
      if (electron) {
        try {
          const info = await electron.ipcRenderer.invoke('diagnostics:getAppVersionInfo');
          if (info && info.version) clientVersion = info.version;
        } catch (e) {
          console.error("Failed to get client version", e);
        }
      }
      
      ws.send(JSON.stringify({ type: 'auth', hwid: currentHwid, version: clientVersion }));

      // Send hardware telemetry only if user has not disabled it (Opt-out)
      const telemetryOptIn = localStorage.getItem('hub_telemetry_enabled') !== 'false';
      if (electron && telemetryOptIn) {
        try {
          const hardware = await electron.ipcRenderer.invoke('diagnostics:getHardwareInfo');
          ws.send(JSON.stringify({ type: 'telemetry_hardware', hardware, hwid: currentHwid }));
        } catch (e) {
          console.error('Failed to get hardware info for telemetry', e);
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'auth_success') {
          if (import.meta.env.DEV) {
            console.log('Connected to Industrial Hub Server');
          }
          setStatus('online'); // Set online only after auth is complete
          if (data.unreadCount !== undefined) setUnreadAdminCount(data.unreadCount);
          addLog("WS auth_success received, triggering check...");
          triggerUpdateCheck();
          
          // Fetch chat history
          if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'get_ticket_history' }));
        } else if (data.type === 'online_count') {
          setOnlineCount(data.count);
        } else if (data.type === 'update_available' || data.type === 'new_version' || data.type === 'force_update') {
          if (import.meta.env.DEV) {
            console.log('Real-time update notification from server WebSocket:', data);
          }
          addLog("WS update_available received, triggering check...");
          triggerUpdateCheck();
        } else if (data.type === 'assets_update') {
          if (import.meta.env.DEV) {
            console.log('Real-time assets update notification from server WebSocket');
          }
          addLog("WS assets_update received, syncing items assets...");
          if (window.electronAPI?.assets?.sync) {
            window.electronAPI.assets.sync().catch(e => console.warn('Asset sync error:', e));
          }
        } else if (data.type === 'notification') {
          if (import.meta.env.DEV) {
            console.log('Received notification from server:', data);
          }
          addNotification(data.message, data.notifType || 'info');
          setUnreadAdminCount(prev => prev + 1);
          setTicketHistory(prev => [...prev, { sender: 'admin', message: data.message, created_at: new Date().toISOString() }]);
        } else if (data.type === 'ticket_history') {
          setTicketHistory(data.history || []);
        } else {
          if (import.meta.env.DEV) {
            console.log('Message from server:', data);
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => {
      setStatus('offline');
      currentEndpointIdxRef.current++;
      scheduleReconnect();
    };

    ws.onerror = () => {
      setStatus('offline');
      // onClose will handle reconnect
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerUpdateCheck]);

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    
    // Exponential backoff: 1s, 3s, 7s, 15s (max 15s)
    let delay = 1000;
    const attempts = reconnectAttempts.current;
    if (attempts === 1) delay = 3000;
    else if (attempts === 2) delay = 7000;
    else if (attempts >= 3) delay = 15000;
    
    reconnectAttempts.current++;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  useEffect(() => {
    connect();
    
    // Heartbeat every 20 seconds
    const interval = setInterval(async () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const currentHwid = await getHwid();
        wsRef.current.send(JSON.stringify({ type: 'heartbeat', hwid: currentHwid }));
      }
    }, 20000);

    // Safety net: periodic background update check every 5 minutes
    const updateInterval = setInterval(() => {
      triggerUpdateCheck();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(updateInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically apply deferred update once Rust closes
  useEffect(() => {
    if (!deferredUpdatePayload || !electron?.config?.isRustRunning) return;

    const rustWatcher = setInterval(async () => {
      try {
        const isRustOpen = await electron.config.isRustRunning();
        if (!isRustOpen) {
          clearInterval(rustWatcher);
          addLog("Rust was closed. Automatically applying deferred update...");
          electron.ipcRenderer.invoke('network:apply-deferred-update', deferredUpdatePayload);
        }
      } catch (e) {
        console.error("Error checking Rust status for deferred update:", e);
      }
    }, 10000);

    return () => clearInterval(rustWatcher);
  }, [deferredUpdatePayload]);

  const sendTelemetry = useCallback((data) => {
    if (localStorage.getItem('hub_telemetry_enabled') === 'false') {
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'telemetry', ...data }));
    }
  }, []);

  const [ticketHistory, setTicketHistory] = useState([]);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);

  const createTicket = useCallback((message, logs = "", image_data = null) => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return reject(new Error("Server offline"));
      }

      const ticketHandler = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ticket_success') {
            wsRef.current.removeEventListener('message', ticketHandler);
            resolve(data.ticket_id);
          } else if (data.type === 'ticket_error') {
            wsRef.current.removeEventListener('message', ticketHandler);
            reject(new Error(data.message));
          }
        } catch {}
      };

      wsRef.current.addEventListener('message', ticketHandler);
      wsRef.current.send(JSON.stringify({ type: 'ticket', message, logs, image_data }));
      
      // Optimizaton: eagerly add to local history for instant feedback
      setTicketHistory(prev => [...prev, { sender: 'user', message, image_data, created_at: new Date().toISOString() }]);
      
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', ticketHandler);
        reject(new Error("Timeout waiting for server"));
      }, 10000);
    });
  }, []);

  const getTicketHistory = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_ticket_history' }));
    }
  }, []);

  const markTicketsRead = useCallback(() => {
    setUnreadAdminCount(0);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mark_tickets_read' }));
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ ws: wsRef.current, status, onlineCount, serverVersion, updateProgress, updateLogs, addLog, triggerUpdateCheck, triggerForceUpdate, sendTelemetry, createTicket, ticketHistory, setTicketHistory, getTicketHistory, unreadAdminCount, setUnreadAdminCount, markTicketsRead, deferredUpdatePayload }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
