const fs = require('fs');
let content = fs.readFileSync('src/i18n.js', 'utf8');
content = content.replace(/"binds_tab_backups": "Бекапи",\s*"binds_tab_backups": "Бекапи",/g, '"binds_tab_backups": "Бекапи",');
fs.writeFileSync('src/i18n.js', content);
