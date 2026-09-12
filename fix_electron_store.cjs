const fs = require('fs');

// 1. electron/main.js
let p = 'electron/main.js';
let content = fs.readFileSync(p, 'utf8');

if (!content.includes('electron-store')) {
    // Add electron-store
    content = content.replace(/const path = require\('path'\);/, "const path = require('path');\nconst Store = require('electron-store');\nconst store = new Store();");

    // Add IPC handlers for store
    const storeHandlers = `
  ipcMain.handle('store:get', (event, key) => store.get(key));
  ipcMain.handle('store:set', (event, key, val) => store.set(key, val));
  ipcMain.handle('store:delete', (event, key) => store.delete(key));
  ipcMain.handle('store:clear', () => store.clear());
  ipcMain.handle('store:getAll', () => store.store);
  `;
    content = content.replace(/ipcMain\.handle\('autoDetectRustPath'/g, storeHandlers + "\n  ipcMain.handle('autoDetectRustPath'");
    
    // Also fix rejectUnauthorized
    content = content.replace(/rejectUnauthorized:\s*false/g, 'rejectUnauthorized: true');

    // Also fix copyFile and ensureDir
    // Since rustPath is now in store, we can use it! Wait, we can get it from store in main.js.
    content = content.replace(/ipcMain\.handle\('config:copyFile', \(event, srcPath, destPath\) => \{/g, 
`  ipcMain.handle('config:copyFile', (event, srcPath, destPath) => {
    try {
      const rustPath = store.get('rustPath') || '';
      if (!rustPath || !path.resolve(srcPath).startsWith(path.resolve(rustPath)) || !path.resolve(destPath).startsWith(path.resolve(rustPath))) {
        throw new Error('Path traversal detected');
      }`);

    content = content.replace(/ipcMain\.handle\('config:ensureDir', \(event, dirPath\) => \{/g,
`  ipcMain.handle('config:ensureDir', (event, dirPath) => {
    try {
      const rustPath = store.get('rustPath') || '';
      if (!rustPath || !path.resolve(dirPath).startsWith(path.resolve(rustPath))) {
        throw new Error('Path traversal detected');
      }`);

    content = content.replace(/ipcMain\.handle\('config:writeConfig', \(event, rustPath, filename, content\) => \{/g,
`  ipcMain.handle('config:writeConfig', (event, rustPath, filename, content) => {
    if (!rustPath || !filename) return false;
    try {
      let cfgDir = path.join(rustPath, 'cfg');
      if (path.basename(rustPath).toLowerCase() === 'cfg') cfgDir = rustPath;
      const cfgPath = path.join(cfgDir, filename);
      if (!path.resolve(cfgPath).startsWith(path.resolve(cfgDir))) throw new Error('Path traversal detected');
      if (!fs.existsSync(cfgDir)) fs.mkdirSync(cfgDir, { recursive: true });
      fs.writeFileSync(cfgPath, content, 'utf8');
      return true;
    } catch (e) { console.error(e); return false; }
  }); // replaced writeConfig `);

    fs.writeFileSync(p, content);
}

// 2. preload.js
p = 'electron/preload.js';
content = fs.readFileSync(p, 'utf8');
if (!content.includes('store: {')) {
    content = content.replace(/contextBridge\.exposeInMainWorld\('electronAPI', \{/,
`contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, val) => ipcRenderer.invoke('store:set', key, val),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    getAll: () => ipcRenderer.invoke('store:getAll')
  },`);
    fs.writeFileSync(p, content);
}

// 3. store.js
p = 'src/services/store.js';
content = `// Refactored to use electron-store via IPC
let currentConfig = {
  theme: 'dark',
  language: 'ru',
  rustPath: '',
  templates: [],
  telemetry: {},
  setupCompleted: false,
  visitedTabs: []
};

// We make these async if we want real-time read, but since React expects synchronous config, 
// we fetch all upfront and then keep local state synced.
let isLoaded = false;

// Initialize config synchronously from localStorage as fallback, then override later if electron
if (localStorage.getItem('industrial-hub-config')) {
  try {
    currentConfig = { ...currentConfig, ...JSON.parse(localStorage.getItem('industrial-hub-config')) };
  } catch (e) {}
}

export const loadConfigAsync = async () => {
  if (window.electronAPI?.store) {
    const all = await window.electronAPI.store.getAll();
    if (all && Object.keys(all).length > 0) {
      currentConfig = { ...currentConfig, ...all };
    }
  }
  isLoaded = true;
  return currentConfig;
};

// Load config synchronously (returns cached)
export const loadConfig = () => {
  return currentConfig;
};

// Save config synchronously to memory, async to store
export const saveConfig = (newConfig) => {
  currentConfig = { ...currentConfig, ...newConfig };
  
  if (window.electronAPI?.store) {
    for (const [k, v] of Object.entries(newConfig)) {
      window.electronAPI.store.set(k, v);
    }
  } else {
    localStorage.setItem('industrial-hub-config', JSON.stringify(currentConfig));
  }
  return true;
};

// Helper for specific keys
export const setConfigKey = (key, value) => {
  if (key === 'rustPath' && typeof value === 'string') {
    let sanitized = value.trim();
    const lower = sanitized.toLowerCase();
    if (lower.endsWith('\\\\cfg') || lower.endsWith('/cfg')) {
      sanitized = sanitized.slice(0, -4);
    } else if (lower.endsWith('\\\\cfg\\\\client.cfg') || lower.endsWith('/cfg/client.cfg')) {
      sanitized = sanitized.slice(0, -15);
    } else if (lower.endsWith('\\\\cfg\\\\keys.cfg') || lower.endsWith('/cfg/keys.cfg')) {
      sanitized = sanitized.slice(0, -13);
    } else if (lower.endsWith('\\\\client.cfg') || lower.endsWith('/client.cfg')) {
      sanitized = sanitized.slice(0, -11);
    } else if (lower.endsWith('\\\\keys.cfg') || lower.endsWith('/keys.cfg')) {
      sanitized = sanitized.slice(0, -9);
    }
    return saveConfig({ [key]: sanitized });
  }
  return saveConfig({ [key]: value });
};

export const getConfigKey = (key) => {
  return currentConfig[key];
};

// Start async load
loadConfigAsync();

export const factoryReset = () => {
  localStorage.removeItem('industrial-hub-config');
  localStorage.removeItem('industrial-hub-theme');
  localStorage.removeItem('industrial-hub-lang');
  localStorage.clear();

  currentConfig = {
    theme: 'dark',
    language: 'ru',
    rustPath: '',
    templates: [],
    telemetry: {},
    setupCompleted: false,
    visitedTabs: []
  };

  if (window.electronAPI?.store) {
    window.electronAPI.store.clear();
  }
  
  setTimeout(() => {
    if (window.electronAPI?.app?.relaunch) {
      window.electronAPI.app.relaunch();
    } else {
      window.location.reload();
    }
  }, 500);
};

export const addVisitedTab = (path) => {
  const visited = getConfigKey('visitedTabs') || [];
  if (!visited.includes(path)) {
    setConfigKey('visitedTabs', [...visited, path]);
  }
};
`;
fs.writeFileSync(p, content);

console.log('Electron fixes phase 4 applied!');
