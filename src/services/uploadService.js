/**
 * Industrial Hub - Upload Service
 * Manages direct user image uploads to the server for clan manager panels (Ads, Recruitment, etc.)
 * Strictly enforces 2 MB max file size and 1-image-per-slot constraint.
 */

const UPLOAD_API_BASE = 'https://industrial-hub.duckdns.org';

async function getAuthCredentials() {
  const clanSecret = localStorage.getItem('hub_clan_secret') || '';
  let hwid = localStorage.getItem('hub_device_id') || localStorage.getItem('hub_hwid') || '';

  if (window?.electronAPI?.ipcRenderer) {
    try {
      const liveId = await window.electronAPI.ipcRenderer
        .invoke('network:get-device-id')
        .catch(() => window.electronAPI.ipcRenderer.invoke('network:get-hwid'));
      if (liveId) {
        hwid = liveId;
      }
    } catch {}
  }

  const devKey = localStorage.getItem('hub_dev_key') || localStorage.getItem('hub_dev_master_key') || '';
  return { clanSecret, hwid, devKey };
}

/**
 * Uploads an image file to the Industrial Hub Server.
 * 
 * @param {File|Blob} file Image file (PNG, JPG, WebP, GIF)
 * @param {string} slot Slot identifier, e.g. 'ads' or 'recruitment'
 * @param {string} guildId Discord Guild ID
 * @returns {Promise<{ success: boolean, url?: string, fileName?: string, error?: string }>}
 */
export async function uploadBanner(file, slot = 'ads', guildId) {
  if (!file) {
    return { success: false, error: 'Файл не выбран' };
  }

  // 2 MB strict limit check
  const MAX_BYTES = 2 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return { 
      success: false, 
      error: `Размер файла ${(file.size / (1024 * 1024)).toFixed(2)} МБ превышает допустимый лимит 2 МБ` 
    };
  }

  if (!guildId) {
    return { success: false, error: 'Сервер Discord не привязан или не выбран' };
  }

  const { clanSecret, hwid, devKey } = await getAuthCredentials();

  const query = new URLSearchParams({
    guildId: String(guildId).trim(),
    slot: String(slot).trim().toLowerCase(),
    clanSecret,
    hwid,
    devMasterKey: devKey
  });

  const url = `${UPLOAD_API_BASE}/api/upload/banner?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-Guild-Id': String(guildId).trim(),
        'X-Slot': String(slot).trim().toLowerCase(),
        'X-Clan-Secret': clanSecret,
        'X-HWID': hwid,
        'X-Dev-Master-Key': devKey
      },
      body: file
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data?.error || `Ошибка сервера (${response.status})` 
      };
    }

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      size: data.size,
      slot: data.slot
    };
  } catch (err) {
    console.error('[UploadService] Upload failed:', err);
    return { 
      success: false, 
      error: err.message || 'Ошибка сети при обращении к серверу загрузки' 
    };
  }
}

/**
 * Removes the uploaded banner file for a given slot from the server disk.
 * 
 * @param {string} slot Slot identifier
 * @param {string} guildId Discord Guild ID
 * @returns {Promise<{ success: boolean, deletedCount?: number, error?: string }>}
 */
export async function deleteBanner(slot = 'ads', guildId) {
  if (!guildId) {
    return { success: false, error: 'Сервер Discord не выбран' };
  }

  const { clanSecret, hwid, devKey } = await getAuthCredentials();

  const query = new URLSearchParams({
    guildId: String(guildId).trim(),
    slot: String(slot).trim().toLowerCase(),
    clanSecret,
    hwid,
    devMasterKey: devKey
  });

  const url = `${UPLOAD_API_BASE}/api/upload/banner?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Guild-Id': String(guildId).trim(),
        'X-Slot': String(slot).trim().toLowerCase(),
        'X-Clan-Secret': clanSecret,
        'X-HWID': hwid,
        'X-Dev-Master-Key': devKey
      }
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[UploadService] Delete failed:', err);
    return { success: false, error: err.message };
  }
}
