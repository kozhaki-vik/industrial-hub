export const mapToElectronAccelerator = (keyId) => {
  // Mapping custom virtual keyboard keys to Electron Accelerator strings
  const keyMap = {
    // Function Row
    'ESCAPE': 'Escape',
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4',
    'F5': 'F5', 'F6': 'F6', 'F7': 'F7', 'F8': 'F8',
    'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'PRINTSCREEN': 'PrintScreen',
    'SCROLLLOCK': 'Scrolllock',
    'PAUSE': 'Pause',

    // Alphanumeric
    'BACKQUOTE': '`',
    'MINUS': '-',
    'EQUALS': '=',
    'BACKSPACE': 'Backspace',
    'TAB': 'Tab',
    'LEFTBRACKET': '[',
    'RIGHTBRACKET': ']',
    'BACKSLASH': '\\',
    'CAPSLOCK': 'Capslock',
    'SEMICOLON': ';',
    'QUOTE': '\'',
    'RETURN': 'Return',
    'LEFTSHIFT': 'Shift',
    'RIGHTSHIFT': 'Shift',
    'COMMA': ',',
    'PERIOD': '.',
    'SLASH': '/',
    
    // Modifiers
    'LEFTCONTROL': 'CommandOrControl',
    'RIGHTCONTROL': 'CommandOrControl',
    'LEFTALT': 'Alt',
    'RIGHTALT': 'Alt',
    'LEFTWINDOWS': 'Super',
    'RIGHTWINDOWS': 'Super',
    'SPACE': 'Space',
    
    // Navigation
    'INSERT': 'Insert',
    'HOME': 'Home',
    'PAGEUP': 'PageUp',
    'DELETE': 'Delete',
    'END': 'End',
    'PAGEDOWN': 'PageDown',
    
    // Arrows
    'UPARROW': 'Up',
    'DOWNARROW': 'Down',
    'LEFTARROW': 'Left',
    'RIGHTARROW': 'Right',

    // Numpad
    'NUMLOCK': 'Numlock',
    'KEYPADDIVIDE': 'numdiv',
    'KEYPADMULTIPLY': 'nummult',
    'KEYPADMINUS': 'numsub',
    'KEYPADPLUS': 'numadd',
    'KEYPADENTER': 'Enter', // Or Return
    'KEYPADPERIOD': 'numdec',
    
    'KEYPAD0': 'num0', 'KEYPAD1': 'num1', 'KEYPAD2': 'num2', 
    'KEYPAD3': 'num3', 'KEYPAD4': 'num4', 'KEYPAD5': 'num5', 
    'KEYPAD6': 'num6', 'KEYPAD7': 'num7', 'KEYPAD8': 'num8', 
    'KEYPAD9': 'num9'
  };

  // For normal letters and numbers (A-Z, 0-9)
  if (!keyMap[keyId] && keyId.length === 1) {
    return keyId; // Q, W, E, 1, 2, 3
  }

  return keyMap[keyId] || null;
};

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

  if (!vkMap[keyId] && keyId.length === 1) {
    return keyId.charCodeAt(0);
  }

  return vkMap[keyId] || null;
};
