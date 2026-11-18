export const bindSignatures = [
  // --- КОРОТКИЕ БИНДЫ ---
  {
    id: 'autorun',
    name: 'Авто-бег',
    desc: 'Бег вперед без зажатия клавиш',
    command: 'forward;sprint',
    icon: 'run',
    color: 'emerald',
    isLong: false,
    match: (cmd) => /\bforward\b/.test(cmd) && /\bsprint\b/.test(cmd)
  },
  {
    id: 'autofarm',
    name: 'Авто-добыча (Атака)',
    desc: 'Удары инструментом в приседе',
    command: 'attack;duck',
    icon: 'pickaxe',
    color: 'amber',
    isLong: false,
    match: (cmd) => /\battack\b/.test(cmd) && /\bduck\b/.test(cmd)
  },
  {
    id: 'crouch_toggle',
    name: 'Постоянный присед',
    desc: 'Присесть без удержания клавиши Ctrl',
    command: 'duck',
    icon: 'arrow-down',
    color: 'amber',
    isLong: false,
    match: (cmd) => /^duck$/i.test(cmd.trim()) || /duck 1;duck 0/.test(cmd) || /~duck/.test(cmd)
  },
  {
    id: 'auto_swim',
    name: 'Авто-плавание',
    desc: 'Всплытие и движение вперед в воде',
    command: 'forward;sprint;jump',
    icon: 'waves',
    color: 'cyan',
    isLong: false,
    match: (cmd) => /\bjump\b/.test(cmd) && /\bforward\b/.test(cmd) && /\bsprint\b/.test(cmd)
  },
  {
    id: 'zoom_hold',
    name: 'Зум при зажатии',
    desc: 'Приближение FOV 70 пока держите клавишу',
    command: '+graphics.fov 90;graphics.fov 70',
    icon: 'eye',
    color: 'blue',
    isLong: false,
    match: (cmd) => /\+graphics\.fov\b/.test(cmd)
  },
  {
    id: 'light_ads',
    name: 'Фонарик/ЛЦУ при прицеле',
    desc: 'Включение света только при нажатии ПКМ',
    command: '+lighttoggle;+attack2',
    icon: 'crosshair',
    color: 'amber',
    isLong: false,
    match: (cmd) => /\blighttoggle\b/.test(cmd) && /\battack2\b/.test(cmd)
  },
  {
    id: 'map_focus',
    name: 'Карта с фокусом',
    desc: 'Открытие карты с центрированием на игроке',
    command: '+map;+focusmap',
    icon: 'map',
    color: 'indigo',
    isLong: false,
    match: (cmd) => /\bmap\b/.test(cmd) && /\bfocusmap\b/.test(cmd)
  },
  {
    id: 'hoverloot',
    name: 'Быстрый лут',
    desc: 'Перетаскивание лута наведением курсора',
    command: '+hoverloot',
    icon: 'cursor',
    color: 'emerald',
    isLong: false,
    match: (cmd) => /\bhoverloot\b/.test(cmd)
  },
  {
    id: 'craft_cancel',
    name: 'Отмена крафта',
    desc: 'Мгновенный сброс очереди крафта',
    command: 'craft.cancel',
    icon: 'cancel',
    color: 'orange',
    isLong: false,
    match: (cmd) => /\bcraft\.cancel\b/.test(cmd)
  },
  {
    id: 'suicide',
    name: 'Самоубийство',
    desc: 'Суицид персонажа (F1 kill)',
    command: 'kill',
    icon: 'skull',
    color: 'red',
    isLong: false,
    match: (cmd) => /\bkill\b/.test(cmd)
  },
  {
    id: 'respawn',
    name: 'Быстрый респаун',
    desc: 'Мгновенное возрождение без ожидания',
    command: 'respawn',
    icon: 'respawn',
    color: 'rose',
    isLong: false,
    match: (cmd) => /\brespawn\b/.test(cmd)
  },
  {
    id: 'disconnect',
    name: 'Быстрый дисконнект',
    desc: 'Мгновенный выход с сервера',
    command: 'disconnect',
    icon: 'log-out',
    color: 'slate',
    isLong: false,
    match: (cmd) => /\bdisconnect\b/.test(cmd)
  },
  {
    id: 'clear',
    name: 'Очистка консоли',
    desc: 'Очистить текст в консоли F1',
    command: 'clear',
    icon: 'trash',
    color: 'slate',
    isLong: false,
    match: (cmd) => /\bclear\b/.test(cmd) && !/\bcombatlog\b/.test(cmd)
  },

  // --- ДЛИННЫЕ БИНДЫ ---
  {
    id: 'combatlog',
    name: 'Комбат-лог',
    desc: 'Консоль с очисткой и выводом лога урона',
    command: 'consoletoggle;clear;combatlog',
    icon: 'shield',
    color: 'indigo',
    isLong: true,
    match: (cmd) => /\bcombatlog\b/.test(cmd) && !/\bping\b/.test(cmd)
  },
  {
    id: 'combatlog_ping',
    name: 'Комбат-лог с пингом',
    desc: 'Лог последнего урона вместе с пингом',
    command: 'consoletoggle;clear;combatlog;ping',
    icon: 'activity',
    color: 'sky',
    isLong: true,
    match: (cmd) => /\bcombatlog\b/.test(cmd) && /\bping\b/.test(cmd)
  },
  {
    id: 'fov',
    name: 'Переключение FOV',
    desc: 'Тумблер угла обзора между 70 и 90',
    command: '~graphics.fov 70;graphics.fov 90',
    icon: 'eye',
    color: 'blue',
    isLong: true,
    match: (cmd) => /graphics\.fov\b/.test(cmd) && !/\+graphics\.fov\b/.test(cmd)
  },
  {
    id: 'mute',
    name: 'Приглушение звука (Mute)',
    desc: 'Полное отключение звуков игры по кнопке',
    command: '~audio.game 0;audio.game 1',
    icon: 'volume-x',
    color: 'purple',
    isLong: true,
    match: (cmd) => (/\baudio\.master\b/.test(cmd) || /\baudio\.game\b/.test(cmd)) && /\b0\b/.test(cmd) && !/\b0\.05\b/.test(cmd)
  },
  {
    id: 'quiet_mode',
    name: 'Тихий режим (5%)',
    desc: 'Снизить звук до 5% для коптера или рейдов',
    command: '~audio.game 0.05;audio.game 1',
    icon: 'volume-low',
    color: 'purple',
    isLong: true,
    match: (cmd) => /\baudio\.game\s+0\.05\b/.test(cmd)
  },
  {
    id: 'mute_voices',
    name: 'Мут войс-чата',
    desc: 'Отключение криков игроков в микрофон',
    command: '~audio.voices 0;audio.voices 1',
    icon: 'mic-off',
    color: 'slate',
    isLong: true,
    match: (cmd) => /\baudio\.voices\b/.test(cmd)
  },
  {
    id: 'change_hands',
    name: 'Смена рук',
    desc: 'Переключение оружия в левую/правую руку',
    command: '~graphics.vm_horizontal_flip 1;graphics.vm_horizontal_flip 0',
    icon: 'refresh-ccw',
    color: 'teal',
    isLong: true,
    match: (cmd) => /\bvm_horizontal_flip\b/.test(cmd)
  },
  {
    id: 'hide_hud',
    name: 'Скрытие интерфейса (HUD)',
    desc: 'Тумблер скрытия интерфейса для скриншотов',
    command: '~graphics.hud 1;graphics.hud 0',
    icon: 'monitor-off',
    color: 'stone',
    isLong: true,
    match: (cmd) => /\bgraphics\.hud\b/.test(cmd)
  },
  {
    id: 'lookatradius',
    name: 'Радиус подбора лута',
    desc: 'Тумблер дальности захвата лута (0.2 / 10)',
    command: '~client.lookatradius 0.2;client.lookatradius 10',
    icon: 'lookatradius',
    color: 'violet',
    isLong: true,
    match: (cmd) => /\blookatradius\b/.test(cmd)
  },
  {
    id: 'water_quality',
    name: 'Прозрачность воды',
    desc: 'Видимость затонувших ящиков под водой',
    command: '~water.quality 2;water.quality -1',
    icon: 'water',
    color: 'cyan',
    isLong: true,
    match: (cmd) => /\bwater\.quality\b/.test(cmd)
  },
  {
    id: 'craft_bandage',
    name: 'Быстрый крафт бинта',
    desc: 'Крафт 1 бинта с уведомлением в чат',
    command: 'craft.add -2072273936 1;chat.add 0 0 +бинт',
    icon: 'bandage',
    color: 'emerald',
    isLong: true,
    match: (cmd) => /\b-2072273936\b/.test(cmd)
  },
  {
    id: 'craft_syringe',
    name: 'Быстрый крафт шприца',
    desc: 'Крафт 1 шприца с уведомлением в чат',
    command: 'craft.add 1079279582 1;chat.add 0 0 +шприц',
    icon: 'syringe',
    color: 'rose',
    isLong: true,
    match: (cmd) => /\b1079279582\b/.test(cmd)
  }
];
