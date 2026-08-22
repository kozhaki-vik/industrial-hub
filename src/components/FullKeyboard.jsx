import React from 'react';

const FullKeyboard = ({ binds, onKeyClick, gammaBind, highlightEmpty }) => {
  // Common key class
  const getKeyClass = (keyId, customClass = '') => {
    const isBound = binds && binds[keyId];
    const isGamma = gammaBind === keyId;
    
    let stateClass = 'bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#0f172a]';
    
    if (isGamma) {
      stateClass = 'bg-emerald-500 text-white border-emerald-600 shadow-[0_2px_0_0_#059669] ring-2 ring-emerald-500/50';
    } else if (isBound) {
      stateClass = 'bg-orange-500 text-white border-orange-600 shadow-[0_2px_0_0_#d97706]';
    } else if (highlightEmpty) {
      stateClass = 'bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 shadow-[0_2px_0_0_#818cf8] animate-pulse text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30';
    } else {
      stateClass += ' hover:border-orange-500';
    }
    
    const base = 'rounded-md shadow-sm border font-semibold text-[11px] sm:text-xs flex items-center justify-center transition-all flex-shrink-0 overflow-hidden';
    return `${base} ${stateClass} ${customClass}`;
  };

  const renderKey = (label, keyId, width = 'w-10', height = 'h-10') => (
    <button
      key={keyId}
      onClick={() => onKeyClick(keyId)}
      className={getKeyClass(keyId, `${width} ${height}`)}
      title={binds && binds[keyId] ? `bind ${keyId} "${binds[keyId]}"` : ''}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 p-2 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 w-max mx-auto select-none">
      
      {/* --- FUNCTION ROW --- */}
      <div className="flex gap-6">
        <div className="flex gap-1">
          {renderKey('Esc', 'ESCAPE')}
        </div>
        <div className="flex gap-1">
          {['F1', 'F2', 'F3', 'F4'].map(k => renderKey(k, k))}
        </div>
        <div className="flex gap-1">
          {['F5', 'F6', 'F7', 'F8'].map(k => renderKey(k, k))}
        </div>
        <div className="flex gap-1">
          {['F9', 'F10', 'F11', 'F12'].map(k => renderKey(k, k))}
        </div>
        <div className="flex gap-1 ml-4">
          {renderKey('PrtSc', 'PRINTSCREEN')}
          {renderKey('ScrLk', 'SCROLLLOCK')}
          {renderKey('Pause', 'PAUSE')}
        </div>
      </div>

      <div className="flex gap-4">
        {/* --- MAIN BLOCK --- */}
        <div className="flex flex-col gap-1">
          {/* Row 1 */}
          <div className="flex gap-1">
            {renderKey('~', 'BACKQUOTE')}
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(k => renderKey(k, k))}
            {renderKey('-', 'MINUS')}
            {renderKey('=', 'EQUALS')}
            {renderKey('Backspace', 'BACKSPACE', 'w-[84px]')}
          </div>
          {/* Row 2 */}
          <div className="flex gap-1">
            {renderKey('Tab', 'TAB', 'w-14')}
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(k => renderKey(k, k))}
            {renderKey('[', 'LEFTBRACKET')}
            {renderKey(']', 'RIGHTBRACKET')}
            {renderKey('\\', 'BACKSLASH', 'w-14')}
          </div>
          {/* Row 3 */}
          <div className="flex gap-1">
            {renderKey('Caps', 'CAPSLOCK', 'w-[74px]')}
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(k => renderKey(k, k))}
            {renderKey(';', 'SEMICOLON')}
            {renderKey('\'', 'QUOTE')}
            {renderKey('Enter', 'RETURN', 'w-[86px]')}
          </div>
          {/* Row 4 */}
          <div className="flex gap-1">
            {renderKey('Shift', 'LEFTSHIFT', 'w-[96px]')}
            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(k => renderKey(k, k))}
            {renderKey(',', 'COMMA')}
            {renderKey('.', 'PERIOD')}
            {renderKey('/', 'SLASH')}
            {renderKey('Shift', 'RIGHTSHIFT', 'w-[106px]')}
          </div>
          {/* Row 5 */}
          <div className="flex gap-1">
            {renderKey('Ctrl', 'LEFTCONTROL', 'w-14')}
            {renderKey('Win', 'LEFTWINDOWS', 'w-12')}
            {renderKey('Alt', 'LEFTALT', 'w-12')}
            {renderKey('Space', 'SPACE', 'w-[236px]')}
            {renderKey('Alt', 'RIGHTALT', 'w-12')}
            {renderKey('Win', 'RIGHTWINDOWS', 'w-12')}
            {renderKey('Menu', 'APP', 'w-12')}
            {renderKey('Ctrl', 'RIGHTCONTROL', 'w-14')}
          </div>
        </div>

        {/* --- NAV BLOCK --- */}
        <div className="flex flex-col gap-1">
          {/* Nav Row 1 */}
          <div className="flex gap-1">
            {renderKey('Ins', 'INSERT')}
            {renderKey('Home', 'HOME')}
            {renderKey('PgUp', 'PAGEUP')}
          </div>
          {/* Nav Row 2 */}
          <div className="flex gap-1">
            {renderKey('Del', 'DELETE')}
            {renderKey('End', 'END')}
            {renderKey('PgDn', 'PAGEDOWN')}
          </div>
          <div className="h-10"></div> {/* Spacer to align arrows */}
          {/* Nav Row 4 (Up Arrow) */}
          <div className="flex gap-1 justify-center">
            {renderKey('↑', 'UPARROW')}
          </div>
          {/* Nav Row 5 (Left, Down, Right) */}
          <div className="flex gap-1">
            {renderKey('←', 'LEFTARROW')}
            {renderKey('↓', 'DOWNARROW')}
            {renderKey('→', 'RIGHTARROW')}
          </div>
        </div>

        {/* --- NUMPAD BLOCK --- */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {renderKey('Num', 'NUMLOCK')}
            {renderKey('/', 'KEYPADDIVIDE')}
            {renderKey('*', 'KEYPADMULTIPLY')}
            {renderKey('-', 'KEYPADMINUS')}
          </div>
          <div className="flex gap-1 h-[84px]">
            <div className="flex flex-col gap-1 w-[128px]">
              <div className="flex gap-1">
                {renderKey('7', 'KEYPAD7')}
                {renderKey('8', 'KEYPAD8')}
                {renderKey('9', 'KEYPAD9')}
              </div>
              <div className="flex gap-1">
                {renderKey('4', 'KEYPAD4')}
                {renderKey('5', 'KEYPAD5')}
                {renderKey('6', 'KEYPAD6')}
              </div>
            </div>
            <div className="flex">
              {renderKey('+', 'KEYPADPLUS', 'w-10', 'h-full')}
            </div>
          </div>
          <div className="flex gap-1 h-[84px]">
            <div className="flex flex-col gap-1 w-[128px]">
              <div className="flex gap-1">
                {renderKey('1', 'KEYPAD1')}
                {renderKey('2', 'KEYPAD2')}
                {renderKey('3', 'KEYPAD3')}
              </div>
              <div className="flex gap-1">
                {renderKey('0', 'KEYPAD0', 'w-[84px]')}
                {renderKey('.', 'KEYPADPERIOD')}
              </div>
            </div>
            <div className="flex">
              {renderKey('Ent', 'KEYPADENTER', 'w-10', 'h-full')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullKeyboard;
