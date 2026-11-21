/**
 * Discord API Embed and Component Validation Helpers
 * Validates fields according to Discord's official limits and formatting rules.
 */

export const DISCORD_LIMITS = {
  TITLE_MAX: 256,
  DESCRIPTION_MAX: 4096,
  FOOTER_MAX: 2048,
  BUTTON_LABEL_MAX: 80,
  DM_MESSAGE_MAX: 2000,
  TOTAL_EMBED_MAX: 6000,
  MODAL_TITLE_MAX: 45,
  TEXT_INPUT_LABEL_MAX: 45,
  TEXT_INPUT_PLACEHOLDER_MAX: 100,
  MODAL_MAX_FIELDS: 5
};

/**
 * Strips dangerous null bytes and unsupported control characters that can break Discord JSON API.
 * Preserves normal newlines (\n, \r) and tabs.
 * @param {string} str
 * @returns {string}
 */
export function cleanDiscordText(str) {
  if (!str || typeof str !== 'string') return '';
  // Remove null characters and non-printable control characters except \t, \n, \r
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validates a Discord Embed title
 * @param {string} title
 * @returns {{ isValid: boolean, error: string | null, length: number, max: number }}
 */
export function validateEmbedTitle(title) {
  const val = (title || '').trim();
  const length = (title || '').length;
  if (!val) {
    return {
      isValid: false,
      error: 'Заголовок сообщения не должен быть пустым.',
      length,
      max: DISCORD_LIMITS.TITLE_MAX
    };
  }
  if (length > DISCORD_LIMITS.TITLE_MAX) {
    return {
      isValid: false,
      error: `Превышен лимит Discord: ${length}/${DISCORD_LIMITS.TITLE_MAX} символов. Сократите заголовок.`,
      length,
      max: DISCORD_LIMITS.TITLE_MAX
    };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.TITLE_MAX };
}

/**
 * Validates a Discord Embed description / requirements text
 * @param {string} text
 * @param {boolean} includeMetadata
 * @param {number} estimatedMetadataLength
 * @returns {{ isValid: boolean, error: string | null, length: number, totalLength: number, max: number }}
 */
export function validateEmbedDescription(text, includeMetadata = true, estimatedMetadataLength = 80) {
  const length = (text || '').length;
  const totalLength = length + (includeMetadata ? estimatedMetadataLength : 0);

  if (!text || !text.trim()) {
    return {
      isValid: true,
      warning: 'Текст с требованиями пуст. Рекомендуется заполнить описание набора.',
      error: null,
      length,
      totalLength,
      max: DISCORD_LIMITS.DESCRIPTION_MAX
    };
  }

  if (totalLength > DISCORD_LIMITS.DESCRIPTION_MAX) {
    return {
      isValid: false,
      error: `Превышен лимит Discord: общее описание (${totalLength} симв.) превышает лимит ${DISCORD_LIMITS.DESCRIPTION_MAX} символов. Discord отклонит такое сообщение.`,
      length,
      totalLength,
      max: DISCORD_LIMITS.DESCRIPTION_MAX
    };
  }

  return { isValid: true, error: null, length, totalLength, max: DISCORD_LIMITS.DESCRIPTION_MAX };
}

/**
 * Validates image URL for Discord Embed banner.
 * Discord strictly rejects web pages, Google forms, youtube, etc.
 * @param {string} url
 * @returns {{ isValid: boolean, error: string | null, warning: string | null }}
 */
export function validateBannerImageUrl(url) {
  if (!url || !url.trim()) {
    return { isValid: true, error: null, warning: null };
  }

  const trimmed = url.trim();

  // Local server uploaded banners or presets are always valid
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/presets/') || trimmed.startsWith('data:image/')) {
    return { isValid: true, error: null, warning: null };
  }

  // Must begin with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Ссылка на изображение должна начинаться с https:// или http://',
      warning: null
    };
  }

  // Check for common non-image web services like Google Forms
  if (/forms\.gle|docs\.google\.com\/forms|google\.com\/forms/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Указана ссылка на Google Форму. Discord не поддерживает ссылки на сайты и веб-формы в качестве баннера — изображение не будет отображаться. Укажите прямую ссылку на файл (.png, .jpg, .webp, .gif) или загрузите баннер с ПК.',
      warning: null
    };
  }

  // Check for video or social media page URLs
  if (/(?:youtube\.com|youtu\.be|tiktok\.com|twitch\.tv|instagram\.com|reddit\.com|t\.me)\b/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Ссылка ведёт на сторонний сервис или веб-страницу, а не на файл изображения. Discord требует прямую ссылку на графический файл.',
      warning: null
    };
  }

  // Known trusted image hosts or direct query formats
  const isKnownImageHost = /(?:i\.imgur\.com|imgur\.com|cdn\.discordapp\.com|media\.discordapp\.net|images-ext-\d+\.discordapp\.net|sun\d+-\d+\.userapi\.com|drive\.google\.com\/uc|dropbox\.com.*raw=1)/i.test(trimmed);
  const hasImageExtension = /\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(trimmed);

  if (!isKnownImageHost && !hasImageExtension) {
    return {
      isValid: false,
      error: null,
      warning: 'Ссылка не имеет расширения изображения (.png, .jpg, .webp, .gif). Если это обычная веб-страница, Discord не сможет отобразить её как баннер.'
    };
  }

  return { isValid: true, error: null, warning: null };
}

