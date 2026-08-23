// We use window.require to bypass Vite's bundler since it thinks we are in a browser,
// but we are actually in Electron with nodeIntegration: true
const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

// Fallback to localStorage if running purely in browser (development without Electron)
const isElectron = !!fs;

export const getAppDataPath = () => {
  if (!isElectron) return null;
  // Use APPDATA on Windows, or fallback to home dir
  const appData = window.process.env.APPDATA || (window.process.platform === 'darwin' ? window.process.env.HOME + '/Library/Preferences' : window.process.env.HOME + '/.local/share');
  return path.join(appData, 'industrial-hub');
};

const getConfigPath = () => {
  const dir = getAppDataPath();
  if (dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'config.json');
  }
  return null;
};

// Default config
let currentConfig = {
  theme: 'dark',
  language: 'ru',
  rustPath: '',
  templates: [],
  telemetry: {},
  setupCompleted: false,
  visitedTabs: []
};

// Load config synchronously
export const loadConfig = () => {
  if (!isElectron) {
    const saved = localStorage.getItem('industrial-hub-config');
    if (saved) {
      currentConfig = { ...currentConfig, ...JSON.parse(saved) };
    }
    return currentConfig;
  }

  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf8');
      currentConfig = { ...currentConfig, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error reading config:', e);
    }
  }
  return currentConfig;
};

// Save config synchronously
export const saveConfig = (newConfig) => {
  currentConfig = { ...currentConfig, ...newConfig };
  
  if (!isElectron) {
    localStorage.setItem('industrial-hub-config', JSON.stringify(currentConfig));
    return true;
  }

  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing config:', e);
    return false;
  }
};

// Helper for specific keys
export const setConfigKey = (key, value) => {
  return saveConfig({ [key]: value });
};

export const getConfigKey = (key) => {
  return currentConfig[key];
};

// Initial load
loadConfig();

export const factoryReset = () => {
  // Preserve update channel so testers don't get downgraded
  const currentChannel = localStorage.getItem('industrial-hub-config') ? 
    (JSON.parse(localStorage.getItem('industrial-hub-config')).updateChannel || 'main') : 'main';

  // Always clear local storage keys used by the app
  localStorage.removeItem('industrial-hub-config');
  localStorage.removeItem('industrial-hub-theme');
  localStorage.removeItem('industrial-hub-lang');
  // Or just clear everything to be safe:
  localStorage.clear();

  // Restore update channel in a fresh config
  const freshConfig = {
    theme: 'dark',
    language: 'ru',
    rustPath: '',
    templates: [],
    telemetry: {},
    setupCompleted: false,
    visitedTabs: [],
    updateChannel: currentChannel
  };
  
  localStorage.setItem('industrial-hub-config', JSON.stringify(freshConfig));

  // Reset in-memory config so any pending saves write defaults
  currentConfig = { ...freshConfig };

  try {
    if (fs) {
      const configPath = getConfigPath();
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    }
  } catch (e) {
    console.error('Error deleting config for factory reset:', e);
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
