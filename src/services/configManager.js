import { getConfigKey, setConfigKey } from './store';
import i18n from '../i18n';

const readConfig = async (filename) => {
  if (!window.electronAPI?.config) {
    return localStorage.getItem(`rust_cfg_${filename}`) || '';
  }
  const rustPath = getConfigKey('rustPath');
  if (!rustPath) return null;
  return await window.electronAPI.config.readConfig(rustPath, filename);
};

const writeConfig = async (filename, content) => {
  if (!window.electronAPI?.config) {
    localStorage.setItem(`rust_cfg_${filename}`, content);
    return true;
  }
  const rustPath = getConfigKey('rustPath');
  if (!rustPath) return false;
  return await window.electronAPI.config.writeConfig(rustPath, filename, content);
};

export const isRustRunning = async () => {
  if (!window.electronAPI?.config) return false;
  return await window.electronAPI.config.isRustRunning();
};

const basePreset = {
  'culling.toggle': 'False',
  'decor.quality': '0',
  'effects.antialiasing': '0',
  'effects.ao': 'False',
  'effects.bloom': 'False',
  'effects.hurtoverlay': 'False',
  'effects.lensdirt': 'False',
  'effects.motionblur': 'False',
  'effects.shafts': 'False',
  'effects.sharpen': 'True',
  'effects.vignet': 'False',
  'graphics.af': '1',
  'graphics.branding': 'False',
  'graphics.contactshadows': 'False',
  'graphics.dlaa': 'False',
  'graphics.dlss': '-1',
  'graphics.dof': 'False',
  'graphics.fov': '90',
  'graphics.lodbias': '1.95',
  'graphics.parallax': '0',
  'graphics.reflexmode': '2',
  'graphics.renderscale': '1',
  'graphics.screenmode': '1',
  'graphics.shaderlod': '5',
  'graphics.shadowlights': '0',
  'graphics.shadowquality': '1',
  'graphics.volumetric_clouds': '1',
  'graphics.vsync': '0',
  'graphicssettings.anisotropicfiltering': '0',
  'graphicssettings.globaltexturemipmaplimit': '1',
  'graphicssettings.particleraycastbudget': '4',
  'graphicssettings.pixellightcount': '0',
  'graphicssettings.shadowcascades': '2',
  'graphicssettings.shadowdistancepercent': '0',
  'graphicssettings.shadowmaskmode': '0',
  'graphicssettings.shadowresolution': '1',
  'graphicssettings.softparticles': 'True',
  'grass.quality': '0',
  'water.reflections': '1'
};

const presets = {
  'Potato': { ...basePreset, 'graphics.drawdistance': '1000', 'mesh.quality': '0', 'particle.quality': '0', 'terrain.quality': '0', 'tree.meshes': '0', 'tree.quality': '0' },
  'Low': { ...basePreset, 'graphics.drawdistance': '1500', 'mesh.quality': '50', 'particle.quality': '25', 'terrain.quality': '25', 'tree.meshes': '25', 'tree.quality': '50' },
  'Medium': { ...basePreset, 'graphics.drawdistance': '2000', 'mesh.quality': '75', 'particle.quality': '40', 'terrain.quality': '40', 'tree.meshes': '40', 'tree.quality': '75' },
  'Ultra': { ...basePreset, 'graphics.drawdistance': '2500', 'mesh.quality': '100', 'particle.quality': '50', 'terrain.quality': '50', 'tree.meshes': '50', 'tree.quality': '100' }
};

export const applyGraphicsPreset = async (presetName) => {
  if (await isRustRunning()) return { success: false, error: 'rust_running' };

  const preset = presets[presetName];
  if (!preset) return { success: false };

  let currentConfig = await readConfig('client.cfg') || '';
  for (const [key, value] of Object.entries(preset)) {
    const regex = new RegExp(`^${key.replace('.', '\\.')}\\s+.*$`, 'gm');
    if (currentConfig.match(regex)) {
      currentConfig = currentConfig.replace(regex, `${key} "${value}"`);
    } else {
      currentConfig += `\n${key} "${value}"`;
    }
  }

  const success = await writeConfig('client.cfg', currentConfig);
  return { success };
};

