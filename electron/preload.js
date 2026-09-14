const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, val) => ipcRenderer.invoke('store:set', key, val),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    getAll: () => ipcRenderer.invoke('store:getAll')
  },
  autoDetectRustPath: () => ipcRenderer.invoke('autoDetectRustPath'),
  browseForRustPath: () => ipcRenderer.invoke('browseForRustPath'),
  app: {
    relaunch: () => ipcRenderer.invoke('app:relaunch'),
    reportError: (err) => ipcRenderer.invoke('app:reportError', err),
    focusWindow: () => ipcRenderer.invoke('app:focusWindow')
  },
  logs: {
    openFolder: () => ipcRenderer.invoke('logs:openFolder'),
    getRecent: () => ipcRenderer.invoke('logs:getRecent')
  },
  diagnostics: {
    pingUrl: (url) => ipcRenderer.invoke('diagnostics:pingUrl', url),
    getHardwareInfo: () => ipcRenderer.invoke('diagnostics:getHardwareInfo'),
    getAppPath: () => ipcRenderer.invoke('diagnostics:getAppPath'),
    getAppDataPath: () => ipcRenderer.invoke('diagnostics:getAppDataPath'),
    getAppVersionInfo: () => ipcRenderer.invoke('diagnostics:getAppVersionInfo'),
    checkAppIntegrity: () => ipcRenderer.invoke('diagnostics:checkAppIntegrity'),
    checkRustIntegrity: (rustPath) => ipcRenderer.invoke('diagnostics:checkRustIntegrity', rustPath)
  },
  config: {
    readConfig: (rustPath, filename) => ipcRenderer.invoke('config:readConfig', rustPath, filename),
    writeConfig: (rustPath, filename, content) => ipcRenderer.invoke('config:writeConfig', rustPath, filename, content),
    isRustRunning: () => ipcRenderer.invoke('config:isRustRunning'),
    fileExists: (fullPath) => ipcRenderer.invoke('config:fileExists', fullPath),
    copyFile: (src, dest) => ipcRenderer.invoke('config:copyFile', src, dest),
    ensureDir: (dirPath) => ipcRenderer.invoke('config:ensureDir', dirPath)
  },
  gamma: {
    getDisplays: () => ipcRenderer.invoke('gamma:getDisplays'),
    setDisplayGamma: (brightness, deviceName) => ipcRenderer.invoke('gamma:setDisplayGamma', brightness, deviceName),
    registerHook: (vkCode) => ipcRenderer.invoke('gamma:registerHook', vkCode),
    unregisterHook: () => ipcRenderer.invoke('gamma:unregisterHook'),
    onHotkey: (callback) => {
      const wrapped = () => callback();
      ipcRenderer.on('gamma:hotkey_pressed', wrapped);
      return () => ipcRenderer.removeListener('gamma:hotkey_pressed', wrapped);
    }
  },
  assets: {
    sync: () => ipcRenderer.invoke('assets:sync'),
    onProgress: (callback) => {
      const wrapped = (event, data) => callback(data);
      ipcRenderer.on('assets:sync-progress', wrapped);
      return () => ipcRenderer.removeListener('assets:sync-progress', wrapped);
    }
  },
  ipcRenderer: {
    invoke: (channel, ...args) => {
        const ALLOWED_CHANNELS = [
            'network:get-hwid', 'network:apply-updates', 'network:apply-exe-update',
            'diagnostics:getAppVersionInfo', 'diagnostics:getHardwareInfo',
            'diagnostics:getAppPath', 'diagnostics:getAppDataPath',
            'diagnostics:checkAppIntegrity', 'diagnostics:checkRustIntegrity',
            'diagnostics:pingUrl',
            'app:relaunch', 'app:focusWindow', 'app:reportError',
            'assets:sync',
            'logs:openFolder', 'logs:getRecent'
        ];
        if (!ALLOWED_CHANNELS.includes(channel)) {
            console.error(`Blocked IPC invoke to unauthorized channel: ${channel}`);
            return Promise.reject(new Error('Unauthorized IPC channel'));
        }
        return ipcRenderer.invoke(channel, ...args);
    },
    onUpdateProgress: (callback) => {
      const wrapped = (event, data) => callback(data);
      ipcRenderer.on('update-progress', wrapped);
      return () => ipcRenderer.removeListener('update-progress', wrapped);
    }
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path)
  }
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Industrial Hub Preload loaded');
});
