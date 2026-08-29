export const bindSignatures = [
  {
    id: 'autorun',
    name: 'Авто-бег',
    command: 'forward;sprint',
    icon: 'run',
    color: 'emerald',
    match: (cmd) => cmd.includes('forward') && cmd.includes('sprint')
  },
  {
    id: 'autofarm',
    name: 'Авто-добыча (Атака)',
    command: 'attack;duck',
    icon: 'pickaxe',
    color: 'amber',
    match: (cmd) => cmd.includes('attack') && cmd.includes('duck')
  },
  {
    id: 'combatlog',
    name: 'Комбат-лог',
    command: 'consoletoggle;clear;combatlog',
    icon: 'shield',
    color: 'indigo',
    match: (cmd) => cmd.includes('combatlog')
  },
  {
    id: 'suicide',
    name: 'Самоубийство',
    command: 'kill',
    icon: 'skull',
    color: 'red',
    match: (cmd) => cmd.includes('kill')
  },
  {
    id: 'disconnect',
    name: 'Быстрый дисконнект',
    command: 'disconnect',
    icon: 'log-out',
    color: 'slate',
    match: (cmd) => cmd.includes('disconnect')
  },
  {
    id: 'fov',
    name: 'Смена FOV',
    command: 'graphics.fov 70;graphics.fov 90',
    icon: 'eye',
    color: 'blue',
    match: (cmd) => cmd.includes('graphics.fov')
  },
  {
    id: 'mute',
    name: 'Приглушение звука',
    command: 'audio.game 0;audio.game 1',
    icon: 'volume-x',
    color: 'purple',
    match: (cmd) => cmd.includes('audio.master') || cmd.includes('audio.game')
  },
  {
    id: 'clear',
    name: 'Очистка консоли',
    command: 'clear',
    icon: 'trash',
    color: 'slate',
    match: (cmd) => cmd.includes('clear') && !cmd.includes('combatlog')
  },
  {
    id: 'change_hands',
    name: 'Смена рук',
    command: '~graphics.vm_horizontal_flip 1;graphics.vm_horizontal_flip 0',
    icon: 'refresh-ccw',
    color: 'teal',
    match: (cmd) => cmd.includes('vm_horizontal_flip')
  },
  {
    id: 'hide_hud',
    name: 'Скрытие интерфейса (HUD)',
    command: '~graphics.hud 1;graphics.hud 0',
    icon: 'monitor-off',
    color: 'stone',
    match: (cmd) => cmd.includes('graphics.hud')
  },
  {
    id: 'auto_swim',
    name: 'Авто-плавание',
    command: 'forward;sprint;jump',
    icon: 'waves',
    color: 'cyan',
    match: (cmd) => cmd.includes('jump') && cmd.includes('forward') && cmd.includes('sprint')
  },
  {
    id: 'crouch_toggle',
    name: 'Постоянный присед',
    command: '~duck 1;duck 0',
    icon: 'arrow-down',
    color: 'amber',
    match: (cmd) => cmd.includes('duck 1;duck 0') || cmd.includes('~duck')
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
