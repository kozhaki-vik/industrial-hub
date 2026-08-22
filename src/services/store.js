// We use window.require to bypass Vite's bundler since it thinks we are in a browser,
// but we are actually in Electron with nodeIntegration: true
const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

// Fallback to localStorage if running purely in browser (development without Electron)
const isElectron = !!fs;

const getAppDataPath = () => {
  if (!isElectron) return null;
  // Use APPDATA on Windows, or fallback to home dir
  const appData = window.process.env.APPDATA || (window.process.platform === 'darwin' ? window.process.env.HOME + '/Library/Preferences' : window.process.env.HOME + '/.local/share');
  return path.join(appData, 'IndustrialHub');
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
  telemetry: {}
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
