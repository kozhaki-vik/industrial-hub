import re

with open('electron/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add crypto import if not present
if "import crypto from 'crypto';" not in content:
    content = content.replace("import os from 'os';", "import os from 'os';\nimport crypto from 'crypto';")

handlers_code = """
  // NETWORK HANDLERS
  ipcMain.handle('network:get-hwid', () => {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(os.hostname() + '_' + os.userInfo().username);
      return hash.digest('hex');
    } catch(e) {
      return 'unknown_hwid';
    }
  });

  ipcMain.handle('network:apply-updates', async (event, files, baseUrl) => {
    const appPath = process.cwd();
    let successCount = 0;
    
    for (const file of files) {
      try {
        const fileUrl = `${baseUrl}/updates/files/${file.path}`;
        const destPath = path.join(appPath, file.path);
        const destDir = path.dirname(destPath);
        
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        await new Promise((resolve, reject) => {
          const req = (fileUrl.startsWith('https') ? https : http).get(fileUrl, (res) => {
            if (res.statusCode !== 200) {
              return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
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
      }
    }
    
    return { success: true, updated: successCount, total: files.length };
  });

"""

# Insert before createWindow();
content = content.replace("  createWindow();", handlers_code + "  createWindow();")

with open('electron/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Handlers injected successfully!")
