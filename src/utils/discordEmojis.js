import React from 'react';

/**
 * Local Discord Application Custom Emoji Resolver
 * Maps custom emojis (by ID, full string <:name:id>, or name) to local bundled White PNG assets.
 */

// Mapping of filenames in /emojis/
const EMOJI_FILES = {
  'adjustments-horizontal': 'adjustments-horizontal.png',
  'alarm': 'alarm.png',
  'alert-circle': 'alert-circle.png',
  'alert-triangle': 'alert-triangle.png',
  'align-center-justified': 'align-center-justified.png',
  'arrow-back-up': 'arrow-back-up.png',
  'arrow-left': 'arrow-left.png',
  'arrow-narrow-right': 'arrow-narrow-right.png',
  'arrow-right': 'arrow-right.png',
  'barbell': 'barbell.png',
  'bell': 'bell.png',
  'bolt': 'bolt.png',
  'brand-youtube': 'brand-youtube.png',
  'bulb': 'bulb.png',
  'calendar-week': 'calendar-week.png',
  'cash': 'cash.png',
  'checks': 'checks.png',
  'chevron-left': 'chevron-left.png',
  'chevron-right': 'chevron-right.png',
  'circle-check': 'circle-check.png',
  'clipboard-text': 'clipboard-text.png',
  'clock': 'clock.png',
  'cloud-upload': 'cloud-upload.png',
  'code': 'code.png',
  'copy': 'copy.png',
  'credit-card': 'credit-card.png',
  'crown': 'crown.png',
  'database': 'database.png',
  'device-desktop-analytics': 'device-desktop-analytics.png',
  'device-desktop': 'device-desktop.png',
  'device-mobile': 'device-mobile.png',
  'dots-vertical': 'dots-vertical.png',
  'dots': 'dots.png',
  'download': 'download.png',
  'edit': 'edit.png',
  'external-link': 'external-link.png',
  'eye': 'eye.png',
  'file-description': 'file-description.png',
  'file-export': 'file-export.png',
  'flag': 'flag.png',
  'flame': 'flame.png',
  'folder': 'folder.png',
  'headphones-off': 'headphones-off.png',
  'headphones': 'headphones.png',
  'heart': 'heart.png',
  'hourglass-empty': 'hourglass-empty.png',
  'info-circle': 'info-circle.png',
  'link': 'link.png',
  'list-check': 'list-check.png',
  'list-details': 'list-details.png',
  'list-search': 'list-search.png',
  'list': 'list.png',
  'loader': 'loader.png',
  'lock-open': 'lock-open.png',
  'lock': 'lock.png',
  'menu-2': 'menu-2.png',
  'message': 'message.png',
  'microphone-off': 'microphone-off.png',
  'microphone': 'microphone.png',
  'moon': 'moon.png',
  'music': 'music.png',
  'pencil': 'pencil.png',
  'phone': 'phone.png',
  'photo': 'photo.png',
  'pin': 'pin.png',
  'player-play': 'player-play.png',
  'plus': 'plus.png',
  'refresh': 'refresh.png',
  'repeat': 'repeat.png',
  'rosette-discount-check': 'rosette-discount-check.png',
  'scan': 'scan.png',
  'search': 'search.png',
  'send': 'send.png',
  'share-3': 'share-3.png',
  'speakerphone': 'speakerphone.png',
  'star': 'star.png',
  'sun': 'sun.png',
  'thumb-down-off': 'thumb-down-off.png',
  'thumb-down': 'thumb-down.png',
  'thumb-up-off': 'thumb-up-off.png',
  'thumb-up': 'thumb-up.png',
  'trash': 'trash.png',
  'user-circle': 'user-circle.png',
  'user-plus': 'user-plus.png',
  'user': 'user.png',
  'users': 'users.png',
  'volume': 'volume.png',
  'x': 'x.png'
};

