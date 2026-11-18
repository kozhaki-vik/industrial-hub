/**
 * Utilities for theme management, color calculations, and CSS generation
 */

// Default custom theme values (based on dark graphite theme)
export const DEFAULT_CUSTOM_THEME = {
  bg: '#14191D',       // Основной фон программы
  surface: '#1B2024',  // Фон карточек и панелей
  secondary: '#272C31',// Фон полей ввода и внутренних блоков
  text: '#F1F5F9',     // Основной текст
  accent: '#3154E1',   // Кнопки и акценты
  border: '#3B4045'    // Рамки и границы
};

// Quick template presets to kickstart customization
export const THEME_TEMPLATES = [
  {
    id: 'graphite',
    name: 'Графит (Синий)',
    theme: {
      bg: '#14191D',
      surface: '#1B2024',
      secondary: '#272C31',
      text: '#F1F5F9',
      accent: '#3154E1',
      border: '#3B4045'
    }
  },
  {
    id: 'discord',
    name: 'Discord (Красный)',
    theme: {
      bg: '#2C2D32',
      surface: '#323339',
      secondary: '#282A2E',
      text: '#F1F5F9',
      accent: '#F45142',
      border: '#3F4147'
    }
  },
  {
    id: 'rust_orange',
    name: 'Rust (Оранжевый)',
    theme: {
      bg: '#121316',
      surface: '#1C1E24',
      secondary: '#282B33',
      text: '#F8FAFC',
      accent: '#F97316',
      border: '#373A45'
    }
  },
  {
    id: 'emerald',
    name: 'Изумруд (Зелёный)',
    theme: {
      bg: '#0F1715',
      surface: '#152420',
      secondary: '#1C332D',
      text: '#ECFDF5',
      accent: '#10B981',
      border: '#27473E'
    }
  },
  {
    id: 'amethyst',
    name: 'Неон (Фиолетовый)',
    theme: {
      bg: '#111019',
      surface: '#1B1728',
      secondary: '#27213B',
      text: '#F5F3FF',
      accent: '#8B5CF6',
      border: '#3B335A'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Киберпанк (Бирюза)',
    theme: {
      bg: '#0B1319',
      surface: '#121F29',
      secondary: '#1C2E3C',
      text: '#F0FDF4',
      accent: '#06B6D4',
      border: '#264257'
    }
  }
];

// Brand and UI color swatches available in the palette picker
export const BRAND_PALETTE = [
  // Industrial & Dark
  { hex: '#14191D', label: 'Тёмный фон' },
  { hex: '#1B2024', label: 'Тёмная карточка' },
  { hex: '#272C31', label: 'Тёмный инпут' },
  { hex: '#3B4045', label: 'Тёмная рамка' },
  // Discord
  { hex: '#2C2D32', label: 'Discord фон' },
  { hex: '#323339', label: 'Discord карточка' },
  { hex: '#3F4147', label: 'Discord рамка' },
  // Accents
  { hex: '#3154E1', label: 'Синий акцент' },
  { hex: '#F97316', label: 'Оранжевый' },
  { hex: '#F45142', label: 'Красный' },
  { hex: '#10B981', label: 'Изумруд' },
  { hex: '#8B5CF6', label: 'Фиолетовый' },
  { hex: '#06B6D4', label: 'Бирюзовый' },
  { hex: '#F59E0B', label: 'Янтарный' },
  { hex: '#EC4899', label: 'Розовый' },
  // Neutrals & Light
  { hex: '#FFFFFF', label: 'Белый' },
  { hex: '#F1F5F9', label: 'Светлый фон' },
  { hex: '#E2E8F0', label: 'Светлый инпут' },
  { hex: '#94A3B8', label: 'Приглушённый' },
  { hex: '#0F172A', label: 'Глубокий ночной' }
];

/**
 * Blend two hex colors together by factor (0 = hex1, 1 = hex2)
 */
export function blendColors(hex1, hex2, factor) {
  let h1 = (hex1 || '#000000').replace('#', '');
  if (h1.length === 3) h1 = h1.split('').map(c => c + c).join('');
  let h2 = (hex2 || '#000000').replace('#', '');
  if (h2.length === 3) h2 = h2.split('').map(c => c + c).join('');

  const c1 = parseInt(h1, 16) || 0;
  const c2 = parseInt(h2, 16) || 0;

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.min(255, Math.max(0, Math.round(r1 + (r2 - r1) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(g1 + (g2 - g1) * factor)));
  const b = Math.min(255, Math.max(0, Math.round(b1 + (b2 - b1) * factor)));

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Validates a hex color string
 */
export function isValidHex(hex) {
  if (typeof hex !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

/**
 * Normalizes input to 6-digit uppercase hex with leading '#'
 */
export function normalizeHex(hex) {
  if (!hex) return '#000000';
  let str = hex.trim();
  if (!str.startsWith('#')) str = '#' + str;
  if (str.length === 4) {
    str = '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
  }
  return str.toUpperCase();
}

/**
 * Generates CSS rules for the custom theme overriding Tailwind color variables
 */
export function generateThemeCss(theme) {
  if (!theme) return '';

  const bg = normalizeHex(theme.bg || DEFAULT_CUSTOM_THEME.bg);
  const surface = normalizeHex(theme.surface || DEFAULT_CUSTOM_THEME.surface);
  const secondary = normalizeHex(theme.secondary || DEFAULT_CUSTOM_THEME.secondary);
  const text = normalizeHex(theme.text || DEFAULT_CUSTOM_THEME.text);
  const accent = normalizeHex(theme.accent || DEFAULT_CUSTOM_THEME.accent);
  const border = normalizeHex(theme.border || DEFAULT_CUSTOM_THEME.border);

  return `
html.theme-custom {
  --color-slate-950: ${bg};
  --color-slate-900: ${surface};
  --color-slate-850: ${blendColors(surface, secondary, 0.4)};
  --color-slate-800: ${secondary};
  --color-slate-750: ${blendColors(secondary, border, 0.35)};
  --color-slate-700: ${border};
  --color-slate-600: ${blendColors(border, '#FFFFFF', 0.15)};

  --color-slate-100: ${text};
  --color-slate-200: ${blendColors(text, bg, 0.12)};
  --color-slate-300: ${blendColors(text, bg, 0.25)};
  --color-slate-400: ${blendColors(text, bg, 0.45)};
  --color-slate-500: ${blendColors(text, bg, 0.6)};

  --color-orange-50: ${blendColors(accent, '#FFFFFF', 0.9)};
  --color-orange-100: ${blendColors(accent, '#FFFFFF', 0.8)};
  --color-orange-200: ${blendColors(accent, '#FFFFFF', 0.6)};
  --color-orange-300: ${blendColors(accent, '#FFFFFF', 0.4)};
  --color-orange-400: ${blendColors(accent, '#FFFFFF', 0.2)};
  --color-orange-500: ${accent};
  --color-orange-600: ${blendColors(accent, '#000000', 0.15)};
  --color-orange-700: ${blendColors(accent, '#000000', 0.3)};
  --color-orange-800: ${blendColors(accent, '#000000', 0.45)};
  --color-orange-900: ${blendColors(accent, '#000000', 0.6)};
  --color-orange-950: ${blendColors(accent, '#000000', 0.75)};
}

html.theme-custom body {
  background-color: ${bg} !important;
  color: ${text} !important;
}

html.theme-custom .clan-manager-container {
  background-color: ${surface};
}

html.theme-custom .clan-manager-sidebar {
  background-color: ${bg};
}
`;
}
