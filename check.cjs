const fs = require('fs');
const content = fs.readFileSync('src/i18n.js', 'utf8');
const ruMatch = content.match(/ru:\s*\{\s*translation:\s*\{([\s\S]*?)\}\s*\},\s*en:/);
if (ruMatch) {
  const str = ruMatch[1];
  const searches = ['Гайд по головоломке', 'Коды камер', 'Нажмите, чтобы скопировать', 'Открыть в Rustrician', 'Потребление', 'Резерв батареи', 'Компоненты', 'Предложить правку', 'Смотреть схему'];
  searches.forEach(s => {
    const regex = new RegExp('\"([^\"]+)\":\\s*\"([^\"]*' + s + '[^\"]*)\"');
    const m = str.match(regex);
    if (m) console.log(m[1], ':', m[2]);
    else console.log('NOT FOUND:', s);
  });
}