// Known Discord Application Emoji IDs
const APP_EMOJI_IDS = {
  '1571506575640891414': 'x.png',
  '1571506574428475482': 'volume.png',
  '1571506572931371048': 'users.png',
  '1571506571442135192': 'user-plus.png',
  '1571506569705824367': 'user-circle.png',
  '1571506568275558511': 'user.png',
  '1571506566476070942': 'trash.png',
  '1571506565079367740': 'thumb-up-off.png',
  '1571506563703767040': 'thumb-up.png',
  '1571506561837179021': 'thumb-down-off.png',
  '1571506560839196703': 'thumb-down.png',
  '1571506559454937148': 'sun.png',
  '1571506557857046669': 'star.png',
  '1571506556254552156': 'speakerphone.png',
  '1571506553297567775': 'share-3.png',
  '1571506551242494013': 'send.png',
  '1571506549753520229': 'search.png',
  '1571506547597516850': 'scan.png',
  '1571506545936830544': 'rosette-discount-check.png',
  '1571506544107856043': 'repeat.png',
  '1571506542619136120': 'refresh.png',
  '1571506541239074906': 'plus.png',
  '1571506539938844832': 'player-play.png',
  '1571506537304952933': 'pin.png',
  '1571506521160818788': 'photo.png',
  '1571506519432888401': 'phone.png',
  '1571506518170406962': 'pencil.png',
  '1571506516819972188': 'music.png',
  '1571506501435261040': 'moon.png',
  '1571506499862405271': 'microphone-off.png',
  '1571506498360582304': 'microphone.png',
  '1571506496964010086': 'message.png',
  '1571506495802052708': 'menu-2.png',
  '1571506494464335913': 'lock-open.png',
  '1571506492824223904': 'lock.png',
  '1571506491125534730': 'loader.png',
  '1571506489376505997': 'list-search.png',
  '1571506487929606224': 'list-details.png',
  '1571506486302220299': 'list-check.png',
  '1571506484859375697': 'list.png',
  '1571506483718258850': 'link.png',
  '1571506482585927770': 'info-circle.png',
  '1571506480337915914': 'hourglass-empty.png',
  '1571506478873845770': 'heart.png',
  '1571506477359964241': 'headphones-off.png',
  '1571506475497422898': 'headphones.png',
  '1571506474151313528': 'folder.png',
  '1571506472679121037': 'flame.png',
  '1571506471412174998': 'flag.png',
  '1571506470074187836': 'file-export.png',
  '1571506468723761233': 'file-description.png',
  '1571506467482243132': 'eye.png',
  '1571506465749999640': 'external-link.png',
  '1571506464743493703': 'edit.png',
  '1571506463476678858': 'download.png',
  '1571506461991768075': 'dots-vertical.png',
  '1571506460498727103': 'dots.png',
  '1571506459152486533': 'device-mobile.png',
  '1571506457612910592': 'device-desktop-analytics.png',
  '1571506456048566354': 'device-desktop.png',
  '1571506454735626291': 'database.png',
  '1571506453418610900': 'crown.png',
  '1571506451644547184': 'credit-card.png',
  '1571506450159763568': 'copy.png',
  '1571506448498692177': 'code.png',
  '1571506447496249484': 'cloud-upload.png',
  '1571506445999017984': 'clock.png',
  '1571506444597985380': 'clipboard-text.png',
  '1571506443180310600': 'circle-check.png',
  '1571506442052182036': 'chevron-right.png',
  '1571506440521256991': 'chevron-left.png',
  '1571506438835273788': 'checks.png',
  '1571506437425860760': 'cash.png',
  '1571506385412423851': 'cash.png',
  '1571506435991543818': 'calendar-week.png',
  '1571506433705386134': 'bulb.png',
  '1571506432493359134': 'brand-youtube.png',
  '1571506431285526608': 'bolt.png',
  '1571506429951615016': 'bell.png',
  '1571506428466692106': 'barbell.png',
  '1571506427220983848': 'arrow-right.png',
  '1571506425614831707': 'arrow-narrow-right.png',
  '1571506424289431722': 'arrow-left.png',
  '1571506422737277049': 'arrow-back-up.png',
  '1571506421277663423': 'align-center-justified.png',
  '1571506419998396568': 'alert-triangle.png',
  '1571506418832384080': 'alert-circle.png',
  '1571506417225957537': 'alarm.png',
  '1571506416152219658': 'adjustments-horizontal.png',
  '1571506352935932066': 'adjustments-horizontal.png'
};

