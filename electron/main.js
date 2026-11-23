import { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell, protocol, screen, safeStorage, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';
import crypto from 'crypto';
import http from 'http';
import https from 'https';
import dns from 'dns';
import Store from 'electron-store';
import { AssetManager } from './assetManager.js';
import { logger } from './logger.js';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'hub-asset',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
]);

const store = new Store({ name: 'industrial-hub-config' });

if (process.argv.includes('--force-main-channel')) {
  console.log("Installer mode detected via argument. Forcing updateChannel to main in electron-store.");
  store.set('updateChannel', 'main');
}

let assetManager = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let tray = null;
let isQuitting = false;

function parseSemver(v) {
  if (!v) return null;
  const clean = String(v).trim().replace(/^v/, '');
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!match) {
    const numMatch = clean.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (!numMatch) return null;
    return {
      major: parseInt(numMatch[1], 10),
      minor: parseInt(numMatch[2] || '0', 10),
      patch: parseInt(numMatch[3] || '0', 10),
      prerelease: null
    };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null
  };
}

function compareSemver(v1, v2) {
  const s1 = parseSemver(v1);
  const s2 = parseSemver(v2);
  if (!s1 && !s2) return 0;
  if (!s1) return -1;
  if (!s2) return 1;

  if (s1.major !== s2.major) return s1.major > s2.major ? 1 : -1;
  if (s1.minor !== s2.minor) return s1.minor > s2.minor ? 1 : -1;
  if (s1.patch !== s2.patch) return s1.patch > s2.patch ? 1 : -1;

  if (!s1.prerelease && s2.prerelease) return 1;
  if (s1.prerelease && !s2.prerelease) return -1;
  if (!s1.prerelease && !s2.prerelease) return 0;

  const p1Parts = s1.prerelease.split('.');
  const p2Parts = s2.prerelease.split('.');
  const len = Math.max(p1Parts.length, p2Parts.length);
  for (let i = 0; i < len; i++) {
    const p1 = p1Parts[i];
    const p2 = p2Parts[i];
    if (p1 === undefined) return -1;
    if (p2 === undefined) return 1;
    if (p1 === p2) continue;

    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);
    const p1IsNum = !isNaN(n1) && String(n1) === p1;
    const p2IsNum = !isNaN(n2) && String(n2) === p2;

    if (p1IsNum && p2IsNum) return n1 > n2 ? 1 : -1;
    if (p1IsNum && !p2IsNum) return -1;
    if (!p1IsNum && p2IsNum) return 1;

    return p1.localeCompare(p2);
  }
  return 0;
}

function getRealAppPath() {
  if (app.isPackaged) {
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      return process.env.PORTABLE_EXECUTABLE_DIR;
    }
    return path.dirname(process.execPath);
  }
  return process.cwd();
}

function getAppRootDir() {
  const appPath = getRealAppPath();
  return path.basename(appPath).startsWith('app-')
    ? path.resolve(appPath, '..')
    : appPath;
}

function getRealExecutablePath() {
  if (process.env.PORTABLE_EXECUTABLE_FILE && fs.existsSync(process.env.PORTABLE_EXECUTABLE_FILE)) {
    return process.env.PORTABLE_EXECUTABLE_FILE;
  }
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const candidate = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Industrial Hub.exe');
    if (fs.existsSync(candidate)) return candidate;
  }

  // If running from an installed or portable unpacked directory
  if (process.execPath && !process.execPath.toLowerCase().includes('\\temp\\') && !process.execPath.toLowerCase().includes('/temp/')) {
    return process.execPath;
  }

  return process.execPath;
}

function getStableLauncherExePath() {
  // 1. Portable executable path
  if (process.env.PORTABLE_EXECUTABLE_FILE && fs.existsSync(process.env.PORTABLE_EXECUTABLE_FILE)) {
    return process.env.PORTABLE_EXECUTABLE_FILE;
  }
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const candidate = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Industrial Hub.exe');
    if (fs.existsSync(candidate)) return candidate;
  }

  // 2. Installed root launcher: always point to "$INSTDIR\Industrial Hub.exe",
  // which forwards automatically and NEVER gets deleted during updates or reinstallations!
  const rootDir = getAppRootDir();
  if (rootDir && fs.existsSync(rootDir)) {
    const rootExe = path.join(rootDir, 'Industrial Hub.exe');
    if (fs.existsSync(rootExe)) {
      return rootExe;
    }
  }

  // 3. If running inside an app-* subfolder, point to parent directory root executable
  if (process.execPath && !process.execPath.toLowerCase().includes('\\temp\\') && !process.execPath.toLowerCase().includes('/temp/')) {
    const parentDir = path.dirname(process.execPath);
    if (path.basename(parentDir).startsWith('app-')) {
      const parentRootExe = path.join(path.dirname(parentDir), 'Industrial Hub.exe');
      if (fs.existsSync(parentRootExe)) {
        return parentRootExe;
      }
    }
    return process.execPath;
  }

  return process.execPath;
}

function syncAutoStart(enabled) {
  try {
    const targetExe = getStableLauncherExePath();
    if (!targetExe || targetExe.toLowerCase().includes('\\temp\\') || targetExe.toLowerCase().includes('/temp/')) {
      console.warn('[AutoStart] Refusing to set autostart to temporary directory:', targetExe);
      return false;
    }

    // 1. Electron login item settings
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      path: targetExe,
      args: enabled ? ['--autostart'] : []
    });

    // 2. Direct Windows Registry synchronization
    if (process.platform === 'win32') {
      const regKeyName = 'electron.app.Industrial Hub';
      if (enabled) {
        const quotedExe = `"${targetExe}" --autostart`;
        try {
          child_process.execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${regKeyName}" /t REG_SZ /d "${quotedExe.replace(/"/g, '\\"')}" /f`, { windowsHide: true });
        } catch (e) {
          console.warn('[AutoStart] Registry write warning:', e.message);
        }
      } else {
        const keysToRemove = [regKeyName, 'Industrial Hub', 'industrial-hub'];
        for (const k of keysToRemove) {
          try {
            child_process.execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${k}" /f`, { windowsHide: true });
          } catch {}
        }
      }
    }

    store.set('autoStart', !!enabled);
    console.log(`[AutoStart] Autostart successfully ${enabled ? 'enabled' : 'disabled'} for ${targetExe}`);
    return true;
  } catch (err) {
    console.error('[AutoStart] Failed to sync autostart:', err);
    return false;
  }
}

function getLatestInstalledExePath() {
  const currentExec = getRealExecutablePath();
  const rootDir = getAppRootDir();

  try {
    if (fs.existsSync(rootDir)) {
      const dirs = fs.readdirSync(rootDir).filter(d => d.startsWith('app-') && fs.statSync(path.join(rootDir, d)).isDirectory());
      if (dirs.length > 0) {
        dirs.sort((a, b) => compareSemver(b.replace(/^app-/, ''), a.replace(/^app-/, '')));
        const latestExe = path.join(rootDir, dirs[0], 'Industrial Hub.exe');
        if (fs.existsSync(latestExe)) {
          return latestExe;
        }
      }
    }
  } catch {}

  return currentExec;
}

let cachedInstallationId = null;

function getPrimaryDeviceIdPath() {
  if (process.platform === 'win32') {
    const programData = process.env.ProgramData || 'C:\\ProgramData';
    return path.join(programData, 'IndustrialHub', 'device-id');
  }
  return path.join(app.getPath('userData'), 'device-id');
}

function getFallbackDeviceIdPath() {
  try {
    return path.join(app.getPath('userData'), '..', 'IndustrialHub_DeviceId', 'device-id');
  } catch {
    return path.join(os.homedir(), '.IndustrialHub_DeviceId', 'device-id');
  }
}

function readDeviceIdFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (content && content.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(content)) {
        return content;
      }
    }
  } catch {}
  return null;
}

function saveDeviceIdToFile(filePath, id) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, id, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function getInstallationId() {
  if (cachedInstallationId) return cachedInstallationId;

  const primaryPath = getPrimaryDeviceIdPath();
  const fallbackPath = getFallbackDeviceIdPath();

  // 1. Check primary file (C:\ProgramData\IndustrialHub\device-id)
  const fromPrimary = readDeviceIdFromFile(primaryPath);
  if (fromPrimary) {
    cachedInstallationId = fromPrimary;
    return cachedInstallationId;
  }

  // 2. Check fallback file
  const fromFallback = readDeviceIdFromFile(fallbackPath);
  if (fromFallback) {
    // Attempt to promote to primary file if write permission is now available
    saveDeviceIdToFile(primaryPath, fromFallback);
    cachedInstallationId = fromFallback;
    return cachedInstallationId;
  }

  // 3. First launch or migration: try reading MachineGuid one time to preserve existing user binding
  let migrationId = null;
  if (process.platform === 'win32') {
    try {
      const out = child_process.execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', { windowsHide: true, timeout: 2000 }).toString();
      const match = out.match(/MachineGuid\s+REG_SZ\s+([a-fA-F0-9-]+)/i);
      if (match && match[1]) {
        const hash = crypto.createHash('sha256');
        hash.update(match[1].trim());
        migrationId = hash.digest('hex');
      }
    } catch {}
  }

  if (!migrationId) {
    if (typeof crypto.randomUUID === 'function') {
      migrationId = crypto.randomUUID();
    } else {
      migrationId = crypto.randomBytes(16).toString('hex');
    }
  }

  // Save to primary path, or fallback if writing to ProgramData fails
  const saved = saveDeviceIdToFile(primaryPath, migrationId);
  if (!saved) {
    saveDeviceIdToFile(fallbackPath, migrationId);
  }

  cachedInstallationId = migrationId;
  return cachedInstallationId;
}

