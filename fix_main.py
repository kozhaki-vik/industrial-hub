import os
import re

with open('electron/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We know the last valid line before the corruption is 'return true;' inside 'gamma:unregisterHook'
# Let's find 'gamma:unregisterHook'
idx = content.find("ipcMain.handle('gamma:unregisterHook'")
if idx == -1:
    print('Could not find gamma:unregisterHook')
    exit(1)

# Find 'return true;' after this index
idx_ret = content.find('return true;', idx)

# The corrupted part starts right after this 'return true;'
# We will truncate the file here and append the correct handlers

correct_tail = r'''
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
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle('shell:openExternal', (event, url) => {
    require('electron').shell.openExternal(url);
  });

  ipcMain.handle('network:apply-exe-update', async (event, exeUrl, newVersion) => {
    const appPath = path.dirname(app.getPath('exe'));
    const tempExePath = path.join(os.tmpdir(), ih_update_.exe);

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
              redirectUrl = ${parsed.protocol}//;
            }
            return downloadWithRedirects(redirectUrl, destPath, onProgress, maxRedirects - 1).then(resolve).catch(reject);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(HTTP ));
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
        throw new Error(Скачанный файл имеет ту же версию (), что и запущена.);
      }

      const clientDir = path.resolve(appPath, '..');
      const newAppDir = path.join(clientDir, pp-);
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
      } catch (e) {}

      try {
        const lastUpdateFile = path.join(app.getPath('userData'), 'last_update.json');
        fs.writeFileSync(lastUpdateFile, JSON.stringify({ lastUpdated: new Date().toISOString(), version: newVersion }), 'utf8');
      } catch (e) {
        console.error('Failed to save last_update.json:', e);
      }

      try {
        const psShortcut = $wshell = New-Object -ComObject WScript.Shell;  = .CreateShortcut(''); .TargetPath = ''; .WorkingDirectory = ''; .Save();
        child_process.execSync(powershell -NoProfile -Command "");
      } catch (e) {
        console.error("Failed to update shortcut:", e);
      }

      const child = child_process.spawn(targetExePath, [
        --cleanup-pid=,
        --cleanup-dir=
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
    const appPath = process.cwd();
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
'''

new_content = content[:idx_ret + len('return true;')] + correct_tail

# Now append the rest of the file after the corrupted part.
# The corrupted part ends right before the block we already have:
idx_rest = content.find('for (const file of filesToDownload) {', idx_ret)
if idx_rest != -1:
    new_content += content[idx_rest:]
else:
    print('Could not find rest of the file')
    exit(1)

with open('electron/main.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Successfully fixed main.js')
