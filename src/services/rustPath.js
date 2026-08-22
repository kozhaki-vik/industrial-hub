export const autoDetectRustPath = async () => {
  if (window.electronAPI && window.electronAPI.autoDetectRustPath) {
    return await window.electronAPI.autoDetectRustPath();
  }
  return null;
};

export const browseForRustPath = async () => {
  if (window.electronAPI && window.electronAPI.browseForRustPath) {
    return await window.electronAPI.browseForRustPath();
  }
  return null;
};