// Mapping of common unicode emojis to local White PNG assets
const UNICODE_TO_FILE = {
  '📢': 'speakerphone.png',
  '📅': 'calendar-week.png',
  '⏰': 'clock.png',
  '⏱️': 'clock.png',
  '⏱': 'clock.png',
  '🔒': 'lock.png',
  '🔓': 'lock-open.png',
  '👥': 'users.png',
  '👤': 'user.png',
  '⚙️': 'adjustments-horizontal.png',
  '⚙': 'adjustments-horizontal.png',
  '💰': 'cash.png',
  '💵': 'cash.png',
  '📝': 'edit.png',
  '✏️': 'edit.png',
  '🗑️': 'trash.png',
  '🗑': 'trash.png',
  '🔍': 'search.png',
  '⭐': 'star.png',
  '❤️': 'heart.png',
  '🔥': 'flame.png',
  '⚡': 'bolt.png',
  '🔔': 'bell.png',
  '📌': 'pin.png',
  'ℹ️': 'info-circle.png',
  'ℹ': 'info-circle.png',
  '❓': 'info-circle.png',
  '🔄': 'refresh.png',
  '🔗': 'link.png',
  '↗️': 'external-link.png',
  '🎧': 'headphones.png',
  '🎙️': 'microphone.png',
  '🎤': 'microphone.png',
  '🔊': 'volume.png',
  '✅': 'circle-check.png',
  '❌': 'x.png',
  '⚠️': 'alert-triangle.png',
  '🚨': 'alert-circle.png'
};

/**
 * Resolves an emoji value (string, ID, custom discord emoji syntax, or object) to a renderable object.
 * Returns:
 * { type: 'local', url: './emojis/filename.png', alt: string }
 * | { type: 'cdn', url: 'https://cdn.discordapp.com/emojis/id.png', alt: string }
 * | { type: 'unicode', text: string }
 * | null
 */
export function resolveDiscordEmoji(emojiValue) {
  if (!emojiValue) return null;

  // Handle object { id, name }
  if (typeof emojiValue === 'object') {
    const objId = emojiValue.id ? String(emojiValue.id).trim() : '';
    const objName = emojiValue.name ? String(emojiValue.name).trim() : '';
    if (objId && APP_EMOJI_IDS[objId]) {
      return { type: 'local', url: `./emojis/${APP_EMOJI_IDS[objId]}`, alt: `:${objName || 'emoji'}:` };
    }
    if (objName) {
      const match = findLocalByName(objName);
      if (match) return match;
    }
    if (objId) {
      return {
        type: 'cdn',
        url: `https://cdn.discordapp.com/emojis/${objId}.png?size=48&quality=lossless`,
        alt: `:${objName || 'emoji'}:`
      };
    }
    if (objName) {
      return { type: 'unicode', text: objName };
    }
    return null;
  }

  let str = String(emojiValue).trim();
  if (!str) return null;

  // Strip enclosing angle brackets if present: <a:name:id> or <:name:id>
  if (str.startsWith('<') && str.endsWith('>')) {
    str = str.slice(1, -1).trim();
  }
  // Strip leading colon if left over from <:name:id>
  if (str.startsWith(':')) {
    str = str.slice(1).trim();
  }

  // Check custom syntax: (a?:)?([a-zA-Z0-9_-]+)\s*[:=]\s*(\d+)
  // Matches <:speakerphone:1571506556254552156>, speakerphone: 1571506556254552156, speakerphone:1571506556254552156, a:name:id
  const pairMatch = str.match(/^(?:a:)?([a-zA-Z0-9_.-]+)\s*:\s*(\d{16,22})$/i);
  if (pairMatch) {
    const name = pairMatch[1].toLowerCase();
    const id = pairMatch[2];

    // Check by ID first
    if (APP_EMOJI_IDS[id]) {
      return { type: 'local', url: `./emojis/${APP_EMOJI_IDS[id]}`, alt: `:${name}:` };
    }

    // Check by name
    const match = findLocalByName(name);
    if (match) return match;

    // Fallback to Discord CDN
    return {
      type: 'cdn',
      url: `https://cdn.discordapp.com/emojis/${id}.png?size=48&quality=lossless`,
      alt: `:${name}:`
    };
  }

  // Check if string is pure snowflake digits (17-21 digits)
  if (/^\d{16,22}$/.test(str)) {
    if (APP_EMOJI_IDS[str]) {
      return { type: 'local', url: `./emojis/${APP_EMOJI_IDS[str]}`, alt: 'emoji' };
    }
    return {
      type: 'cdn',
      url: `https://cdn.discordapp.com/emojis/${str}.png?size=48&quality=lossless`,
      alt: 'emoji'
    };
  }

  // Check by name or key (e.g. 'speakerphone', 'calendar-week', 'calendarweek', ':speakerphone:')
  const byName = findLocalByName(str);
  if (byName) return byName;

  // Check unicode to local map
  if (UNICODE_TO_FILE[str]) {
    return { type: 'local', url: `./emojis/${UNICODE_TO_FILE[str]}`, alt: str };
  }

  // Default: Treat as standard Unicode emoji (e.g. 🤝, 🟢, 📝, 🔴, ⏳, etc.)
  return { type: 'unicode', text: str };
}

