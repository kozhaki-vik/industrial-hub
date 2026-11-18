export const mapToVirtualKeyCode = (keyId) => {
  const vkMap = {
    'ESCAPE': 27,
    'F1': 112, 'F2': 113, 'F3': 114, 'F4': 115,
    'F5': 116, 'F6': 117, 'F7': 118, 'F8': 119,
    'F9': 120, 'F10': 121, 'F11': 122, 'F12': 123,
    'PRINTSCREEN': 44,
    'SCROLLLOCK': 145,
    'PAUSE': 19,
    'BACKQUOTE': 192,
    'MINUS': 189,
    'EQUALS': 187,
    'BACKSPACE': 8,
    'TAB': 9,
    'LEFTBRACKET': 219,
    'RIGHTBRACKET': 221,
    'BACKSLASH': 220,
    'CAPSLOCK': 20,
    'SEMICOLON': 186,
    'QUOTE': 222,
    'RETURN': 13,
    'LEFTSHIFT': 160,
    'RIGHTSHIFT': 161,
    'COMMA': 188,
    'PERIOD': 190,
    'SLASH': 191,
    'LEFTCONTROL': 162,
    'RIGHTCONTROL': 163,
    'LEFTALT': 164,
    'RIGHTALT': 165,
    'LEFTWINDOWS': 91,
    'RIGHTWINDOWS': 92,
    'SPACE': 32,
    'INSERT': 45,
    'HOME': 36,
    'PAGEUP': 33,
    'DELETE': 46,
    'END': 35,
    'PAGEDOWN': 34,
    'UPARROW': 38,
    'DOWNARROW': 40,
    'LEFTARROW': 37,
    'RIGHTARROW': 39,
    'NUMLOCK': 144,
    'KEYPADDIVIDE': 111,
    'KEYPADMULTIPLY': 106,
    'KEYPADMINUS': 109,
    'KEYPADPLUS': 107,
    'KEYPADENTER': 13,
    'KEYPADPERIOD': 110,
    'KEYPAD0': 96, 'KEYPAD1': 97, 'KEYPAD2': 98,
    'KEYPAD3': 99, 'KEYPAD4': 100, 'KEYPAD5': 101,
    'KEYPAD6': 102, 'KEYPAD7': 103, 'KEYPAD8': 104,
    'KEYPAD9': 105
  };

  if (!vkMap[keyId] && keyId && keyId.length === 1) {
    return keyId.charCodeAt(0);
  }

  return vkMap[keyId] || null;
};

// Check if a bind represents a multi-key combination
export const isCombination = (bind) => {
  if (!bind || typeof bind !== 'string') return false;
  return bind.includes('+');
};

// Friendly display name mapping for keys
const DISPLAY_KEY_NAMES = {
  'END': 'End',
  'HOME': 'Home',
  'INSERT': 'Insert',
  'DELETE': 'Delete',
  'PAGEUP': 'Page Up',
  'PAGEDOWN': 'Page Down',
  'PRINTSCREEN': 'Print Screen',
  'SCROLLLOCK': 'Scroll Lock',
  'PAUSE': 'Pause',
  'ESCAPE': 'Esc',
  'BACKQUOTE': '~',
  'MINUS': '-',
  'EQUALS': '=',
  'BACKSPACE': 'Backspace',
  'TAB': 'Tab',
  'RETURN': 'Enter',
  'SPACE': 'Space',
  'LEFTBRACKET': '[',
  'RIGHTBRACKET': ']',
  'BACKSLASH': '\\',
  'SEMICOLON': ';',
  'QUOTE': "'",
  'COMMA': ',',
  'PERIOD': '.',
  'SLASH': '/',
  'UPARROW': 'Up',
  'DOWNARROW': 'Down',
  'LEFTARROW': 'Left',
  'RIGHTARROW': 'Right',
  'CTRL': 'Ctrl',
  'ALT': 'Alt',
  'SHIFT': 'Shift',
  'COMMANDORCONTROL': 'Ctrl',
  'CONTROL': 'Ctrl'
};

// Format any bind into badges array for UI: e.g. "Ctrl+Alt+G" -> ["Ctrl", "Alt", "G"]
export const formatBindDisplay = (bind) => {
  if (!bind) return [];
  if (typeof bind !== 'string') return [String(bind)];

  const parts = bind.split('+').map(p => p.trim()).filter(Boolean);
  return parts.map(p => {
    const upper = p.toUpperCase();
    if (DISPLAY_KEY_NAMES[upper]) return DISPLAY_KEY_NAMES[upper];
    if (/^F\d{1,2}$/i.test(p)) return p.toUpperCase();
    return p.length === 1 ? p.toUpperCase() : (p.charAt(0).toUpperCase() + p.slice(1));
  });
};

// Normalizes keyboard code/key event to standard key name
export const normalizeEventKey = (e) => {
  const code = e.code;
  const key = e.key;

  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad') && /^Numpad\d$/.test(code)) return 'Num' + code.slice(6);
  if (/^F\d{1,2}$/i.test(key)) return key.toUpperCase();

  const codeMap = {
    'Escape': 'Escape',
    'Enter': 'Return',
    'NumpadEnter': 'Return',
    'Space': 'Space',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Insert': 'Insert',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PageUp',
    'PageDown': 'PageDown',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    'ScrollLock': 'ScrollLock',
    'Pause': 'Pause',
    'PrintScreen': 'PrintScreen',
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backquote': '`',
    'Semicolon': ';',
    'Quote': "'",
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    'Backslash': '\\'
  };

  if (codeMap[code]) return codeMap[code];
  if (key && key.length === 1) return key.toUpperCase();

  return key || code;
};

// Parse a keydown event during shortcut recording
export const parseKeyEvent = (e) => {
  const isCtrl = e.ctrlKey;
  const isAlt = e.altKey;
  const isShift = e.shiftKey;
  const isMeta = e.metaKey;

  const keyName = normalizeEventKey(e);
  const isModifierKey = ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key);

  const modifiers = [];
  if (isCtrl) modifiers.push('Ctrl');
  if (isAlt) modifiers.push('Alt');
  if (isShift) modifiers.push('Shift');
  if (isMeta) modifiers.push('Win');

  if (isModifierKey) {
    return {
      isComplete: false,
      isModifierOnly: true,
      displayParts: modifiers,
      shortcutString: modifiers.join('+'),
      requiresModifier: false
    };
  }

  // Non-modifier key pressed
  const hasModifiers = modifiers.length > 0;
  const isPlainAlphaNum = /^[A-Z0-9]$/i.test(keyName);

  // Windows RegisterHotKey requires modifiers for standard typing characters (A-Z, 0-9)
  // to avoid breaking normal typing across Windows.
  if (isPlainAlphaNum && !hasModifiers) {
    return {
      isComplete: false,
      isModifierOnly: false,
      displayParts: [keyName],
      shortcutString: keyName,
      requiresModifier: true,
      error: 'requires_modifier_for_char'
    };
  }

  const allParts = [...modifiers, keyName];
  const shortcutString = allParts.join('+');

  return {
    isComplete: true,
    isModifierOnly: false,
    displayParts: allParts,
    shortcutString,
    requiresModifier: false
  };
};