export const saveBind = async (key, command) => {
  if (await isRustRunning()) return { success: false, error: 'rust_running' };
  if (!key || !command) return { success: false };
  
  let currentKeys = await readConfig('keys.cfg') || '';
  const bindLine = `bind ${key.toLowerCase()} "${command}"`;
  const escapedKey = key.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^bind\\s+${escapedKey}\\s+.*$`, 'igm');
  
  if (currentKeys.match(regex)) {
    currentKeys = currentKeys.replace(regex, bindLine);
  } else {
    currentKeys += `\n${bindLine}`;
  }

  const success = await writeConfig('keys.cfg', currentKeys.trim() + '\n');
  return { success };
};

export const getBinds = async () => {
  const currentKeys = await readConfig('keys.cfg');
  if (currentKeys === null) return {};

  const binds = {};
  const lines = (currentKeys || '').split('\n');
  for (const line of lines) {
    const match = line.match(/^bind\s+([^\s]+)\s+(.+)/i);
    if (match) {
      let cmd = match[2].trim();
      if (cmd.startsWith('"') && cmd.endsWith('"')) {
        cmd = cmd.substring(1, cmd.length - 1);
      }
      binds[match[1].toUpperCase()] = cmd;
    }
  }
  return binds;
};

export const ensureOriginalBackup = async () => {
  let backups = [...(getConfigKey('keysBackups') || [])];
  const hasOriginal = backups.some(b => b.isOriginal);

  if (!hasOriginal) {
    const content = await readConfig('keys.cfg') || '';
    const rustPath = getConfigKey('rustPath');

    if (window.electronAPI?.config && rustPath) {
      const backupsDir = `${rustPath}/cfg/industrial_hub_backups`;
      await window.electronAPI.config.ensureDir(backupsDir);

      const originalPath = `${backupsDir}/keys_original_backup.cfg`;
      const currentKeysPath = `${rustPath}/cfg/keys.cfg`;
      
      const exists = await window.electronAPI.config.fileExists(currentKeysPath);
      if (exists) {
        await window.electronAPI.config.copyFile(currentKeysPath, originalPath);
      } else {
        await window.electronAPI.config.writeConfig(rustPath, 'industrial_hub_backups\\keys_original_backup.cfg', content);
      }
    }
    
    backups.unshift({
      id: 'original', name: i18n.t('graphics_original_backup', 'Оригинальный бэкап'), timestamp: Date.now(),
      filename: 'keys_original_backup.cfg', content, isOriginal: true
    });
    setConfigKey('keysBackups', backups);
  }
};

export const createBackup = async (name = i18n.t('binds_backup_manual', 'Ручной бэкап')) => {
  await ensureOriginalBackup();

  const timestamp = Date.now();
  const filename = `keys_backup_${timestamp}.cfg`;
  const currentContent = await readConfig('keys.cfg') || '';
  const rustPath = getConfigKey('rustPath');

  if (window.electronAPI?.config && rustPath) {
    const backupsDir = `${rustPath}/cfg/industrial_hub_backups`;
    await window.electronAPI.config.ensureDir(backupsDir);

    const backupPath = `${backupsDir}/${filename}`;
    const currentKeysPath = `${rustPath}/cfg/keys.cfg`;

    const exists = await window.electronAPI.config.fileExists(currentKeysPath);
    if (exists) {
      await window.electronAPI.config.copyFile(currentKeysPath, backupPath);
    } else {
      await window.electronAPI.config.writeConfig(rustPath, `industrial_hub_backups\\${filename}`, currentContent);
    }
  }

  let backups = [...(getConfigKey('keysBackups') || [])];
  backups.push({
    id: timestamp.toString(), name, timestamp, filename, content: currentContent, isOriginal: false
  });
  setConfigKey('keysBackups', backups);
  return true;
};

export const getBackups = async () => {
  await ensureOriginalBackup();
  const backups = getConfigKey('keysBackups') || [];
  return [...backups].sort((a, b) => {
    if (a.isOriginal) return -1;
    if (b.isOriginal) return 1;
    return b.timestamp - a.timestamp;
  });
};

export const restoreBackup = async (filename) => {
  if (await isRustRunning()) return { success: false, error: 'rust_running' };

  let backups = [...(getConfigKey('keysBackups') || [])];
  const backup = backups.find(b => b.filename === filename);
  const rustPath = getConfigKey('rustPath');

  if (window.electronAPI?.config && rustPath) {
    const backupPath = `${rustPath}/cfg/industrial_hub_backups\\${filename}`;
    const currentKeysPath = `${rustPath}/cfg/keys.cfg`;

    const exists = await window.electronAPI.config.fileExists(backupPath);
    if (exists) {
      await window.electronAPI.config.copyFile(backupPath, currentKeysPath);
    } else if (backup && backup.content !== undefined) {
      await window.electronAPI.config.writeConfig(rustPath, 'keys.cfg', backup.content);
    }
  } else if (backup && backup.content !== undefined) {
    await writeConfig('keys.cfg', backup.content);
  }
  return { success: true };
};

export const ensureOriginalGraphicsBackup = async () => {
  let backups = [...(getConfigKey('graphicsBackups') || [])];
  const hasOriginal = backups.some(b => b.isOriginal);

  if (!hasOriginal) {
    const content = await readConfig('client.cfg') || '';
    const rustPath = getConfigKey('rustPath');

    if (window.electronAPI?.config && rustPath) {
      const backupsDir = `${rustPath}/cfg/industrial_hub_backups`;
      await window.electronAPI.config.ensureDir(backupsDir);

      const originalPath = `${backupsDir}/client_original_backup.cfg`;
      const currentClientPath = `${rustPath}/cfg/client.cfg`;
      
      const exists = await window.electronAPI.config.fileExists(currentClientPath);
      if (exists) {
        await window.electronAPI.config.copyFile(currentClientPath, originalPath);
      } else {
        await window.electronAPI.config.writeConfig(rustPath, 'industrial_hub_backups\\client_original_backup.cfg', content);
      }
    }
    
    backups.unshift({
      id: 'original', name: i18n.t('graphics_original_backup', 'Оригинальный бэкап графики'), timestamp: Date.now(),
      filename: 'client_original_backup.cfg', content, isOriginal: true
    });
    setConfigKey('graphicsBackups', backups);
  }
};

export const createGraphicsBackup = async (name = i18n.t('graphics_backup_manual', 'Ручной бэкап графики')) => {
  await ensureOriginalGraphicsBackup();

  const timestamp = Date.now();
  const filename = `client_backup_${timestamp}.cfg`;
  const currentContent = await readConfig('client.cfg') || '';
  const rustPath = getConfigKey('rustPath');

  if (window.electronAPI?.config && rustPath) {
    const backupsDir = `${rustPath}/cfg/industrial_hub_backups`;
    await window.electronAPI.config.ensureDir(backupsDir);

    const backupPath = `${backupsDir}/${filename}`;
    const currentClientPath = `${rustPath}/cfg/client.cfg`;

    const exists = await window.electronAPI.config.fileExists(currentClientPath);
    if (exists) {
      await window.electronAPI.config.copyFile(currentClientPath, backupPath);
    } else {
      await window.electronAPI.config.writeConfig(rustPath, `industrial_hub_backups\\${filename}`, currentContent);
    }
  }

  let backups = [...(getConfigKey('graphicsBackups') || [])];
  backups.push({
    id: timestamp.toString(), name, timestamp, filename, content: currentContent, isOriginal: false
  });
  setConfigKey('graphicsBackups', backups);
  return true;
};

export const getGraphicsBackups = async () => {
  await ensureOriginalGraphicsBackup();
  const backups = getConfigKey('graphicsBackups') || [];
  return [...backups].sort((a, b) => {
    if (a.isOriginal) return -1;
    if (b.isOriginal) return 1;
    return b.timestamp - a.timestamp;
  });
};

export const restoreGraphicsBackup = async (filename) => {
  if (await isRustRunning()) return { success: false, error: 'rust_running' };

  let backups = [...(getConfigKey('graphicsBackups') || [])];
  const backup = backups.find(b => b.filename === filename);
  const rustPath = getConfigKey('rustPath');

  if (window.electronAPI?.config && rustPath) {
    const backupPath = `${rustPath}/cfg/industrial_hub_backups\\${filename}`;
    const currentClientPath = `${rustPath}/cfg/client.cfg`;

    const exists = await window.electronAPI.config.fileExists(backupPath);
    if (exists) {
      await window.electronAPI.config.copyFile(backupPath, currentClientPath);
    } else if (backup && backup.content !== undefined) {
      await window.electronAPI.config.writeConfig(rustPath, 'client.cfg', backup.content);
    }
  } else if (backup && backup.content !== undefined) {
    await writeConfig('client.cfg', backup.content);
  }
  return { success: true };
};