function findLocalByName(rawName) {
  if (!rawName) return null;
  const clean = rawName.replace(/^:+|:+$/g, '').toLowerCase().trim();
  const normalized = clean.replace(/_/g, '-').replace(/\s+/g, '-');
  const compact = clean.replace(/[^a-z0-9]/g, '');

  for (const [key, filename] of Object.entries(EMOJI_FILES)) {
    if (key === clean || key === normalized || key.replace(/[^a-z0-9]/g, '') === compact) {
      return { type: 'local', url: `./emojis/${filename}`, alt: `:${clean}:` };
    }
  }
  return null;
}

export const APP_EMOJI_NAME_TO_ID = {
  x_: '1571506575640891414',
  x: '1571506575640891414',
  volume: '1571506574428475482',
  users: '1571506572931371048',
  userplus: '1571506571442135192',
  'user-plus': '1571506571442135192',
  usercircle: '1571506569705824367',
  'user-circle': '1571506569705824367',
  user: '1571506568275558511',
  trash: '1571506566476070942',
  thumbupoff: '1571506565079367740',
  'thumb-up-off': '1571506565079367740',
  thumbup: '1571506563703767040',
  'thumb-up': '1571506563703767040',
  thumbdownoff: '1571506561837179021',
  'thumb-down-off': '1571506561837179021',
  thumbdown: '1571506560839196703',
  'thumb-down': '1571506560839196703',
  sun: '1571506559454937148',
  star: '1571506557857046669',
  speakerphone: '1571506556254552156',
  share3: '1571506553297567775',
  'share-3': '1571506553297567775',
  send: '1571506551242494013',
  search: '1571506549753520229',
  scan: '1571506547597516850',
  rosettediscountcheck: '1571506545936830544',
  'rosette-discount-check': '1571506545936830544',
  repeat: '1571506544107856043',
  refresh: '1571506542619136120',
  plus: '1571506541239074906',
  playerplay: '1571506539938844832',
  'player-play': '1571506539938844832',
  pin: '1571506537304952933',
  photo: '1571506521160818788',
  phone: '1571506519432888401',
  pencil: '1571506518170406962',
  music: '1571506516819972188',
  moon: '1571506501435261040',
  microphoneoff: '1571506499862405271',
  'microphone-off': '1571506499862405271',
  microphone: '1571506498360582304',
  message: '1571506496964010086',
  menu2: '1571506495802052708',
  'menu-2': '1571506495802052708',
  lockopen: '1571506494464335913',
  'lock-open': '1571506494464335913',
  lock: '1571506492824223904',
  loader: '1571506491125534730',
  listsearch: '1571506489376505997',
  'list-search': '1571506489376505997',
  listdetails: '1571506487929606224',
  'list-details': '1571506487929606224',
  listcheck: '1571506486302220299',
  'list-check': '1571506486302220299',
  list: '1571506484859375697',
  link: '1571506483718258850',
  infocircle: '1571506482585927770',
  'info-circle': '1571506482585927770',
  hourglassempty: '1571506480337915914',
  'hourglass-empty': '1571506480337915914',
  heart: '1571506478873845770',
  headphonesoff: '1571506477359964241',
  'headphones-off': '1571506477359964241',
  headphones: '1571506475497422898',
  folder: '1571506474151313528',
  flame: '1571506472679121037',
  flag: '1571506471412174998',
  fileexport: '1571506470074187836',
  'file-export': '1571506470074187836',
  filedescription: '1571506468723761233',
  'file-description': '1571506468723761233',
  eye: '1571506467482243132',
  externallink: '1571506465749999640',
  'external-link': '1571506465749999640',
  edit: '1571506464743493703',
  download: '1571506463476678858',
  dotsvertical: '1571506461991768075',
  'dots-vertical': '1571506461991768075',
  dots: '1571506460498727103',
  devicemobile: '1571506459152486533',
  'device-mobile': '1571506459152486533',
  devicedesktopanalytics: '1571506457612910592',
  'device-desktop-analytics': '1571506457612910592',
  devicedesktop: '1571506456048566354',
  'device-desktop': '1571506456048566354',
  database: '1571506454735626291',
  crown: '1571506453418610900',
  creditcard: '1571506451644547184',
  'credit-card': '1571506451644547184',
  copy: '1571506450159763568',
  code: '1571506448498692177',
  cloudupload: '1571506447496249484',
  'cloud-upload': '1571506447496249484',
  clock: '1571506445999017984',
  clipboardtext: '1571506444597985380',
  'clipboard-text': '1571506444597985380',
  circlecheck: '1571506443180310600',
  'circle-check': '1571506443180310600',
  chevronright: '1571506442052182036',
  'chevron-right': '1571506442052182036',
  chevronleft: '1571506440521256991',
  'chevron-left': '1571506440521256991',
  checks: '1571506438835273788',
  cash: '1571506437425860760',
  calendarweek: '1571506435991543818',
  'calendar-week': '1571506435991543818',
  bulb: '1571506433705386134',
  brandyoutube: '1571506432493359134',
  'brand-youtube': '1571506432493359134',
  bolt: '1571506431285526608',
  bell: '1571506429951615016',
  barbell: '1571506428466692106',
  arrowright: '1571506427220983848',
  'arrow-right': '1571506427220983848',
  arrownarrowright: '1571506425614831707',
  'arrow-narrow-right': '1571506425614831707',
  arrowleft: '1571506424289431722',
  'arrow-left': '1571506424289431722',
  arrowbackup: '1571506422737277049',
  'arrow-back-up': '1571506422737277049',
  aligncenterjustified: '1571506421277663423',
  'align-center-justified': '1571506421277663423',
  alerttriangle: '1571506419998396568',
  'alert-triangle': '1571506419998396568',
  alertcircle: '1571506418832384080',
  'alert-circle': '1571506418832384080',
  alarm: '1571506417225957537',
  adjustmentshorizontal: '1571506416152219658',
  'adjustments-horizontal': '1571506416152219658'
};

