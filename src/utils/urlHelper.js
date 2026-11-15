/**
 * Utility functions for normalizing and validating asset URLs
 */

/**
 * Normalizes image URLs from cloud storage providers (Dropbox, Google Drive)
 * to direct raw image streams suitable for HTML <img> and Discord embeds.
 *
 * @param {string} url 
 * @returns {string}
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Dropbox link normalization
  // e.g. https://www.dropbox.com/scl/fi/...?...&dl=0 -> replace dl=0 with raw=1
  if (trimmed.includes('dropbox.com')) {
    if (/[?&]dl=0\b/.test(trimmed)) {
      trimmed = trimmed.replace(/([?&])dl=0\b/, '$1raw=1');
    } else if (/[?&]dl=1\b/.test(trimmed)) {
      trimmed = trimmed.replace(/([?&])dl=1\b/, '$1raw=1');
    } else if (!/[?&]raw=1\b/.test(trimmed)) {
      trimmed += (trimmed.includes('?') ? '&' : '?') + 'raw=1';
    }
  }

  // 2. Google Drive link normalization
  // https://drive.google.com/file/d/FILE_ID/view... -> https://drive.google.com/uc?export=view&id=FILE_ID
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    trimmed = `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }

  return trimmed;
}

export const DEFAULT_ADS_BANNER = 'https://www.dropbox.com/scl/fi/xupmi5gdm1n7f5ycrxfmr/ads.png?rlkey=gayf189s0s6g976n2lmdvunja&st=dkqiabib&raw=1';
