export const pingUrl = async (urlStr) => {
  if (window.electronAPI?.diagnostics) {
    return await window.electronAPI.diagnostics.pingUrl(urlStr);
  }
  return { status: 'error', time: 0, msg: 'Node APIs not available' };
};

export const getHardwareInfo = async () => {
  if (window.electronAPI?.diagnostics) {
    return await window.electronAPI.diagnostics.getHardwareInfo();
  }
  return null;
};

export const getAppPath = async () => {
  if (window.electronAPI?.diagnostics) {
    return await window.electronAPI.diagnostics.getAppPath();
  }
  return 'Unknown';
};

export const getAppDataPath = async () => {
  if (window.electronAPI?.diagnostics?.getAppDataPath) {
    return await window.electronAPI.diagnostics.getAppDataPath();
  }
  return 'Unknown';
};

export const getAppVersionInfo = async () => {
  if (window.electronAPI?.diagnostics?.getAppVersionInfo) {
    return await window.electronAPI.diagnostics.getAppVersionInfo();
  }
  return { version: '1.0.0', lastUpdated: new Date().toISOString() };
};

export const checkAppIntegrity = async () => {
  if (window.electronAPI?.diagnostics) {
    return await window.electronAPI.diagnostics.checkAppIntegrity();
  }
  return { status: 'error', details: [] };
};

export const checkRustIntegrity = async (rustPath) => {
  if (window.electronAPI?.diagnostics?.checkRustIntegrity) {
    return await window.electronAPI.diagnostics.checkRustIntegrity(rustPath);
  }
  return { status: 'error', details: [] };
};