/**
 * Returns Discord formatted <:name:id> custom emoji tag
 */
export function getDiscordEmojiTag(keyOrName) {
  if (!keyOrName) return '';
  const clean = String(keyOrName).trim();
  if (clean.startsWith('<:') && clean.endsWith('>')) return clean;
  const normalized = clean.toLowerCase().replace(/^:+|:+$/g, '');
  const id = APP_EMOJI_NAME_TO_ID[normalized] || APP_EMOJI_NAME_TO_ID[normalized.replace(/[^a-z0-9_]/g, '')];
  if (id) {
    const discordName = normalized.replace(/[^a-z0-9_]/g, '');
    return `<:${discordName}:${id}>`;
  }
  return clean;
}

/**
 * Strips leading Discord custom emoji (<:name:id>) or unicode emoji from text
 */
export function stripLeadingEmoji(text) {
  if (!text) return '';
  return String(text)
    .replace(/^<a?:[a-zA-Z0-9_.-]+:\d+>\s*/, '')
    .replace(/^[\u{1F000}-\u{1FAFF}\u{2000}-\u{2BFF}\u{FE00}-\u{FE0F}]+\s*/u, '')
    .trim();
}

/**
 * Replaces or prepends leading emoji in text
 */
export function setLeadingEmoji(text, emojiTag) {
  const clean = stripLeadingEmoji(text);
  return clean ? `${emojiTag} ${clean}` : emojiTag;
}

