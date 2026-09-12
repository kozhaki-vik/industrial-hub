const fs = require('fs');

// 1. Installer.cs
let p = 'Installer.cs';
if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/ServicePointManager\.ServerCertificateValidationCallback = delegate \{ return true; \};\r?\n?/g, '');
    fs.writeFileSync(p, content);
}

// 2. electron/main.js
p = 'electron/main.js';
if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Remove rejectUnauthorized: false
    content = content.replace(/rejectUnauthorized:\s*false/g, 'rejectUnauthorized: true');

    // IPC path validation
    const oldWriteConfig = `ipcMain.handle('config:writeConfig', async (event, filename, data) => {\n    try {\n      const filePath = path.join(store.get('rustPath', ''), filename);\n      fs.writeFileSync(filePath, data);\n      return { success: true };\n    } catch (error) {\n      console.error('writeConfig error:', error);\n      return { success: false, error: error.message };\n    }\n  });`;
    const newWriteConfig = `ipcMain.handle('config:writeConfig', async (event, filename, data) => {
    try {
      const basePath = store.get('rustPath', '');
      const filePath = path.resolve(basePath, filename);
      if (!filePath.startsWith(path.resolve(basePath))) throw new Error('Path traversal detected');
      fs.writeFileSync(filePath, data);
      return { success: true };
    } catch (error) {
      console.error('writeConfig error:', error);
      return { success: false, error: error.message };
    }
  });`;

    const oldCopyFile = `ipcMain.handle('config:copyFile', async (event, filename, destFilename) => {\n    try {\n      const basePath = store.get('rustPath', '');\n      const src = path.join(basePath, filename);\n      const dest = path.join(basePath, destFilename);\n      if (fs.existsSync(src)) {\n        fs.copyFileSync(src, dest);\n      }\n      return { success: true };\n    } catch (error) {\n      return { success: false, error: error.message };\n    }\n  });`;
    const newCopyFile = `ipcMain.handle('config:copyFile', async (event, filename, destFilename) => {
    try {
      const basePath = store.get('rustPath', '');
      const src = path.resolve(basePath, filename);
      const dest = path.resolve(basePath, destFilename);
      if (!src.startsWith(path.resolve(basePath)) || !dest.startsWith(path.resolve(basePath))) throw new Error('Path traversal detected');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });`;

    const oldEnsureDir = `ipcMain.handle('config:ensureDir', async (event, dirName) => {\n    try {\n      const basePath = store.get('rustPath', '');\n      const dirPath = path.join(basePath, dirName);\n      if (!fs.existsSync(dirPath)) {\n        fs.mkdirSync(dirPath, { recursive: true });\n      }\n      return { success: true };\n    } catch (error) {\n      return { success: false, error: error.message };\n    }\n  });`;
    const newEnsureDir = `ipcMain.handle('config:ensureDir', async (event, dirName) => {
    try {
      const basePath = store.get('rustPath', '');
      const dirPath = path.resolve(basePath, dirName);
      if (!dirPath.startsWith(path.resolve(basePath))) throw new Error('Path traversal detected');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });`;

    content = content.replace(oldWriteConfig, newWriteConfig);
    content = content.replace(oldCopyFile, newCopyFile);
    content = content.replace(oldEnsureDir, newEnsureDir);

    fs.writeFileSync(p, content);
}

// 3. index.html
p = 'index.html';
if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('Content-Security-Policy')) {
        content = content.replace(
            /<head>/,
            `<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">`
        );
        fs.writeFileSync(p, content);
    }
}

console.log('Electron fixes applied!');
