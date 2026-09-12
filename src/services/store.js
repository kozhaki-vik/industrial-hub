// Refactored to use electron-store via IPC
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
    if (lower.endsWith('\\cfg') || lower.endsWith('/cfg')) {
      sanitized = sanitized.slice(0, -4);
    } else if (lower.endsWith('\\cfg\\client.cfg') || lower.endsWith('/cfg/client.cfg')) {
      sanitized = sanitized.slice(0, -15);
    } else if (lower.endsWith('\\cfg\\keys.cfg') || lower.endsWith('/cfg/keys.cfg')) {
      sanitized = sanitized.slice(0, -13);
    } else if (lower.endsWith('\\client.cfg') || lower.endsWith('/client.cfg')) {
      sanitized = sanitized.slice(0, -11);
    } else if (lower.endsWith('\\keys.cfg') || lower.endsWith('/keys.cfg')) {
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