function getSystemHWID() {
  return getInstallationId();
}

// --- Single Instance Lock: Close old version -> Open new version ---
let hasInstanceLock = false;

async function acquireSingleInstanceLock(maxAttempts = 10, delayMs = 300) {
  let hasLock = app.requestSingleInstanceLock();
  if (hasLock) return true;

  // Only if this process is an updater replacement (--cleanup-dir), wait for older process to exit
  const isUpdateProcess = process.argv.some(arg => arg.includes('--cleanup-dir'));
  if (isUpdateProcess) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      hasLock = app.requestSingleInstanceLock();
      if (hasLock) return true;
    }
  }
  return hasLock;
}

async function bootstrapSingleInstance() {
  hasInstanceLock = await acquireSingleInstanceLock(10, 300);
  if (!hasInstanceLock) {
    app.exit(0);
    return;
  }

  // Handle when user launches the shortcut again or updater replaces instance
  app.on('second-instance', (event, commandLine) => {
    // If the second instance is an update replacement process, terminate older instance gracefully
    const isUpdateReplacement = Array.isArray(commandLine) && commandLine.some(arg => arg.includes('--cleanup-dir'));
    if (isUpdateReplacement) {
      try { resetDisplayGamma(); } catch {}
      try {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          if (!win.isDestroyed()) win.destroy();
        }
      } catch {}
      app.exit(0);
      return;
    }

    // Normal launch via shortcut while already running:
    // Restore and show mainWindow to foreground
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
      if (mainWindow.webContents) {
        mainWindow.webContents.focus();
      }
    }
  });
}

const instanceLockPromise = bootstrapSingleInstance();

function getNativeHelperPath() {
  const possiblePaths = [
    path.join(process.resourcesPath, 'resources', 'IndustrialHubDisplay.exe'),
    path.join(process.resourcesPath, 'IndustrialHubDisplay.exe'),
    path.join(getRealAppPath(), 'resources', 'IndustrialHubDisplay.exe'),
    path.join(__dirname, '..', 'resources', 'IndustrialHubDisplay.exe'),
    path.join(process.cwd(), 'resources', 'IndustrialHubDisplay.exe')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.resourcesPath, 'resources', 'IndustrialHubDisplay.exe');
}

function updateApplicationShortcuts(targetExe, workingDir) {
  if (process.platform !== 'win32') return;
  try {
    const target = targetExe || getLatestInstalledExePath();
    if (!target || target.toLowerCase().includes('\\temp\\') || target.toLowerCase().includes('/temp/')) {
      console.warn('[Shortcut] Refusing to set shortcut to temporary directory:', target);
      return;
    }
    const cwd = workingDir || path.dirname(target);

    // 1. Desktop directories
    const desktopDirs = new Set();
    try {
      const p = app.getPath('desktop');
      if (p) desktopDirs.add(p);
    } catch {}

    if (process.env.USERPROFILE) {
      desktopDirs.add(path.join(process.env.USERPROFILE, 'Desktop'));
      desktopDirs.add(path.join(process.env.USERPROFILE, 'OneDrive', 'Desktop'));
      try {
        const userEntries = fs.readdirSync(process.env.USERPROFILE, { withFileTypes: true });
        for (const entry of userEntries) {
          if (entry.isDirectory() && entry.name.toLowerCase().startsWith('onedrive')) {
            const oneDriveDesktop = path.join(process.env.USERPROFILE, entry.name, 'Desktop');
            if (fs.existsSync(oneDriveDesktop)) {
              desktopDirs.add(oneDriveDesktop);
            }
          }
        }
      } catch {}
    }
    if (process.env.PUBLIC) {
      desktopDirs.add(path.join(process.env.PUBLIC, 'Desktop'));
    }

    for (const dir of desktopDirs) {
      if (fs.existsSync(dir)) {
        const shortcutFile = path.join(dir, 'Industrial Hub.lnk');
        try {
          if (fs.existsSync(shortcutFile)) {
            try { fs.unlinkSync(shortcutFile); } catch {}
          }
          shell.writeShortcutLink(shortcutFile, 'create', {
            target,
            cwd,
            description: 'Industrial Hub - Ultimate Rust Assistant',
            icon: target,
            iconIndex: 0
          });
          console.log(`[Shortcut] Updated desktop shortcut at ${shortcutFile} -> ${target}`);
        } catch (err) {
          console.warn(`[Shortcut] Could not write shortcut to ${shortcutFile}:`, err.message);
        }
      }
    }

    // 2. Start Menu directories
    const startMenuDirs = new Set();
    if (process.env.APPDATA) {
      startMenuDirs.add(path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
    }
    const progData = process.env.ProgramData || 'C:\\ProgramData';
    startMenuDirs.add(path.join(progData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));

    for (const baseDir of startMenuDirs) {
      if (!fs.existsSync(baseDir)) continue;

      const targetLinks = [
        path.join(baseDir, 'Industrial Hub.lnk'),
        path.join(baseDir, 'Industrial Hub', 'Industrial Hub.lnk')
      ];

      for (const shortcutFile of targetLinks) {
        const parentDir = path.dirname(shortcutFile);
        if (!fs.existsSync(parentDir)) {
          try { fs.mkdirSync(parentDir, { recursive: true }); } catch {}
        }
        try {
          if (fs.existsSync(shortcutFile)) {
            try { fs.unlinkSync(shortcutFile); } catch {}
          }
          shell.writeShortcutLink(shortcutFile, 'create', {
            target,
            cwd,
            description: 'Industrial Hub - Ultimate Rust Assistant',
            icon: target,
            iconIndex: 0
          });
          console.log(`[Shortcut] Updated Start Menu shortcut at ${shortcutFile} -> ${target}`);
        } catch (err) {
          console.warn(`[Shortcut] Could not write Start Menu shortcut to ${shortcutFile}:`, err.message);
        }
      }

      // Clean up obsolete lowercase industrial-hub.lnk if present
      const oldLowerLnk = path.join(baseDir, 'industrial-hub.lnk');
      if (fs.existsSync(oldLowerLnk)) {
        try { fs.unlinkSync(oldLowerLnk); } catch {}
      }
    }
  } catch (e) {
    console.error('[Shortcut] Failed to update application shortcuts:', e);
  }
}

function updateDesktopShortcut(targetExe, workingDir) {
  updateApplicationShortcuts(targetExe, workingDir);
}

// --- Gamma & Shortcut Native Logic ---

let currentRegisteredAccelerator = null;
let currentShortcutProcess = null; // backward-compat stub
let currentHookProcess = null; // backward-compat stub
let hasModifiedGamma = false;

function resetDisplayGamma() {
  if (process.platform !== 'win32') return;
  try {
    if (currentRegisteredAccelerator) {
      try { globalShortcut.unregister(currentRegisteredAccelerator); } catch {}
      currentRegisteredAccelerator = null;
    }
    const helperPath = getNativeHelperPath();
    if (helperPath && fs.existsSync(helperPath)) {
      child_process.execFileSync(helperPath, ['reset', 'all'], { windowsHide: true, timeout: 3000 });
      if (logger && logger.info) {
        logger.info('Display gamma calibration restored to Windows defaults across all displays.');
      }
    }
  } catch (err) {
    if (logger && logger.error) {
      logger.error('Failed to reset display gamma on shutdown:', err?.message || err);
    }
  }
}

// Hardware acceleration and GPU rendering optimization
// Enable GPU rasterization and zero-copy for high-framerate rendering across all resolutions
try {
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
} catch (e) {
  logger.warn('Could not set GPU optimization switches:', e);
}

function getAdaptiveWindowBounds() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  let targetWidth;
  let targetHeight;
  let minWidth = 960;
  let minHeight = 600;

  // 1. Ноутбуки и маленькие экраны (высота <= 800px или ширина <= 1366px)
  if (screenHeight <= 800 || screenWidth <= 1366) {
    targetWidth = 1080;
    targetHeight = 680;
    minWidth = 960;
    minHeight = 600;
  }
  // 3. Большие мониторы 27"+ (2K 2560x1440, 4K 3840x2160: высота > 1100px и ширина >= 2000px)
  else if (screenHeight > 1100 && screenWidth >= 2000) {
    targetWidth = Math.min(1800, Math.round(screenWidth * 0.75));
    targetHeight = Math.min(1100, Math.round(screenHeight * 0.82));
    minWidth = 1080;
    minHeight = 700;
  }
  // 2. Стандартный ПК (Full HD 1920x1080)
  else {
    targetWidth = Math.min(1480, Math.round(screenWidth * 0.8));
    targetHeight = Math.min(920, Math.round(screenHeight * 0.85));
    minWidth = 1000;
    minHeight = 650;
  }

  // Защита: размер окна и его минимальные границы никогда не должны превышать доступную рабочую область экрана
  const maxSafeWidth = Math.max(800, screenWidth - 30);
  const maxSafeHeight = Math.max(500, screenHeight - 30);
  
  minWidth = Math.min(minWidth, maxSafeWidth);
  minHeight = Math.min(minHeight, maxSafeHeight);
  
  targetWidth = Math.min(targetWidth, Math.max(minWidth, maxSafeWidth));
  targetHeight = Math.min(targetHeight, Math.max(minHeight, maxSafeHeight));

  return {
    width: targetWidth,
    height: targetHeight,
    minWidth,
    minHeight,
  };
}

