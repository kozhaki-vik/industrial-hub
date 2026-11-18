export const getDisplays = async () => {
  if (!window.electronAPI || !window.electronAPI.gamma) return [];
  return await window.electronAPI.gamma.getDisplays();
};

export const setDisplayGamma = (brightnessLevel, deviceName) => {
  if (!window.electronAPI || !window.electronAPI.gamma) return;
  window.electronAPI.gamma.setDisplayGamma(brightnessLevel, deviceName);
};

export const resetDisplayGamma = (deviceName) => {
  setDisplayGamma(0, deviceName);
};
