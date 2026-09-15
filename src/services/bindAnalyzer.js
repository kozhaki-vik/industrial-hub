export const bindSignatures = [
  {
    id: 'autorun',
    name: 'Авто-бег',
    command: 'forward;sprint',
    icon: 'run',
    color: 'emerald',
    isLong: false,
    match: (cmd) => /\bforward\b/.test(cmd) && /\bsprint\b/.test(cmd)
  },
  {
    id: 'autofarm',
    name: 'Авто-добыча (Атака)',
    command: 'attack;duck',
    icon: 'pickaxe',
    color: 'amber',
    isLong: false,
    match: (cmd) => /\battack\b/.test(cmd) && /\bduck\b/.test(cmd)
  },
  {
    id: 'combatlog',
    name: 'Комбат-лог',
    command: 'consoletoggle;clear;combatlog',
    icon: 'shield',
    color: 'indigo',
    isLong: true,
    match: (cmd) => /\bcombatlog\b/.test(cmd)
  },
  {
    id: 'suicide',
    name: 'Самоубийство',
    command: 'kill',
    icon: 'skull',
    color: 'red',
    isLong: false,
    match: (cmd) => /\bkill\b/.test(cmd)
  },
  {
    id: 'disconnect',
    name: 'Быстрый дисконнект',
    command: 'disconnect',
    icon: 'log-out',
    color: 'slate',
    isLong: false,
    match: (cmd) => /\bdisconnect\b/.test(cmd)
  },
  {
    id: 'fov',
    name: 'Смена FOV',
    command: 'graphics.fov 70;graphics.fov 90',
    icon: 'eye',
    color: 'blue',
    isLong: true,
    match: (cmd) => /\bgraphics\.fov\b/.test(cmd)
  },
  {
    id: 'mute',
    name: 'Приглушение звука',
    command: 'audio.game 0;audio.game 1',
    icon: 'volume-x',
    color: 'purple',
    isLong: true,
    match: (cmd) => /\baudio\.master\b/.test(cmd) || /\baudio\.game\b/.test(cmd)
  },
  {
    id: 'clear',
    name: 'Очистка консоли',
    command: 'clear',
    icon: 'trash',
    color: 'slate',
    isLong: false,
    match: (cmd) => /\bclear\b/.test(cmd) && !/\bcombatlog\b/.test(cmd)
  },
  {
    id: 'change_hands',
    name: 'Смена рук',
    command: '~graphics.vm_horizontal_flip 1;graphics.vm_horizontal_flip 0',
    icon: 'refresh-ccw',
    color: 'teal',
    isLong: true,
    match: (cmd) => /\bvm_horizontal_flip\b/.test(cmd)
  },
  {
    id: 'hide_hud',
    name: 'Скрытие интерфейса (HUD)',
    command: '~graphics.hud 1;graphics.hud 0',
    icon: 'monitor-off',
    color: 'stone',
    isLong: true,
    match: (cmd) => /\bgraphics\.hud\b/.test(cmd)
  },
  {
    id: 'auto_swim',
    name: 'Авто-плавание',
    command: 'forward;sprint;jump',
    icon: 'waves',
    color: 'cyan',
    isLong: false,
    match: (cmd) => /\bjump\b/.test(cmd) && /\bforward\b/.test(cmd) && /\bsprint\b/.test(cmd)
  },
  {
    id: 'crouch_toggle',
    name: 'Постоянный присед',
    command: '~duck 1;duck 0',
    icon: 'arrow-down',
    color: 'amber',
    isLong: false,
    match: (cmd) => /duck 1;duck 0/.test(cmd) || /~duck/.test(cmd)
  }
];

export const analyzeBinds = (binds) => {
  const analyzed = [];
  
  for (const [key, command] of Object.entries(binds)) {
    if (!command) continue;
    const cmdLower = command.toLowerCase();
    
    // Check against signatures
    const matchedSignature = bindSignatures.find(sig => sig.match(cmdLower));
    
    if (matchedSignature) {
      analyzed.push({
        key,
        command,
        ...matchedSignature
      });
    }
  }

  return analyzed;
};