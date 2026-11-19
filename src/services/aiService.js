/**
 * Industrial Hub - AI Proofreading & Banner Presets Service
 * Communicates with Industrial Hub Server for AI-powered text analysis and banner presets.
 */

const PUBLIC_API_BASE = 'https://industrial-hub.duckdns.org';

const getApiBases = () => {
  return [PUBLIC_API_BASE, 'http://127.0.0.1:8080'];
};

/**
 * Fallback static list of Rust banner presets
 */
export const FALLBACK_PRESET_BANNERS = [
  {
    id: 'rust_oil_rig',
    title: 'Большая нефтянка (Large Oil Rig)',
    desc: 'Культовый монумент с ящиками и учеными',
    fileName: 'rust_oil_rig.jpg'
  },
  {
    id: 'rust_launch_site',
    title: 'Космодром (Launch Site)',
    desc: 'Главное здание и Брэдли',
    fileName: 'rust_launch_site.jpg'
  },
  {
    id: 'rust_raid',
    title: 'Клановый рейд (Clan Raid)',
    desc: 'Ракетный обстрел базы клана',
    fileName: 'rust_raid.jpg'
  },
  {
    id: 'rust_military_tunnels',
    title: 'Военные туннели (Military Tunnels)',
    desc: 'Подземные бои и элитный лут',
    fileName: 'rust_military_tunnels.webp'
  },
  {
    id: 'rust_arctic_base',
    title: 'Арктическая база (Arctic Research Base)',
    desc: 'Снежный биом и снегоходы',
    fileName: 'rust_arctic_base.jpg'
  },
  {
    id: 'rust_airfield',
    title: 'Аэродром (Airfield)',
    desc: 'Ангары, взлетная полоса и вышки',
    fileName: 'rust_airfield.webp'
  },
  {
    id: 'rust_dome',
    title: 'Сфера (The Dome)',
    desc: 'Индустриальная цистерна и панорама острова',
    fileName: 'rust_dome.webp'
  },
  {
    id: 'rust_excavator',
    title: 'Экскаватор (Giant Excavator)',
    desc: 'Добыча тонн ресурсов дизелем',
    fileName: 'rust_excavator.jpg'
  }
];

/**
 * Sends recruitment text to server for AI proofreading and Markdown detection.
 * Sequentially processed by Gemini -> Groq -> OpenRouter on the server.
 * 
 * @param {string} text Text to analyze
 * @param {boolean} currentMarkdown Current markdown toggle status
 * @returns {Promise<{ success: boolean, provider?: string, providerName?: string, data?: { improvedText: string, suggestedMarkdown: boolean, hasChanges: boolean, summary: string }, error?: string }>}
 */
export async function proofreadRecruitmentText(text, currentMarkdown = true) {
  if (!text || !text.trim()) {
    return { success: false, error: 'Введите текст перед запуском анализа' };
  }

  const bases = getApiBases();
  let lastError = null;

  for (const base of bases) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const resp = await fetch(`${base}/api/ai/proofread-recruitment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          text: text.trim(),
          currentMarkdown: Boolean(currentMarkdown)
        })
      });
      clearTimeout(timeout);

      let json = null;
      try {
        json = await resp.json();
      } catch {
        json = null;
      }

      if (!resp.ok || !json?.success) {
        return {
          success: false,
          error: json?.error || `Ошибка сервера (${resp.status})`
        };
      }

      return json;
    } catch (err) {
      lastError = err;
      // Network refused or abort -> try next base
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Не удалось связаться с сервером анализа'
  };
}

/**
 * Retrieves list of preset Rust banners from server (or returns fallback list).
 */
export async function getPresetBanners() {
  const bases = getApiBases();
  for (const base of bases) {
    try {
      const resp = await fetch(`${base}/api/banners/presets`, { signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && Array.isArray(json.presets)) {
          return json.presets.map(p => ({
            ...p,
            fullUrl: `${PUBLIC_API_BASE}/presets/banners/${p.fileName}`,
            previewUrl: `/presets/banners/${p.fileName}`
          }));
        }
      }
    } catch {}
  }

  // Fallback if server is not reachable
  return FALLBACK_PRESET_BANNERS.map(p => ({
    ...p,
    fullUrl: `${PUBLIC_API_BASE}/presets/banners/${p.fileName}`,
    previewUrl: `/presets/banners/${p.fileName}`
  }));
}
