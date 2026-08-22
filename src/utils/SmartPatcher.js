const electron = window.electronAPI ? window.electronAPI : null;
// The public key provided by the server
const SERVER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1ugeOQUlzsh6D3vctZUj
L7m9f/M7rN6cOBfuFhcrO3BYfHeOHUQ/9XCu9JZV3q4Ipn2BXJLeViCe1BKnVGNe
Y+pkRsxwBhw67niGh/P72/hZDBENaYfkDuNQCseEoaaEfIz/A30JYKegBTQBiZ+f
q/nCJF/VnWztwyjbC9zeS33pK3Sj3Ek7y0PVvzMouK2mnGGn/A86Ikc87KqNHNEH
Fp9zwoYTAHCHgl1xsRL27AmN3AIxf8MJIlLM8HYr3yGz0nkRHYuniQtXuFeoCZsQ
TMF7EMBe2fe2uFf4aCh21GXg2yj9Qj+NazQXXLyvNbXUUjShJV380p1bcNvOU9O1
YQIDAQAB
-----END PUBLIC KEY-----`;

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function importPublicKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(
    pem.indexOf(pemHeader) + pemHeader.length,
    pem.indexOf(pemFooter)
  ).replace(/\s/g, '');
  
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );
}

import { getConfigKey } from '../services/store';

export async function checkUpdates(addLog = () => {}) {
  if (!electron) {
    console.warn("SmartPatcher: Not running in Electron, updates disabled.");
    addLog("Not running in Electron, updates disabled.");
    return null;
  }

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
    const ghApiUrl = channel === 'test' 
      ? "https://api.github.com/repos/kozhaki-vik/industrial-hub/releases"
      : "https://api.github.com/repos/kozhaki-vik/industrial-hub/releases/latest";

    const ghRes = await fetch(ghApiUrl, { cache: 'no-store' });
    if (ghRes.ok) {
      let ghData = await ghRes.json();
      
      // If test channel, get the very first release from the array (can be prerelease or release)
      if (channel === 'test' && Array.isArray(ghData)) {
        ghData = ghData[0];
      }

      if (ghData && ghData.tag_name) {
        const tagVersion = ghData.tag_name.replace(/^v/, '');
        // Find the first .exe asset
        const asset = ghData.assets ? ghData.assets.find(a => a.name.endsWith('.exe')) : null;
        
        if (tagVersion && asset && asset.browser_download_url) {
          serverData = {
            version: tagVersion,
            clientUrl: asset.browser_download_url
          };
          addLog(`GitHub API success! Found version ${tagVersion}`);
        } else {
          addLog("GitHub release found, but missing .exe asset or tag_name.");
        }
      }
    } else {
      addLog(`GitHub API returned ${ghRes.status}`);
    }
  } catch (e) {
    addLog(`GitHub check failed: ${e.message}`);
  }

  if (!serverData) {
    addLog("Could not fetch version metadata from GitHub.");
    console.warn("SmartPatcher: Could not fetch version metadata from GitHub.");
    return null;
  }

  addLog(`Local version = ${localVersion}, Server version = ${serverData.version}`);
  console.log(`SmartPatcher: Local version = ${localVersion}, Server version = ${serverData.version}`);

  if (serverData.version && serverData.version !== localVersion) {
    addLog(`Versions differ! Will apply EXE auto-update from ${localVersion} to ${serverData.version}`);
    console.log(`SmartPatcher: Updating from ${localVersion} to ${serverData.version}...`);
    
    let exeUrl = serverData.clientUrl;
    
    addLog(`Invoking network:apply-exe-update with ${exeUrl}...`);
    try {
      const result = await electron.ipcRenderer.invoke('network:apply-exe-update', exeUrl, serverData.version);
      addLog(`Invoke returned: ${JSON.stringify(result)}`);
      console.log("SmartPatcher EXE Update Result:", result);
      return result;
    } catch (err) {
      addLog(`Invoke threw error: ${err.message}`);
      return { success: false, error: err.message };
    }
  } else {
    addLog("Versions match, no update needed.");
  }

  return null;
}

