export const registerGlobalHook = async (vkCode, callback) => {
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  
  const success = await window.electronAPI.gamma.registerHook(vkCode);
  if (success && callback) {
    window.electronAPI.gamma.onHotkey(callback);
  }
  return success;
};

export const unregisterGlobalHook = async () => {
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  return await window.electronAPI.gamma.unregisterHook();
};
