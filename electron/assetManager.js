import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { pathToFileURL } from 'url';
import { net } from 'electron';

const REPO_OWNER = 'kozhaki-vik';
const REPO_NAME = 'industrial-hub-assets';
const BRANCH = 'main';
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/manifest.json`;
const ASSETS_BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/items`;

export class AssetManager {
  constructor(userDataPath) {
    this.cacheDir = path.join(userDataPath, 'cache', 'items');
    this.isSyncing = false;
    this.ensureDir(this.cacheDir);
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  calculateHash(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch {
      return null;
    }
  }

  downloadBuffer(url) {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'Industrial-Hub-Client' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(this.downloadBuffer(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    });
  }

  async syncAssets(onProgress = () => {}) {
    if (this.isSyncing) return { status: 'already_syncing' };
    this.isSyncing = true;
    console.log('[AssetManager] Starting asset synchronization...');

    try {
      const manifestUrl = `${MANIFEST_URL}?t=${Date.now()}`;
      const manifestBuf = await this.downloadBuffer(manifestUrl);
      const manifest = JSON.parse(manifestBuf.toString('utf8'));

      if (!manifest || !manifest.files) {
        throw new Error('Invalid manifest received');
      }

      this.ensureDir(this.cacheDir);
      const localFiles = new Set(fs.readdirSync(this.cacheDir));
      const manifestEntries = Object.entries(manifest.files);

      const toDownload = [];
      const validNames = new Set();

      for (const [filename, info] of manifestEntries) {
        if (!/^[a-zA-Z0-9_. -]+\.(png|jpg|webp)$/i.test(filename)) continue;
        validNames.add(filename);

        const localPath = path.join(this.cacheDir, filename);
        if (!localFiles.has(filename)) {
          toDownload.push({ filename, info });
        } else {
          try {
            const stat = fs.statSync(localPath);
            if (stat.size !== info.size) {
              toDownload.push({ filename, info });
            } else {
              const localHash = this.calculateHash(localPath);
              if (localHash !== info.hash) {
                toDownload.push({ filename, info });
              }
            }
          } catch {
            toDownload.push({ filename, info });
          }
        }
      }

      // Cleanup files no longer in manifest
      for (const localFile of localFiles) {
        if (!validNames.has(localFile)) {
          try {
            fs.unlinkSync(path.join(this.cacheDir, localFile));
            console.log(`[AssetManager] Removed obsolete file: ${localFile}`);
          } catch {}
        }
      }

      console.log(`[AssetManager] Files to download: ${toDownload.length} / ${manifestEntries.length}`);

      if (toDownload.length === 0) {
        this.isSyncing = false;
        return { success: true, downloaded: 0, total: manifestEntries.length };
      }

      let downloaded = 0;
      let errors = 0;
      const concurrency = 8;
      const queue = [...toDownload];

      const worker = async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;

          const fileUrl = `${ASSETS_BASE_URL}/${encodeURIComponent(item.filename)}`;
          const destPath = path.join(this.cacheDir, item.filename);
          const tempPath = `${destPath}.tmp.${Date.now()}`;

          try {
            const data = await this.downloadBuffer(fileUrl);
            const downloadedHash = crypto.createHash('sha256').update(data).digest('hex');
            if (downloadedHash !== item.info.hash) {
              console.warn(`[AssetManager] Hash mismatch for ${item.filename}, expected ${item.info.hash}, got ${downloadedHash}`);
              errors++;
              continue;
            }
            fs.writeFileSync(tempPath, data);
            fs.renameSync(tempPath, destPath);
            downloaded++;
            onProgress({ total: toDownload.length, current: downloaded });
          } catch (err) {
            console.warn(`[AssetManager] Failed to download ${item.filename}:`, err.message);
            errors++;
            try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
          }
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, toDownload.length) }, () => worker());
      await Promise.all(workers);

      console.log(`[AssetManager] Sync completed: ${downloaded} downloaded, ${errors} errors.`);
      this.isSyncing = false;
      return { success: true, downloaded, errors, total: manifestEntries.length };
    } catch (e) {
      console.error('[AssetManager] Sync failed:', e);
      this.isSyncing = false;
      return { success: false, error: e.message };
    }
  }

  handleProtocolRequest(request) {
    try {
      const parsed = new URL(request.url);
      const fileName = path.basename(decodeURIComponent(parsed.pathname));
      if (!/^[a-zA-Z0-9_. -]+\.(png|jpg|webp)$/i.test(fileName)) {
        return new Response('Not found', { status: 404 });
      }
      const localPath = path.join(this.cacheDir, fileName);
      if (fs.existsSync(localPath)) {
        return net.fetch(pathToFileURL(localPath).toString());
      }
      return new Response('Not found', { status: 404 });
    } catch {
      return new Response('Error', { status: 500 });
    }
  }
}
