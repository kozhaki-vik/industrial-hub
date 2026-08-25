let activeUnsubscribe = null;

export const registerGlobalHook = async (vkCode, callback) => {
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const success = await window.electronAPI.gamma.registerHook(vkCode);
  if (success && callback) {
    activeUnsubscribe = window.electronAPI.gamma.onHotkey(callback);
  }
  return success;
};

export const unregisterGlobalHook = async () => {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  return await window.electronAPI.gamma.unregisterHook();
};
