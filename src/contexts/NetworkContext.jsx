import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkUpdates } from '../utils/SmartPatcher';
import { useNotification } from './NotificationContext';

const NetworkContext = createContext(null);
const electron = window.electronAPI ? window.electronAPI : null;
const SERVER_ENDPOINTS = [
  'wss://industrial-hub.duckdns.org',
  'ws://industrial-hub.duckdns.org',
  'ws://industrial-hub.duckdns.org:8080',
  'ws://industrial-hub.duckdns.org:80'
];

export const NetworkProvider = ({ children }) => {
  const { addNotification } = useNotification();
  const [status, setStatus] = useState('offline'); // connecting, online, offline
  const [hwid, setHwid] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [serverVersion, setServerVersion] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);
  const [updateLogs, setUpdateLogs] = useState([]);

  const addLog = (msg) => {
    console.log("[UpdateLog]", msg);
    setUpdateLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${msg}`]);
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

  const getHwid = async () => {
    if (hwid) return hwid;
    if (electron) {
      try {
        const id = await electron.ipcRenderer.invoke('network:get-hwid');
        setHwid(id);
        return id;
      } catch (err) {
        console.error('Failed to get HWID via IPC', err);
      }
    }
    // Fallback for browser
    let stored = localStorage.getItem('hub_hwid');
    if (!stored) {
      stored = crypto.randomUUID ? crypto.randomUUID() : 'browser_' + Date.now();
      localStorage.setItem('hub_hwid', stored);
    }
    setHwid(stored);
    return stored;
  };

  const triggerUpdateCheck = useCallback(async () => {
    if (!electron) return;
    try {
      addLog("Starting manual triggerUpdateCheck...");
      // First manually fetch version.json to get serverVersion
      const endpoints = [
        "https://industrial-hub.industrial-hub.duckdns.org",
        "https://industrial-hub.duckdns.org", 
        "http://industrial-hub.duckdns.org:8080"
      ];
      for (const url of endpoints) {
        try {
          addLog(`Fetching version from ${url}...`);
          const cb = `?t=${Date.now()}`;
          let vRes = await fetch(`${url}/updates/version.json${cb}`, { cache: 'no-store' });
          if (!vRes.ok) vRes = await fetch(`${url}/version.json${cb}`, { cache: 'no-store' });
          if (vRes.ok) {
            const vData = await vRes.json();
            if (vData && vData.version) {
              setServerVersion(vData.version);
              addLog(`Got serverVersion ${vData.version} from ${url}`);
              break;
            }
          }
        } catch (e) {
          addLog(`Failed fetch ${url}: ${e.message}`);
        }
      }
      
      addLog("Calling checkUpdates()...");
      const res = await checkUpdates(addLog);
      addLog(`checkUpdates() finished. res = ${JSON.stringify(res)}`);
      
      if (res && res.success) {
        setUpdateProgress(prev => ({ ...prev, status: 'success' }));
      }
    } catch (e) {
      addLog(`triggerUpdateCheck catch: ${e.message}`);
      console.error('Update check failed:', e);
      setUpdateProgress({ status: 'error', currentFile: e.message });
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
      setStatus('online');
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

      // Send hardware telemetry
      if (electron) {
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
          console.log('Connected to Industrial Hub Server, serverVersion =', data.serverVersion);
          setServerVersion(data.serverVersion);
          addLog("WS auth_success received, triggering check...");
          triggerUpdateCheck();
        } else if (data.type === 'online_count') {
          setOnlineCount(data.count);
        } else if (data.type === 'update_available' || data.type === 'new_version' || data.type === 'force_update') {
          console.log('Real-time update notification from server WebSocket:', data);
          addLog("WS update_available received, triggering check...");
          triggerUpdateCheck();
        } else if (data.type === 'notification') {
          console.log('Received notification from server:', data);
          addNotification(data.message, data.notifType || 'info');
        } else {
          console.log('Message from server:', data);
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
  }, [hwid, triggerUpdateCheck]);

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
    
    // Heartbeat every minute
    const interval = setInterval(async () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const currentHwid = await getHwid();
        wsRef.current.send(JSON.stringify({ type: 'heartbeat', hwid: currentHwid }));
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendTelemetry = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'telemetry', ...data }));
    }
  }, []);

  const createTicket = useCallback((message, logs = "") => {
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
        } catch (err) {}
      };

      wsRef.current.addEventListener('message', ticketHandler);
      wsRef.current.send(JSON.stringify({ type: 'ticket', message, logs }));
      
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', ticketHandler);
        reject(new Error("Timeout waiting for server"));
      }, 10000);
    });
  }, []);

  return (
    <NetworkContext.Provider value={{ status, onlineCount, serverVersion, updateProgress, updateLogs, addLog, triggerUpdateCheck, sendTelemetry, createTicket }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