function getInitialWindowBounds() {
  const savedBounds = store.get('windowBounds');
  const isMaximized = store.get('isWindowMaximized');

  const adaptive = getAdaptiveWindowBounds();

  if (savedBounds && typeof savedBounds === 'object') {
    const { width, height, x, y } = savedBounds;
    const displays = screen.getAllDisplays();
    const isVisible = displays.some(display => {
      const b = display.bounds;
      return (
        x >= b.x - 100 &&
        x < b.x + b.width &&
        y >= b.y - 100 &&
        y < b.y + b.height
      );
    });

    if (isVisible && width >= adaptive.minWidth && height >= adaptive.minHeight) {
      return {
        width,
        height,
        x,
        y,
        minWidth: adaptive.minWidth,
        minHeight: adaptive.minHeight,
        isMaximized: !!isMaximized,
        isCustom: true
      };
    }
  }

  return {
    ...adaptive,
    x: undefined,
    y: undefined,
    isMaximized: false,
    isCustom: false
  };
}

function createWindow() {
  const windowConfig = getInitialWindowBounds();

  mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    minWidth: windowConfig.minWidth,
    minHeight: windowConfig.minHeight,
    x: windowConfig.x,
    y: windowConfig.y,
    show: false, // Don't show until centered or positioned to prevent visual jumping
    backgroundColor: '#0f172a', // Match slate-950
    autoHideMenuBar: true, // Remove the top menu (File, Edit, View, Window)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.setMenu(null); // Completely removes the top menu

  const isAutoStarted = process.argv.includes('--autostart');
  const isExplicitMinimized = process.argv.includes('--minimized');
  const startMinimized = store.get('startMinimizedToTray', false);
  // Manual launch via shortcut always shows the window once so the user can interact.
  // Starting hidden in tray only applies to Windows autostart or explicit --minimized argument.
  const shouldStartHidden = Boolean((isAutoStarted && startMinimized) || isExplicitMinimized);

  if (!shouldStartHidden) {
    if (windowConfig.isMaximized) {
      mainWindow.maximize();
    } else if (!windowConfig.isCustom) {
      mainWindow.center();
    }
  } else {
    if (!windowConfig.isCustom) {
      mainWindow.center();
    }
  }

  let saveBoundsTimeout = null;
  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) return;
    if (mainWindow.isMaximized()) {
      store.set('isWindowMaximized', true);
    } else {
      store.set('isWindowMaximized', false);
      store.set('windowBounds', mainWindow.getBounds());
    }
  };

  mainWindow.on('resize', () => {
    clearTimeout(saveBoundsTimeout);
    saveBoundsTimeout = setTimeout(saveBounds, 300);
  });

  mainWindow.on('move', () => {
    clearTimeout(saveBoundsTimeout);
    saveBoundsTimeout = setTimeout(saveBounds, 300);
  });

  mainWindow.on('maximize', () => {
    store.set('isWindowMaximized', true);
  });

  mainWindow.on('unmaximize', () => {
    store.set('isWindowMaximized', false);
    saveBounds();
  });

  // Focus both window and webContents on ready-to-show
  mainWindow.once('ready-to-show', () => {
    if (shouldStartHidden) {
      console.log('[Startup] App started minimized to tray, window remains hidden.');
      mainWindow.hide();
    } else {
      if (windowConfig.isMaximized) {
        mainWindow.maximize();
      }
      mainWindow.show();
      mainWindow.focus();
      if (mainWindow.webContents) {
        mainWindow.webContents.focus();
      }
    }
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting && store.get('minimizeToTray', true)) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  if (!tray) {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon.png')));
    const restoreAndShowWindow = () => {
      if (!mainWindow) return;
      if (store.get('isWindowMaximized', false) && !mainWindow.isMaximized()) {
        mainWindow.maximize();
      } else if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    };

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Открыть', 
        click: restoreAndShowWindow
      },
      { label: 'Выход', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('Industrial Hub');
    tray.setContextMenu(contextMenu);
    tray.on('click', restoreAndShowWindow);
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // --- Installer Mode ---
  mainWindow.webContents.on('did-finish-load', () => {
    if (process.argv.includes('--force-main-channel')) {
      console.log("Installer mode detected via argument. Forcing updateChannel to main.");
      mainWindow.webContents.executeJavaScript(`
        try {
          let cfg = JSON.parse(localStorage.getItem('industrial-hub-config') || '{}');
          if (cfg.updateChannel !== 'main') {
            cfg.updateChannel = 'main';
            localStorage.setItem('industrial-hub-config', JSON.stringify(cfg));
            console.log("Channel forcefully set to main by installer");
          }
        } catch (e) { console.error('[Auto-caught Error]', e); }
      `);
    }
  });
}

const CRASH_QUEUE_FILE = path.join(app.getPath('userData'), 'crash_queue.json');

function saveToCrashQueue(crashData) {
  try {
    let queue = [];
    if (fs.existsSync(CRASH_QUEUE_FILE)) {
      const data = fs.readFileSync(CRASH_QUEUE_FILE, 'utf8');
      queue = JSON.parse(data);
      if (!Array.isArray(queue)) queue = [];
    }
    queue.push({ ...crashData, timestamp: Date.now() });
    if (queue.length > 50) queue = queue.slice(-50);
    fs.writeFileSync(CRASH_QUEUE_FILE, JSON.stringify(queue), 'utf8');
  } catch (e) {
    console.error('Failed to save crash to queue:', e);
  }
}

function flushCrashQueue() {
  try {
    if (!fs.existsSync(CRASH_QUEUE_FILE)) return;
    
    const data = fs.readFileSync(CRASH_QUEUE_FILE, 'utf8');
    let queue = JSON.parse(data);
    
    if (!Array.isArray(queue) || queue.length === 0) return;
    
    const sendNext = () => {
      if (queue.length === 0) {
        if (fs.existsSync(CRASH_QUEUE_FILE)) fs.unlinkSync(CRASH_QUEUE_FILE);
        return;
      }
      
      const crashData = queue[0];
      const postData = JSON.stringify({
        hwid: crashData.hwid,
        version: crashData.version,
        errorStack: crashData.errorStack
      });
      
      const options = {
        hostname: 'industrial-hub.duckdns.org',
        port: 443,
        path: '/api/crash',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          queue.shift();
          fs.writeFileSync(CRASH_QUEUE_FILE, JSON.stringify(queue), 'utf8');
          sendNext();
        }
      });
      req.on('error', () => {});
      req.write(postData);
      req.end();
    };
    
    sendNext();
  } catch (e) {
    console.error('Failed to flush crash queue:', e);
  }
}

const FALLBACK_CRASH_WEBHOOK = 'https://discord.com/api/webhooks/1572684387076673608/6zdSUOzVz_MnUJDGxz7WBPUaGPtLba_Lyp-N7mnjz7fm1AwXZLLl6A3_jLN1dqUls4Ot';
let lastWebhookSendTime = 0;
const WEBHOOK_THROTTLE_MS = 15000;

function sendCrashReportViaWebhook(crashData) {
  try {
    const now = Date.now();
    if (now - lastWebhookSendTime < WEBHOOK_THROTTLE_MS) {
      return;
    }
    lastWebhookSendTime = now;

    const url = new URL(FALLBACK_CRASH_WEBHOOK);
    const rawError = String(crashData.errorStack || 'No error stack trace provided');
    const truncatedError = rawError.length > 3000 ? rawError.substring(0, 3000) + '\n... [обрезано]' : rawError;

    const payload = JSON.stringify({
      username: 'Industrial Hub Fallback Reporter',
      embeds: [{
        title: '🚨 Аварийный отчёт об ошибке (Резервный способ)',
        description: `⚠️ **Основной сервер недоступен или вернул ошибку.**\nЛог отправлен напрямую приложением через аварийный открытый вебхук.\n\n` +
                     `**Версия:** \`v${crashData.version || 'unknown'}\`\n` +
                     `**HWID:** \`${crashData.hwid || 'unknown'}\`\n` +
                     `**ОС:** \`${os.type()} ${os.release()} (${os.arch()})\`\n\n` +
                     `**Стек ошибки / Логи:**\n\`\`\`\n${truncatedError}\n\`\`\``,
        color: 0xef4444, // Red
        footer: { text: 'Industrial Hub • Резервный вебхук' },
        timestamp: new Date().toISOString()
      }]
    });

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 6000
    }, (res) => {
      res.resume();
    });

    req.on('timeout', () => req.destroy());
    req.on('error', (err) => {
      console.error('Failed to send crash report via fallback webhook:', err.message);
    });
    req.write(payload);
    req.end();
  } catch (err) {
    console.error('Exception in sendCrashReportViaWebhook:', err);
  }
}

function sendCrashReport(errorStack) {
  try {
    const hwid = getSystemHWID();
    const version = app.getVersion();
    
    const crashData = {
      hwid,
      version,
      errorStack
    };
    
    const postData = JSON.stringify(crashData);

    const options = {
      hostname: 'industrial-hub.duckdns.org',
      port: 443,
      path: '/api/crash',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    let fallbackTriggered = false;
    const triggerFallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      saveToCrashQueue(crashData);
      sendCrashReportViaWebhook(crashData);
    };

    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        triggerFallback();
      }
      res.resume();
    });
    req.on('timeout', () => {
      req.destroy();
      triggerFallback();
    });
    req.on('error', () => triggerFallback());
    req.write(postData);
    req.end();
  } catch {
  }
}

