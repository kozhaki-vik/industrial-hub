import { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell, protocol, screen } from 'electron';
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

function getRealAppPath() {
  if (app.isPackaged) {
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      return process.env.PORTABLE_EXECUTABLE_DIR;
    }
    return path.dirname(process.execPath);
  }
  return process.cwd();
}

// --- Single Instance Lock ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // We are the second instance, quit immediately.
  app.quit();
} else {
  // We are the primary instance.
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function getNativeHelperPath() {
  const possiblePaths = [
    path.join(process.resourcesPath, 'resources', 'NativeHelper.exe'),
    path.join(process.resourcesPath, 'NativeHelper.exe'),
    path.join(getRealAppPath(), 'resources', 'NativeHelper.exe'),
    path.join(__dirname, '..', 'resources', 'NativeHelper.exe'),
    path.join(process.cwd(), 'resources', 'NativeHelper.exe')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.resourcesPath, 'resources', 'NativeHelper.exe');
}

// --- Gamma & Hook Native Logic ---

let currentHookProcess = null;

// Disable hardware acceleration to fix GPU crashes on some Windows systems
app.disableHardwareAcceleration();

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
    targetWidth = 1500;
    targetHeight = 960;
    minWidth = 1080;
    minHeight = 700;
  }
  // 2. Стандартный ПК (Full HD 1920x1080)
  else {
    targetWidth = 1280;
    targetHeight = 820;
    minWidth = 1000;
    minHeight = 650;
  }

  // Защита: размер окна никогда не должен превышать доступную рабочую область экрана
  targetWidth = Math.min(targetWidth, Math.max(minWidth, screenWidth - 30));
  targetHeight = Math.min(targetHeight, Math.max(minHeight, screenHeight - 30));

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

  if (windowConfig.isMaximized) {
    mainWindow.maximize();
  } else if (!windowConfig.isCustom) {
    mainWindow.center();
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
    mainWindow.show();
    mainWindow.focus();
    if (mainWindow.webContents) {
      mainWindow.webContents.focus();
    }
  });


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
        } catch(e) {}
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

function sendCrashReport(errorStack) {
  try {
    const hwid = crypto.createHash('sha256').update(os.hostname() + '_' + os.userInfo().username).digest('hex');
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
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        saveToCrashQueue(crashData);
      }
    });
    req.on('error', () => saveToCrashQueue(crashData));
    req.write(postData);
    req.end();
  } catch {
  }
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  sendCrashReport(err.stack || err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  sendCrashReport(reason instanceof Error ? reason.stack : String(reason));
});

app.on('render-process-gone', (event, webContents, details) => {
  sendCrashReport(`Renderer process gone! Reason: ${details.reason}, Exit code: ${details.exitCode}`);
});

