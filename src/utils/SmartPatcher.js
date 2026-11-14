const electron = window.electronAPI ? window.electronAPI : null;

import { getConfigKey } from '../services/store';

let isUpdating = false;
let isFirstCheck = true;

export async function checkUpdates(addLog = () => {}) {
  if (isUpdating) return null;
  
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
      const ghApiUrl = channel === 'main' 
        ? `https://api.github.com/repos/${repo}/releases/latest?t=${Date.now()}`
        : `https://api.github.com/repos/${repo}/releases?t=${Date.now()}`;

      try {
        const ghRes = await fetch(ghApiUrl, { cache: 'no-store' });
        if (ghRes.ok) {
          let ghData = await ghRes.json();
          
          // If test channel, get the very first release from the array (can be prerelease or release)
          if (channel === 'test' && Array.isArray(ghData)) {
            ghData = ghData[0];
          }

          if (ghData && ghData.tag_name) {
            const tagVersion = ghData.tag_name.replace(/^v/, '');
            // Prioritize portable executable over installer setup
            const asset = ghData.assets
              ? (ghData.assets.find(a => a.name.endsWith('.exe') && !a.name.toLowerCase().includes('setup') && !a.name.toLowerCase().includes('unins'))
                 || ghData.assets.find(a => a.name.endsWith('.exe')))
              : null;
            
            if (tagVersion && asset && asset.browser_download_url) {
              serverData = {
                version: tagVersion,
                clientUrl: asset.browser_download_url
              };
              addLog(`GitHub API success! Found version ${tagVersion} from ${repo}`);
              break;
            } else {
              addLog(`GitHub release in ${repo} found, but missing suitable .exe asset or tag_name.`);
            }
          }
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

  const compareVersions = (v1, v2) => {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((p1[i] || 0) > (p2[i] || 0)) return 1;
      if ((p1[i] || 0) < (p2[i] || 0)) return -1;
    }
    return 0;
  };

  if (serverData.version && compareVersions(serverData.version, localVersion) > 0) {
    let applyImmediately = true;
    if (!isFirstCheck) {
      if (electron.config && electron.config.isRustRunning) {
        const isRustOpen = await electron.config.isRustRunning();
        if (isRustOpen) {
          applyImmediately = false;
          addLog("Rust is running. Update will be downloaded but not applied immediately.");
        }
      }
    }
    
    isFirstCheck = false;
    addLog(`Versions differ! Will apply EXE auto-update from ${localVersion} to ${serverData.version}`);
    console.log(`SmartPatcher: Updating from ${localVersion} to ${serverData.version}...`);
    
    let exeUrl = serverData.clientUrl;
    
    addLog(`Invoking network:apply-exe-update with ${exeUrl}...`);
    try {
      const result = await electron.ipcRenderer.invoke('network:apply-exe-update', exeUrl, serverData.version, applyImmediately);
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

