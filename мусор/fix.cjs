const fs = require('fs');
let content = fs.readFileSync('src/i18n.js', 'utf8');

// Fix 1: Restore deleted developer section in English
const toRestore = `      "elec_raid_comp_2": "1x Small Battery",
      "elec_raid_comp_3": "1x Blocker",
      "elec_raid_note": "Place the HBHF sensor so it doesn't react to players authorized in the tool cupboard (configure the sensor with a hammer).",

      "developer_title": "Developer Mode",
      "developer_desc": "Access diagnostic and debugging tools",
      "developer_open": "Open",
      "dev_ping_title": "Network (Ping)",
      "dev_ping_desc": "Check latency to critical servers",
      "dev_ping_update": "Update Server (GitHub)",
      "dev_ping_support": "Support Service (Discord)",
      "dev_ping_internet": "Internet (Cloudflare)",
      "dev_ping_yandex": "Internet (Yandex)",
      "dev_system_title": "System & Hardware",
      "dev_system_desc": "Diagnostic information about your PC",
`;

content = content.replace(
  '      "elec_raid_comp_1": "1x HBHF Sensor",\r\n      "dev_sys_pc": "PC Name:",',
  '      "elec_raid_comp_1": "1x HBHF Sensor",\r\n' + toRestore.replace(/\n/g, '\r\n') + '      "dev_sys_pc": "PC Name:",'
);

// Fix 2: Restore mon_small_harbor_puzzle_1
content = content.replace(
  '      "mon_small_harbor_puzzle_0": "Place a fuse in the two-story building and turn on the power.",\r\n      "mon_small_harbor_loot_0": "Blue Card",',
  '      "mon_small_harbor_puzzle_0": "Place a fuse in the two-story building and turn on the power.",\r\n      "mon_small_harbor_puzzle_1": "Use the Green card in the shack between the containers to get a Blue card.",\r\n      "mon_small_harbor_loot_0": "Blue Card",'
);

// Fix 3: Remove duplicate binds_tab_backups in ua
content = content.replace(
  '      "binds_tab_keyboard": "Клавіатура",\r\n      "binds_tab_catalog": "Каталог біндів",\r\n      "binds_tab_backups": "Бекапи",\r\n      "binds_tab_backups": "Бекапи",',
  '      "binds_tab_keyboard": "Клавіатура",\r\n      "binds_tab_catalog": "Каталог біндів",\r\n      "binds_tab_backups": "Бекапи",'
);


fs.writeFileSync('src/i18n.js', content);
console.log('Fixed i18n.js');