/**
 * 13 popular white Discord Application Emojis for quick chips in constructors
 */
export const POPULAR_WHITE_EMOJIS = [
  { name: 'usercircle', id: '1571506569705824367', label: 'Имя', filename: 'user-circle.png', tag: '<:usercircle:1571506569705824367>' },
  { name: 'calendarweek', id: '1571506435991543818', label: 'Возраст', filename: 'calendar-week.png', tag: '<:calendarweek:1571506435991543818>' },
  { name: 'clock', id: '1571506445999017984', label: 'Часы', filename: 'clock.png', tag: '<:clock:1571506445999017984>' },
  { name: 'link', id: '1571506483718258850', label: 'Steam', filename: 'link.png', tag: '<:link:1571506483718258850>' },
  { name: 'listdetails', id: '1571506487929606224', label: 'Опыт', filename: 'list-details.png', tag: '<:listdetails:1571506487929606224>' },
  { name: 'devicedesktop', id: '1571506456048566354', label: 'ПК', filename: 'device-desktop.png', tag: '<:devicedesktop:1571506456048566354>' },
  { name: 'devicemobile', id: '1571506459152486533', label: 'Телефон', filename: 'device-mobile.png', tag: '<:devicemobile:1571506459152486533>' },
  { name: 'send', id: '1571506551242494013', label: 'Telegram', filename: 'send.png', tag: '<:send:1571506551242494013>' },
  { name: 'crown', id: '1571506453418610900', label: 'Роль', filename: 'crown.png', tag: '<:crown:1571506453418610900>' },
  { name: 'flame', id: '1571506472679121037', label: 'ПВП', filename: 'flame.png', tag: '<:flame:1571506472679121037>' },
  { name: 'rosettediscountcheck', id: '1571506545936830544', label: 'Проверка', filename: 'rosette-discount-check.png', tag: '<:rosettediscountcheck:1571506545936830544>' },
  { name: 'circlecheck', id: '1571506443180310600', label: 'Готов', filename: 'circle-check.png', tag: '<:circlecheck:1571506443180310600>' },
  { name: 'clipboardtext', id: '1571506444597985380', label: 'Анкета', filename: 'clipboard-text.png', tag: '<:clipboardtext:1571506444597985380>' }
];

/**
 * Renders text containing Discord custom emojis (<:name:id>) as inline images
 */
export function renderTextWithDiscordEmojis(text, imgClass = 'w-3.5 h-3.5') {
  if (!text) return null;
  const str = String(text);
  const parts = str.split(/(<a?:\w+:\d+>)/g);
  if (parts.length === 1) return str;

  return parts.map((part, pIdx) => {
    const match = part.match(/^<a?:(\w+):(\d+)>$/);
    if (!match) return part;
    const name = match[1];
    const id = match[2];
    const resolved = resolveDiscordEmoji(`<:${name}:${id}>`);
    if (resolved && (resolved.type === 'local' || resolved.type === 'cdn')) {
      return React.createElement('img', {
        key: pIdx,
        src: resolved.url,
        alt: name,
        className: `${imgClass} object-contain inline-block mr-1 align-middle shrink-0`,
        onError: (e) => { e.currentTarget.style.display = 'none'; }
      });
    }
    return part;
  });
}

export { EMOJI_FILES, APP_EMOJI_IDS };
export default resolveDiscordEmoji;
