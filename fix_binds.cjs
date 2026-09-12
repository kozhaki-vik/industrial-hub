const fs = require('fs');

const p = 'src/services/bindAnalyzer.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/cmd\.includes\('forward'\) && cmd\.includes\('sprint'\)/g, "/\\bforward\\b/.test(cmd) && /\\bsprint\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('attack'\) && cmd\.includes\('duck'\)/g, "/\\battack\\b/.test(cmd) && /\\bduck\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('combatlog'\)/g, "/\\bcombatlog\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('kill'\)/g, "/\\bkill\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('disconnect'\)/g, "/\\bdisconnect\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('graphics\.fov'\)/g, "/\\bgraphics\\.fov\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('audio\.master'\) \|\| cmd\.includes\('audio\.game'\)/g, "/\\baudio\\.master\\b/.test(cmd) || /\\baudio\\.game\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('clear'\) && !cmd\.includes\('combatlog'\)/g, "/\\bclear\\b/.test(cmd) && !/\\bcombatlog\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('vm_horizontal_flip'\)/g, "/\\bvm_horizontal_flip\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('graphics\.hud'\)/g, "/\\bgraphics\\.hud\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('jump'\) && cmd\.includes\('forward'\) && cmd\.includes\('sprint'\)/g, "/\\bjump\\b/.test(cmd) && /\\bforward\\b/.test(cmd) && /\\bsprint\\b/.test(cmd)");
content = content.replace(/cmd\.includes\('duck 1;duck 0'\) || cmd\.includes\('~duck'\)/g, "/duck 1;duck 0/.test(cmd) || /~duck/.test(cmd)");

fs.writeFileSync(p, content);
console.log('bindAnalyzer.js fixed!');
