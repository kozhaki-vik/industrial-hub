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

export default resolveDiscordEmoji;
