import { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';
import crypto from 'crypto';
import http from 'http';
import https from 'https';

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
    // User requested to close the old instance and start the new one.
    app.relaunch();
    app.exit(0);
  });
}

// --- Gamma & Hook Native Logic ---
let psGammaProcess = null;
const initGammaProcess = () => {
  if (psGammaProcess) return psGammaProcess;

  psGammaProcess = child_process.spawn('powershell', ['-WindowStyle', 'Hidden', '-NoProfile', '-Command', '-']);
  
  psGammaProcess.on('error', (err) => {
    console.error('Powershell Gamma Process Error:', err);
  });
  
  psGammaProcess.on('exit', () => {
    psGammaProcess = null;
  });
  
  const dllPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'resources', 'IndustrialHubNative.dll')
    : path.join(__dirname, '..', 'resources', 'IndustrialHubNative.dll');
    
  const script = `Add-Type -Path "${dllPath}"\n`;
  psGammaProcess.stdin.write(script);
  return psGammaProcess;
};
setTimeout(() => initGammaProcess(), 1000);

let currentHookProcess = null;

// Disable hardware acceleration to fix GPU crashes on some Windows systems
app.disableHardwareAcceleration();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true, // Show instantly
    backgroundColor: '#0f172a', // Match slate-950
    autoHideMenuBar: true, // Remove the top menu (File, Edit, View, Window)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.setMenu(null); // Completely removes the top menu

  // Since show is true, we don't strictly need this, but we can keep center() logic
  mainWindow.once('ready-to-show', () => {
    mainWindow.center();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function sendCrashReport(errorStack) {
  try {
    const hwid = crypto.createHash('sha256').update(os.hostname() + '_' + os.userInfo().username).digest('hex');
    const version = app.getVersion();
    
    const postData = JSON.stringify({
      hwid,
      version,
      errorStack
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

    const req = https.request(options, () => {});
    req.on('error', () => {});
    req.write(postData);
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
      await shell.openPath(folderPath);
    }
  });

  ipcMain.handle('autoDetectRustPath', () => {
    try {
      if (process.platform !== 'win32') return null;
      
      const regResult = child_process.execSync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath').toString();
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

  ipcMain.handle('diagnostics:pingUrl', (event, urlStr) => {
    return new Promise((resolve) => {
      const start = Date.now();
      try {
        const url = new URL(urlStr);
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

  ipcMain.handle('diagnostics:getHardwareInfo', async () => {
    const cpus = os.cpus();
    let gpuName = 'Unknown';
    try {
      gpuName = await new Promise((resolve) => {
        child_process.exec('powershell -Command "(Get-CimInstance Win32_VideoController).Name"', { timeout: 3000 }, (error, stdout) => {
          if (error || !stdout.trim()) resolve('Unknown');
          else resolve(stdout.split('\n')[0].trim());
        });
      });
    } catch (e) {
      console.error(e);
    }

    const currentSessionSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    return {
      pcName: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpu: cpus.length > 0 ? cpus[0].model : 'Unknown',
      gpu: gpuName,
      cores: cpus.length,
      ramTotal: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
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
    if (!rustPath) return null;
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
    if (!rustPath) return false;
    let cfgDir = path.join(rustPath, 'cfg');
    // If rustPath already points to cfg folder, don't append another cfg
    if (path.basename(rustPath).toLowerCase() === 'cfg') {
      cfgDir = rustPath;
    }
    
    if (!fs.existsSync(cfgDir)) {
      fs.mkdirSync(cfgDir, { recursive: true });
    }
    
    const cfgPath = path.join(cfgDir, filename);
    try {
      fs.writeFileSync(cfgPath, content, 'utf8');
      return true;
    } catch (err) {
      console.error(`Failed to write config ${filename}:`, err);
      return false;
    }
  });

  ipcMain.handle('config:isRustRunning', () => {
    return new Promise((resolve) => {
      child_process.exec('tasklist', (err, stdout) => {
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
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  });

  ipcMain.handle('config:copyFile', (event, srcPath, destPath) => {
    try {
      fs.copyFileSync(srcPath, destPath);
      return true;
    } catch (e) {
      console.error('Failed to copy file:', e);
      return false;
    }
  });

  ipcMain.handle('config:ensureDir', (event, dirPath) => {
    try {
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
      const script = `
Add-Type -AssemblyName System.Windows.Forms
$screens = [System.Windows.Forms.Screen]::AllScreens
$screens | Select-Object DeviceName | ConvertTo-Json -Compress
`;
      const ps = child_process.spawn('powershell', ['-NoProfile', '-Command', '-']);
      let stdout = '';
      ps.stdout.on('data', d => stdout += d.toString());
      ps.on('close', () => {
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
      ps.stdin.write(script + '\n');
      ps.stdin.end();
    });
  });

  ipcMain.handle('gamma:setDisplayGamma', (event, brightnessLevel, deviceName) => {
    if (process.platform !== 'win32') return;
    if (!deviceName) deviceName = "\\\\.\\DISPLAY1";
    try {
      const ps = initGammaProcess();
      if (ps && ps.stdin) {
        ps.stdin.write(`[GammaController]::SaveGamma("${deviceName}")\n`);
        ps.stdin.write(`[GammaController]::SetGamma(${brightnessLevel}, "${deviceName}")\n`);
      }
    } catch (err) {
      console.error('Exception setting gamma:', err);
    }
  });

  ipcMain.handle('gamma:registerHook', (event, vkCode) => {
    if (process.platform !== 'win32') return false;
    
    if (currentHookProcess) {
      currentHookProcess.kill();
      currentHookProcess = null;
    }
    
    if (!vkCode) return false;
    
    try {
      currentHookProcess = child_process.spawn('powershell', ['-WindowStyle', 'Hidden', '-NoProfile', '-Command', '-']);
      const dllPath = app.isPackaged 
        ? path.join(process.resourcesPath, 'resources', 'IndustrialHubNative.dll')
        : path.join(__dirname, '..', 'resources', 'IndustrialHubNative.dll');
        
      currentHookProcess.stdin.write(`Add-Type -Path "${dllPath}"\n`);
      currentHookProcess.stdin.write(`[KeyboardHook]::Start(${vkCode})\n`);
      
      currentHookProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output === 'HOTKEY_PRESSED' && mainWindow) {
          mainWindow.webContents.send('gamma:hotkey_pressed');
        }
      });
      
      currentHookProcess.on('error', (err) => {
        console.error('Keyboard hook error:', err);
      });
      return true;
    } catch (e) {
      console.error('Keyboard hook error:', e);
      return false;
    }
  });

  ipcMain.handle('gamma:unregisterHook', () => {
    if (currentHookProcess) {
      currentHookProcess.kill();
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

  ipcMain.handle('shell:openExternal', (event, url) => {
    require('electron').shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', (event, filePath) => {
    require('electron').shell.openPath(filePath);
  });

  ipcMain.handle('network:apply-exe-update', async (event, exeUrl, newVersion) => {
    const appPath = getRealAppPath();
    const tempExePath = path.join(os.tmpdir(), `ih_update_${newVersion}.exe`);

    const downloadWithRedirects = (targetUrl, destPath, onProgress, maxRedirects = 5) => {
      return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many HTTP redirects'));
        
        const parsed = new URL(targetUrl);
        const lib = parsed.protocol === 'https:' ? https : http;

        const options = {
          rejectUnauthorized: false,
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
        event.sender.send('update-progress', {
          status: 'downloading',
          downloadedBytes,
          totalBytes,
          currentFile: 'app.exe'
        });
      });

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
        const psShortcut = `$wshell = New-Object -ComObject WScript.Shell; $s = $wshell.CreateShortcut('${shortcutPath}'); $s.TargetPath = '${targetExePath}'; $s.WorkingDirectory = '${newAppDir}'; $s.Save()`;
        child_process.execSync(`powershell -NoProfile -Command "${psShortcut}"`);
      } catch (e) {
        console.error("Failed to update shortcut:", e);
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

      app.exit(0);

      return { success: true, updated: 1, total: 1, requiresRestart: true };
    } catch (err) {
      console.error('Failed to apply EXE update in main:', err);
      event.sender.send('update-progress', { status: 'error', error: err.message });
      return { success: false, error: err.message };
    }
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