/**
 * Validates a Discord invite URL
 * @param {string} url
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateDiscordInviteUrl(url) {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: 'Ссылка на сервер не указана. Сгенерируйте ссылку через бота или укажите ссылку-приглашение Discord.'
    };
  }

  const trimmed = url.trim();
  const isDiscordInvite = /^https?:\/\/(?:www\.)?(?:discord\.gg\/[a-zA-Z0-9_-]+|discord(?:app)?\.com\/invite\/[a-zA-Z0-9_-]+)/i.test(trimmed);

  if (!isDiscordInvite) {
    return {
      isValid: false,
      error: 'Ссылка должна быть приглашением на сервер Discord (например: https://discord.gg/yourclan).'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates Discord snowflake User ID (17-20 digits)
 * @param {string} id
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateDiscordUserId(id) {
  if (!id || !id.trim()) {
    return { isValid: true, error: null };
  }

  const trimmed = id.trim();
  if (!/^\d{17,20}$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Discord ID пользователя должен состоять только из 17–20 цифр (например: 718872288000000000).'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates Discord Embed footer
 * @param {string} footer
 * @returns {{ isValid: boolean, error: string | null, length: number, max: number }}
 */
export function validateEmbedFooter(footer) {
  const length = (footer || '').length;
  if (length > DISCORD_LIMITS.FOOTER_MAX) {
    return {
      isValid: false,
      error: `Превышен лимит футера: ${length}/${DISCORD_LIMITS.FOOTER_MAX} символов.`,
      length,
      max: DISCORD_LIMITS.FOOTER_MAX
    };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.FOOTER_MAX };
}

/**
 * Validates Discord button label (max 80 chars)
 * @param {string} label
 * @returns {{ isValid: boolean, error: string | null, length: number, max: number }}
 */
export function validateButtonLabel(label) {
  const length = (label || '').length;
  if (length > DISCORD_LIMITS.BUTTON_LABEL_MAX) {
    return {
      isValid: false,
      error: `Превышен лимит названия кнопки: ${length}/${DISCORD_LABEL_MAX || 80} символов (максимум 80).`,
      length,
      max: DISCORD_LIMITS.BUTTON_LABEL_MAX
    };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.BUTTON_LABEL_MAX };
}

/**
 * Validates auto-reject message for DM (max 2000 chars)
 * @param {string} msg
 * @returns {{ isValid: boolean, error: string | null, length: number, max: number }}
 */
export function validateAutoRejectMessage(msg) {
  const length = (msg || '').length;
  if (length > DISCORD_LIMITS.DM_MESSAGE_MAX) {
    return {
      isValid: false,
      error: `Превышен лимит личного сообщения Discord: ${length}/${DISCORD_LIMITS.DM_MESSAGE_MAX} символов.`,
      length,
      max: DISCORD_LIMITS.DM_MESSAGE_MAX
    };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.DM_MESSAGE_MAX };
}

/**
 * Validates Discord Modal window title (max 45 chars)
 * @param {string} title
 */
export function validateModalTitle(title) {
  const length = (title || '').length;
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Заголовок модального окна не может быть пустым', length, max: DISCORD_LIMITS.MODAL_TITLE_MAX };
  }
  if (length > DISCORD_LIMITS.MODAL_TITLE_MAX) {
    return { isValid: false, error: `Превышен лимит заголовка формы: ${length}/${DISCORD_LIMITS.MODAL_TITLE_MAX} символов (максимум 45).`, length, max: DISCORD_LIMITS.MODAL_TITLE_MAX };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.MODAL_TITLE_MAX };
}

/**
 * Validates Discord Modal text input label (max 45 chars)
 * @param {string} label
 */
export function validateModalFieldLabel(label) {
  const length = (label || '').length;
  if (!label || !label.trim()) {
    return { isValid: false, error: 'Название поля не может быть пустым', length, max: DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX };
  }
  if (length > DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX) {
    return { isValid: false, error: `Превышен лимит названия поля: ${length}/${DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX} символов (максимум 45).`, length, max: DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.TEXT_INPUT_LABEL_MAX };
}

/**
 * Validates Discord Modal text input placeholder (max 100 chars)
 * @param {string} placeholder
 */
export function validateModalFieldPlaceholder(placeholder) {
  const length = (placeholder || '').length;
  if (length > DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX) {
    return { isValid: false, error: `Превышен лимит подсказки: ${length}/${DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX} символов (максимум 100).`, length, max: DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX };
  }
  return { isValid: true, error: null, length, max: DISCORD_LIMITS.TEXT_INPUT_PLACEHOLDER_MAX };
}
