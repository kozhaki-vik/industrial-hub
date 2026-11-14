let activeUnsubscribe = null;

export const registerGlobalShortcut = async (vkCode, callback) => {
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const registerFn = window.electronAPI.gamma.registerShortcut;
  if (!registerFn) return false;

  const success = await registerFn(vkCode);
  if (success && callback) {
    activeUnsubscribe = window.electronAPI.gamma.onHotkey(callback);
  }
  return success;
};

export const unregisterGlobalShortcut = async () => {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  if (!window.electronAPI || !window.electronAPI.gamma) return false;
  const unregisterFn = window.electronAPI.gamma.unregisterShortcut;
  if (!unregisterFn) return false;
  return await unregisterFn();
};

// Aliases for compatibility
export const registerGlobalHook = registerGlobalShortcut;
export const unregisterGlobalHook = unregisterGlobalShortcut;
