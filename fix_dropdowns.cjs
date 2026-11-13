const fs = require('fs');
const filePath = 'c:/Users/dimav/source/repos/Industrial Hub/src/views/ClanManagerTabs/StatsTab.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// For day selector
content = content.replace(
  `<option value={todayKey}>{t('clan_day_today', 'Сегодня')} ({todayKey})</option>`,
  `<option value={todayKey} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_day_today', 'Сегодня')} ({todayKey})</option>`
);

content = content.replace(
  `<option key={d} value={d}>`,
  `<option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">`
);

// For comparison selector
content = content.replace(
  `<option value="none">{t('clan_compare_none', 'Без сравнения')}</option>`,
  `<option value="none" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_none', 'Без сравнения')}</option>`
);

content = content.replace(
  `<option value="week">{t('clan_compare_week', 'С прошлой неделей')}</option>`,
  `<option value="week" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_week', 'С прошлой неделей')}</option>`
);

content = content.replace(
  `<option value="month_avg">{t('clan_compare_month_avg', 'Со средним за месяц')}</option>`,
  `<option value="month_avg" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('clan_compare_month_avg', 'Со средним за месяц')}</option>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed dropdown colors");
