const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  autoDetectRustPath: () => ipcRenderer.invoke('autoDetectRustPath'),
  browseForRustPath: () => ipcRenderer.invoke('browseForRustPath'),
  diagnostics: {
    pingUrl: (url) => ipcRenderer.invoke('diagnostics:pingUrl', url),
    getHardwareInfo: () => ipcRenderer.invoke('diagnostics:getHardwareInfo'),
    getAppPath: () => ipcRenderer.invoke('diagnostics:getAppPath'),
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
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    onUpdateProgress: (callback) => {
      const wrapped = (event, data) => callback(data);
      ipcRenderer.on('update-progress', wrapped);
      return () => ipcRenderer.removeListener('update-progress', wrapped);
    }
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  }
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Industrial Hub Preload loaded');
});