app.whenReady().then(async () => {
  const getClientDir = () => {
    try {
      const appPath = getRealAppPath();
      const parentDir = path.resolve(appPath, '..');
      if (path.basename(appPath).startsWith('app-') && path.basename(parentDir).toLowerCase() === 'client') {
        return parentDir;
      }
    } catch (e) {}

    const appData = process.env.APPDATA || (process.platform === 'win32' ? path.join(os.homedir(), 'AppData', 'Roaming') : app.getPath('userData'));
    return path.join(appData, 'IndustrialHubClient', 'client');
  };

  const clientDir = getClientDir();
  const itemsDir = path.join(clientDir, 'items');

  // Auto-migrate from legacy cache if present and target is empty
  try {
    const legacyCache = path.join(app.getPath('userData'), 'cache', 'items');
    if (fs.existsSync(legacyCache) && legacyCache !== itemsDir) {
      if (!fs.existsSync(itemsDir) || fs.readdirSync(itemsDir).length === 0) {
        fs.mkdirSync(itemsDir, { recursive: true });
        for (const f of fs.readdirSync(legacyCache)) {
          if (/\.(png|jpg|webp)$/i.test(f)) {
            fs.copyFileSync(path.join(legacyCache, f), path.join(itemsDir, f));
          }
        }
        console.log('[AssetManager] Migrated items from legacy cache to', itemsDir);
      }
    }
  } catch (e) {}

  // Pre-seed cache from local assets/items if available and itemsDir is empty
  try {
    const devItemsDir = path.join(__dirname, '../src/assets/items');
    if (fs.existsSync(devItemsDir)) {
      if (!fs.existsSync(itemsDir) || fs.readdirSync(itemsDir).length === 0) {
        fs.mkdirSync(itemsDir, { recursive: true });
        for (const f of fs.readdirSync(devItemsDir)) {
          if (/\.(png|jpg|webp)$/i.test(f)) {
            fs.copyFileSync(path.join(devItemsDir, f), path.join(itemsDir, f));
          }
        }
        console.log('[AssetManager] Pre-seeded cache from local assets/items to', itemsDir);
      }
    }
  } catch (e) {
    console.warn('[AssetManager] Pre-seed error:', e);
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

  // Trigger background asset sync after startup
  setTimeout(() => {
    if (assetManager) {
      assetManager.syncAssets((prog) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('assets:sync-progress', prog);
        }
      }).catch(err => {
        console.warn('[AssetManager] Background sync warning:', err.message);
      });
    }
  }, 1000);

  flushCrashQueue();
  setInterval(flushCrashQueue, 60000);

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
      const folderName = path.basename(cleanupDir);
      if (folderName.startsWith('app-') && fs.existsSync(cleanupDir)) {
        fs.rmSync(cleanupDir, { recursive: true, force: true });
        console.log(`Cleaned up old version directory: ${cleanupDir}`);
      }
    } catch (e) {
      console.error(`Failed to clean up old directory ${cleanupDir}:`, e);
    }
  }

  // Cleanup old app-* folders
  try {
    const appPath = getRealAppPath();
    const clientDir = path.resolve(appPath, '..');
    const currentFolder = path.basename(appPath);
    if (currentFolder.startsWith('app-')) {
      const folders = fs.readdirSync(clientDir).filter(f => f.startsWith('app-'));
      
      const parseVer = (str) => {
         const m = str.match(/app-(\d+)\.(\d+)\.(\d+)/);
         if (!m) return 0;
         return parseInt(m[1])*1000000 + parseInt(m[2])*1000 + parseInt(m[3]);
      };
      folders.sort((a, b) => parseVer(b) - parseVer(a));

      const versionsDir = path.join(clientDir, 'Версии');
      
      for (let i = 3; i < folders.length; i++) {
        if (!fs.existsSync(versionsDir)) {
          fs.mkdirSync(versionsDir, { recursive: true });
        }
        const folder = folders[i];
        const fullPath = path.join(clientDir, folder);
        const destPath = path.join(versionsDir, folder);
        try {
          if (!fs.existsSync(destPath)) {
            fs.renameSync(fullPath, destPath);
            console.log('Moved old version folder to Версии:', folder);
          } else {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (e) {
          console.error('Failed to move old folder:', folder, e);
        }
      }
    }
  } catch (e) {
    console.error('Cleanup error:', e);
  }

  ipcMain.handle('shell:openFolder', async (event, folderPath) => {
    if (folderPath) {
      const allowedRoots = [app.getPath('userData'), store.get('rustPath')].filter(Boolean);
      const isAllowed = allowedRoots.some(root => path.resolve(folderPath).startsWith(path.resolve(root)));
      if (!isAllowed) {
        console.error('Blocked shell:openFolder to unauthorized path:', folderPath);
        return false;
      }
      await shell.openPath(folderPath);
      return true;
    }
    return false;
  });

  
  ipcMain.handle('store:get', (event, key) => store.get(key));
  ipcMain.handle('store:set', (event, key, val) => store.set(key, val));
  ipcMain.handle('store:delete', (event, key) => store.delete(key));
  ipcMain.handle('store:clear', () => store.clear());
  ipcMain.handle('store:getAll', () => store.store);
  
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
      try {
        const url = new URL(urlStr);
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
        
        const req = protocol.get(urlStr, { timeout: 3000 }, (res) => {
          const time = Date.now() - start;
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ status: 'ok', time, msg: `${res.statusCode} OK` });
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
      fs.writeFileSync(uptimeFile, JSON.stringify({ totalSeconds: totalUptimeBase + currentSessionSec }), 'utf8');
    } catch {}
  }, 5000);

  let cachedHardwareInfo = null;

  ipcMain.handle('diagnostics:getHardwareInfo', async () => {
    const currentSessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);

    if (!cachedHardwareInfo) {
      const cpus = os.cpus();
      let gpuName = 'Unknown';
      let osName = '';
      try {
        const psResult = await new Promise((resolve) => {
          child_process.exec(
            'powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).Caption; (Get-CimInstance Win32_VideoController).Name"',
            { timeout: 3000, windowsHide: true },
            (error, stdout) => {
              if (error || !stdout.trim()) resolve({ os: '', gpu: '' });
              else {
                const lines = stdout.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                resolve({
                  os: lines[0] || '',
                  gpu: lines[1] || ''
                });
              }
            }
          );
        });
        if (psResult.gpu) gpuName = psResult.gpu;
        if (psResult.os) osName = psResult.os.replace(/^Майкрософт\s+/i, '').replace(/^Microsoft\s+/i, '').trim();
      } catch (e) {
        console.error(e);
      }

      if (!osName) {
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
      }

      cachedHardwareInfo = {
        pcName: os.hostname(),
        platform: os.platform(),
        osName,
        release: os.release(),
        arch: os.arch(),
        cpu: cpus.length > 0 ? cpus[0].model : 'Unknown',
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
    if (!rustPath || !filename) return null;
    
    // Path traversal protection
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      const safeName = path.basename(filename);
      if (safeName !== filename) {
        console.error('Path traversal detected in readConfig:', filename);
        return '';
      }
    }

    let cfgPath = path.join(rustPath, 'cfg', filename);
    try {
      if (!fs.existsSync(cfgPath)) {
        const altPath = path.join(rustPath, filename);
        if (fs.existsSync(altPath)) {
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
    const realRustPath = store.get('rustPath');
    if (!realRustPath) return false;
    
    try {
      const sanitized = path.basename(filename);
      const cfgDir = path.join(realRustPath, 'cfg');
      const targetPath = path.join(cfgDir, sanitized);
      
      if (!targetPath.startsWith(cfgDir)) {
        console.error('Path traversal detected in writeConfig:', targetPath);
        return false;
      }
      
      if (!fs.existsSync(cfgDir)) fs.mkdirSync(cfgDir, { recursive: true });
      fs.writeFileSync(targetPath, content, 'utf8');
      return true;
    } catch (e) {
      console.error(`Failed to write config ${filename}:`, e);
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
      if (!rustPath || !path.resolve(fullPath).startsWith(path.resolve(rustPath))) {
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
      
      if (!resolvedSrc.startsWith(resolvedRust) || !resolvedDest.startsWith(resolvedRust)) {
        console.error('Path traversal detected in copyFile');
        return false;
      }
      
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
      
      if (!resolvedDir.startsWith(resolvedRust)) {
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
    if (!deviceName) deviceName = "\\\\.\\DISPLAY1";
    try {
      const helperPath = getNativeHelperPath();
      child_process.execFile(helperPath, ['gamma', brightnessLevel.toString(), deviceName], { windowsHide: true }, (err) => {
        if (err) console.error('Error setting gamma via helper:', err);
      });
    } catch (err) {
      console.error('Exception setting gamma:', err);
    }
  });

  ipcMain.handle('gamma:registerHook', (event, vkCode) => {
    if (process.platform !== 'win32') return false;
    
    if (currentHookProcess) {
      try {
        currentHookProcess.kill();
      } catch {}
      currentHookProcess = null;
    }
    
    if (!vkCode) return false;
    
    try {
      const helperPath = getNativeHelperPath();
      currentHookProcess = child_process.spawn(helperPath, ['hook', vkCode.toString()], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      currentHookProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('HOTKEY_PRESSED') && mainWindow) {
          mainWindow.webContents.send('gamma:hotkey_pressed');
        }
      });

      currentHookProcess.stderr.on('data', (data) => {
        console.error('Hook process stderr:', data.toString());
      });
      
      currentHookProcess.on('error', (err) => {
        console.error('Keyboard hook error:', err);
        currentHookProcess = null;
      });

      currentHookProcess.on('exit', () => {
        currentHookProcess = null;
      });

      return true;
    } catch (e) {
      console.error('Keyboard hook error:', e);
      currentHookProcess = null;
      return false;
    }
  });

  ipcMain.handle('gamma:unregisterHook', () => {
    if (currentHookProcess) {
      try {
        currentHookProcess.kill();
      } catch {}
      currentHookProcess = null;
    }
    return true;
  });

  // NETWORK HANDLERS
  ipcMain.handle('network:get-hwid', () => {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(os.hostname() + '_' + os.userInfo().username);
      return hash.digest('hex');
    } catch {
      return 'unknown_hwid';
    }
  });

  ipcMain.handle('app:relaunch', () => {
    const options = {};
    if (process.env.PORTABLE_EXECUTABLE_FILE) {
      options.execPath = process.env.PORTABLE_EXECUTABLE_FILE;
    }
    app.relaunch(options);
    app.quit();
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
      const psCommand = `(Get-AuthenticodeSignature "${filePath}").SignerCertificate.Thumbprint`;
      child_process.exec(`powershell -NoProfile -Command "${psCommand}"`, { windowsHide: true }, (error, stdout) => {
        if (error) return resolve(false);
        const thumbprint = stdout.trim().toUpperCase();
        resolve(TRUSTED_THUMBPRINTS.includes(thumbprint));
      });
    });
  };

  ipcMain.handle('network:apply-exe-update', async (event, exeUrl, newVersion) => {
    const TRUSTED_PREFIX = 'https://github.com/kozhaki-vik/industrial-hub-releases/';
    if (!exeUrl || (!exeUrl.startsWith(TRUSTED_PREFIX) && !exeUrl.startsWith('https://api.github.com/'))) {
      throw new Error('Недоверенный источник обновления');
    }

    const appPath = getRealAppPath();
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

      if (newVersion === app.getVersion()) {
        throw new Error(`Скачанный файл имеет ту же версию (${newVersion}), что и запущена.`);
      }

      const clientDir = path.resolve(appPath, '..');
      const newAppDir = path.join(clientDir, `app-${newVersion}`);
      const exeName = 'Industrial Hub.exe';
      const targetExePath = path.join(newAppDir, exeName);
      const shortcutPath = path.join(process.env.USERPROFILE || '', 'Desktop', 'Industrial Hub.lnk');

      if (fs.existsSync(newAppDir)) {
        fs.rmSync(newAppDir, { recursive: true, force: true });
      }
      fs.mkdirSync(newAppDir, { recursive: true });

      fs.copyFileSync(tempExePath, targetExePath);
      try {
        fs.unlinkSync(tempExePath);
      } catch {
      }

      try {
        const lastUpdateFile = path.join(app.getPath('userData'), 'last_update.json');
        fs.writeFileSync(lastUpdateFile, JSON.stringify({ lastUpdated: new Date().toISOString(), version: newVersion }), 'utf8');
      } catch (e) {
        console.error('Failed to save last_update.json:', e);
      }

      try {
        shell.writeShortcutLink(shortcutPath, 'create', {
          target: targetExePath,
          cwd: newAppDir,
          description: 'Industrial Hub'
        });
      } catch (e) {
        console.error("Failed to update shortcut:", e);
      }

      const child = child_process.spawn(targetExePath, [
        `--cleanup-pid=${process.pid}`,
        `--cleanup-dir=${appPath}`
      ], {
        detached: true,
        stdio: 'ignore',
        cwd: newAppDir,
        windowsHide: true
      });
      child.unref();

      app.exit(0);

      return { success: true, updated: 1, total: 1, requiresRestart: true };
    } catch (err) {
      console.error('Failed to apply EXE update in main:', err);
      event.sender.send('update-progress', { status: 'error', error: err.message });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('app:focusWindow', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (!mainWindow.isFocused()) {
        mainWindow.focus();
      }
      return true;
    }
    return false;
  });

  ipcMain.handle('app:reportError', (event, errorDetails) => {
    sendCrashReport(errorDetails);
  });

  ipcMain.handle('network:apply-updates', async (event, files, baseUrl) => {
    const appPath = getRealAppPath();
    let successCount = 0;
    let requiresRestart = false;
    
    const filesToDownload = [];
    let totalBytes = 0;
    
    for (const file of files) {
      const destPath = path.join(appPath, file.path);
      let needsDownload = true;
      if (fs.existsSync(destPath)) {
        const localBuffer = fs.readFileSync(destPath);
        const localHash = crypto.createHash('sha256').update(localBuffer).digest('hex');
        if (localHash === file.hash) {
          needsDownload = false;
        }
      }
      
      if (needsDownload) {
        filesToDownload.push(file);
        totalBytes += (file.size || 0);
        if (file.path.includes('package.json') || file.path.includes('electron') || file.path.includes('app.asar') || file.path.includes('.exe')) {
          requiresRestart = true;
        }
      }
    }
    
    if (filesToDownload.length === 0) {
      return { success: true, updated: 0, total: files.length, requiresRestart: false };
    }
    
    let downloadedBytes = 0;
for (const file of filesToDownload) {
      try {
        const destPath = path.join(appPath, file.path);
        const fileUrl = `${baseUrl}/updates/files/${file.path}`;
        const destDir = path.dirname(destPath);
        
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        event.sender.send('update-progress', {
          status: 'downloading',
          downloadedBytes,
          totalBytes,
          currentFile: file.path
        });
        
        await new Promise((resolve, reject) => {
          const req = (fileUrl.startsWith('https') ? https : http).get(fileUrl, (res) => {
            if (res.statusCode !== 200) {
              return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            
            res.on('data', (chunk) => {
              downloadedBytes += chunk.length;
              const now = Date.now();
              if (!file._lastEmit || now - file._lastEmit > 50) {
                file._lastEmit = now;
                event.sender.send('update-progress', {
                  status: 'downloading',
                  downloadedBytes,
                  totalBytes,
                  currentFile: file.path
                });
              }
            });

            fileStream.on('finish', () => {
              fileStream.close();
              resolve();
            });
          });
          req.on('error', reject);
        });
        
        const fileBuffer = fs.readFileSync(destPath);
        const downloadedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        if (downloadedHash === file.hash) {
          successCount++;
        } else {
          console.error(`Hash mismatch for ${file.path}`);
        }
      } catch (err) {
        console.error(`Failed to download ${file.path}:`, err);
        event.sender.send('update-progress', { status: 'error', error: err.message });
      }
    }
    
    return { success: true, updated: successCount, total: files.length, requiresRestart };
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});