process.on('uncaughtException', (err) => {
  resetDisplayGamma();
  console.error('Uncaught Exception:', err);
  logger.error('Uncaught Exception:', err);
  sendCrashReport(err.stack || err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection:', reason);
  sendCrashReport(reason instanceof Error ? reason.stack : String(reason));
});

process.on('SIGTERM', () => {
  resetDisplayGamma();
  app.quit();
});

process.on('SIGINT', () => {
  resetDisplayGamma();
  app.quit();
});

app.on('render-process-gone', (event, webContents, details) => {
  resetDisplayGamma();
  const msg = `Renderer process gone! Reason: ${details.reason}, Exit code: ${details.exitCode}`;
  logger.error(msg);
  sendCrashReport(msg);
});

instanceLockPromise.then(() => {
  if (!hasInstanceLock) return;

  app.whenReady().then(async () => {
  logger.init();

  // Item icons cache directory: ALWAYS unified in app.getPath('userData')/items
  const itemsDir = path.join(app.getPath('userData'), 'items');

  // Auto-migrate from legacy cache locations if present and target has no icons
  try {
    if (!fs.existsSync(itemsDir)) {
      fs.mkdirSync(itemsDir, { recursive: true });
    }

    const currentCount = fs.readdirSync(itemsDir).filter(f => /\.(png|jpg|webp)$/i.test(f)).length;
    if (currentCount === 0) {
      const candidateLegacyDirs = [
        path.join(process.env.APPDATA || (process.platform === 'win32' ? path.join(os.homedir(), 'AppData', 'Roaming') : app.getPath('userData')), 'IndustrialHubClient', 'client', 'items'),
        path.join(app.getPath('userData'), 'cache', 'items'),
        path.join(__dirname, '../src/assets/items')
      ];

      for (const legacyDir of candidateLegacyDirs) {
        if (fs.existsSync(legacyDir) && legacyDir !== itemsDir) {
          const legacyFiles = fs.readdirSync(legacyDir).filter(f => /\.(png|jpg|webp)$/i.test(f));
          if (legacyFiles.length > 0) {
            for (const f of legacyFiles) {
              const srcFile = path.join(legacyDir, f);
              const destFile = path.join(itemsDir, f);
              if (!fs.existsSync(destFile)) {
                try { fs.copyFileSync(srcFile, destFile); } catch {}
              }
            }
            console.log(`[AssetManager] Migrated ${legacyFiles.length} items from ${legacyDir} to ${itemsDir}`);
            break;
          }
        }
      }
    }

    // Clean up old legacy app-* binaries in IndustrialHubClient to free up disk space
    try {
      const oldClientDir = path.join(process.env.APPDATA || '', 'IndustrialHubClient', 'client');
      if (fs.existsSync(oldClientDir)) {
        const oldAppFolders = fs.readdirSync(oldClientDir).filter(f => f.startsWith('app-'));
        for (const oldFolder of oldAppFolders) {
          try {
            fs.rmSync(path.join(oldClientDir, oldFolder), { recursive: true, force: true });
            console.log(`[AssetManager] Cleaned up obsolete legacy folder: ${oldFolder}`);
          } catch {}
        }
      }
    } catch {}
  } catch (e) {
    console.error('[AssetManager] Pre-seed / Migration error:', e);
  }

  assetManager = new AssetManager(itemsDir);
  protocol.handle('hub-asset', (req) => assetManager.handleProtocolRequest(req));

  ipcMain.handle('assets:sync', async () => {
    return await assetManager.syncAssets((prog) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('assets:sync-progress', prog);
      }
    });
  });

  flushCrashQueue();
  setInterval(flushCrashQueue, 60000);

  // If running from root installation directory and a newer app-* folder exists, forward execution
  const currentAppPath = getRealAppPath();
  if (app.isPackaged && !path.basename(currentAppPath).startsWith('app-')) {
    try {
      const rootDir = currentAppPath;
      if (fs.existsSync(rootDir)) {
        const subdirs = fs.readdirSync(rootDir).filter(d => d.startsWith('app-') && fs.statSync(path.join(rootDir, d)).isDirectory());
        if (subdirs.length > 0) {
          subdirs.sort((a, b) => compareSemver(b.replace(/^app-/, ''), a.replace(/^app-/, '')));
          const latestVer = subdirs[0].replace(/^app-/, '');
          if (compareSemver(latestVer, app.getVersion()) > 0) {
            const latestExe = path.join(rootDir, subdirs[0], 'Industrial Hub.exe');
            if (fs.existsSync(latestExe)) {
              console.log(`[Launcher] Newer version ${latestVer} exists. Forwarding to ${latestExe}`);
              updateApplicationShortcuts(latestExe, path.dirname(latestExe));
              const child = child_process.spawn(latestExe, process.argv.slice(1), {
                detached: true,
                stdio: 'ignore',
                cwd: path.dirname(latestExe)
              });
              child.unref();
              app.exit(0);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error('[Launcher] Forwarding check error:', e);
    }
  }

  // Handle auto-update cleanup args from the new process
  let cleanupPid = null;
  let cleanupDir = null;
  for (const arg of process.argv) {
    if (arg.startsWith('--cleanup-pid=')) cleanupPid = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--cleanup-dir=')) cleanupDir = arg.split('=')[1];
  }

  if (cleanupPid && cleanupDir) {
    console.log(`Waiting for old process ${cleanupPid} to exit...`);
    const waitForPid = (pid, maxRetries = 20) => {
      return new Promise((resolve) => {
        let attempts = 0;
        const check = setInterval(() => {
          try {
            process.kill(pid, 0); // Throws if process doesn't exist
            attempts++;
            if (attempts >= maxRetries) {
              clearInterval(check);
              resolve(false);
            }
          } catch {
            clearInterval(check);
            resolve(true); // Process is gone
          }
        }, 500);
      });
    };
    
    await waitForPid(cleanupPid);
    
    try {
      const resolvedCleanup = path.resolve(cleanupDir);
      const folderName = path.basename(resolvedCleanup);
      // Only delete old version folders named app-*, NEVER the installation root directory!
      if (folderName.startsWith('app-') && fs.existsSync(resolvedCleanup)) {
        fs.rmSync(resolvedCleanup, { recursive: true, force: true });
        console.log(`Cleaned up old version directory: ${resolvedCleanup}`);
      }
    } catch (e) {
      console.error(`Failed to clean up old directory ${cleanupDir}:`, e);
    }
  }

  // Cleanup old app-* folders (keep newest 3, delete older ones)
  try {
    const rootDir = getAppRootDir();
    if (fs.existsSync(rootDir)) {
      const folders = fs.readdirSync(rootDir).filter(f => f.startsWith('app-') && fs.statSync(path.join(rootDir, f)).isDirectory());
      if (folders.length > 3) {
        folders.sort((a, b) => compareSemver(b.replace(/^app-/, ''), a.replace(/^app-/, '')));
        for (let i = 3; i < folders.length; i++) {
          const folder = folders[i];
          const fullPath = path.join(rootDir, folder);
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log('Deleted old version folder:', folder);
          } catch (e) {
            console.error('Failed to delete old folder:', folder, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('Cleanup error:', e);
  }

  // Self-heal application shortcuts & sync auto-start on startup
  try {
    const stableExe = getStableLauncherExePath();
    if (stableExe && !stableExe.toLowerCase().includes('\\temp\\') && !stableExe.toLowerCase().includes('/temp/')) {
      updateApplicationShortcuts(stableExe);
      
      const isAutoStartConfigured = store.get('autoStart');
      const isCurrentlyRegistered = app.getLoginItemSettings().openAtLogin || app.getLoginItemSettings({ path: stableExe }).openAtLogin;
      const shouldAutoStart = isAutoStartConfigured ?? isCurrentlyRegistered;

      if (shouldAutoStart) {
        syncAutoStart(true);
      } else if (isAutoStartConfigured === false) {
        syncAutoStart(false);
      }
    }
  } catch (e) {
    console.error('Failed to self-heal shortcut or auto-start on startup:', e);
  }

  
  ipcMain.handle('store:get', (event, key) => store.get(key));
  ipcMain.handle('store:set', (event, key, val) => store.set(key, val));
  ipcMain.handle('store:clear', () => store.clear());
  ipcMain.handle('store:getAll', () => store.store);

  ipcMain.handle('dev:saveKey', (event, rawKey) => {
    try {
      if (!rawKey || typeof rawKey !== 'string') return { success: false, error: 'Empty key' };
      const trimmed = rawKey.trim();
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(trimmed).toString('base64');
        store.set('dev_encrypted_key', encrypted);
        return { success: true, method: 'dpapi' };
      } else {
        const fallback = Buffer.from(trimmed).toString('base64');
        store.set('dev_encrypted_key', fallback);
        return { success: true, method: 'base64' };
      }
    } catch (e) {
      console.error('Failed to save dev key:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('dev:getKey', () => {
    try {
      const encrypted = store.get('dev_encrypted_key');
      if (!encrypted) return null;
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        try {
          return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
        } catch (e) {
          return Buffer.from(encrypted, 'base64').toString('utf8');
        }
      } else {
        return Buffer.from(encrypted, 'base64').toString('utf8');
      }
    } catch (e) {
      console.error('Failed to get dev key:', e);
      return null;
    }
  });

  ipcMain.handle('dev:hasKey', () => {
    return !!store.get('dev_encrypted_key');
  });

  ipcMain.handle('dev:removeKey', () => {
    store.delete('dev_encrypted_key');
    return true;
  });

  ipcMain.handle('dev:signChallenge', (event, { nonce, timestamp, hwid }) => {
    try {
      const encrypted = store.get('dev_encrypted_key');
      if (!encrypted) return { success: false, error: 'No key stored' };
      let rawKey = '';
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        try {
          rawKey = safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
        } catch (e) {
          rawKey = Buffer.from(encrypted, 'base64').toString('utf8');
        }
      } else {
        rawKey = Buffer.from(encrypted, 'base64').toString('utf8');
      }

      if (!rawKey) return { success: false, error: 'Failed to decrypt key' };
      const messageToSign = `${nonce}:${timestamp}:${hwid}`;
      const signature = crypto.createHmac('sha256', rawKey).update(messageToSign).digest('hex');
      return { success: true, signature };
    } catch (e) {
      console.error('Failed to sign dev challenge:', e);
      return { success: false, error: e.message };
    }
  });
  
  ipcMain.handle('autoDetectRustPath', () => {
    try {
      if (process.platform !== 'win32') return null;
      
      const regResult = child_process.execSync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath', { windowsHide: true }).toString();
      const match = regResult.match(/SteamPath\s+REG_SZ\s+(.*)/i);
      if (!match || !match[1]) return null;

      let steamPath = match[1].trim();
      steamPath = steamPath.replace(/\//g, '\\');

      const defaultRustPath = path.join(steamPath, 'steamapps', 'common', 'Rust');
      if (fs.existsSync(defaultRustPath)) {
        return defaultRustPath;
      }

      const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
      if (!fs.existsSync(vdfPath)) return null;

      const vdfContent = fs.readFileSync(vdfPath, 'utf8');
      const pathRegex = /"path"\s+"([^"]+)"/g;
      let libMatch;
      
      while ((libMatch = pathRegex.exec(vdfContent)) !== null) {
        let libPath = libMatch[1];
        libPath = libPath.replace(/\\\\/g, '\\');
        
        const possibleRustPath = path.join(libPath, 'steamapps', 'common', 'Rust');
        if (fs.existsSync(possibleRustPath)) {
          return possibleRustPath;
        }
      }
      return null;
    } catch (error) {
      console.error('Error detecting Rust path in main:', error);
      return null;
    }
  });

  ipcMain.handle('browseForRustPath', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Rust Folder'
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('diagnostics:pingUrl', async (event, urlStr) => {
    return new Promise(async (resolve) => {
      const start = Date.now();

      const fetchWithRedirects = async (currentUrlStr, redirectsLeft = 5) => {
        try {
          const url = new URL(currentUrlStr);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return resolve({ status: 'error', time: 0, msg: 'Invalid protocol' });
          }
          
          const hostname = url.hostname;
          try {
            const { address } = await dns.promises.lookup(hostname);
            const parts = address.split('.').map(Number);
            const isPrivate = (parts[0] === 127 || parts[0] === 10 ||
                    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
                    (parts[0] === 192 && parts[1] === 168) ||
                    address === '::1' || address === '0.0.0.0');
            if (isPrivate) {
              return resolve({ status: 'error', time: 0, msg: 'Private address blocked' });
            }
          } catch {
            return resolve({ status: 'error', time: 0, msg: 'DNS lookup failed' });
          }
          
          const protocol = url.protocol === 'https:' ? https : http;
          
          const req = protocol.get(currentUrlStr, {
            timeout: 4000,
            headers: {
              'User-Agent': 'Industrial-Hub/2.0 (Windows NT 10.0; Win64; x64)',
              'Accept': 'application/vnd.github.v3+json, application/json, text/plain, */*'
            }
          }, (res) => {
            res.resume();

            // Follow HTTP redirects (301, 302, 307, 308)
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              if (redirectsLeft > 0) {
                try {
                  const redirectUrl = new URL(res.headers.location, currentUrlStr).href;
                  return fetchWithRedirects(redirectUrl, redirectsLeft - 1);
                } catch {
                  // If parsing redirect URL fails, proceed to report status
                }
              } else {
                return resolve({ status: 'warning', time: Date.now() - start, msg: 'Too many redirects' });
              }
            }

            const time = Date.now() - start;
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: 'ok', time, msg: res.statusCode === 200 ? '200 OK' : `${res.statusCode} ${res.statusMessage || 'OK'}` });
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
              resolve({ status: 'warning', time, msg: `${res.statusCode} ${res.statusMessage || 'Redirect'}` });
            } else {
              resolve({ status: 'warning', time, msg: `HTTP ${res.statusCode}` });
            }
          });
          
          req.on('timeout', () => {
            req.destroy();
            resolve({ status: 'error', time: Date.now() - start, msg: 'Timeout' });
          });
          
          req.on('error', (err) => {
            resolve({ status: 'error', time: Date.now() - start, msg: err.message });
          });
        } catch (e) {
          console.error(e);
          resolve({ status: 'error', time: 0, msg: 'Invalid URL' });
        }
      };

      fetchWithRedirects(urlStr);
    });
  });

  let totalUptimeBase = 0;
  try {
    const uptimeFile = path.join(app.getPath('userData'), 'total_uptime.json');
    if (fs.existsSync(uptimeFile)) {
      const uData = JSON.parse(fs.readFileSync(uptimeFile, 'utf8'));
      totalUptimeBase = uData.totalSeconds || 0;
    }
  } catch (e) {
    console.error('Failed to read total_uptime:', e);
  }

  const sessionStartTime = Date.now();
  setInterval(() => {
    try {
      const currentSessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);
      const uptimeFile = path.join(app.getPath('userData'), 'total_uptime.json');
      fs.promises.writeFile(uptimeFile, JSON.stringify({ totalSeconds: totalUptimeBase + currentSessionSec }), 'utf8').catch(()=>{});
    } catch {}
  }, 300000); // 5 minutes

  app.on('before-quit', () => {
    resetDisplayGamma();
    try {
      const currentSessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);
      const uptimeFile = path.join(app.getPath('userData'), 'total_uptime.json');
      fs.writeFileSync(uptimeFile, JSON.stringify({ totalSeconds: totalUptimeBase + currentSessionSec }), 'utf8');
    } catch {}
  });


  let cachedHardwareInfo = null;

  ipcMain.handle('diagnostics:getHardwareInfo', async () => {
    const currentSessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);

    if (!cachedHardwareInfo) {
      const cpus = os.cpus();
      let osName = '';
      if (process.platform === 'win32') {
        const build = parseInt((os.release() || '').split('.')[2], 10);
        if (!isNaN(build)) {
          if (build >= 22000) osName = 'Windows 11';
          else if (build >= 10240) osName = 'Windows 10';
          else if (build >= 9600) osName = 'Windows 8.1';
          else if (build >= 9200) osName = 'Windows 8';
          else if (build >= 7600) osName = 'Windows 7';
          else osName = 'Windows';
        } else {
          osName = 'Windows';
        }
      } else if (process.platform === 'darwin') {
        osName = 'macOS';
      } else if (process.platform === 'linux') {
        osName = 'Linux';
      } else {
        osName = os.platform();
      }

      let gpuName = 'Unknown';
      if (process.platform === 'win32') {
        try {
          const { execFileSync } = await import('child_process');
          const stdout = execFileSync('powershell.exe', [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            '(Get-CimInstance Win32_VideoController).Name'
          ], { encoding: 'utf8', windowsHide: true, timeout: 4000 });
          const lines = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
          if (lines.length > 0) {
            lines.sort((a, b) => {
              const isDiscrete = (n) => /geforce|rtx|gtx|radeon\s*rx|arc/i.test(n) ? 1 : 0;
              return isDiscrete(b) - isDiscrete(a);
            });
            gpuName = lines.join(' / ');
          }
        } catch (err) {
          console.warn('[diagnostics] Failed to query GPU:', err.message);
        }
      }

      cachedHardwareInfo = {
        pcName: os.hostname() || 'Desktop PC',
        platform: os.platform(),
        osName,
        release: os.release(),
        arch: os.arch(),
        cpu: cpus.length > 0 ? cpus[0].model.trim() : 'Unknown',
        gpu: gpuName,
        cores: cpus.length,
        ramTotal: Math.round(os.totalmem() / (1024 * 1024 * 1024))
      };
    }

    return {
      ...cachedHardwareInfo,
      ramFree: Math.round(os.freemem() / (1024 * 1024 * 1024)),
      appUptime: Math.floor(process.uptime()),
      totalAppUptime: totalUptimeBase + currentSessionSec,
      systemUptime: os.uptime()
    };
  });

  ipcMain.handle('diagnostics:getAppPath', () => {
    return getRealAppPath();
  });

  ipcMain.handle('diagnostics:getAppDataPath', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('diagnostics:getAppVersionInfo', () => {
    let version = app.getVersion();
    let lastUpdated = null;
    try {
      const lastUpdateFile = path.join(app.getPath('userData'), 'last_update.json');
      if (fs.existsSync(lastUpdateFile)) {
        const uData = JSON.parse(fs.readFileSync(lastUpdateFile, 'utf8'));
        if (uData && uData.lastUpdated) {
          lastUpdated = uData.lastUpdated;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { version, lastUpdated };
  });

  ipcMain.handle('diagnostics:checkAppIntegrity', () => {
    const appPath = getRealAppPath();
    const isPackaged = app.isPackaged || !fs.existsSync(path.join(process.cwd(), 'src'));

    let checks = [
          { name: 'package.json (Config)', relative: 'package.json', checkPath: path.join(appPath, 'package.json') },
          { name: 'electron/main.js (Main Process)', relative: 'electron/main.js', checkPath: path.join(appPath, 'electron', 'main.js') },
          { name: 'src/App.jsx (React Root)', relative: 'src/App.jsx', checkPath: path.join(appPath, 'src', 'App.jsx') },
          { name: 'src/index.css (Styles)', relative: 'src/index.css', checkPath: path.join(appPath, 'src', 'index.css') },
          { name: 'src/views/Developer.jsx', relative: 'src/views/Developer.jsx', checkPath: path.join(appPath, 'src', 'views', 'Developer.jsx') },
          { name: 'node_modules (Dependencies)', relative: 'node_modules', checkPath: path.join(appPath, 'node_modules') },
          { name: 'dist (Build Output)', relative: 'dist', checkPath: path.join(appPath, 'dist') },
          { name: 'index.html (Entry)', relative: 'index.html', checkPath: path.join(appPath, 'index.html') },
          { name: 'vite.config.js (Vite Config)', relative: 'vite.config.js', checkPath: path.join(appPath, 'vite.config.js') },
          { name: 'tailwind.config.js (Tailwind)', relative: 'tailwind.config.js', checkPath: path.join(appPath, 'tailwind.config.js') }
        ];
    if (isPackaged) {
      checks = [
          { name: 'Executable (Binary)', relative: path.basename(process.execPath), checkPath: process.execPath },
          { name: 'App Data Directory', relative: 'industrial-hub', checkPath: app.getPath('userData') }
      ];
    } else {
      checks = [
        { name: 'package.json (Config)', relative: 'package.json', checkPath: path.join(appPath, 'package.json') },
        { name: 'src/assets (Images/Icons)', relative: 'src/assets', checkPath: path.join(appPath, 'src', 'assets') },
        { name: 'electron/main.js (Core DLL/Main)', relative: 'electron/main.js', checkPath: path.join(appPath, 'electron', 'main.js') },
        { name: 'index.html (Entry)', relative: 'index.html', checkPath: path.join(appPath, 'index.html') }
      ];
    }
    
    const results = checks.map(item => {
      let exists = false;
      let type = 'missing';
      try {
        if (fs.existsSync(item.checkPath)) {
          exists = true;
          const stat = fs.statSync(item.checkPath);
          type = stat.isDirectory() ? 'folder' : 'file';
        }
      } catch (e) {
        console.error(e);
      }
      return { name: item.name, relative: item.relative, fullPath: item.checkPath, exists, type };
    });
    
    const allExist = results.every(r => r.exists);
    return { status: allExist ? 'ok' : 'warning', details: results };
  });

    ipcMain.handle('diagnostics:checkRustIntegrity', (event, rustPath) => {
    if (!rustPath) {
      return { status: 'error', details: [] };
    }
    
    const checks = [
        { name: 'keys.cfg', relative: path.join('cfg', 'keys.cfg') },
        { name: 'client.cfg', relative: path.join('cfg', 'client.cfg') }
      ];
    
    const results = checks.map(item => {
      let checkPath = path.join(rustPath, item.relative);
      let exists = false;
      let type = 'missing';
      try {
        if (!fs.existsSync(checkPath)) {
          const altPath = path.join(rustPath, item.name);
          if (fs.existsSync(altPath)) {
            checkPath = altPath;
          }
        }
        if (fs.existsSync(checkPath)) {
          exists = true;
          const stat = fs.statSync(checkPath);
          type = stat.isDirectory() ? 'folder' : 'file';
        }
      } catch (e) {
        console.error(e);
      }
      return { name: item.name, relative: item.relative, fullPath: checkPath, exists, type };
    });
    
    const allExist = results.every(r => r.exists);
    return { status: allExist ? 'ok' : 'warning', details: results };
  });

  ipcMain.handle('config:readConfig', (event, rustPath, filename) => {
    const realRustPath = rustPath || store.get('rustPath');
    if (!realRustPath || !filename) return null;
    
    // Path traversal protection: ensure target path is within game directory
    const resolvedRust = path.resolve(realRustPath);
    let cfgPath = path.resolve(resolvedRust, 'cfg', filename);
    if (!cfgPath.toLowerCase().startsWith(resolvedRust.toLowerCase())) {
      console.error('Path traversal detected in readConfig:', filename);
      return '';
    }

    try {
      if (!fs.existsSync(cfgPath)) {
        const altPath = path.resolve(resolvedRust, filename);
        if (fs.existsSync(altPath) && altPath.toLowerCase().startsWith(resolvedRust.toLowerCase())) {
          cfgPath = altPath;
        } else {
          return '';
        }
      }
      return fs.readFileSync(cfgPath, 'utf8');
    } catch (err) {
      console.error(`Failed to read config ${filename}:`, err);
      return '';
    }
  });

  ipcMain.handle('config:writeConfig', (event, rustPath, filename, content) => {
    if (!filename) return false;
    const realRustPath = store.get('rustPath') || rustPath;
    if (!realRustPath) return false;
    
    try {
      const resolvedRust = path.resolve(realRustPath);
      const cfgDir = path.resolve(resolvedRust, 'cfg');
      const targetPath = path.resolve(cfgDir, filename);
      
      if (!targetPath.toLowerCase().startsWith(resolvedRust.toLowerCase())) {
        console.error('Path traversal detected in writeConfig:', targetPath);
        return false;
      }
      
      const parentDir = path.dirname(targetPath);
      if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(targetPath, content, 'utf8');
      return true;
    } catch (e) {
      const isPerm = e.code === 'EPERM' || e.code === 'EACCES';
      const msg = `Failed to write config ${filename}: ${e.message}${isPerm ? ' (PERMISSION DENIED: Run app as administrator if directory is protected)' : ''}`;
      console.error(msg);
      logger.error(msg);
      return false;
    }
  });

  ipcMain.handle('config:isRustRunning', () => {
    return new Promise((resolve) => {
      child_process.exec('tasklist /FI "IMAGENAME eq rustclient.exe" /NH', { windowsHide: true }, (err, stdout) => {
        if (err) {
          console.error('Error checking processes:', err);
          return resolve(false);
        }
        const isRunning = stdout.toLowerCase().includes('rustclient.exe');
        resolve(isRunning);
      });
    });
  });

  ipcMain.handle('config:fileExists', (event, fullPath) => {
    try {
      const rustPath = store.get('rustPath') || '';
      if (!rustPath || !path.resolve(fullPath).toLowerCase().startsWith(path.resolve(rustPath).toLowerCase())) {
        return false;
      }
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  });

  ipcMain.handle('config:copyFile', (event, srcPath, destPath) => {
    try {
      const rustPath = store.get('rustPath') || '';
      if (!rustPath) return false;
      
      const resolvedSrc = path.resolve(srcPath);
      const resolvedDest = path.resolve(destPath);
      const resolvedRust = path.resolve(rustPath);
      
      if (!resolvedSrc.toLowerCase().startsWith(resolvedRust.toLowerCase()) || !resolvedDest.toLowerCase().startsWith(resolvedRust.toLowerCase())) {
        console.error('Path traversal detected in copyFile');
        return false;
      }
      
      const destDir = path.dirname(resolvedDest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      return true;
    } catch (e) {
      console.error('Failed to copy file:', e);
      return false;
    }
  });

  ipcMain.handle('config:ensureDir', (event, dirPath) => {
    try {
      const rustPath = store.get('rustPath') || '';
      if (!rustPath) return false;
      
      const resolvedDir = path.resolve(dirPath);
      const resolvedRust = path.resolve(rustPath);
      
      if (!resolvedDir.toLowerCase().startsWith(resolvedRust.toLowerCase())) {
        console.error('Path traversal detected in ensureDir');
        return false;
      }
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (e) {
      console.error('Failed to create directory:', e);
      return false;
    }
  });

  ipcMain.handle('gamma:getDisplays', () => {
    return new Promise((resolve) => {
      if (process.platform !== 'win32') return resolve([]);
      const helperPath = getNativeHelperPath();
      child_process.execFile(helperPath, ['displays'], { windowsHide: true }, (error, stdout) => {
        try {
          const text = stdout.trim();
          if (!text) return resolve([]);
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) resolve(parsed.map(d => d.DeviceName));
          else if (parsed && parsed.DeviceName) resolve([parsed.DeviceName]);
          else resolve([]);
        } catch {
          resolve([]);
        }
      });
    });
  });

  ipcMain.handle('gamma:setDisplayGamma', (event, brightnessLevel, deviceName) => {
    if (process.platform !== 'win32') return;
    const targetDevice = deviceName || 'default';
    hasModifiedGamma = true;
    try {
      const helperPath = getNativeHelperPath();
      child_process.execFile(helperPath, ['gamma', brightnessLevel.toString(), targetDevice], { windowsHide: true }, (err) => {
        if (err) console.error('Error setting gamma via helper:', err);
      });
    } catch (err) {
      console.error('Exception setting gamma:', err);
    }
  });

  // Virtual-Key codes mapping to standard Electron accelerators for backward compatibility
  const VK_TO_ACCELERATOR = {
    27: 'Escape',
    112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4',
    116: 'F5', 117: 'F6', 118: 'F7', 119: 'F8',
    120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
    44: 'PrintScreen', 145: 'ScrollLock', 19: 'Pause',
    192: '`', 189: '-', 187: '=', 8: 'Backspace', 9: 'Tab',
    219: '[', 221: ']', 220: '\\', 20: 'Capslock',
    186: ';', 222: "'", 13: 'Return', 188: ',', 190: '.', 191: '/',
    32: 'Space', 45: 'Insert', 36: 'Home', 33: 'PageUp',
    46: 'Delete', 35: 'End', 34: 'PageDown',
    38: 'Up', 40: 'Down', 37: 'Left', 39: 'Right',
    144: 'Numlock', 111: 'numdiv', 106: 'nummult', 109: 'numsub',
    107: 'numadd', 110: 'numdec',
    96: 'num0', 97: 'num1', 98: 'num2', 99: 'num3', 100: 'num4',
    101: 'num5', 102: 'num6', 103: 'num7', 104: 'num8', 105: 'num9'
  };

  const KEY_NAME_ALIASES = {
    'ESC': 'Escape', 'ESCAPE': 'Escape',
    'PRINTSCREEN': 'PrintScreen', 'PRTSC': 'PrintScreen',
    'SCROLLLOCK': 'ScrollLock', 'SCRLK': 'ScrollLock',
    'PAUSE': 'Pause', 'BREAK': 'Pause', 'PAUSE/BREAK': 'Pause',
    'BACKQUOTE': '`', 'MINUS': '-', 'EQUALS': '=',
    'BACKSPACE': 'Backspace', 'TAB': 'Tab',
    'LEFTBRACKET': '[', 'RIGHTBRACKET': ']', 'BACKSLASH': '\\',
    'CAPSLOCK': 'Capslock', 'SEMICOLON': ';', 'QUOTE': "'",
    'RETURN': 'Return', 'ENTER': 'Return', 'SPACE': 'Space',
    'INSERT': 'Insert', 'INS': 'Insert', 'HOME': 'Home',
    'PAGEUP': 'PageUp', 'PGUP': 'PageUp', 'DELETE': 'Delete', 'DEL': 'Delete',
    'END': 'End', 'PAGEDOWN': 'PageDown', 'PGDN': 'PageDown',
    'UP': 'Up', 'UPARROW': 'Up', 'DOWN': 'Down', 'DOWNARROW': 'Down',
    'LEFT': 'Left', 'LEFTARROW': 'Left', 'RIGHT': 'Right', 'RIGHTARROW': 'Right',
    'NUMLOCK': 'Numlock'
  };

  function normalizeToElectronAccelerator(raw) {
    if (!raw) return null;

    if (typeof raw === 'number') {
      if (VK_TO_ACCELERATOR[raw]) return VK_TO_ACCELERATOR[raw];
      if (raw >= 65 && raw <= 90) return String.fromCharCode(raw);
      if (raw >= 48 && raw <= 57) return String.fromCharCode(raw);
      return null;
    }

    if (typeof raw !== 'string') return null;
    const str = raw.trim();
    if (!str) return null;

    if (/^\d+$/.test(str)) {
      return normalizeToElectronAccelerator(parseInt(str, 10));
    }

    const parts = str.split('+').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const modifiers = [];
      let mainKey = '';

      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower === 'ctrl' || lower === 'control') {
          if (!modifiers.includes('CommandOrControl')) modifiers.push('CommandOrControl');
        } else if (lower === 'alt') {
          if (!modifiers.includes('Alt')) modifiers.push('Alt');
        } else if (lower === 'shift') {
          if (!modifiers.includes('Shift')) modifiers.push('Shift');
        } else if (lower === 'win' || lower === 'super' || lower === 'meta') {
          if (!modifiers.includes('Super')) modifiers.push('Super');
        } else {
          const upper = part.toUpperCase();
          mainKey = KEY_NAME_ALIASES[upper] || part;
          if (/^f\d{1,2}$/i.test(mainKey)) {
            mainKey = mainKey.toUpperCase();
          } else if (mainKey.length === 1) {
            mainKey = mainKey.toUpperCase();
          }
        }
      }

      if (!mainKey) return null;
      return [...modifiers, mainKey].join('+');
    }

    const upper = str.toUpperCase();
    if (KEY_NAME_ALIASES[upper]) return KEY_NAME_ALIASES[upper];
    if (/^F\d{1,2}$/i.test(str)) return str.toUpperCase();

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleRegisterShortcut = async (event, shortcutInput) => {
    if (process.platform !== 'win32') return false;

    // Unregister previously active shortcut to prevent overlaps
    if (currentRegisteredAccelerator) {
      try {
        globalShortcut.unregister(currentRegisteredAccelerator);
      } catch (err) {
        console.error('[Gamma Shortcut] Unregister error:', err);
      }
      currentRegisteredAccelerator = null;
    }

    if (!shortcutInput) return false;

    const accelerator = normalizeToElectronAccelerator(shortcutInput);
    if (!accelerator) {
      console.warn('[Gamma Shortcut] Invalid shortcut representation:', shortcutInput);
      return false;
    }

    try {
      // Register global shortcut via Windows RegisterHotKey API (safe, certified, no keylogger hooks)
      let lastHotkeySent = 0;
      const success = globalShortcut.register(accelerator, () => {
        const now = Date.now();
        if (now - lastHotkeySent < 250) return;
        lastHotkeySent = now;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('gamma:hotkey_pressed');
        }
      });

      if (success) {
        currentRegisteredAccelerator = accelerator;
        if (logger && logger.info) {
          logger.info(`[Gamma Shortcut] Registered safe OS hotkey via RegisterHotKey: ${accelerator}`);
        }
        return true;
      } else {
        console.warn(`[Gamma Shortcut] Windows failed to register '${accelerator}'. Key may be reserved by system or requires a modifier.`);
        return false;
      }
    } catch (e) {
      console.error('[Gamma Shortcut] Registration error:', e);
      return false;
    }
  };

  const handleUnregisterShortcut = () => {
    if (currentRegisteredAccelerator) {
      try {
        globalShortcut.unregister(currentRegisteredAccelerator);
      } catch (err) {
        console.error('[Gamma Shortcut] Unregister error:', err);
      }
      currentRegisteredAccelerator = null;
    }
    return true;
  };

  ipcMain.handle('gamma:registerShortcut', handleRegisterShortcut);

  ipcMain.handle('gamma:unregisterShortcut', handleUnregisterShortcut);

  // NETWORK HANDLERS
  ipcMain.handle('network:get-device-id', () => {
    return getInstallationId();
  });

  ipcMain.handle('network:get-hwid', () => {
    return getInstallationId();
  });

  ipcMain.handle('app:relaunch', () => {
    isQuitting = true;
    const options = {};
    if (process.env.PORTABLE_EXECUTABLE_FILE) {
      options.execPath = process.env.PORTABLE_EXECUTABLE_FILE;
    }
    app.relaunch(options);
    app.quit();
  });

  ipcMain.handle('shell:beep', () => {
    shell.beep();
    return true;
  });

  ipcMain.handle('shell:openExternal', async (event, url) => {
    if (url) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
          await shell.openExternal(url);
          return true;
        }
        return false;
      } catch (err) {
        console.error('shell:openExternal error:', err);
        return false;
      }
    }
    return false;
  });

  ipcMain.handle('shell:openPath', async (event, filePath) => {
    if (filePath) {
      try {
        const allowedRoots = [app.getPath('userData'), store.get('rustPath')].filter(Boolean);
        const isAllowed = allowedRoots.some(root => path.resolve(filePath).startsWith(path.resolve(root)));
        if (!isAllowed) {
          console.error('Blocked shell:openPath to unauthorized path:', filePath);
          return false;
        }
        await shell.openPath(filePath);
        return true;
      } catch (err) {
        console.error('shell:openPath error:', err);
        return false;
      }
    }
    return false;
  });

  const TRUSTED_THUMBPRINTS = [
    'F275C9D48A3325871DB04B0FDFB5701BE34802B7', // Industrial Studio / Kozak 10-year (2026-2036)
    'CF5FD177247FC2EEB561B69BE223EF0757218C08', // Kozhaki / Industrial Systems Studio (2026-2027)
    '4061B8CF1678362998377C36C8F16A505ED8CE34'  // Kozhaki / Industrial Hub Systems 10-year (2026-2036)
  ];

  const verifyFileSignature = (filePath) => {
    return new Promise((resolve) => {
      if (process.platform !== 'win32') return resolve(true);
      if (!filePath || !fs.existsSync(filePath)) {
        logger.warn(`Signature verification skipped: file does not exist: ${filePath}`);
        return resolve(false);
      }
      const safePath = filePath.replace(/'/g, "''");
      const psCommand = `$s = Get-AuthenticodeSignature -LiteralPath '${safePath}'; @{ status = [string]$s.Status; thumbprint = [string]$s.SignerCertificate.Thumbprint; subject = [string]$s.SignerCertificate.Subject } | ConvertTo-Json -Compress`;
      child_process.exec(
        `powershell -NoProfile -NonInteractive -Command "${psCommand}"`,
        { timeout: 10000, windowsHide: true },
        (error, stdout) => {
          if (error) {
            logger.error(`Signature verification failed for ${filePath}:`, error.message);
            return resolve(false);
          }
          let status = '';
          let thumbprint = '';
          let subject = '';

          try {
            const parsed = JSON.parse((stdout || '').trim());
            status = String(parsed.status || '').trim();
            thumbprint = String(parsed.thumbprint || '').trim().toUpperCase();
            subject = String(parsed.subject || '').trim();
          } catch {
            const raw = (stdout || '').trim();
            logger.warn(`Failed to parse signature JSON for ${filePath}: ${raw}`);
            return resolve(false);
          }

          const isSignPathCert = status === 'Valid' && subject.toLowerCase().includes('signpath foundation');
          const isValidTrustedLocal = status === 'Valid' && TRUSTED_THUMBPRINTS.includes(thumbprint);
          const isTransitionLocalCert = TRUSTED_THUMBPRINTS.includes(thumbprint) && status !== 'HashMismatch' && status !== 'NotSigned';

          const isTrusted = isSignPathCert || isValidTrustedLocal || isTransitionLocalCert;

          if (!isTrusted) {
            logger.warn(`Untrusted signature for ${filePath}: status=${status}, thumbprint=${thumbprint}, subject=${subject}`);
          } else {
            logger.info(`Verified signature for ${filePath}: status=${status}, thumbprint=${thumbprint}, subject=${subject} (Valid & Trusted)`);
          }
          resolve(isTrusted);
        }
      );
    });
  };

  ipcMain.handle('network:apply-exe-update', async (event, exeUrl, newVersion, applyImmediately = true, force = false) => {
    if (!newVersion || !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(newVersion)) {
      throw new Error('Некорректный формат версии');
    }

    const TRUSTED_PREFIXES = [
      'https://github.com/kozhaki-vik/industrial-hub/',
      'https://github.com/kozhaki-vik/industrial-hub-releases/',
      'https://objects.githubusercontent.com/',
      'https://release-assets.githubusercontent.com/'
    ];
    const isTrustedSource = exeUrl && (
      TRUSTED_PREFIXES.some(prefix => exeUrl.startsWith(prefix)) ||
      exeUrl.startsWith('https://api.github.com/') ||
      /^https:\/\/([a-zA-Z0-9-]+\.)?githubusercontent\.com\//.test(exeUrl)
    );
    if (!isTrustedSource) {
      throw new Error('Недоверенный источник обновления');
    }

    const appPath = getRealAppPath();
    const appRootDir = getAppRootDir();
    const tempExePath = path.join(os.tmpdir(), `ih_update_${newVersion}.exe`);

    const downloadWithRedirects = (targetUrl, destPath, onProgress, maxRedirects = 5) => {
      return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many HTTP redirects'));
        
        const parsed = new URL(targetUrl);
        const lib = parsed.protocol === 'https:' ? https : http;

        const options = {
          rejectUnauthorized: true,
          headers: {
            'User-Agent': 'Industrial-Hub-Updater/1.0'
          }
        };

        const req = lib.get(targetUrl, options, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location;
            if (redirectUrl.startsWith('/')) {
              redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
            }
            return downloadWithRedirects(redirectUrl, destPath, onProgress, maxRedirects - 1).then(resolve).catch(reject);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP Error: ${res.statusCode}`));
          }

          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let downloadedBytes = 0;
          const fileStream = fs.createWriteStream(destPath);

          res.on('data', (chunk) => {
            downloadedBytes += chunk.length;
            if (onProgress) onProgress(downloadedBytes, totalBytes);
          });

          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
          fileStream.on('error', reject);
        });

        req.setTimeout(60000, () => {
          req.destroy(new Error('Download timeout'));
        });

        req.on('error', reject);
      });
    };

    try {
      event.sender.send('update-progress', {
        status: 'downloading',
        downloadedBytes: 0,
        totalBytes: 1,
        currentFile: 'app.exe'
      });

      await downloadWithRedirects(exeUrl, tempExePath, (downloadedBytes, totalBytes) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-progress', {
            status: 'downloading',
            downloadedBytes,
            totalBytes,
            currentFile: 'app.exe'
          });
        }
      });

      const isValidSignature = await verifyFileSignature(tempExePath);
      if (!isValidSignature) {
        fs.unlinkSync(tempExePath);
        throw new Error('Невалидная подпись исполняемого файла');
      }

      event.sender.send('update-progress', {
        status: 'extracting',
        downloadedBytes: 100,
        totalBytes: 100,
        currentFile: 'Применение обновления...'
      });

      if (!force && newVersion === app.getVersion()) {
        throw new Error(`Скачанный файл имеет ту же версию (${newVersion}), что и запущена.`);
      }

      const sameDir = path.resolve(appRootDir, `app-${newVersion}`) === path.resolve(appPath);
      const newAppDir = sameDir 
        ? path.join(appRootDir, `app-${newVersion}-reinstall-${Date.now()}`)
        : path.join(appRootDir, `app-${newVersion}`);
      const exeName = 'Industrial Hub.exe';
      const targetExePath = path.join(newAppDir, exeName);

      if (fs.existsSync(newAppDir) && !sameDir) {
        fs.rmSync(newAppDir, { recursive: true, force: true });
      }
      fs.mkdirSync(newAppDir, { recursive: true });

      fs.copyFileSync(tempExePath, targetExePath);
      try {
        fs.unlinkSync(tempExePath);
      } catch {}

      try {
        const lastUpdateFile = path.join(app.getPath('userData'), 'last_update.json');
        fs.writeFileSync(lastUpdateFile, JSON.stringify({ lastUpdated: new Date().toISOString(), version: newVersion }), 'utf8');
      } catch (e) {
        console.error('Failed to save last_update.json:', e);
      }

      // Robustly update desktop and Start Menu shortcuts to point to new version
      updateApplicationShortcuts(targetExePath, newAppDir);

      // If auto-start was enabled, maintain autostart pointing to stable launcher
      try {
        const isAutoStartEnabled = store.get('autoStart');
        if (isAutoStartEnabled) {
          syncAutoStart(true);
        }
      } catch (e) {
        console.error('Failed to update login item settings on update:', e);
      }

      if (!applyImmediately) {
        return { success: true, updated: 1, total: 1, requiresRestart: true, deferredRestart: true, restartPayload: { targetExePath, newAppDir, appPath } };
      }

      const child = child_process.spawn(targetExePath, [
        `--cleanup-pid=${process.pid}`,
        `--cleanup-dir=${appPath}`
      ], {
        detached: true,
        stdio: 'ignore',
        cwd: newAppDir
      });
      child.unref();

      resetDisplayGamma();
      app.exit(0);

      return { success: true, updated: 1, total: 1, requiresRestart: true };
    } catch (err) {
      console.error('Failed to apply EXE update in main:', err);
      event.sender.send('update-progress', { status: 'error', error: err.message });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('network:apply-deferred-update', async (event, restartPayload) => {
    if (!restartPayload || !restartPayload.targetExePath) return false;
    const safePath = path.resolve(restartPayload.targetExePath);
    if (!safePath.toLowerCase().endsWith('.exe') || !fs.existsSync(safePath)) {
      console.error('Blocked invalid executable execution:', safePath);
      return false;
    }

    const isSigValid = await verifyFileSignature(safePath);
    if (!isSigValid) {
      logger.error('Blocked deferred execution of unverified update binary:', safePath);
      try { if (fs.existsSync(safePath)) fs.unlinkSync(safePath); } catch {}
      return false;
    }

    try {
      updateApplicationShortcuts(restartPayload.targetExePath, restartPayload.newAppDir);
      const child = child_process.spawn(restartPayload.targetExePath, [
        `--cleanup-pid=${process.pid}`,
        `--cleanup-dir=${restartPayload.appPath}`
      ], {
        detached: true,
        stdio: 'ignore',
        cwd: restartPayload.newAppDir
      });
      child.unref();
      
      resetDisplayGamma();
      app.exit(0);
      return true;
    } catch (err) {
      console.error('Failed to apply deferred update:', err);
      return false;
    }
  });

  ipcMain.handle('app:reportError', (event, errorDetails) => {
    logger.error('Reported from renderer:', errorDetails);
    sendCrashReport(errorDetails);
  });

  ipcMain.handle('app:getAutoStart', () => {
    try {
      const stableExe = getStableLauncherExePath();
      const settings = app.getLoginItemSettings({ path: stableExe, args: ['--autostart'] });
      const stored = store.get('autoStart');
      if (typeof stored === 'boolean') {
        return stored;
      }
      return settings.openAtLogin;
    } catch (e) {
      console.error('Failed to get auto-start setting:', e);
      return false;
    }
  });

  ipcMain.handle('app:setAutoStart', (_event, enabled) => {
    try {
      const stableExe = getStableLauncherExePath();
      if (!stableExe || stableExe.toLowerCase().includes('\\temp\\') || stableExe.toLowerCase().includes('/temp/')) {
        throw new Error('Недопустимый путь к исполняемому файлу (Temp)');
      }
      const success = syncAutoStart(!!enabled);
      return { success, enabled: !!enabled };
    } catch (e) {
      console.error('Failed to set auto-start setting:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('app:getStartMinimizedToTray', () => store.get('startMinimizedToTray', false));
  ipcMain.handle('app:setStartMinimizedToTray', (e, val) => {
    store.set('startMinimizedToTray', !!val);
    return true;
  });

  ipcMain.handle('logs:openFolder', async () => {
    try {
      const { logDir } = logger.getLogPaths();
      if (fs.existsSync(logDir)) {
        await shell.openPath(logDir);
        return true;
      }
    } catch (e) {
      logger.error('Failed to open log folder:', e.message);
    }
    return false;
  });

  ipcMain.handle('logs:getRecent', () => {
    return logger.getRecentLogs(150);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
});

app.on('window-all-closed', function () {
  resetDisplayGamma();
  if (process.platform !== 'darwin') app.quit();
});


