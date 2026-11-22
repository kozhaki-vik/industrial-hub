const electron = window.electronAPI ? window.electronAPI : null;

import { getConfigKey } from '../services/store';
import { compareSemver } from './semver';

let isUpdating = false;
let isFirstCheck = true;

export async function checkUpdates(addLog = () => {}, force = false) {
  if (isUpdating && !force) return null;
  
  if (!electron) {
    console.warn("SmartPatcher: Not running in Electron, updates disabled.");
    addLog("Not running in Electron, updates disabled.");
    isFirstCheck = false;
    return null;
  }

  isUpdating = true;
  addLog("Getting local app version...");
  let localVersion = '1.0.0';
  try {
    const versionInfo = await electron.ipcRenderer.invoke('diagnostics:getAppVersionInfo');
    if (versionInfo && versionInfo.version) {
      localVersion = versionInfo.version;
    }
    addLog(`Local version is ${localVersion}`);
  } catch (e) {
    addLog(`Failed to get local version: ${e.message}`);
    console.warn('SmartPatcher: failed to get local version', e);
  }

  const channel = getConfigKey('updateChannel') || 'main';
  addLog(`Update channel is set to: ${channel}`);

  let serverData = null;

  try {
    const repos = ['kozhaki-vik/industrial-hub', 'kozhaki-vik/industrial-hub-releases'];
    for (const repo of repos) {
      const ghApiUrl = `https://api.github.com/repos/${repo}/releases?per_page=15&t=${Date.now()}`;

      try {
        const ghRes = await fetch(ghApiUrl, { cache: 'no-store' });
        if (ghRes.ok) {
          let ghData = await ghRes.json();
          let candidateReleases = [];

          if (Array.isArray(ghData)) {
            const nonDrafts = ghData.filter(r => r && !r.draft);
            if (channel === 'main') {
              // Prefer stable releases (prerelease === false) if newer than local
              const stables = nonDrafts.filter(r => !r.prerelease);
              stables.sort((a, b) => compareSemver((b.tag_name || '').replace(/^v/, ''), (a.tag_name || '').replace(/^v/, '')));

              if (stables.length > 0 && compareSemver(stables[0].tag_name.replace(/^v/, ''), localVersion) > 0) {
                candidateReleases = stables;
              } else {
                nonDrafts.sort((a, b) => compareSemver((b.tag_name || '').replace(/^v/, ''), (a.tag_name || '').replace(/^v/, '')));
                candidateReleases = nonDrafts;
              }
            } else {
              nonDrafts.sort((a, b) => compareSemver((b.tag_name || '').replace(/^v/, ''), (a.tag_name || '').replace(/^v/, '')));
              candidateReleases = nonDrafts;
            }
          }

          for (const release of candidateReleases) {
            if (release && release.tag_name) {
              const tagVersion = release.tag_name.replace(/^v/, '');
              // STRICTLY pick the standalone/portable executable for in-place auto-update.
              // NEVER select Setup or installer binaries for background in-place updates!
              const asset = release.assets
                ? release.assets.find(a => a.name.endsWith('.exe') && !a.name.toLowerCase().includes('setup') && !a.name.toLowerCase().includes('unins'))
                : null;

              if (tagVersion && asset && asset.browser_download_url) {
                serverData = {
                  version: tagVersion,
                  clientUrl: asset.browser_download_url,
                  isPreRelease: !!release.prerelease
                };
                addLog(`GitHub API success! Found version ${tagVersion}${release.prerelease ? ' (Pre-release)' : ''} from ${repo}`);
                break;
              }
            }
          }

          if (serverData) break;
        } else {
          addLog(`GitHub API (${repo}) returned ${ghRes.status}`);
        }
      } catch (repoErr) {
        addLog(`GitHub check failed for ${repo}: ${repoErr.message}`);
      }
    }
  } catch (e) {
    addLog(`Update check loop failed: ${e.message}`);
  }

  if (!serverData) {
    addLog("Could not fetch version metadata from GitHub.");
    console.warn("SmartPatcher: Could not fetch version metadata from GitHub.");
    isUpdating = false;
    isFirstCheck = false;
    return null;
  }

  addLog(`Local version = ${localVersion}, Server version = ${serverData.version}`);
  console.log(`SmartPatcher: Local version = ${localVersion}, Server version = ${serverData.version}`);

  const shouldUpdate = force || (serverData.version && compareSemver(serverData.version, localVersion) > 0);

  if (shouldUpdate) {
    let applyImmediately = true;
    if (!force && electron?.config?.isRustRunning) {
      const isRustOpen = await electron.config.isRustRunning();
      if (isRustOpen) {
        applyImmediately = false;
        addLog("Rust is running. Update will be downloaded but not applied immediately.");
      }
    }
    
    isFirstCheck = false;
    if (force) {
      addLog(`[Force Update] Force reinstalling version ${serverData.version} (channel: ${channel})`);
    } else {
      addLog(`Versions differ! Will apply EXE auto-update from ${localVersion} to ${serverData.version}`);
    }
    console.log(`SmartPatcher: Updating from ${localVersion} to ${serverData.version} (force=${force})...`);
    
    let exeUrl = serverData.clientUrl;
    
    addLog(`Invoking network:apply-exe-update with ${exeUrl} (force=${force})...`);
    try {
      const result = await electron.ipcRenderer.invoke('network:apply-exe-update', exeUrl, serverData.version, applyImmediately, force);
      addLog(`Invoke returned: ${JSON.stringify(result)}`);
      console.log("SmartPatcher EXE Update Result:", result);
      isUpdating = false;
      return result;
    } catch (err) {
      addLog(`Invoke threw error: ${err.message}`);
      isUpdating = false;
      return { success: false, error: err.message };
    }
  } else {
    addLog("Versions match, no update needed.");
  }

  isUpdating = false;
  isFirstCheck = false;
  return null;
}
