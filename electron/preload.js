const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, val) => ipcRenderer.invoke('store:set', key, val),
    clear: () => ipcRenderer.invoke('store:clear'),
    getAll: () => ipcRenderer.invoke('store:getAll')
  },
  autoDetectRustPath: () => ipcRenderer.invoke('autoDetectRustPath'),
  browseForRustPath: () => ipcRenderer.invoke('browseForRustPath'),
  app: {
    relaunch: () => ipcRenderer.invoke('app:relaunch'),
    reportError: (err) => ipcRenderer.invoke('app:reportError', err),
    getAutoStart: () => ipcRenderer.invoke('app:getAutoStart'),
    setAutoStart: (enabled) => ipcRenderer.invoke('app:setAutoStart', enabled),
    getStartMinimizedToTray: () => ipcRenderer.invoke('app:getStartMinimizedToTray'),
    setStartMinimizedToTray: (val) => ipcRenderer.invoke('app:setStartMinimizedToTray', val)
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
    registerShortcut: (vkCode) => ipcRenderer.invoke('gamma:registerShortcut', vkCode),
    unregisterShortcut: () => ipcRenderer.invoke('gamma:unregisterShortcut'),
    registerHook: (vkCode) => ipcRenderer.invoke('gamma:registerShortcut', vkCode),
    unregisterHook: () => ipcRenderer.invoke('gamma:unregisterShortcut'),
    onHotkey: (callback) => {
      const wrapped = () => callback();
      ipcRenderer.on('gamma:hotkey_pressed', wrapped);
      return () => ipcRenderer.removeListener('gamma:hotkey_pressed', wrapped);
    }
  },
  assets: {
    sync: () => ipcRenderer.invoke('assets:sync')
  },
  dev: {
    saveKey: (key) => ipcRenderer.invoke('dev:saveKey', key),
    getKey: () => ipcRenderer.invoke('dev:getKey'),
    hasKey: () => ipcRenderer.invoke('dev:hasKey'),
    removeKey: () => ipcRenderer.invoke('dev:removeKey'),
    signChallenge: (payload) => ipcRenderer.invoke('dev:signChallenge', payload)
  },
  ipcRenderer: {
    invoke: (channel, ...args) => {
        const ALLOWED_CHANNELS = [
            'network:get-hwid', 'network:get-device-id', 'network:apply-exe-update', 'network:apply-deferred-update',
            'gamma:registerShortcut', 'gamma:unregisterShortcut',
            'diagnostics:getAppVersionInfo', 'diagnostics:getHardwareInfo',
            'diagnostics:getAppPath', 'diagnostics:getAppDataPath',
            'diagnostics:checkAppIntegrity', 'diagnostics:checkRustIntegrity',
            'diagnostics:pingUrl',
            'shell:openExternal', 'shell:openPath', 'shell:openFolder', 'shell:beep',
            'app:relaunch', 'app:focusWindow', 'app:reportError',
            'app:getAutoStart', 'app:setAutoStart',
            'app:getMinimizeToTray', 'app:setMinimizeToTray',
            'app:getStartMinimizedToTray', 'app:setStartMinimizedToTray',
            'assets:sync',
            'logs:openFolder', 'logs:getRecent',
            'dev:saveKey', 'dev:getKey', 'dev:hasKey', 'dev:removeKey', 'dev:signChallenge'
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
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
    beep: () => ipcRenderer.invoke('shell:beep')
  }
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Industrial Hub Preload loaded');
});
